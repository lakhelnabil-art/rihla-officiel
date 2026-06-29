import { STORAGE_KEYS } from './sampleData'

/** Collect legacy localStorage payloads for an agency (pre-API installs). */
export const collectLegacyAgencyData = (agencyId) => {
  const prefix = agencyId ? `${agencyId}_` : ''
  const payload = {}
  let found = false

  Object.values(STORAGE_KEYS).forEach(key => {
    const fullKey = `${prefix}${key}`
    try {
      const raw = localStorage.getItem(fullKey)
      if (raw) {
        payload[key] = JSON.parse(raw)
        found = true
      }
    } catch { /* skip corrupt entries */ }
  })

  return found ? payload : null
}

/** Remove legacy keys after successful migration. */
export const clearLegacyAgencyData = (agencyId) => {
  const prefix = agencyId ? `${agencyId}_` : ''
  Object.values(STORAGE_KEYS).forEach(key =>
    localStorage.removeItem(`${prefix}${key}`),
  )
}
