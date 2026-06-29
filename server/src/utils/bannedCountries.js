/**
 * Pays interdits — miroir serveur (blocage API).
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
]

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

export const mentionsBannedCountry = (text) => {
  const raw = String(text || '').trim()
  if (!raw) return false
  if (isBannedCountryLabel(raw)) return true
  return BANNED_TEXT_PATTERNS.some(pattern => pattern.test(raw))
}

export const isBannedCountry = (value) =>
  isBannedCountryCode(value) || isBannedCountryLabel(value) || mentionsBannedCountry(value)

export const rejectIfBanned = (res, ...values) => {
  for (const value of values) {
    if (isBannedCountry(value)) {
      res.status(403).json({ error: BANNED_COUNTRY_MESSAGE })
      return true
    }
  }
  return false
}
