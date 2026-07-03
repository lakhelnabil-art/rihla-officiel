const API_BASE = import.meta.env.VITE_API_URL || '/api'

const TOKEN_KEY = 'rihla_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  let body = null
  const text = await res.text()
  if (text) {
    try { body = JSON.parse(text) } catch { body = { error: text } }
  }

  if (!res.ok) {
    throw new ApiError(body?.error || `Erreur ${res.status}`, res.status)
  }
  return body
}

export const api = {
  health: () => request('/health'),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  registerAgency: (payload) =>
    request('/auth/register-agency', { method: 'POST', body: JSON.stringify(payload) }),

  selectAgency: (agencyId) =>
    request('/auth/select-agency', { method: 'POST', body: JSON.stringify({ agencyId }) }),

  leaveAgency: () =>
    request('/auth/leave-agency', { method: 'POST', body: JSON.stringify({}) }),

  me: () => request('/auth/me'),

  updateMe: (payload) =>
    request('/auth/me', { method: 'PUT', body: JSON.stringify(payload) }),

  createUser: (payload) =>
    request('/auth/users', { method: 'POST', body: JSON.stringify(payload) }),

  getAgencies: () => request('/agencies'),

  getAgencyTemplates: () => request('/agencies/templates/list'),

  createAgency: (payload) =>
    request('/agencies', { method: 'POST', body: JSON.stringify(payload) }),

  updateAgency: (id, payload) =>
    request(`/agencies/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  deleteAgency: (id) =>
    request(`/agencies/${id}`, { method: 'DELETE' }),

  getAllData: () => request('/data'),

  getData: (key) => request(`/data/${key}`),

  putData: (key, value) =>
    request(`/data/${key}`, { method: 'PUT', body: JSON.stringify(value) }),

  bulkData: (payload) =>
    request('/data/bulk', { method: 'POST', body: JSON.stringify(payload) }),

  clearData: () => request('/data', { method: 'DELETE' }),

  getUsers: () => request('/users'),

  sendDevis: (devisId, to) =>
    request('/mail/devis', { method: 'POST', body: JSON.stringify({ devisId, to }) }),

  mailStatus: () => request('/mail/status'),

  verifySuperPin: (pin) =>
    request('/platform/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) }),

  setSuperPin: (currentPin, newPin) =>
    request('/platform/super-pin', {
      method: 'PUT',
      body: JSON.stringify({ currentPin, newPin }),
    }),

  platformUsers: (pin) =>
    request('/platform/users', { method: 'POST', body: JSON.stringify({ pin }) }),

  resetUserPassword: (pin, userId, newPassword) =>
    request('/platform/reset-password', { method: 'POST', body: JSON.stringify({ pin, userId, newPassword }) }),
}

export { ApiError, request }
