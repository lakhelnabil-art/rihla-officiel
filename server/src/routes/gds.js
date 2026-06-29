import { Router } from 'express'
import { authMiddleware, agencyMiddleware, adminMiddleware } from '../middleware/auth.js'
import { listProviders, getProviderMeta } from '../services/gds/registry.js'
import {
  getConfigWithMaskedSecrets,
  upsertConnection,
  setConnectionActive,
  updateConnectionStatus,
  getConnection,
  getDecryptedCredentials,
  toPublicConnection,
  listConnections,
  deactivateAllConnections,
} from '../services/gds/connectionService.js'
import {
  buildRuntimeConfig,
  testProviderConnection,
  fetchPnrFromProvider,
  fetchRecentPnrsFromProvider,
} from '../services/gds/connector.js'
import { logGdsAudit, getAuditLogs } from '../services/gds/auditLog.js'
import { listPnrs, getPnr, parsePnrRow } from '../services/gds/pnrService.js'
import { importPnrToRihla, syncPnrs } from '../services/gds/syncService.js'
import { getDashboardStats } from '../services/gds/dashboardService.js'
import { getAgencyData, putAgencyData } from '../services/gds/agencyData.js'

const router = Router()

router.use(authMiddleware, agencyMiddleware)

/** GET /api/gds/providers — list available GDS providers. */
router.get('/providers', (_req, res) => {
  res.json({ providers: listProviders() })
})

/** GET /api/gds/status — overall GDS status for agency. */
router.get('/status', (req, res) => {
  const { agencyId } = req.user
  const settings = getAgencyData(agencyId, 'agency_settings') ?? {}
  const connections = listConnections(agencyId).map(toPublicConnection)
  const active = connections.find(c => c.isActive) ?? null

  res.json({
    gdsMode: settings.gdsMode ?? 'none',
    activeConnection: active,
    connections,
  })
})

/** GET /api/gds/config/:provider */
router.get('/config/:provider', adminMiddleware, (req, res) => {
  const config = getConfigWithMaskedSecrets(req.user.agencyId, req.params.provider)
  res.json({ config })
})

/** PUT /api/gds/config/:provider — save GDS credentials (encrypted server-side). */
router.put('/config/:provider', adminMiddleware, (req, res) => {
  const { provider } = req.params
  if (!getProviderMeta(provider)) {
    return res.status(400).json({ error: 'Fournisseur GDS inconnu' })
  }

  const body = req.body ?? {}
  const row = upsertConnection(req.user.agencyId, provider, {
    agencyName: body.agencyName,
    officeId: body.officeId,
    pcc: body.pcc,
    environment: body.environment ?? 'test',
    endpointUrl: body.endpointUrl,
    apiKey: body.apiKey,
    apiSecret: body.apiSecret,
    username: body.username,
    password: body.password,
    status: 'disconnected',
    statusMessage: 'Configuration enregistrée',
  })

  logGdsAudit(req.user.agencyId, 'config_save', {
    provider,
    userId: req.user.sub,
    details: { officeId: body.officeId, environment: body.environment },
  })

  res.json({ ok: true, config: toPublicConnection(row) })
})

/** POST /api/gds/test/:provider */
router.post('/test/:provider', adminMiddleware, async (req, res) => {
  const { provider } = req.params
  const row = getConnection(req.user.agencyId, provider)
  if (!row) return res.status(404).json({ error: 'Configuration GDS introuvable' })

  const creds = getDecryptedCredentials(req.user.agencyId, row)
  const config = buildRuntimeConfig(row, creds)

  try {
    const result = await testProviderConnection(provider, config)
    updateConnectionStatus(
      req.user.agencyId, provider,
      result.ok ? 'connected' : 'error',
      result.message,
    )
    logGdsAudit(req.user.agencyId, 'test_connection', {
      provider,
      userId: req.user.sub,
      success: result.ok,
      details: { message: result.message, latencyMs: result.latencyMs },
    })
    res.json(result)
  } catch (err) {
    updateConnectionStatus(req.user.agencyId, provider, 'error', err.message)
    logGdsAudit(req.user.agencyId, 'test_connection', {
      provider, userId: req.user.sub, success: false, details: { error: err.message },
    })
    res.status(500).json({ ok: false, message: err.message })
  }
})

/** POST /api/gds/activate/:provider */
router.post('/activate/:provider', adminMiddleware, (req, res) => {
  const { provider } = req.params
  const row = getConnection(req.user.agencyId, provider)
  if (!row) return res.status(404).json({ error: 'Configurez d\'abord le connecteur' })

  setConnectionActive(req.user.agencyId, provider, true)
  updateConnectionStatus(req.user.agencyId, provider, 'connected', 'Connecteur activé')

  const settings = getAgencyData(req.user.agencyId, 'agency_settings') ?? {}
  putAgencyData(req.user.agencyId, 'agency_settings', { ...settings, gdsMode: provider })

  logGdsAudit(req.user.agencyId, 'activate', { provider, userId: req.user.sub })
  res.json({ ok: true, provider })
})

/** POST /api/gds/deactivate/:provider */
router.post('/deactivate/:provider', adminMiddleware, (req, res) => {
  const { provider } = req.params
  setConnectionActive(req.user.agencyId, provider, false)
  updateConnectionStatus(req.user.agencyId, provider, 'disconnected', 'Connecteur désactivé')
  logGdsAudit(req.user.agencyId, 'deactivate', { provider, userId: req.user.sub })
  res.json({ ok: true })
})

/** POST /api/gds/mode — switch GDS mode (none / provider). */
router.post('/mode', adminMiddleware, (req, res) => {
  const { mode } = req.body ?? {}
  const settings = getAgencyData(req.user.agencyId, 'agency_settings') ?? {}

  if (mode === 'none') {
    deactivateAllConnections(req.user.agencyId)
  }

  putAgencyData(req.user.agencyId, 'agency_settings', { ...settings, gdsMode: mode ?? 'none' })
  logGdsAudit(req.user.agencyId, 'mode_change', {
    userId: req.user.sub,
    details: { mode },
  })
  res.json({ ok: true, gdsMode: mode ?? 'none' })
})

/** GET /api/gds/pnrs */
router.get('/pnrs', (req, res) => {
  const { provider, limit, offset } = req.query
  const pnrs = listPnrs(req.user.agencyId, {
    provider,
    limit: parseInt(limit || '50', 10),
    offset: parseInt(offset || '0', 10),
  })
  res.json({ pnrs })
})

/** GET /api/gds/pnr/:recordLocator */
router.get('/pnr/:recordLocator', async (req, res) => {
  const { recordLocator } = req.params
  const active = listConnections(req.user.agencyId).find(c => c.is_active)
  const providerId = req.query.provider || active?.provider

  if (!providerId) {
    return res.status(400).json({ error: 'Aucun connecteur GDS actif' })
  }

  const stored = getPnr(req.user.agencyId, providerId, recordLocator)
  if (stored) {
    return res.json({ pnr: parsePnrRow(stored), source: 'local' })
  }

  const row = getConnection(req.user.agencyId, providerId)
  if (!row?.is_active) {
    return res.status(404).json({ error: 'PNR introuvable' })
  }

  try {
    const creds = getDecryptedCredentials(req.user.agencyId, row)
    const config = buildRuntimeConfig(row, creds)
    const pnr = await fetchPnrFromProvider(providerId, config, recordLocator)
    res.json({ pnr, source: 'gds' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /api/gds/import — import PNR into Rihla (CRM + résa + facture). */
router.post('/import', async (req, res) => {
  const { recordLocator, provider: providerParam } = req.body ?? {}
  const active = listConnections(req.user.agencyId).find(c => c.is_active)
  const providerId = providerParam || active?.provider

  if (!providerId) return res.status(400).json({ error: 'Aucun connecteur GDS actif' })
  if (!recordLocator) return res.status(400).json({ error: 'Record locator requis' })

  const row = getConnection(req.user.agencyId, providerId)
  if (!row) return res.status(404).json({ error: 'Configuration GDS introuvable' })

  try {
    const creds = getDecryptedCredentials(req.user.agencyId, row)
    const config = buildRuntimeConfig(row, creds)
    const pnr = await fetchPnrFromProvider(providerId, config, recordLocator)
    const result = importPnrToRihla(req.user.agencyId, providerId, pnr, req.user.sub)
    res.json({ ok: true, ...result, pnr: parsePnrRow(result.pnr) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /api/gds/sync — sync recent PNRs from active GDS. */
router.post('/sync', async (req, res) => {
  const providerId = req.body?.provider || listConnections(req.user.agencyId).find(c => c.is_active)?.provider
  if (!providerId) return res.status(400).json({ error: 'Aucun connecteur GDS actif' })

  const row = getConnection(req.user.agencyId, providerId)
  if (!row?.is_active) return res.status(400).json({ error: 'Connecteur non activé' })

  try {
    const creds = getDecryptedCredentials(req.user.agencyId, row)
    const config = buildRuntimeConfig(row, creds)
    const pnrs = await fetchRecentPnrsFromProvider(providerId, config, { limit: req.body?.limit ?? 10 })
    const results = syncPnrs(req.user.agencyId, providerId, pnrs, req.user.sub)
    res.json({
      ok: true,
      imported: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /api/gds/dashboard */
router.get('/dashboard', (req, res) => {
  const stats = getDashboardStats(req.user.agencyId, {
    period: req.query.period ?? 'month',
    provider: req.query.provider,
  })
  res.json(stats)
})

/** GET /api/gds/audit */
router.get('/audit', adminMiddleware, (req, res) => {
  const logs = getAuditLogs(req.user.agencyId, {
    limit: parseInt(req.query.limit || '50', 10),
    provider: req.query.provider,
  })
  res.json({ logs })
})

export default router
