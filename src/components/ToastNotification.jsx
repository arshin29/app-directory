import React, { useEffect } from 'react';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';
import './ToastNotification.css';

export default function ToastNotification({
  message,
  onUndo,
  onClose,
  duration = 5000
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="apple-toast-container" role="status" aria-live="polite">
      <div className="apple-toast-card">
        <CheckCircle2 size={16} className="toast-icon-check" />
        <span className="toast-message">{message}</span>
        {onUndo && (
          <button 
            type="button" 
            className="toast-undo-btn" 
            onClick={onUndo}
            id="toast-btn-undo"
          >
            <RotateCcw size={13} />
            <span>Undo</span>
          </button>
        )}
        <button 
          type="button" 
          className="toast-close-btn" 
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
