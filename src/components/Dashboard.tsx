import type { Applicant, StageInfo } from '../types';

interface DashboardProps {
  applicants: Applicant[];
  stages: StageInfo[];
}

export function Dashboard({ applicants, stages }: DashboardProps) {
  // 전체 지원자 수
  const totalApplicants = applicants.length;

  // 단계별 인원 수
  const stageStats = stages.map((stage) => ({
    ...stage,
    count: applicants.filter((a) => a.stage === stage.id).length,
  }));

  // 전환율 계산 (지원 → 최종합격)
  const hiredCount = applicants.filter((a) => a.stage === 'hired').length;
  const conversionRate = totalApplicants > 0 
    ? ((hiredCount / totalApplicants) * 100).toFixed(1) 
    : '0.0';

  // 평가 완료율
  const completedEvaluation = applicants.filter(
    (a) => a.evaluationProgress.current === a.evaluationProgress.total
  ).length;
  const evaluationRate = totalApplicants > 0 
    ? ((completedEvaluation / totalApplicants) * 100).toFixed(1) 
    : '0.0';

  // 평가 진행 중
  const inProgressEvaluation = applicants.filter(
    (a) => a.evaluationProgress.current > 0 && a.evaluationProgress.current < a.evaluationProgress.total
  ).length;
  
  // 평가 미시작
  const notStartedEvaluation = applicants.filter(
    (a) => a.evaluationProgress.current === 0
  ).length;

  // 등록 유형별 통계
  const directCount = applicants.filter((a) => a.registrationType === '직접등록').length;
  const applyCount = applicants.filter((a) => a.registrationType === '공고지원').length;

  // 진행 중인 지원자 (입사 확정 제외)
  const inProgressCount = applicants.filter((a) => a.stage !== 'hired').length;

  // 도넛 차트용 비율 계산
  const directPercent = totalApplicants > 0 ? (directCount / totalApplicants) * 100 : 0;
  const applyPercent = totalApplicants > 0 ? (applyCount / totalApplicants) * 100 : 0;

  // 단계별 최대 인원 (막대 차트 비율용)
  const maxStageCount = Math.max(...stageStats.map((s) => s.count), 1);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">채용 현황</h2>
        <span className="dashboard-subtitle">실시간 통계</span>
      </div>

      <div className="dashboard-grid">
        {/* 주요 지표 카드 */}
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalApplicants}</span>
            <span className="stat-label">전체 지원자</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{hiredCount}</span>
            <span className="stat-label">입사 확정</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{inProgressCount}</span>
            <span className="stat-label">진행 중</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{conversionRate}%</span>
            <span className="stat-label">합격률</span>
          </div>
        </div>
      </div>

      {/* 단계별 파이프라인 */}
      <div className="pipeline-section">
        <h3 className="section-title">채용 파이프라인</h3>
        <div className="pipeline">
          {stageStats.map((stage, index) => (
            <div key={stage.id} className="pipeline-stage">
              <div className="pipeline-bar">
                <div 
                  className="pipeline-fill" 
                  style={{ 
                    backgroundColor: stage.color,
                    width: totalApplicants > 0 ? `${(stage.count / totalApplicants) * 100}%` : '0%'
                  }}
                />
              </div>
              <div className="pipeline-info">
                <span className="pipeline-count">{stage.count}</span>
                <span className="pipeline-name">{stage.title.split('(')[0].trim()}</span>
              </div>
              {index < stageStats.length - 1 && (
                <div className="pipeline-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="charts-section">
        {/* 등록 유형 도넛 차트 */}
        <div className="chart-card">
          <h3 className="chart-title">등록 유형 분포</h3>
          <div className="donut-chart-container">
            <div 
              className="donut-chart"
              style={{
                background: `conic-gradient(
                  #3B82F6 0deg ${directPercent * 3.6}deg,
                  #10B981 ${directPercent * 3.6}deg 360deg
                )`
              }}
            >
              <div className="donut-hole">
                <span className="donut-total">{totalApplicants}</span>
                <span className="donut-label">전체</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#3B82F6' }} />
                <span className="legend-text">직접등록</span>
                <span className="legend-value">{directCount}명 ({directPercent.toFixed(0)}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#10B981' }} />
                <span className="legend-text">공고지원</span>
                <span className="legend-value">{applyCount}명 ({applyPercent.toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 평가 현황 막대 차트 */}
        <div className="chart-card">
          <h3 className="chart-title">평가 진행 현황</h3>
          <div className="bar-chart">
            <div className="bar-item">
              <div className="bar-label">완료</div>
              <div className="bar-track">
                <div 
                  className="bar-fill completed"
                  style={{ width: `${totalApplicants > 0 ? (completedEvaluation / totalApplicants) * 100 : 0}%` }}
                />
              </div>
              <div className="bar-value">{completedEvaluation}명</div>
            </div>
            <div className="bar-item">
              <div className="bar-label">진행중</div>
              <div className="bar-track">
                <div 
                  className="bar-fill in-progress"
                  style={{ width: `${totalApplicants > 0 ? (inProgressEvaluation / totalApplicants) * 100 : 0}%` }}
                />
              </div>
              <div className="bar-value">{inProgressEvaluation}명</div>
            </div>
            <div className="bar-item">
              <div className="bar-label">미시작</div>
              <div className="bar-track">
                <div 
                  className="bar-fill not-started"
                  style={{ width: `${totalApplicants > 0 ? (notStartedEvaluation / totalApplicants) * 100 : 0}%` }}
                />
              </div>
              <div className="bar-value">{notStartedEvaluation}명</div>
            </div>
          </div>
        </div>

        {/* 단계별 분포 차트 */}
        <div className="chart-card wide">
          <h3 className="chart-title">단계별 지원자 분포</h3>
          <div className="stage-bar-chart">
            {stageStats.map((stage) => (
              <div key={stage.id} className="stage-bar-item">
                <div className="stage-bar-header">
                  <span className="stage-bar-name">{stage.title.split('(')[0].trim()}</span>
                  <span className="stage-bar-count">{stage.count}명</span>
                </div>
                <div className="stage-bar-track">
                  <div 
                    className="stage-bar-fill"
                    style={{ 
                      width: `${(stage.count / maxStageCount) * 100}%`,
                      backgroundColor: stage.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="stats-row">
        <div className="mini-stat">
          <span className="mini-stat-label">평가 완료율</span>
          <span className="mini-stat-value">{evaluationRate}%</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">직접등록</span>
          <span className="mini-stat-value">{directCount}명</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">공고지원</span>
          <span className="mini-stat-value">{applyCount}명</span>
        </div>
      </div>
    </div>
  );
}

