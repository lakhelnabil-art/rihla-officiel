// Builds a pre-filled search URL for each hotel booking platform.
// All functions accept { destination, checkIn, checkOut, guests, rooms, stars }.
// stars: 0 = toutes catégories, 1-5 = nombre d'étoiles minimum.

function pad(date) {
  return date
}

// YYYYMMDD format (no dashes) for Google Hotels
function compact(date) {
  return date.replace(/-/g, '')
}

export const HOTEL_PLATFORMS = [
  {
    id: 'booking',
    nom: 'Booking.com',
    couleur: '#003580',
    textColor: '#ffffff',
    emoji: '🌐',
    description: "Leader mondial avec plus de 28 millions d'établissements. Idéal pour toutes destinations, annulation gratuite souvent disponible.",
    // stars support: class=1..5
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const p = new URLSearchParams({
        ss: destination,
        checkin: pad(checkIn),
        checkout: pad(checkOut),
        group_adults: guests,
        no_rooms: rooms,
        lang: 'fr',
      })
      if (stars > 0) p.set('class', stars)
      return `https://www.booking.com/searchresults.html?${p}`
    },
  },
  {
    id: 'hotels_com',
    nom: 'Hotels.com',
    couleur: '#d32600',
    textColor: '#ffffff',
    emoji: '🏩',
    description: "Programme de fidélité 10e nuit offerte. Large choix d'hôtels, appartements et maisons de vacances worldwide.",
    // stars support: q-star-rating=3,4,5 (cumulative from min)
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const p = new URLSearchParams({
        'q-destination': destination,
        'q-check-in': pad(checkIn),
        'q-check-out': pad(checkOut),
        'q-rooms': rooms,
        'q-room-0-adults': guests,
      })
      if (stars > 0) {
        // Pass all ratings >= selected star
        const ratings = [1,2,3,4,5].filter(s => s >= stars).join(',')
        p.set('q-star-rating', ratings)
      }
      return `https://www.hotels.com/search.do?${p}`
    },
  },
  {
    id: 'expedia',
    nom: 'Expedia',
    couleur: '#fbce07',
    textColor: '#002244',
    emoji: '✈️',
    description: "Combinaison vol + hôtel souvent moins chère. Un des plus grands comparateurs au monde avec des offres exclusives.",
    // stars support: starRatings=30,40,50 (stars × 10, cumulative)
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const p = new URLSearchParams({
        destination,
        startDate: pad(checkIn),
        endDate: pad(checkOut),
        adults: guests,
        rooms,
        sort: 'RECOMMENDED',
      })
      if (stars > 0) {
        const ratings = [1,2,3,4,5].filter(s => s >= stars).map(s => s * 10).join(',')
        p.set('starRatings', ratings)
      }
      return `https://www.expedia.com/Hotel-Search?${p}`
    },
  },
  {
    id: 'orbitz',
    nom: 'Orbitz',
    couleur: '#0a5c9e',
    textColor: '#ffffff',
    emoji: '🛎️',
    description: "Filiale Expedia réputée pour ses prix agressifs aux États-Unis et ses offres packages vols + hôtels.",
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const p = new URLSearchParams({
        destination,
        startDate: pad(checkIn),
        endDate: pad(checkOut),
        adults: guests,
        rooms,
      })
      if (stars > 0) {
        const ratings = [1,2,3,4,5].filter(s => s >= stars).map(s => s * 10).join(',')
        p.set('starRatings', ratings)
      }
      return `https://www.orbitz.com/Hotel-Search?${p}`
    },
  },
  {
    id: 'travelocity',
    nom: 'Travelocity',
    couleur: '#1a7f4b',
    textColor: '#ffffff',
    emoji: '🧳',
    description: "Pionnier du voyage en ligne depuis 1996. Garantie du meilleur prix et service client disponible 24h/24.",
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const p = new URLSearchParams({
        destination,
        startDate: pad(checkIn),
        endDate: pad(checkOut),
        adults: guests,
        rooms,
      })
      if (stars > 0) {
        const ratings = [1,2,3,4,5].filter(s => s >= stars).map(s => s * 10).join(',')
        p.set('starRatings', ratings)
      }
      return `https://www.travelocity.com/Hotel-Search?${p}`
    },
  },
  {
    id: 'priceline',
    nom: 'Priceline',
    couleur: '#003087',
    textColor: '#ffffff',
    emoji: '💲',
    description: "Connu pour ses \"deals secrets\" avec des réductions jusqu'à 60%. Option \"Name Your Own Price\" pour les vrais chasseurs de prix.",
    // stars support: starRating=3 (min)
    buildUrl({ destination, checkIn, checkOut, guests, stars }) {
      const p = new URLSearchParams({
        hotelCity: destination,
        checkIn: pad(checkIn),
        checkOut: pad(checkOut),
        adults: guests,
      })
      if (stars > 0) p.set('starRating', stars)
      return `https://www.priceline.com/stay/search?${p}`
    },
  },
  {
    id: 'hotwire',
    nom: 'Hotwire',
    couleur: '#d0011b',
    textColor: '#ffffff',
    emoji: '🔥',
    description: "Spécialisé dans les tarifs de dernière minute et les chambres mystère à prix bradés. Jusqu'à 60% de réduction.",
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const p = new URLSearchParams({
        destination,
        startDate: pad(checkIn),
        endDate: pad(checkOut),
        adults: guests,
        rooms,
      })
      if (stars > 0) p.set('stars', stars)
      return `https://www.hotwire.com/hotel/search?${p}`
    },
  },
  {
    id: 'kayak',
    nom: 'Kayak',
    couleur: '#ff690f',
    textColor: '#ffffff',
    emoji: '🔍',
    description: "Méta-moteur qui compare Booking, Expedia, Hotels.com et des centaines d'autres en une seule recherche. Vue d'ensemble idéale.",
    // stars support: stars=3,4,5 appended as filter in URL path
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const dest = encodeURIComponent(destination)
      let url = `https://www.kayak.com/hotels/${dest}/${pad(checkIn)}/${pad(checkOut)}/${guests}adults/${rooms}rooms/`
      if (stars > 0) {
        const ratings = [1,2,3,4,5].filter(s => s >= stars).join(',')
        url += `?fs=stars=${ratings}`
      }
      return url
    },
  },
  {
    id: 'agoda',
    nom: 'Agoda',
    couleur: '#5b2d8e',
    textColor: '#ffffff',
    emoji: '🌏',
    description: "Leader incontesté en Asie avec des prix imbattables sur Bangkok, Tokyo, Dubaï, Bali. Membre du groupe Booking Holdings.",
    // stars support: stars=3 (min rating)
    buildUrl({ destination, checkIn, checkOut, guests, rooms, stars }) {
      const d1 = new Date(checkIn)
      const d2 = new Date(checkOut)
      const nights = Math.max(1, Math.round((d2 - d1) / 86400000))
      const p = new URLSearchParams({
        city: destination,
        checkIn: pad(checkIn),
        los: nights,
        adults: guests,
        rooms,
        lang: 'fr-fr',
      })
      if (stars > 0) p.set('stars', stars)
      return `https://www.agoda.com/search?${p}`
    },
  },
  {
    id: 'google_hotels',
    nom: 'Google Hotels',
    couleur: '#4285f4',
    textColor: '#ffffff',
    emoji: '🗺️',
    description: "Agrégateur Google qui compile toutes les sources en un seul écran avec carte interactive, filtres avancés et avis Google Maps.",
    // stars support: stars=3 (exact match in Google's filter)
    buildUrl({ destination, checkIn, checkOut, guests, stars }) {
      const p = new URLSearchParams({
        q: `hôtels ${destination}`,
        hl: 'fr',
        gl: 'ma',
        dates: `${compact(checkIn)},${compact(checkOut)}`,
        adults: guests,
      })
      if (stars > 0) p.set('stars', stars)
      return `https://www.google.com/travel/hotels?${p}`
    },
  },
]
