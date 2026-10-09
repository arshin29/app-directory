import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Github, Pencil } from 'lucide-react';
import { VercelIcon } from './BrandIcons';
import StatusBadge from './StatusBadge';
import AppThumbnail from './AppThumbnail';
import './AppCard.css';

export default function AppCard({ app, onSelectDetails, onEditApp }) {
  const navigate = useNavigate();
  const isComingSoon = app.status === 'Coming Soon';

  // Determine if this app links to an external URL
  const targetUrl = app.externalUrl || app.url || (app.route && (app.route.startsWith('http://') || app.route.startsWith('https://')) ? app.route : null);
  const isExternal = Boolean(targetUrl);

  const handleAction = (e) => {
    e.stopPropagation();
    if (isComingSoon) {
      onSelectDetails(app);
      return;
    }
    if (isExternal) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else if (app.route) {
      navigate(app.route);
    } else {
      onSelectDetails(app);
    }
  };

  const handleCardClick = () => {
    if (isComingSoon) {
      onSelectDetails(app);
      return;
    }
    if (isExternal) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else if (app.route) {
      navigate(app.route);
    }
  };

  return (
    <div 
      className={`app-card ${isComingSoon ? 'app-card--coming-soon' : ''}`}
      onClick={handleCardClick}
      role="article"
      aria-label={app.name}
      id={`app-card-${app.id}`}
    >
      {/* Visual Thumbnail */}
      <AppThumbnail type={app.thumbnailType} name={app.name} />

      {/* Card Content */}
      <div className="app-card-body">
        {/* Header: Category & Status */}
        <div className="app-card-header">
          <span className="category-pill">{app.category}</span>
          <StatusBadge status={app.status} />
        </div>

        {/* Title & Description */}
        <div className="app-card-text">
          <h3 className="app-card-title">{app.name}</h3>
          <p className="app-card-desc">{app.description}</p>
        </div>

        {/* Feature Pills Preview */}
        {app.features && app.features.length > 0 && (
          <div className="app-card-features-row">
            {app.features.slice(0, 2).map((feat, i) => (
              <span key={i} className="card-feature-pill">
                {feat}
              </span>
            ))}
          </div>
        )}

        {/* Subtle Tech Badge */}
        <div className="app-card-meta-bar">
          <span className="tech-badge">
            <span className="tech-dot" />
            {app.tech}
          </span>
          {isExternal && (
            <span className="external-label" title={`Opens external link: ${targetUrl}`}>
              External
            </span>
          )}
        </div>

        {/* Card Footer: Action Button and Optional Links */}
        <div className="app-card-footer">
          {isComingSoon ? (
            <button 
              className="apple-button apple-button-secondary-pill"
              onClick={handleAction}
              title="View roadmap and specifications"
              id={`btn-view-${app.id}`}
            >
              <span>View Details</span>
            </button>
          ) : (
            <button 
              className="apple-button apple-button-primary"
              onClick={handleAction}
              title={`Open ${app.name}${isExternal ? ' (External Web App)' : ''}`}
              id={`btn-open-${app.id}`}
            >
              <span>Open App</span>
              {isExternal ? (
                <ExternalLink size={13} className="arrow-icon" />
              ) : (
                <ArrowRight size={14} className="arrow-icon" />
              )}
            </button>
          )}

          {/* GitHub Repository Link */}
          {app.githubUrl && (
            <a
              href={app.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-icon-link"
              onClick={(e) => e.stopPropagation()}
              title="View Source on GitHub"
              aria-label="GitHub Repository"
            >
              <Github size={15} />
            </a>
          )}

          {/* Vercel Deployment Link */}
          {app.vercelUrl && (
            <a
              href={app.vercelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-icon-link"
              onClick={(e) => e.stopPropagation()}
              title="View on Vercel"
              aria-label="Vercel Deployment"
            >
              <VercelIcon size={13} />
            </a>
          )}

          {/* Edit Application Button */}
          {onEditApp && (
            <button
              type="button"
              className="apple-icon-link apple-icon-link--edit"
              onClick={(e) => {
                e.stopPropagation();
                onEditApp(app);
              }}
              title={`Edit ${app.name}`}
              aria-label={`Edit ${app.name}`}
              id={`btn-edit-${app.id}`}
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
