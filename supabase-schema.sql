-- Supabase 테이블 스키마
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 단계(컬럼) 테이블
CREATE TABLE stages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_fixed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 기본 단계 데이터 삽입
INSERT INTO stages (id, title, color, position, is_fixed) VALUES
  ('application', '지원(서류전형)', '#F59E0B', 0, FALSE),
  ('screen_call', 'TA 스크린 콜', '#10B981', 1, FALSE),
  ('coding_test', '코딩테스트', '#3B82F6', 2, FALSE),
  ('interview_1', '1차 인터뷰 (실무)', '#8B5CF6', 3, FALSE),
  ('interview_2', '2차 인터뷰 (임원)', '#EC4899', 4, FALSE),
  ('final_negotiation', '처우 협의', '#14B8A6', 5, FALSE),
  ('hired', '입사 확정', '#06B6D4', 999, TRUE);

-- 지원자 테이블
CREATE TABLE applicants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  stage TEXT NOT NULL REFERENCES stages(id) ON DELETE RESTRICT,
  registration_type TEXT NOT NULL CHECK (registration_type IN ('직접등록', '공고지원')),
  applied_date TEXT NOT NULL,
  evaluation_current INTEGER NOT NULL DEFAULT 0,
  evaluation_total INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 샘플 지원자 데이터 (선택사항)
INSERT INTO applicants (id, name, stage, registration_type, applied_date, evaluation_current, evaluation_total, position) VALUES
  ('APL001', '김민수', 'application', '공고지원', '2025. 08. 05', 1, 2, 0),
  ('APL002', '이지은', 'screen_call', '직접등록', '2025. 08. 04', 0, 1, 0),
  ('APL003', '박준혁', 'coding_test', '공고지원', '2025. 08. 03', 2, 3, 0),
  ('APL004', '최서연', 'interview_1', '직접등록', '2025. 08. 02', 1, 1, 0),
  ('APL005', '정우진', 'interview_2', '공고지원', '2025. 08. 01', 3, 4, 0),
  ('APL006', '한소희', 'final_negotiation', '직접등록', '2025. 07. 30', 1, 1, 0),
  ('APL007', '노현우', 'final_negotiation', '공고지원', '2025. 08. 05', 1, 1, 1);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applicants_updated_at
  BEFORE UPDATE ON applicants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스
CREATE INDEX idx_applicants_stage ON applicants(stage);
CREATE INDEX idx_applicants_position ON applicants(position);
CREATE INDEX idx_stages_position ON stages(position);

-- RLS (Row Level Security) 정책 - 필요시 활성화
-- ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기/쓰기 허용 (개발용)
-- CREATE POLICY "Allow all" ON applicants FOR ALL USING (true);
-- CREATE POLICY "Allow all" ON stages FOR ALL USING (true);

-- 실시간 구독 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE applicants;
ALTER PUBLICATION supabase_realtime ADD TABLE stages;

