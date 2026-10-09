import { appsData as defaultApps } from '../data/appsData';

const STORAGE_KEY = '3d_apps_directory_data_v2';

export function getStoredApps() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((app) => {
          const defaultMatch = defaultApps.find((d) => d.id === app.id);
          if (defaultMatch) {
            return {
              ...defaultMatch,
              ...app,
              githubUrl: app.githubUrl || defaultMatch.githubUrl,
              vercelUrl: app.vercelUrl || defaultMatch.vercelUrl
            };
          }
          return app;
        });
      }
    }
  } catch (err) {
    console.error('Failed to load apps from localStorage', err);
  }
  return defaultApps;
}

export function saveStoredApps(apps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save apps to localStorage', err);
  }
}

export function resetStoredApps() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('3d_apps_directory_data_v1');
  } catch (err) {
    console.error('Failed to reset apps in localStorage', err);
  }
  return defaultApps;
}
