import { useState, useCallback, useEffect } from 'react';
import type { Applicant, Stage, RegistrationType, StageInfo } from '../types';
import { initialApplicants } from '../data';
import { arrayMove } from '@dnd-kit/sortable';
import { applicantsApi, isSupabaseConfigured } from '../api';

export function useApplicants(stages: StageInfo[]) {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadApplicants = async () => {
      if (!isSupabaseConfigured) return;
      
      setIsLoading(true);
      try {
        const data = await applicantsApi.getAll();
        setApplicants(data);
      } catch (error) {
        console.error('Failed to load applicants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicants();
  }, []);

  // 실시간 구독
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const subscription = applicantsApi.subscribe((newApplicants) => {
      setApplicants(newApplicants);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 롤백 헬퍼 함수
  const rollbackToServer = useCallback(async () => {
    if (isSupabaseConfigured) {
      const data = await applicantsApi.getAll();
      setApplicants(data);
    }
  }, []);

  const deleteApplicant = useCallback(async (id: string) => {
    // 낙관적 업데이트
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    
    // API 호출
    const success = await applicantsApi.delete(id);
    if (!success && isSupabaseConfigured) {
      // 실패 시 롤백
      await rollbackToServer();
    }
  }, [rollbackToServer]);

  const addApplicant = useCallback(async (data: {
    name: string;
    registrationType: RegistrationType;
    stage: Stage;
  }) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;

    // 로컬용 새 지원자
    const localApplicant: Applicant = {
      id: `NEW${Date.now()}`,
      name: data.name,
      stage: data.stage,
      registrationType: data.registrationType,
      appliedDate: dateStr,
      evaluationProgress: { current: 0, total: 1 },
    };

    // 낙관적 업데이트
    setApplicants((prev) => [localApplicant, ...prev]);

    // API 호출
    if (isSupabaseConfigured) {
      const created = await applicantsApi.create(data);
      if (created) {
        // 서버에서 생성된 데이터로 교체
        setApplicants((prev) => 
          prev.map((a) => a.id === localApplicant.id ? created : a)
        );
      } else {
        // 실패 시 롤백
        await rollbackToServer();
      }
    }
  }, [rollbackToServer]);

  const moveApplicant = useCallback(async (id: string, newStage: Stage) => {
    // 낙관적 업데이트
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: newStage } : a))
    );

    // API 호출
    const success = await applicantsApi.update(id, { stage: newStage });
    if (!success && isSupabaseConfigured) {
      // 실패 시 롤백
      await rollbackToServer();
    }
  }, [rollbackToServer]);

  const moveMultipleApplicants = useCallback(async (ids: Set<string>, newStage: Stage) => {
    // 낙관적 업데이트
    setApplicants((prev) =>
      prev.map((a) => (ids.has(a.id) ? { ...a, stage: newStage } : a))
    );

    // API 호출
    const success = await applicantsApi.updateStage(Array.from(ids), newStage);
    if (!success && isSupabaseConfigured) {
      // 실패 시 롤백
      await rollbackToServer();
    }
  }, [rollbackToServer]);

  const reorderApplicants = useCallback(async (
    activeId: string,
    overId: string,
    currentStage: Stage
  ) => {
    // 이전 상태 저장 (롤백용)
    const previousApplicants = applicants;

    const stageApplicants = applicants.filter((a) => a.stage === currentStage);
    const otherApplicants = applicants.filter((a) => a.stage !== currentStage);

    const oldIndex = stageApplicants.findIndex((a) => a.id === activeId);
    const newIndex = stageApplicants.findIndex((a) => a.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedStageApplicants = arrayMove(stageApplicants, oldIndex, newIndex);

    // 전체 배열을 재구성 (순서 유지)
    const newApplicants: Applicant[] = [];
    stages.forEach((stage) => {
      if (stage.id === currentStage) {
        newApplicants.push(...reorderedStageApplicants);
      } else {
        newApplicants.push(...otherApplicants.filter((a) => a.stage === stage.id));
      }
    });

    // 낙관적 업데이트
    setApplicants(newApplicants);

    // API 호출
    if (isSupabaseConfigured) {
      const updates = reorderedStageApplicants.map((a, index) => ({
        id: a.id,
        position: index,
      }));
      const success = await applicantsApi.updatePositions(updates);
      if (!success) {
        // 실패 시 롤백
        setApplicants(previousApplicants);
      }
    }
  }, [applicants, stages]);

  const getApplicantsByStage = useCallback((stage: Stage): Applicant[] => {
    return applicants.filter((a) => a.stage === stage);
  }, [applicants]);

  const getApplicantById = useCallback((id: string): Applicant | undefined => {
    return applicants.find((a) => a.id === id);
  }, [applicants]);

  return {
    applicants,
    setApplicants,
    isLoading,
    deleteApplicant,
    addApplicant,
    moveApplicant,
    moveMultipleApplicants,
    reorderApplicants,
    getApplicantsByStage,
    getApplicantById,
  };
}
