import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Applicant, Stage, RegistrationType } from '../types';
import { initialApplicants } from '../data';

// DB row 타입
interface DbApplicantRow {
  id: string;
  name: string;
  stage: string;
  registration_type: '직접등록' | '공고지원';
  applied_date: string;
  evaluation_current: number;
  evaluation_total: number;
  position: number;
}

// DB 데이터를 앱 타입으로 변환
function toApplicant(db: DbApplicantRow): Applicant {
  return {
    id: db.id,
    name: db.name,
    stage: db.stage as Stage,
    registrationType: db.registration_type,
    appliedDate: db.applied_date,
    evaluationProgress: {
      current: db.evaluation_current,
      total: db.evaluation_total,
    },
  };
}

export const applicantsApi = {
  // 모든 지원자 조회
  async getAll(): Promise<Applicant[]> {
    if (!isSupabaseConfigured) {
      return initialApplicants;
    }

    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching applicants:', error);
      return initialApplicants;
    }

    return (data as DbApplicantRow[]).map(toApplicant);
  },

  // 단계별 지원자 조회
  async getByStage(stage: Stage): Promise<Applicant[]> {
    if (!isSupabaseConfigured) {
      return initialApplicants.filter((a) => a.stage === stage);
    }

    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .eq('stage', stage)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching applicants by stage:', error);
      return [];
    }

    return (data as DbApplicantRow[]).map(toApplicant);
  },

  // 지원자 추가
  async create(applicant: {
    name: string;
    registrationType: RegistrationType;
    stage: Stage;
  }): Promise<Applicant | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('applicants')
      .insert([{
        name: applicant.name,
        registration_type: applicant.registrationType,
        stage: applicant.stage,
        applied_date: dateStr,
        evaluation_current: 0,
        evaluation_total: 1,
        position: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating applicant:', error);
      return null;
    }

    return toApplicant(data as DbApplicantRow);
  },

  // 지원자 삭제
  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    const { error } = await supabase
      .from('applicants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting applicant:', error);
      return false;
    }

    return true;
  },

  // 지원자 업데이트 (단계 이동 등)
  async update(id: string, updates: Partial<Applicant>): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.stage !== undefined) updateData.stage = updates.stage;
    if (updates.registrationType !== undefined) updateData.registration_type = updates.registrationType;
    if (updates.appliedDate !== undefined) updateData.applied_date = updates.appliedDate;
    if (updates.evaluationProgress !== undefined) {
      updateData.evaluation_current = updates.evaluationProgress.current;
      updateData.evaluation_total = updates.evaluationProgress.total;
    }

    const { error } = await supabase
      .from('applicants')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating applicant:', error);
      return false;
    }

    return true;
  },

  // 여러 지원자 단계 이동
  async updateStage(ids: string[], newStage: Stage): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    const { error } = await supabase
      .from('applicants')
      .update({ stage: newStage })
      .in('id', ids);

    if (error) {
      console.error('Error updating applicants stage:', error);
      return false;
    }

    return true;
  },

  // 순서 업데이트
  async updatePositions(updates: { id: string; position: number }[]): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    const promises = updates.map(({ id, position }) =>
      supabase
        .from('applicants')
        .update({ position })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      console.error('Error updating positions');
      return false;
    }

    return true;
  },

  // 실시간 구독
  subscribe(callback: (applicants: Applicant[]) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel('applicants-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applicants' },
        async () => {
          const applicants = await applicantsApi.getAll();
          callback(applicants);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};

