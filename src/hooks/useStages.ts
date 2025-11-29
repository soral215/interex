import { useState, useCallback, useEffect } from 'react';
import type { StageInfo, Stage } from '../types';
import { DEFAULT_STAGES } from '../types';
import { stagesApi, isSupabaseConfigured } from '../api';

export function useStages() {
  const [stages, setStages] = useState<StageInfo[]>(DEFAULT_STAGES);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadStages = async () => {
      if (!isSupabaseConfigured) return;

      setIsLoading(true);
      try {
        const data = await stagesApi.getAll();
        setStages(data);
      } catch (error) {
        console.error('Failed to load stages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStages();
  }, []);

  // 실시간 구독
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const subscription = stagesApi.subscribe((newStages) => {
      setStages(newStages);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addColumn = useCallback(async (data: { title: string; color: string }) => {
    const localStage: StageInfo = {
      id: `custom_${Date.now()}`,
      title: data.title,
      color: data.color,
    };

    // 입사 확정(hired) 컬럼 앞에 추가
    setStages((prev) => {
      const hiredIndex = prev.findIndex((s) => s.id === 'hired');
      if (hiredIndex === -1) {
        return [...prev, localStage];
      }
      const newStages = [...prev];
      newStages.splice(hiredIndex, 0, localStage);
      return newStages;
    });

    // API 호출
    if (isSupabaseConfigured) {
      const created = await stagesApi.create(data);
      if (created) {
        setStages((prev) =>
          prev.map((s) => (s.id === localStage.id ? created : s))
        );
      }
    }
  }, []);

  const deleteColumn = useCallback(async (stageId: Stage): Promise<boolean> => {
    if (stageId === 'hired') {
      alert('입사 확정 컬럼은 삭제할 수 없습니다.');
      return false;
    }

    // 낙관적 업데이트
    setStages((prev) => prev.filter((s) => s.id !== stageId));

    // API 호출
    const success = await stagesApi.delete(stageId);
    if (!success && isSupabaseConfigured) {
      // 실패 시 롤백
      const data = await stagesApi.getAll();
      setStages(data);
      return false;
    }

    return true;
  }, []);

  const renameColumn = useCallback(async (stageId: Stage, newTitle: string) => {
    // 낙관적 업데이트
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, title: newTitle } : s))
    );

    // API 호출
    await stagesApi.rename(stageId, newTitle);
  }, []);

  const getStageTitle = useCallback((stage: Stage): string => {
    const stageInfo = stages.find((s) => s.id === stage);
    return stageInfo?.title || '';
  }, [stages]);

  return {
    stages,
    setStages,
    isLoading,
    addColumn,
    deleteColumn,
    renameColumn,
    getStageTitle,
  };
}

