import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Applicant, StageInfo, Stage } from '../types';
import { ApplicantCard } from './ApplicantCard';
import { useClickOutside } from '../hooks/useClickOutside';
import { PlusIcon, MoreIcon, EditIcon, TrashIcon, InfoIcon } from './icons';

interface ColumnProps {
  stage: StageInfo;
  applicants: Applicant[];
  onDelete: (id: string) => void;
  onDeleteColumn: (stageId: Stage) => void;
  onRenameColumn: (stageId: Stage, newTitle: string) => void;
  onAddApplicant: (stage: Stage) => void;
  isMultiSelectMode: boolean;
  selectedIds: Set<string>;
  onSelectApplicant: (id: string) => void;
  highlightedIds: Set<string>;
  isFilterActive: boolean;
  isDragDisabled: boolean;
  isFixed?: boolean;
}

export function Column({
  stage,
  applicants,
  onDelete,
  onDeleteColumn,
  onRenameColumn,
  onAddApplicant,
  isMultiSelectMode,
  selectedIds,
  onSelectApplicant,
  highlightedIds,
  isFilterActive,
  isDragDisabled,
  isFixed = false,
}: ColumnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(stage.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  // 메뉴 외부 클릭 시 닫기
  useClickOutside([menuRef, menuButtonRef], () => setIsMenuOpen(false), isMenuOpen);

  // 편집 모드 시작 시 input focus
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 필터가 활성화되어 있을 때 해당 컬럼의 하이라이트된 지원자 수
  const highlightedCount = isFilterActive
    ? applicants.filter((a) => highlightedIds.has(a.id)).length
    : applicants.length;

  const handleDeleteColumn = () => {
    setIsMenuOpen(false);
    onDeleteColumn(stage.id);
  };

  const handleStartRename = () => {
    setIsMenuOpen(false);
    setEditTitle(stage.title);
    setIsEditing(true);
  };

  const handleSaveTitle = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== stage.title) {
      onRenameColumn(stage.id, trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(stage.title);
      setIsEditing(false);
    }
  };

  return (
    <div className={`column ${isOver ? 'column-over' : ''}`}>
      <div className="column-header" style={{ borderTopColor: stage.color }}>
        <div className="column-title-wrapper">
          <span className="column-icon" style={{ backgroundColor: stage.color }} />
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="column-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <h3 className="column-title">{stage.title}</h3>
          )}
          {isFilterActive ? (
            <span className="column-count highlighted">
              {highlightedCount}/{applicants.length}
            </span>
          ) : (
            <span className="column-count">{applicants.length}</span>
          )}
        </div>
        <div className="column-actions">
          <button
            className="column-action-btn"
            onClick={() => onAddApplicant(stage.id)}
            title="지원자 추가"
          >
            <PlusIcon />
          </button>
          <div className="column-menu-wrapper">
            <button
              ref={menuButtonRef}
              className="column-action-btn"
              title="더보기"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreIcon size={16} />
            </button>
            {isMenuOpen && (
              <div ref={menuRef} className="column-menu">
                <button className="column-menu-item" onClick={handleStartRename}>
                  <EditIcon />
                  <span>이름 수정</span>
                </button>
                {!isFixed && (
                  <button className="column-menu-item delete" onClick={handleDeleteColumn}>
                    <TrashIcon />
                    <span>컬럼 삭제</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={setNodeRef} className="column-content">
        <SortableContext
          items={applicants.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applicants.length === 0 ? (
            <div className="empty-column">
              <InfoIcon />
              <span>지원자 없음</span>
            </div>
          ) : (
            applicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onDelete={onDelete}
                isMultiSelectMode={isMultiSelectMode}
                isSelected={selectedIds.has(applicant.id)}
                onSelect={onSelectApplicant}
                isHighlighted={highlightedIds.has(applicant.id)}
                isFilterActive={isFilterActive}
                isDragDisabled={isDragDisabled}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
