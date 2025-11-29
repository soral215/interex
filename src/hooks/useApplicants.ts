import { useState, useCallback } from 'react';
import type { Applicant, Stage, RegistrationType, StageInfo } from '../types';
import { initialApplicants } from '../data';
import { arrayMove } from '@dnd-kit/sortable';

export function useApplicants(stages: StageInfo[]) {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);

  const deleteApplicant = useCallback((id: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addApplicant = useCallback((data: {
    name: string;
    registrationType: RegistrationType;
    stage: Stage;
  }) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;

    const newApplicant: Applicant = {
      id: `NEW${Date.now()}`,
      name: data.name,
      stage: data.stage,
      registrationType: data.registrationType,
      appliedDate: dateStr,
      evaluationProgress: { current: 0, total: 1 },
    };

    setApplicants((prev) => [newApplicant, ...prev]);
  }, []);

  const moveApplicant = useCallback((id: string, newStage: Stage) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: newStage } : a))
    );
  }, []);

  const moveMultipleApplicants = useCallback((ids: Set<string>, newStage: Stage) => {
    setApplicants((prev) =>
      prev.map((a) => (ids.has(a.id) ? { ...a, stage: newStage } : a))
    );
  }, []);

  const reorderApplicants = useCallback((
    activeId: string,
    overId: string,
    currentStage: Stage
  ) => {
    setApplicants((prev) => {
      const stageApplicants = prev.filter((a) => a.stage === currentStage);
      const otherApplicants = prev.filter((a) => a.stage !== currentStage);

      const oldIndex = stageApplicants.findIndex((a) => a.id === activeId);
      const newIndex = stageApplicants.findIndex((a) => a.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

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

      return newApplicants;
    });
  }, [stages]);

  const getApplicantsByStage = useCallback((stage: Stage): Applicant[] => {
    return applicants.filter((a) => a.stage === stage);
  }, [applicants]);

  const getApplicantById = useCallback((id: string): Applicant | undefined => {
    return applicants.find((a) => a.id === id);
  }, [applicants]);

  return {
    applicants,
    setApplicants,
    deleteApplicant,
    addApplicant,
    moveApplicant,
    moveMultipleApplicants,
    reorderApplicants,
    getApplicantsByStage,
    getApplicantById,
  };
}

