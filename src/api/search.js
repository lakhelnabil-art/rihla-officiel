import { api, request } from './client.js'

export const searchApi = {
  status: () => request('/search/status'),

  flights: (params) =>
    request('/search/flights', { method: 'POST', body: JSON.stringify(params) }),

  hotels: (params) =>
    request('/search/hotels', { method: 'POST', body: JSON.stringify(params) }),

  transport: (params) =>
    request('/search/transport', { method: 'POST', body: JSON.stringify(params) }),

  cruises: (params) =>
    request('/search/cruises', { method: 'POST', body: JSON.stringify(params) }),

  activities: (params) =>
    request('/search/activities', { method: 'POST', body: JSON.stringify(params) }),
}

export { api }
