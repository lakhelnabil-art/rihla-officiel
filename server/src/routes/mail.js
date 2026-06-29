import { Router } from 'express'
import { authMiddleware, agencyMiddleware } from '../middleware/auth.js'
import { db } from '../db.js'
import { sendDevisEmail, buildDevisMailto, isMailConfigured } from '../mail.js'

const router = Router()

router.use(authMiddleware, agencyMiddleware)

router.get('/status', (_req, res) => {
  res.json({ smtpConfigured: isMailConfigured() })
})

router.post('/devis', async (req, res) => {
  try {
    const { devisId, to } = req.body
    if (!devisId) return res.status(400).json({ error: 'devisId requis' })

    const row = db.prepare(
      'SELECT value FROM agency_data WHERE agency_id = ? AND data_key = ?',
    ).get(req.user.agencyId, 'agency_devis')
    const settingsRow = db.prepare(
      'SELECT value FROM agency_data WHERE agency_id = ? AND data_key = ?',
    ).get(req.user.agencyId, 'agency_settings')

    const devisList = row ? JSON.parse(row.value) : []
    const settings = settingsRow ? JSON.parse(settingsRow.value) : {}
    const devis = devisList.find(d => d.id === devisId)
    if (!devis) return res.status(404).json({ error: 'Devis introuvable' })

    const clientsRow = db.prepare(
      'SELECT value FROM agency_data WHERE agency_id = ? AND data_key = ?',
    ).get(req.user.agencyId, 'agency_clients')
    const clients = clientsRow ? JSON.parse(clientsRow.value) : []
    const client = clients.find(c => c.id === devis.clientId)
    const recipient = to || client?.email

    const agencyName = settings.nom || 'Rihla'
    const subject = `${agencyName} — Devis ${devis.ref}`
    const body = [
      `Bonjour ${devis.clientNom},`,
      '',
      `Veuillez trouver ci-joint notre devis ${devis.ref} d'un montant de ${devis.totalTTC} ${settings.devise || 'MAD'} TTC.`,
      devis.validiteJours ? `Validité : ${devis.validiteJours} jours.` : '',
      '',
      settings.telephone ? `Tél : ${settings.telephone}` : '',
      settings.email ? `Email : ${settings.email}` : '',
      '',
      'Cordialement,',
      agencyName,
    ].filter(Boolean).join('\n')

    if (recipient && isMailConfigured()) {
      await sendDevisEmail({
        to: recipient,
        subject,
        text: body,
        from: settings.email ? `"${agencyName}" <${settings.email}>` : undefined,
      })
      return res.json({ sent: true, method: 'smtp', to: recipient })
    }

    if (recipient) {
      return res.json({
        sent: false,
        method: 'mailto',
        mailto: buildDevisMailto({ to: recipient, subject, body }),
        to: recipient,
      })
    }

    res.status(400).json({ error: 'Aucune adresse email client disponible' })
  } catch (err) {
    console.error('[mail/devis]', err)
    res.status(500).json({ error: "Impossible d'envoyer le devis" })
  }
})

export default router
