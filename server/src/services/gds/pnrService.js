import { db, uid } from '../../db.js'

export const getPnr = (agencyId, provider, recordLocator) =>
  db.prepare(`
    SELECT * FROM gds_pnrs
    WHERE agency_id = ? AND provider = ? AND record_locator = ?
  `).get(agencyId, provider, recordLocator.toUpperCase())

export const getPnrById = (agencyId, id) =>
  db.prepare('SELECT * FROM gds_pnrs WHERE agency_id = ? AND id = ?').get(agencyId, id)

export const listPnrs = (agencyId, { provider, limit = 50, offset = 0 } = {}) => {
  let sql = 'SELECT * FROM gds_pnrs WHERE agency_id = ?'
  const params = [agencyId]
  if (provider) {
    sql += ' AND provider = ?'
    params.push(provider)
  }
  sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  return db.prepare(sql).all(...params).map(parsePnrRow)
}

export const parsePnrRow = (row) => {
  if (!row) return null
  return {
    id: row.id,
    provider: row.provider,
    recordLocator: row.record_locator,
    status: row.status,
    passengers: JSON.parse(row.passengers_json || '[]'),
    segments: JSON.parse(row.itinerary_json || '[]'),
    tickets: JSON.parse(row.tickets_json || '[]'),
    ssr: JSON.parse(row.ssr_json || '[]'),
    osi: JSON.parse(row.osi_json || '[]'),
    clientId: row.client_id,
    reservationId: row.reservation_id,
    factureId: row.facture_id,
    importedAt: row.imported_at,
    updatedAt: row.updated_at,
  }
}

export const upsertPnr = (agencyId, provider, pnr, links = {}) => {
  const now = new Date().toISOString()
  const locator = pnr.recordLocator.toUpperCase()
  const existing = getPnr(agencyId, provider, locator)
  const id = existing?.id ?? uid()

  db.prepare(`
    INSERT INTO gds_pnrs (
      id, agency_id, provider, record_locator, status,
      passengers_json, itinerary_json, tickets_json, ssr_json, osi_json, raw_json,
      client_id, reservation_id, facture_id, imported_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(agency_id, provider, record_locator) DO UPDATE SET
      status = excluded.status,
      passengers_json = excluded.passengers_json,
      itinerary_json = excluded.itinerary_json,
      tickets_json = excluded.tickets_json,
      ssr_json = excluded.ssr_json,
      osi_json = excluded.osi_json,
      raw_json = excluded.raw_json,
      client_id = COALESCE(excluded.client_id, client_id),
      reservation_id = COALESCE(excluded.reservation_id, reservation_id),
      facture_id = COALESCE(excluded.facture_id, facture_id),
      updated_at = excluded.updated_at
  `).run(
    id, agencyId, provider, locator, pnr.status ?? 'UNKNOWN',
    JSON.stringify(pnr.passengers ?? []),
    JSON.stringify(pnr.segments ?? []),
    JSON.stringify(pnr.tickets ?? []),
    JSON.stringify(pnr.ssr ?? []),
    JSON.stringify(pnr.osi ?? []),
    JSON.stringify(pnr.raw ?? {}),
    links.clientId ?? existing?.client_id ?? null,
    links.reservationId ?? existing?.reservation_id ?? null,
    links.factureId ?? existing?.facture_id ?? null,
    existing?.imported_at ?? now,
    now,
  )

  return getPnrById(agencyId, id)
}

export const countPnrs = (agencyId, provider) => {
  let sql = 'SELECT COUNT(*) as n FROM gds_pnrs WHERE agency_id = ?'
  const params = [agencyId]
  if (provider) {
    sql += ' AND provider = ?'
    params.push(provider)
  }
  return db.prepare(sql).get(...params).n
}
