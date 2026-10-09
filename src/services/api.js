import { getStoredApps, saveStoredApps } from '../utils/appStorage';

const API_BASE = '/api';
const SESSION_KEY = 'apps_admin_token';

function getAuthHeaders() {
  const token = sessionStorage.getItem(SESSION_KEY) || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const api = {
  // Check health and database status
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[API] Health check failed', err);
    }
    return { status: 'fallback', database: 'Local Cache' };
  },

  // Fetch all apps — public
  async getApps() {
    try {
      const res = await fetch(`${API_BASE}/apps`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.apps)) {
          saveStoredApps(data.apps);
          return {
            apps: data.apps,
            isDatabase: true,
            path: data.path,
            database: data.database || 'Neon Postgres'
          };
        }
      }
    } catch (err) {
      console.warn('[API] Failed to fetch apps, using local fallback:', err);
    }
    const local = getStoredApps();
    return { apps: local, isDatabase: false, path: 'Local Cache', database: 'Local Cache' };
  },

  // Create a new app — requires auth
  async createApp(appData) {
    const res = await fetch(`${API_BASE}/apps`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appData)
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to create app');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  // Update an existing app — requires auth
  async updateApp(id, appData) {
    const res = await fetch(`${API_BASE}/apps/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(appData)
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to update app');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  // Delete a single app — requires auth
  async deleteApp(id) {
    const res = await fetch(`${API_BASE}/apps/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to delete app');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  // Batch delete — requires auth
  async batchDeleteApps(ids) {
    const res = await fetch(`${API_BASE}/apps/batch-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids })
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to delete apps');
      err.status = res.status;
      throw err;
    }
    return data;
  }
};
