/**
 * Travel search provider registry.
 * GDS integration is handled separately via /api/gds (GDS Connector Layer).
 * Set env vars to enable live API mode; otherwise responses stay in "assisted" mode.
 */
export const SEARCH_PROVIDERS = {
  flights: {
    id: 'flights',
    label: 'Vols',
    mode: process.env.DUFFEL_ACCESS_TOKEN ? 'live' : 'assisted',
    provider: process.env.DUFFEL_ACCESS_TOKEN ? 'duffel' : 'local-airlines',
    envKey: 'DUFFEL_ACCESS_TOKEN',
    gdsLayer: '/api/gds',
  },
  hotels: {
    id: 'hotels',
    label: 'Hôtels',
    mode: process.env.HOTELBEDS_API_KEY ? 'live' : 'assisted',
    provider: process.env.HOTELBEDS_API_KEY ? 'hotelbeds' : 'platform-links',
    envKey: 'HOTELBEDS_API_KEY',
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    mode: process.env.MOZIO_API_KEY ? 'live' : 'assisted',
    provider: process.env.MOZIO_API_KEY ? 'mozio' : 'platform-links',
    envKey: 'MOZIO_API_KEY',
  },
  cruises: {
    id: 'cruises',
    label: 'Croisières',
    mode: 'assisted',
    provider: 'platform-links',
    envKey: null,
  },
  activities: {
    id: 'activities',
    label: 'Activités',
    mode: process.env.VIATOR_API_KEY ? 'live' : 'assisted',
    provider: process.env.VIATOR_API_KEY ? 'viator' : 'platform-links',
    envKey: 'VIATOR_API_KEY',
  },
}

export function providerStatus() {
  return Object.values(SEARCH_PROVIDERS).map(p => ({
    id: p.id,
    label: p.label,
    mode: p.mode,
    provider: p.provider,
    configured: p.mode === 'live',
  }))
}
