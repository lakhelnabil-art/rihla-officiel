import { amadeusAdapter } from './adapters/amadeus.js'
import {
  sabreAdapter, travelportAdapter, galileoAdapter, worldspanAdapter, ndcAdapter,
} from './adapters/stubs.js'
import { getProviderMeta, isProviderAvailable } from './registry.js'

const ADAPTERS = {
  amadeus: amadeusAdapter,
  sabre: sabreAdapter,
  travelport: travelportAdapter,
  galileo: galileoAdapter,
  worldspan: worldspanAdapter,
  ndc: ndcAdapter,
}

/** Resolve adapter for a provider id. */
export const getAdapter = (providerId) => {
  const adapter = ADAPTERS[providerId]
  if (!adapter) throw new Error(`GDS inconnu : ${providerId}`)
  return adapter
}

/** Build runtime config from DB row + decrypted credentials. */
export const buildRuntimeConfig = (row, credentials) => ({
  agencyName: row.agency_name || '',
  officeId: row.office_id || '',
  pcc: row.pcc || '',
  environment: row.environment || 'test',
  endpointUrl: row.endpoint_url || '',
  credentials: credentials || {},
})

/** Test connection for a provider. */
export const testProviderConnection = async (providerId, config) => {
  const meta = getProviderMeta(providerId)
  if (!meta) return { ok: false, message: 'Fournisseur GDS inconnu' }
  if (!isProviderAvailable(providerId)) {
    return { ok: false, message: `Connecteur ${meta.label} en cours de développement` }
  }
  const adapter = getAdapter(providerId)
  return adapter.testConnection(config)
}

/** Fetch PNR via provider adapter. */
export const fetchPnrFromProvider = async (providerId, config, recordLocator) => {
  const adapter = getAdapter(providerId)
  return adapter.fetchPnr(config, recordLocator)
}

/** Fetch recent PNRs via provider adapter. */
export const fetchRecentPnrsFromProvider = async (providerId, config, options) => {
  const adapter = getAdapter(providerId)
  if (typeof adapter.fetchRecentPnrs !== 'function') return []
  return adapter.fetchRecentPnrs(config, options)
}
