import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { listTemplates } from '../templates/agencyTemplates.js'
import { seedAgencyFromTemplate } from '../seed.js'
import { db, uid } from '../db.js'
import { rejectIfBanned } from '../utils/bannedCountries.js'

const router = Router()

const userAgencies = db.prepare(`
  SELECT a.id, a.nom, a.logo, a.is_configured, a.created_at, a.template_id, a.ville, a.is_reference, ua.role
  FROM user_agencies ua
  JOIN agencies a ON a.id = ua.agency_id
  WHERE ua.user_id = ?
  ORDER BY a.created_at DESC
`)

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

const parseAgencyInput = (body) => {
  const {
    nom, logo, templateId, withDemo,
    ville, pays, paysCode, paysLibre, adresse, telephone, email, siteWeb,
    iceNumber, patente, rc, if: ifNum, cnss, devise,
  } = body

  const config = {
    ville: ville?.trim() || '',
    pays: pays?.trim() || '',
    paysCode: paysCode?.trim() || '',
    paysLibre: paysLibre?.trim() || '',
    adresse: adresse?.trim() || '',
    telephone: telephone?.trim() || '',
    email: email?.trim() || '',
    siteWeb: siteWeb?.trim() || '',
    iceNumber: iceNumber?.trim() || '',
    patente: patente?.trim() || '',
    rc: rc?.trim() || '',
    if: ifNum?.trim() || '',
    cnss: cnss?.trim() || '',
    devise: devise || 'MAD',
    logo: logo || null,
  }

  return {
    nom: nom?.trim(),
    logo: logo || null,
    templateId: templateId || 'rihla-demo',
    withDemo: withDemo !== false,
    config,
  }
}

router.get('/', authMiddleware, (req, res) => {
  const agencies = userAgencies.all(req.user.sub).map(formatAgency)
  res.json(agencies)
})

/** Modèles disponibles pour créer une agence */
router.get('/templates/list', authMiddleware, (_req, res) => {
  res.json({ templates: listTemplates() })
})

/** Créer une agence rattachée au compte connecté */
router.post('/', authMiddleware, (req, res) => {
  const { nom, logo, templateId, withDemo, config } = parseAgencyInput(req.body)
  if (!nom) return res.status(400).json({ error: "Nom de l'agence requis" })
  if (rejectIfBanned(res, config?.pays, config?.paysLibre, config?.paysCode)) return

  const agencyId = `ag-${Date.now()}`
  const now = new Date().toISOString()
  const tpl = templateId || 'rihla-demo'
  const isRef = tpl === 'bab-annaser' ? 1 : 0

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO agencies (id, nom, logo, is_configured, created_at, template_id, ville, is_reference)
      VALUES (?, ?, ?, 0, ?, ?, ?, ?)
    `).run(agencyId, nom, logo || null, now, tpl, config.ville || null, isRef)

    db.prepare(`
      INSERT INTO user_agencies (user_id, agency_id, role)
      VALUES (?, ?, 'admin')
    `).run(req.user.sub, agencyId)
  })
  tx()

  const shouldSeed = tpl === 'vide' ? false : withDemo
  if (shouldSeed) seedAgencyFromTemplate(agencyId, tpl, nom, config)

  const row = userAgencies.all(req.user.sub).find(a => a.id === agencyId)
  res.status(201).json(formatAgency(row))
})

router.patch('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const link = db.prepare(
    'SELECT role FROM user_agencies WHERE user_id = ? AND agency_id = ?',
  ).get(req.user.sub, id)

  if (!link) return res.status(403).json({ error: 'Accès refusé' })
  if (link.role !== 'admin') return res.status(403).json({ error: 'Administrateur requis' })

  const { nom, logo, isConfigured, ville, templateId } = req.body
  const agency = db.prepare('SELECT * FROM agencies WHERE id = ?').get(id)
  if (!agency) return res.status(404).json({ error: 'Agence introuvable' })

  db.prepare(`
    UPDATE agencies SET nom = ?, logo = ?, is_configured = ?, ville = ?, template_id = ?
    WHERE id = ?
  `).run(
    nom ?? agency.nom,
    logo !== undefined ? logo : agency.logo,
    isConfigured !== undefined ? (isConfigured ? 1 : 0) : agency.is_configured,
    ville !== undefined ? ville : agency.ville,
    templateId ?? agency.template_id,
    id,
  )

  const updated = db.prepare('SELECT * FROM agencies WHERE id = ?').get(id)
  res.json(formatAgency({ ...updated, role: link.role }))
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params

  const link = db.prepare(
    'SELECT role FROM user_agencies WHERE user_id = ? AND agency_id = ?',
  ).get(req.user.sub, id)

  if (!link || link.role !== 'admin') {
    return res.status(403).json({ error: 'Administrateur requis' })
  }

  db.prepare('DELETE FROM agencies WHERE id = ?').run(id)
  res.json({ ok: true })
})

export default router
