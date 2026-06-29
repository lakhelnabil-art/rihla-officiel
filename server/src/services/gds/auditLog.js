import { db, uid } from '../../db.js'

/** @param {string} agencyId @param {string} action @param {Object} opts */
export const logGdsAudit = (agencyId, action, opts = {}) => {
  const id = uid()
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO gds_audit_log (id, agency_id, provider, action, user_id, details, success, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    agencyId,
    opts.provider ?? null,
    action,
    opts.userId ?? null,
    opts.details ? JSON.stringify(opts.details) : null,
    opts.success === false ? 0 : 1,
    now,
  )
  return id
}

export const getAuditLogs = (agencyId, { limit = 50, provider } = {}) => {
  let sql = `
    SELECT id, provider, action, user_id, details, success, created_at
    FROM gds_audit_log WHERE agency_id = ?
  `
  const params = [agencyId]
  if (provider) {
    sql += ' AND provider = ?'
    params.push(provider)
  }
  sql += ' ORDER BY created_at DESC LIMIT ?'
  params.push(limit)

  return db.prepare(sql).all(...params).map(row => ({
    ...row,
    success: Boolean(row.success),
    details: row.details ? JSON.parse(row.details) : null,
  }))
}
