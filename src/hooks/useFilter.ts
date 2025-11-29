import { useState, useMemo, useCallback } from 'react';
import type { Applicant } from '../types';

export type EvaluationFilter = 'all' | 'in_progress' | 'completed' | 'not_started';

export function useFilter(applicants: Applicant[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [evaluationFilter, setEvaluationFilter] = useState<EvaluationFilter>('all');

  // 필터링된 지원자 ID 목록
  const highlightedIds = useMemo(() => {
    const ids = new Set<string>();

    applicants.forEach((applicant) => {
      let matchesSearch = true;
      let matchesFilter = true;

      // 검색어 필터링
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        matchesSearch =
          applicant.name.toLowerCase().includes(query) ||
          applicant.id.toLowerCase().includes(query);
      }

      // 평가 대상 필터링
      if (evaluationFilter !== 'all') {
        const { current, total } = applicant.evaluationProgress;
        switch (evaluationFilter) {
          case 'completed':
            matchesFilter = current === total;
            break;
          case 'in_progress':
            matchesFilter = current > 0 && current < total;
            break;
          case 'not_started':
            matchesFilter = current === 0;
            break;
        }
      }

      if (matchesSearch && matchesFilter) {
        ids.add(applicant.id);
      }
    });

    return ids;
  }, [applicants, searchQuery, evaluationFilter]);

  // 필터가 활성화되어 있는지 확인
  const isFilterActive = searchQuery.trim() !== '' || evaluationFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setEvaluationFilter('all');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    evaluationFilter,
    setEvaluationFilter,
    highlightedIds,
    isFilterActive,
    clearFilters,
  };
}

