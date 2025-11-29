import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Applicant } from '../types';
import { ApplicantPopover } from './ApplicantPopover';
import { MoreIcon, ClockIcon } from './icons';

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

  const handleCardClick = (e: React.MouseEvent) => {
    // 메뉴 버튼이나 팝오버 클릭 시에는 처리하지 않음
    if (
      (e.target as HTMLElement).closest('.more-btn') ||
      (e.target as HTMLElement).closest('.popover-menu') ||
      (e.target as HTMLElement).closest('.select-checkbox')
    ) {
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

  const cardClassName = [
    'applicant-card',
    isSelected && 'selected',
    isMultiSelectMode && 'multi-select-mode',
    isHighlighted && isFilterActive && 'highlighted',
    isDimmed && 'dimmed',
    isDragDisabled && 'drag-disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClassName}
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
            <MoreIcon />
          </button>
        )}

        <ApplicantPopover
          isOpen={isPopoverOpen}
          position={popoverPosition}
          isPrivate={isPrivate}
          onClose={() => setIsPopoverOpen(false)}
          onAction={handleMenuAction}
          buttonRef={buttonRef}
        />
      </div>

      <span
        className={`registration-badge ${applicant.registrationType === '직접등록' ? 'direct' : 'apply'}`}
      >
        {applicant.registrationType}
      </span>

      <div className="card-date">
        <ClockIcon />
        <span>{applicant.appliedDate}</span>
      </div>

      <div className={`evaluation-status ${isComplete ? 'complete' : 'in-progress'}`}>
        평가 중 ({current}/{total})
      </div>
    </div>
  );
}
