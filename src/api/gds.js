import { request } from './client.js'

export const gdsApi = {
  providers: () => request('/gds/providers'),

  status: () => request('/gds/status'),

  getConfig: (provider) => request(`/gds/config/${provider}`),

  saveConfig: (provider, payload) =>
    request(`/gds/config/${provider}`, { method: 'PUT', body: JSON.stringify(payload) }),

  testConnection: (provider) =>
    request(`/gds/test/${provider}`, { method: 'POST', body: JSON.stringify({}) }),

  activate: (provider) =>
    request(`/gds/activate/${provider}`, { method: 'POST', body: JSON.stringify({}) }),

  deactivate: (provider) =>
    request(`/gds/deactivate/${provider}`, { method: 'POST', body: JSON.stringify({}) }),

  setMode: (mode) =>
    request('/gds/mode', { method: 'POST', body: JSON.stringify({ mode }) }),

  listPnrs: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/gds/pnrs${q ? `?${q}` : ''}`)
  },

  fetchPnr: (recordLocator, provider) => {
    const q = provider ? `?provider=${provider}` : ''
    return request(`/gds/pnr/${encodeURIComponent(recordLocator)}${q}`)
  },

  importPnr: (recordLocator, provider) =>
    request('/gds/import', { method: 'POST', body: JSON.stringify({ recordLocator, provider }) }),

  sync: (provider, limit) =>
    request('/gds/sync', { method: 'POST', body: JSON.stringify({ provider, limit }) }),

  dashboard: (period = 'month', provider) => {
    const params = new URLSearchParams({ period })
    if (provider) params.set('provider', provider)
    return request(`/gds/dashboard?${params}`)
  },

  audit: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/gds/audit${q ? `?${q}` : ''}`)
  },
}

export const GDS_MODES = [
  { id: 'none', label: 'Non, nous utilisons uniquement Rihla' },
  { id: 'amadeus', label: 'Oui, nous disposons d\'un accès Amadeus' },
  { id: 'sabre', label: 'Oui, nous disposons d\'un accès Sabre' },
  { id: 'travelport', label: 'Oui, nous disposons d\'un accès Travelport' },
  { id: 'other', label: 'Autre GDS' },
]

export const GDS_ENVIRONMENTS = [
  { id: 'test', label: 'Test' },
  { id: 'production', label: 'Production' },
]
