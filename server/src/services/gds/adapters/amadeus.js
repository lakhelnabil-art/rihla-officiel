import { GdsAdapter } from './base.js'

/** Sample PNR for test environment — simulates Amadeus response structure. */
const SAMPLE_PNR = (recordLocator) => ({
  recordLocator: recordLocator.toUpperCase(),
  provider: 'amadeus',
  status: 'CONFIRMED',
  passengers: [
    {
      type: 'ADT',
      lastName: 'BENALI',
      firstName: 'Ahmed',
      title: 'MR',
      email: 'ahmed.benali@email.ma',
      phone: '+212661234567',
    },
  ],
  segments: [
    {
      sequence: 1,
      carrier: 'AT',
      flightNumber: 'AT780',
      origin: 'CMN',
      destination: 'CDG',
      departureDate: new Date().toISOString().slice(0, 10),
      departureTime: '08:30',
      arrivalDate: new Date().toISOString().slice(0, 10),
      arrivalTime: '12:45',
      cabin: 'economy',
      status: 'HK',
      bookingClass: 'Y',
    },
    {
      sequence: 2,
      carrier: 'AT',
      flightNumber: 'AT781',
      origin: 'CDG',
      destination: 'CMN',
      departureDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      departureTime: '14:00',
      arrivalDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      arrivalTime: '16:15',
      cabin: 'economy',
      status: 'HK',
      bookingClass: 'Y',
    },
  ],
  tickets: [
    {
      ticketNumber: '079-1234567890',
      passengerName: 'BENALI/AHMED MR',
      issueDate: new Date().toISOString().slice(0, 10),
      baseFare: 4200,
      taxes: 890,
      total: 5090,
      commission: 254.5,
      currency: 'MAD',
      status: 'issued',
    },
  ],
  ssr: ['DOCS', 'CTCE ahmed.benali@email.ma', 'CTCM +212661234567'],
  osi: ['RIHLA SYNC'],
  raw: { source: 'amadeus-mock', environment: 'test' },
  future: { ndc: false, bsp: true, emd: false },
})

/**
 * Amadeus GDS Adapter.
 * Test mode: validates credentials and returns structured mock PNRs.
 * Production: endpoint ready for Amadeus Web Services / REST API integration.
 */
export class AmadeusAdapter extends GdsAdapter {
  constructor() {
    super('amadeus')
  }

  validateConfig(config) {
    const missing = super.validateConfig(config)
    if (config.environment === 'production') {
      if (!config.credentials?.apiKey?.trim()) missing.push('apiKey')
      if (!config.credentials?.apiSecret?.trim()) missing.push('apiSecret')
    }
    return missing
  }

  async testConnection(config) {
    const start = Date.now()
    const missing = this.validateConfig(config)
    if (missing.length) {
      return { ok: false, message: `Champs manquants : ${missing.join(', ')}` }
    }

    if (config.environment === 'production') {
      // Production: validate endpoint reachability (placeholder for real Amadeus API)
      const endpoint = config.endpointUrl || 'https://api.amadeus.com'
      return {
        ok: true,
        message: `Configuration production valide. Endpoint : ${endpoint}. Intégration API Amadeus à activer avec vos credentials.`,
        latencyMs: Date.now() - start,
      }
    }

    // Test environment: simulate successful auth
    await new Promise(r => setTimeout(r, 400))
    return {
      ok: true,
      message: `Connexion test réussie — Office ${config.officeId} / PCC ${config.pcc}`,
      latencyMs: Date.now() - start,
    }
  }

  async fetchPnr(config, recordLocator) {
    const missing = this.validateConfig(config)
    if (missing.length) throw new Error(`Configuration incomplète : ${missing.join(', ')}`)
    if (!recordLocator?.trim()) throw new Error('Record locator requis')

    await new Promise(r => setTimeout(r, 300))
    return SAMPLE_PNR(recordLocator.trim())
  }

  async fetchRecentPnrs(config, { limit = 10 } = {}) {
    const missing = this.validateConfig(config)
    if (missing.length) throw new Error(`Configuration incomplète : ${missing.join(', ')}`)

    await new Promise(r => setTimeout(r, 500))
    const codes = ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345']
    return codes.slice(0, Math.min(limit, codes.length)).map(c => SAMPLE_PNR(c))
  }
}

export const amadeusAdapter = new AmadeusAdapter()
