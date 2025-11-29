import { useState, useMemo, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Applicant, Stage, RegistrationType, StageInfo } from '../types';
import { DEFAULT_STAGES } from '../types';
import { initialApplicants } from '../data';
import { Column } from './Column';
import { AddApplicantModal } from './AddApplicantModal';
import { AddColumnModal } from './AddColumnModal';
import { Dashboard } from './Dashboard';

type EvaluationFilter = 'all' | 'in_progress' | 'completed' | 'not_started';
type SortField = 'name' | 'appliedDate' | 'evaluationProgress';
type SortOrder = 'asc' | 'desc';

export function KanbanBoard() {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [activeApplicant, setActiveApplicant] = useState<Applicant | null>(null);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addModalStage, setAddModalStage] = useState<Stage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [evaluationFilter, setEvaluationFilter] = useState<EvaluationFilter>('all');
  const [sortField, setSortField] = useState<SortField>('appliedDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isSortActive, setIsSortActive] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [stages, setStages] = useState<StageInfo[]>(DEFAULT_STAGES);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  // 정렬 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node) &&
        sortButtonRef.current &&
        !sortButtonRef.current.contains(event.target as Node)
      ) {
        setIsSortMenuOpen(false);
      }
    };

    if (isSortMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortMenuOpen]);

  // 정렬이 활성화되어 있으면 드래그앤드롭 비활성화
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isSortActive ? Infinity : 8, // Infinity로 설정하면 드래그 불가
      },
    })
  );

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

  // 정렬 함수
  const sortApplicants = (list: Applicant[]): Applicant[] => {
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
  };

  const getApplicantsByStage = (stage: Stage): Applicant[] => {
    const stageApplicants = applicants.filter((a) => a.stage === stage);
    return sortApplicants(stageApplicants);
  };

  const getSortFieldLabel = (field: SortField): string => {
    switch (field) {
      case 'name': return '이름';
      case 'appliedDate': return '지원일';
      case 'evaluationProgress': return '평가 진행도';
    }
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedIds(new Set()); // 모드 해제 시 선택 초기화
    }
  };

  const handleSelectApplicant = (id: string) => {
    if (!isMultiSelectMode) return;
    
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const applicant = applicants.find((a) => a.id === active.id);
    if (applicant) {
      setActiveApplicant(applicant);
      
      // 다중 선택 모드에서 드래그 시작한 카드가 선택되지 않았다면 선택에 추가
      if (isMultiSelectMode && !selectedIds.has(applicant.id)) {
        setSelectedIds((prev) => new Set([...prev, applicant.id]));
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 단계(컬럼) 위에 드롭하는 경우
    const isOverColumn = stages.some((s) => s.id === overId);

    if (isOverColumn) {
      const newStage = overId as Stage;
      
      // 다중 선택 모드일 경우 선택된 모든 카드 이동
      if (isMultiSelectMode && selectedIds.size > 0) {
        const idsToMove = selectedIds.has(activeId) ? selectedIds : new Set([activeId]);
        setApplicants((prev) =>
          prev.map((a) =>
            idsToMove.has(a.id) && a.stage !== newStage ? { ...a, stage: newStage } : a
          )
        );
      } else {
        const activeApplicant = applicants.find((a) => a.id === activeId);
        if (activeApplicant && activeApplicant.stage !== newStage) {
          setApplicants((prev) =>
            prev.map((a) =>
              a.id === activeId ? { ...a, stage: newStage } : a
            )
          );
        }
      }
      return;
    }

    // 다른 카드 위에 드롭하는 경우
    const overApplicant = applicants.find((a) => a.id === overId);
    const activeApplicantItem = applicants.find((a) => a.id === activeId);
    
    if (overApplicant && activeApplicantItem) {
      // 다른 컬럼으로 이동하는 경우
      if (activeApplicantItem.stage !== overApplicant.stage) {
        // 다중 선택 모드일 경우 선택된 모든 카드 이동
        if (isMultiSelectMode && selectedIds.size > 0) {
          const idsToMove = selectedIds.has(activeId) ? selectedIds : new Set([activeId]);
          setApplicants((prev) =>
            prev.map((a) =>
              idsToMove.has(a.id) ? { ...a, stage: overApplicant.stage } : a
            )
          );
        } else {
          setApplicants((prev) =>
            prev.map((a) =>
              a.id === activeId ? { ...a, stage: overApplicant.stage } : a
            )
          );
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApplicant(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // 컬럼 위에 드롭하는 경우 (빈 컬럼 포함)
    const isOverColumn = stages.some((s) => s.id === overId);
    if (isOverColumn) {
      const newStage = overId as Stage;
      
      // 다중 선택 모드일 경우 선택된 모든 카드 이동
      if (isMultiSelectMode && selectedIds.size > 0) {
        const idsToMove = selectedIds.has(activeId) ? selectedIds : new Set([activeId]);
        setApplicants((prev) =>
          prev.map((a) =>
            idsToMove.has(a.id) && a.stage !== newStage ? { ...a, stage: newStage } : a
          )
        );
      } else {
        const activeApplicantItem = applicants.find((a) => a.id === activeId);
        if (activeApplicantItem && activeApplicantItem.stage !== newStage) {
          setApplicants((prev) =>
            prev.map((a) =>
              a.id === activeId ? { ...a, stage: newStage } : a
            )
          );
        }
      }
      return;
    }

    const activeApplicant = applicants.find((a) => a.id === activeId);
    const overApplicant = applicants.find((a) => a.id === overId);

    if (!activeApplicant || !overApplicant) return;

    // 같은 컬럼 내에서 순서 변경
    if (activeApplicant.stage === overApplicant.stage) {
      const stageApplicants = applicants.filter((a) => a.stage === activeApplicant.stage);
      const otherApplicants = applicants.filter((a) => a.stage !== activeApplicant.stage);
      
      const oldIndex = stageApplicants.findIndex((a) => a.id === activeId);
      const newIndex = stageApplicants.findIndex((a) => a.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedStageApplicants = arrayMove(stageApplicants, oldIndex, newIndex);
        
        // 전체 배열을 재구성 (순서 유지)
        const newApplicants: Applicant[] = [];
        stages.forEach((stage) => {
          if (stage.id === activeApplicant.stage) {
            newApplicants.push(...reorderedStageApplicants);
          } else {
            newApplicants.push(...otherApplicants.filter((a) => a.stage === stage.id));
          }
        });
        
        setApplicants(newApplicants);
      }
    }
  };

  const handleDelete = (id: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleOpenAddModal = (stage: Stage) => {
    setAddModalStage(stage);
  };

  const handleCloseAddModal = () => {
    setAddModalStage(null);
  };

  const handleAddApplicant = (data: {
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
  };

  const getStageTitle = (stage: Stage): string => {
    const stageInfo = stages.find((s) => s.id === stage);
    return stageInfo?.title || '';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setEvaluationFilter('all');
  };

  const handleAddColumn = (data: { title: string; color: string }) => {
    const newStage: StageInfo = {
      id: `custom_${Date.now()}`,
      title: data.title,
      color: data.color,
    };
    // 입사 확정(hired) 컬럼 앞에 추가
    setStages((prev) => {
      const hiredIndex = prev.findIndex((s) => s.id === 'hired');
      if (hiredIndex === -1) {
        return [...prev, newStage];
      }
      const newStages = [...prev];
      newStages.splice(hiredIndex, 0, newStage);
      return newStages;
    });
  };

  const handleDeleteColumn = (stageId: Stage) => {
    // 입사 확정 컬럼은 삭제 불가
    if (stageId === 'hired') {
      alert('입사 확정 컬럼은 삭제할 수 없습니다.');
      return;
    }
    // 해당 단계의 지원자가 있는지 확인
    const hasApplicants = applicants.some((a) => a.stage === stageId);
    if (hasApplicants) {
      alert('해당 컬럼에 지원자가 있습니다. 지원자를 먼저 이동시켜 주세요.');
      return;
    }
    setStages((prev) => prev.filter((s) => s.id !== stageId));
  };

  const handleRenameColumn = (stageId: Stage, newTitle: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId ? { ...s, title: newTitle } : s
      )
    );
  };

  return (
    <div className="kanban-container">
      <header className="kanban-header">
        <div className="header-left">
          <h1 className="header-title">프론트엔드 (Frontend) 개발자 - 데이터스페이스 (Dataspace)</h1>
          <div className="header-meta">
            <span className="status-badge">● 활성화</span>
            <span className="meta-item">+ 메모 추가</span>
          </div>
        </div>
        <div className="header-right">
          <button 
            className={`dashboard-toggle ${isDashboardOpen ? 'active' : ''}`}
            onClick={() => setIsDashboardOpen(!isDashboardOpen)}
            title={isDashboardOpen ? '대시보드 숨기기' : '대시보드 보기'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>대시보드</span>
          </button>
          <div className="tab-group">
            <button className="tab active">지원자</button>
            <button className="tab">메일함</button>
            <button className="tab">채용팀</button>
          </div>
        </div>
      </header>

      {isDashboardOpen && <Dashboard applicants={applicants} stages={stages} />}

      <div className="toolbar">
        <div className="toolbar-left">
          <select 
            className="filter-select"
            value={evaluationFilter}
            onChange={(e) => setEvaluationFilter(e.target.value as EvaluationFilter)}
          >
            <option value="all">전체</option>
            <option value="not_started">평가 미시작</option>
            <option value="in_progress">평가 중</option>
            <option value="completed">평가 완료</option>
          </select>
          <div className="search-box">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="이름, ID로 검색" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {isFilterActive && (
            <div className="filter-info">
              <span className="filter-count">{highlightedIds.size}명 검색됨</span>
              <button className="filter-clear" onClick={clearFilters}>
                필터 초기화
              </button>
            </div>
          )}
        </div>
        <div className="toolbar-right">
          <button 
            className="toolbar-icon-btn"
            onClick={() => setAddModalStage('application')}
            title="지원자 추가"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          
          {/* 정렬 기준 버튼 */}
          <div className="toolbar-dropdown">
            <button 
              ref={sortButtonRef}
              className={`toolbar-icon-btn ${isSortActive || isSortMenuOpen ? 'active' : ''}`}
              onClick={() => {
                if (isSortActive && !isSortMenuOpen) {
                  // 정렬이 활성화된 상태에서 버튼 클릭하면 정렬 해제
                  setIsSortActive(false);
                } else {
                  // 정렬이 비활성화된 상태에서 버튼 클릭하면 메뉴 열기
                  setIsSortMenuOpen(!isSortMenuOpen);
                }
              }}
              title={isSortActive ? '정렬 해제' : '정렬 기준'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
            {isSortMenuOpen && (
              <div ref={sortMenuRef} className="toolbar-menu">
                <div className="toolbar-menu-header">정렬 기준</div>
                <button 
                  className={`toolbar-menu-item ${sortField === 'name' ? 'active' : ''}`}
                  onClick={() => { setSortField('name'); setIsSortActive(true); setIsSortMenuOpen(false); }}
                >
                  <span>이름</span>
                  {sortField === 'name' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <button 
                  className={`toolbar-menu-item ${sortField === 'appliedDate' ? 'active' : ''}`}
                  onClick={() => { setSortField('appliedDate'); setIsSortActive(true); setIsSortMenuOpen(false); }}
                >
                  <span>지원일</span>
                  {sortField === 'appliedDate' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <button 
                  className={`toolbar-menu-item ${sortField === 'evaluationProgress' ? 'active' : ''}`}
                  onClick={() => { setSortField('evaluationProgress'); setIsSortActive(true); setIsSortMenuOpen(false); }}
                >
                  <span>평가 진행도</span>
                  {sortField === 'evaluationProgress' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 정렬 순서 버튼 - 정렬 활성화 시에만 표시 */}
          {isSortActive && (
            <>
              <button 
                className={`toolbar-icon-btn ${sortOrder === 'asc' ? '' : 'desc'}`}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
              >
                {sortOrder === 'asc' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                )}
              </button>

              <div className="sort-label">{getSortFieldLabel(sortField)}</div>
            </>
          )}
          
          <div className="toolbar-divider"></div>
          <button className="toolbar-btn">대량 업데이트</button>
          <button 
            className={`toolbar-btn ${isMultiSelectMode ? 'primary active' : ''}`}
            onClick={toggleMultiSelectMode}
          >
            {isMultiSelectMode ? `✓ 선택됨 (${selectedIds.size})` : '다중 선택'}
          </button>
          <span className="stats">합격: 0</span>
        </div>
      </div>

      {isMultiSelectMode && selectedIds.size > 0 && (
        <div className="selection-toolbar">
          <span className="selection-count">{selectedIds.size}명 선택됨</span>
          <button className="selection-btn" onClick={() => setSelectedIds(new Set())}>
            선택 해제
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {/* 입사 확정(hired)을 제외한 나머지 컬럼 */}
          {stages.filter((s) => s.id !== 'hired').map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              applicants={getApplicantsByStage(stage.id)}
              onDelete={handleDelete}
              onDeleteColumn={handleDeleteColumn}
              onRenameColumn={handleRenameColumn}
              onAddApplicant={handleOpenAddModal}
              isMultiSelectMode={isMultiSelectMode}
              isDragDisabled={isSortActive}
              selectedIds={selectedIds}
              onSelectApplicant={handleSelectApplicant}
              highlightedIds={highlightedIds}
              isFilterActive={isFilterActive}
              isFixed={false}
            />
          ))}
          
          {/* 컬럼 추가 버튼 - 입사 확정 왼쪽 */}
          <div className="add-column-wrapper">
            <button 
              className="add-column-btn"
              onClick={() => setIsAddColumnModalOpen(true)}
              title="컬럼 추가"
            >
              +
            </button>
          </div>

          {/* 입사 확정 컬럼 - 맨 오른쪽 고정 */}
          {stages.filter((s) => s.id === 'hired').map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              applicants={getApplicantsByStage(stage.id)}
              onDelete={handleDelete}
              onDeleteColumn={handleDeleteColumn}
              onRenameColumn={handleRenameColumn}
              onAddApplicant={handleOpenAddModal}
              isMultiSelectMode={isMultiSelectMode}
              isDragDisabled={isSortActive}
              selectedIds={selectedIds}
              onSelectApplicant={handleSelectApplicant}
              highlightedIds={highlightedIds}
              isFilterActive={isFilterActive}
              isFixed={true}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApplicant ? (
            <div className="drag-overlay-container">
              <div className="applicant-card dragging">
                <div className="card-header">
                  <h4 className="applicant-name">{activeApplicant.name}</h4>
                </div>
                <span className={`registration-badge ${activeApplicant.registrationType === '직접등록' ? 'direct' : 'apply'}`}>
                  {activeApplicant.registrationType}
                </span>
                <div className="card-date">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{activeApplicant.appliedDate}</span>
                </div>
                <div className="evaluation-status">
                  평가 중 ({activeApplicant.evaluationProgress.current}/{activeApplicant.evaluationProgress.total})
                </div>
              </div>
              {isMultiSelectMode && selectedIds.size > 1 && selectedIds.has(activeApplicant.id) && (
                <div className="drag-count-badge">+{selectedIds.size - 1}</div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {addModalStage && (
        <AddApplicantModal
          stage={addModalStage}
          stageName={getStageTitle(addModalStage)}
          onClose={handleCloseAddModal}
          onAdd={handleAddApplicant}
        />
      )}

      {isAddColumnModalOpen && (
        <AddColumnModal
          onClose={() => setIsAddColumnModalOpen(false)}
          onAdd={handleAddColumn}
          existingColors={stages.map((s) => s.color)}
        />
      )}
    </div>
  );
}
