import React from 'react';
import './AppThumbnail.css';

// Generates a 1–2 letter monogram from the app name
function getMonogram(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Pick a subtle pastel hue from the name (deterministic)
function getHue(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h % 360;
}

export default function AppThumbnail({ name }) {
  const monogram = getMonogram(name);
  const hue = getHue(name);

  return (
    <div
      className="app-thumbnail-wrapper"
      aria-label={`Icon for ${name}`}
      style={{
        background: `hsl(${hue}, 60%, 94%)`,
        color: `hsl(${hue}, 55%, 35%)`
      }}
    >
      <span className="app-thumbnail-monogram">{monogram}</span>
    </div>
  );
}
