import { db, uid } from '../../db.js'
import { encryptCredentials, decryptCredentials, maskSecret } from './crypto.js'

export const getConnection = (agencyId, provider) =>
  db.prepare(`
    SELECT * FROM gds_connections WHERE agency_id = ? AND provider = ?
  `).get(agencyId, provider)

export const getActiveConnection = (agencyId) =>
  db.prepare(`
    SELECT * FROM gds_connections WHERE agency_id = ? AND is_active = 1 LIMIT 1
  `).get(agencyId)

export const listConnections = (agencyId) =>
  db.prepare(`
    SELECT id, agency_id, provider, agency_name, office_id, pcc, environment,
           endpoint_url, is_active, last_sync_at, sync_count, status, status_message,
           created_at, updated_at
    FROM gds_connections WHERE agency_id = ?
  `).all(agencyId)

/** Public-safe connection view (no credentials). */
export const toPublicConnection = (row) => {
  if (!row) return null
  return {
    id: row.id,
    provider: row.provider,
    agencyName: row.agency_name,
    officeId: row.office_id,
    pcc: row.pcc,
    environment: row.environment,
    endpointUrl: row.endpoint_url,
    isActive: Boolean(row.is_active),
    lastSyncAt: row.last_sync_at,
    syncCount: row.sync_count ?? 0,
    status: row.status,
    statusMessage: row.status_message,
    updatedAt: row.updated_at,
  }
}

export const getDecryptedCredentials = (agencyId, row) => {
  if (!row?.credentials_enc) return {}
  try {
    return decryptCredentials(agencyId, row.credentials_enc)
  } catch {
    return {}
  }
}

export const getConfigWithMaskedSecrets = (agencyId, provider) => {
  const row = getConnection(agencyId, provider)
  if (!row) return null
  const creds = getDecryptedCredentials(agencyId, row)
  return {
    ...toPublicConnection(row),
    credentials: {
      apiKey: maskSecret(creds.apiKey),
      apiSecret: maskSecret(creds.apiSecret),
      username: creds.username || '',
      password: maskSecret(creds.password),
      hasApiKey: Boolean(creds.apiKey),
      hasApiSecret: Boolean(creds.apiSecret),
      hasPassword: Boolean(creds.password),
    },
  }
}

export const upsertConnection = (agencyId, provider, payload) => {
  const now = new Date().toISOString()
  const existing = getConnection(agencyId, provider)
  const creds = {
    apiKey: payload.apiKey ?? '',
    apiSecret: payload.apiSecret ?? '',
    username: payload.username ?? '',
    password: payload.password ?? '',
  }

  if (existing) {
    const prev = getDecryptedCredentials(agencyId, existing)
    if (!payload.apiKey && prev.apiKey) creds.apiKey = prev.apiKey
    if (!payload.apiSecret && prev.apiSecret) creds.apiSecret = prev.apiSecret
    if (!payload.password && prev.password) creds.password = prev.password
  }

  const enc = encryptCredentials(agencyId, creds)
  const id = existing?.id ?? uid()

  db.prepare(`
    INSERT INTO gds_connections (
      id, agency_id, provider, agency_name, office_id, pcc, environment,
      endpoint_url, credentials_enc, is_active, status, status_message,
      last_sync_at, sync_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(agency_id, provider) DO UPDATE SET
      agency_name = excluded.agency_name,
      office_id = excluded.office_id,
      pcc = excluded.pcc,
      environment = excluded.environment,
      endpoint_url = excluded.endpoint_url,
      credentials_enc = excluded.credentials_enc,
      status = excluded.status,
      status_message = excluded.status_message,
      updated_at = excluded.updated_at
  `).run(
    id, agencyId, provider,
    payload.agencyName ?? '',
    payload.officeId ?? '',
    payload.pcc ?? '',
    payload.environment ?? 'test',
    payload.endpointUrl ?? '',
    enc,
    existing?.is_active ?? 0,
    payload.status ?? 'disconnected',
    payload.statusMessage ?? null,
    existing?.last_sync_at ?? null,
    existing?.sync_count ?? 0,
    existing?.created_at ?? now,
    now,
  )

  return getConnection(agencyId, provider)
}

export const setConnectionActive = (agencyId, provider, active) => {
  const now = new Date().toISOString()
  if (active) {
    db.prepare('UPDATE gds_connections SET is_active = 0 WHERE agency_id = ?').run(agencyId)
  }
  db.prepare(`
    UPDATE gds_connections
    SET is_active = ?, status = ?, updated_at = ?
    WHERE agency_id = ? AND provider = ?
  `).run(active ? 1 : 0, active ? 'connected' : 'disconnected', now, agencyId, provider)
}

export const updateConnectionStatus = (agencyId, provider, status, message) => {
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE gds_connections
    SET status = ?, status_message = ?, updated_at = ?
    WHERE agency_id = ? AND provider = ?
  `).run(status, message ?? null, now, agencyId, provider)
}

export const incrementSyncCount = (agencyId, provider) => {
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE gds_connections
    SET sync_count = sync_count + 1, last_sync_at = ?, updated_at = ?
    WHERE agency_id = ? AND provider = ?
  `).run(now, now, agencyId, provider)
}

export const deactivateAllConnections = (agencyId) => {
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE gds_connections SET is_active = 0, status = 'disconnected', updated_at = ?
    WHERE agency_id = ?
  `).run(now, agencyId)
}
