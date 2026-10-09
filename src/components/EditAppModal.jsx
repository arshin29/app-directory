import React, { useState, useEffect } from 'react';
import { X, Check, Github, Pencil, Trash2 } from 'lucide-react';
import { VercelIcon } from './BrandIcons';
import { CATEGORIES } from '../data/appsData';
import { useModalScrollLock } from '../utils/useModalScrollLock';
import './AddAppModal.css';

const AVAILABLE_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

const THUMBNAIL_OPTIONS = [
  { id: 'stl', label: '3D Geometry / STL' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'spool', label: 'Filament Spool' },
  { id: 'resin', label: 'Resin / UV Vat' },
  { id: 'time', label: 'Speed / Flow' },
  { id: 'library', label: 'Asset Catalog / USDZ' },
  { id: 'mesh', label: 'Mesh Topology' },
  { id: 'gcode', label: 'G-Code / Toolpath' },
  { id: 'roi', label: 'Finance / ROI' },
  { id: 'default', label: 'Generic 3D Box' }
];

export default function EditAppModal({ isOpen, app, onClose, onUpdateApp, onDeleteApp }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(AVAILABLE_CATEGORIES[0]);
  const [status, setStatus] = useState('Ready');
  const [tech, setTech] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [thumbnailType, setThumbnailType] = useState('stl');
  const [featuresText, setFeaturesText] = useState('');
  const [errors, setErrors] = useState({});

  useModalScrollLock(Boolean(isOpen && app));

  useEffect(() => {
    if (isOpen && app) {
      setName(app.name || '');
      setDescription(app.description || '');
      setCategory(app.category || AVAILABLE_CATEGORIES[0]);
      setStatus(app.status || 'Ready');
      setTech(app.tech || '');
      setAppUrl(app.externalUrl || (app.route && (app.route.startsWith('http://') || app.route.startsWith('https://')) ? app.route : ''));
      setGithubUrl(app.githubUrl || '');
      setVercelUrl(app.vercelUrl || '');
      setThumbnailType(app.thumbnailType || 'stl');
      setFeaturesText(Array.isArray(app.features) ? app.features.join('\n') : '');
      setErrors({});
    }
  }, [isOpen, app]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !app) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'App name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const featuresList = featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const isExternalUrl = Boolean(
      appUrl.trim() && (appUrl.trim().startsWith('http://') || appUrl.trim().startsWith('https://'))
    );
    const effectiveTargetRoute = appUrl.trim() || vercelUrl.trim() || app.route || `/apps/${app.id}`;

    const updatedApp = {
      ...app,
      id: app.id,
      name: name.trim(),
      description: description.trim(),
      category,
      status,
      tech: tech.trim() || 'Custom',
      route: effectiveTargetRoute,
      externalUrl: isExternalUrl ? appUrl.trim() : (vercelUrl.trim() || null),
      githubUrl: githubUrl.trim() || null,
      vercelUrl: vercelUrl.trim() || null,
      thumbnailType,
      features: featuresList.length > 0 ? featuresList : (app.features && app.features.length > 0 ? app.features : ['Integrated into 3D Apps Directory suite']),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    onUpdateApp(updatedApp);
    onClose();
  };

  const hasExternalTarget = Boolean(
    (appUrl.trim() && (appUrl.trim().startsWith('http://') || appUrl.trim().startsWith('https://'))) ||
    (vercelUrl.trim() && (vercelUrl.trim().startsWith('http://') || vercelUrl.trim().startsWith('https://')))
  );

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-app-title">
      <div className="add-app-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <div className="add-app-modal-closebar">
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close Edit App Modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="add-app-modal-content">
          {/* Header */}
          <div className="add-app-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pencil size={20} color="var(--apple-primary)" />
              <h2 id="edit-app-title" className="add-app-title">Edit Application</h2>
            </div>
            <p className="add-app-subtitle">
              Update details, links, tech stack, or capabilities for <strong>{app.name}</strong>.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="add-app-form">
            {/* Name & Tech */}
            <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="edit-app-name-input">
                App Name <span className="req">*</span>
              </label>
              <input
                id="edit-app-name-input"
                type="text"
                className={`apple-text-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Three.js Scene Editor"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
              />
              {errors.name && <span className="field-error-msg">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="edit-app-tech-input">Technology Stack</label>
              <input
                id="edit-app-tech-input"
                type="text"
                className="apple-text-input"
                placeholder="e.g. React + Three.js"
                value={tech}
                onChange={(e) => setTech(e.target.value)}
              />
            </div>
            </div>

            {/* GitHub & Vercel Links */}
            <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="edit-app-github-input" className="label-with-icon">
                <Github size={13} />
                <span>GitHub Repository (Optional)</span>
              </label>
              <input
                id="edit-app-github-input"
                type="url"
                className="apple-text-input"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-app-vercel-input" className="label-with-icon">
                <VercelIcon size={12} />
                <span>Vercel Link (Optional)</span>
              </label>
              <input
                id="edit-app-vercel-input"
                type="url"
                className="apple-text-input"
                placeholder="https://my-3d-app.vercel.app"
                value={vercelUrl}
                onChange={(e) => setVercelUrl(e.target.value)}
              />
            </div>
            </div>

            {/* App URL / External Route */}
            <div className="form-field">
            <label htmlFor="edit-app-url-input">
              Direct App URL / Link (Optional)
            </label>
            <input
              id="edit-app-url-input"
              type="text"
              className="apple-text-input"
              placeholder="e.g. https://my-3d-app.com, http://localhost:3000, or /apps/my-tool"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
            />
            <span className="field-hint-msg">
              {hasExternalTarget
                ? 'External URLs will launch in a new browser tab.'
                : 'Internal route within directory.'}
            </span>
            </div>

            {/* Description */}
            <div className="form-field">
            <label htmlFor="edit-app-desc-input">
              Description <span className="req">*</span>
            </label>
            <textarea
              id="edit-app-desc-input"
              rows={2}
              className={`apple-text-input ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe what the 3D application accomplishes..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: null }));
              }}
            />
            {errors.description && <span className="field-error-msg">{errors.description}</span>}
            </div>

            {/* Category, Status & Thumbnail Style */}
            <div className="form-grid-3">
            <div className="form-field">
              <label htmlFor="edit-app-cat-select">Category</label>
              <select
                id="edit-app-cat-select"
                className="apple-select-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {AVAILABLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="edit-app-status-select">Status</label>
              <select
                id="edit-app-status-select"
                className="apple-select-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Ready">Ready</option>
                <option value="In Progress">In Progress</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="edit-app-thumb-select">Visual Style</label>
              <select
                id="edit-app-thumb-select"
                className="apple-select-input"
                value={thumbnailType}
                onChange={(e) => setThumbnailType(e.target.value)}
              >
                {THUMBNAIL_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
            </div>

            {/* Key Capabilities */}
            <div className="form-field">
            <label htmlFor="edit-app-features-input">
              Key Capabilities (One per line)
            </label>
            <textarea
              id="edit-app-features-input"
              rows={3}
              className="apple-text-input"
              placeholder="e.g. WebGL scene inspection&#10;Model drag & drop"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
            </div>

            {/* Action Buttons */}
            <div className="add-app-actions edit-app-actions">
            <button
              type="button"
              className="apple-button edit-delete-btn"
              id="btn-delete-from-edit"
              onClick={() => { onDeleteApp && onDeleteApp(app); onClose(); }}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
            <div className="edit-actions-right">
              <button
                type="button"
                className="apple-button apple-button-secondary-pill"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="apple-button apple-button-primary add-submit-btn"
                id="btn-save-edit-app"
              >
                <Check size={16} />
                <span>Save Changes</span>
              </button>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
