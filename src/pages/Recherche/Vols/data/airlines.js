// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(date)      { return date || '' }
function fmtDot(date)   { return date ? date.split('-').reverse().join('.') : '' }

// ─── Airlines ───────────────────────────────────────────────────────────────
// hubs: { countryCode: [IATA airports that are home bases for this airline] }
// destinations: all airports this airline serves internationally
// Used by findAirlinesForRoute(from, to, homeCountry)

export const AIRLINES = [

  // ════════════════════════════════════════════
  //  MAROC
  // ════════════════════════════════════════════
  {
    id: 'RAM',
    nom: 'Royal Air Maroc',
    iata: 'AT',
    pays: 'Maroc',
    drapeau: '🇲🇦',
    couleur: '#C8102E',
    textColor: '#fff',
    description: 'Compagnie nationale. Réseau mondial depuis Casablanca.',
    siteWeb: 'https://www.royalairmaroc.com',
    hubs: { MA: ['CMN','RAK','AGA','FEZ','TNG','OUD','NDR','EUN','RBA'] },
    destinations: [
      'CDG','ORY','LYS','NCE','MRS','TLS','NTE','BOD','LIL','MPL','SXB',
      'BRU','AMS','GVA','ZRH','BSL','FRA','MUC','DUS','BER','HAM','CGN',
      'LHR','LGW','MAN','MAD','BCN','LIS','OPO','FCO','MXP','VCE','NAP',
      'CPH','OSL','ARN','VIE','PRG','BUD','WAW','ATH',
      'IST','DXB','AUH','DOH','KWI','AMM','MCT','BAH',
      'JED','RUH','MED',
      'TUN','ALG','CAI','DKR','ABJ','ACC','LOS','NBO','ADD','BKO',
      'JFK','YUL','YYZ','IAD',
      'PEK','PVG','BOM','DEL','KUL','BKK',
    ],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const cabins = { economy: 'Y', business: 'C', first: 'F' }
      const p = new URLSearchParams({
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax, cabinClass: cabins[cabin] || 'Y',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.royalairmaroc.com/ma-fr/book/flights?${p}`
    },
  },

  {
    id: 'AAM',
    nom: 'Air Arabia Maroc',
    iata: '3O',
    pays: 'Maroc',
    drapeau: '🇲🇦',
    couleur: '#EE2E24',
    textColor: '#fff',
    description: 'Low-cost marocaine. Vols depuis Casablanca et Fès.',
    siteWeb: 'https://www.airarabia.com',
    hubs: { MA: ['CMN','FEZ','RAK','TNG'] },
    destinations: [
      'CDG','ORY','LYS','NCE','MRS','NTE','BOD','TLS','LIL','MPL',
      'BRU','CRL','AMS','GVA','BSL','FRA','MUC','BER',
      'MAD','BCN','LIS','FCO','MXP','BGY',
      'IST','DXB','SHJ','AUH','DOH','AMM',
      'JED','RUH','MED',
      'TUN','CAI',
    ],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        fromCode: from, toCode: to,
        departDate: fmt(date),
        adults: pax, childrenCount: 0, infantCount: 0,
        triptype: returnDate ? 'Return' : 'OneWay',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://booking.airarabia.com/en?${p}`
    },
  },

  // ════════════════════════════════════════════
  //  TUNISIE
  // ════════════════════════════════════════════
  {
    id: 'TU',
    nom: 'Tunisair',
    iata: 'TU',
    pays: 'Tunisie',
    drapeau: '🇹🇳',
    couleur: '#E20714',
    textColor: '#fff',
    description: 'Compagnie nationale tunisienne. Hub Tunis-Carthage.',
    siteWeb: 'https://www.tunisair.com',
    hubs: { TN: ['TUN','SFA','DJE','MIR'] },
    destinations: [
      'CDG','ORY','LYS','NCE','MRS','TLS','NTE','BOD','LIL','MPL',
      'BRU','CRL','AMS','GVA','ZRH','FRA','MUC','DUS','BER',
      'LHR','MAD','BCN','LIS','FCO','MXP','VCE','NAP','ATH',
      'IST','DXB','DOH','AMM','CAI','JED','RUH',
      'CMN','ALG','TIP','CAI',
    ],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax,
        tripType: returnDate ? 'RT' : 'OW',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.tunisair.com/booking/search?${p}`
    },
  },

  {
    id: 'BJ',
    nom: 'Nouvelair',
    iata: 'BJ',
    pays: 'Tunisie',
    drapeau: '🇹🇳',
    couleur: '#0066CC',
    textColor: '#fff',
    description: 'Compagnie privée tunisienne. Vols charter et réguliers depuis Tunis et Monastir.',
    siteWeb: 'https://www.nouvelair.com',
    hubs: { TN: ['TUN','MIR','DJE'] },
    destinations: [
      'CDG','ORY','LYS','NCE','MRS','NTE','BOD','TLS','LIL',
      'BRU','AMS','GVA','FRA','MUC','BER','DUS',
      'LGW','MAD','BCN','FCO','MXP','VCE',
      'CMN',
    ],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        dep: from, arr: to,
        depDate: fmt(date),
        adults: pax,
        ...(returnDate ? { retDate: fmt(returnDate) } : {}),
      })
      return `https://www.nouvelair.com/fr/reservation?${p}`
    },
  },

  // ════════════════════════════════════════════
  //  ALGÉRIE
  // ════════════════════════════════════════════
  {
    id: 'AH',
    nom: 'Air Algérie',
    iata: 'AH',
    pays: 'Algérie',
    drapeau: '🇩🇿',
    couleur: '#006633',
    textColor: '#fff',
    description: 'Compagnie nationale algérienne. Hub Alger-Houari Boumediene.',
    siteWeb: 'https://www.airalgerie.dz',
    hubs: { DZ: ['ALG','ORN','CZL','AAE','BJA','TLM','GJL','BLJ','BSK','TMR'] },
    destinations: [
      'CDG','ORY','LYS','NCE','MRS','TLS','NTE','BOD','LIL','MPL',
      'BRU','CRL','AMS','GVA','ZRH','FRA','MUC','DUS','BER',
      'LHR','MAD','BCN','LIS','FCO','MXP','VCE','ATH',
      'IST','DXB','DOH','AMM','CAI','JED','RUH',
      'CMN','TUN','TIP','DKR','ABJ','ACC','BKO','NBO',
      'TGR','TIN','ELG','QSF',
    ],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax,
        tripType: returnDate ? 'RT' : 'OW',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.airalgerie.dz/en/booking?${p}`
    },
  },

  {
    id: 'DTH',
    nom: 'Tassili Airlines',
    iata: 'SF',
    pays: 'Algérie',
    drapeau: '🇩🇿',
    couleur: '#FF6600',
    textColor: '#fff',
    description: 'Filiale de Sonatrach. Vols intérieurs et quelques destinations régionales.',
    siteWeb: 'https://www.tassiliairlines.dz',
    hubs: { DZ: ['ALG','ORN','TGR','TIN','ELG','HME'] },
    destinations: ['CDG','BRU','TUN','CMN','TIP'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.tassiliairlines.dz/reservation?origin=${from}&destination=${to}&date=${fmt(date)}&adults=${pax}`
    },
  },

  // ════════════════════════════════════════════
  //  LIBYE
  // ════════════════════════════════════════════
  {
    id: 'LN',
    nom: 'Libyan Airlines',
    iata: 'LN',
    pays: 'Libye',
    drapeau: '🇱🇾',
    couleur: '#009900',
    textColor: '#fff',
    description: 'Compagnie nationale libyenne. Hub Tripoli.',
    siteWeb: 'https://www.libyanairlines.com.ly',
    hubs: { LY: ['TIP','BEN','SEB'] },
    destinations: ['CAI','TUN','ALG','AMM','IST','MXP','FCO','MRS','CDG','JED','DXB'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.libyanairlines.com.ly/booking?from=${from}&to=${to}&date=${fmt(date)}&pax=${pax}`
    },
  },

  {
    id: '8U',
    nom: 'Afriqiyah Airways',
    iata: '8U',
    pays: 'Libye',
    drapeau: '🇱🇾',
    couleur: '#CC0000',
    textColor: '#FFD700',
    description: 'Compagnie libyenne. Hub Tripoli Mitiga. Destinations Afrique et Europe.',
    siteWeb: 'https://www.afriqiyah.aero',
    hubs: { LY: ['TIP','BEN'] },
    destinations: ['CDG','MRS','FCO','MXP','MAD','BCN','AMS','FRA','ATH','CAI','TUN','ALG','JED','DXB','AMM','ACC','LOS','ABJ','NBO'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.afriqiyah.aero/booking?from=${from}&to=${to}&date=${fmt(date)}&adults=${pax}`
    },
  },

  // ════════════════════════════════════════════
  //  ÉGYPTE
  // ════════════════════════════════════════════
  {
    id: 'MS',
    nom: 'EgyptAir',
    iata: 'MS',
    pays: 'Égypte',
    drapeau: '🇪🇬',
    couleur: '#003399',
    textColor: '#fff',
    description: 'Compagnie nationale égyptienne. Hub Le Caire. Réseau mondial.',
    siteWeb: 'https://www.egyptair.com',
    hubs: { EG: ['CAI','HBE','LXR','ASW'] },
    destinations: [
      'CDG','ORY','LYS','FRA','MUC','LHR','MAN','MAD','BCN','FCO','MXP','ATH',
      'AMS','BRU','ZRH','VIE','PRG','WAW','CPH',
      'DXB','AUH','DOH','AMM','BEY','KWI','JED','RUH','MED','MCT','BAH',
      'IST','TUN','ALG','TIP','CMN',
      'NBO','ADD','ACC','LOS','DKR','JNB',
      'JFK','YUL','YYZ',
      'BOM','DEL','KUL','BKK','PEK','PVG',
      'HRG','SSH','RMF',
    ],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const cabins = { economy: 'Y', business: 'C', first: 'F' }
      const p = new URLSearchParams({
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax,
        cabinClass: cabins[cabin] || 'Y',
        tripType: returnDate ? 'RT' : 'OW',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.egyptair.com/en/fly/pages/search-and-book.aspx?${p}`
    },
  },

  {
    id: 'SM',
    nom: 'Air Cairo',
    iata: 'SM',
    pays: 'Égypte',
    drapeau: '🇪🇬',
    couleur: '#CC0000',
    textColor: '#FFD700',
    description: 'Filiale low-cost d\'EgyptAir. Hub Le Caire. Destinations Moyen-Orient et Europe.',
    siteWeb: 'https://www.aircairo.com',
    hubs: { EG: ['CAI','HRG','SSH','RMF'] },
    destinations: [
      'CDG','ORY','MRS','LYS','FRA','MUC','FCO','MXP','BGY','MAD','BCN','AMS',
      'IST','AMM','DXB','AUH','JED','RUH','KWI','BAH','MCT',
      'TUN','ALG','CMN','TIP',
    ],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        org: from, dst: to,
        depDate: fmt(date),
        adt: pax,
        tripType: returnDate ? 'RT' : 'OW',
        ...(returnDate ? { retDate: fmt(returnDate) } : {}),
      })
      return `https://www.aircairo.com/reservation?${p}`
    },
  },

  {
    id: 'NP',
    nom: 'Nile Air',
    iata: 'NP',
    pays: 'Égypte',
    drapeau: '🇪🇬',
    couleur: '#0066CC',
    textColor: '#fff',
    description: 'Compagnie privée égyptienne. Vols régionaux depuis Le Caire.',
    siteWeb: 'https://www.nileair.com',
    hubs: { EG: ['CAI','HRG','SSH'] },
    destinations: ['AMM','BEY','DXB','AUH','KWI','BAH','JED','RUH','IST','ATH','MXP','FCO','CDG'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.nileair.com/booking?from=${from}&to=${to}&date=${fmt(date)}&adults=${pax}`
    },
  },

  // ════════════════════════════════════════════
  //  MAURITANIE
  // ════════════════════════════════════════════
  {
    id: 'MR',
    nom: 'Mauritania Airlines',
    iata: 'L6',
    pays: 'Mauritanie',
    drapeau: '🇲🇷',
    couleur: '#006600',
    textColor: '#FFD700',
    description: 'Compagnie nationale mauritanienne. Hub Nouakchott.',
    siteWeb: 'https://www.mauritaniaairlines.mr',
    hubs: { MR: ['NKC','NDB'] },
    destinations: ['CDG','LIS','CMN','DKR','BKO','ABJ','ACC','TUN','CAI'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.mauritaniaairlines.mr/booking?from=${from}&to=${to}&date=${fmt(date)}&adults=${pax}`
    },
  },

  // ════════════════════════════════════════════
  //  EUROPE LOW-COST
  // ════════════════════════════════════════════
  {
    id: 'RYR',
    nom: 'Ryanair',
    iata: 'FR',
    pays: 'Irlande',
    drapeau: '🇮🇪',
    couleur: '#073590',
    textColor: '#FFD700',
    description: 'Leader low-cost européen. Nombreuses liaisons saisonnières.',
    siteWeb: 'https://www.ryanair.com',
    hubs: {
      MA: ['CMN','RAK','AGA','FEZ','TNG','OUD','NDR','RBA'],
      TN: ['TUN','SFA'],
      DZ: ['ALG'],
      EG: ['CAI','HRG','SSH'],
    },
    destinations: [
      'STN','LGW','MAN','BHX','LTN',
      'BCN','MAD','AGP','PMI','SVQ','ALC',
      'LIS','OPO','FAO',
      'MRS','NCE','CRL','BRU',
      'BER','FRA','MUC','CGN',
      'BGY','MXP','VCE','FCO','NAP',
      'ATH','VIE','BUD','WAW','PRG',
      'AMS',
    ],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        adults: pax, teens: 0, children: 0, infants: 0,
        dateOut: fmt(date),
        ...(returnDate ? { dateIn: fmt(returnDate), isReturn: 'true' } : { isReturn: 'false' }),
        isConnectedFlight: 'false',
        originIata: from, destinationIata: to,
        tpAdults: pax, tpTeens: 0, tpChildren: 0, tpInfants: 0,
        promoCode: '',
      })
      return `https://www.ryanair.com/fr/fr/trip/flights/select?${p}`
    },
  },

  {
    id: 'EZY',
    nom: 'easyJet',
    iata: 'U2',
    pays: 'Royaume-Uni',
    drapeau: '🇬🇧',
    couleur: '#FF6600',
    textColor: '#fff',
    description: 'Low-cost britannique. Liaisons depuis Paris, Lyon, Genève, Bordeaux.',
    siteWeb: 'https://www.easyjet.com',
    hubs: {
      MA: ['CMN','RAK','AGA','FEZ','TNG'],
      TN: ['TUN','MIR'],
      EG: ['CAI','HRG','SSH'],
    },
    destinations: [
      'CDG','ORY','LYS','NCE','MRS','TLS','NTE','BOD',
      'GVA','BSL','ZRH',
      'LGW','LTN','MAN','BHX',
      'AMS','BRU',
      'MXP','BGY','FCO','NAP','VCE',
      'BCN','MAD','AGP',
      'LIS',
      'BER','FRA',
      'ATH',
    ],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        departing: from, arriving: to,
        departureDate: fmt(date),
        adults: pax,
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.easyjet.com/fr/book/search?${p}`
    },
  },

  {
    id: 'TO',
    nom: 'Transavia France',
    iata: 'TO',
    pays: 'France',
    drapeau: '🇫🇷',
    couleur: '#00AEEF',
    textColor: '#fff',
    description: 'Filiale low-cost d\'Air France. Très présente sur le Maroc depuis ORY.',
    siteWeb: 'https://www.transavia.com',
    hubs: {
      MA: ['CMN','RAK','AGA','FEZ','TNG','OUD','NDR'],
      TN: ['TUN','SFA','MIR','DJE'],
      DZ: ['ALG','ORN','CZL','AAE'],
    },
    destinations: ['ORY','LYS','NCE','MRS','NTE','BOD','TLS','LIL','MPL','SXB'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.transavia.com/fr-FR/fly/search/#outward/${from}/${to}/${fmt(date)}/pax${pax}000`
    },
  },

  {
    id: 'HV',
    nom: 'Transavia Netherlands',
    iata: 'HV',
    pays: 'Pays-Bas',
    drapeau: '🇳🇱',
    couleur: '#009EE3',
    textColor: '#fff',
    description: 'Filiale low-cost de KLM. Vols depuis Amsterdam.',
    siteWeb: 'https://www.transavia.com',
    hubs: {
      MA: ['CMN','RAK','AGA','TNG','OUD','NDR'],
      TN: ['TUN','MIR'],
    },
    destinations: ['AMS','EIN'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.transavia.com/en-NL/fly/search/#outward/${from}/${to}/${fmt(date)}/pax${pax}000`
    },
  },

  {
    id: 'VY',
    nom: 'Vueling',
    iata: 'VY',
    pays: 'Espagne',
    drapeau: '🇪🇸',
    couleur: '#FFD700',
    textColor: '#333',
    description: 'Low-cost espagnole. Hub Barcelone.',
    siteWeb: 'https://www.vueling.com',
    hubs: {
      MA: ['CMN','RAK','AGA','FEZ','TNG','OUD','NDR'],
      TN: ['TUN'],
      EG: ['CAI'],
    },
    destinations: ['BCN','MAD','VLC','AGP','PMI','SVQ','FCO','MXP','NAP','VCE','CDG','ORY','GVA','AMS','BRU','FRA'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const p = new URLSearchParams({
        lang: 'FR', markets: 'MA',
        origin: from, destination: to,
        departure: fmt(date),
        adults: pax, children: 0, infants: 0,
        flightType: returnDate ? 'roundtrip' : 'oneway',
        cabin: cabin === 'business' ? 'Business' : 'Economy',
        ...(returnDate ? { arrival: fmt(returnDate) } : {}),
      })
      return `https://www.vueling.com/en/booking/flight-search?${p}`
    },
  },

  {
    id: 'W6',
    nom: 'Wizz Air',
    iata: 'W6',
    pays: 'Hongrie',
    drapeau: '🇭🇺',
    couleur: '#C6007E',
    textColor: '#fff',
    description: 'Ultra low-cost. Vols depuis Vienne, Budapest, Varsovie.',
    siteWeb: 'https://wizzair.com',
    hubs: {
      MA: ['CMN','RAK','AGA','TNG'],
      EG: ['CAI','SSH'],
    },
    destinations: ['VIE','BUD','WAW','BER','LGW','LTN','BRU','CRL','GVA'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax, children: 0,
        ...(returnDate ? { returnDepartureDate: fmt(returnDate) } : {}),
      })
      return `https://wizzair.com/fr-fr/flights?${p}`
    },
  },

  {
    id: 'V7',
    nom: 'Volotea',
    iata: 'V7',
    pays: 'Espagne',
    drapeau: '🇪🇸',
    couleur: '#2B5BE7',
    textColor: '#fff',
    description: 'Low-cost espagnole. Vols secondaires Europe vers Maroc.',
    siteWeb: 'https://www.volotea.com',
    hubs: { MA: ['TNG','AGA','RAK'] },
    destinations: ['BCN','MAD','VLC','AGP','SVQ','ALC','LPA','TFN','TFS','FCO','NAP','PMO','VCE','MRS','LYS','BOD','NTE'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ from, to, departure: fmt(date), adults: pax })
      return `https://www.volotea.com/fr/book/#/search?${p}`
    },
  },

  {
    id: 'LS',
    nom: 'Jet2',
    iata: 'LS',
    pays: 'Royaume-Uni',
    drapeau: '🇬🇧',
    couleur: '#FF6600',
    textColor: '#fff',
    description: 'Low-cost britannique. Vols saisonniers UK–Maroc.',
    siteWeb: 'https://www.jet2.com',
    hubs: { MA: ['RAK','AGA','CMN'] },
    destinations: ['LBA','MAN','LGW','BHX','EDI','NCL','STN','BRS'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.jet2.com/cheapflights?departureAirportCode=${from}&destinationAirportCode=${to}&departureDate=${fmt(date)}&adults=${pax}`
    },
  },

  // ════════════════════════════════════════════
  //  RÉSEAU COMPLET EUROPE
  // ════════════════════════════════════════════
  {
    id: 'AF',
    nom: 'Air France',
    iata: 'AF',
    pays: 'France',
    drapeau: '🇫🇷',
    couleur: '#002157',
    textColor: '#fff',
    description: 'Compagnie nationale française. Vols depuis Paris CDG.',
    siteWeb: 'https://www.airfrance.fr',
    hubs: { MA: ['CMN','RAK','AGA','FEZ','TNG'], TN: ['TUN'], DZ: ['ALG'], EG: ['CAI'] },
    destinations: ['CDG','LYS','NCE','TLS','NTE','BOD','BRU','AMS','FRA','MUC','LHR','MAD','BCN','FCO','MXP','GVA','ZRH','JFK','YUL'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const cabinMap = { economy: 'EC', business: 'AF', first: 'FA' }
      const p = new URLSearchParams({
        BookingFlow: 'TN',
        origin: from, destination: to,
        departing: fmt(date),
        adults: pax,
        cabinClass: cabinMap[cabin] || 'EC',
        ...(returnDate ? { returning: fmt(returnDate) } : {}),
      })
      return `https://www.airfrance.fr/FR/fr/local/process/achat/selectOD.do?${p}`
    },
  },

  {
    id: 'LH',
    nom: 'Lufthansa',
    iata: 'LH',
    pays: 'Allemagne',
    drapeau: '🇩🇪',
    couleur: '#05164D',
    textColor: '#FFD700',
    description: 'Compagnie allemande. Connexions via Francfort et Munich.',
    siteWeb: 'https://www.lufthansa.com',
    hubs: { MA: ['CMN','RAK','AGA'], TN: ['TUN'], DZ: ['ALG'] },
    destinations: ['FRA','MUC','DUS','BER','HAM','ZRH','VIE','CPH','OSL','ARN','PRG','WAW','LHR','JFK','YUL'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const cabinMap = { economy: 'Y', business: 'C', first: 'F' }
      const p = new URLSearchParams({
        bookingFlow: 'CLASSIC',
        origin: from, destination: to,
        outwardDate: fmt(date),
        adults: pax, children: 0, infants: 0,
        class: cabinMap[cabin] || 'Y',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.lufthansa.com/fr/fr/vol?${p}`
    },
  },

  {
    id: 'IB',
    nom: 'Iberia',
    iata: 'IB',
    pays: 'Espagne',
    drapeau: '🇪🇸',
    couleur: '#D8001D',
    textColor: '#fff',
    description: 'Compagnie nationale espagnole. Hub Madrid.',
    siteWeb: 'https://www.iberia.com',
    hubs: { MA: ['CMN','RAK','AGA','FEZ','TNG'] },
    destinations: ['MAD','BCN','VLC','AGP','CDG','LHR','FRA','FCO','JFK','YUL'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        travelDate: fmt(date),
        adults: pax,
        tripType: returnDate ? 'RT' : 'OW',
        cabin: cabin === 'business' ? 'C' : 'T',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.iberia.com/fr/vols/?${p}`
    },
  },

  {
    id: 'I2',
    nom: 'Iberia Express',
    iata: 'I2',
    pays: 'Espagne',
    drapeau: '🇪🇸',
    couleur: '#CC0000',
    textColor: '#fff',
    description: 'Low-cost du groupe Iberia. Connexions courtes depuis Madrid.',
    siteWeb: 'https://www.iberiaexpress.com',
    hubs: { MA: ['CMN','TNG','AGA'] },
    destinations: ['MAD','BCN','ALC','PMI','AGP','SVQ','LPA','TFN'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ origin: from, destination: to, departure: fmt(date), adults: pax })
      return `https://www.iberiaexpress.com/fr/reservations?${p}`
    },
  },

  {
    id: 'NT',
    nom: 'Binter Canarias',
    iata: 'NT',
    pays: 'Espagne',
    drapeau: '🇪🇸',
    couleur: '#0033CC',
    textColor: '#fff',
    description: 'Compagnie des Canaries. Liaisons Îles Canaries–Maroc.',
    siteWeb: 'https://www.bintercanarias.com',
    hubs: { MA: ['TNG','AGA','OUD','CMN'] },
    destinations: ['LPA','TFN','TFS','ACE','SPC','FUE','GMZ'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ origin: from, destination: to, date: fmt(date), adults: pax })
      return `https://www.bintercanarias.com/reservas/vuelos?${p}`
    },
  },

  {
    id: 'UX',
    nom: 'Air Europa',
    iata: 'UX',
    pays: 'Espagne',
    drapeau: '🇪🇸',
    couleur: '#003087',
    textColor: '#FFD700',
    description: 'Compagnie espagnole. Hub Madrid. Connexions transatlantiques.',
    siteWeb: 'https://www.aireuropa.com',
    hubs: { MA: ['CMN','RAK'] },
    destinations: ['MAD','BCN','PMI','VLC','AGP','LPA','JFK','YUL','GRU','BUE','SCL','LIM'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({ origin: from, destination: to, departureDate: fmt(date), adults: pax, ...(returnDate ? { returnDate: fmt(returnDate) } : {}) })
      return `https://www.aireuropa.com/es/vuelos?${p}`
    },
  },

  {
    id: 'KL',
    nom: 'KLM',
    iata: 'KL',
    pays: 'Pays-Bas',
    drapeau: '🇳🇱',
    couleur: '#009DDC',
    textColor: '#fff',
    description: 'Compagnie néerlandaise. Hub Amsterdam Schiphol.',
    siteWeb: 'https://www.klm.fr',
    hubs: { MA: ['CMN','RAK','TNG'], TN: ['TUN'], DZ: ['ALG'], EG: ['CAI'] },
    destinations: ['AMS','FRA','CDG','LHR','JFK','YYZ'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        outboundDate: fmt(date),
        adults: pax, children: 0, infants: 0,
        cabinClass: cabin === 'business' ? 'BUSINESS' : 'ECONOMY',
        ...(returnDate ? { inboundDate: fmt(returnDate) } : {}),
      })
      return `https://www.klm.fr/fr/search/result?${p}`
    },
  },

  {
    id: 'SN',
    nom: 'Brussels Airlines',
    iata: 'SN',
    pays: 'Belgique',
    drapeau: '🇧🇪',
    couleur: '#1B1F5E',
    textColor: '#fff',
    description: 'Compagnie belge. Hub Bruxelles. Connexions Afrique.',
    siteWeb: 'https://www.brusselsairlines.com',
    hubs: { MA: ['CMN','RAK'], TN: ['TUN'] },
    destinations: ['BRU','FRA','AMS','CDG','LHR'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ origin: from, destination: to, departureDate: fmt(date), adults: pax })
      return `https://www.brusselsairlines.com/fr/fr/searchresult?${p}`
    },
  },

  {
    id: 'BA',
    nom: 'British Airways',
    iata: 'BA',
    pays: 'Royaume-Uni',
    drapeau: '🇬🇧',
    couleur: '#075AAA',
    textColor: '#fff',
    description: 'Compagnie nationale britannique. Hub Londres Heathrow.',
    siteWeb: 'https://www.britishairways.com',
    hubs: { MA: ['CMN','RAK','AGA'], TN: ['TUN'], EG: ['CAI'] },
    destinations: ['LHR','LGW','MAN','BHX','LBA','NCL','EDI','CDG','FRA','MAD','BCN','FCO','AMS','JFK','YYZ','DXB','DOH'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const cabinMap = { economy: 'M', business: 'C', first: 'F' }
      const p = new URLSearchParams({
        eId: '100', tripType: returnDate ? 'R' : 'O',
        from: from, to: to,
        depart: fmt(date),
        Adt: pax, Chd: 0, Inf: 0,
        cabin: cabinMap[cabin] || 'M',
        ...(returnDate ? { ret: fmt(returnDate) } : {}),
      })
      return `https://www.britishairways.com/travel/book/public/en_fr?${p}`
    },
  },

  {
    id: 'LX',
    nom: 'Swiss International Air Lines',
    iata: 'LX',
    pays: 'Suisse',
    drapeau: '🇨🇭',
    couleur: '#CC0000',
    textColor: '#fff',
    description: 'Compagnie nationale suisse. Hub Zurich et Genève.',
    siteWeb: 'https://www.swiss.com',
    hubs: { MA: ['CMN','RAK'], TN: ['TUN'] },
    destinations: ['ZRH','GVA','BSL','FRA','CDG','LHR','JFK','BKK','BOM','DEL'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        outboundDate: fmt(date),
        adults: pax, cabin: cabin === 'business' ? 'C' : 'Y',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.swiss.com/fr/fr/book/flights?${p}`
    },
  },

  {
    id: 'TP',
    nom: 'TAP Air Portugal',
    iata: 'TP',
    pays: 'Portugal',
    drapeau: '🇵🇹',
    couleur: '#009B3A',
    textColor: '#fff',
    description: 'Compagnie nationale portugaise. Hub Lisbonne. Passerelle Europe–Amériques.',
    siteWeb: 'https://www.flytap.com',
    hubs: { MA: ['CMN','RAK','AGA','TNG'] },
    destinations: ['LIS','OPO','FAO','CDG','FRA','LHR','MAD','FCO','JFK','YUL','YYZ','GRU','LIM','BOG'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        outboundDate: fmt(date),
        adults: pax, cabin: cabin === 'business' ? 'C' : 'Y',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.flytap.com/fr-fr/vols?${p}`
    },
  },

  {
    id: 'X3',
    nom: 'TUI fly Deutschland',
    iata: 'X3',
    pays: 'Allemagne',
    drapeau: '🇩🇪',
    couleur: '#E4003B',
    textColor: '#fff',
    description: 'Charter allemand TUI. Vols saisonniers Allemagne–Maroc.',
    siteWeb: 'https://www.tuifly.com',
    hubs: { MA: ['CMN','RAK','AGA'] },
    destinations: ['FRA','MUC','DUS','BER','HAM','CGN','STR','NUE'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.tuifly.com/en/search?origin=${from}&destination=${to}&departureDate=${fmt(date)}&adults=${pax}`
    },
  },

  {
    id: 'TB',
    nom: 'TUI fly Belgium',
    iata: 'TB',
    pays: 'Belgique',
    drapeau: '🇧🇪',
    couleur: '#E4003B',
    textColor: '#fff',
    description: 'Charter belge TUI. Vols saisonniers Belgique–Maroc.',
    siteWeb: 'https://www.tuifly.be',
    hubs: { MA: ['CMN','RAK','AGA'] },
    destinations: ['BRU','CRL','AMS'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.tuifly.be/fr/search?origin=${from}&destination=${to}&departureDate=${fmt(date)}&adults=${pax}`
    },
  },

  {
    id: 'DE',
    nom: 'Condor',
    iata: 'DE',
    pays: 'Allemagne',
    drapeau: '🇩🇪',
    couleur: '#FF6600',
    textColor: '#fff',
    description: 'Compagnie charter-régulier allemande. Vols longue distance.',
    siteWeb: 'https://www.condor.com',
    hubs: { MA: ['CMN','AGA','RAK'] },
    destinations: ['FRA','MUC','DUS','HAM','BER','STR'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ origin: from, destination: to, outboundDate: fmt(date), adults: pax })
      return `https://www.condor.com/fr/flights.jsp?${p}`
    },
  },

  {
    id: 'XQ',
    nom: 'SunExpress',
    iata: 'XQ',
    pays: 'Turquie',
    drapeau: '🇹🇷',
    couleur: '#E87722',
    textColor: '#fff',
    description: 'Joint-venture Lufthansa/Turkish. Vols loisirs Turquie–Europe.',
    siteWeb: 'https://www.sunexpress.com',
    hubs: { MA: ['CMN','AGA'] },
    destinations: ['FRA','MUC','DUS','HAM','STR','CGN','ZRH','VIE','IST','AYT','ADB'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ origin: from, destination: to, departureDate: fmt(date), adult: pax })
      return `https://www.sunexpress.com/fr/vols/?${p}`
    },
  },

  // ════════════════════════════════════════════
  //  MOYEN-ORIENT / GOLFE
  // ════════════════════════════════════════════
  {
    id: 'EK',
    nom: 'Emirates',
    iata: 'EK',
    pays: 'Émirats',
    drapeau: '🇦🇪',
    couleur: '#D71921',
    textColor: '#C49A22',
    description: 'Première compagnie mondiale. Hub Dubaï DXB.',
    siteWeb: 'https://www.emirates.com',
    hubs: {
      MA: ['CMN','RAK','AGA','TNG'],
      TN: ['TUN'],
      EG: ['CAI','HRG','SSH'],
    },
    destinations: ['DXB','BKK','KUL','BOM','DEL','PEK','PVG','JFK','YYZ','SYD','MEL','JNB','NBO','LHR','CDG','FRA'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const cabinMap = { economy: 'Y', business: 'C', first: 'F' }
      const p = new URLSearchParams({
        tripType: returnDate ? 'R' : 'O',
        origin: from, destination: to,
        travelClass: cabinMap[cabin] || 'Y',
        from: fmt(date),
        adults: pax, children: 0, infants: 0,
        ...(returnDate ? { to: fmt(returnDate) } : {}),
      })
      return `https://www.emirates.com/fr/french/book/flights/?${p}`
    },
  },

  {
    id: 'QR',
    nom: 'Qatar Airways',
    iata: 'QR',
    pays: 'Qatar',
    drapeau: '🇶🇦',
    couleur: '#5C0632',
    textColor: '#C8AA64',
    description: 'Compagnie 5 étoiles Skytrax. Hub Doha.',
    siteWeb: 'https://www.qatarairways.com',
    hubs: { MA: ['CMN','RAK'], TN: ['TUN'], EG: ['CAI'] },
    destinations: ['DOH','DXB','BKK','KUL','BOM','DEL','PEK','JFK','LHR','CDG','FRA','JNB','NBO','LOS','DKR'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const p = new URLSearchParams({
        widget: 'qr', adults: pax,
        from: from, to: to,
        departDate: fmt(date),
        triptype: returnDate ? 'R' : 'O',
        cabin: cabin === 'business' ? 'B' : (cabin === 'first' ? 'F' : 'E'),
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.qatarairways.com/fr-fr/flights/booking.html?${p}`
    },
  },

  {
    id: 'EY',
    nom: 'Etihad Airways',
    iata: 'EY',
    pays: 'Émirats',
    drapeau: '🇦🇪',
    couleur: '#A67C52',
    textColor: '#fff',
    description: 'Compagnie d\'Abu Dhabi. Vols via AUH.',
    siteWeb: 'https://www.etihad.com',
    hubs: { MA: ['CMN'], EG: ['CAI'] },
    destinations: ['AUH','DXB','BOM','DEL','BKK','PEK','LHR','CDG','FRA','JFK','JNB'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        type: returnDate ? 'return' : 'oneway',
        class: 'Economy',
        from: from, to: to,
        departDate: fmt(date),
        paxType: `ADT.${pax}`,
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.etihad.com/fr-ma/book-a-flight/fare-listing?${p}`
    },
  },

  {
    id: 'TK',
    nom: 'Turkish Airlines',
    iata: 'TK',
    pays: 'Turquie',
    drapeau: '🇹🇷',
    couleur: '#C70A0C',
    textColor: '#fff',
    description: 'La plus grande compagnie par destinations. Hub Istanbul.',
    siteWeb: 'https://www.turkishairlines.com',
    hubs: {
      MA: ['CMN','RAK','AGA'],
      TN: ['TUN'],
      DZ: ['ALG'],
      EG: ['CAI'],
    },
    destinations: ['IST','DXB','DOH','AUH','BKK','KUL','BOM','DEL','JFK','YYZ','LHR','CDG','FRA','AMS','BCN','FCO','ATH','CAI','JED','RUH','NBO','JNB','LOS','ADD','DKR','ABJ'],
    buildUrl: ({ from, to, date, returnDate, pax, cabin }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax,
        tripType: returnDate ? 'R' : 'O',
        cabinClass: cabin === 'business' ? 'BUSINESS' : 'ECONOMY',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.turkishairlines.com/en-ma/flights/?${p}`
    },
  },

  {
    id: 'FZ',
    nom: 'flydubai',
    iata: 'FZ',
    pays: 'Émirats',
    drapeau: '🇦🇪',
    couleur: '#E11837',
    textColor: '#fff',
    description: 'Low-cost du Golfe. Hub Dubaï DWC.',
    siteWeb: 'https://www.flydubai.com',
    hubs: {
      MA: ['CMN','RAK','AGA','FEZ','TNG'],
      TN: ['TUN'],
      EG: ['CAI','HRG','SSH'],
    },
    destinations: ['DXB','DWC','AMM','BEY','KWI','BAH','MCT','IST','CAI','JED','RUH','NBO','DAR'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        from: from, to: to,
        departureDate: fmt(date),
        adults: pax,
        flightType: returnDate ? 'Return' : 'OneWay',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.flydubai.com/en/book/search?${p}`
    },
  },

  {
    id: 'G9',
    nom: 'Air Arabia',
    iata: 'G9',
    pays: 'Émirats',
    drapeau: '🇦🇪',
    couleur: '#EE2E24',
    textColor: '#fff',
    description: 'Low-cost du Golfe. Hub Sharjah.',
    siteWeb: 'https://www.airarabia.com',
    hubs: {
      MA: ['CMN','RAK','AGA','FEZ','TNG','OUD','NDR'],
      TN: ['TUN'],
      EG: ['CAI'],
    },
    destinations: ['SHJ','DXB','AUH','AMM','BEY','KWI','BAH','MCT','CAI','JED','RUH','IST','ATH','BCN','MXP'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        fromCode: from, toCode: to,
        departDate: fmt(date),
        adults: pax, childrenCount: 0, infantCount: 0,
        triptype: returnDate ? 'Return' : 'OneWay',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://booking.airarabia.com/en?${p}`
    },
  },

  {
    id: 'RJ',
    nom: 'Royal Jordanian',
    iata: 'RJ',
    pays: 'Jordanie',
    drapeau: '🇯🇴',
    couleur: '#8B1C2E',
    textColor: '#C8A951',
    description: 'Compagnie nationale jordanienne. Hub Amman.',
    siteWeb: 'https://www.rj.com',
    hubs: { MA: ['CMN'], TN: ['TUN'], EG: ['CAI'] },
    destinations: ['AMM','DXB','AUH','DOH','KWI','BAH','BEY','CAI','IST','LHR','CDG','FRA','JFK','YUL'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        tripType: returnDate ? 'R' : 'O',
        origin: from, destination: to,
        departDate: fmt(date),
        adults: pax,
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.rj.com/en/book/flights?${p}`
    },
  },

  {
    id: 'ME',
    nom: 'Middle East Airlines',
    iata: 'ME',
    pays: 'Liban',
    drapeau: '🇱🇧',
    couleur: '#009900',
    textColor: '#fff',
    description: 'Compagnie nationale libanaise. Hub Beyrouth.',
    siteWeb: 'https://www.mea.com.lb',
    hubs: { MA: ['CMN'], TN: ['TUN'], EG: ['CAI'] },
    destinations: ['BEY','DXB','AUH','DOH','AMM','CAI','IST','CDG','LHR','FRA','FCO','AMS','ATH'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        outboundDate: fmt(date),
        adults: pax,
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.mea.com.lb/flights/search?${p}`
    },
  },

  {
    id: 'WY',
    nom: 'Oman Air',
    iata: 'WY',
    pays: 'Oman',
    drapeau: '🇴🇲',
    couleur: '#82001A',
    textColor: '#C89520',
    description: 'Compagnie sultanat d\'Oman. Hub Mascate.',
    siteWeb: 'https://www.omanair.com',
    hubs: { MA: ['CMN'] },
    destinations: ['MCT','DXB','DOH','AUH','BOM','DEL','BKK','KUL','LHR','FRA'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        type: returnDate ? 'RT' : 'OW',
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax,
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.omanair.com/en/book-flights?${p}`
    },
  },

  // ════════════════════════════════════════════
  //  AFRIQUE
  // ════════════════════════════════════════════
  {
    id: 'ET',
    nom: 'Ethiopian Airlines',
    iata: 'ET',
    pays: 'Éthiopie',
    drapeau: '🇪🇹',
    couleur: '#009A44',
    textColor: '#FCDD09',
    description: 'Plus grande compagnie africaine. Hub Addis-Abeba.',
    siteWeb: 'https://www.ethiopianairlines.com',
    hubs: { MA: ['CMN'], TN: ['TUN'], EG: ['CAI'] },
    destinations: ['ADD','NBO','JNB','LOS','ABJ','ACC','DKR','CAI','LHR','CDG','FRA','BKK','PEK','JFK'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        departureDate: fmt(date),
        adults: pax,
        tripType: returnDate ? 'RT' : 'OW',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.ethiopianairlines.com/ET/buy/flightsearch?${p}`
    },
  },

  {
    id: 'KQ',
    nom: 'Kenya Airways',
    iata: 'KQ',
    pays: 'Kenya',
    drapeau: '🇰🇪',
    couleur: '#C8102E',
    textColor: '#fff',
    description: 'Hub Nairobi. Réseau Afrique subsaharienne.',
    siteWeb: 'https://www.kenya-airways.com',
    hubs: { MA: ['CMN'] },
    destinations: ['NBO','JNB','LOS','ABJ','ACC','ADD','DAR','LHR','CDG','AMS','BOM'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ origin: from, destination: to, departureDate: fmt(date), adults: pax })
      return `https://www.kenya-airways.com/fr/book-a-trip/flights/search/?${p}`
    },
  },

  // ════════════════════════════════════════════
  //  ARABIE SAOUDITE
  // ════════════════════════════════════════════
  {
    id: 'SV',
    nom: 'Saudia',
    iata: 'SV',
    pays: 'Arabie Saoudite',
    drapeau: '🇸🇦',
    couleur: '#006B3F',
    textColor: '#fff',
    description: 'Compagnie nationale saoudienne. Vols vers JED, RUH, MED.',
    siteWeb: 'https://www.saudia.com',
    hubs: { MA: ['CMN','RAK','AGA'], TN: ['TUN'], EG: ['CAI'] },
    destinations: ['JED','RUH','MED','DXB','AMM','CAI','IST','LHR','CDG','FRA','BOM','DEL'],
    buildUrl: ({ from, to, date, returnDate, pax }) => {
      const p = new URLSearchParams({
        origin: from, destination: to,
        departDate: fmt(date),
        adults: pax,
        tripType: returnDate ? 'R' : 'O',
        ...(returnDate ? { returnDate: fmt(returnDate) } : {}),
      })
      return `https://www.saudia.com/en/book/flights/?${p}`
    },
  },

  {
    id: 'XY',
    nom: 'Flynas',
    iata: 'XY',
    pays: 'Arabie Saoudite',
    drapeau: '🇸🇦',
    couleur: '#FF6900',
    textColor: '#fff',
    description: 'Low-cost saoudienne. Tarifs compétitifs vers JED et RUH.',
    siteWeb: 'https://www.flynas.com',
    hubs: { MA: ['CMN'] },
    destinations: ['JED','RUH','MED','DXB','AMM','CAI'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.flynas.com/en/flight-booking?origin=${from}&destination=${to}&departureDate=${fmt(date)}&adults=${pax}`
    },
  },

  // ════════════════════════════════════════════
  //  CHARTER & AUTRES
  // ════════════════════════════════════════════
  {
    id: 'SS',
    nom: 'Corsair',
    iata: 'SS',
    pays: 'France',
    drapeau: '🇫🇷',
    couleur: '#004899',
    textColor: '#FF6600',
    description: 'Charter-régulier français. Spécialiste Maroc–Réunion–Antilles.',
    siteWeb: 'https://www.corsair.fr',
    hubs: { MA: ['CMN'] },
    destinations: ['ORY','CDG'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({ from, to, date: fmt(date), adults: pax })
      return `https://www.corsair.fr/fr/reservations?${p}`
    },
  },

  {
    id: 'PC',
    nom: 'Pegasus Airlines',
    iata: 'PC',
    pays: 'Turquie',
    drapeau: '🇹🇷',
    couleur: '#F7A800',
    textColor: '#1E293B',
    description: 'Low-cost turque. Hub Istanbul SAW.',
    siteWeb: 'https://www.flypgs.com',
    hubs: { MA: ['CMN'], TN: ['TUN'], EG: ['CAI'] },
    destinations: ['SAW','IST'],
    buildUrl: ({ from, to, date, pax }) => {
      const p = new URLSearchParams({
        tripType: 'OW', depPort: from, arrPort: to,
        depDate: fmtDot(date), passengerCount: pax,
      })
      return `https://www.flypgs.com/en/cheap-flights?${p}`
    },
  },

  {
    id: 'OR',
    nom: 'TUI fly Netherlands',
    iata: 'OR',
    pays: 'Pays-Bas',
    drapeau: '🇳🇱',
    couleur: '#E4003B',
    textColor: '#fff',
    description: 'Charter néerlandais TUI. Vols saisonniers Pays-Bas–Maroc.',
    siteWeb: 'https://www.tui.nl',
    hubs: { MA: ['CMN','RAK','AGA'] },
    destinations: ['AMS','EIN','RTM'],
    buildUrl: ({ from, to, date, pax }) => {
      return `https://www.tui.nl/vluchten?origin=${from}&destination=${to}&departureDate=${fmt(date)}&adults=${pax}`
    },
  },
]

// ─── Home airports per country ───────────────────────────────────────────────
const HOME_AIRPORTS = {
  MA: ['CMN','RAK','AGA','FEZ','TNG','OUD','NDR','EUN','RBA','VIL','TTU'],
  TN: ['TUN','SFA','DJE','MIR','TOE','TBJ'],
  DZ: ['ALG','ORN','AAE','CZL','BJA','TLM','GJL','BLJ','BSK','TMR','ELG','QSF','TGR','TIN'],
  LY: ['TIP','BEN','SEB'],
  EG: ['CAI','HRG','SSH','LXR','ASW','RMF','HBE'],
  MR: ['NKC','NDB'],
  FR: ['CDG','ORY','LYS','NCE','MRS','TLS','NTE','BOD','LIL','MPL','SXB'],
  BE: ['BRU','CRL'],
  NL: ['AMS','EIN'],
  DE: ['FRA','MUC','DUS','BER','HAM','CGN','STR','NUE'],
  CH: ['ZRH','GVA','BSL'],
  GB: ['LHR','LGW','STN','LTN','MAN','BHX','LBA','NCL','EDI'],
  ES: ['MAD','BCN','VLC','AGP','PMI','SVQ','ALC','BIO','LPA','TFN','TFS'],
  PT: ['LIS','OPO','FAO'],
  IT: ['FCO','MXP','BGY','VCE','NAP','BLQ','TRN','CTA','PMO'],
}

// ─── Route matching ──────────────────────────────────────────────────────────
export function findAirlinesForRoute(from, to, homeCountry = 'MA') {
  const homeAirports = HOME_AIRPORTS[homeCountry] || HOME_AIRPORTS.MA
  const fromIsHome = homeAirports.includes(from)
  const toIsHome   = homeAirports.includes(to)

  return AIRLINES.filter(airline => {
    const airlineHubs = airline.hubs[homeCountry] || []

    if (fromIsHome) {
      return airlineHubs.includes(from) && (airline.destinations.includes(to) || toIsHome)
    }
    if (toIsHome) {
      return airlineHubs.includes(to) && (airline.destinations.includes(from) || fromIsHome)
    }
    // Neither airport is local — show airlines that have hubs in this country and cover either end
    return airlineHubs.length > 0 && (
      airline.destinations.includes(from) || airline.destinations.includes(to)
    )
  })
}
