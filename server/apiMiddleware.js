import { 
  getAllApps, 
  getAppById, 
  createApp, 
  updateApp, 
  deleteApp, 
  batchDeleteApps, 
  getDatabaseType,
  getDatabasePath 
} from './db.js';
import { randomUUID } from 'node:crypto';

// ─── Auth token store (in-memory, server-lifetime) ──────────────────────────
const activeSessions = new Set();

function readEnv() {
  // DB.js already loaded .env.local into process.env
  return process.env.ADMIN_PASSWORD || '';
}

function issueToken() {
  const token = randomUUID();
  activeSessions.add(token);
  return token;
}

function revokeToken(token) {
  activeSessions.delete(token);
}

function isValidToken(token) {
  if (!token) return false;
  return activeSessions.has(token);
}

function extractToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

function requireAuth(req, res) {
  const token = extractToken(req);
  if (!isValidToken(token)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unauthorized. Admin authentication required.' }));
    return false;
  }
  return true;
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function sqliteApiMiddleware(req, res, next) {
  const url = req.url || '';

  if (!url.startsWith('/api')) {
    return next();
  }

  const readJsonBody = () => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try { resolve(body ? JSON.parse(body) : {}); }
        catch (err) { reject(err); }
      });
      req.on('error', reject);
    });
  };

  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  const sendError = (statusCode, message) => sendJson(statusCode, { error: message });

  (async () => {
    try {
      const [path] = url.split('?');
      const method = req.method;
      const dbType = getDatabaseType();
      const dbPath = getDatabasePath();

      // ── Auth Routes (no token needed) ──────────────────────────────────────

      // POST /api/auth/login
      if (path === '/api/auth/login' && method === 'POST') {
        const body = await readJsonBody();
        const adminPw = readEnv();
        if (!adminPw) {
          return sendError(500, 'Admin password not configured on server.');
        }
        if (!body.password || body.password !== adminPw) {
          return sendJson(401, { error: 'Incorrect password.' });
        }
        const token = issueToken();
        return sendJson(200, { token, message: 'Authenticated as admin.' });
      }

      // POST /api/auth/logout
      if (path === '/api/auth/logout' && method === 'POST') {
        const token = extractToken(req);
        if (token) revokeToken(token);
        return sendJson(200, { message: 'Logged out.' });
      }

      // GET /api/auth/status
      if (path === '/api/auth/status' && method === 'GET') {
        const token = extractToken(req);
        const authenticated = isValidToken(token);
        return sendJson(200, { authenticated });
      }

      // ── Public Read Routes ──────────────────────────────────────────────────

      // GET /api/health
      if (path === '/api/health' && method === 'GET') {
        const apps = await getAllApps();
        return sendJson(200, {
          status: 'ok',
          database: dbType,
          path: dbPath,
          totalApps: apps.length
        });
      }

      // GET /api/apps
      if (path === '/api/apps' && method === 'GET') {
        const apps = await getAllApps();
        return sendJson(200, {
          apps,
          count: apps.length,
          database: dbType,
          path: dbPath
        });
      }

      // GET /api/apps/:id
      const appDetailMatch = path.match(/^\/api\/apps\/([^/]+)$/);
      if (appDetailMatch && method === 'GET') {
        const appId = decodeURIComponent(appDetailMatch[1]);
        const app = await getAppById(appId);
        if (!app) return sendError(404, 'Application not found');
        return sendJson(200, app);
      }

      // ── Protected Write Routes (require auth) ───────────────────────────────

      // POST /api/apps/batch-delete  (check before /api/apps POST)
      if (path === '/api/apps/batch-delete' && method === 'POST') {
        if (!requireAuth(req, res)) return;
        const body = await readJsonBody();
        const ids = body.ids || [];
        const result = await batchDeleteApps(ids);
        return sendJson(200, result);
      }

      // POST /api/apps
      if (path === '/api/apps' && method === 'POST') {
        if (!requireAuth(req, res)) return;
        const newApp = await readJsonBody();
        if (!newApp.name || !newApp.description) {
          return sendError(400, 'App name and description are required');
        }
        const created = await createApp(newApp);
        return sendJson(201, created);
      }

      // PUT/DELETE /api/apps/:id
      if (appDetailMatch) {
        const appId = decodeURIComponent(appDetailMatch[1]);

        if (method === 'PUT') {
          if (!requireAuth(req, res)) return;
          const updateData = await readJsonBody();
          const existing = await getAppById(appId);
          if (!existing) return sendError(404, 'Application not found');
          const updated = await updateApp(appId, updateData);
          return sendJson(200, updated);
        }

        if (method === 'DELETE') {
          if (!requireAuth(req, res)) return;
          const existing = await getAppById(appId);
          if (!existing) return sendError(404, 'Application not found');
          const result = await deleteApp(appId);
          return sendJson(200, result);
        }
      }

      return next();
    } catch (err) {
      console.error('[Database API Error]:', err);
      return res.statusCode === 200
        ? (() => { res.statusCode = 500; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({ error: err.message || 'Internal error' })); })()
        : undefined;
    }
  })();
}
