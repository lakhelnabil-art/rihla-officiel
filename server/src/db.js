import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { config } from './config.js'

const dir = path.dirname(config.dbPath)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

export const db = new Database(config.dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS agencies (
    id          TEXT PRIMARY KEY,
    nom         TEXT NOT NULL,
    logo        TEXT,
    is_configured INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_agencies (
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_id  TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    role       TEXT NOT NULL CHECK(role IN ('admin', 'agent')),
    PRIMARY KEY (user_id, agency_id)
  );

  CREATE TABLE IF NOT EXISTS agency_data (
    agency_id  TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    data_key   TEXT NOT NULL,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (agency_id, data_key)
  );

  CREATE TABLE IF NOT EXISTS platform_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gds_connections (
    id              TEXT PRIMARY KEY,
    agency_id       TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL,
    agency_name     TEXT,
    office_id       TEXT,
    pcc             TEXT,
    environment     TEXT NOT NULL DEFAULT 'test',
    endpoint_url    TEXT,
    credentials_enc TEXT NOT NULL DEFAULT '',
    is_active       INTEGER NOT NULL DEFAULT 0,
    last_sync_at    TEXT,
    sync_count      INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'disconnected',
    status_message  TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    UNIQUE(agency_id, provider)
  );

  CREATE TABLE IF NOT EXISTS gds_audit_log (
    id         TEXT PRIMARY KEY,
    agency_id  TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    provider   TEXT,
    action     TEXT NOT NULL,
    user_id    TEXT,
    details    TEXT,
    success    INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gds_pnrs (
    id              TEXT PRIMARY KEY,
    agency_id       TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL,
    record_locator  TEXT NOT NULL,
    status          TEXT,
    passengers_json TEXT NOT NULL DEFAULT '[]',
    itinerary_json  TEXT NOT NULL DEFAULT '[]',
    tickets_json    TEXT NOT NULL DEFAULT '[]',
    ssr_json        TEXT NOT NULL DEFAULT '[]',
    osi_json        TEXT NOT NULL DEFAULT '[]',
    raw_json        TEXT NOT NULL DEFAULT '{}',
    client_id       TEXT,
    reservation_id  TEXT,
    facture_id      TEXT,
    imported_at     TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    UNIQUE(agency_id, provider, record_locator)
  );

  CREATE INDEX IF NOT EXISTS idx_gds_connections_agency ON gds_connections(agency_id);
  CREATE INDEX IF NOT EXISTS idx_gds_pnrs_agency ON gds_pnrs(agency_id);
  CREATE INDEX IF NOT EXISTS idx_gds_audit_agency ON gds_audit_log(agency_id);

  CREATE TABLE IF NOT EXISTS login_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL,
    ip         TEXT,
    success    INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
`)

const pinRow = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get('super_pin')
if (!pinRow) {
  db.prepare('INSERT INTO platform_settings (key, value) VALUES (?, ?)').run('super_pin', '0000')
}

/** Migrations — colonnes plateforme multi-agences */
const agencyCols = db.prepare('PRAGMA table_info(agencies)').all().map(c => c.name)
if (!agencyCols.includes('template_id')) {
  db.exec(`ALTER TABLE agencies ADD COLUMN template_id TEXT DEFAULT 'rihla-demo'`)
}
if (!agencyCols.includes('ville')) {
  db.exec(`ALTER TABLE agencies ADD COLUMN ville TEXT`)
}
if (!agencyCols.includes('is_reference')) {
  db.exec(`ALTER TABLE agencies ADD COLUMN is_reference INTEGER NOT NULL DEFAULT 0`)
}

export const uid = () => `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
