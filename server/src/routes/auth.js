import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db, uid } from '../db.js'
import { signToken, authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { seedAgencyFromTemplate } from '../seed.js'
import { rejectIfBanned } from '../utils/bannedCountries.js'

const router = Router()

const userAgencies = db.prepare(`
  SELECT a.id, a.nom, a.logo, a.is_configured, a.created_at, a.template_id, a.ville, a.is_reference, ua.role
  FROM user_agencies ua
  JOIN agencies a ON a.id = ua.agency_id
  WHERE ua.user_id = ?
  ORDER BY a.created_at DESC
`)

const formatUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
})

const formatAgency = (row) => ({
  id: row.id,
  nom: row.nom,
  logo: row.logo,
  isConfigured: !!row.is_configured,
  createdAt: row.created_at,
  templateId: row.template_id || 'rihla-demo',
  ville: row.ville || '',
  isReference: !!row.is_reference,
  role: row.role,
})

/** Create agency + admin account (or link existing email). */
router.post('/register-agency', async (req, res) => {
  try {
    const { nom, adminEmail, adminPassword, adminName, logo, withDemo, templateId,
      ville, pays, paysCode, paysLibre, adresse, telephone, email: agencyEmail, siteWeb, iceNumber } = req.body
    if (!nom?.trim()) return res.status(400).json({ error: "Nom de l'agence requis" })
    if (!adminEmail?.trim()) return res.status(400).json({ error: 'Email administrateur requis' })
    if (!adminPassword || adminPassword.length < 6) {
      return res.status(400).json({ error: 'Mot de passe minimum 6 caractères' })
    }
    if (rejectIfBanned(res, pays, paysLibre, paysCode)) return

    const email = adminEmail.trim().toLowerCase()
    const agencyId = `ag-${Date.now()}`
    const now = new Date().toISOString()
    const hash = await bcrypt.hash(adminPassword, 10)

    let userId
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

    if (existing) {
      const ok = await bcrypt.compare(adminPassword, existing.password_hash)
      if (!ok) return res.status(401).json({ error: 'Identifiants incorrects' })
      userId = existing.id
    }

    const tpl = templateId || 'rihla-demo'
    const config = {
      ville: ville?.trim() || '',
      pays: pays?.trim() || '',
      paysCode: paysCode?.trim() || '',
      paysLibre: paysLibre?.trim() || '',
      adresse: adresse?.trim() || '',
      telephone: telephone?.trim() || '',
      email: agencyEmail?.trim() || '',
      siteWeb: siteWeb?.trim() || '',
      iceNumber: iceNumber?.trim() || '',
      logo: logo || null,
    }

    const tx = db.transaction(() => {
      if (!existing) {
        userId = uid()
        db.prepare(`
          INSERT INTO users (id, email, password_hash, name, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(userId, email, hash, adminName?.trim() || 'Administrateur', now)
      }

      db.prepare(`
        INSERT INTO agencies (id, nom, logo, is_configured, created_at, template_id, ville, is_reference)
        VALUES (?, ?, ?, 0, ?, ?, ?, ?)
      `).run(agencyId, nom.trim(), logo || null, now, tpl, config.ville || null, tpl === 'bab-annaser' ? 1 : 0)

      db.prepare(`
        INSERT INTO user_agencies (user_id, agency_id, role)
        VALUES (?, ?, 'admin')
      `).run(userId, agencyId)
    })
    tx()

    if (tpl !== 'vide' && withDemo !== false) {
      seedAgencyFromTemplate(agencyId, tpl, nom.trim(), config)
    }

    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId)
    const agencies = userAgencies.all(userId).map(formatAgency)

    const token = signToken({
      sub: user.id,
      email: user.email,
      type: 'platform',
    })

    res.status(201).json({
      token,
      user: formatUser(user),
      agencies,
      agency: agencies.find(a => a.id === agencyId),
    })
  } catch (err) {
    console.error('[register-agency]', err)
    res.status(500).json({ error: 'Erreur lors de la création' })
  }
})

/** Login — returns platform token + agency list. */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase())
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Identifiants incorrects' })

    const agencies = userAgencies.all(user.id).map(formatAgency)
    const token = signToken({
      sub: user.id,
      email: user.email,
      type: 'platform',
    })

    res.json({
      token,
      user: formatUser(user),
      agencies,
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ error: 'Erreur de connexion' })
  }
})

/** Exchange platform token for agency-scoped token. */
router.post('/select-agency', authMiddleware, (req, res) => {
  const { agencyId } = req.body
  if (!agencyId) return res.status(400).json({ error: 'agencyId requis' })

  const link = db.prepare(`
    SELECT ua.role, a.nom, a.logo, a.is_configured, a.created_at
    FROM user_agencies ua
    JOIN agencies a ON a.id = ua.agency_id
    WHERE ua.user_id = ? AND ua.agency_id = ?
  `).get(req.user.sub, agencyId)

  if (!link) return res.status(403).json({ error: 'Accès à cette agence refusé' })

  const token = signToken({
    sub: req.user.sub,
    email: req.user.email,
    agencyId,
    role: link.role,
    type: 'agency',
  })

  res.json({
    token,
    agency: {
      id: agencyId,
      nom: link.nom,
      logo: link.logo,
      isConfigured: !!link.is_configured,
      createdAt: link.created_at,
      role: link.role,
    },
    role: link.role,
  })
})

/** Current user profile + agencies. */
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user.sub)
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' })

  const agencies = userAgencies.all(user.id).map(formatAgency)

  let agency = null
  if (req.user.type === 'agency' && req.user.agencyId) {
    agency = agencies.find(a => a.id === req.user.agencyId) ?? null
  }

  res.json({
    user: formatUser(user),
    agencies,
    agency,
    role: req.user.role ?? agency?.role ?? null,
    agencyId: req.user.agencyId ?? null,
  })
})

/** Return to platform-level token (leave agency context). */
router.post('/leave-agency', authMiddleware, (req, res) => {
  const token = signToken({
    sub: req.user.sub,
    email: req.user.email,
    type: 'platform',
  })
  res.json({ token })
})

/** Admin creates an agent login for the current agency. */
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, password, name, role = 'agent' } = req.body
    const agencyId = req.user.agencyId

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Email et mot de passe (6+ car.) requis' })
    }
    if (!['admin', 'agent'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' })
    }

    const normalized = email.trim().toLowerCase()
    const hash = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()

    let userId
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized)

    const tx = db.transaction(() => {
      if (existing) {
        userId = existing.id
        const already = db.prepare(
          'SELECT 1 FROM user_agencies WHERE user_id = ? AND agency_id = ?',
        ).get(userId, agencyId)
        if (already) throw new Error('DUPLICATE')
      } else {
        userId = uid()
        db.prepare(`
          INSERT INTO users (id, email, password_hash, name, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(userId, normalized, hash, name?.trim() || normalized, now)
      }

      db.prepare(`
        INSERT INTO user_agencies (user_id, agency_id, role)
        VALUES (?, ?, ?)
      `).run(userId, agencyId, role)
    })

    try {
      tx()
    } catch (e) {
      if (e.message === 'DUPLICATE') {
        return res.status(409).json({ error: 'Cet utilisateur a déjà accès à cette agence' })
      }
      throw e
    }

    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId)
    res.status(201).json({ user: { ...formatUser(user), role } })
  } catch (err) {
    console.error('[create-user]', err)
    res.status(500).json({ error: 'Erreur lors de la création du compte' })
  }
})

export default router
