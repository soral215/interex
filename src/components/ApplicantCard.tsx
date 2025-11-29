import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Applicant } from '../types';

interface ApplicantCardProps {
  applicant: Applicant;
  onDelete: (id: string) => void;
  isMultiSelectMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isHighlighted: boolean;
  isFilterActive: boolean;
  isDragDisabled: boolean;
}

interface PopoverPosition {
  top: number;
  left: number;
}

export function ApplicantCard({ 
  applicant, 
  onDelete, 
  isMultiSelectMode, 
  isSelected, 
  onSelect,
  isHighlighted,
  isFilterActive,
  isDragDisabled,
}: ApplicantCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: applicant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    // 메뉴 버튼이나 팝오버 클릭 시에는 처리하지 않음
    if ((e.target as HTMLElement).closest('.more-btn') || 
        (e.target as HTMLElement).closest('.popover-menu') ||
        (e.target as HTMLElement).closest('.select-checkbox')) {
      return;
    }
    
    // 다중 선택 모드일 때는 선택 토글
    if (isMultiSelectMode) {
      onSelect(applicant.id);
      return;
    }
    
    window.open('https://interxlab.career.greetinghr.com/ko/interxlab', '_blank');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(applicant.id);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 220;
      
      // 팝오버가 화면 오른쪽을 벗어나는지 확인
      let left = rect.right - popoverWidth;
      if (left < 10) {
        left = rect.left;
      }
      
      setPopoverPosition({
        top: rect.bottom + 4,
        left: left,
      });
    }
    
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        onDelete(applicant.id);
        break;
      case 'toggle-private':
        setIsPrivate(!isPrivate);
        return; // 팝오버 닫지 않음
      default:
        console.log(`Action: ${action} for ${applicant.name}`);
    }
    setIsPopoverOpen(false);
  };

  const { current, total } = applicant.evaluationProgress;
  const isComplete = current === total;

  // 필터가 활성화되어 있고 하이라이트되지 않은 경우 dimmed 클래스 추가
  const isDimmed = isFilterActive && !isHighlighted;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`applicant-card ${isSelected ? 'selected' : ''} ${isMultiSelectMode ? 'multi-select-mode' : ''} ${isHighlighted && isFilterActive ? 'highlighted' : ''} ${isDimmed ? 'dimmed' : ''} ${isDragDisabled ? 'drag-disabled' : ''}`}
      onClick={handleCardClick}
      {...attributes}
      {...listeners}
    >
      <div className="card-header">
        {isMultiSelectMode && (
          <label className="select-checkbox" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
            />
            <span className="checkmark"></span>
          </label>
        )}
        <h4 className="applicant-name">{applicant.name}</h4>
        {!isMultiSelectMode && (
          <button
            ref={buttonRef}
            className="more-btn"
            onClick={handleMoreClick}
            title="더보기"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        )}

        {isPopoverOpen && (
          <div 
            ref={popoverRef} 
            className="popover-menu"
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
            }}
          >
            <div className="popover-item toggle-item">
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <span>지원자 비공개</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={() => handleMenuAction('toggle-private')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="popover-divider" />

            <button className="popover-item" onClick={() => handleMenuAction('download-docs')}>
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </span>
              <span>모든 지원 서류 다운로드</span>
            </button>

            <button className="popover-item" onClick={() => handleMenuAction('download-info')}>
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <span>지원자 정보 다운로드</span>
            </button>

            <div className="popover-divider" />

            <button className="popover-item" onClick={() => handleMenuAction('send-email')}>
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span>메일 쓰기</span>
            </button>

            <button className="popover-item" onClick={() => handleMenuAction('send-sms')}>
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </span>
              <span>문자 보내기</span>
            </button>

            <button className="popover-item" onClick={() => handleMenuAction('assign-eval')}>
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>평가 배정</span>
            </button>

            <div className="popover-divider" />

            <button className="popover-item" onClick={() => handleMenuAction('final-pass')}>
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <span>최종 합격</span>
            </button>

            <div className="popover-divider" />

            <button className="popover-item danger" onClick={() => handleMenuAction('delete')}>
              <span className="popover-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </span>
              <span>불합격 처리</span>
            </button>
          </div>
        )}
      </div>

      <span className={`registration-badge ${applicant.registrationType === '직접등록' ? 'direct' : 'apply'}`}>
        {applicant.registrationType}
      </span>

      <div className="card-date">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{applicant.appliedDate}</span>
      </div>

      <div className={`evaluation-status ${isComplete ? 'complete' : 'in-progress'}`}>
        평가 중 ({current}/{total})
      </div>
    </div>
  );
}
