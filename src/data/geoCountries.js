/**
 * Pays, villes et indicatifs téléphoniques — création d'agence & paramètres.
 * Les champs ville et pays restent en saisie libre (datalist) pour les cas non listés.
 */

import { isBannedCountryCode } from './bannedCountries.js'

export const OTHER_COUNTRY = '__other__'

const MA_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda',
  'Tétouan', 'Safi', 'El Jadida', 'Kénitra', 'Nador', 'Settat', 'Béni Mellal',
  'Khouribga', 'Khémisset', 'Mohammedia', 'Laâyoune', 'Dakhla', 'Guelmim', 'Tiznit',
  'Ouarzazate', 'Errachidia', 'Taza', 'Al Hoceïma', 'Larache', 'Essaouira', 'Ifrane',
  'Azrou', 'Midelt', 'Taroudant', 'Berrechid', 'Inezgane', 'Salé', 'Témara',
]

export const COUNTRIES = [
  { code: 'MA', label: 'Maroc', dial: '+212', cities: MA_CITIES },
  { code: 'FR', label: 'France', dial: '+33', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Lille', 'Nantes', 'Strasbourg', 'Montpellier'] },
  { code: 'ES', label: 'Espagne', dial: '+34', cities: ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Malaga', 'Bilbao', 'Palma', 'Alicante'] },
  { code: 'BE', label: 'Belgique', dial: '+32', cities: ['Bruxelles', 'Anvers', 'Gand', 'Liège', 'Charleroi', 'Bruges'] },
  { code: 'DE', label: 'Allemagne', dial: '+49', cities: ['Berlin', 'Munich', 'Francfort', 'Hambourg', 'Cologne', 'Stuttgart', 'Düsseldorf'] },
  { code: 'IT', label: 'Italie', dial: '+39', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Venise', 'Bologne', 'Palerme'] },
  { code: 'GB', label: 'Royaume-Uni', dial: '+44', cities: ['Londres', 'Manchester', 'Birmingham', 'Édimbourg', 'Glasgow', 'Liverpool', 'Bristol'] },
  { code: 'PT', label: 'Portugal', dial: '+351', cities: ['Lisbonne', 'Porto', 'Faro', 'Coimbra', 'Braga'] },
  { code: 'NL', label: 'Pays-Bas', dial: '+31', cities: ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven'] },
  { code: 'CH', label: 'Suisse', dial: '+41', cities: ['Genève', 'Zurich', 'Bâle', 'Berne', 'Lausanne'] },
  { code: 'US', label: 'États-Unis', dial: '+1', cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'San Francisco', 'Washington'] },
  { code: 'CA', label: 'Canada', dial: '+1', cities: ['Montréal', 'Toronto', 'Vancouver', 'Ottawa', 'Calgary', 'Québec'] },
  { code: 'TN', label: 'Tunisie', dial: '+216', cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Djerba', 'Monastir'] },
  { code: 'DZ', label: 'Algérie', dial: '+213', cities: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tlemcen', 'Béjaïa'] },
  { code: 'EG', label: 'Égypte', dial: '+20', cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Louxor', 'Assouan', 'Hurghada', 'Charm el-Cheikh'] },
  { code: 'AE', label: 'Émirats arabes unis', dial: '+971', cities: ['Dubaï', 'Abou Dabi', 'Sharjah', 'Ajman', 'Ras el Khaïmah'] },
  { code: 'SA', label: 'Arabie saoudite', dial: '+966', cities: ['Riyad', 'Djeddah', 'La Mecque', 'Médine', 'Dammam', 'Taëf'] },
  { code: 'TR', label: 'Turquie', dial: '+90', cities: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa', 'Bodrum'] },
  { code: 'QA', label: 'Qatar', dial: '+974', cities: ['Doha', 'Al Wakrah', 'Al Khor'] },
  { code: 'SN', label: 'Sénégal', dial: '+221', cities: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack'] },
  { code: 'CI', label: "Côte d'Ivoire", dial: '+225', cities: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo'] },
].filter(country => !isBannedCountryCode(country.code))

const DIAL_PREFIXES = [...new Set(COUNTRIES.map(c => c.dial))].sort((a, b) => b.length - a.length)

export const getCountry = (code) => COUNTRIES.find(c => c.code === code) || null

export const resolvePaysLabel = ({ paysCode, paysLibre = '' }) => {
  if (paysCode === OTHER_COUNTRY) return paysLibre.trim()
  return getCountry(paysCode)?.label || ''
}

export const citiesForCountry = (paysCode) => {
  if (!paysCode || paysCode === OTHER_COUNTRY) return []
  return getCountry(paysCode)?.cities || []
}

/** Applique l'indicatif du pays ; conserve le numéro local si un indicatif était déjà présent. */
export const applyDialPrefix = (dial, phone = '', { onlyIfEmpty = false } = {}) => {
  if (!dial) return phone
  const trimmed = (phone || '').trim()
  if (onlyIfEmpty && trimmed) return trimmed

  let local = trimmed
  for (const prefix of DIAL_PREFIXES) {
    if (local.startsWith(prefix)) {
      local = local.slice(prefix.length).replace(/^[\s-]+/, '')
      break
    }
  }

  return local ? `${dial} ${local}` : `${dial} `
}

export const phonePlaceholder = (paysCode) => {
  const dial = getCountry(paysCode)?.dial
  if (paysCode === OTHER_COUNTRY) return '+…'
  return dial ? `${dial} …` : '+…'
}
