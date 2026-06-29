/**
 * Génère un bloc fournisseurs complet à partir d'un profil pays compact.
 * Utilisé pour l'extension géographique (UE, Golfe, Asie, Amérique latine).
 */

/** @typedef {{ name: string, source: string, role?: 'Provider' | 'Fournisseur', primary?: boolean, phone?: string, email?: string, address?: string, website?: string }} ProviderEntry */

/**
 * @typedef {Object} CountryProfile
 * @property {string} name
 * @property {string} [capital]
 * @property {string} airline — compagnie aérienne nationale / principale
 * @property {string} [airlineSource]
 * @property {string} [rail] — opérateur ferroviaire
 * @property {string} [railSource]
 * @property {string} [carRental]
 * @property {string} [transfer]
 * @property {string} [transferSource]
 * @property {string} [ferry]
 * @property {string} [ferrySource]
 * @property {string} [dmc]
 * @property {string} [dmcSource]
 * @property {string} [tourismBoard]
 * @property {string} [insurance]
 * @property {string} [esim]
 * @property {string} [visa]
 * @property {string} [mice]
 * @property {string} [healthAuthority]
 * @property {string} [centralBank]
 * @property {string} [hotelChain]
 * @property {boolean} [schengen]
 */

/**
 * @param {string} name
 * @param {string} source
 * @param {'Provider' | 'Fournisseur'} [role]
 * @param {boolean} [primary]
 * @param {Record<string, object>} [contacts]
 * @returns {ProviderEntry}
 */
const entry = (name, source, role = 'Fournisseur', primary = false, contacts = {}) => ({
  name,
  source,
  role,
  ...(primary ? { primary: true } : {}),
  ...(contacts[name] ?? {}),
})

/**
 * @param {CountryProfile} profile
 * @param {Record<string, object>} contacts
 * @param {() => ProviderEntry[]} buildFlightProviders
 */
export const buildCountryProviders = (profile, contacts, buildFlightProviders) => {
  const c = profile.capital ?? profile.name
  const airlineSrc = profile.airlineSource ?? `Compagnie aérienne — ${c}`
  const railSrc = profile.railSource ?? `Réseau ferroviaire national — ${c}`
  const dmc = profile.dmc ?? `Local DMC ${profile.name}`
  const dmcSrc = profile.dmcSource ?? `Réceptif & excursions — ${profile.name}`
  const board = profile.tourismBoard ?? `Office du tourisme — ${profile.name}`
  const car = profile.carRental ?? `Europcar ${profile.name}`
  const transfer = profile.transfer ?? `Navettes aéroport — ${c}`
  const transferSrc = profile.transferSource ?? `Transferts aéroport & ville — ${c}`
  const ferry = profile.ferry ?? `Ferries ${profile.name}`
  const ferrySrc = profile.ferrySource ?? `Traversées maritimes — ${profile.name}`
  const insurance = profile.insurance ?? 'Allianz'
  const esim = profile.esim ?? 'Airalo'
  const visa = profile.visa ?? (profile.schengen ? 'VFS Global' : `e-Visa ${profile.name}`)
  const health = profile.healthAuthority ?? `Autorité sanitaire — ${profile.name}`
  const bank = profile.centralBank ?? `Banque centrale — ${profile.name}`
  const hotel = profile.hotelChain ?? `Hôtels locaux ${profile.name}`
  const mice = profile.mice ?? `Centre de congrès — ${c}`

  const airline = profile.airline
  const rail = profile.rail

  return {
    transfert: [
      entry(transfer, transferSrc, 'Fournisseur', true, contacts),
      entry('VTC / Uber', 'Transferts privés réglementés', 'Fournisseur', false, contacts),
      entry(`Agences transport ${profile.name}`, 'Navettes touristiques inter-villes', 'Fournisseur', false, contacts),
    ],
    location: [
      entry(car, `Loueur — réseau ${profile.name}`, 'Fournisseur', true, contacts),
      entry('Hertz France', 'Loueur international', 'Fournisseur', false, contacts),
      entry('Sixt France', 'Loueur international', 'Fournisseur', false, contacts),
    ],
    bagages: [
      entry(airline, `Franchises & excédents bagages — ${airline}`, 'Fournisseur', true, contacts),
      entry('Amadeus', 'GDS — SSR bagages', 'Provider', false, contacts),
    ],
    'billet-train': rail
      ? [entry(rail, railSrc, 'Fournisseur', true, contacts)]
      : [entry(`Transport rail ${profile.name}`, 'Réseau ferroviaire / métro', 'Fournisseur', true, contacts)],
    ferry: [
      entry(ferry, ferrySrc, 'Fournisseur', true, contacts),
    ],
    excursion: [
      entry(dmc, dmcSrc, 'Fournisseur', true, contacts),
      entry(`${board} Excursions`, 'Excursions officielles & partenaires', 'Fournisseur', false, contacts),
    ],
    'guide-local': [
      entry(board, `Guides agréés — ${profile.name}`, 'Fournisseur', true, contacts),
      entry(dmc, 'Guides francophones sur mesure', 'Fournisseur', false, contacts),
    ],
    circuit: [
      entry(dmc, `Circuits sur mesure — ${profile.name}`, 'Fournisseur', true, contacts),
      entry(`${board} Circuits`, 'Circuits organisés', 'Fournisseur', false, contacts),
    ],
    visa: [
      entry(visa, profile.schengen === false ? 'Portail visa électronique' : 'Centre visa Schengen / consulaire agréé', 'Fournisseur', true, contacts),
      entry('VFS Global', 'Centre visa agréé — multi-destinations', 'Fournisseur', false, contacts),
    ],
    assurance: [
      entry(insurance, `Assureur — multirisque voyage ${profile.name}`, 'Fournisseur', true, contacts),
      entry('AXA France', 'Assureur partenaire international', 'Fournisseur', false, contacts),
      entry('Allianz France', 'Assureur partenaire international', 'Fournisseur', false, contacts),
    ],
    'sante-voyage': [
      entry(health, 'Vaccins & recommandations officielles', 'Fournisseur', true, contacts),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      entry(mice, `Salons, séminaires & MICE — ${c}`, 'Fournisseur', true, contacts),
      entry(dmc, 'Incentives & team building', 'Fournisseur', false, contacts),
    ],
    'groupes-pro': [
      entry(`${airline} Groupes`, `Tarifs groupes aériens — ${airline}`, 'Fournisseur', true, contacts),
      ...(rail ? [entry(`${rail} Groupes`, 'Tarifs groupes ferroviaires', 'Fournisseur', false, contacts)] : []),
    ],
    lounge: [
      entry(`${airline} Lounge`, `Salon aéroport — ${airline}`, 'Fournisseur', true, contacts),
      entry('Priority Pass', 'Réseau lounges internationaux', 'Provider', false, contacts),
    ],
    conciergerie: [
      entry(`Conciergerie ${c} VIP`, 'Fast-track & meet & greet aéroport', 'Fournisseur', true, contacts),
      entry(dmc, 'Services VIP sur mesure', 'Fournisseur', false, contacts),
    ],
    'classe-affaires': [
      entry(airline, `Upgrade Business — ${airline}`, 'Fournisseur', true, contacts),
      entry('Amadeus', 'GDS — surclassement via GDS', 'Provider', false, contacts),
    ],
    esim: [
      entry(esim, `Opérateur local — forfaits data ${profile.name}`, 'Fournisseur', true, contacts),
      entry('Airalo', 'eSIM internationale', 'Provider', false, contacts),
    ],
    change: [
      entry(bank, 'Taux officiel & bureaux de change agréés', 'Fournisseur', true, contacts),
      entry('Travelex', 'Bureau de change aéroports', 'Fournisseur', false, contacts),
    ],
    assistance: [
      entry('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true, contacts),
      entry('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur', false, contacts),
    ],
    'wifi-voyage': [
      entry(`${esim} Pocket Wi-Fi`, `Location hotspot — ${profile.name}`, 'Fournisseur', true, contacts),
      entry('TravelWifi', 'Hotspot international', 'Provider', false, contacts),
    ],
    Vols: [
      entry('Amadeus', 'GDS Amadeus', 'Provider', true, contacts),
      entry(airline, airlineSrc, 'Fournisseur', false, contacts),
    ],
    Hotels: [
      entry('Booking.com', 'Plateforme OTA', 'Provider', false, contacts),
      entry('Hotelbeds', 'Bedbank API', 'Fournisseur', false, contacts),
      entry(hotel, 'Partenaires hôteliers locaux', 'Fournisseur', true, contacts),
    ],
    Transport: [
      entry(car, `Loueur — ${profile.name}`, 'Fournisseur', true, contacts),
    ],
    Tours: [
      entry(dmc, 'Réceptif local', 'Fournisseur', true, contacts),
    ],
  }
}

/**
 * @param {CountryProfile[]} profiles
 * @param {Record<string, object>} contacts
 * @param {() => ProviderEntry[]} buildFlightProviders
 * @returns {Record<string, Record<string, ProviderEntry[]>>}
 */
export const buildCountriesFromProfiles = (profiles, contacts, buildFlightProviders) =>
  Object.fromEntries(
    profiles.map(profile => [
      profile.name,
      buildCountryProviders(profile, contacts, buildFlightProviders),
    ]),
  )
