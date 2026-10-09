import React, { useState, useEffect } from 'react';
import { X, Plus, Github } from 'lucide-react';
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

export default function AddAppModal({ isOpen, onClose, onAddApp }) {
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

  useModalScrollLock(isOpen);

  // Reset form fields every time the modal is opened
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setCategory(AVAILABLE_CATEGORIES[0]);
      setStatus('Ready');
      setTech('');
      setAppUrl('');
      setGithubUrl('');
      setVercelUrl('');
      setThumbnailType('stl');
      setFeaturesText('');
      setErrors({});
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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

    const generatedId = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `app-${Date.now()}`;

    const featuresList = featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const isExternalUrl = Boolean(
      appUrl.trim() && (appUrl.trim().startsWith('http://') || appUrl.trim().startsWith('https://'))
    );
    // If user provided a Vercel URL and left appUrl blank, they can also use vercelUrl
    const effectiveTargetRoute = appUrl.trim() || vercelUrl.trim() || `/apps/${generatedId}`;

    const newApp = {
      id: generatedId,
      name: name.trim(),
      description: description.trim(),
      category,
      status,
      tech: tech.trim() || 'Custom',
      version: 'v1.0',
      updatedAt: new Date().toISOString().slice(0, 10),
      route: effectiveTargetRoute,
      externalUrl: isExternalUrl ? appUrl.trim() : (vercelUrl.trim() || null),
      githubUrl: githubUrl.trim() || null,
      vercelUrl: vercelUrl.trim() || null,
      thumbnailType,
      features: featuresList.length > 0 ? featuresList : ['Integrated into 3D Apps Directory suite']
    };

    onAddApp(newApp);
    onClose();
  };

  const hasExternalTarget = Boolean(
    (appUrl.trim() && (appUrl.trim().startsWith('http://') || appUrl.trim().startsWith('https://'))) ||
    (vercelUrl.trim() && (vercelUrl.trim().startsWith('http://') || vercelUrl.trim().startsWith('https://')))
  );

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-app-title">
      <div className="add-app-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <div className="add-app-modal-closebar">
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close Add App Modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="add-app-modal-content">
          {/* Header */}
          <div className="add-app-header">
            <h2 id="add-app-title" className="add-app-title">Add 3D App</h2>
            <p className="add-app-subtitle">
              Register a new 3D application, tool, or external web project in the directory.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="add-app-form">
            {/* Name & Tech */}
            <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="app-name-input">
                App Name <span className="req">*</span>
              </label>
              <input
                id="app-name-input"
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
              <label htmlFor="app-tech-input">Technology</label>
              <input
                id="app-tech-input"
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
              <label htmlFor="app-github-input" className="label-with-icon">
                <Github size={13} />
                <span>GitHub Repository (Optional)</span>
              </label>
              <input
                id="app-github-input"
                type="url"
                className="apple-text-input"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="app-vercel-input" className="label-with-icon">
                <VercelIcon size={12} />
                <span>Vercel Link (Optional)</span>
              </label>
              <input
                id="app-vercel-input"
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
            <label htmlFor="app-url-input">
              Direct App URL / Link (Optional)
            </label>
            <input
              id="app-url-input"
              type="text"
              className="apple-text-input"
              placeholder="e.g. https://my-3d-app.com, http://localhost:3000, or /apps/my-tool"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
            />
            <span className="field-hint-msg">
              {hasExternalTarget
                ? 'External URLs will launch in a new browser tab.'
                : 'Leave blank to generate an internal directory workspace route.'}
            </span>
            </div>

            {/* Description */}
            <div className="form-field">
            <label htmlFor="app-desc-input">
              Description <span className="req">*</span>
            </label>
            <textarea
              id="app-desc-input"
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
              <label htmlFor="app-cat-select">Category</label>
              <select
                id="app-cat-select"
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
              <label htmlFor="app-status-select">Status</label>
              <select
                id="app-status-select"
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
              <label htmlFor="app-thumb-select">Visual Style</label>
              <select
                id="app-thumb-select"
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

            {/* Key Features (Optional) */}
            <div className="form-field">
            <label htmlFor="app-features-input">
              Key Capabilities (Optional, one per line)
            </label>
            <textarea
              id="app-features-input"
              rows={2}
              className="apple-text-input"
              placeholder="e.g. WebGL scene inspection&#10;Model drag & drop"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
            </div>

            {/* Action Buttons */}
            <div className="add-app-actions">
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
              id="submit-new-app-btn"
            >
              <Plus size={16} />
              <span>Add to Directory</span>
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
