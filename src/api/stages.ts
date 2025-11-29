import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StageInfo, Stage } from '../types';
import { DEFAULT_STAGES } from '../types';

// DB row 타입
interface DbStageRow {
  id: string;
  title: string;
  color: string;
  position: number;
  is_fixed: boolean;
}

// DB 데이터를 앱 타입으로 변환
function toStageInfo(db: DbStageRow): StageInfo {
  return {
    id: db.id,
    title: db.title,
    color: db.color,
  };
}

export const stagesApi = {
  // 모든 단계 조회
  async getAll(): Promise<StageInfo[]> {
    if (!isSupabaseConfigured) {
      return DEFAULT_STAGES;
    }

    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching stages:', error);
      return DEFAULT_STAGES;
    }

    return (data as DbStageRow[]).map(toStageInfo);
  },

  // 단계 추가
  async create(stage: { title: string; color: string }): Promise<StageInfo | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    // 현재 최대 position 조회 (hired 제외)
    const { data: maxData } = await supabase
      .from('stages')
      .select('position')
      .neq('id', 'hired')
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const newPosition = ((maxData as { position: number } | null)?.position || 0) + 1;

    const { data, error } = await supabase
      .from('stages')
      .insert([{
        id: `custom_${Date.now()}`,
        title: stage.title,
        color: stage.color,
        position: newPosition,
        is_fixed: false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating stage:', error);
      return null;
    }

    return toStageInfo(data as DbStageRow);
  },

  // 단계 삭제
  async delete(id: Stage): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    // 고정 단계는 삭제 불가
    const { data: stage } = await supabase
      .from('stages')
      .select('is_fixed')
      .eq('id', id)
      .single();

    if ((stage as { is_fixed: boolean } | null)?.is_fixed) {
      console.error('Cannot delete fixed stage');
      return false;
    }

    const { error } = await supabase
      .from('stages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting stage:', error);
      return false;
    }

    return true;
  },

  // 단계 이름 수정
  async rename(id: Stage, newTitle: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    const { error } = await supabase
      .from('stages')
      .update({ title: newTitle })
      .eq('id', id);

    if (error) {
      console.error('Error renaming stage:', error);
      return false;
    }

    return true;
  },

  // 실시간 구독
  subscribe(callback: (stages: StageInfo[]) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel('stages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stages' },
        async () => {
          const stages = await stagesApi.getAll();
          callback(stages);
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
