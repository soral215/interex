import type { Applicant } from './types';

// 초기 샘플 데이터 - 각 단계에 다양한 지원자 배치
export const initialApplicants: Applicant[] = [
  // 지원(서류전형) - 많은 지원자로 스크롤 테스트
  { id: 'A001', name: '김지원', stage: 'application', registrationType: '직접등록', appliedDate: '2025. 09. 02', evaluationProgress: { current: 0, total: 1 } },
  { id: 'A002', name: '이서준', stage: 'application', registrationType: '공고지원', appliedDate: '2025. 09. 03', evaluationProgress: { current: 1, total: 2 } },
  { id: 'A003', name: '박민서', stage: 'application', registrationType: '직접등록', appliedDate: '2025. 09. 04', evaluationProgress: { current: 0, total: 1 } },
  { id: 'A004', name: '최수아', stage: 'application', registrationType: '공고지원', appliedDate: '2025. 09. 05', evaluationProgress: { current: 2, total: 3 } },
  { id: 'A005', name: '정예준', stage: 'application', registrationType: '직접등록', appliedDate: '2025. 09. 06', evaluationProgress: { current: 0, total: 1 } },
  { id: 'A006', name: '강하윤', stage: 'application', registrationType: '공고지원', appliedDate: '2025. 09. 07', evaluationProgress: { current: 1, total: 1 } },
  { id: 'A007', name: '조시우', stage: 'application', registrationType: '직접등록', appliedDate: '2025. 09. 08', evaluationProgress: { current: 0, total: 2 } },
  { id: 'A008', name: '윤도윤', stage: 'application', registrationType: '공고지원', appliedDate: '2025. 09. 09', evaluationProgress: { current: 1, total: 2 } },
  { id: 'A009', name: '장서윤', stage: 'application', registrationType: '직접등록', appliedDate: '2025. 09. 10', evaluationProgress: { current: 0, total: 1 } },
  { id: 'A010', name: '임주원', stage: 'application', registrationType: '공고지원', appliedDate: '2025. 09. 11', evaluationProgress: { current: 2, total: 2 } },
  { id: 'A011', name: '한지호', stage: 'application', registrationType: '직접등록', appliedDate: '2025. 09. 12', evaluationProgress: { current: 0, total: 1 } },
  { id: 'A012', name: '오민준', stage: 'application', registrationType: '공고지원', appliedDate: '2025. 09. 13', evaluationProgress: { current: 1, total: 3 } },
  
  // TA 스크린 콜
  { id: 'B001', name: '서유진', stage: 'screen_call', registrationType: '직접등록', appliedDate: '2025. 08. 25', evaluationProgress: { current: 1, total: 2 } },
  { id: 'B002', name: '신하준', stage: 'screen_call', registrationType: '공고지원', appliedDate: '2025. 08. 26', evaluationProgress: { current: 0, total: 1 } },
  { id: 'B003', name: '권지안', stage: 'screen_call', registrationType: '직접등록', appliedDate: '2025. 08. 27', evaluationProgress: { current: 2, total: 2 } },
  { id: 'B004', name: '황은우', stage: 'screen_call', registrationType: '공고지원', appliedDate: '2025. 08. 28', evaluationProgress: { current: 1, total: 1 } },
  
  // 코딩테스트
  { id: 'C001', name: '송태현', stage: 'coding_test', registrationType: '직접등록', appliedDate: '2025. 08. 20', evaluationProgress: { current: 0, total: 1 } },
  { id: 'C002', name: '전소희', stage: 'coding_test', registrationType: '공고지원', appliedDate: '2025. 08. 21', evaluationProgress: { current: 1, total: 2 } },
  { id: 'C003', name: '홍민재', stage: 'coding_test', registrationType: '직접등록', appliedDate: '2025. 08. 22', evaluationProgress: { current: 0, total: 1 } },
  
  // 1차 인터뷰 (실무)
  { id: 'D001', name: '문지영', stage: 'interview_1', registrationType: '공고지원', appliedDate: '2025. 08. 15', evaluationProgress: { current: 1, total: 1 } },
  { id: 'D002', name: '배성민', stage: 'interview_1', registrationType: '직접등록', appliedDate: '2025. 08. 16', evaluationProgress: { current: 0, total: 2 } },
  
  // 2차 인터뷰 (임원)
  { id: 'E001', name: '백승호', stage: 'interview_2', registrationType: '공고지원', appliedDate: '2025. 08. 10', evaluationProgress: { current: 2, total: 2 } },
  { id: 'E002', name: '유나연', stage: 'interview_2', registrationType: '직접등록', appliedDate: '2025. 08. 11', evaluationProgress: { current: 1, total: 1 } },
  
  // 처우 협의
  { id: 'F001', name: '노현우', stage: 'final_negotiation', registrationType: '공고지원', appliedDate: '2025. 08. 05', evaluationProgress: { current: 1, total: 1 } },
  
  // 입사 확정
  { id: 'G001', name: '안정훈', stage: 'hired', registrationType: '직접등록', appliedDate: '2025. 08. 01', evaluationProgress: { current: 1, total: 1 } },
];
