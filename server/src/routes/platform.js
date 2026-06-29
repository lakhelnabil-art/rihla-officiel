import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

router.post('/verify-pin', (req, res) => {
  const { pin } = req.body
  const row = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get('super_pin')
  const expected = row?.value ?? '0000'
  if (pin !== expected) return res.status(401).json({ error: 'PIN incorrect' })
  res.json({ ok: true })
})

router.put('/super-pin', (req, res) => {
  const { currentPin, newPin } = req.body
  const row = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get('super_pin')
  const expected = row?.value ?? '0000'

  if (currentPin !== expected) return res.status(401).json({ error: 'PIN actuel incorrect' })
  if (!newPin || newPin.length < 4) {
    return res.status(400).json({ error: 'Nouveau PIN minimum 4 chiffres' })
  }

  db.prepare(`
    INSERT INTO platform_settings (key, value) VALUES ('super_pin', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(newPin)

  res.json({ ok: true })
})

router.get('/super-pin', (_req, res) => {
  res.json({ configured: true })
})

export default router
