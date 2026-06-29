import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, agencyMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()

const VALID_KEYS = new Set([
  'agency_clients', 'agency_reservations', 'agency_agents', 'agency_products',
  'agency_finances', 'agency_suppliers', 'agency_hotels', 'agency_devis',
  'agency_factures', 'agency_calendar', 'agency_settings', 'agency_documents',
  'agency_internal_docs', 'agency_derogations', 'agency_initialized',
])

router.use(authMiddleware, agencyMiddleware)

/** GET all data keys for the agency. */
router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT data_key, value FROM agency_data WHERE agency_id = ?',
  ).all(req.user.agencyId)

  const data = {}
  for (const row of rows) {
    try {
      data[row.data_key] = JSON.parse(row.value)
    } catch {
      data[row.data_key] = null
    }
  }
  res.json(data)
})

router.get('/:key', (req, res) => {
  const { key } = req.params
  if (!VALID_KEYS.has(key)) return res.status(400).json({ error: 'Clé invalide' })

  const row = db.prepare(
    'SELECT value FROM agency_data WHERE agency_id = ? AND data_key = ?',
  ).get(req.user.agencyId, key)

  if (!row) return res.status(404).json({ error: 'Données introuvables' })
  res.json(JSON.parse(row.value))
})

router.put('/:key', (req, res) => {
  const { key } = req.params
  if (!VALID_KEYS.has(key)) return res.status(400).json({ error: 'Clé invalide' })

  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO agency_data (agency_id, data_key, value, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(agency_id, data_key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(req.user.agencyId, key, JSON.stringify(req.body), now)

  res.json({ ok: true, key, updatedAt: now })
})

/** Bulk replace all agency data (import / migration). */
router.post('/bulk', adminMiddleware, (req, res) => {
  const payload = req.body
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Corps JSON invalide' })
  }

  const now = new Date().toISOString()
  const upsert = db.prepare(`
    INSERT INTO agency_data (agency_id, data_key, value, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(agency_id, data_key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `)

  const tx = db.transaction(() => {
    for (const [key, val] of Object.entries(payload)) {
      if (!VALID_KEYS.has(key)) continue
      upsert.run(req.user.agencyId, key, JSON.stringify(val), now)
    }
  })
  tx()

  res.json({ ok: true })
})

/** Clear all data keys for agency. */
router.delete('/', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM agency_data WHERE agency_id = ?').run(req.user.agencyId)
  res.json({ ok: true })
})

export default router
