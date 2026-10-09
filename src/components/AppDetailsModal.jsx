import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, ArrowRight, ExternalLink, Calendar, Code2, Github, Trash2, Pencil } from 'lucide-react';
import { VercelIcon } from './BrandIcons';
import StatusBadge from './StatusBadge';
import AppThumbnail from './AppThumbnail';
import { useModalScrollLock } from '../utils/useModalScrollLock';
import './AppDetailsModal.css';

export default function AppDetailsModal({ app, onClose, onDeleteApp, onEditApp }) {
  const navigate = useNavigate();

  useModalScrollLock(Boolean(app));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!app) return null;

  const isReady = app.status === 'Ready';
  const targetUrl = app.externalUrl || app.url || (app.route && (app.route.startsWith('http://') || app.route.startsWith('https://')) ? app.route : null);
  const isExternal = Boolean(targetUrl);

  const handleLaunch = () => {
    onClose();
    if (isExternal) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else if (app.route) {
      navigate(app.route);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="details-modal-title">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <div className="modal-sheet-closebar">
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close details dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Thumbnail Header */}
        <div className="modal-thumbnail-area">
          <AppThumbnail type={app.thumbnailType} name={app.name} />
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          <div className="modal-header-meta">
            <span className="modal-tag primary">{app.category}</span>
            <StatusBadge status={app.status} size="normal" />
          </div>

          <h2 id="details-modal-title" className="modal-title">{app.name}</h2>
          <p className="modal-description">{app.description}</p>

          {/* Feature Specs */}
          {app.features && app.features.length > 0 && (
            <div className="modal-section">
              <h4 className="modal-section-title">Key Capabilities</h4>
              <ul className="modal-features-list">
                {app.features.map((feat, index) => (
                  <li key={index} className="modal-feature-item">
                    <CheckCircle2 size={15} className="feature-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Info */}
          <div className="modal-specs-grid">
            <div className="spec-card">
              <Code2 size={16} className="spec-icon" />
              <div>
                <span className="spec-title">Architecture</span>
                <span className="spec-value">{app.tech}</span>
              </div>
            </div>

            <div className="spec-card">
              <Calendar size={16} className="spec-icon" />
              <div>
                <span className="spec-title">Status / Release</span>
                <span className="spec-value">{app.version || 'v1.0'}</span>
              </div>
            </div>
          </div>

          {/* Repository & Deployment Links */}
          {(app.githubUrl || app.vercelUrl) && (
            <div className="modal-ext-links-row">
              {app.githubUrl && (
                <a 
                  href={app.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="modal-ext-link"
                >
                  <Github size={14} />
                  <span>GitHub Repository</span>
                  <ExternalLink size={12} className="ext-arrow" />
                </a>
              )}
              {app.vercelUrl && (
                <a 
                  href={app.vercelUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="modal-ext-link"
                >
                  <VercelIcon size={12} />
                  <span>Vercel Deployment</span>
                  <ExternalLink size={12} className="ext-arrow" />
                </a>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="modal-footer">
            <div className="modal-footer-left-actions">
              {onEditApp && (
                <button 
                  type="button"
                  className="apple-button modal-edit-btn"
                  onClick={() => {
                    onClose();
                    onEditApp(app);
                  }}
                  title="Edit this application's info"
                  id={`modal-btn-edit-${app.id}`}
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
              )}

              {onDeleteApp && (
                <button 
                  type="button"
                  className="apple-button modal-delete-btn"
                  onClick={() => onDeleteApp(app)}
                  title="Delete this app from directory"
                  id={`modal-btn-delete-${app.id}`}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="modal-footer-primary-actions">
              {isReady ? (
                <button 
                  className="apple-button apple-button-primary modal-action-btn"
                  onClick={handleLaunch}
                >
                  <span>{isExternal ? 'Open External Web App' : 'Launch Application'}</span>
                  {isExternal ? <ExternalLink size={15} /> : <ArrowRight size={15} />}
                </button>
              ) : (
                <button 
                  className="apple-button apple-button-secondary-pill modal-action-btn"
                  onClick={onClose}
                >
                  <span>Done</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
