import { useState } from 'react';
import { STAGE_COLORS } from '../types';

interface AddColumnModalProps {
  onClose: () => void;
  onAdd: (data: { title: string; color: string }) => void;
  existingColors: string[];
}

export function AddColumnModal({ onClose, onAdd, existingColors }: AddColumnModalProps) {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    STAGE_COLORS.find(c => !existingColors.includes(c)) || STAGE_COLORS[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      title: title.trim(),
      color: selectedColor,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">컬럼 추가</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">컬럼 이름 *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 기술면접, 레퍼런스체크 등"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">컬럼 색상</label>
              <div className="color-picker">
                {STAGE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">미리보기</label>
              <div className="column-preview">
                <div className="preview-header" style={{ borderTopColor: selectedColor }}>
                  <span className="preview-icon" style={{ backgroundColor: selectedColor }} />
                  <span className="preview-title">{title || '컬럼 이름'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

