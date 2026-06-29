/* ─────────────────────────────────────────
   CURRENCY
───────────────────────────────────────── */

export const formatCurrency = (amount, currency = 'MAD') => {
  const num = parseFloat(amount) || 0
  return (
    new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) +
    ' ' +
    currency
  )
}

/** Parse a localised currency string back to a number. */
export const parseAmount = (str) => {
  if (typeof str === 'number') return str
  return parseFloat(String(str).replace(/\s/g, '').replace(',', '.')) || 0
}

export const formatPercent = (value, decimals = 1) => {
  const n = parseFloat(value)
  if (isNaN(n)) return '—'
  return `${n.toFixed(decimals)} %`
}

export const formatNumber = (value, { decimals = 0, unit = '' } = {}) => {
  const n = parseFloat(value)
  if (isNaN(n)) return '—'
  const str = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
  return unit ? `${str} ${unit}` : str
}

/* ─────────────────────────────────────────
   DATES
───────────────────────────────────────── */

const safeDate = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

/** dd/mm/yyyy */
export const formatDate = (dateStr) => {
  const d = safeDate(dateStr)
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(d)
}

/** e.g. "10 mai" */
export const formatDateShort = (dateStr) => {
  const d = safeDate(dateStr)
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(d)
}

/** e.g. "samedi 10 mai 2026" */
export const formatDateLong = (dateStr) => {
  const d = safeDate(dateStr)
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(d)
}

/** e.g. "mai 2026" */
export const formatMonthYear = (dateStr) => {
  const d = safeDate(dateStr)
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d)
}

/** Returns today's date as ISO string (yyyy-mm-dd). */
export const todayISO = () => new Date().toISOString().split('T')[0]

/** Adds `days` to an ISO date string, returns ISO string. */
export const addDays = (dateStr, days) => {
  const d = safeDate(dateStr)
  if (!d) return ''
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/**
 * Returns how many calendar days from today until `dateStr`.
 * Negative = in the past.
 */
export const daysUntil = (dateStr) => {
  const d = safeDate(dateStr)
  if (!d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86_400_000)
}

/** Returns how many days ago `dateStr` was (positive = past). */
export const daysAgo = (dateStr) => -(daysUntil(dateStr) ?? 0)

/** True if the date is strictly before today. */
export const isExpired = (dateStr) => {
  const delta = daysUntil(dateStr)
  return delta !== null && delta < 0
}

/** True if the date is today. */
export const isToday = (dateStr) => daysUntil(dateStr) === 0

/* ─────────────────────────────────────────
   REFERENCES
───────────────────────────────────────── */

const year = () => new Date().getFullYear()

export const generateRef = (prefix = 'REF') =>
  `${prefix}-${year()}-${String(Math.floor(Math.random() * 900) + 100)}`

export const generateInvoiceRef = (seq) =>
  `FAC-${year()}-${String(seq).padStart(3, '0')}`

export const generateQuoteRef = (seq) =>
  `DEV-${year()}-${String(seq).padStart(3, '0')}`

/* ─────────────────────────────────────────
   PHONE
───────────────────────────────────────── */

/**
 * Formats a Moroccan phone number.
 * "0661234567" → "06 61 23 45 67"
 * "+212661234567" → "+212 6 61 23 45 67"
 */
export const formatPhone = (raw) => {
  if (!raw) return '—'
  const digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('212') && digits.length === 12) {
    return `+212 ${digits[3]} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }
  return raw
}

/* ─────────────────────────────────────────
   LABELS
───────────────────────────────────────── */

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const MONTHS_LONG  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export const getMonthLabel     = (i) => MONTHS_SHORT[i] ?? ''
export const getFullMonthLabel = (i) => MONTHS_LONG[i]  ?? ''

/* ─────────────────────────────────────────
   STRINGS
───────────────────────────────────────── */

export const truncate = (str, len = 30) => {
  if (!str) return ''
  return str.length > len ? `${str.slice(0, len)}…` : str
}

/** Normalise a string for accent-insensitive search. */
export const normalise = (str) =>
  String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

/** Returns true if `text` contains `query` (accent-insensitive). */
export const fuzzyMatch = (text, query) =>
  normalise(text).includes(normalise(query))

/* ─────────────────────────────────────────
   ARRAY UTILITIES
───────────────────────────────────────── */

/**
 * Sort an array of objects by a key.
 * @param {'asc'|'desc'} dir
 */
export const sortByKey = (arr, key, dir = 'asc') => {
  const factor = dir === 'desc' ? -1 : 1
  return [...arr].sort((a, b) => {
    const va = a[key] ?? ''
    const vb = b[key] ?? ''
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor
    return String(va).localeCompare(String(vb), 'fr') * factor
  })
}

/**
 * Group an array of objects by a key.
 * Returns Record<string, T[]>.
 */
export const groupByKey = (arr, key) =>
  arr.reduce((acc, item) => {
    const k = String(item[key] ?? 'Autre')
    ;(acc[k] ??= []).push(item)
    return acc
  }, {})

/** Sum a numeric field across an array. */
export const sumBy = (arr, key) =>
  arr.reduce((acc, item) => acc + (parseFloat(item[key]) || 0), 0)
