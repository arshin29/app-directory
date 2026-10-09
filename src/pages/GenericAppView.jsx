import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Box, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  RotateCcw,
  Sliders,
  Download,
  Info
} from 'lucide-react';
import { appsData } from '../data/appsData';
import { getStoredApps } from '../utils/appStorage';
import StatusBadge from '../components/StatusBadge';
import AppThumbnail from '../components/AppThumbnail';
import './GenericAppView.css';

export default function GenericAppView() {
  const { appId } = useParams();
  const allApps = getStoredApps();
  const app = allApps.find((a) => a.id === appId || a.route === `/apps/${appId}`) || appsData.find((a) => a.id === appId);

  // Interactive widget states for STL Inspector
  const [infillDensity, setInfillDensity] = useState(20);
  const [meshScale, setMeshScale] = useState(100);

  // Interactive widget states for Spool Manager
  const [spools, setSpools] = useState([
    { id: 1, name: 'Bambu Matte PLA - Charcoal', remainingG: 780, totalG: 1000, color: '#2d3436' },
    { id: 2, name: 'Prusament PETG - Signal White', remainingG: 340, totalG: 1000, color: '#f5f6fa' },
    { id: 3, name: 'Polymaker PolyTerra - Forest Green', remainingG: 920, totalG: 1000, color: '#2ed573' },
    { id: 4, name: 'eSUN TPU 95A - Electric Blue', remainingG: 120, totalG: 1000, color: '#1e90ff' },
  ]);

  if (!app) {
    return (
      <div className="app-not-found">
        <h2>App Not Found</h2>
        <p>The requested 3D application could not be found in the directory.</p>
        <Link to="/" className="apple-button apple-button-primary">
          <ArrowLeft size={16} />
          <span>Return to 3D Apps</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="generic-app-page">
      {/* Header Bar */}
      <div className="generic-nav-bar">
        <Link to="/" className="generic-back-link">
          <ArrowLeft size={16} />
          <span>Back to 3D Apps</span>
        </Link>
        <div className="generic-nav-tags">
          <span className="generic-category-tag">{app.category}</span>
          <StatusBadge status={app.status} />
        </div>
      </div>

      {/* Main App Container */}
      <div className="generic-app-hero">
        <div className="generic-hero-left">
          <h1 className="generic-title">{app.name}</h1>
          <p className="generic-desc">{app.description}</p>
          <div className="generic-meta-pills">
            <span className="generic-pill">Framework: {app.tech}</span>
            <span className="generic-pill">Version: {app.version}</span>
            <span className="generic-pill">Updated: {app.updatedAt}</span>
          </div>
        </div>
        <div className="generic-hero-thumb">
          <AppThumbnail type={app.thumbnailType} name={app.name} />
        </div>
      </div>

      {/* Interactive Tool Workspace */}
      <div className="generic-workspace-card">
        <div className="workspace-header">
          <div className="workspace-title-box">
            <Sliders size={18} className="workspace-icon" />
            <h3>Interactive Workspace</h3>
          </div>
          <span className="workspace-badge">Live Interactive Session</span>
        </div>

        {/* Dynamic content depending on app type */}
        {app.id === 'stl-inspector' ? (
          <div className="stl-inspector-workspace">
            <div className="stl-stats-grid">
              <div className="stl-stat-card">
                <span className="stl-label">Bounding Dimensions</span>
                <span className="stl-val">124.0 × 86.5 × 42.0 mm</span>
                <span className="stl-sub">Volume: 182.4 cm³</span>
              </div>
              <div className="stl-stat-card">
                <span className="stl-label">Facet Mesh Count</span>
                <span className="stl-val">48,290 Triangles</span>
                <span className="stl-sub">100% Watertight Manifold</span>
              </div>
              <div className="stl-stat-card">
                <span className="stl-label">Calculated Mass ({infillDensity}% Infill)</span>
                <span className="stl-val">
                  {((182.4 * 1.24 * (infillDensity / 100 + 0.15))).toFixed(1)} grams
                </span>
                <span className="stl-sub">Based on PLA density (1.24 g/cm³)</span>
              </div>
            </div>

            <div className="stl-controls-row">
              <div className="slider-box">
                <label>Simulated Infill Density: <strong>{infillDensity}%</strong></label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={infillDensity}
                  onChange={(e) => setInfillDensity(Number(e.target.value))}
                  className="apple-slider"
                />
              </div>

              <div className="slider-box">
                <label>Mesh Scale Factor: <strong>{meshScale}%</strong></label>
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={meshScale}
                  onChange={(e) => setMeshScale(Number(e.target.value))}
                  className="apple-slider"
                />
              </div>
            </div>
          </div>
        ) : app.id === 'spool-manager' ? (
          <div className="spool-manager-workspace">
            <div className="spool-grid">
              {spools.map((spool) => {
                const pct = Math.round((spool.remainingG / spool.totalG) * 100);
                return (
                  <div key={spool.id} className="spool-card-item">
                    <div className="spool-item-top">
                      <span className="spool-color-pip" style={{ backgroundColor: spool.color }} />
                      <span className="spool-item-name">{spool.name}</span>
                    </div>
                    <div className="spool-bar-track">
                      <div 
                        className="spool-bar-fill" 
                        style={{ 
                          width: `${pct}%`,
                          backgroundColor: pct < 20 ? '#ff3b30' : pct < 40 ? '#ff9500' : '#34c759'
                        }} 
                      />
                    </div>
                    <div className="spool-item-footer">
                      <span>{spool.remainingG}g left ({pct}%)</span>
                      <button 
                        type="button" 
                        className="spool-subtract-btn"
                        onClick={() => {
                          setSpools(prev => prev.map(s => s.id === spool.id ? { ...s, remainingG: Math.max(0, s.remainingG - 25) } : s));
                        }}
                      >
                        -25g Job
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="app-default-workspace">
            <div className="default-workspace-box">
              <Box size={36} className="default-box-icon" />
              <h4>{app.name} Core Workspace</h4>
              <p>This application module is actively integrated within the 3D Apps Directory suite.</p>
              <div className="features-checklist">
                {app.features?.map((f, i) => (
                  <div key={i} className="feature-row">
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
