import { db } from './db.js'
import { seedFromTemplate } from './templates/agencyTemplates.js'

/** @deprecated use seedAgencyFromTemplate */
export { seedFromTemplate }

export const seedAgencyFromTemplate = (agencyId, templateId, agencyName, config = {}) => {
  const payload = seedFromTemplate(agencyId, templateId, agencyName, config)
  const now = new Date().toISOString()
  const insert = db.prepare(`
    INSERT INTO agency_data (agency_id, data_key, value, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(agency_id, data_key) DO NOTHING
  `)

  const tx = db.transaction(() => {
    for (const [key, val] of Object.entries(payload)) {
      insert.run(agencyId, key, JSON.stringify(val), now)
    }
  })
  tx()
}

/** Legacy alias — démo générique */
export const seedAgencyData = (agencyId, agencyName) =>
  seedAgencyFromTemplate(agencyId, 'rihla-demo', agencyName, {})
