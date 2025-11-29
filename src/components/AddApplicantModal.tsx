import { useState } from 'react';
import type { Stage, RegistrationType } from '../types';

interface AddApplicantModalProps {
  stage: Stage;
  stageName: string;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    registrationType: RegistrationType;
    stage: Stage;
  }) => void;
}

export function AddApplicantModal({ stage, stageName, onClose, onAdd }: AddApplicantModalProps) {
  const [name, setName] = useState('');
  const [registrationType, setRegistrationType] = useState<RegistrationType>('직접등록');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd({
      name: name.trim(),
      registrationType,
      stage,
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
          <h2 className="modal-title">지원자 추가</h2>
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
              <label className="form-label">단계</label>
              <div className="form-value">{stageName}</div>
            </div>
            
            <div className="form-group">
              <label className="form-label">이름 *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="지원자 이름을 입력하세요"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">등록 유형</label>
              <div className="form-radio-group">
                <label className="form-radio">
                  <input
                    type="radio"
                    name="registrationType"
                    value="직접등록"
                    checked={registrationType === '직접등록'}
                    onChange={(e) => setRegistrationType(e.target.value as RegistrationType)}
                  />
                  <span className="radio-mark"></span>
                  <span>직접등록</span>
                </label>
                <label className="form-radio">
                  <input
                    type="radio"
                    name="registrationType"
                    value="공고지원"
                    checked={registrationType === '공고지원'}
                    onChange={(e) => setRegistrationType(e.target.value as RegistrationType)}
                  />
                  <span className="radio-mark"></span>
                  <span>공고지원</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

