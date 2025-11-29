import { useState, useCallback } from 'react';
import type { Applicant } from '../types';

export type SortField = 'name' | 'appliedDate' | 'evaluationProgress';
export type SortOrder = 'asc' | 'desc';

export function useSort() {
  const [sortField, setSortField] = useState<SortField>('appliedDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isSortActive, setIsSortActive] = useState(false);

  const sortApplicants = useCallback((list: Applicant[]): Applicant[] => {
    // 정렬이 비활성화되어 있으면 원래 순서 유지
    if (!isSortActive) return list;

    return [...list].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ko');
          break;
        case 'appliedDate':
          comparison = a.appliedDate.localeCompare(b.appliedDate);
          break;
        case 'evaluationProgress':
          const aProgress = a.evaluationProgress.current / a.evaluationProgress.total;
          const bProgress = b.evaluationProgress.current / b.evaluationProgress.total;
          comparison = aProgress - bProgress;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [isSortActive, sortField, sortOrder]);

  const getSortFieldLabel = useCallback((field: SortField): string => {
    switch (field) {
      case 'name':
        return '이름';
      case 'appliedDate':
        return '지원일';
      case 'evaluationProgress':
        return '평가 진행도';
    }
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const activateSort = useCallback((field: SortField) => {
    setSortField(field);
    setIsSortActive(true);
  }, []);

  const deactivateSort = useCallback(() => {
    setIsSortActive(false);
  }, []);

  return {
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    isSortActive,
    setIsSortActive,
    sortApplicants,
    getSortFieldLabel,
    toggleSortOrder,
    activateSort,
    deactivateSort,
  };
}

