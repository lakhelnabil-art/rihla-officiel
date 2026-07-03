import { Router } from 'express'
import bcrypt from 'bcryptjs'
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

/** List all users (super-admin only, verified by PIN). */
router.post('/users', (req, res) => {
  const { pin } = req.body
  const row = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get('super_pin')
  const expected = row?.value ?? '0000'
  if (pin !== expected) return res.status(401).json({ error: 'PIN incorrect' })

  const users = db.prepare(`
    SELECT u.id, u.email, u.name,
           GROUP_CONCAT(a.nom, ', ') AS agences
    FROM users u
    LEFT JOIN user_agencies ua ON ua.user_id = u.id
    LEFT JOIN agencies a ON a.id = ua.agency_id
    GROUP BY u.id
    ORDER BY u.email ASC
  `).all()

  res.json(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    agences: u.agences || '',
  })))
})

/** Reset a user's password (super-admin only, verified by PIN). */
router.post('/reset-password', async (req, res) => {
  try {
    const { pin, userId, newPassword } = req.body
    const row = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get('super_pin')
    const expected = row?.value ?? '0000'
    if (pin !== expected) return res.status(401).json({ error: 'PIN incorrect' })

    if (!userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Utilisateur et nouveau mot de passe (6+ car.) requis' })
    }

    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId)
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' })

    const hash = await bcrypt.hash(newPassword, 10)
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId)

    res.json({ ok: true, email: user.email })
  } catch (err) {
    console.error('[reset-password]', err)
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' })
  }
})

export default router
