import { useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import type { Applicant, Stage } from '../types';
import { Column } from './Column';
import { AddApplicantModal } from './AddApplicantModal';
import { AddColumnModal } from './AddColumnModal';
import { Dashboard } from './Dashboard';
import {
  useApplicants,
  useStages,
  useFilter,
  useSort,
  useMultiSelect,
  useClickOutside,
} from '../hooks';
import type { EvaluationFilter } from '../hooks';
import {
  SearchIcon,
  CloseIcon,
  PlusIcon,
  FilterIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  DashboardIcon,
  ClockIcon,
} from './icons';

export function KanbanBoard() {
  // 컬럼 상태 (커스텀 훅)
  const {
    stages,
    addColumn,
    deleteColumn,
    renameColumn,
    getStageTitle,
  } = useStages();
  
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  // 커스텀 훅 사용
  const {
    applicants,
    deleteApplicant,
    addApplicant,
    moveApplicant,
    moveMultipleApplicants,
    reorderApplicants,
    getApplicantsByStage,
    getApplicantById,
  } = useApplicants(stages);

  const {
    searchQuery,
    setSearchQuery,
    evaluationFilter,
    setEvaluationFilter,
    highlightedIds,
    isFilterActive,
    clearFilters,
  } = useFilter(applicants);

  const {
    sortField,
    sortOrder,
    isSortActive,
    setIsSortActive,
    sortApplicants,
    getSortFieldLabel,
    toggleSortOrder,
    activateSort,
  } = useSort();

  const {
    isMultiSelectMode,
    selectedIds,
    toggleMultiSelectMode,
    selectApplicant,
    addToSelection,
    removeFromSelection,
    clearSelection,
  } = useMultiSelect();

  // 로컬 상태
  const [activeApplicant, setActiveApplicant] = useState<Applicant | null>(null);
  const [addModalStage, setAddModalStage] = useState<Stage | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Refs
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  // 외부 클릭 시 정렬 메뉴 닫기
  useClickOutside([sortMenuRef, sortButtonRef], () => setIsSortMenuOpen(false), isSortMenuOpen);

  // 정렬이 활성화되어 있으면 드래그앤드롭 비활성화
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isSortActive ? Infinity : 8,
      },
    })
  );

  // 정렬된 지원자 목록 가져오기
  const getSortedApplicantsByStage = (stage: Stage): Applicant[] => {
    const stageApplicants = getApplicantsByStage(stage);
    return sortApplicants(stageApplicants);
  };

  // 드래그 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const applicant = getApplicantById(active.id as string);
    if (applicant) {
      setActiveApplicant(applicant);

      // 다중 선택 모드에서 드래그 시작한 카드가 선택되지 않았다면 선택에 추가
      if (isMultiSelectMode && !selectedIds.has(applicant.id)) {
        addToSelection(applicant.id);
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

      if (isMultiSelectMode && selectedIds.size > 0) {
        const idsToMove = selectedIds.has(activeId) ? selectedIds : new Set([activeId]);
        moveMultipleApplicants(idsToMove, newStage);
      } else {
        const activeApplicantItem = getApplicantById(activeId);
        if (activeApplicantItem && activeApplicantItem.stage !== newStage) {
          moveApplicant(activeId, newStage);
        }
      }
      return;
    }

    // 다른 카드 위에 드롭하는 경우
    const overApplicant = getApplicantById(overId);
    const activeApplicantItem = getApplicantById(activeId);

    if (overApplicant && activeApplicantItem) {
      if (activeApplicantItem.stage !== overApplicant.stage) {
        if (isMultiSelectMode && selectedIds.size > 0) {
          const idsToMove = selectedIds.has(activeId) ? selectedIds : new Set([activeId]);
          moveMultipleApplicants(idsToMove, overApplicant.stage);
        } else {
          moveApplicant(activeId, overApplicant.stage);
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

    // 컬럼 위에 드롭하는 경우
    const isOverColumn = stages.some((s) => s.id === overId);
    if (isOverColumn) {
      const newStage = overId as Stage;

      if (isMultiSelectMode && selectedIds.size > 0) {
        const idsToMove = selectedIds.has(activeId) ? selectedIds : new Set([activeId]);
        moveMultipleApplicants(idsToMove, newStage);
      } else {
        const activeApplicantItem = getApplicantById(activeId);
        if (activeApplicantItem && activeApplicantItem.stage !== newStage) {
          moveApplicant(activeId, newStage);
        }
      }
      return;
    }

    // 같은 컬럼 내에서 순서 변경
    const activeApplicantItem = getApplicantById(activeId);
    const overApplicant = getApplicantById(overId);

    if (!activeApplicantItem || !overApplicant) return;

    if (activeApplicantItem.stage === overApplicant.stage) {
      reorderApplicants(activeId, overId, activeApplicantItem.stage);
    }
  };

  // 삭제 핸들러
  const handleDelete = (id: string) => {
    deleteApplicant(id);
    removeFromSelection(id);
  };

  // 모달 핸들러
  const handleOpenAddModal = (stage: Stage) => {
    setAddModalStage(stage);
  };

  const handleCloseAddModal = () => {
    setAddModalStage(null);
  };

  // 컬럼 핸들러
  const handleAddColumn = (data: { title: string; color: string }) => {
    addColumn(data);
  };

  const handleDeleteColumn = async (stageId: Stage) => {
    const hasApplicants = applicants.some((a) => a.stage === stageId);
    if (hasApplicants) {
      alert('해당 컬럼에 지원자가 있습니다. 지원자를 먼저 이동시켜 주세요.');
      return;
    }
    await deleteColumn(stageId);
  };

  const handleRenameColumn = (stageId: Stage, newTitle: string) => {
    renameColumn(stageId, newTitle);
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
            <DashboardIcon />
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
            <SearchIcon />
            <input
              type="text"
              placeholder="이름, ID로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <CloseIcon />
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
            <PlusIcon size={18} />
          </button>

          {/* 정렬 기준 버튼 */}
          <div className="toolbar-dropdown">
            <button
              ref={sortButtonRef}
              className={`toolbar-icon-btn ${isSortActive || isSortMenuOpen ? 'active' : ''}`}
              onClick={() => {
                if (isSortActive && !isSortMenuOpen) {
                  setIsSortActive(false);
                } else {
                  setIsSortMenuOpen(!isSortMenuOpen);
                }
              }}
              title={isSortActive ? '정렬 해제' : '정렬 기준'}
            >
              <FilterIcon />
            </button>
            {isSortMenuOpen && (
              <div ref={sortMenuRef} className="toolbar-menu">
                <div className="toolbar-menu-header">정렬 기준</div>
                {(['name', 'appliedDate', 'evaluationProgress'] as const).map((field) => (
                  <button
                    key={field}
                    className={`toolbar-menu-item ${sortField === field ? 'active' : ''}`}
                    onClick={() => {
                      activateSort(field);
                      setIsSortMenuOpen(false);
                    }}
                  >
                    <span>{getSortFieldLabel(field)}</span>
                    {sortField === field && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 정렬 순서 버튼 */}
          {isSortActive && (
            <>
              <button
                className={`toolbar-icon-btn ${sortOrder === 'asc' ? '' : 'desc'}`}
                onClick={toggleSortOrder}
                title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
              >
                {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
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
          <button className="selection-btn" onClick={clearSelection}>
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
          {stages
            .filter((s) => s.id !== 'hired')
            .map((stage) => (
              <Column
                key={stage.id}
                stage={stage}
                applicants={getSortedApplicantsByStage(stage.id)}
                onDelete={handleDelete}
                onDeleteColumn={handleDeleteColumn}
                onRenameColumn={handleRenameColumn}
                onAddApplicant={handleOpenAddModal}
                isMultiSelectMode={isMultiSelectMode}
                isDragDisabled={isSortActive}
                selectedIds={selectedIds}
                onSelectApplicant={selectApplicant}
                highlightedIds={highlightedIds}
                isFilterActive={isFilterActive}
                isFixed={false}
              />
            ))}

          {/* 컬럼 추가 버튼 */}
          <div className="add-column-wrapper">
            <button
              className="add-column-btn"
              onClick={() => setIsAddColumnModalOpen(true)}
              title="컬럼 추가"
            >
              +
            </button>
          </div>

          {/* 입사 확정 컬럼 */}
          {stages
            .filter((s) => s.id === 'hired')
            .map((stage) => (
              <Column
                key={stage.id}
                stage={stage}
                applicants={getSortedApplicantsByStage(stage.id)}
                onDelete={handleDelete}
                onDeleteColumn={handleDeleteColumn}
                onRenameColumn={handleRenameColumn}
                onAddApplicant={handleOpenAddModal}
                isMultiSelectMode={isMultiSelectMode}
                isDragDisabled={isSortActive}
                selectedIds={selectedIds}
                onSelectApplicant={selectApplicant}
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
                <span
                  className={`registration-badge ${activeApplicant.registrationType === '직접등록' ? 'direct' : 'apply'}`}
                >
                  {activeApplicant.registrationType}
                </span>
                <div className="card-date">
                  <ClockIcon />
                  <span>{activeApplicant.appliedDate}</span>
                </div>
                <div className="evaluation-status">
                  평가 중 ({activeApplicant.evaluationProgress.current}/
                  {activeApplicant.evaluationProgress.total})
                </div>
              </div>
              {isMultiSelectMode &&
                selectedIds.size > 1 &&
                selectedIds.has(activeApplicant.id) && (
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
          onAdd={addApplicant}
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
