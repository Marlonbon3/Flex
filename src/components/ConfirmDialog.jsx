import React from 'react';
import '../styles/confirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  type = 'confirm',
  title,
  message,
  confirmText,
  cancelText = 'Cancelar',
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  const isAlert = type === 'success' || type === 'error' || type === 'info';
  const resolvedConfirmText = confirmText || (isAlert ? 'Aceptar' : 'Confirmar');

  const iconMap = {
    confirm: <WarningIcon />,
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    info: <InfoIcon />
  };

  return (
    <div className="cdialog-overlay" onClick={isAlert ? onClose : undefined}>
      <div className="cdialog-box" onClick={e => e.stopPropagation()}>
        <div className={`cdialog-icon-wrap ${type}`}>
          {iconMap[type] || iconMap.confirm}
        </div>
        <h3 className="cdialog-title">{title}</h3>
        {message && <p className="cdialog-message">{message}</p>}
        <div className="cdialog-actions">
          {!isAlert && (
            <button className="cdialog-btn cdialog-cancel" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button
            className={`cdialog-btn cdialog-confirm ${type}`}
            onClick={onConfirm || onClose}
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#FFF3CD" />
      <path d="M16 9v9M16 21v2" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#D1FAE5" />
      <path d="M9 16l5 5 9-9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#FEE2E2" />
      <path d="M11 11l10 10M21 11l-10 10" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#DBEAFE" />
      <path d="M16 11v1M16 15v6" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
