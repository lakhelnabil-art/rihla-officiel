/**
 * Comparateurs de vols — liens pré-remplis (Google Flights, Skyscanner, Kayak…).
 * buildUrl accepte { from, to, date, returnDate, pax, cabin }
 * from / to : objet aéroport { code, ville } ou code IATA.
 */

function iata(ap) {
  return (typeof ap === 'string' ? ap : ap?.code || '').toUpperCase()
}

function skyDate(date) {
  return (date || '').replace(/-/g, '').slice(2)
}

function expediaDate(date) {
  const [y, m, d] = (date || '').split('-')
  if (!y) return ''
  return `${Number(m)}/${Number(d)}/${y}`
}

const CABIN_SKY = { economy: 'economy', business: 'business', first: 'first' }

export const FLIGHT_PLATFORMS = [
  {
    id: 'google_flights',
    nom: 'Google Flights',
    couleur: '#4285f4',
    textColor: '#ffffff',
    emoji: '✈️',
    badge: 'Recommandé',
    description: 'Agrégateur Google — compare toutes les sources en un écran, graphique des prix et alertes tarifaires. Référence pour trouver les offres les plus basses.',
    buildUrl({ from, to, date, returnDate, pax }) {
      const fc = iata(from)
      const tc = iata(to)
      let q = `Flights from ${fc} to ${tc} on ${date}`
      if (returnDate) q += ` through ${returnDate}`
      if (pax > 1) q += ` for ${pax} adults`
      const p = new URLSearchParams({ q, hl: 'fr', gl: 'ma' })
      return `https://www.google.com/travel/flights/search?${p}`
    },
  },
  {
    id: 'skyscanner',
    nom: 'Skyscanner',
    couleur: '#0770e3',
    textColor: '#ffffff',
    emoji: '🔵',
    description: 'Méta-moteur mondial n°1 — compare 1000+ compagnies et agences. Filtres flexibles (mois entier, pays voisin).',
    buildUrl({ from, to, date, returnDate, pax, cabin }) {
      const fc = iata(from).toLowerCase()
      const tc = iata(to).toLowerCase()
      let path = `https://www.skyscanner.fr/transport/vols/${fc}/${tc}/${skyDate(date)}/`
      if (returnDate) path += `${skyDate(returnDate)}/`
      const p = new URLSearchParams({ adults: pax })
      if (cabin && cabin !== 'economy') p.set('cabinclass', CABIN_SKY[cabin] || 'economy')
      return `${path}?${p}`
    },
  },
  {
    id: 'kayak',
    nom: 'Kayak',
    couleur: '#ff690f',
    textColor: '#ffffff',
    emoji: '🔍',
    description: 'Comparateur puissant avec prévisions de prix (« acheter ou attendre ») et filtres avancés. Agrège des centaines de sites.',
    buildUrl({ from, to, date, returnDate, pax, cabin }) {
      const fc = iata(from)
      const tc = iata(to)
      let url = `https://www.kayak.fr/flights/${fc}-${tc}/${date}`
      if (returnDate) url += `/${returnDate}`
      const p = new URLSearchParams()
      if (pax > 1) p.set('adults', pax)
      if (cabin === 'business') p.set('fs', 'cabin=b')
      if (cabin === 'first') p.set('fs', 'cabin=f')
      const qs = p.toString()
      return qs ? `${url}?${qs}` : url
    },
  },
  {
    id: 'momondo',
    nom: 'Momondo',
    couleur: '#f0642a',
    textColor: '#ffffff',
    emoji: '🧡',
    description: 'Spécialiste des bons plans — trouve souvent les tarifs les plus bas en Europe et au Maghreb. Interface claire et rapide.',
    buildUrl({ from, to, date, returnDate, pax }) {
      const fc = iata(from)
      const tc = iata(to)
      let url = `https://www.momondo.fr/flight-search/${fc}-${tc}/${date}`
      if (returnDate) url += `/${returnDate}`
      if (pax > 1) url += `?adults=${pax}`
      return url
    },
  },
  {
    id: 'kiwi',
    nom: 'Kiwi.com',
    couleur: '#00a991',
    textColor: '#ffffff',
    emoji: '🥝',
    description: 'Combinateur d\'itinéraires créatifs — vols low-cost, correspondances et garantie de correspondance incluse.',
    buildUrl({ from, to, date, returnDate, pax }) {
      const fc = iata(from)
      const tc = iata(to)
      const ret = returnDate || 'no-return'
      const p = new URLSearchParams({ adults: pax })
      return `https://www.kiwi.com/fr/search/results/${fc}/${tc}/${date}/${ret}?${p}`
    },
  },
  {
    id: 'liligo',
    nom: 'Liligo',
    couleur: '#e4002b',
    textColor: '#ffffff',
    emoji: '🇫🇷',
    description: 'Comparateur français de référence — excellent pour le marché maghrébin et européen. Résultats multi-sources en un clic.',
    buildUrl({ from, to, date, returnDate, pax }) {
      const p = new URLSearchParams({
        from: iata(from),
        to: iata(to),
        departureDate: date,
        adults: pax,
      })
      if (returnDate) p.set('returnDate', returnDate)
      return `https://www.liligo.fr/resultats-vols?${p}`
    },
  },
  {
    id: 'edreams',
    nom: 'eDreams',
    couleur: '#ff6600',
    textColor: '#ffffff',
    emoji: '🌐',
    description: 'Grossiste européen — packages vols + hôtels à prix réduits. Prime pour économiser sur les vols charter et réguliers.',
    buildUrl({ from, to, date, returnDate, pax }) {
      const p = new URLSearchParams({
        locale: 'fr_FR',
        from: iata(from),
        to: iata(to),
        departureDate: date,
        adults: pax,
      })
      if (returnDate) p.set('returnDate', returnDate)
      return `https://www.edreams.fr/travel/?${p}`
    },
  },
  {
    id: 'expedia',
    nom: 'Expedia Vols',
    couleur: '#fbce07',
    textColor: '#002244',
    emoji: '💛',
    description: 'Combiner vol + hôtel pour économiser jusqu\'à 30 %. Large inventaire mondial et offres exclusives membres.',
    buildUrl({ from, to, date, returnDate, pax, cabin }) {
      const fc = iata(from)
      const tc = iata(to)
      const trip = returnDate ? 'roundtrip' : 'oneway'
      const leg1 = `from:${fc},to:${tc},departure:${expediaDate(date)}`
      const p = new URLSearchParams({
        trip,
        leg1,
        passengers: `adults:${pax}`,
        options: `cabinclass:${cabin === 'business' ? 'business' : cabin === 'first' ? 'first' : 'coach'}`,
      })
      if (returnDate) {
        p.set('leg2', `from:${tc},to:${fc},departure:${expediaDate(returnDate)}`)
      }
      return `https://www.expedia.fr/Flights-Search?${p}`
    },
  },
]
