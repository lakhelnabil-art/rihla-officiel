// Répertoire des hôtels 5 étoiles par destination.
// Chaque entrée contient les infos de l'hôtel et l'URL officielle de son site web.
// Les clés sont normalisées en minuscules sans accents pour la recherche floue.

export const HOTELS_5_ETOILES = {

  // ─── Maroc ──────────────────────────────────────────────────────────────────
  marrakech: [
    {
      nom: 'Royal Mansour Marrakech',
      chaine: 'Collection privée (ONA)',
      quartier: 'Médina',
      description: 'Palais de 53 riads privés avec piscines intérieures, spa 2 500 m² et jardins secrets. Le summum du luxe marocain.',
      site: 'https://www.royalmansour.com/marrakech',
      emoji: '👑',
    },
    {
      nom: 'La Mamounia',
      chaine: 'The Leading Hotels of the World',
      quartier: 'Médina',
      description: 'Icône fondée en 1923, jardin de 8 ha, 3 restaurants gastronomiques, spa de 2 500 m². Favori de Churchill et Hitchcock.',
      site: 'https://www.mamounia.com',
      emoji: '🌹',
    },
    {
      nom: 'Four Seasons Resort Marrakech',
      chaine: 'Four Seasons',
      quartier: 'Hivernage',
      description: '2 piscines, jardins andalous, 5 restaurants et bars, spa primé. Quartier chic à 5 min de la Médina.',
      site: 'https://www.fourseasons.com/marrakech',
      emoji: '🍃',
    },
    {
      nom: 'Mandarin Oriental Marrakech',
      chaine: 'Mandarin Oriental',
      quartier: 'Route du Golf',
      description: '54 villas avec piscines privées, au milieu d\'une oliveraie. Spa et restaurant Mes\'lalla aux meilleurs produits du terroir.',
      site: 'https://www.mandarinoriental.com/marrakech',
      emoji: '🏡',
    },
    {
      nom: 'Amanjena',
      chaine: 'Aman Resorts',
      quartier: 'Route d\'Ouarzazate',
      description: '32 pavillons et maisons inspirés d\'un palais mauresque. Piscine bassin, ambiance exclusive et sereine.',
      site: 'https://www.aman.com/resorts/amanjena',
      emoji: '🕌',
    },
    {
      nom: 'Sofitel Marrakech Lounge & Spa',
      chaine: 'Sofitel',
      quartier: 'Hivernage',
      description: 'Architecture Art Déco mauresque, 5 piscines, Spa MyBlend by Clarins. Excellent rapport qualité / prestations.',
      site: 'https://www.sofitel-marrakech.com',
      emoji: '✨',
    },
  ],

  agadir: [
    {
      nom: 'Sofitel Agadir Royal Bay Resort',
      chaine: 'Sofitel',
      quartier: 'Baie d\'Agadir',
      description: 'Accès direct à la plage, 2 piscines, thalassothérapie, centre de bien-être. Vue imprenable sur la baie.',
      site: 'https://www.sofitel-agadir.com',
      emoji: '🌊',
    },
    {
      nom: 'Hyatt Place Agadir',
      chaine: 'Hyatt',
      quartier: 'Secteur Balnéaire',
      description: 'Hôtel moderne en bord de mer, piscines extérieures, restaurant panoramique et spa.',
      site: 'https://www.hyatt.com/en-US/hotel/morocco/hyatt-place-agadir/agazp',
      emoji: '🏖️',
    },
    {
      nom: 'Riu Palace Tikida Agadir',
      chaine: 'RIU Hotels',
      quartier: 'Plage d\'Agadir',
      description: 'Complexe all-inclusive de luxe en première ligne de plage, 3 piscines, 6 restaurants et soirées animées.',
      site: 'https://www.riu.com/en/hotel/morocco/agadir/hotel-riu-palace-tikida-agadir',
      emoji: '🌴',
    },
    {
      nom: 'Atlantic Palace Agadir',
      chaine: 'Indépendant',
      quartier: 'Front de Mer',
      description: 'Palais de style arabo-andalou, piscines à débordement, thalasso, golf à proximité.',
      site: 'https://www.atlanticpalaceagadir.com',
      emoji: '🏰',
    },
  ],

  casablanca: [
    {
      nom: 'Four Seasons Hotel Casablanca',
      chaine: 'Four Seasons',
      quartier: 'Anfa',
      description: 'Vue sur l\'Atlantique, spa, piscine à débordement, restaurants gastronomiques. Le plus luxueux de Casa.',
      site: 'https://www.fourseasons.com/casablanca',
      emoji: '🌅',
    },
    {
      nom: 'Sofitel Casablanca Tour Blanche',
      chaine: 'Sofitel',
      quartier: 'Centre-ville',
      description: 'Tour emblématique de 28 étages, vue 360° sur la ville et l\'Atlantique, spa So, restaurant Le Cabanon.',
      site: 'https://www.sofitel-casablanca.com',
      emoji: '🗼',
    },
    {
      nom: 'Hyatt Regency Casablanca',
      chaine: 'Hyatt',
      quartier: 'Place des Nations Unies',
      description: 'Hôtel d\'affaires premium au cœur du CBD, salles de conférences, rooftop bar, vue sur la Mosquée Hassan II.',
      site: 'https://www.hyatt.com/en-US/hotel/morocco/hyatt-regency-casablanca/casrc',
      emoji: '🏙️',
    },
    {
      nom: 'Kenzi Tower Hotel',
      chaine: 'Kenzi Hotels',
      quartier: 'Twin Center',
      description: 'Au sommet du Twin Center, chambres panoramiques, restaurant Sens sur le toit, idéal pour les voyages d\'affaires.',
      site: 'https://www.kenzihotels.com/tower',
      emoji: '🌆',
    },
  ],

  'fes': [
    {
      nom: 'Palais Faraj Suites & Spa',
      chaine: 'Indépendant',
      quartier: 'Médina de Fès',
      description: 'Vue panoramique sur la médina, riad de luxe dans un palais du XIXe siècle, spa et cuisine marocaine raffinée.',
      site: 'https://www.palaisfaraj.com',
      emoji: '🔮',
    },
    {
      nom: 'Riad Fès - Relais & Châteaux',
      chaine: 'Relais & Châteaux',
      quartier: 'Médina',
      description: 'Riad du XVIIIe siècle, 3 patios, hammam privatif, restaurant gastronomique. Bijou architectural de la médina.',
      site: 'https://www.riadfes.com',
      emoji: '🏺',
    },
    {
      nom: 'Sofitel Fes Palais Jamai',
      chaine: 'Sofitel',
      quartier: 'Bab Guissa',
      description: 'Ancien palais viziral du XIXe siècle, jardin andalou, vue sur la Médina classée UNESCO.',
      site: 'https://www.sofitel.com/gb/hotel-1554-sofitel-fes-palais-jamai/index.shtml',
      emoji: '🌺',
    },
  ],

  tanger: [
    {
      nom: 'El Minzah Hotel',
      chaine: 'Indépendant',
      quartier: 'Médina',
      description: 'Hôtel mythique ouvert en 1930, fréquenté par Tennessee Williams et Truman Capote. Piscine, jardin andalou.',
      site: 'https://www.elminzah.com',
      emoji: '🎭',
    },
    {
      nom: 'Hilton Tanger City Center',
      chaine: 'Hilton',
      quartier: 'Centre-ville',
      description: 'Vue sur le Détroit de Gibraltar, rooftop piscine, spa, restaurant panoramique. Ouverture récente.',
      site: 'https://www.hilton.com/en/hotels/tngcchh-hilton-tanger-city-center',
      emoji: '⚓',
    },
  ],

  rabat: [
    {
      nom: 'Sofitel Rabat Jardin des Roses',
      chaine: 'Sofitel',
      quartier: 'Hay Riad',
      description: 'Palais entouré d\'un jardin de 5 ha, piscine, spa MyBlend, accès depuis le quartier diplomatique.',
      site: 'https://www.sofitel-rabat-jardins-des-roses.com',
      emoji: '🌸',
    },
    {
      nom: 'The Oberoi Rabat',
      chaine: 'Oberoi Hotels',
      quartier: 'Route de Zaers',
      description: 'Resort ultraprémium en milieu naturel, villas privées avec jardins, spa Oberoi, cuisine internationale.',
      site: 'https://www.oberoihotels.com/hotels-in-rabat',
      emoji: '🦚',
    },
  ],

  // ─── Moyen-Orient ─────────────────────────────────────────────────────────────
  dubai: [
    {
      nom: 'Burj Al Arab Jumeirah',
      chaine: 'Jumeirah',
      quartier: 'Jumeirah',
      description: 'Symbole de Dubaï, le seul hôtel "7 étoiles" du monde. Suites de 170 m² minimum, butler privé 24h/24, hélicoptère sur demande.',
      site: 'https://www.jumeirah.com/en/hotels-resorts/dubai/burj-al-arab',
      emoji: '⛵',
    },
    {
      nom: 'Atlantis The Palm',
      chaine: 'Atlantis Hotels',
      quartier: 'Palm Jumeirah',
      description: 'Resort iconique sur Palm Jumeirah, parc aquatique Aquaventure, 17 restaurants dont Nobu et Gordon Ramsay.',
      site: 'https://www.atlantis.com/dubai/atlantis-the-palm',
      emoji: '🐚',
    },
    {
      nom: 'Armani Hotel Dubai',
      chaine: 'Armani Hotels',
      quartier: 'Burj Khalifa',
      description: 'Seul hôtel conçu par Giorgio Armani, dans le Burj Khalifa. Minimalisme et raffinement absolus.',
      site: 'https://www.armanihotels.com/en/hotels/dubai',
      emoji: '🖤',
    },
    {
      nom: 'Four Seasons Resort Dubai at Jumeirah Beach',
      chaine: 'Four Seasons',
      quartier: 'Jumeirah Beach',
      description: 'Accès privé à la plage, piscines à débordement vue mer, spa de 2 200 m², 10 restaurants et bars.',
      site: 'https://www.fourseasons.com/dubaijb',
      emoji: '🌊',
    },
    {
      nom: 'One&Only The Palm',
      chaine: 'One&Only Resorts',
      quartier: 'Palm Jumeirah',
      description: 'Boutique resort ultra-exclusif, marina privée, 3 restaurants signés par des chefs étoilés, spa marocain.',
      site: 'https://www.oneandonlyresorts.com/the-palm',
      emoji: '🌴',
    },
    {
      nom: 'Address Downtown Dubai',
      chaine: 'Address Hotels',
      quartier: 'Downtown',
      description: 'Vue directe sur le Burj Khalifa et la Dubai Fountain, piscine à débordement, ambiance cosmopolite.',
      site: 'https://www.addresshotels.com/en/hotels/address-downtown',
      emoji: '🏙️',
    },
  ],

  'la mecque': [
    {
      nom: 'Fairmont Makkah Clock Royal Tower',
      chaine: 'Fairmont',
      quartier: 'Abraj Al-Bait',
      description: 'La plus haute horloge du monde, vue directe sur la Kaaba, 858 chambres et suites. À 2 min à pied de la Grande Mosquée.',
      site: 'https://www.fairmont.com/mecca',
      emoji: '🕋',
    },
    {
      nom: 'Hilton Suites Makkah',
      chaine: 'Hilton',
      quartier: 'Al-Masa',
      description: 'Suites spacieuses avec vue sur la Masjid Al-Haram, restaurants halal, service de navette mosque.',
      site: 'https://www.hilton.com/en/hotels/makhitw-hilton-suites-makkah',
      emoji: '🌙',
    },
    {
      nom: 'Conrad Makkah',
      chaine: 'Conrad Hotels (Hilton)',
      quartier: 'Abraj Al-Bait',
      description: 'Suites premium à 300m de la Kaaba, vue imprenable, restaurant international, service conciergerie pèlerinage.',
      site: 'https://www.hilton.com/en/hotels/makcocy-conrad-makkah',
      emoji: '⭐',
    },
    {
      nom: 'Raffles Makkah Palace',
      chaine: 'Raffles Hotels',
      quartier: 'Abraj Al-Bait',
      description: 'Suites de luxe avec vue sur la Masjid Al-Haram, butlers dédiés, expérience du pèlerinage haut de gamme.',
      site: 'https://www.raffles.com/makkah',
      emoji: '👑',
    },
  ],

  medine: [
    {
      nom: 'Anwar Al Madinah Mövenpick Hotel',
      chaine: 'Mövenpick',
      quartier: 'Al-Masjid al-Nabawi',
      description: 'À 50m de la Mosquée du Prophète, vue directe, chambres Qibla-facing, restaurant international halal.',
      site: 'https://www.movenpick.com/en/middle-east/saudi-arabia/medina/hotel-anwar-al-madinah',
      emoji: '🕌',
    },
    {
      nom: 'Oberoi Madinah',
      chaine: 'Oberoi',
      quartier: 'Al Madinah',
      description: 'Luxe discret à proximité de la Mosquée du Prophète, suites spacieuses, service personnalisé, spa.',
      site: 'https://www.oberoihotels.com/hotels-in-madinah',
      emoji: '🌿',
    },
  ],

  istanbul: [
    {
      nom: 'Four Seasons Hotel Istanbul at Sultanahmet',
      chaine: 'Four Seasons',
      quartier: 'Sultanahmet',
      description: 'Ancien palais de justice ottoman transformé en hôtel de légende, à 50m de Sainte-Sophie et de la Mosquée Bleue.',
      site: 'https://www.fourseasons.com/istanbul',
      emoji: '🕌',
    },
    {
      nom: 'Çırağan Palace Kempinski Istanbul',
      chaine: 'Kempinski',
      quartier: 'Beşiktaş',
      description: 'Ancien palais ottoman du sultan Abdülaziz sur le Bosphore, piscine dans le détroit, suites royales historiques.',
      site: 'https://www.kempinski.com/en/istanbul/ciragan-palace',
      emoji: '🏯',
    },
    {
      nom: 'Mandarin Oriental Bosphorus Istanbul',
      chaine: 'Mandarin Oriental',
      quartier: 'Kuruçeşme',
      description: 'Resort de luxe sur le Bosphore, spa de 2 000 m², restaurants gastronomiques, accès privé au détroit.',
      site: 'https://www.mandarinoriental.com/istanbul/bosphorus',
      emoji: '🌉',
    },
    {
      nom: 'Raffles Istanbul',
      chaine: 'Raffles',
      quartier: 'Zorlu Center',
      description: 'Hôtel contemporain de 181 suites dans le Zorlu Center, spa Raffles, rooftop Turk Fatih Tutak étoilé Michelin.',
      site: 'https://www.raffles.com/istanbul',
      emoji: '✨',
    },
  ],

  doha: [
    {
      nom: 'Mondrian Doha',
      chaine: 'Mondrian',
      quartier: 'West Bay',
      description: 'Design spectaculaire par Marcel Wanders, piscine à débordement, bar Walima, vue sur la skyline de Doha.',
      site: 'https://www.mondrian-doha.com',
      emoji: '🎨',
    },
    {
      nom: 'Marsa Malaz Kempinski The Pearl',
      chaine: 'Kempinski',
      quartier: 'The Pearl',
      description: 'Resort palatial sur The Pearl, accès privé à la marina, spa de 3 000 m², 9 restaurants.',
      site: 'https://www.kempinski.com/en/the-pearl-doha/marsa-malaz-kempinski',
      emoji: '🐚',
    },
    {
      nom: 'The St. Regis Doha',
      chaine: 'St. Regis (Marriott)',
      quartier: 'West Bay Lagoon',
      description: 'Hôtel ultra-luxueux face à la mer, butler service 24h/24, Iridium Spa, 7 restaurants et bars.',
      site: 'https://www.marriott.com/en-us/hotels/dohxr-the-st-regis-doha',
      emoji: '⭐',
    },
  ],

  'abu dhabi': [
    {
      nom: 'Emirates Palace Mandarin Oriental',
      chaine: 'Mandarin Oriental',
      quartier: 'Corniche',
      description: 'Palais de 1 km², 114 coupoles, 394 chambres et suites. L\'un des hôtels les plus chers et impressionnants au monde.',
      site: 'https://www.mandarinoriental.com/en/abu-dhabi/emirates-palace',
      emoji: '🏰',
    },
    {
      nom: 'Louvre Abu Dhabi Hotel',
      chaine: 'Indépendant',
      quartier: 'Saadiyat Island',
      description: 'Adjacent au musée du Louvre Abu Dhabi, design contemporain, plage privée, vue sur le détroit.',
      site: 'https://www.louvrehotel.ae',
      emoji: '🎨',
    },
  ],

  // ─── Europe ──────────────────────────────────────────────────────────────────
  paris: [
    {
      nom: 'Hôtel Ritz Paris',
      chaine: 'Ritz Paris',
      quartier: 'Place Vendôme',
      description: 'Fondé en 1898, l\'hôtel le plus mythique du monde. Coco Chanel y résidait. Bar Hemingway, piscine Espa Ritz.',
      site: 'https://www.ritzparis.com',
      emoji: '🥂',
    },
    {
      nom: 'Le Bristol Paris',
      chaine: 'Oetker Collection',
      quartier: 'Faubourg Saint-Honoré',
      description: 'Palace parisien, restaurant Epicure 3 étoiles Michelin, spa agréé L\'Occitane, jardin à la française.',
      site: 'https://www.oetkercollection.com/hotels/le-bristol-paris',
      emoji: '🌸',
    },
    {
      nom: 'Four Seasons Hotel George V Paris',
      chaine: 'Four Seasons',
      quartier: 'Champs-Élysées',
      description: 'Classé monument historique, 3 restaurants étoilés Michelin dont Le Cinq, spa de 2 500 m². Légendaire.',
      site: 'https://www.fourseasons.com/paris',
      emoji: '🌹',
    },
    {
      nom: 'Hôtel Plaza Athénée',
      chaine: 'Dorchester Collection',
      quartier: 'Avenue Montaigne',
      description: 'Face à la Tour Eiffel, restaurant Alain Ducasse 3 étoiles Michelin, Dior Institut, balcons fleuris iconiques.',
      site: 'https://www.dorchestercollection.com/paris/hotel-plaza-athenee',
      emoji: '🗼',
    },
    {
      nom: 'Le Meurice',
      chaine: 'Dorchester Collection',
      quartier: 'Tuileries',
      description: 'Palace du XVIIIe siècle, restaurant Le Meurice 2 étoiles Michelin, vue sur les jardins des Tuileries.',
      site: 'https://www.dorchestercollection.com/paris/le-meurice',
      emoji: '👑',
    },
    {
      nom: 'Mandarin Oriental Paris',
      chaine: 'Mandarin Oriental',
      quartier: 'Rue Saint-Honoré',
      description: 'Ancien siège du Figaro, jardin intérieur parisien unique, spa de 900 m², restaurant Camélia.',
      site: 'https://www.mandarinoriental.com/paris',
      emoji: '🌺',
    },
  ],

  barcelone: [
    {
      nom: 'Hotel Arts Barcelona',
      chaine: 'Ritz-Carlton',
      quartier: 'Barceloneta',
      description: 'Tour de 44 étages en bord de mer, 2 piscines dont une sur le toit, spa, marina privée.',
      site: 'https://www.hotelartsbarcelona.com',
      emoji: '🌊',
    },
    {
      nom: 'W Barcelona',
      chaine: 'W Hotels (Marriott)',
      quartier: 'La Barceloneta',
      description: 'Hôtel voilier iconique en bord de mer, AWAY Spa, rooftop Eclipse Bar avec vue à 360°.',
      site: 'https://www.marriott.com/en-us/hotels/bcnwh-w-barcelona',
      emoji: '⛵',
    },
    {
      nom: 'Mandarin Oriental Barcelona',
      chaine: 'Mandarin Oriental',
      quartier: 'Passeig de Gràcia',
      description: 'Sur la plus belle avenue de Barcelone, suites et jardins, spa, restaurant étoilé Moments.',
      site: 'https://www.mandarinoriental.com/barcelona',
      emoji: '🌿',
    },
  ],

  rome: [
    {
      nom: 'Hotel de Russie',
      chaine: 'Rocco Forte Hotels',
      quartier: 'Piazza del Popolo',
      description: 'Jardin en terrasses unique à Rome, spa, restaurant Stravinskij Bar fréquenté par les célébrités.',
      site: 'https://www.roccofortehotels.com/hotels-and-resorts/hotel-de-russie',
      emoji: '🌿',
    },
    {
      nom: 'Hotel Hassler Roma',
      chaine: 'Indépendant',
      quartier: 'Scalinata di Trinità dei Monti',
      description: 'Au sommet des Marches Espagnoles, restaurant panoramique Imàgo, 5e génération de direction familiale.',
      site: 'https://www.hotelhasslerroma.com',
      emoji: '🏛️',
    },
    {
      nom: 'Rome Cavalieri Waldorf Astoria',
      chaine: 'Waldorf Astoria (Hilton)',
      quartier: 'Monte Mario',
      description: 'Vue panoramique sur Rome, collection d\'art inestimable, 3 piscines, restaurant La Pergola 3 étoiles Michelin.',
      site: 'https://www.romecavalieri.com',
      emoji: '🎨',
    },
  ],

  // ─── Afrique ─────────────────────────────────────────────────────────────────
  'le caire': [
    {
      nom: 'Four Seasons Hotel Cairo at Nile Plaza',
      chaine: 'Four Seasons',
      quartier: 'Garden City',
      description: 'Sur les berges du Nil, vue sur les pyramides au loin, 3 piscines, 8 restaurants dont Zitouni gastronomique.',
      site: 'https://www.fourseasons.com/caironp',
      emoji: '🛕',
    },
    {
      nom: 'Marriott Mena House Cairo',
      chaine: 'Marriott',
      quartier: 'Giza',
      description: 'Palais historique de chasse à 200m des pyramides de Gizeh, jardins de 40 ha, piscine olympique.',
      site: 'https://www.marriott.com/en-us/hotels/cairg-marriott-mena-house-cairo',
      emoji: '🔺',
    },
    {
      nom: 'The Nile Ritz-Carlton Cairo',
      chaine: 'Ritz-Carlton',
      quartier: 'Tahrir',
      description: 'Surplombant la Place Tahrir et le Nil, rooftop panoramique, spa, accès au Musée Égyptien à pied.',
      site: 'https://www.ritzcarlton.com/en/hotels/egypt/cairo',
      emoji: '🌊',
    },
  ],

  nairobi: [
    {
      nom: 'Hemingways Nairobi',
      chaine: 'Indépendant',
      quartier: 'Karen',
      description: 'Boutique hôtel de 45 suites dans le quartier de Karen Blixen, vue sur les collines de Ngong, spa, gastronomique.',
      site: 'https://www.hemingways-nairobi.com',
      emoji: '🌍',
    },
    {
      nom: 'The Norfolk Hotel',
      chaine: 'Fairmont',
      quartier: 'Central Nairobi',
      description: 'Fondé en 1904, mélange d\'histoire coloniale et luxe moderne, jardin tropique, restaurant The Delamere.',
      site: 'https://www.fairmont.com/norfolk-nairobi',
      emoji: '🦁',
    },
  ],

  // ─── Asie ────────────────────────────────────────────────────────────────────
  bali: [
    {
      nom: 'Four Seasons Resort Bali at Sayan',
      chaine: 'Four Seasons',
      quartier: 'Ubud',
      description: 'Niché dans la jungle au-dessus de la rivière Ayung, villas avec piscines privées, spa de méditation.',
      site: 'https://www.fourseasons.com/balisayan',
      emoji: '🌿',
    },
    {
      nom: 'Amandari',
      chaine: 'Aman Resorts',
      quartier: 'Ubud',
      description: 'Bungalows balinais sur les terrasses de rizières, piscine à débordement vue jungle, spas traditionnels.',
      site: 'https://www.aman.com/resorts/amandari',
      emoji: '🌾',
    },
    {
      nom: 'The Mulia Bali',
      chaine: 'Mulia Hotels',
      quartier: 'Nusa Dua',
      description: 'Plage privée de 800m, 7 restaurants et bars, spa de 3 000 m², piscines à débordement vue océan.',
      site: 'https://www.themulia.com/bali',
      emoji: '🌊',
    },
  ],

  // ─── Amériques ───────────────────────────────────────────────────────────────
  'new york': [
    {
      nom: 'The Plaza New York',
      chaine: 'Fairmont',
      quartier: 'Midtown Manhattan',
      description: 'Monument new-yorkais depuis 1907, face à Central Park, spa, Palm Court pour le tea time légendaire.',
      site: 'https://www.theplazany.com',
      emoji: '🍎',
    },
    {
      nom: 'Four Seasons Hotel New York',
      chaine: 'Four Seasons',
      quartier: 'Midtown East',
      description: 'Gratte-ciel de I.M. Pei, 52 étages, spa de 1 300 m², chambres parmi les plus silencieuses de NYC.',
      site: 'https://www.fourseasons.com/newyork',
      emoji: '🏙️',
    },
    {
      nom: 'The Mark New York',
      chaine: 'Indépendant',
      quartier: 'Upper East Side',
      description: 'Hôtel boutique de luxe face au Metropolitan Museum, restaurant Jean-Georges, suites avec cuisine privée.',
      site: 'https://www.themarkhotel.com',
      emoji: '🎭',
    },
  ],
}

// Normalise une chaîne pour la recherche (minuscules, sans accents)
function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Cherche les hôtels 5 étoiles correspondant à une destination
export function findHotels5Stars(destination) {
  if (!destination) return []
  const q = normalize(destination)

  // Recherche exacte d'abord
  for (const [key, hotels] of Object.entries(HOTELS_5_ETOILES)) {
    if (normalize(key) === q) return hotels
  }

  // Recherche partielle (la destination contient le mot-clé ou vice-versa)
  for (const [key, hotels] of Object.entries(HOTELS_5_ETOILES)) {
    const nKey = normalize(key)
    if (q.includes(nKey) || nKey.includes(q)) return hotels
  }

  return []
}
