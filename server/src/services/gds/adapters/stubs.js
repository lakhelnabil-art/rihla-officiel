import { GdsAdapter } from './base.js'

const createStub = (providerId, label) => {
  class StubAdapter extends GdsAdapter {
    constructor() { super(providerId) }

    async testConnection(config) {
      const missing = this.validateConfig(config)
      if (missing.length) {
        return { ok: false, message: `Champs manquants : ${missing.join(', ')}` }
      }
      return {
        ok: false,
        message: `Connecteur ${label} en cours de développement. Configuration enregistrée.`,
      }
    }

    async fetchPnr() {
      throw new Error(`Connecteur ${label} non disponible`)
    }

    async fetchRecentPnrs() {
      return []
    }
  }
  return new StubAdapter()
}

export const sabreAdapter = createStub('sabre', 'Sabre')
export const travelportAdapter = createStub('travelport', 'Travelport')
export const galileoAdapter = createStub('galileo', 'Galileo')
export const worldspanAdapter = createStub('worldspan', 'Worldspan')
export const ndcAdapter = createStub('ndc', 'NDC Direct Connect')
