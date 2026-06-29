/**
 * Pays interdits sur la plateforme Rihla — blocage catégorique.
 */

export const BANNED_COUNTRY_CODES = new Set(['IL'])

export const BANNED_COUNTRY_LABELS = new Set([
  'Israël',
  'Israel',
  "État d'Israël",
  'State of Israel',
])

export const BANNED_TEXT_PATTERNS = [
  /\bisra[eëË]l\b/i,
  /\btel\s*-?\s*aviv\b/i,
  /\bj[eé]rusalem\b/i,
  /\bben\s+gurion\b/i,
  /\bhaifa\b/i,
  /\beilat\b/i,
  /\bel\s+al\b/i,
  /\bisrael\s+railways\b/i,
]

export const BANNED_PROVIDER_NAMES = new Set([
  'El Al',
  'Israel Railways',
  'Go Israel',
  'Budget Israël',
  'Local DMC Israël',
  'Conciergerie Tel Aviv VIP',
  'El Al Lounge',
  'El Al Groupes',
  'Harel Insurance',
  'ETA-IL Israël',
])

export const BANNED_COUNTRY_MESSAGE =
  'Israël est interdit sur la plateforme Rihla. Cette destination ne peut pas être utilisée.'

const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

export const isBannedCountryCode = (code) =>
  Boolean(code) && BANNED_COUNTRY_CODES.has(String(code).toUpperCase())

export const isBannedCountryLabel = (label) => {
  const normalized = normalize(label)
  if (!normalized) return false
  for (const banned of BANNED_COUNTRY_LABELS) {
    if (normalize(banned) === normalized) return true
  }
  return false
}

/** Détecte toute mention d'Israël dans un texte libre (destination, adresse, etc.). */
export const mentionsBannedCountry = (text) => {
  const raw = String(text || '').trim()
  if (!raw) return false
  if (isBannedCountryLabel(raw)) return true
  return BANNED_TEXT_PATTERNS.some(pattern => pattern.test(raw))
}

export const isBannedCountry = (value) =>
  isBannedCountryCode(value) || isBannedCountryLabel(value) || mentionsBannedCountry(value)

export const isBannedProvider = (entry) => {
  if (!entry) return false
  const name = entry.name ?? entry
  if (BANNED_PROVIDER_NAMES.has(name)) return true
  if (typeof entry === 'object') {
    return [entry.name, entry.source, entry.address, entry.website]
      .some(field => field && mentionsBannedCountry(field))
  }
  return mentionsBannedCountry(name)
}

export const filterAllowedCountries = (countries) =>
  (countries || []).filter(country => !isBannedCountry(country))

export const filterBannedProviders = (providers) =>
  (providers || []).filter(entry => !isBannedProvider(entry))

/** Retourne un message d'erreur ou null si autorisé. */
export const getBannedCountryError = (value) =>
  isBannedCountry(value) ? BANNED_COUNTRY_MESSAGE : null

export const assertAllowedCountry = (value) => {
  const error = getBannedCountryError(value)
  if (error) throw new Error(error)
}
