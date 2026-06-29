import { db } from '../../db.js'

export const getAgencyData = (agencyId, key) => {
  const row = db.prepare(
    'SELECT value FROM agency_data WHERE agency_id = ? AND data_key = ?',
  ).get(agencyId, key)
  if (!row) return null
  try { return JSON.parse(row.value) } catch { return null }
}

export const putAgencyData = (agencyId, key, value) => {
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO agency_data (agency_id, data_key, value, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(agency_id, data_key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(agencyId, key, JSON.stringify(value), now)
  return now
}

export const getAgencyDataArray = (agencyId, key) => getAgencyData(agencyId, key) ?? []
