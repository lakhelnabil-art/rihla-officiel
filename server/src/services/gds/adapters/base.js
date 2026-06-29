/**
 * Abstract GDS Provider Adapter.
 * Each GDS (Amadeus, Sabre, Travelport…) implements this interface.
 */

export class GdsAdapter {
  /** @param {string} providerId */
  constructor(providerId) {
    this.providerId = providerId
  }

  /** @param {import('../types.js').GdsConnectionConfig} config */
  validateConfig(config) {
    const missing = []
    if (!config.officeId?.trim()) missing.push('officeId')
    if (!config.pcc?.trim()) missing.push('pcc')
    if (!config.credentials?.username?.trim()) missing.push('username')
    if (!config.credentials?.password?.trim()) missing.push('password')
    return missing
  }

  /** @returns {Promise<{ ok: boolean, message: string, latencyMs?: number }>} */
  async testConnection(_config) {
    throw new Error(`${this.providerId}: testConnection not implemented`)
  }

  /** @returns {Promise<import('../types.js').GdsPnr|null>} */
  async fetchPnr(_config, _recordLocator) {
    throw new Error(`${this.providerId}: fetchPnr not implemented`)
  }

  /** @returns {Promise<import('../types.js').GdsPnr[]>} */
  async fetchRecentPnrs(_config, _options = {}) {
    throw new Error(`${this.providerId}: fetchRecentPnrs not implemented`)
  }
}
