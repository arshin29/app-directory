import React, { useEffect, useRef, useState } from 'react';
import { Lock, Unlock, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModalScrollLock } from '../utils/useModalScrollLock';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { login, onLoginSuccess } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  useModalScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setSuccess(false);
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await login(password.trim());
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Incorrect password. Please try again.');
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div className={`login-modal-card ${error ? 'login-modal-card--shake' : ''} ${success ? 'login-modal-card--success' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        {/* Icon */}
        <div className={`login-modal-icon ${success ? 'login-modal-icon--success' : ''}`}>
          {success ? <Unlock size={26} /> : <Lock size={26} />}
        </div>

        {/* Header */}
        <div className="login-modal-header">
          <h2 id="login-modal-title" className="login-modal-title">
            {success ? 'Access Granted' : 'Admin Access Required'}
          </h2>
          <p className="login-modal-subtitle">
            {success
              ? 'You\'re now signed in as admin.'
              : 'Enter your admin password to add, edit, or delete apps.'}
          </p>
        </div>

        {!success && (
          <form onSubmit={handleSubmit} className="login-modal-form">
            <div className={`login-password-field ${error ? 'login-password-field--error' : ''}`}>
              <input
                ref={inputRef}
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                className="login-password-input"
                placeholder="Admin password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-toggle-visibility"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <p className="login-error-msg" role="alert">{error}</p>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>
        )}

        {success && (
          <div className="login-success-row">
            <ShieldCheck size={16} className="login-success-icon" />
            <span>Redirecting…</span>
          </div>
        )}
      </div>
    </div>
  );
}
