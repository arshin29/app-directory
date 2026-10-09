import React from 'react';
import AppCard from './AppCard';
import './AppGrid.css';

export default function AppGrid({ apps, onSelectDetails, onEditApp }) {
  return (
    <div className="app-grid-container" id="app-grid">
      {apps.map((app) => (
        <AppCard 
          key={app.id} 
          app={app} 
          onSelectDetails={onSelectDetails}
          onEditApp={onEditApp}
        />
      ))}
    </div>
  );
}
