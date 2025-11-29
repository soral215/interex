import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Applicant, StageInfo, Stage } from '../types';
import { ApplicantCard } from './ApplicantCard';

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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <div className="column-menu-wrapper">
            <button 
              ref={menuButtonRef}
              className="column-action-btn" 
              title="더보기"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {isMenuOpen && (
              <div ref={menuRef} className="column-menu">
                <button className="column-menu-item" onClick={handleStartRename}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>이름 수정</span>
                </button>
                {!isFixed && (
                  <button className="column-menu-item delete" onClick={handleDeleteColumn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
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
