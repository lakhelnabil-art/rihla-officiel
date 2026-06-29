import { isBannedCountryCode, mentionsBannedCountry } from '../../../../data/bannedCountries.js'

export const AIRPORTS = [
  // ══════════════════════════════════════════════
  //  MAROC
  // ══════════════════════════════════════════════
  { code: 'CMN', ville: 'Casablanca',  nom: 'Mohammed V',               pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'RAK', ville: 'Marrakech',   nom: 'Menara',                   pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'AGA', ville: 'Agadir',      nom: 'Al Massira',               pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'FEZ', ville: 'Fès',         nom: 'Saïss',                    pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'TNG', ville: 'Tanger',      nom: 'Ibn Battuta',              pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'OUD', ville: 'Oujda',       nom: 'Angads',                   pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'NDR', ville: 'Nador',       nom: 'El Aroui',                 pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'EUN', ville: 'Laâyoune',    nom: 'Hassan Ier',               pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'RBA', ville: 'Rabat',       nom: 'Rabat-Salé',               pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'VIL', ville: 'Dakhla',      nom: 'Dakhla',                   pays: 'Maroc',    region: 'maroc', country: 'MA' },
  { code: 'TTU', ville: 'Tétouan',     nom: 'Sania Ramel',              pays: 'Maroc',    region: 'maroc', country: 'MA' },

  // ══════════════════════════════════════════════
  //  TUNISIE
  // ══════════════════════════════════════════════
  { code: 'TUN', ville: 'Tunis',       nom: 'Carthage',                 pays: 'Tunisie',  region: 'maghreb', country: 'TN' },
  { code: 'SFA', ville: 'Sfax',        nom: 'Thyna',                    pays: 'Tunisie',  region: 'maghreb', country: 'TN' },
  { code: 'DJE', ville: 'Djerba',      nom: 'Djerba-Zarzis',            pays: 'Tunisie',  region: 'maghreb', country: 'TN' },
  { code: 'MIR', ville: 'Monastir',    nom: 'Habib Bourguiba',          pays: 'Tunisie',  region: 'maghreb', country: 'TN' },
  { code: 'TOE', ville: 'Tozeur',      nom: 'Nefta',                    pays: 'Tunisie',  region: 'maghreb', country: 'TN' },
  { code: 'GAF', ville: 'Gafsa',       nom: 'Ksar',                     pays: 'Tunisie',  region: 'maghreb', country: 'TN' },
  { code: 'TBJ', ville: 'Tabarka',     nom: 'Tabarka',                  pays: 'Tunisie',  region: 'maghreb', country: 'TN' },

  // ══════════════════════════════════════════════
  //  ALGÉRIE
  // ══════════════════════════════════════════════
  { code: 'ALG', ville: 'Alger',       nom: 'Houari Boumédiène',        pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'ORN', ville: 'Oran',        nom: 'Ahmed Ben Bella',          pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'AAE', ville: 'Annaba',      nom: 'Rabah Bitat',              pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'CZL', ville: 'Constantine', nom: 'Mohamed Boudiaf',          pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'BJA', ville: 'Béjaïa',      nom: 'Soummam',                  pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'TLM', ville: 'Tlemcen',     nom: 'Zenata',                   pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'GJL', ville: 'Jijel',       nom: 'Ferhat Abbas',             pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'BLJ', ville: 'Batna',       nom: 'Mostefa Ben Boulaid',      pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'BSK', ville: 'Biskra',      nom: 'Mohamed Khider',           pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'TMR', ville: 'Tamanrasset', nom: 'Aguenar',                  pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'ELG', ville: 'El Oued',     nom: 'Guemar',                   pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'QSF', ville: 'Sétif',       nom: 'Aïn Arnat',               pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'TGR', ville: 'Touggourt',   nom: 'Sidi Mahdi',               pays: 'Algérie',  region: 'maghreb', country: 'DZ' },
  { code: 'TIN', ville: 'Tindouf',     nom: 'Tindouf',                  pays: 'Algérie',  region: 'maghreb', country: 'DZ' },

  // ══════════════════════════════════════════════
  //  LIBYE
  // ══════════════════════════════════════════════
  { code: 'TIP', ville: 'Tripoli',     nom: 'Mitiga',                   pays: 'Libye',    region: 'maghreb', country: 'LY' },
  { code: 'BEN', ville: 'Benghazi',    nom: 'Benina',                   pays: 'Libye',    region: 'maghreb', country: 'LY' },
  { code: 'SEB', ville: 'Sebha',       nom: 'Sebha',                    pays: 'Libye',    region: 'maghreb', country: 'LY' },

  // ══════════════════════════════════════════════
  //  MAURITANIE
  // ══════════════════════════════════════════════
  { code: 'NKC', ville: 'Nouakchott',  nom: 'Oumtounsy',               pays: 'Mauritanie',region: 'afrique', country: 'MR' },
  { code: 'NDB', ville: 'Nouadhibou',  nom: 'Nouadhibou',               pays: 'Mauritanie',region: 'afrique', country: 'MR' },

  // ══════════════════════════════════════════════
  //  ÉGYPTE
  // ══════════════════════════════════════════════
  { code: 'CAI', ville: 'Le Caire',    nom: 'Cairo Intl',               pays: 'Égypte',   region: 'afrique', country: 'EG' },
  { code: 'HRG', ville: 'Hurghada',    nom: 'Hurghada Intl',            pays: 'Égypte',   region: 'afrique', country: 'EG' },
  { code: 'SSH', ville: 'Charm el-Cheikh', nom: 'Sharm El Sheikh',      pays: 'Égypte',   region: 'afrique', country: 'EG' },
  { code: 'LXR', ville: 'Louxor',      nom: 'Luxor Intl',               pays: 'Égypte',   region: 'afrique', country: 'EG' },
  { code: 'ASW', ville: 'Assouan',     nom: 'Aswan Intl',               pays: 'Égypte',   region: 'afrique', country: 'EG' },
  { code: 'RMF', ville: 'Marsa Alam',  nom: 'Marsa Alam Intl',          pays: 'Égypte',   region: 'afrique', country: 'EG' },
  { code: 'HBE', ville: 'Alexandrie',  nom: 'Borg El Arab',             pays: 'Égypte',   region: 'afrique', country: 'EG' },

  // ══════════════════════════════════════════════
  //  FRANCE
  // ══════════════════════════════════════════════
  { code: 'CDG', ville: 'Paris',       nom: 'Charles de Gaulle',        pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'ORY', ville: 'Paris',       nom: 'Orly',                     pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'LYS', ville: 'Lyon',        nom: 'Saint-Exupéry',            pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'NCE', ville: 'Nice',        nom: 'Côte d\'Azur',             pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'MRS', ville: 'Marseille',   nom: 'Provence',                 pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'TLS', ville: 'Toulouse',    nom: 'Blagnac',                  pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'NTE', ville: 'Nantes',      nom: 'Atlantique',               pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'BOD', ville: 'Bordeaux',    nom: 'Mérignac',                 pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'LIL', ville: 'Lille',       nom: 'Lesquin',                  pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'MPL', ville: 'Montpellier', nom: 'Méditerranée',             pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'SXB', ville: 'Strasbourg',  nom: 'Entzheim',                 pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'BES', ville: 'Brest',       nom: 'Bretagne',                 pays: 'France',   region: 'europe', country: 'FR' },
  { code: 'RNS', ville: 'Rennes',      nom: 'Saint-Jacques',            pays: 'France',   region: 'europe', country: 'FR' },

  // ══════════════════════════════════════════════
  //  BELGIQUE
  // ══════════════════════════════════════════════
  { code: 'BRU', ville: 'Bruxelles',   nom: 'Brussels Airport',         pays: 'Belgique', region: 'europe', country: 'BE' },
  { code: 'CRL', ville: 'Charleroi',   nom: 'Brussels South',           pays: 'Belgique', region: 'europe', country: 'BE' },

  // ══════════════════════════════════════════════
  //  PAYS-BAS
  // ══════════════════════════════════════════════
  { code: 'AMS', ville: 'Amsterdam',   nom: 'Schiphol',                 pays: 'Pays-Bas', region: 'europe', country: 'NL' },
  { code: 'EIN', ville: 'Eindhoven',   nom: 'Eindhoven',                pays: 'Pays-Bas', region: 'europe', country: 'NL' },

  // ══════════════════════════════════════════════
  //  SUISSE
  // ══════════════════════════════════════════════
  { code: 'GVA', ville: 'Genève',      nom: 'Genève-Cointrin',          pays: 'Suisse',   region: 'europe', country: 'CH' },
  { code: 'ZRH', ville: 'Zurich',      nom: 'Zurich',                   pays: 'Suisse',   region: 'europe', country: 'CH' },
  { code: 'BSL', ville: 'Bâle',        nom: 'EuroAirport',              pays: 'Suisse/France', region: 'europe', country: 'CH' },

  // ══════════════════════════════════════════════
  //  ALLEMAGNE
  // ══════════════════════════════════════════════
  { code: 'FRA', ville: 'Francfort',   nom: 'Frankfurt',                pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'MUC', ville: 'Munich',      nom: 'Munich',                   pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'DUS', ville: 'Düsseldorf',  nom: 'Düsseldorf',               pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'BER', ville: 'Berlin',      nom: 'Brandenburg',              pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'HAM', ville: 'Hambourg',    nom: 'Hamburg',                  pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'CGN', ville: 'Cologne',     nom: 'Cologne-Bonn',             pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'STR', ville: 'Stuttgart',   nom: 'Stuttgart',                pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'NUE', ville: 'Nuremberg',   nom: 'Nuremberg',                pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'LEJ', ville: 'Leipzig',     nom: 'Leipzig/Halle',            pays: 'Allemagne',region: 'europe', country: 'DE' },
  { code: 'HHN', ville: 'Francfort',   nom: 'Frankfurt-Hahn',           pays: 'Allemagne',region: 'europe', country: 'DE' },

  // ══════════════════════════════════════════════
  //  ROYAUME-UNI
  // ══════════════════════════════════════════════
  { code: 'LHR', ville: 'Londres',     nom: 'Heathrow',                 pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'LGW', ville: 'Londres',     nom: 'Gatwick',                  pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'STN', ville: 'Londres',     nom: 'Stansted',                 pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'LTN', ville: 'Londres',     nom: 'Luton',                    pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'MAN', ville: 'Manchester',  nom: 'Manchester',               pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'BHX', ville: 'Birmingham',  nom: 'Birmingham',               pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'LBA', ville: 'Leeds',       nom: 'Leeds Bradford',           pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'NCL', ville: 'Newcastle',   nom: 'Newcastle',                pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'BFS', ville: 'Belfast',     nom: 'Belfast Intl',             pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'EDI', ville: 'Édimbourg',   nom: 'Edinburgh',                pays: 'Royaume-Uni',region: 'europe', country: 'GB' },
  { code: 'DUB', ville: 'Dublin',      nom: 'Dublin',                   pays: 'Irlande',  region: 'europe', country: 'IE' },

  // ══════════════════════════════════════════════
  //  ESPAGNE
  // ══════════════════════════════════════════════
  { code: 'MAD', ville: 'Madrid',      nom: 'Barajas',                  pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'BCN', ville: 'Barcelone',   nom: 'El Prat',                  pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'VLC', ville: 'Valence',     nom: 'Valencia',                 pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'AGP', ville: 'Málaga',      nom: 'Costa del Sol',            pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'PMI', ville: 'Palma',       nom: 'Son Sant Joan',            pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'SVQ', ville: 'Séville',     nom: 'San Pablo',                pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'ALC', ville: 'Alicante',    nom: 'Alicante-Elche',           pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'BIO', ville: 'Bilbao',      nom: 'Bilbao',                   pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'ACE', ville: 'Lanzarote',   nom: 'Arrecife',                 pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'LPA', ville: 'Las Palmas',  nom: 'Gran Canaria',             pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'TFN', ville: 'Tenerife',    nom: 'Tenerife Nord',            pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'TFS', ville: 'Tenerife',    nom: 'Tenerife Sud',             pays: 'Espagne',  region: 'europe', country: 'ES' },
  { code: 'FUE', ville: 'Fuerteventura',nom: 'Fuerteventura',           pays: 'Espagne',  region: 'europe', country: 'ES' },

  // ══════════════════════════════════════════════
  //  PORTUGAL
  // ══════════════════════════════════════════════
  { code: 'LIS', ville: 'Lisbonne',    nom: 'Humberto Delgado',         pays: 'Portugal', region: 'europe', country: 'PT' },
  { code: 'OPO', ville: 'Porto',       nom: 'Francisco Sá Carneiro',    pays: 'Portugal', region: 'europe', country: 'PT' },
  { code: 'FAO', ville: 'Faro',        nom: 'Faro',                     pays: 'Portugal', region: 'europe', country: 'PT' },

  // ══════════════════════════════════════════════
  //  ITALIE
  // ══════════════════════════════════════════════
  { code: 'FCO', ville: 'Rome',        nom: 'Fiumicino',                pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'MXP', ville: 'Milan',       nom: 'Malpensa',                 pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'BGY', ville: 'Bergame',     nom: 'Orio al Serio',            pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'VCE', ville: 'Venise',      nom: 'Marco Polo',               pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'NAP', ville: 'Naples',      nom: 'Capodichino',              pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'BLQ', ville: 'Bologne',     nom: 'Guglielmo Marconi',        pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'TRN', ville: 'Turin',       nom: 'Caselle',                  pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'CTA', ville: 'Catane',      nom: 'Fontanarossa',             pays: 'Italie',   region: 'europe', country: 'IT' },
  { code: 'PMO', ville: 'Palerme',     nom: 'Falcone-Borsellino',       pays: 'Italie',   region: 'europe', country: 'IT' },

  // ══════════════════════════════════════════════
  //  MALTE
  // ══════════════════════════════════════════════
  { code: 'MLA', ville: 'La Valette',  nom: 'Malta Intl',               pays: 'Malte',    region: 'europe', country: 'MT' },

  // ══════════════════════════════════════════════
  //  SCANDINAVIE
  // ══════════════════════════════════════════════
  { code: 'CPH', ville: 'Copenhague',  nom: 'Kastrup',                  pays: 'Danemark', region: 'europe', country: 'DK' },
  { code: 'OSL', ville: 'Oslo',        nom: 'Gardermoen',               pays: 'Norvège',  region: 'europe', country: 'NO' },
  { code: 'ARN', ville: 'Stockholm',   nom: 'Arlanda',                  pays: 'Suède',    region: 'europe', country: 'SE' },
  { code: 'HEL', ville: 'Helsinki',    nom: 'Vantaa',                   pays: 'Finlande', region: 'europe', country: 'FI' },

  // ══════════════════════════════════════════════
  //  AUTRES EUROPE
  // ══════════════════════════════════════════════
  { code: 'VIE', ville: 'Vienne',      nom: 'Schwechat',                pays: 'Autriche', region: 'europe', country: 'AT' },
  { code: 'PRG', ville: 'Prague',      nom: 'Václav Havel',             pays: 'Tchéquie', region: 'europe', country: 'CZ' },
  { code: 'BUD', ville: 'Budapest',    nom: 'Ferenc Liszt',             pays: 'Hongrie',  region: 'europe', country: 'HU' },
  { code: 'WAW', ville: 'Varsovie',    nom: 'Chopin',                   pays: 'Pologne',  region: 'europe', country: 'PL' },
  { code: 'ATH', ville: 'Athènes',     nom: 'Eleftherios Venizelos',    pays: 'Grèce',    region: 'europe', country: 'GR' },
  { code: 'LJU', ville: 'Ljubljana',   nom: 'Jože Pučnik',              pays: 'Slovénie', region: 'europe', country: 'SI' },
  { code: 'SKP', ville: 'Skopje',      nom: 'Alexander le Grand',       pays: 'Macédoine',region: 'europe', country: 'MK' },
  { code: 'SJJ', ville: 'Sarajevo',    nom: 'Sarajevo Intl',            pays: 'Bosnie',   region: 'europe', country: 'BA' },

  // ══════════════════════════════════════════════
  //  TURQUIE
  // ══════════════════════════════════════════════
  { code: 'IST', ville: 'Istanbul',    nom: 'Istanbul',                 pays: 'Turquie',  region: 'moyen-orient', country: 'TR' },
  { code: 'SAW', ville: 'Istanbul',    nom: 'Sabiha Gökçen',            pays: 'Turquie',  region: 'moyen-orient', country: 'TR' },
  { code: 'AYT', ville: 'Antalya',     nom: 'Antalya',                  pays: 'Turquie',  region: 'moyen-orient', country: 'TR' },
  { code: 'ADB', ville: 'Izmir',       nom: 'Adnan Menderes',           pays: 'Turquie',  region: 'moyen-orient', country: 'TR' },
  { code: 'ESB', ville: 'Ankara',      nom: 'Esenboğa',                 pays: 'Turquie',  region: 'moyen-orient', country: 'TR' },

  // ══════════════════════════════════════════════
  //  MOYEN-ORIENT / GOLFE
  // ══════════════════════════════════════════════
  { code: 'DXB', ville: 'Dubaï',       nom: 'Dubai Intl',               pays: 'Émirats',  region: 'moyen-orient', country: 'AE' },
  { code: 'AUH', ville: 'Abu Dhabi',   nom: 'Zayed Intl',               pays: 'Émirats',  region: 'moyen-orient', country: 'AE' },
  { code: 'DWC', ville: 'Dubaï',       nom: 'Al Maktoum',               pays: 'Émirats',  region: 'moyen-orient', country: 'AE' },
  { code: 'SHJ', ville: 'Sharjah',     nom: 'Sharjah Intl',             pays: 'Émirats',  region: 'moyen-orient', country: 'AE' },
  { code: 'DOH', ville: 'Doha',        nom: 'Hamad Intl',               pays: 'Qatar',    region: 'moyen-orient', country: 'QA' },
  { code: 'KWI', ville: 'Koweït',      nom: 'Kuwait Intl',              pays: 'Koweït',   region: 'moyen-orient', country: 'KW' },
  { code: 'AMM', ville: 'Amman',       nom: 'Queen Alia',               pays: 'Jordanie', region: 'moyen-orient', country: 'JO' },
  { code: 'BEY', ville: 'Beyrouth',    nom: 'Rafic Hariri',             pays: 'Liban',    region: 'moyen-orient', country: 'LB' },
  { code: 'MCT', ville: 'Mascate',     nom: 'Muscat Intl',              pays: 'Oman',     region: 'moyen-orient', country: 'OM' },
  { code: 'BAH', ville: 'Bahreïn',     nom: 'Bahrain Intl',             pays: 'Bahreïn',  region: 'moyen-orient', country: 'BH' },
  { code: 'BGW', ville: 'Bagdad',      nom: 'Baghdad Intl',             pays: 'Irak',     region: 'moyen-orient', country: 'IQ' },
  { code: 'NJF', ville: 'Najaf',       nom: 'Al Najaf Intl',            pays: 'Irak',     region: 'moyen-orient', country: 'IQ' },

  // ══════════════════════════════════════════════
  //  ARABIE SAOUDITE
  // ══════════════════════════════════════════════
  { code: 'JED', ville: 'Djeddah',     nom: 'King Abdulaziz',           pays: 'Arabie Soudite',region: 'moyen-orient', country: 'SA' },
  { code: 'RUH', ville: 'Riyad',       nom: 'King Khalid',              pays: 'Arabie Soudite',region: 'moyen-orient', country: 'SA' },
  { code: 'MED', ville: 'Médine',      nom: 'Mohammed Ben Abdelaziz',   pays: 'Arabie Soudite',region: 'moyen-orient', country: 'SA' },
  { code: 'DMM', ville: 'Dammam',      nom: 'King Fahd',                pays: 'Arabie Soudite',region: 'moyen-orient', country: 'SA' },
  { code: 'AHB', ville: 'Abha',        nom: 'Abha Intl',                pays: 'Arabie Soudite',region: 'moyen-orient', country: 'SA' },

  // ══════════════════════════════════════════════
  //  AFRIQUE (hors Maghreb)
  // ══════════════════════════════════════════════
  { code: 'DKR', ville: 'Dakar',       nom: 'Blaise Diagne',            pays: 'Sénégal',  region: 'afrique', country: 'SN' },
  { code: 'ABJ', ville: 'Abidjan',     nom: 'Félix Houphouët-Boigny',   pays: 'Côte d\'Ivoire', region: 'afrique', country: 'CI' },
  { code: 'ACC', ville: 'Accra',       nom: 'Kotoka Intl',              pays: 'Ghana',    region: 'afrique', country: 'GH' },
  { code: 'LOS', ville: 'Lagos',       nom: 'Murtala Muhammed',         pays: 'Nigeria',  region: 'afrique', country: 'NG' },
  { code: 'ABV', ville: 'Abuja',       nom: 'Nnamdi Azikiwe',           pays: 'Nigeria',  region: 'afrique', country: 'NG' },
  { code: 'NBO', ville: 'Nairobi',     nom: 'Jomo Kenyatta',            pays: 'Kenya',    region: 'afrique', country: 'KE' },
  { code: 'JNB', ville: 'Johannesburg',nom: 'O.R. Tambo',               pays: 'Afrique du Sud', region: 'afrique', country: 'ZA' },
  { code: 'CPT', ville: 'Le Cap',      nom: 'Cape Town Intl',           pays: 'Afrique du Sud', region: 'afrique', country: 'ZA' },
  { code: 'ADD', ville: 'Addis-Abeba', nom: 'Bole Intl',                pays: 'Éthiopie', region: 'afrique', country: 'ET' },
  { code: 'BKO', ville: 'Bamako',      nom: 'Senou',                    pays: 'Mali',     region: 'afrique', country: 'ML' },
  { code: 'OUA', ville: 'Ouagadougou', nom: 'Thomas Sankara',           pays: 'Burkina Faso', region: 'afrique', country: 'BF' },
  { code: 'COO', ville: 'Cotonou',     nom: 'Cadjehoun',                pays: 'Bénin',    region: 'afrique', country: 'BJ' },
  { code: 'CKY', ville: 'Conakry',     nom: 'Gbessia',                  pays: 'Guinée',   region: 'afrique', country: 'GN' },
  { code: 'DAR', ville: 'Dar es Salaam',nom: 'Julius Nyerere',          pays: 'Tanzanie', region: 'afrique', country: 'TZ' },
  { code: 'EBB', ville: 'Kampala',     nom: 'Entebbe',                  pays: 'Ouganda',  region: 'afrique', country: 'UG' },

  // ══════════════════════════════════════════════
  //  AMÉRIQUE DU NORD
  // ══════════════════════════════════════════════
  { code: 'JFK', ville: 'New York',    nom: 'John F. Kennedy',          pays: 'États-Unis',region: 'amerique', country: 'US' },
  { code: 'EWR', ville: 'New York',    nom: 'Newark',                   pays: 'États-Unis',region: 'amerique', country: 'US' },
  { code: 'IAD', ville: 'Washington',  nom: 'Dulles',                   pays: 'États-Unis',region: 'amerique', country: 'US' },
  { code: 'YUL', ville: 'Montréal',    nom: 'Trudeau',                  pays: 'Canada',   region: 'amerique', country: 'CA' },
  { code: 'YYZ', ville: 'Toronto',     nom: 'Pearson',                  pays: 'Canada',   region: 'amerique', country: 'CA' },
  { code: 'YVR', ville: 'Vancouver',   nom: 'Vancouver Intl',           pays: 'Canada',   region: 'amerique', country: 'CA' },

  // ══════════════════════════════════════════════
  //  ASIE
  // ══════════════════════════════════════════════
  { code: 'PEK', ville: 'Pékin',       nom: 'Capital',                  pays: 'Chine',    region: 'asie', country: 'CN' },
  { code: 'PVG', ville: 'Shanghai',    nom: 'Pudong',                   pays: 'Chine',    region: 'asie', country: 'CN' },
  { code: 'BOM', ville: 'Mumbai',      nom: 'Chhatrapati Shivaji',      pays: 'Inde',     region: 'asie', country: 'IN' },
  { code: 'DEL', ville: 'New Delhi',   nom: 'Indira Gandhi',            pays: 'Inde',     region: 'asie', country: 'IN' },
  { code: 'KUL', ville: 'Kuala Lumpur',nom: 'KLIA',                     pays: 'Malaisie', region: 'asie', country: 'MY' },
  { code: 'BKK', ville: 'Bangkok',     nom: 'Suvarnabhumi',             pays: 'Thaïlande',region: 'asie', country: 'TH' },
  { code: 'SIN', ville: 'Singapour',   nom: 'Changi',                   pays: 'Singapour',region: 'asie', country: 'SG' },
  { code: 'HKG', ville: 'Hong Kong',   nom: 'Chek Lap Kok',             pays: 'Hong Kong',region: 'asie', country: 'HK' },
  { code: 'NRT', ville: 'Tokyo',       nom: 'Narita',                   pays: 'Japon',    region: 'asie', country: 'JP' },
  { code: 'SYD', ville: 'Sydney',      nom: 'Kingsford Smith',          pays: 'Australie',region: 'asie', country: 'AU' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isAllowedAirport = (airport) =>
  !isBannedCountryCode(airport.country)
  && !mentionsBannedCountry(airport.pays)
  && !mentionsBannedCountry(airport.ville)

export function searchAirports(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return AIRPORTS.filter(a =>
    isAllowedAirport(a) && (
      a.code.toLowerCase().includes(q) ||
      a.ville.toLowerCase().includes(q) ||
      a.nom.toLowerCase().includes(q) ||
      a.pays.toLowerCase().includes(q)
    ),
  ).slice(0, 8)
}

export function getAirport(code) {
  const airport = AIRPORTS.find(a => a.code === code)
  return airport && isAllowedAirport(airport) ? airport : undefined
}

// ─── Country → home airports mapping ─────────────────────────────────────────
export const COUNTRY_AIRPORTS = {
  MA: { label: 'Maroc 🇲🇦',     airports: ['CMN','RAK','AGA','FEZ','TNG','OUD','NDR','EUN','RBA','VIL','TTU'] },
  TN: { label: 'Tunisie 🇹🇳',   airports: ['TUN','SFA','DJE','MIR','TOE','TBJ'] },
  DZ: { label: 'Algérie 🇩🇿',   airports: ['ALG','ORN','AAE','CZL','BJA','TLM','GJL','BLJ','BSK','TMR','ELG','QSF'] },
  LY: { label: 'Libye 🇱🇾',     airports: ['TIP','BEN','SEB'] },
  EG: { label: 'Égypte 🇪🇬',    airports: ['CAI','HRG','SSH','LXR','ASW','RMF','HBE'] },
  MR: { label: 'Mauritanie 🇲🇷',airports: ['NKC','NDB'] },
  SN: { label: 'Sénégal 🇸🇳',   airports: ['DKR'] },
  FR: { label: 'France 🇫🇷',    airports: ['CDG','ORY','LYS','NCE','MRS','TLS','NTE','BOD','LIL','MPL','SXB'] },
  BE: { label: 'Belgique 🇧🇪',  airports: ['BRU','CRL'] },
  NL: { label: 'Pays-Bas 🇳🇱',  airports: ['AMS','EIN'] },
  DE: { label: 'Allemagne 🇩🇪', airports: ['FRA','MUC','DUS','BER','HAM','CGN','STR','NUE'] },
  CH: { label: 'Suisse 🇨🇭',    airports: ['ZRH','GVA','BSL'] },
  GB: { label: 'Royaume-Uni 🇬🇧',airports: ['LHR','LGW','STN','LTN','MAN','BHX','LBA','NCL','EDI'] },
  ES: { label: 'Espagne 🇪🇸',   airports: ['MAD','BCN','VLC','AGP','PMI','SVQ','ALC','BIO','LPA','TFN','TFS'] },
  PT: { label: 'Portugal 🇵🇹',  airports: ['LIS','OPO','FAO'] },
  IT: { label: 'Italie 🇮🇹',    airports: ['FCO','MXP','BGY','VCE','NAP','BLQ','TRN','CTA','PMO'] },
}
