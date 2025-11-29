export type Stage = string;

export type RegistrationType = '직접등록' | '공고지원';

export interface Applicant {
  id: string;
  name: string;
  stage: Stage;
  registrationType: RegistrationType;
  appliedDate: string;
  evaluationProgress: {
    current: number;
    total: number;
  };
}

export interface StageInfo {
  id: Stage;
  title: string;
  color: string;
}

export const DEFAULT_STAGES: StageInfo[] = [
  { id: 'application', title: '지원(서류전형)', color: '#F59E0B' },
  { id: 'screen_call', title: 'TA 스크린 콜', color: '#10B981' },
  { id: 'coding_test', title: '코딩테스트', color: '#3B82F6' },
  { id: 'interview_1', title: '1차 인터뷰 (실무)', color: '#8B5CF6' },
  { id: 'interview_2', title: '2차 인터뷰 (임원)', color: '#EC4899' },
  { id: 'final_negotiation', title: '처우 협의', color: '#14B8A6' },
  { id: 'hired', title: '입사 확정', color: '#06B6D4' },
];

export const STAGE_COLORS = [
  '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#06B6D4', '#EF4444',
  '#6366F1', '#84CC16', '#F97316', '#0EA5E9',
];
