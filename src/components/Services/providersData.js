import { PROVIDER_CONTACTS } from './providerContacts.js'
import { buildCountriesFromProfiles } from './countryProfileBuilder.js'
import { EXTENDED_COUNTRY_PROFILES_TO_BUILD } from './extendedCountryProfiles.js'
import { AFRICA_COUNTRY_NAMES } from './africaCountryProfiles.js'
import {
  filterAllowedCountries,
  filterBannedProviders,
  isBannedCountry,
} from '../../data/bannedCountries.js'

export const DEFAULT_COUNTRY = 'Maroc'

/** @typedef {{ name: string, source: string, role: 'Provider' | 'Fournisseur', primary?: boolean, phone?: string, email?: string, address?: string, website?: string }} ProviderEntry */

export { PROVIDER_CONTACTS }

/** Canaux de sourcing vols — GDS principal + alternatives. */
export const FLIGHT_SOURCING = {
  GDS_principal: 'Amadeus',
  autres_options: ['Consolidateurs', 'Royal Air Maroc', 'OTA'],
}

const FLIGHT_OPTION_META = {
  Amadeus: { source: 'GDS Amadeus', role: 'Provider' },
  Consolidateurs: { source: 'Consolidateur tarifaire', role: 'Provider' },
  'Royal Air Maroc': { source: 'Compagnie aérienne nationale', role: 'Fournisseur' },
  OTA: { source: 'Plateforme OTA', role: 'Provider' },
}

/** @returns {ProviderEntry[]} */
export const buildFlightProviders = () => {
  const { GDS_principal, autres_options } = FLIGHT_SOURCING
  const primaryMeta = FLIGHT_OPTION_META[GDS_principal] ?? { source: GDS_principal, role: 'Provider' }
  return [
    { name: GDS_principal, ...primaryMeta, ...(PROVIDER_CONTACTS[GDS_principal] ?? {}), primary: true },
    ...autres_options.map(name => ({
      name,
      ...(FLIGHT_OPTION_META[name] ?? { source: name, role: 'Provider' }),
      ...(PROVIDER_CONTACTS[name] ?? {}),
    })),
  ]
}

const p = (name, source, role = 'Fournisseur', primary = false) => ({
  name,
  source,
  role,
  ...(primary ? { primary: true } : {}),
  ...(PROVIDER_CONTACTS[name] ?? {}),
})

/**
 * Fournisseurs par pays — clés = id service (prioritaire) ou catégorie legacy (fallback).
 * Pays détaillés manuellement ; les autres sont générés via countryProfileBuilder.
 */
const handCraftedProvidersData = {
  Maroc: {
    // ── Transport & Voyage ──
    transfert: [
      p('GMT / Supratours', 'Navettes aéroport & liaisons inter-villes', 'Fournisseur', true),
      p('CTM Voyages', 'Transferts touristiques & navettes', 'Fournisseur'),
      p('Petit taxi / Grand taxi', 'Réseau local réglementé', 'Fournisseur'),
    ],
    location: [
      p('Locatmane Cars', 'Loueur local — Casablanca, Marrakech, Agadir', 'Fournisseur', true),
      p('Hertz Maroc', 'Loueur international', 'Fournisseur'),
      p('Avis Maroc', 'Loueur international', 'Fournisseur'),
      p('Europcar Maroc', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Royal Air Maroc', 'Franchises & excédents bagages — vols AT', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('ONCF', 'Office National des Chemins de Fer — Al Boraq, TNR, trains régionaux', 'Fournisseur', true),
    ],
    ferry: [
      p('Baleària', 'Ferry Algeciras ↔ Tanger Med / Nador', 'Fournisseur', true),
      p('FRS', 'Ferry Tarifa ↔ Tanger Ville', 'Fournisseur'),
      p('GNV', 'Ferry Gênes ↔ Tanger Med (saisonnier)', 'Fournisseur'),
    ],
    // ── Tourisme ──
    excursion: [
      p('DMC Marrakech', 'Réceptif & excursions sud marocain', 'Fournisseur', true),
      p('Atlas Outdoor', 'Trek & aventure Haut Atlas', 'Fournisseur'),
      p('Marrakech Day Trips', 'Excursions journée depuis Marrakech', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés CNT', 'Centre National du Tourisme — guides officiels', 'Fournisseur', true),
      p('DMC Marrakech', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('DMC Marrakech', 'Circuits sur mesure Maroc', 'Fournisseur', true),
      p('Sahara Tours', 'Circuits désert & kasbahs', 'Fournisseur'),
      p('Atlas Voyages', 'Circuits culturels & Omra', 'Fournisseur'),
    ],
    // ── Administratif ──
    visa: [
      p('TLScontact', 'Centre visa agréé — Schengen, UK', 'Fournisseur', true),
      p('VFS Global', 'Centre visa agréé — multi-destinations', 'Fournisseur'),
    ],
    assurance: [
      p('Saham Assurance', 'Assureur local — multirisque voyage', 'Fournisseur', true),
      p('AXA Assurance Maroc', 'Assureur partenaire international', 'Fournisseur'),
      p('Allianz', 'Assureur partenaire international', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministère de la Santé MA', 'Vaccins & attestations officielles', 'Fournisseur', true),
      p('Cliniques internationales', 'Réseau clinique Casablanca / Rabat', 'Fournisseur'),
    ],
    // ── Corporate ──
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Mövenpick Mansour Eddahbi', 'Hôtel séminaire Marrakech', 'Fournisseur', true),
      p('Hyatt Regency Casablanca', 'MICE & événements corporate', 'Fournisseur'),
      p('DMC Marrakech', 'Team building & incentives', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Atlas Voyages', 'Groupes & délégations — tarifs négociés', 'Fournisseur', true),
      p('Royal Air Maroc', 'Groupes aériens AT', 'Fournisseur'),
    ],
    // ── Premium ──
    lounge: [
      p('Pearl Lounge CMN', 'Salon Mohamed V — Terminal 1 & 2', 'Fournisseur', true),
      p('Royal Air Maroc', 'Statut Safar Flyer — accès lounge', 'Fournisseur'),
    ],
    conciergerie: [
      p('Conciergerie Marrakech VIP', 'Meet & greet aéroport & fast-track', 'Fournisseur', true),
      p('DMC Marrakech', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Royal Air Maroc', 'Upgrade Business AT — routes long-courrier', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    // ── Additionnels ──
    esim: [
      p('inwi eSIM', 'Opérateur local — forfaits data voyage', 'Fournisseur', true),
      p('Maroc Telecom eSIM', 'Opérateur local — forfaits data', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Bank Al-Maghrib', 'Taux officiel & bureaux agréés', 'Fournisseur', true),
      p('Change groupé médina', 'Bureaux de change réglementés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance Maroc', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('inwi Pocket Wi-Fi', 'Location hotspot 4G/5G Maroc', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    // Legacy catégories (fallback)
    Vols: buildFlightProviders(),
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Riad & hôtels locaux', 'Partenaires direct Maroc', 'Fournisseur'),
    ],
    Transport: [
      p('Hertz Maroc', 'Loueur international', 'Fournisseur'),
      p('Avis Maroc', 'Loueur international', 'Fournisseur'),
    ],
    Tours: [
      p('DMC Marrakech', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  France: {
    transfert: [
      p('Le Bus Direct', 'Navettes aéroport Paris CDG / Orly', 'Fournisseur', true),
      p('VTC / Uber', 'Transferts privés réglementés', 'Fournisseur'),
      p('Les Cars Air France', 'Navettes Air France — aéroports', 'Fournisseur'),
    ],
    location: [
      p('Europcar', 'Loueur national — réseau France entière', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Air France', 'Franchises & excédents — vols AF', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('SNCF', 'SNCF Connect — TGV, Intercités, TER, OUIGO', 'Fournisseur', true),
      p('Eurostar', 'Liaison Paris ↔ Londres / Bruxelles', 'Fournisseur'),
      p('TGV Lyria', 'Liaison France ↔ Suisse', 'Fournisseur'),
    ],
    ferry: [
      p('Brittany Ferries', 'Ferry France ↔ UK / Espagne', 'Fournisseur', true),
      p('Corsica Ferries', 'Ferry continent ↔ Corse', 'Fournisseur'),
      p('DFDS', 'Ferry Dunkerque ↔ Dover', 'Fournisseur'),
    ],
    excursion: [
      p('Paris City Vision', 'Excursions Paris & région', 'Fournisseur', true),
      p('Fat Tire Tours', 'Visites guidées à vélo Paris', 'Fournisseur'),
      p('Local DMC France', 'Réceptif régional', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides conférenciers France', 'Guides agréés Ministère Culture', 'Fournisseur', true),
      p('Paris City Vision', 'Guides francophones certifiés', 'Fournisseur'),
    ],
    circuit: [
      p('Paris City Vision', 'Circuits France & Europe', 'Fournisseur', true),
      p('Local DMC France', 'Circuits sur mesure', 'Fournisseur'),
    ],
    visa: [
      p('France-Visas', 'Portail officiel visa France', 'Fournisseur', true),
      p('VFS Global', 'Centre visa agréé', 'Fournisseur'),
      p('Capago', 'Centre visa agréé', 'Fournisseur'),
    ],
    assurance: [
      p('MAIF', 'Assureur mutualiste — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Santé publique France', 'Vaccins & recommandations officielles', 'Fournisseur', true),
      p('Institut Pasteur', 'Vaccinations voyage', 'Fournisseur'),
    ],
    'voyage-affaires': [
      p('Amadeus', 'GDS corporate — facturation entreprise', 'Provider', true),
      p('Sabre', 'GDS corporate', 'Provider'),
      p('Air France Pro', 'Programme corporate Air France', 'Fournisseur'),
    ],
    mice: [
      p('Accor Arena / Novotel', 'Séminaires & MICE Accor', 'Fournisseur', true),
      p('Palais des Congrès Paris', 'Événements grande capacité', 'Fournisseur'),
      p('Local DMC France', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Air France Groupes', 'Tarifs groupes aériens AF', 'Fournisseur', true),
      p('SNCF Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('Air France Lounge', 'Salons Air France — hubs CDG / Orly', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Paris VIP', 'Fast-track & meet & greet CDG', 'Fournisseur', true),
      p('Local DMC France', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Air France', 'Upgrade Business / La Première', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Orange Travel eSIM', 'Opérateur français — forfaits roaming', 'Fournisseur', true),
      p('SFR Voyage', 'Forfaits data international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports France', 'Fournisseur', true),
      p('Banque de France', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Orange Pocket Wi-Fi', 'Location hotspot 4G/5G France', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Sabre', 'GDS Sabre', 'Provider'),
      p('Air France', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Accor', 'Chaîne hôtelière française', 'Fournisseur', true),
      p('Expedia', 'Plateforme OTA', 'Provider'),
    ],
    Transport: [
      p('Europcar', 'Loueur national', 'Fournisseur', true),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    Tours: [
      p('Paris City Vision', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Tunisie: {
    transfert: [
      p('Taxi Tunis', 'Transferts aéroport Tunis-Carthage', 'Fournisseur', true),
      p('SOTUVER', 'Navettes inter-villes', 'Fournisseur'),
      p('Louage / taxi collectif', 'Réseau local réglementé', 'Fournisseur'),
    ],
    location: [
      p('SIXT Tunisie', 'Loueur international', 'Fournisseur', true),
      p('Hertz Tunisie', 'Loueur international', 'Fournisseur'),
      p('Avis Tunisie', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Tunisair', 'Franchises & excédents — vols TU', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('SNCFT', 'Société Nationale des Chemins de Fer Tunisiens — TGV & régional', 'Fournisseur', true),
    ],
    ferry: [
      p('CTN', 'Compagnie Tunisienne de Navigation — ferry Tunis ↔ Marseille / Gênes', 'Fournisseur', true),
      p('Grimaldi Lines', 'Ferry Tunis ↔ Civitavecchia', 'Fournisseur'),
    ],
    excursion: [
      p('DMC Tunis', 'Excursions Carthage, Sidi Bou Saïd, désert', 'Fournisseur', true),
      p('Sahara Tours Tunisie', 'Excursions sud tunisien', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés ONTT', 'Office National du Tourisme Tunisien', 'Fournisseur', true),
      p('DMC Tunis', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('DMC Tunis', 'Circuits sur mesure Tunisie', 'Fournisseur', true),
      p('Sahara Tours Tunisie', 'Circuits désert & ksour', 'Fournisseur'),
    ],
    visa: [
      p('VFS Global Tunis', 'Centre visa agréé', 'Fournisseur', true),
    ],
    assurance: [
      p('STAR Assurances', 'Assureur local — multirisque voyage', 'Fournisseur', true),
      p('AXA Tunisie', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministère de la Santé TN', 'Vaccins & attestations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': [
      p('Amadeus', 'GDS corporate', 'Provider', true),
      p('Tunisair', 'Programme corporate Tunisair', 'Fournisseur'),
    ],
    mice: [
      p('Hôtel Africa Tunis', 'Séminaires & MICE Tunis', 'Fournisseur', true),
      p('DMC Tunis', 'Événements & incentives', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Tunisair Groupes', 'Tarifs groupes aériens TU', 'Fournisseur', true),
      p('SNCFT Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('Tunisair Lounge', 'Salon Tunis-Carthage — vols TU', 'Fournisseur', true),
    ],
    conciergerie: [
      p('Conciergerie Tunis VIP', 'Meet & greet aéroport Tunis', 'Fournisseur', true),
      p('DMC Tunis', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Tunisair', 'Upgrade Business TU', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Ooredoo Tunisie eSIM', 'Opérateur local — forfaits data', 'Fournisseur', true),
      p('Orange Tunisie', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Banque Centrale de Tunisie', 'Taux officiel & bureaux agréés', 'Fournisseur', true),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance Tunisie', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Ooredoo Pocket Wi-Fi', 'Location hotspot 4G Tunisie', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Tunisair', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Hôtels locaux Tunisie', 'Partenaires direct réceptifs', 'Fournisseur'),
    ],
    Transport: [
      p('Hertz Tunisie', 'Loueur international', 'Fournisseur'),
      p('Avis Tunisie', 'Loueur international', 'Fournisseur'),
    ],
    Tours: [
      p('DMC Tunis', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Algérie: {
    transfert: [
      p('Transub / SETRAM', 'Navettes aéroport Alger & tramway', 'Fournisseur', true),
      p('Taxi Alger', 'Transferts privés réglementés', 'Fournisseur'),
      p('Agences transport touristique', 'Navettes inter-wilayas', 'Fournisseur'),
    ],
    location: [
      p('Europcar Algérie', 'Loueur international — Alger, Oran', 'Fournisseur', true),
      p('Hertz Algérie', 'Loueur international', 'Fournisseur'),
      p('Location locale agréée', 'Loueurs locaux partenaires', 'Fournisseur'),
    ],
    bagages: [
      p('Air Algérie', 'Franchises & excédents — vols AH', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('SNTF Algérie', 'Société Nationale des Transports Ferroviaires — Coradia, TNR', 'Fournisseur', true),
    ],
    ferry: [
      p('Algérie Ferries', 'Ferry Alger ↔ Marseille / Alicante', 'Fournisseur', true),
      p('Baleària', 'Ferry Algeciras ↔ Oran / Mostaganem', 'Fournisseur'),
    ],
    excursion: [
      p('DMC Alger', 'Excursions Kabylie, Sahara, côte', 'Fournisseur', true),
      p('Agences réceptives Oran', 'Excursions ouest algérien', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés ONTA', 'Office National du Tourisme Algérien', 'Fournisseur', true),
      p('DMC Alger', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('DMC Alger', 'Circuits sur mesure Algérie', 'Fournisseur', true),
      p('Sahara Algérie Tours', 'Circuits désert & oasis', 'Fournisseur'),
    ],
    visa: [
      p('CAAT Algérie', 'Centre agréé visas Schengen & consulaires', 'Fournisseur', true),
      p('VFS Global', 'Centre visa agréé — multi-destinations', 'Fournisseur'),
    ],
    assurance: [
      p('CAAR', 'Caisse Algérienne d\'Assurance & Réassurance', 'Fournisseur', true),
      p('AXA Algérie', 'Assureur partenaire international', 'Fournisseur'),
      p('Allianz', 'Assureur partenaire international', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministère de la Santé DZ', 'Vaccins & attestations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Hôtel El Aurassi Alger', 'Séminaires & MICE Alger', 'Fournisseur', true),
      p('DMC Alger', 'Événements & incentives', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Air Algérie', 'Tarifs groupes aériens AH', 'Fournisseur', true),
      p('SNTF Algérie', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('Air Algérie Lounge', 'Salon Houari Boumediene — vols AH', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Alger VIP', 'Meet & greet aéroport Alger', 'Fournisseur', true),
      p('DMC Alger', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Air Algérie', 'Upgrade Business AH', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Mobilis eSIM', 'Opérateur local — forfaits data', 'Fournisseur', true),
      p('Djezzy eSIM', 'Opérateur local — forfaits data', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Banque d\'Algérie', 'Taux officiel & bureaux agréés', 'Fournisseur', true),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Mobilis Pocket Wi-Fi', 'Location hotspot 4G Algérie', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Air Algérie', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Hôtels locaux Algérie', 'Partenaires direct réceptifs', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar Algérie', 'Loueur international', 'Fournisseur', true),
    ],
    Tours: [
      p('DMC Alger', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Espagne: {
    transfert: [
      p('Aerobús Barcelona', 'Navettes aéroport El Prat', 'Fournisseur', true),
      p('EMT Madrid', 'Navettes aéroport Barajas', 'Fournisseur'),
      p('VTC / Cabify', 'Transferts privés réglementés', 'Fournisseur'),
    ],
    location: [
      p('Europcar España', 'Loueur national — réseau Espagne', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Iberia', 'Franchises & excédents — vols IB', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('Renfe', 'Renfe — AVE, AVLO, Media Distancia, Cercanías', 'Fournisseur', true),
      p('SNCF', 'Liaisons transfrontalières France ↔ Espagne', 'Fournisseur'),
    ],
    ferry: [
      p('Baleària España', 'Ferry Barcelone ↔ Baleares / Maroc', 'Fournisseur', true),
      p('Baleària', 'Ferry Algeciras ↔ Tanger Med', 'Fournisseur'),
      p('Grimaldi Lines', 'Ferry Barcelone ↔ Civitavecchia', 'Fournisseur'),
    ],
    excursion: [
      p('Local DMC Espagne', 'Excursions Madrid, Barcelone, Andalousie', 'Fournisseur', true),
      p('Julia Travel', 'Visites guidées Espagne', 'Fournisseur'),
    ],
    'guide-local': [
      p('Instituto Cervantes', 'Guides certifiés & culture', 'Fournisseur', true),
      p('Local DMC Espagne', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC Espagne', 'Circuits sur mesure Espagne', 'Fournisseur', true),
      p('Julia Travel', 'Circuits organisés Espagne', 'Fournisseur'),
    ],
    visa: [
      p('BLS International', 'Centre visa Schengen agréé', 'Fournisseur', true),
      p('VFS Global', 'Centre visa agréé', 'Fournisseur'),
    ],
    assurance: [
      p('Mapfre', 'Assureur espagnol — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministerio de Sanidad', 'Vaccins & recommandations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('IFEMA Madrid', 'Palais des congrès Madrid', 'Fournisseur', true),
      p('Local DMC Espagne', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Iberia Groupes', 'Tarifs groupes aériens IB', 'Fournisseur', true),
      p('Renfe Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('Iberia Lounge', 'Salons Iberia — Madrid Barajas', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Madrid VIP', 'Fast-track & meet & greet', 'Fournisseur', true),
      p('Local DMC Espagne', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Iberia', 'Upgrade Business IB', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Movistar eSIM', 'Opérateur espagnol — forfaits data', 'Fournisseur', true),
      p('Orange Travel eSIM', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports Espagne', 'Fournisseur', true),
      p('Banco de España', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Movistar Pocket Wi-Fi', 'Location hotspot 4G Espagne', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Iberia', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Meliá Hotels', 'Chaîne hôtelière espagnole', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar España', 'Loueur national', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC Espagne', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Italie: {
    transfert: [
      p('Terravision', 'Navettes aéroport Rome Fiumicino / Ciampino', 'Fournisseur', true),
      p('Alilaguna', 'Navettes aéroport Venise', 'Fournisseur'),
      p('VTC / Uber', 'Transferts privés réglementés', 'Fournisseur'),
    ],
    location: [
      p('Europcar', 'Loueur international — réseau Italie', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('ITA Airways', 'Franchises & excédents — vols AZ', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('Trenitalia', 'Frecciarossa, Intercity, régional', 'Fournisseur', true),
      p('Italo', 'TGV privé italien — Rome, Milan, Naples', 'Fournisseur'),
    ],
    ferry: [
      p('GNV Italie', 'Ferry Gênes ↔ Palerme / Tunis', 'Fournisseur', true),
      p('Grimaldi Lines', 'Ferry Civitavecchia ↔ Barcelone / Tunis', 'Fournisseur'),
      p('Tirrenia', 'Ferry continent ↔ Sardaigne / Sicile', 'Fournisseur'),
    ],
    excursion: [
      p('Local DMC Italie', 'Excursions Rome, Florence, Venise', 'Fournisseur', true),
      p('City Wonders', 'Visites guidées Italie', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés ENIT', 'Ente Nazionale Italiano Turismo', 'Fournisseur', true),
      p('Local DMC Italie', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC Italie', 'Circuits sur mesure Italie', 'Fournisseur', true),
      p('City Wonders', 'Circuits organisés Italie', 'Fournisseur'),
    ],
    visa: [
      p('VFS Global', 'Centre visa Schengen agréé', 'Fournisseur', true),
      p('Capago', 'Centre visa agréé', 'Fournisseur'),
    ],
    assurance: [
      p('Generali Italia', 'Assureur italien — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministero della Salute', 'Vaccins & recommandations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Fiera Milano', 'Salons & congrès Milan', 'Fournisseur', true),
      p('Local DMC Italie', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('ITA Airways Groupes', 'Tarifs groupes aériens AZ', 'Fournisseur', true),
      p('Trenitalia Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('ITA Airways Lounge', 'Salons Fiumicino & Malpensa', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Rome VIP', 'Fast-track & meet & greet Fiumicino', 'Fournisseur', true),
      p('Local DMC Italie', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('ITA Airways', 'Upgrade Business AZ', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('TIM eSIM', 'Opérateur italien — forfaits data', 'Fournisseur', true),
      p('Vodafone Italia', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports Italie', 'Fournisseur', true),
      p('Banca d\'Italia', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('TIM Pocket Wi-Fi', 'Location hotspot 4G Italie', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('ITA Airways', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('NH Hotels', 'Chaîne hôtelière européenne', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar', 'Loueur international', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC Italie', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Portugal: {
    transfert: [
      p('Aerobus Lisboa', 'Navettes aéroport Humberto Delgado', 'Fournisseur', true),
      p('Metro do Porto', 'Transferts aéroport Porto', 'Fournisseur'),
      p('VTC / Bolt', 'Transferts privés réglementés', 'Fournisseur'),
    ],
    location: [
      p('Europcar Portugal', 'Loueur national — Lisbonne, Porto', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('TAP Air Portugal', 'Franchises & excédents — vols TP', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('CP Comboios', 'Alfa Pendular, Intercidades, régional', 'Fournisseur', true),
    ],
    ferry: [
      p('Transtejo', 'Ferry Lisbonne ↔ Cacilhas / Trafaria', 'Fournisseur', true),
      p('Atlantic Ferries', 'Ferry continent ↔ Açores / Madère', 'Fournisseur'),
    ],
    excursion: [
      p('Local DMC Portugal', 'Excursions Lisbonne, Porto, Algarve', 'Fournisseur', true),
      p('Living Tours', 'Visites guidées Portugal', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés Turismo de Portugal', 'Guides officiels Portugal', 'Fournisseur', true),
      p('Local DMC Portugal', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC Portugal', 'Circuits sur mesure Portugal', 'Fournisseur', true),
      p('Living Tours', 'Circuits organisés Portugal', 'Fournisseur'),
    ],
    visa: [
      p('VFS Global', 'Centre visa Schengen agréé', 'Fournisseur', true),
    ],
    assurance: [
      p('Fidelidade', 'Assureur portugais — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministério da Saúde', 'Vaccins & recommandations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Feira Internacional de Lisboa', 'Congrès & MICE Lisbonne', 'Fournisseur', true),
      p('Local DMC Portugal', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('TAP Groupes', 'Tarifs groupes aériens TP', 'Fournisseur', true),
      p('CP Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('TAP Lounge', 'Salons TAP — Lisbonne & Porto', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Lisboa VIP', 'Fast-track & meet & greet', 'Fournisseur', true),
      p('Local DMC Portugal', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('TAP Air Portugal', 'Upgrade Business TP', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('MEO eSIM', 'Opérateur portugais — forfaits data', 'Fournisseur', true),
      p('NOS Voyage', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports Portugal', 'Fournisseur', true),
      p('Banco de Portugal', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('MEO Pocket Wi-Fi', 'Location hotspot 4G Portugal', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('TAP Air Portugal', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Pestana Hotels', 'Chaîne hôtelière portugaise', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar Portugal', 'Loueur national', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC Portugal', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Belgique: {
    transfert: [
      p('STIB / MIVB', 'Métro & navettes aéroport Bruxelles', 'Fournisseur', true),
      p('De Lijn', 'Navettes aéroport Anvers', 'Fournisseur'),
      p('VTC / Uber', 'Transferts privés réglementés', 'Fournisseur'),
    ],
    location: [
      p('Europcar Belgique', 'Loueur national — Bruxelles, Anvers', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Brussels Airlines', 'Franchises & excédents — vols SN', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('SNCB / NMBS', 'Thalys, IC, regional — réseau belge', 'Fournisseur', true),
      p('Eurostar', 'Liaison Bruxelles ↔ Londres / Paris', 'Fournisseur'),
    ],
    ferry: [
      p('DFDS', 'Ferry Dunkerque ↔ Dover (depuis Belgique)', 'Fournisseur', true),
    ],
    excursion: [
      p('Local DMC Belgique', 'Excursions Bruxelles, Bruges, Gand', 'Fournisseur', true),
      p('Brussels City Tours', 'Visites guidées Belgique', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés Visit.brussels', 'Guides officiels Bruxelles', 'Fournisseur', true),
      p('Local DMC Belgique', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC Belgique', 'Circuits sur mesure Belgique', 'Fournisseur', true),
      p('Brussels City Tours', 'Circuits organisés Benelux', 'Fournisseur'),
    ],
    visa: [
      p('VFS Global', 'Centre visa Schengen agréé', 'Fournisseur', true),
      p('Capago', 'Centre visa agréé', 'Fournisseur'),
    ],
    assurance: [
      p('AG Insurance', 'Assureur belge — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('SPF Santé publique', 'Vaccins & recommandations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Brussels Expo', 'Salons & congrès Bruxelles', 'Fournisseur', true),
      p('Local DMC Belgique', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Brussels Airlines Groupes', 'Tarifs groupes aériens SN', 'Fournisseur', true),
      p('SNCB Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('Brussels Airlines Lounge', 'Salons Zaventem', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Bruxelles VIP', 'Fast-track & meet & greet Zaventem', 'Fournisseur', true),
      p('Local DMC Belgique', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Brussels Airlines', 'Upgrade Business SN', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Proximus eSIM', 'Opérateur belge — forfaits data', 'Fournisseur', true),
      p('Orange Travel eSIM', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports Belgique', 'Fournisseur', true),
      p('Banque Nationale de Belgique', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Proximus Pocket Wi-Fi', 'Location hotspot 4G Belgique', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Brussels Airlines', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Accor', 'Chaîne hôtelière — réseau Belgique', 'Fournisseur'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar Belgique', 'Loueur national', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC Belgique', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Suisse: {
    transfert: [
      p('SBB RailAir', 'Navettes aéroport Zurich / Genève', 'Fournisseur', true),
      p('TPG Genève', 'Transports publics Genève', 'Fournisseur'),
      p('VTC / Uber', 'Transferts privés réglementés', 'Fournisseur'),
    ],
    location: [
      p('Europcar Suisse', 'Loueur national — Genève, Zurich', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('SWISS', 'Franchises & excédents — vols LX', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('SBB CFF FFS', 'InterCity, RegioExpress, Glacier Express', 'Fournisseur', true),
      p('TGV Lyria', 'Liaison Paris ↔ Genève / Lausanne', 'Fournisseur'),
    ],
    ferry: [
      p('CGN Lac Léman', 'Traversées lac Léman — Genève, Lausanne', 'Fournisseur', true),
    ],
    excursion: [
      p('Local DMC Suisse', 'Excursions Alpes, lacs, villes', 'Fournisseur', true),
      p('Best of Switzerland Tours', 'Visites guidées Suisse', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés MySwitzerland', 'Guides officiels Suisse', 'Fournisseur', true),
      p('Local DMC Suisse', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC Suisse', 'Circuits sur mesure Suisse', 'Fournisseur', true),
      p('Best of Switzerland Tours', 'Circuits organisés Suisse', 'Fournisseur'),
    ],
    visa: [
      p('VFS Global', 'Centre visa Schengen agréé', 'Fournisseur', true),
    ],
    assurance: [
      p('Swiss Life', 'Assureur suisse — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('OFSP', 'Office fédéral santé publique — recommandations', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Palexpo Genève', 'Salons & congrès Genève', 'Fournisseur', true),
      p('Local DMC Suisse', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('SWISS Groupes', 'Tarifs groupes aériens LX', 'Fournisseur', true),
      p('SBB Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('SWISS Lounge', 'Salons Zurich & Genève', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Genève VIP', 'Fast-track & meet & greet', 'Fournisseur', true),
      p('Local DMC Suisse', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('SWISS', 'Upgrade Business LX', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Swisscom eSIM', 'Opérateur suisse — forfaits data', 'Fournisseur', true),
      p('Salt Voyage', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports Suisse', 'Fournisseur', true),
      p('Banque Nationale Suisse', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Swisscom Pocket Wi-Fi', 'Location hotspot 4G Suisse', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('SWISS', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Accor', 'Chaîne hôtelière — réseau Suisse', 'Fournisseur'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar Suisse', 'Loueur national', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC Suisse', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  'Royaume-Uni': {
    transfert: [
      p('Heathrow Express', 'Navette rapide Paddington ↔ Heathrow', 'Fournisseur', true),
      p('Gatwick Express', 'Navette Victoria ↔ Gatwick', 'Fournisseur'),
      p('VTC / Uber', 'Transferts privés réglementés', 'Fournisseur'),
    ],
    location: [
      p('Europcar UK', 'Loueur national — Londres, Écosse', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('British Airways', 'Franchises & excédents — vols BA', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('National Rail UK', 'LNER, Avanti, GWR — réseau britannique', 'Fournisseur', true),
      p('Eurostar UK', 'Liaison Londres ↔ Paris / Bruxelles', 'Fournisseur'),
    ],
    ferry: [
      p('P&O Ferries', 'Ferry Dover ↔ Calais', 'Fournisseur', true),
      p('DFDS', 'Ferry Newcastle ↔ Amsterdam', 'Fournisseur'),
      p('Brittany Ferries', 'Ferry Portsmouth ↔ France / Espagne', 'Fournisseur'),
    ],
    excursion: [
      p('Local DMC UK', 'Excursions Londres, Écosse, Pays de Galles', 'Fournisseur', true),
      p('Golden Tours', 'Visites guidées Royaume-Uni', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés VisitBritain', 'Guides officiels UK', 'Fournisseur', true),
      p('Local DMC UK', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC UK', 'Circuits sur mesure Royaume-Uni', 'Fournisseur', true),
      p('Golden Tours', 'Circuits organisés UK & Irlande', 'Fournisseur'),
    ],
    visa: [
      p('VFS Global UK', 'Centre visa agréé', 'Fournisseur', true),
      p('TLScontact', 'Centre visa agréé — Schengen depuis UK', 'Fournisseur'),
    ],
    assurance: [
      p('Aviva UK', 'Assureur britannique — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('NHS Travel Health', 'Vaccins & recommandations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('ExCeL London', 'Salons & congrès Londres', 'Fournisseur', true),
      p('Local DMC UK', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('British Airways Groupes', 'Tarifs groupes aériens BA', 'Fournisseur', true),
      p('National Rail Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('British Airways Lounge', 'Salons Heathrow Terminal 5', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Heathrow VIP', 'Fast-track & meet & greet', 'Fournisseur', true),
      p('Local DMC UK', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('British Airways', 'Upgrade Club World BA', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('EE Travel eSIM', 'Opérateur britannique — forfaits data', 'Fournisseur', true),
      p('Vodafone UK', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports UK', 'Fournisseur', true),
      p('Bank of England', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('EE Pocket Wi-Fi', 'Location hotspot 4G UK', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('British Airways', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Premier Inn', 'Chaîne hôtelière britannique', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar UK', 'Loueur national', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC UK', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Turquie: {
    transfert: [
      p('Havaist', 'Navettes aéroport Istanbul', 'Fournisseur', true),
      p('Metro Istanbul', 'Transports publics Istanbul', 'Fournisseur'),
      p('Careem', 'VTC & transferts privés', 'Fournisseur'),
    ],
    location: [
      p('Europcar Turquie', 'Loueur international — Istanbul, Antalya', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Avis Maroc', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Turkish Airlines', 'Franchises & excédents — vols TK', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('TCDD', 'YHT haute vitesse — Istanbul, Ankara, Konya', 'Fournisseur', true),
    ],
    ferry: [
      p('İDO Ferries', 'Traversées Istanbul — Marmara & îles', 'Fournisseur', true),
      p('GNV Italie', 'Ferry Mersin ↔ Chypre / Méditerranée', 'Fournisseur'),
    ],
    excursion: [
      p('Local DMC Turquie', 'Excursions Istanbul, Cappadoce, côte', 'Fournisseur', true),
      p('Turkey Tour Organizer', 'Visites guidées Turquie', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés TGA', 'Turizm Genel Müdürlüğü', 'Fournisseur', true),
      p('Local DMC Turquie', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC Turquie', 'Circuits sur mesure Turquie', 'Fournisseur', true),
      p('Turkey Tour Organizer', 'Circuits organisés Turquie', 'Fournisseur'),
    ],
    visa: [
      p('VFS Global', 'Centre visa agréé', 'Fournisseur', true),
      p('e-Visa Turquie', 'Portail officiel visa électronique', 'Fournisseur'),
    ],
    assurance: [
      p('Anadolu Sigorta', 'Assureur turc — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministère de la Santé TR', 'Vaccins & recommandations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Istanbul Congress Center', 'Salons & congrès Istanbul', 'Fournisseur', true),
      p('Local DMC Turquie', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Turkish Airlines Groupes', 'Tarifs groupes aériens TK', 'Fournisseur', true),
      p('TCDD Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('Turkish Airlines Lounge', 'Salons Istanbul — hub TK', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Istanbul VIP', 'Fast-track & meet & greet', 'Fournisseur', true),
      p('Local DMC Turquie', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Turkish Airlines', 'Upgrade Business TK', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Turkcell eSIM', 'Opérateur turc — forfaits data', 'Fournisseur', true),
      p('Vodafone Türkiye', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports Turquie', 'Fournisseur', true),
      p('TCMB', 'Banque centrale — taux officiel', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Turkcell Pocket Wi-Fi', 'Location hotspot 4G Turquie', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Turkish Airlines', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Dedeman Hotels', 'Chaîne hôtelière turque', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar Turquie', 'Loueur international', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC Turquie', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Égypte: {
    transfert: [
      p('Cairo Airport Shuttle', 'Navettes aéroport Le Caire', 'Fournisseur', true),
      p('Uber Égypte', 'Transferts privés réglementés', 'Fournisseur'),
      p('Agences transport touristique', 'Navettes Hurghada / Sharm', 'Fournisseur'),
    ],
    location: [
      p('Europcar Égypte', 'Loueur international — Le Caire, Hurghada', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('EgyptAir', 'Franchises & excédents — vols MS', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('ENR', 'Egyptian National Railways — Le Caire, Louxor, Assouan', 'Fournisseur', true),
    ],
    ferry: [
      p('Red Sea Ferries', 'Traversées Hurghada ↔ Sharm el-Sheikh', 'Fournisseur', true),
      p('Nile River Cruises', 'Croisières Nil — Louxor / Assouan', 'Fournisseur'),
    ],
    excursion: [
      p('Local DMC Égypte', 'Excursions pyramides, Louxor, Mer Rouge', 'Fournisseur', true),
      p('Egypt Excursions Online', 'Visites guidées Égypte', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés ETA', 'Egyptian Tourism Authority', 'Fournisseur', true),
      p('Local DMC Égypte', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Local DMC Égypte', 'Circuits sur mesure Égypte', 'Fournisseur', true),
      p('Egypt Excursions Online', 'Circuits organisés Égypte', 'Fournisseur'),
    ],
    visa: [
      p('e-Visa Égypte', 'Portail officiel visa électronique', 'Fournisseur', true),
      p('VFS Global', 'Centre visa agréé', 'Fournisseur'),
    ],
    assurance: [
      p('Misr Insurance', 'Assureur égyptien — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministère de la Santé EG', 'Vaccins & attestations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Egypt International Exhibition Center', 'Salons & congrès Le Caire', 'Fournisseur', true),
      p('Local DMC Égypte', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('EgyptAir Groupes', 'Tarifs groupes aériens MS', 'Fournisseur', true),
      p('ENR Groupes', 'Tarifs groupes ferroviaires', 'Fournisseur'),
    ],
    lounge: [
      p('EgyptAir Lounge', 'Salons Le Caire & Hurghada', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Le Caire VIP', 'Fast-track & meet & greet', 'Fournisseur', true),
      p('Local DMC Égypte', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('EgyptAir', 'Upgrade Business MS', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Vodafone Égypte eSIM', 'Opérateur local — forfaits data', 'Fournisseur', true),
      p('Orange Égypte', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports Égypte', 'Fournisseur', true),
      p('Banque centrale d\'Égypte', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Vodafone Pocket Wi-Fi', 'Location hotspot 4G Égypte', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('EgyptAir', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Steigenberger Hotels', 'Chaîne hôtelière Égypte', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar Égypte', 'Loueur international', 'Fournisseur', true),
    ],
    Tours: [
      p('Local DMC Égypte', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  'Émirats arabes unis': {
    transfert: [
      p('Careem', 'VTC & transferts Dubaï / Abu Dhabi', 'Fournisseur', true),
      p('RTA Dubai', 'Métro & navettes aéroport Dubaï', 'Fournisseur'),
      p('Abu Dhabi Airport Transfer', 'Transferts aéroport AUH', 'Fournisseur'),
    ],
    location: [
      p('Europcar', 'Loueur international — Dubaï, Abu Dhabi', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Sixt France', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Emirates', 'Franchises & excédents — vols EK', 'Fournisseur', true),
      p('Etihad', 'Franchises & excédents — vols EY', 'Fournisseur'),
    ],
    'billet-train': [
      p('Etihad Rail', 'Réseau ferroviaire EAU — Abu Dhabi ↔ Dubaï', 'Fournisseur', true),
    ],
    ferry: [
      p('Abu Dhabi Ferries', 'Traversées îles & côte EAU', 'Fournisseur', true),
    ],
    excursion: [
      p('Dubai DMC', 'Excursions désert, Dubaï, Abu Dhabi', 'Fournisseur', true),
      p('Gray Line Dubai', 'Visites guidées EAU', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés DTCM', 'Department of Tourism Dubai', 'Fournisseur', true),
      p('Dubai DMC', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('Dubai DMC', 'Circuits sur mesure EAU', 'Fournisseur', true),
      p('Gray Line Dubai', 'Circuits organisés EAU', 'Fournisseur'),
    ],
    visa: [
      p('e-Visa EAU', 'Portail officiel visa électronique', 'Fournisseur', true),
      p('VFS Global', 'Centre visa agréé', 'Fournisseur'),
    ],
    assurance: [
      p('Oman Insurance', 'Assureur EAU — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministère de la Santé EAU', 'Vaccins & recommandations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('Dubai World Trade Centre', 'Salons & congrès Dubaï', 'Fournisseur', true),
      p('Dubai DMC', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Emirates Groupes', 'Tarifs groupes aériens EK', 'Fournisseur', true),
      p('Etihad Groupes', 'Tarifs groupes aériens EY', 'Fournisseur'),
    ],
    lounge: [
      p('Emirates Lounge', 'Salons Dubaï Terminal 3', 'Fournisseur', true),
      p('Etihad Lounge', 'Salons Abu Dhabi', 'Fournisseur'),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Dubaï VIP', 'Fast-track & meet & greet DXB', 'Fournisseur', true),
      p('Dubai DMC', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Emirates', 'Upgrade Business EK', 'Fournisseur', true),
      p('Etihad', 'Upgrade Business EY', 'Fournisseur'),
    ],
    esim: [
      p('du', 'Opérateur EAU — forfaits data & eSIM', 'Fournisseur', true),
      p('Etisalat eSIM', 'Opérateur EAU — forfaits data', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Travelex', 'Bureau de change aéroports EAU', 'Fournisseur', true),
      p('Banque centrale EAU', 'Taux officiel & bureaux agréés', 'Fournisseur'),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('du Pocket Wi-Fi', 'Location hotspot 5G EAU', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Emirates', 'Compagnie aérienne EAU', 'Fournisseur'),
      p('Etihad', 'Compagnie aérienne Abu Dhabi', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Jumeirah Hotels', 'Chaîne hôtelière EAU', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar', 'Loueur international', 'Fournisseur', true),
    ],
    Tours: [
      p('Dubai DMC', 'Réceptif local', 'Fournisseur', true),
    ],
  },

  Sénégal: {
    transfert: [
      p('TER Sénégal', 'Train express régional — Dakar', 'Fournisseur', true),
      p('Taxi Dakar', 'Transferts aéroport Blaise Diagne', 'Fournisseur'),
      p('Agences transport touristique', 'Navettes côte & régions', 'Fournisseur'),
    ],
    location: [
      p('Europcar Sénégal', 'Loueur international — Dakar', 'Fournisseur', true),
      p('Hertz France', 'Loueur international', 'Fournisseur'),
      p('Avis Maroc', 'Loueur international', 'Fournisseur'),
    ],
    bagages: [
      p('Air Senegal', 'Franchises & excédents — vols HC', 'Fournisseur', true),
      p('Amadeus', 'GDS — SSR bagages', 'Provider'),
    ],
    'billet-train': [
      p('TER Sénégal', 'Train express régional Dakar ↔ Diamniadio', 'Fournisseur', true),
    ],
    ferry: [
      p('Balearia Sénégal', 'Traversées Dakar ↔ îles', 'Fournisseur', true),
    ],
    excursion: [
      p('DMS Sénégal', 'Excursions Dakar, Lac Rose, Casamance', 'Fournisseur', true),
      p('Senegal Tours', 'Visites guidées Sénégal', 'Fournisseur'),
    ],
    'guide-local': [
      p('Guides agréés ASP', 'Agence Sénégalaise de Promotion touristique', 'Fournisseur', true),
      p('DMS Sénégal', 'Guides francophones sur mesure', 'Fournisseur'),
    ],
    circuit: [
      p('DMS Sénégal', 'Circuits sur mesure Sénégal', 'Fournisseur', true),
      p('Senegal Tours', 'Circuits organisés Sénégal', 'Fournisseur'),
    ],
    visa: [
      p('e-Visa Sénégal', 'Portail officiel visa électronique', 'Fournisseur', true),
      p('VFS Global', 'Centre visa agréé', 'Fournisseur'),
    ],
    assurance: [
      p('NSIA Assurances', 'Assureur sénégalais — multirisque voyage', 'Fournisseur', true),
      p('AXA France', 'Assureur partenaire', 'Fournisseur'),
      p('Allianz France', 'Assureur partenaire', 'Fournisseur'),
    ],
    'sante-voyage': [
      p('Ministère de la Santé SN', 'Vaccins & attestations officielles', 'Fournisseur', true),
    ],
    'voyage-affaires': buildFlightProviders(),
    mice: [
      p('CICAD Dakar', 'Centre international de conférences', 'Fournisseur', true),
      p('DMS Sénégal', 'Incentives & team building', 'Fournisseur'),
    ],
    'groupes-pro': [
      p('Air Senegal Groupes', 'Tarifs groupes aériens HC', 'Fournisseur', true),
    ],
    lounge: [
      p('Air Senegal Lounge', 'Salon Blaise Diagne — vols HC', 'Fournisseur', true),
      p('Priority Pass', 'Réseau lounges internationaux', 'Provider'),
    ],
    conciergerie: [
      p('Conciergerie Dakar VIP', 'Meet & greet aéroport Blaise Diagne', 'Fournisseur', true),
      p('DMS Sénégal', 'Services VIP sur mesure', 'Fournisseur'),
    ],
    'classe-affaires': [
      p('Air Senegal', 'Upgrade Business HC', 'Fournisseur', true),
      p('Amadeus', 'GDS — surclassement via GDS', 'Provider'),
    ],
    esim: [
      p('Orange Sénégal eSIM', 'Opérateur local — forfaits data', 'Fournisseur', true),
      p('Free Sénégal', 'Forfaits roaming international', 'Fournisseur'),
      p('Airalo', 'eSIM internationale', 'Provider'),
    ],
    change: [
      p('Banque centrale UEMOA', 'Taux officiel & bureaux agréés', 'Fournisseur', true),
    ],
    assistance: [
      p('Rihla Assistance 24/7', 'Hotline agence — réorganisation voyage', 'Fournisseur', true),
      p('Europ Assistance France', 'Assistance médicale & rapatriement', 'Fournisseur'),
    ],
    'wifi-voyage': [
      p('Orange Pocket Wi-Fi', 'Location hotspot 4G Sénégal', 'Fournisseur', true),
      p('TravelWifi', 'Hotspot international', 'Provider'),
    ],
    Vols: [
      p('Amadeus', 'GDS Amadeus', 'Provider', true),
      p('Air Senegal', 'Compagnie aérienne nationale', 'Fournisseur'),
    ],
    Hotels: [
      p('Booking.com', 'Plateforme OTA', 'Provider'),
      p('Hotelbeds', 'Bedbank API', 'Fournisseur'),
      p('Radisson Hotel Dakar', 'Hôtel partenaire MICE', 'Fournisseur'),
    ],
    Transport: [
      p('Europcar Sénégal', 'Loueur international', 'Fournisseur', true),
    ],
    Tours: [
      p('DMS Sénégal', 'Réceptif local', 'Fournisseur', true),
    ],
  },
}

const generatedProvidersData = buildCountriesFromProfiles(
  EXTENDED_COUNTRY_PROFILES_TO_BUILD.filter(profile => !isBannedCountry(profile.name)),
  PROVIDER_CONTACTS,
  buildFlightProviders,
)

const mergeProvidersData = (generated, handCrafted) => {
  const merged = { ...generated, ...handCrafted }
  return Object.fromEntries(
    Object.entries(merged)
      .filter(([country]) => !isBannedCountry(country))
      .map(([country, services]) => [
        country,
        Object.fromEntries(
          Object.entries(services).map(([serviceId, providers]) => [
            serviceId,
            filterBannedProviders(providers),
          ]),
        ),
      ]),
  )
}

/** Pays manuels prioritaires sur les profils générés. Israël exclu. */
export const providersData = mergeProvidersData(generatedProvidersData, handCraftedProvidersData)

export const SERVICE_TO_PROVIDER_KEY = {
  visa: 'Visa',
  assurance: 'Assurance',
  location: 'Transport',
  transfert: 'Transport',
  'billet-train': 'Transport',
  ferry: 'Transport',
  excursion: 'Tours',
  'guide-local': 'Tours',
  circuit: 'Tours',
  'classe-affaires': 'Vols',
  bagages: 'Vols',
  'voyage-affaires': 'Vols',
  mice: 'Hotels',
  'groupes-pro': 'Hotels',
  lounge: 'Vols',
  conciergerie: 'Tours',
}

/** Ordre d'affichage des pays dans les sélecteurs. */
export const SERVICE_COUNTRIES = [
  // Maghreb
  'Maroc',
  'Algérie',
  'Tunisie',
  // Union européenne (27)
  'Allemagne',
  'Autriche',
  'Belgique',
  'Bulgarie',
  'Chypre',
  'Croatie',
  'Danemark',
  'Espagne',
  'Estonie',
  'Finlande',
  'France',
  'Grèce',
  'Hongrie',
  'Irlande',
  'Italie',
  'Lettonie',
  'Lituanie',
  'Luxembourg',
  'Malte',
  'Pays-Bas',
  'Pologne',
  'Portugal',
  'République tchèque',
  'Roumanie',
  'Slovaquie',
  'Slovénie',
  'Suède',
  // Europe élargie
  'Royaume-Uni',
  'Suisse',
  'Turquie',
  'Russie',
  'Géorgie',
  'Arménie',
  'Azerbaïdjan',
  // Moyen-Orient & Golfe
  'Égypte',
  'Émirats arabes unis',
  'Arabie saoudite',
  'Qatar',
  'Koweït',
  'Bahreïn',
  'Oman',
  'Jordanie',
  'Liban',
  'Iran',
  'Irak',
  'Palestine',
  'Yémen',
  // Asie
  'Chine',
  'Japon',
  'Corée du Sud',
  'Inde',
  'Thaïlande',
  'Vietnam',
  'Indonésie',
  'Malaisie',
  'Singapour',
  'Philippines',
  'Pakistan',
  'Sri Lanka',
  'Cambodge',
  'Népal',
  'Kazakhstan',
  'Ouzbékistan',
  // Afrique (54 pays)
  ...AFRICA_COUNTRY_NAMES,
  // Amérique latine
  'Mexique',
  'Brésil',
  'Argentine',
  'Colombie',
  'Chili',
  'Pérou',
  'Uruguay',
  'Équateur',
  'Panama',
  'Costa Rica',
  'Cuba',
  'République dominicaine',
  'Bolivie',
  'Paraguay',
  'Venezuela',
  'Guatemala',
]

export const getCountries = () =>
  filterAllowedCountries(SERVICE_COUNTRIES.filter(country => country in providersData))

export const getProviderTypesForCountry = (country) =>
  Object.keys(providersData[country] || {})

export const getProviderEntries = (country, key) =>
  providersData[country]?.[key] ?? []

/** Fournisseurs pour un service : d'abord par id service, puis fallback catégorie. */
export const getProvidersForService = (country, service) => {
  if (!service || isBannedCountry(country)) return []
  const data = providersData[country] ?? {}
  if (data[service.id]?.length) return filterBannedProviders(data[service.id])
  const key = getProviderKeyForService(service)
  if (!key) return []
  return filterBannedProviders(data[key] ?? [])
}

export const getProviderKeyForService = (service) => {
  if (!service) return null
  if (service.providerKey) return service.providerKey
  return SERVICE_TO_PROVIDER_KEY[service.id] ?? null
}

export const findProviderEntry = (country, service, providerName) =>
  getProvidersForService(country, service).find(p => p.name === providerName) ?? null

export const formatProviderLabel = (entry) =>
  entry ? `${entry.name} · ${entry.source} (${entry.role})` : ''

/** Fournisseur principal (badge) pour un service et un pays. */
export const getPrimaryProvider = (country, service) =>
  getProvidersForService(country, service).find(p => p.primary) ?? null
