export interface Database {
  public: {
    Tables: {
      applicants: {
        Row: {
          id: string;
          name: string;
          stage: string;
          registration_type: '직접등록' | '공고지원';
          applied_date: string;
          evaluation_current: number;
          evaluation_total: number;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          stage: string;
          registration_type: '직접등록' | '공고지원';
          applied_date?: string;
          evaluation_current?: number;
          evaluation_total?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          stage?: string;
          registration_type?: '직접등록' | '공고지원';
          applied_date?: string;
          evaluation_current?: number;
          evaluation_total?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      stages: {
        Row: {
          id: string;
          title: string;
          color: string;
          position: number;
          is_fixed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          color: string;
          position?: number;
          is_fixed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          color?: string;
          position?: number;
          is_fixed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

// 기존 타입과 매핑
export interface DbApplicant {
  id: string;
  name: string;
  stage: string;
  registration_type: '직접등록' | '공고지원';
  applied_date: string;
  evaluation_current: number;
  evaluation_total: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DbStage {
  id: string;
  title: string;
  color: string;
  position: number;
  is_fixed: boolean;
  created_at: string;
}

