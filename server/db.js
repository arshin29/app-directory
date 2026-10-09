import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local if present
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = (match[2] || '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
const isNeon = Boolean(DATABASE_URL);
let sql = isNeon ? neon(DATABASE_URL) : null;

// Local SQLite fallback
const DB_DIR = path.resolve(__dirname, '../database');
const DB_PATH = path.join(DB_DIR, 'apps.db');
let sqliteInstance = null;

if (!isNeon) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function getDatabaseType() {
  return isNeon ? 'Neon Postgres' : 'SQLite';
}

export function getDatabasePath() {
  return isNeon ? 'Neon Cloud (empty-recipe-69199399 / production)' : DB_PATH;
}

export function mapRowToApp(row) {
  if (!row) return null;
  let features = [];
  try {
    features = row.features ? (typeof row.features === 'string' ? JSON.parse(row.features) : row.features) : [];
  } catch {
    features = [];
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    status: row.status,
    tech: row.tech,
    version: row.version,
    route: row.route,
    externalUrl: row.external_url,
    githubUrl: row.github_url,
    vercelUrl: row.vercel_url,
    thumbnailType: row.thumbnail_type,
    features,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function initNeonSchema() {
  if (!sql) return;
  await sql.query(`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      tech TEXT,
      version TEXT DEFAULT 'v1.0',
      route TEXT,
      external_url TEXT,
      github_url TEXT,
      vercel_url TEXT,
      thumbnail_type TEXT DEFAULT 'stl',
      features TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_apps_category ON apps (category)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_apps_status ON apps (status)`);
}

function initSqliteSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      tech TEXT,
      version TEXT DEFAULT 'v1.0',
      route TEXT,
      external_url TEXT,
      github_url TEXT,
      vercel_url TEXT,
      thumbnail_type TEXT DEFAULT 'stl',
      features TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_apps_category ON apps (category);
    CREATE INDEX IF NOT EXISTS idx_apps_status ON apps (status);
  `);
}

function getSqliteDb() {
  if (!sqliteInstance) {
    sqliteInstance = new DatabaseSync(DB_PATH);
    initSqliteSchema(sqliteInstance);
  }
  return sqliteInstance;
}

export async function getAllApps() {
  if (isNeon) {
    await initNeonSchema();
    const rows = await sql.query('SELECT * FROM apps ORDER BY created_at DESC');
    return rows.map(mapRowToApp);
  }
  const db = getSqliteDb();
  const stmt = db.prepare('SELECT * FROM apps ORDER BY created_at DESC');
  return stmt.all().map(mapRowToApp);
}

export async function getAppById(id) {
  if (isNeon) {
    await initNeonSchema();
    const rows = await sql.query('SELECT * FROM apps WHERE id = $1', [id]);
    return rows.length > 0 ? mapRowToApp(rows[0]) : null;
  }
  const db = getSqliteDb();
  const stmt = db.prepare('SELECT * FROM apps WHERE id = ?');
  return mapRowToApp(stmt.get(id));
}

export async function createApp(app) {
  const featuresJson = JSON.stringify(app.features || []);
  const updatedAt = app.updatedAt || new Date().toISOString().slice(0, 10);
  const createdAt = app.createdAt || new Date().toISOString();

  // Auto-generate a slug ID if none provided
  if (!app.id) {
    app = {
      ...app,
      id: app.name
        ? app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) + '-' + randomUUID().slice(0, 6)
        : randomUUID()
    };
  }

  if (isNeon) {
    await initNeonSchema();
    await sql.query(`
      INSERT INTO apps (
        id, name, description, category, status, tech, version,
        route, external_url, github_url, vercel_url, thumbnail_type,
        features, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        tech = EXCLUDED.tech,
        version = EXCLUDED.version,
        route = EXCLUDED.route,
        external_url = EXCLUDED.external_url,
        github_url = EXCLUDED.github_url,
        vercel_url = EXCLUDED.vercel_url,
        thumbnail_type = EXCLUDED.thumbnail_type,
        features = EXCLUDED.features,
        updated_at = EXCLUDED.updated_at
    `, [
      app.id,
      app.name,
      app.description,
      app.category,
      app.status || 'Ready',
      app.tech || 'Custom',
      app.version || 'v1.0',
      app.route || `/apps/${app.id}`,
      app.externalUrl || null,
      app.githubUrl || null,
      app.vercelUrl || null,
      app.thumbnailType || 'stl',
      featuresJson,
      createdAt,
      updatedAt
    ]);
    return await getAppById(app.id);
  }

  const db = getSqliteDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO apps (
      id, name, description, category, status, tech, version,
      route, external_url, github_url, vercel_url, thumbnail_type,
      features, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  stmt.run(
    app.id,
    app.name,
    app.description,
    app.category,
    app.status || 'Ready',
    app.tech || 'Custom',
    app.version || 'v1.0',
    app.route || `/apps/${app.id}`,
    app.externalUrl || null,
    app.githubUrl || null,
    app.vercelUrl || null,
    app.thumbnailType || 'stl',
    featuresJson,
    createdAt,
    updatedAt
  );

  return await getAppById(app.id);
}

export async function updateApp(id, app) {
  const featuresJson = JSON.stringify(app.features || []);
  const updatedAt = app.updatedAt || new Date().toISOString().slice(0, 10);

  if (isNeon) {
    await initNeonSchema();
    await sql.query(`
      UPDATE apps SET
        name = $1,
        description = $2,
        category = $3,
        status = $4,
        tech = $5,
        version = $6,
        route = $7,
        external_url = $8,
        github_url = $9,
        vercel_url = $10,
        thumbnail_type = $11,
        features = $12,
        updated_at = $13
      WHERE id = $14
    `, [
      app.name,
      app.description,
      app.category,
      app.status || 'Ready',
      app.tech || 'Custom',
      app.version || 'v1.0',
      app.route || `/apps/${id}`,
      app.externalUrl || null,
      app.githubUrl || null,
      app.vercelUrl || null,
      app.thumbnailType || 'stl',
      featuresJson,
      updatedAt,
      id
    ]);
    return await getAppById(id);
  }

  const db = getSqliteDb();
  const stmt = db.prepare(`
    UPDATE apps SET
      name = ?,
      description = ?,
      category = ?,
      status = ?,
      tech = ?,
      version = ?,
      route = ?,
      external_url = ?,
      github_url = ?,
      vercel_url = ?,
      thumbnail_type = ?,
      features = ?,
      updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    app.name,
    app.description,
    app.category,
    app.status || 'Ready',
    app.tech || 'Custom',
    app.version || 'v1.0',
    app.route || `/apps/${id}`,
    app.externalUrl || null,
    app.githubUrl || null,
    app.vercelUrl || null,
    app.thumbnailType || 'stl',
    featuresJson,
    updatedAt,
    id
  );

  return await getAppById(id);
}

export async function deleteApp(id) {
  if (isNeon) {
    await initNeonSchema();
    await sql.query('DELETE FROM apps WHERE id = $1', [id]);
    return { success: true, id };
  }
  const db = getSqliteDb();
  const stmt = db.prepare('DELETE FROM apps WHERE id = ?');
  stmt.run(id);
  return { success: true, id };
}

export async function batchDeleteApps(ids) {
  if (!ids || ids.length === 0) return { success: true, count: 0 };

  if (isNeon) {
    await initNeonSchema();
    await sql.query('DELETE FROM apps WHERE id = ANY($1::text[])', [ids]);
    return { success: true, count: ids.length, deletedIds: ids };
  }

  const db = getSqliteDb();
  db.exec('BEGIN TRANSACTION');
  try {
    const stmt = db.prepare('DELETE FROM apps WHERE id = ?');
    for (const id of ids) {
      stmt.run(id);
    }
    db.exec('COMMIT');
    return { success: true, count: ids.length, deletedIds: ids };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export async function seedDefaultsIfEmpty(defaultApps) {
  if (!Array.isArray(defaultApps) || defaultApps.length === 0) return;

  if (isNeon) {
    await initNeonSchema();
    const rows = await sql.query('SELECT COUNT(*) as count FROM apps');
    const count = parseInt(rows[0].count, 10);
    if (count === 0) {
      console.log(`[Neon Postgres] Seeding ${defaultApps.length} default applications into Neon...`);
      for (const app of defaultApps) {
        await createApp(app);
      }
      console.log(`[Neon Postgres] Successfully seeded database.`);
    }
    return;
  }

  const db = getSqliteDb();
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM apps');
  const result = countStmt.get();
  if (result.count === 0) {
    for (const app of defaultApps) {
      createApp(app);
    }
  }
}

export async function resetDatabase(defaultApps) {
  if (isNeon) {
    await initNeonSchema();
    await sql.query('DELETE FROM apps');
    if (Array.isArray(defaultApps) && defaultApps.length > 0) {
      for (const app of defaultApps) {
        await createApp(app);
      }
    }
    return await getAllApps();
  }

  const db = getSqliteDb();
  db.exec('DELETE FROM apps');
  if (Array.isArray(defaultApps) && defaultApps.length > 0) {
    for (const app of defaultApps) {
      createApp(app);
    }
  }
  return await getAllApps();
}
