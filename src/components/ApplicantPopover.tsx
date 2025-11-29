import { useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import {
  LockIcon,
  DownloadIcon,
  FileIcon,
  MailIcon,
  PhoneIcon,
  UsersIcon,
  CheckCircleIcon,
  BanIcon,
} from './icons';

interface PopoverPosition {
  top: number;
  left: number;
}

interface ApplicantPopoverProps {
  isOpen: boolean;
  position: PopoverPosition;
  isPrivate: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function ApplicantPopover({
  isOpen,
  position,
  isPrivate,
  onClose,
  onAction,
  buttonRef,
}: ApplicantPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useClickOutside([popoverRef, buttonRef], onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="popover-menu"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="popover-item toggle-item">
        <span className="popover-icon">
          <LockIcon />
        </span>
        <span>지원자 비공개</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => onAction('toggle-private')}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="popover-divider" />

      <button className="popover-item" onClick={() => onAction('download-docs')}>
        <span className="popover-icon">
          <DownloadIcon />
        </span>
        <span>모든 지원 서류 다운로드</span>
      </button>

      <button className="popover-item" onClick={() => onAction('download-info')}>
        <span className="popover-icon">
          <FileIcon />
        </span>
        <span>지원자 정보 다운로드</span>
      </button>

      <div className="popover-divider" />

      <button className="popover-item" onClick={() => onAction('send-email')}>
        <span className="popover-icon">
          <MailIcon />
        </span>
        <span>메일 쓰기</span>
      </button>

      <button className="popover-item" onClick={() => onAction('send-sms')}>
        <span className="popover-icon">
          <PhoneIcon />
        </span>
        <span>문자 보내기</span>
      </button>

      <button className="popover-item" onClick={() => onAction('assign-eval')}>
        <span className="popover-icon">
          <UsersIcon size={16} />
        </span>
        <span>평가 배정</span>
      </button>

      <div className="popover-divider" />

      <button className="popover-item" onClick={() => onAction('final-pass')}>
        <span className="popover-icon">
          <CheckCircleIcon size={16} />
        </span>
        <span>최종 합격</span>
      </button>

      <div className="popover-divider" />

      <button className="popover-item danger" onClick={() => onAction('delete')}>
        <span className="popover-icon">
          <BanIcon />
        </span>
        <span>불합격 처리</span>
      </button>
    </div>
  );
}

