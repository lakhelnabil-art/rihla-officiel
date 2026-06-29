import { db } from '../../db.js'
import { countPnrs, listPnrs } from './pnrService.js'
import { getActiveConnection, listConnections } from './connectionService.js'

const periodStart = (period) => {
  const now = new Date()
  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return d.toISOString()
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    case 'year':
      return new Date(now.getFullYear(), 0, 1).toISOString()
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  }
}

export const getDashboardStats = (agencyId, { period = 'month', provider } = {}) => {
  const since = periodStart(period)
  const active = getActiveConnection(agencyId)
  const connections = listConnections(agencyId)

  let sql = `
    SELECT record_locator, status, tickets_json, itinerary_json, updated_at
    FROM gds_pnrs WHERE agency_id = ? AND updated_at >= ?
  `
  const params = [agencyId, since]
  if (provider) {
    sql += ' AND provider = ?'
    params.push(provider)
  }

  const rows = db.prepare(sql).all(...params)
  const pnrs = rows.map(r => ({
    recordLocator: r.record_locator,
    status: r.status,
    tickets: JSON.parse(r.tickets_json || '[]'),
    segments: JSON.parse(r.itinerary_json || '[]'),
    updatedAt: r.updated_at,
  }))

  const ticketsIssued = pnrs.reduce((n, p) => n + (p.tickets?.length ?? 0), 0)
  const revenue = pnrs.reduce((s, p) =>
    s + (p.tickets?.reduce((ts, t) => ts + (t.total || 0), 0) ?? 0), 0)
  const commissions = pnrs.reduce((s, p) =>
    s + (p.tickets?.reduce((ts, t) => ts + (t.commission || 0), 0) ?? 0), 0)

  const destCount = {}
  const carrierCount = {}
  for (const p of pnrs) {
    for (const seg of p.segments ?? []) {
      destCount[seg.destination] = (destCount[seg.destination] ?? 0) + 1
      carrierCount[seg.carrier] = (carrierCount[seg.carrier] ?? 0) + 1
    }
  }

  const topDestinations = Object.entries(destCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([code, count]) => ({ code, count }))

  const topCarriers = Object.entries(carrierCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([code, count]) => ({ code, count }))

  return {
    period,
    activeProvider: active?.provider ?? null,
    connections: connections.map(c => ({
      provider: c.provider,
      isActive: Boolean(c.is_active),
      status: c.status,
      lastSyncAt: c.last_sync_at,
      syncCount: c.sync_count,
    })),
    reservations: pnrs.length,
    ticketsIssued,
    revenue,
    commissions,
    topDestinations,
    topCarriers,
    totalPnrs: countPnrs(agencyId, provider),
    recentPnrs: listPnrs(agencyId, { provider, limit: 10 }),
  }
}
