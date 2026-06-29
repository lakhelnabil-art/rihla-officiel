/**
 * Coordonnées publiques et sites de réservation commerciale par fournisseur.
 * Clé = nom exact du fournisseur dans providersData.
 */

/** @typedef {{ phone?: string, email?: string, address?: string, website?: string }} ProviderContact */

/** @type {Record<string, ProviderContact>} */
export const PROVIDER_CONTACTS = {
  // ── Rail ──
  ONCF: {
    phone: '+212 5 22 54 54 54',
    email: 'contact@oncf.ma',
    address: 'Av. Hassan II, Rabat, Maroc',
    website: 'https://www.oncf-voyages.ma',
  },
  SNCF: {
    phone: '+33 3635',
    email: 'contact@sncf-connect.com',
    address: '2 place aux Étoiles, 93200 Saint-Denis, France',
    website: 'https://www.sncf-connect.com',
  },
  'SNCF Groupes': {
    phone: '+33 892 35 35 35',
    email: 'groupes@sncf.fr',
    address: '2 place aux Étoiles, 93200 Saint-Denis, France',
    website: 'https://www.sncf-voyageurs.com/fr/services-agences-voyage/groupes',
  },
  Eurostar: {
    phone: '+33 1 70 70 60 88',
    website: 'https://www.eurostar.com/fr-fr',
    address: 'Gare du Nord, Paris, France',
  },
  'TGV Lyria': {
    phone: '+33 896 35 35 35',
    website: 'https://www.tgv-lyria.com/fr',
    address: 'Paris, France',
  },
  SNCFT: {
    phone: '+216 71 345 000',
    email: 'contact@sncft.com.tn',
    address: 'Place Barcelone, Tunis, Tunisie',
    website: 'https://www.sncft.com.tn',
  },
  'SNCFT Groupes': {
    phone: '+216 71 345 000',
    website: 'https://www.sncft.com.tn',
    address: 'Place Barcelone, Tunis, Tunisie',
  },

  // ── Ferries ──
  Baleària: {
    phone: '+212 5 39 94 04 04',
    website: 'https://www.balearia.com/fr',
    address: 'Tanger Med, Maroc',
  },
  FRS: {
    phone: '+212 5 39 94 05 05',
    website: 'https://www.frs.es/fr',
    address: 'Tanger Ville, Maroc',
  },
  GNV: {
    phone: '+39 010 209 4591',
    website: 'https://www.gnv.it/fr',
    address: 'Gênes, Italie — liaison Tanger Med',
  },
  'Brittany Ferries': {
    phone: '+33 2 98 44 44 44',
    website: 'https://www.brittany-ferries.fr',
    address: 'Roscoff / Cherbourg, France',
  },
  'Corsica Ferries': {
    phone: '+33 4 95 32 95 95',
    website: 'https://www.corsica-ferries.fr',
    address: 'Nice / Toulon, France',
  },
  DFDS: {
    phone: '+33 2 32 14 36 00',
    website: 'https://www.dfds.com/fr-fr',
    address: 'Dunkerque, France',
  },
  CTN: {
    phone: '+216 71 341 022',
    email: 'contact@ctn.com.tn',
    website: 'https://www.ctn.com.tn',
    address: 'La Goulette, Tunis, Tunisie',
  },
  'Grimaldi Lines': {
    phone: '+39 081 496 444',
    website: 'https://www.grimaldi-lines.com/fr',
    address: 'Tunis ↔ Civitavecchia',
  },

  // ── Airlines ──
  'Royal Air Maroc': {
    phone: '+212 5 22 48 97 97',
    email: 'contact@royalairmaroc.com',
    address: 'Aéroport Mohammed V, Nouaceur, Maroc',
    website: 'https://www.royalairmaroc.com/fr-fr',
  },
  'Air France': {
    phone: '+33 36 54',
    website: 'https://wwws.airfrance.fr',
    address: 'Roissy CDG, France',
  },
  'Air France Pro': {
    phone: '+33 1 56 93 70 00',
    website: 'https://corporate.airfrance.com/fr',
    address: 'Paris, France',
  },
  'Air France Groupes': {
    phone: '+33 1 56 93 70 00',
    website: 'https://wwws.airfrance.fr/fr/information/groupes',
    address: 'Paris, France',
  },
  Tunisair: {
    phone: '+216 71 330 000',
    email: 'contact@tunisair.com.tn',
    website: 'https://www.tunisair.com',
    address: 'Aéroport Tunis-Carthage, Tunisie',
  },
  'Tunisair Groupes': {
    phone: '+216 71 330 000',
    website: 'https://www.tunisair.com/fr/groupes',
    address: 'Tunis-Carthage, Tunisie',
  },

  // ── GDS / OTA ──
  Amadeus: {
    phone: '+33 4 97 16 48 00',
    website: 'https://www.amadeus.com/fr',
    address: '485 Route du Pin Montard, Sophia Antipolis, France',
  },
  Sabre: {
    phone: '+1 682 605 1000',
    website: 'https://www.sabre.com',
    address: 'Southlake, Texas, USA',
  },
  Consolidateurs: {
    website: 'https://www.lufthansa-city-center.com',
    address: 'Via réseau consolidateur agréé',
  },
  OTA: {
    website: 'https://www.skyscanner.fr',
    address: 'Plateformes OTA partenaires',
  },
  'Booking.com': {
    phone: '+31 20 712 5000',
    website: 'https://www.booking.com',
    address: 'Amsterdam, Pays-Bas',
  },
  Expedia: {
    website: 'https://www.expedia.fr',
    address: 'Seattle, USA',
  },
  Hotelbeds: {
    phone: '+34 971 92 11 00',
    website: 'https://www.hotelbeds.com',
    address: 'Palma de Mallorca, Espagne',
  },

  // ── Location ──
  'Locatmane Cars': {
    phone: '+212 5 22 98 98 98',
    email: 'contact@locatmane.com',
    website: 'https://www.locatmane.com',
    address: 'Casablanca, Maroc',
  },
  'Hertz Maroc': {
    phone: '+212 5 22 53 53 53',
    website: 'https://www.hertz.ma',
    address: 'Casablanca, Maroc',
  },
  'Avis Maroc': {
    phone: '+212 5 22 43 43 43',
    website: 'https://www.avis.ma',
    address: 'Casablanca, Maroc',
  },
  'Europcar Maroc': {
    phone: '+212 5 22 44 44 44',
    website: 'https://www.europcar.ma',
    address: 'Casablanca, Maroc',
  },
  Europcar: {
    phone: '+33 825 358 758',
    website: 'https://www.europcar.fr',
    address: 'Saint-Quentin-en-Yvelines, France',
  },
  'Hertz France': {
    phone: '+33 825 886 886',
    website: 'https://www.hertz.fr',
    address: 'Paris, France',
  },
  'Sixt France': {
    phone: '+33 1 70 98 98 98',
    website: 'https://www.sixt.fr',
    address: 'Pullach, Allemagne — réseau France',
  },
  'SIXT Tunisie': {
    phone: '+216 71 793 000',
    website: 'https://www.sixt.tn',
    address: 'Tunis-Carthage, Tunisie',
  },
  'Hertz Tunisie': {
    phone: '+216 71 754 000',
    website: 'https://www.hertz.tn',
    address: 'Tunis, Tunisie',
  },
  'Avis Tunisie': {
    phone: '+216 71 755 000',
    website: 'https://www.avis.tn',
    address: 'Tunis, Tunisie',
  },

  // ── Transferts ──
  'GMT / Supratours': {
    phone: '+212 5 37 67 67 67',
    website: 'https://www.supratours.ma',
    address: 'Rabat, Maroc',
  },
  'CTM Voyages': {
    phone: '+212 5 22 54 75 75',
    website: 'https://www.ctm.ma',
    address: 'Casablanca, Maroc',
  },
  'Le Bus Direct': {
    phone: '+33 1 84 80 05 00',
    website: 'https://www.lebusdirect.com',
    address: 'Paris CDG / Orly, France',
  },
  'Les Cars Air France': {
    phone: '+33 892 68 32 00',
    website: 'https://www.cars-airfrance.fr',
    address: 'Paris, France',
  },
  'VTC / Uber': {
    website: 'https://www.uber.com/fr/fr/',
    address: 'France — réservation via application',
  },
  SOTUVER: {
    phone: '+216 71 341 341',
    website: 'https://www.sotuver.com.tn',
    address: 'Tunis, Tunisie',
  },

  // ── Visa ──
  TLScontact: {
    phone: '+212 5 22 54 80 80',
    website: 'https://fr.tlscontact.com/ma',
    address: 'Casablanca, Maroc',
  },
  'VFS Global': {
    phone: '+212 5 22 48 80 80',
    website: 'https://visa.vfsglobal.com/mar/fr',
    address: 'Casablanca, Maroc',
  },
  'France-Visas': {
    website: 'https://france-visas.gouv.fr',
    address: 'Portail officiel — Ministère de l\'Intérieur, France',
  },
  Capago: {
    phone: '+33 1 84 80 80 80',
    website: 'https://www.capago.fr',
    address: 'Paris, France',
  },
  'VFS Global Tunis': {
    phone: '+216 71 964 000',
    website: 'https://visa.vfsglobal.com/tun/fr',
    address: 'Tunis, Tunisie',
  },

  // ── Assurance ──
  'Saham Assurance': {
    phone: '+212 5 22 42 42 42',
    website: 'https://www.sahamassurance.ma',
    address: 'Casablanca, Maroc',
  },
  'AXA Assurance Maroc': {
    phone: '+212 5 22 42 12 12',
    website: 'https://www.axa.ma',
    address: 'Casablanca, Maroc',
  },
  Allianz: {
    phone: '+212 5 22 95 95 95',
    website: 'https://www.allianz.ma',
    address: 'Casablanca, Maroc',
  },
  MAIF: {
    phone: '+33 800 623 623',
    website: 'https://www.maif.fr',
    address: 'Niort, France',
  },
  'AXA France': {
    phone: '+33 1 40 75 48 48',
    website: 'https://www.axa.fr',
    address: 'Paris, France',
  },
  'Allianz France': {
    phone: '+33 1 55 92 75 75',
    website: 'https://www.allianz.fr',
    address: 'Paris, France',
  },
  'STAR Assurances': {
    phone: '+216 71 789 000',
    website: 'https://www.star.com.tn',
    address: 'Tunis, Tunisie',
  },
  'AXA Tunisie': {
    phone: '+216 71 184 000',
    website: 'https://www.axa.tn',
    address: 'Tunis, Tunisie',
  },

  // ── Tourisme ──
  'DMC Marrakech': {
    phone: '+212 5 24 44 00 00',
    email: 'contact@dmc-marrakech.ma',
    website: 'https://www.visitmorocco.com',
    address: 'Marrakech, Maroc',
  },
  'Paris City Vision': {
    phone: '+33 1 44 55 60 00',
    website: 'https://www.pariscityvision.com',
    address: 'Paris, France',
  },
  'DMC Tunis': {
    phone: '+216 71 341 000',
    website: 'https://www.discovertunisia.com',
    address: 'Tunis, Tunisie',
  },
  Accor: {
    phone: '+33 1 45 38 86 00',
    website: 'https://all.accor.com',
    address: 'Issy-les-Moulineaux, France',
  },

  // ── Lounges ──
  'Pearl Lounge CMN': {
    phone: '+212 5 22 53 90 00',
    website: 'https://www.pearl-lounge.com',
    address: 'Terminal 1 & 2, Aéroport Mohammed V, Casablanca',
  },
  'Air France Lounge': {
    website: 'https://wwws.airfrance.fr/fr/information/aeroport/salons',
    address: 'CDG / Orly, France',
  },
  'Priority Pass': {
    website: 'https://www.prioritypass.com/fr',
    address: 'Réseau international de lounges',
  },
  'Tunisair Lounge': {
    phone: '+216 71 330 000',
    website: 'https://www.tunisair.com',
    address: 'Tunis-Carthage, Tunisie',
  },

  // ── eSIM / connectivité ──
  'inwi eSIM': {
    phone: '+212 5 29 00 00 00',
    website: 'https://www.inwi.ma',
    address: 'Casablanca, Maroc',
  },
  'Maroc Telecom eSIM': {
    phone: '+212 5 22 94 94 94',
    website: 'https://www.iam.ma',
    address: 'Rabat, Maroc',
  },
  Airalo: {
    website: 'https://www.airalo.com/fr',
    address: 'eSIM internationale — réservation en ligne',
  },
  'Orange Travel eSIM': {
    phone: '+33 3900',
    website: 'https://travel.orange.com/fr',
    address: 'France',
  },
  'Ooredoo Tunisie eSIM': {
    phone: '+216 32 000 000',
    website: 'https://www.ooredoo.tn',
    address: 'Tunis, Tunisie',
  },

  // ── Assistance ──
  'Europ Assistance Maroc': {
    phone: '+212 5 22 54 54 54',
    website: 'https://www.europassistance.ma',
    address: 'Casablanca, Maroc',
  },
  'Europ Assistance France': {
    phone: '+33 1 41 85 85 85',
    website: 'https://www.europassistance.fr',
    address: 'Saint-Ouen, France',
  },
  'Europ Assistance Tunisie': {
    phone: '+216 71 964 000',
    website: 'https://www.europassistance.tn',
    address: 'Tunis, Tunisie',
  },

  // ── Santé ──
  'Institut Pasteur': {
    phone: '+33 1 45 68 80 00',
    website: 'https://www.pasteur.fr/fr/centre-medical/preparation-voyage',
    address: '25-28 Rue du Docteur Roux, 75015 Paris',
  },

  // ── Change ──
  Travelex: {
    phone: '+33 1 49 19 20 20',
    website: 'https://www.travelex.fr',
    address: 'Aéroports France',
  },
  TravelWifi: {
    website: 'https://www.travelwifi.com/fr',
    address: 'Location hotspot international',
  },

  // ── Algérie ──
  'Air Algérie': {
    phone: '+213 21 98 63 63',
    email: 'contact@airalgerie.dz',
    website: 'https://www.airalgerie.dz',
    address: 'Aéroport Houari Boumediene, Alger, Algérie',
  },
  'SNTF Algérie': {
    phone: '+213 21 63 66 00',
    website: 'https://www.sntf.dz',
    address: 'Gare d\'Alger, Algérie',
  },
  'Europcar Algérie': {
    phone: '+213 21 98 98 98',
    website: 'https://www.europcar.dz',
    address: 'Alger, Algérie',
  },
  'Algérie Ferries': {
    phone: '+213 21 63 21 63',
    website: 'https://www.algerieferries.dz',
    address: 'Port d\'Alger — liaisons Marseille / Alicante',
  },
  'DMC Alger': {
    phone: '+213 21 74 00 00',
    website: 'https://www.algerietourism.com',
    address: 'Alger, Algérie',
  },
  'CAAT Algérie': {
    website: 'https://www.caat.dz',
    address: 'Centre de visas agréé — Alger, Algérie',
  },

  // ── Espagne ──
  Renfe: {
    phone: '+34 912 320 320',
    website: 'https://www.renfe.com',
    address: 'Madrid, Espagne',
  },
  Iberia: {
    phone: '+34 901 111 500',
    website: 'https://www.iberia.com/fr',
    address: 'Madrid-Barajas, Espagne',
  },
  'Europcar España': {
    phone: '+34 902 105 055',
    website: 'https://www.europcar.es',
    address: 'Madrid, Espagne',
  },
  'Baleària España': {
    phone: '+34 902 160 180',
    website: 'https://www.balearia.com/es',
    address: 'Barcelona / Algeciras, Espagne',
  },
  'Local DMC Espagne': {
    website: 'https://www.spain.info/fr',
    address: 'Réceptif régional — Madrid, Barcelone, Andalousie',
  },
  'Instituto Cervantes': {
    website: 'https://www.cervantes.es',
    address: 'Guides & culture — réseau Espagne',
  },

  // ── Italie ──
  Trenitalia: {
    phone: '+39 06 68475475',
    website: 'https://www.trenitalia.com',
    address: 'Rome, Italie',
  },
  Italo: {
    phone: '+39 06 5098',
    website: 'https://www.italotreno.it',
    address: 'Réseau TGV italien — Rome, Milan, Naples',
  },
  'ITA Airways': {
    phone: '+39 06 65649',
    website: 'https://www.ita-airways.com/fr',
    address: 'Fiumicino, Rome, Italie',
  },
  'GNV Italie': {
    phone: '+39 010 209 4591',
    website: 'https://www.gnv.it/fr',
    address: 'Gênes, Italie — ferries Méditerranée',
  },
  'Local DMC Italie': {
    website: 'https://www.italia.it/fr',
    address: 'Réceptif — Rome, Florence, Venise',
  },

  // ── Portugal ──
  'CP Comboios': {
    phone: '+351 707 210 220',
    website: 'https://www.cp.pt',
    address: 'Lisbonne, Portugal',
  },
  'TAP Air Portugal': {
    phone: '+351 218 415 000',
    website: 'https://www.flytap.com/fr-fr',
    address: 'Aéroport Humberto Delgado, Lisbonne',
  },
  'Europcar Portugal': {
    phone: '+351 808 202 020',
    website: 'https://www.europcar.pt',
    address: 'Lisbonne, Portugal',
  },
  'Local DMC Portugal': {
    website: 'https://www.visitportugal.com/fr',
    address: 'Réceptif — Lisbonne, Porto, Algarve',
  },

  // ── Belgique ──
  'SNCB / NMBS': {
    phone: '+32 2 528 28 28',
    website: 'https://www.belgiantrain.be/fr',
    address: 'Bruxelles-Midi, Belgique',
  },
  'Brussels Airlines': {
    phone: '+32 2 723 23 62',
    website: 'https://www.brusselsairlines.com/fr-fr',
    address: 'Aéroport de Bruxelles-Zaventem',
  },
  'Europcar Belgique': {
    phone: '+32 2 725 02 02',
    website: 'https://www.europcar.be/fr-be',
    address: 'Bruxelles, Belgique',
  },
  'Local DMC Belgique': {
    website: 'https://www.visitbelgium.com/fr',
    address: 'Réceptif — Bruxelles, Bruges, Anvers',
  },

  // ── Suisse ──
  'SBB CFF FFS': {
    phone: '+41 848 44 66 88',
    website: 'https://www.sbb.ch/fr',
    address: 'Bern, Suisse',
  },
  SWISS: {
    phone: '+41 848 700 700',
    website: 'https://www.swiss.com/fr/fr',
    address: 'Aéroport de Zurich, Suisse',
  },
  'Europcar Suisse': {
    phone: '+41 844 80 80 80',
    website: 'https://www.europcar.ch/fr',
    address: 'Genève / Zurich, Suisse',
  },
  'Local DMC Suisse': {
    website: 'https://www.myswitzerland.com/fr-fr',
    address: 'Réceptif — Genève, Zurich, Lucerne',
  },

  // ── Royaume-Uni ──
  'National Rail UK': {
    phone: '+44 345 748 4950',
    website: 'https://www.nationalrail.co.uk',
    address: 'Réseau ferroviaire britannique',
  },
  'Eurostar UK': {
    phone: '+44 343 218 6186',
    website: 'https://www.eurostar.com/fr-fr',
    address: 'St Pancras International, Londres',
  },
  'British Airways': {
    phone: '+44 344 493 0787',
    website: 'https://www.britishairways.com/fr-fr',
    address: 'Heathrow, Londres, Royaume-Uni',
  },
  'P&O Ferries': {
    phone: '+44 1304 44 88 88',
    website: 'https://www.poferries.com/fr',
    address: 'Dover ↔ Calais',
  },
  'Europcar UK': {
    phone: '+44 371 384 3400',
    website: 'https://www.europcar.co.uk',
    address: 'Londres, Royaume-Uni',
  },
  'Local DMC UK': {
    website: 'https://www.visitbritain.com/fr',
    address: 'Réceptif — Londres, Écosse, Pays de Galles',
  },
  'VFS Global UK': {
    website: 'https://visa.vfsglobal.com/gbr/fr',
    address: 'Centres visa agréés — Londres, UK',
  },

  // ── Turquie ──
  TCDD: {
    phone: '+90 444 8233',
    website: 'https://www.tcdd.gov.tr',
    address: 'Ankara, Turquie',
  },
  'Turkish Airlines': {
    phone: '+90 850 333 0849',
    website: 'https://www.turkishairlines.com/fr-fr',
    address: 'Aéroport Istanbul, Turquie',
  },
  'İDO Ferries': {
    phone: '+90 850 222 4436',
    website: 'https://www.ido.com.tr',
    address: 'Traversées Istanbul — îles & Marmara',
  },
  'Local DMC Turquie': {
    website: 'https://www.goturkiye.com/fr',
    address: 'Réceptif — Istanbul, Cappadoce, côte égéenne',
  },
  'Europcar Turquie': {
    website: 'https://www.europcar.com.tr',
    address: 'Istanbul / Antalya, Turquie',
  },

  // ── Égypte ──
  EgyptAir: {
    phone: '+20 2 2696 6800',
    website: 'https://www.egyptair.com/fr',
    address: 'Aéroport du Caire, Égypte',
  },
  ENR: {
    website: 'https://www.enr.gov.eg',
    address: 'Egyptian National Railways — Le Caire, Louxor',
  },
  'Local DMC Égypte': {
    website: 'https://www.egypt.travel/fr',
    address: 'Réceptif — Le Caire, Louxor, Mer Rouge',
  },
  'Europcar Égypte': {
    website: 'https://www.europcar.com.eg',
    address: 'Le Caire / Hurghada, Égypte',
  },

  // ── Émirats arabes unis ──
  Emirates: {
    phone: '+971 600 555555',
    website: 'https://www.emirates.com/fr/french',
    address: 'Dubai International Airport, EAU',
  },
  Etihad: {
    phone: '+971 600 555666',
    website: 'https://www.etihad.com/fr-fr',
    address: 'Abu Dhabi International Airport, EAU',
  },
  Careem: {
    website: 'https://www.careem.com',
    address: 'VTC & transferts — Dubaï, Abu Dhabi',
  },
  'Dubai DMC': {
    website: 'https://www.visitdubai.com/fr',
    address: 'Réceptif & excursions — Dubaï, Abu Dhabi',
  },
  du: {
    phone: '+971 800 155',
    website: 'https://www.du.ae/fr',
    address: 'Opérateur eSIM & data — EAU',
  },

  // ── Sénégal ──
  'Air Senegal': {
    phone: '+221 33 869 69 69',
    website: 'https://www.flyairsenegal.com',
    address: 'Aéroport Blaise Diagne, Dakar, Sénégal',
  },
  'DMS Sénégal': {
    website: 'https://www.visitsenegal.com',
    address: 'Réceptif — Dakar, Saint-Louis, Casamance',
  },
  'TER Sénégal': {
    website: 'https://www.ter-senegal.sn',
    address: 'Train express régional — Dakar',
  },
  'Europcar Sénégal': {
    website: 'https://www.europcar.sn',
    address: 'Dakar, Sénégal',
  },

  // ── UE (compagnies & rail) ──
  Lufthansa: { website: 'https://www.lufthansa.com/fr/fr', address: 'Francfort & Munich, Allemagne' },
  'Deutsche Bahn': { website: 'https://www.bahn.com/fr', address: 'Réseau ferroviaire allemand' },
  'Austrian Airlines': { website: 'https://www.austrian.com/fr/fr', address: 'Vienne, Autriche' },
  ÖBB: { website: 'https://www.oebb.at/fr', address: 'Réseau ferroviaire autrichien' },
  'Bulgaria Air': { website: 'https://www.airbulgaria.com', address: 'Sofia, Bulgarie' },
  'Cyprus Airways': { website: 'https://www.cyprusairways.com', address: 'Larnaca, Chypre' },
  'Croatia Airlines': { website: 'https://www.croatiaairlines.com', address: 'Zagreb, Croatie' },
  Jadrolinija: { website: 'https://www.jadrolinija.hr', address: 'Ferries Croatie & Adriatique' },
  SAS: { website: 'https://www.flysas.com/fr/fr', address: 'Copenhague & Stockholm' },
  DSB: { website: 'https://www.dsb.dk/fr', address: 'Danemark' },
  Nordica: { website: 'https://www.nordica.ee', address: 'Tallinn, Estonie' },
  Finnair: { website: 'https://www.finnair.com/fr/fr', address: 'Helsinki, Finlande' },
  'Aegean Airlines': { website: 'https://fr.aegeanair.com', address: 'Athènes, Grèce' },
  'Blue Star Ferries': { website: 'https://www.bluestarferries.com', address: 'Îles grecques' },
  'Wizz Air': { website: 'https://wizzair.com/fr-fr', address: 'Budapest, Hongrie' },
  'Aer Lingus': { website: 'https://www.aerlingus.com', address: 'Dublin, Irlande' },
  airBaltic: { website: 'https://www.airbaltic.com/fr', address: 'Riga, Lettonie' },
  Luxair: { website: 'https://www.luxair.lu/fr', address: 'Luxembourg' },
  'Air Malta': { website: 'https://www.airmalta.com', address: 'La Valette, Malte' },
  KLM: { website: 'https://www.klm.fr', address: 'Amsterdam Schiphol, Pays-Bas' },
  'LOT Polish Airlines': { website: 'https://www.lot.com/fr/fr', address: 'Varsovie, Pologne' },
  Smartwings: { website: 'https://www.smartwings.com', address: 'Prague, République tchèque' },
  TAROM: { website: 'https://www.tarom.ro/fr', address: 'Bucarest, Roumanie' },
  'Adria Airways': { website: 'https://www.adria.si', address: 'Ljubljana, Slovénie' },

  // ── Golfe & Moyen-Orient ──
  Saudia: { website: 'https://www.saudia.com/fr', address: 'Riyad & Jeddah, Arabie saoudite' },
  'Qatar Airways': { website: 'https://www.qatarairways.com/fr-fr', address: 'Hamad International, Doha' },
  'Kuwait Airways': { website: 'https://www.kuwaitairways.com', address: 'Koweït' },
  'Gulf Air': { website: 'https://www.gulfair.com/fr', address: 'Manama, Bahreïn' },
  'Oman Air': { website: 'https://www.omanair.com/fr', address: 'Mascate, Oman' },
  'Royal Jordanian': { website: 'https://www.rj.com/fr', address: 'Amman, Jordanie' },
  'Middle East Airlines': { website: 'https://www.mea.com.lb', address: 'Beyrouth, Liban' },
  'Iraqi Airways': { website: 'https://www.iraqiairways.com.iq', address: 'Bagdad, Irak' },
  'Iran Air': { website: 'https://www.iranair.com', address: 'Téhéran, Iran' },
  Yemenia: { website: 'https://www.yemenia.com', address: 'Aden & Sanaa, Yémen' },

  // ── Asie ──
  Aeroflot: { website: 'https://www.aeroflot.ru/fr-fr', address: 'Moscou Sheremetyevo, Russie' },
  RZD: { website: 'https://eng.rzd.ru', address: 'Chemins de fer russes' },
  'Air China': { website: 'https://www.airchina.fr', address: 'Pékin, Chine' },
  JAL: { website: 'https://www.jal.co.jp/fr/fr', address: 'Tokyo, Japon' },
  'Korean Air': { website: 'https://www.koreanair.com/fr/fr', address: 'Séoul, Corée du Sud' },
  'Air India': { website: 'https://www.airindia.com/fr', address: 'New Delhi, Inde' },
  'Thai Airways': { website: 'https://www.thaiairways.com/fr', address: 'Bangkok, Thaïlande' },
  'Vietnam Airlines': { website: 'https://www.vietnamairlines.com/fr/vi', address: 'Hanoï, Vietnam' },
  'Garuda Indonesia': { website: 'https://www.garuda-indonesia.com/fr', address: 'Jakarta, Indonésie' },
  'Malaysia Airlines': { website: 'https://www.malaysiaairlines.com/fr/fr', address: 'Kuala Lumpur, Malaisie' },
  'Singapore Airlines': { website: 'https://www.singaporeair.com/fr_FR/fr/home', address: 'Changi, Singapour' },
  'Philippine Airlines': { website: 'https://www.philippineairlines.com/fr', address: 'Manille, Philippines' },
  PIA: { website: 'https://www.piac.com.pk', address: 'Islamabad, Pakistan' },
  'SriLankan Airlines': { website: 'https://www.srilankan.com/fr', address: 'Colombo, Sri Lanka' },
  'Cambodia Angkor Air': { website: 'https://www.cambodiaangkorair.com', address: 'Phnom Penh, Cambodge' },
  'Nepal Airlines': { website: 'https://www.nepalairlines.com.np', address: 'Katmandou, Népal' },
  'Air Astana': { website: 'https://www.airastana.com/fr', address: 'Astana, Kazakhstan' },
  'Uzbekistan Airways': { website: 'https://www.uzairways.com', address: 'Tachkent, Ouzbékistan' },
  'Georgian Airways': { website: 'https://www.georgian-airways.com', address: 'Tbilissi, Géorgie' },
  AZAL: { website: 'https://www.azal.az', address: 'Bakou, Azerbaïdjan' },

  // ── Amérique latine ──
  Aeroméxico: { website: 'https://www.aeromexico.com/fr', address: 'Mexico, Mexique' },
  'LATAM Brasil': { website: 'https://www.latamairlines.com/fr/fr', address: 'São Paulo, Brésil' },
  'Aerolíneas Argentinas': { website: 'https://www.aerolineas.com.ar/fr-fr', address: 'Buenos Aires, Argentine' },
  Avianca: { website: 'https://www.avianca.com/fr', address: 'Bogotá, Colombie' },
  'LATAM Chile': { website: 'https://www.latamairlines.com/fr/fr', address: 'Santiago, Chili' },
  'LATAM Perú': { website: 'https://www.latamairlines.com/fr/fr', address: 'Lima, Pérou' },
  'Copa Airlines': { website: 'https://www.copaair.com/fr', address: 'Panama, Panama' },
  'Cubana de Aviación': { website: 'https://www.cubana.cu', address: 'La Havane, Cuba' },
  Arajet: { website: 'https://www.arajet.com/fr', address: 'Saint-Domingue, RD' },
  'Boliviana de Aviación': { website: 'https://www.boa.bo', address: 'La Paz, Bolivie' },
  Conviasa: { website: 'https://www.conviasa.aero', address: 'Caracas, Venezuela' },
}
