// ─── Visa & Entry Requirements Data ─────────────────────────────────────────
// Structure: VISA_DATA[passportISO][destinationISO] = VisaEntry
//
// Types: 'libre' | 'voa' | 'evisa' | 'ambassade' | 'refus'
// libre     = no visa needed (visa-free)
// voa       = visa on arrival
// evisa     = electronic visa (apply online before travel)
// ambassade = embassy / consulate visa required
// refus     = entry not possible / no diplomatic relations

export const PASSPORT_OPTIONS = [
  { code: 'MA', label: '🇲🇦 Marocain' },
  { code: 'DZ', label: '🇩🇿 Algérien' },
  { code: 'TN', label: '🇹🇳 Tunisien' },
  { code: 'SN', label: '🇸🇳 Sénégalais' },
  { code: 'CI', label: '🇨🇮 Ivoirien' },
  { code: 'CM', label: '🇨🇲 Camerounais' },
  { code: 'FR', label: '🇫🇷 Français' },
  { code: 'BE', label: '🇧🇪 Belge' },
  { code: 'GB', label: '🇬🇧 Britannique' },
  { code: 'US', label: '🇺🇸 Américain' },
  { code: 'CA', label: '🇨🇦 Canadien' },
  { code: 'TR', label: '🇹🇷 Turc' },
  { code: 'SA', label: '🇸🇦 Saoudien' },
  { code: 'AE', label: '🇦🇪 Émirati' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LIBRE = (duree = '90 jours', notes = '') => ({
  type: 'libre',
  duree,
  procedure: ['Aucune démarche préalable requise.', 'Présenter un passeport valide à l\'arrivée.'],
  documents: [
    'Passeport valide (min. 6 mois après la date de retour)',
    'Billet d\'avion aller-retour',
    'Justificatif d\'hébergement',
    'Moyens financiers suffisants',
  ],
  medical: [],
  cout: 'Gratuit',
  delai: 'Immédiat',
  notes,
})

const VOA = ({ duree, cout, delai, documents = [], medical = [], notes = '', lien = '' }) => ({
  type: 'voa',
  duree,
  procedure: [
    'Se présenter au comptoir Visa à l\'arrivée.',
    'Remplir le formulaire d\'entrée fourni à bord ou sur place.',
    'Payer les frais de visa (espèces USD/EUR généralement acceptés).',
    'Récupérer le tampon de visa sur le passeport.',
  ],
  documents: [
    'Passeport valide (min. 6 mois)',
    'Photo d\'identité récente (fond blanc, 3,5×4,5 cm)',
    'Billet aller-retour',
    'Justificatif d\'hébergement',
    ...documents,
  ],
  medical,
  cout,
  delai,
  notes,
  lien,
})

const EVISA = ({ duree, cout, delai, documents = [], medical = [], notes = '', lien = '' }) => ({
  type: 'evisa',
  duree,
  procedure: [
    'Accéder au portail officiel e-Visa du pays de destination.',
    'Créer un compte et remplir le formulaire en ligne.',
    'Uploader les documents requis (passeport scanné, photo, etc.).',
    'Payer les frais par carte bancaire.',
    'Recevoir le visa par e-mail (imprimer ou télécharger le QR code).',
    'Présenter l\'e-Visa à l\'embarquement et à l\'arrivée.',
  ],
  documents: [
    'Passeport valide (min. 6 mois) — scan haute qualité',
    'Photo d\'identité numérique (fond blanc)',
    'Billet d\'avion confirmé',
    'Justificatif d\'hébergement (réservation hôtel)',
    ...documents,
  ],
  medical,
  cout,
  delai,
  notes,
  lien,
})

const AMBASSADE = ({ duree, cout, delai, documents = [], medical = [], notes = '', lien = '' }) => ({
  type: 'ambassade',
  duree,
  procedure: [
    'Prendre rendez-vous en ligne ou par téléphone auprès du consulat compétent.',
    'Réunir l\'ensemble des documents requis.',
    'Déposer le dossier en personne au consulat (ou par courrier selon pays).',
    'Payer les frais de visa (généralement non remboursables).',
    'Attendre la décision et récupérer le passeport.',
  ],
  documents: [
    'Passeport valide (min. 6 mois après le retour) + 2 photocopies',
    'Formulaire de demande de visa dûment rempli et signé',
    '2 photos d\'identité récentes (3,5×4,5 cm, fond blanc)',
    'Billet d\'avion aller-retour (ou réservation)',
    'Justificatif d\'hébergement (invitation / réservation hôtel)',
    'Relevés bancaires des 3 derniers mois',
    'Justificatif de revenus (bulletin de salaire ou attestation d\'emploi)',
    ...documents,
  ],
  medical,
  cout,
  delai,
  notes,
  lien,
})

// ─── VISA_DATA ────────────────────────────────────────────────────────────────
// VISA_DATA[passport][destination]
export const VISA_DATA = {

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT MAROCAIN 🇲🇦
  // ══════════════════════════════════════════════════════════════════════════
  MA: {
    // Maroc → Maroc
    MA: LIBRE('Illimité', 'Déplacement intérieur — aucune formalité.'),

    // ── Afrique ──────────────────────────────────────────────────────────────
    TN: LIBRE('90 jours', 'Accord bilatéral Maroc–Tunisie. CIN suffisante pour les ressortissants marocains.'),
    MR: LIBRE('90 jours'),
    SN: LIBRE('90 jours'),
    ML: LIBRE('90 jours'),
    GN: LIBRE('90 jours'),
    BF: LIBRE('90 jours'),
    NE: LIBRE('90 jours'),
    TD: LIBRE('90 jours'),
    CI: LIBRE('90 jours'),
    TG: LIBRE('90 jours'),
    BJ: LIBRE('90 jours'),
    GA: LIBRE('90 jours'),
    GQ: LIBRE('90 jours'),
    MG: LIBRE('90 jours', 'Visa gratuit à l\'arrivée valable 30 jours.'),
    MU: LIBRE('90 jours'),
    KM: LIBRE('45 jours'),
    DJ: VOA({ duree: '31 jours', cout: '10 000 DJF (~50 USD)', delai: 'Immédiat', notes: 'Visa délivré à l\'arrivée à l\'aéroport de Djibouti.' }),
    ET: EVISA({ duree: '30 jours', cout: '82 USD (simple entrée)', delai: '3–5 jours ouvrables', lien: 'https://www.evisa.gov.et', medical: ['Carnet de vaccination contre la fièvre jaune obligatoire si arrivée d\'un pays endémique.'] }),
    RW: EVISA({ duree: '30 jours renouvelables', cout: '50 USD', delai: '72 heures', lien: 'https://irembo.gov.rw', medical: ['Vaccin fièvre jaune recommandé.', 'Traitement antipaludéen conseillé.'] }),
    KE: EVISA({ duree: '90 jours', cout: '51 USD', delai: '48–72 heures', lien: 'https://etakenya.go.ke', medical: ['Certificat fièvre jaune si arrivée de pays endémique.', 'Prophylaxie antipaludéenne recommandée.'] }),
    TZ: EVISA({ duree: '90 jours', cout: '50 USD', delai: '5–7 jours ouvrables', lien: 'https://eservices.immigration.go.tz', medical: ['Certificat fièvre jaune obligatoire.', 'Antipaludéens recommandés pour zones rurales.'] }),
    UG: EVISA({ duree: '90 jours', cout: '50 USD', delai: '48–72 heures', lien: 'https://visas.immigration.go.ug', medical: ['Vaccin fièvre jaune obligatoire.', 'Antipaludéens fortement conseillés.'] }),
    ZA: AMBASSADE({ duree: '90 jours', cout: '780 DH (~80 USD)', delai: '5–10 jours ouvrables', documents: ['Attestation d\'emploi ou preuve d\'activité', 'Assurance voyage'], medical: [], notes: 'Dépôt du dossier au consulat d\'Afrique du Sud à Casablanca.' }),
    EG: EVISA({ duree: '30 jours', cout: '25 USD', delai: '3–7 jours ouvrables', lien: 'https://visa2egypt.gov.eg', notes: 'Également disponible en VOA à l\'arrivée (25 USD).' }),
    LY: AMBASSADE({ duree: 'Variable', cout: 'Selon consulat', delai: '7–15 jours', notes: '⚠️ Situation sécuritaire instable. Consulter le MAE avant tout déplacement.', medical: ['Vaccins hépatite A & B recommandés.'] }),
    CM: EVISA({ duree: '90 jours', cout: '60 USD', delai: '72 heures', lien: 'https://www.evisacam.cm', medical: ['Vaccin fièvre jaune obligatoire.', 'Antipaludéens recommandés.'] }),
    GH: AMBASSADE({ duree: '60 jours', cout: '60 USD', delai: '3–5 jours ouvrables', medical: ['Vaccin fièvre jaune recommandé.', 'Antipaludéens fortement conseillés.'] }),
    NG: AMBASSADE({ duree: '30 jours', cout: '160 USD', delai: '5–10 jours ouvrables', documents: ['Lettre d\'invitation si visite d\'affaires'], medical: ['Vaccin fièvre jaune obligatoire.', 'Hépatite A & B recommandés.'] }),
    AO: EVISA({ duree: '30 jours', cout: '120 USD', delai: '5 jours ouvrables', medical: ['Vaccin fièvre jaune obligatoire.', 'Antipaludéens recommandés.'] }),
    MZ: VOA({ duree: '30 jours', cout: '50 USD', delai: 'Immédiat', medical: ['Vaccin fièvre jaune si arrivée de pays endémique.', 'Antipaludéens recommandés.'] }),

    // ── Moyen-Orient ─────────────────────────────────────────────────────────
    TR: EVISA({ duree: '90 jours / 180 jours', cout: '14 EUR', delai: 'Immédiat à 24h', lien: 'https://www.evisa.gov.tr', notes: 'Visa valable pour séjours touristiques et d\'affaires.' }),
    AE: AMBASSADE({ duree: '30 jours renouvelables', cout: '270–400 MAD (selon type)', delai: '2–5 jours ouvrables', documents: ['Photo couleur fond blanc', 'Attestation bancaire ou sponsor émirati'], medical: [], notes: 'Demande possible en ligne via le GDRFA ou par les compagnies aériennes (Emirates, Flydubai). Visa transit 96h disponible.' }),
    SA: EVISA({ duree: '90 jours (séjour) / 365 jours (validité)', cout: '300–535 SAR (~300–570 MAD)', delai: '24–72 heures', lien: 'https://visa.visitsaudi.com', documents: ['Assurance médicale voyage incluse dans le visa'], medical: ['Méningite méningococcique obligatoire pour les pèlerins (Omra/Hajj).', 'Polio recommandé.'], notes: 'Visa touristique disponible en ligne. Les ressortissantes féminines de moins de 25 ans peuvent voyager seules.' }),
    QA: AMBASSADE({ duree: '30 jours', cout: '100 QAR (~120 MAD)', delai: '3–7 jours ouvrables', documents: ['Billet retour', 'Réservation hôtelière'], medical: [], notes: 'Visa on arrival également disponible dans certains cas. Vérifier via Qatar Airways ou le portail de l\'immigration qatarienne.' }),
    BH: EVISA({ duree: '14 jours (extensible)', cout: '25 BHD (~290 MAD)', delai: '24–72 heures', lien: 'https://www.evisa.gov.bh', medical: [] }),
    KW: AMBASSADE({ duree: '1 mois', cout: '10 KWD (~140 MAD)', delai: '5–10 jours ouvrables', documents: ['Lettre d\'invitation si visite de famille'], medical: [] }),
    JO: LIBRE('30 jours', 'Visa gratuit à l\'arrivée pour les ressortissants marocains depuis 2017.'),
    LB: AMBASSADE({ duree: '1 mois', cout: 'Variable', delai: '5–7 jours ouvrables', medical: [], notes: '⚠️ Situation sécuritaire à surveiller. Consulter le MAE avant tout voyage.' }),
    EG: EVISA({ duree: '30 jours', cout: '25 USD', delai: '3–7 jours ouvrables', lien: 'https://visa2egypt.gov.eg' }),

    // ── Europe (Schengen & autres) ────────────────────────────────────────────
    FR: AMBASSADE({
      duree: '90 jours / 180 jours (Schengen)',
      cout: '80 EUR (~870 MAD)',
      delai: '15 jours ouvrables minimum (postuler 3 mois avant)',
      documents: [
        'Formulaire Schengen rempli et signé',
        'Relevés bancaires 6 derniers mois (solde minimum recommandé : 50–70 EUR/jour)',
        'Attestation d\'emploi ou d\'activité + bulletin de salaire',
        'Assurance voyage Schengen (min. 30 000 EUR de couverture)',
        'Lettre de motivation / détail du voyage',
        'Titre de propriété ou contrat de bail',
        'Historique de visa (si disponible)',
      ],
      medical: [],
      notes: 'Dépôt via le Centre de Visa France (VFS Global) à Casablanca, Rabat, Fès, Marrakech, Agadir. Biométrie obligatoire.',
      lien: 'https://france-visas.gouv.fr',
    }),
    ES: AMBASSADE({
      duree: '90 jours / 180 jours (Schengen)',
      cout: '80 EUR (~870 MAD)',
      delai: '15 jours ouvrables (jusqu\'à 45 jours en haute saison)',
      documents: [
        'Formulaire national de demande de visa',
        'Relevés bancaires 3 derniers mois',
        'Attestation d\'emploi + fiche de paie',
        'Assurance voyage Schengen (min. 30 000 EUR)',
        'Réservation d\'hôtel ou attestation d\'hébergement',
        'Billet aller-retour',
      ],
      medical: [],
      notes: 'Rendez-vous via BLS International ou le Consulat d\'Espagne. Dépôt biométrique obligatoire.',
      lien: 'https://www.exteriores.gob.es',
    }),
    IT: AMBASSADE({
      duree: '90 jours / 180 jours (Schengen)',
      cout: '80 EUR (~870 MAD)',
      delai: '15–30 jours',
      documents: [
        'Formulaire de demande visa Schengen',
        'Relevés bancaires 3 mois',
        'Preuve d\'emploi ou activité',
        'Assurance voyage Schengen',
        'Réservation hôtelière ou invitation',
      ],
      medical: [],
      notes: 'Dépôt via VFS Global Italie.',
      lien: 'https://vfsglobal.com/italy/morocco',
    }),
    DE: AMBASSADE({
      duree: '90 jours / 180 jours (Schengen)',
      cout: '80 EUR (~870 MAD)',
      delai: '15 jours ouvrables',
      documents: [
        'Formulaire Schengen (en allemand ou français)',
        'Relevés bancaires 3 mois',
        'Attestation d\'emploi + bulletins de salaire',
        'Assurance voyage Schengen',
        'Billet et hébergement confirmés',
      ],
      medical: [],
      notes: 'Dépôt au Goethe-Institut ou au consulat allemand. Rendez-vous souvent en forte demande.',
      lien: 'https://maroc.diplo.de',
    }),
    NL: AMBASSADE({
      duree: '90 jours (Schengen)',
      cout: '80 EUR',
      delai: '15 jours ouvrables',
      documents: [
        'Formulaire Schengen',
        'Assurance voyage (min. 30 000 EUR)',
        'Relevés bancaires 3 mois',
        'Preuves de logement et billet',
      ],
      medical: [],
      notes: 'Dépôt via VFS Global Pays-Bas.',
    }),
    BE: AMBASSADE({
      duree: '90 jours (Schengen)',
      cout: '80 EUR',
      delai: '15 jours ouvrables',
      documents: [
        'Formulaire de demande',
        'Assurance Schengen',
        'Justificatifs financiers (3 mois)',
        'Billet + hébergement',
      ],
      medical: [],
      notes: 'Consulat de Belgique à Casablanca ou Rabat.',
    }),
    PT: AMBASSADE({
      duree: '90 jours (Schengen)',
      cout: '80 EUR',
      delai: '15 jours ouvrables',
      documents: [
        'Formulaire Schengen',
        'Assurance voyage',
        'Relevés bancaires',
        'Justificatifs d\'emploi et de revenus',
        'Réservation hôtel + billet',
      ],
      medical: [],
      notes: 'Via VFS Global Portugal.',
    }),
    CH: AMBASSADE({
      duree: '90 jours (espace Schengen)',
      cout: '80 CHF (~900 MAD)',
      delai: '15 jours ouvrables',
      documents: [
        'Formulaire Schengen',
        'Assurance voyage (min. 30 000 CHF)',
        'Relevés bancaires',
        'Preuve d\'emploi',
        'Billet + hébergement',
      ],
      medical: [],
      notes: 'Via l\'Ambassade Suisse à Rabat ou VFS Global.',
    }),
    AT: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi', 'Billet + hébergement'], medical: [], notes: 'Via le Consulat autrichien ou VFS Global.' }),
    GR: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires 3 mois', 'Preuve de revenus', 'Hébergement + billet'], medical: [], notes: 'Via le Consulat grec à Casablanca.' }),
    GB: AMBASSADE({
      duree: '6 mois (Standard Visitor Visa)',
      cout: '115 GBP (~1 600 MAD)',
      delai: '15–21 jours ouvrables',
      documents: [
        'Formulaire en ligne (UK Visas)',
        'Relevés bancaires 6 mois',
        'Preuve d\'emploi / activité',
        'Lettre de motivation détaillée',
        'Billet + hébergement',
        'Preuve de liens avec le Maroc (famille, propriété)',
      ],
      medical: [],
      notes: 'Le Royaume-Uni n\'est plus dans l\'espace Schengen. Visa distinct requis même si visa Schengen déjà obtenu.',
      lien: 'https://www.gov.uk/standard-visitor-visa',
    }),
    SE: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi', 'Billet + hébergement'], medical: [], notes: 'Via VFS Global Suède.' }),
    DK: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi', 'Hébergement + billet'], medical: [], notes: 'Via le Consulat danois ou VFS.' }),
    NO: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [], notes: 'Consulat de Norvège à Casablanca.' }),
    FI: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [] }),
    PL: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '10–15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [] }),
    CZ: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '10–15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [] }),
    RO: AMBASSADE({ duree: '90 jours', cout: '35 EUR', delai: '10 jours', documents: ['Formulaire', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [], notes: 'La Roumanie n\'est pas encore dans l\'espace Schengen pour les contrôles terrestres, mais le visa Schengen est accepté pour l\'aérien.' }),

    // ── Amériques ────────────────────────────────────────────────────────────
    US: AMBASSADE({
      duree: '10 ans (validité visa B1/B2) — séjour max. 6 mois par entrée',
      cout: '185 USD (~1 850 MAD)',
      delai: '45–120 jours (délai de rendez-vous variable)',
      documents: [
        'Formulaire DS-160 (en ligne)',
        'Reçu de paiement des frais SEVIS/MRV',
        'Relevés bancaires 12 mois',
        'Preuve d\'emploi / entreprise + fiche de paie',
        'Titres de propriété ou contrat de bail',
        'Lettre de motivation (but du voyage)',
        'Preuve de liens forts avec le Maroc',
        'Billets + hébergement (non obligatoire mais conseillé)',
        'Preuve de voyages antérieurs (passeports précédents)',
      ],
      medical: [],
      notes: 'Entretien obligatoire à l\'Ambassade américaine à Rabat ou au Consulat à Casablanca. Refus possible sans justification. Frais non remboursables.',
      lien: 'https://ma.usembassy.gov/visas',
    }),
    CA: AMBASSADE({
      duree: '6 mois',
      cout: '100 CAD (~290 MAD)',
      delai: '15–60 jours',
      documents: [
        'Formulaire IMM 5257 (en ligne)',
        'Relevés bancaires 6 mois',
        'Preuve d\'emploi / situation financière',
        'Lettre de motivation',
        'Billet + hébergement',
        'Preuve de liens avec le Maroc',
      ],
      medical: [],
      notes: 'Demande en ligne via le portail IRCC. Biométrie requise (75 CAD supplémentaires).',
      lien: 'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/visiteurs.html',
    }),
    BR: LIBRE('90 jours', 'Accord de réciprocité entre le Maroc et le Brésil.'),
    MX: LIBRE('180 jours', 'Les ressortissants marocains sont exempts de visa pour le Mexique.'),
    AR: LIBRE('90 jours'),

    // ── Asie ─────────────────────────────────────────────────────────────────
    TR: EVISA({ duree: '90 jours / 180 jours', cout: '14 EUR', delai: 'Immédiat', lien: 'https://www.evisa.gov.tr' }),
    ID: VOA({ duree: '30 jours renouvelable', cout: '500 000 IDR (~140 MAD)', delai: 'Immédiat', notes: 'Visa on arrival à Bali (Denpasar) et autres aéroports internationaux.', medical: ['Vaccin hépatite A recommandé.', 'Antipaludéens selon zone.', 'Vaccin typhoïde recommandé.'] }),
    TH: LIBRE('30 jours', 'Les ressortissants marocains sont exempts de visa pour la Thaïlande (30 jours).'),
    MY: LIBRE('90 jours'),
    SG: LIBRE('30 jours'),
    IN: EVISA({ duree: '60 jours (double entrée)', cout: '25–100 USD selon nationalité', delai: '72 heures à 5 jours', lien: 'https://indianvisaonline.gov.in', medical: ['Vaccin fièvre jaune si arrivée de pays endémique.', 'Hépatite A et typhoïde recommandés.'] }),
    CN: AMBASSADE({
      duree: '30 à 60 jours',
      cout: '350 MAD (~35 USD)',
      delai: '4–7 jours ouvrables',
      documents: [
        'Formulaire de demande de visa chinois',
        'Photo d\'identité récente',
        'Billet d\'avion aller-retour confirmé',
        'Hébergement confirmé',
        'Relevés bancaires 3 mois',
        'Preuve d\'emploi',
      ],
      medical: [],
      notes: 'Via le Consulat de Chine à Casablanca ou l\'Ambassade à Rabat.',
    }),
    JP: AMBASSADE({
      duree: '90 jours (simple entrée)',
      cout: '1 500 JPY (~50 MAD)',
      delai: '5 jours ouvrables',
      documents: [
        'Formulaire de demande visa Japon',
        'Itinéraire détaillé du voyage',
        'Réservations hôtelières',
        'Billet aller-retour',
        'Relevés bancaires 3–6 mois',
        'Preuve d\'emploi ou attestation',
      ],
      medical: [],
      notes: 'Rendez-vous via l\'Ambassade du Japon à Rabat. Procédure réputée rapide et bien organisée.',
    }),
    KR: AMBASSADE({ duree: '90 jours', cout: '60–90 USD', delai: '5–10 jours', documents: ['Formulaire', 'Relevés bancaires', 'Preuve d\'emploi', 'Billet + hébergement'], medical: [] }),
    AZ: EVISA({ duree: '30 jours', cout: '20 USD', delai: '3 jours ouvrables', lien: 'https://evisa.gov.az', medical: [] }),
    GE: LIBRE('365 jours', 'Les Marocains peuvent séjourner en Géorgie jusqu\'à 1 an sans visa.'),
    AM: LIBRE('180 jours'),
    UZ: LIBRE('30 jours', 'Exemption visa pour ressortissants marocains depuis 2022.'),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', notes: 'Visa on arrival gratuit aux Maldives pour tous les touristes.', medical: [] }),
    LK: EVISA({ duree: '30 jours', cout: '20 USD', delai: '24–72 heures', lien: 'https://eta.gov.lk', medical: ['Vaccin hépatite A recommandé.'] }),
    NP: VOA({ duree: '15 ou 30 jours', cout: '30–50 USD', delai: 'Immédiat', medical: ['Vaccin hépatite A recommandé.', 'Typhoïde conseillé.'] }),

    // ── Océanie ──────────────────────────────────────────────────────────────
    AU: EVISA({ duree: '3, 6 ou 12 mois (multiple entrées)', cout: '20 AUD (~45 MAD)', delai: '24–72 heures', lien: 'https://immi.homeaffairs.gov.au', medical: ['Déclaration de santé si séjour > 12 mois.'], notes: 'e-Visitor Visa (subclass 651) disponible en ligne.' }),
    NZ: EVISA({ duree: '9 mois max par an', cout: '17 NZD (~40 MAD)', delai: '72 heures', lien: 'https://nzeta.immigration.govt.nz', notes: 'NZeTA (New Zealand Electronic Travel Authority) requise.' }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT ALGÉRIEN 🇩🇿
  // ══════════════════════════════════════════════════════════════════════════
  DZ: {
    MA: LIBRE('90 jours'),
    TN: LIBRE('90 jours'),
    TR: LIBRE('90 jours', 'Les ressortissants algériens sont exempts de visa pour la Turquie.'),
    AE: AMBASSADE({ duree: '30 jours', cout: 'Variable', delai: '3–5 jours', documents: ['Photo', 'Relevés bancaires', 'Billet + hébergement'], medical: [] }),
    FR: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires 3 mois', 'Preuve d\'emploi', 'Billet + hébergement'], medical: [], notes: 'Via VFS Global ou le Consulat français.' }),
    ES: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15–45 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [] }),
    GE: LIBRE('365 jours'),
    MR: LIBRE('90 jours'),
    SN: LIBRE('90 jours'),
    JO: LIBRE('30 jours'),
    EG: LIBRE('30 jours', 'Les ressortissants algériens peuvent entrer en Égypte sans visa.'),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT TUNISIEN 🇹🇳
  // ══════════════════════════════════════════════════════════════════════════
  TN: {
    MA: LIBRE('90 jours', 'CIN suffisante.'),
    DZ: LIBRE('90 jours'),
    TR: LIBRE('90 jours'),
    SN: LIBRE('90 jours'),
    MR: LIBRE('90 jours'),
    JO: LIBRE('30 jours'),
    EG: LIBRE('30 jours'),
    GE: LIBRE('365 jours'),
    FR: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi', 'Billet + hébergement'], medical: [], notes: 'Via VFS Global Tunisie (Tunis).' }),
    AE: AMBASSADE({ duree: '30 jours', cout: 'Variable', delai: '3–5 jours', documents: ['Photo', 'Relevés bancaires', 'Billet + hébergement'], medical: [] }),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT FRANÇAIS 🇫🇷
  // ══════════════════════════════════════════════════════════════════════════
  FR: {
    MA: LIBRE('90 jours', 'Accord franco-marocain. Accès libre jusqu\'à 90 jours.'),
    TN: LIBRE('90 jours'),
    DZ: AMBASSADE({ duree: '90 jours', cout: '99 EUR', delai: '15–30 jours', documents: ['Formulaire de demande', 'Assurance voyage', 'Relevés bancaires', 'Billet + hébergement', 'Preuve d\'emploi'], medical: [], notes: 'Via le Consulat d\'Algérie en France.' }),
    TR: LIBRE('90 jours'),
    AE: LIBRE('90 jours', 'Visa automatique à l\'arrivée gratuit pour les ressortissants français.'),
    US: LIBRE('90 jours', 'Programme ESTA (Electronic System for Travel Authorization). Demande en ligne 72h avant le voyage. Coût : 21 USD. Validité 2 ans.'),
    CA: LIBRE('6 mois', 'AVE (Autorisation de Voyage Électronique) requise. Demande en ligne. Coût : 7 CAD.'),
    AU: LIBRE('3 mois', 'eVisitor (subclass 651) gratuit disponible en ligne.'),
    JP: LIBRE('90 jours'),
    CN: LIBRE('15 jours', 'Exemption de visa temporaire pour transit court séjour (vérifier le statut actuel).'),
    IN: EVISA({ duree: '60 jours', cout: '25–100 USD', delai: '72 heures', lien: 'https://indianvisaonline.gov.in', medical: ['Fièvre jaune si arrivée de pays endémique.'] }),
    TH: LIBRE('30 jours'),
    SN: LIBRE('90 jours'),
    CI: LIBRE('90 jours'),
    KE: EVISA({ duree: '90 jours', cout: '51 USD', delai: '48–72 heures', lien: 'https://etakenya.go.ke' }),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
    SA: EVISA({ duree: '90 jours / 365 jours (validité)', cout: '300–535 SAR', delai: '24–72h', lien: 'https://visa.visitsaudi.com', medical: ['Méningite obligatoire pour Hajj/Omra.'] }),
    GE: LIBRE('365 jours'),
    RW: EVISA({ duree: '30 jours', cout: '50 USD', delai: '72h', lien: 'https://irembo.gov.rw' }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT BELGE 🇧🇪
  // ══════════════════════════════════════════════════════════════════════════
  BE: {
    MA: LIBRE('90 jours'),
    TN: LIBRE('90 jours'),
    DZ: AMBASSADE({ duree: '90 jours', cout: '99 EUR', delai: '15–30 jours', documents: ['Formulaire', 'Assurance voyage', 'Relevés bancaires', 'Billet + hébergement'], medical: [] }),
    TR: LIBRE('90 jours'),
    AE: LIBRE('90 jours'),
    US: LIBRE('90 jours', 'ESTA requis (21 USD, validité 2 ans).'),
    CA: LIBRE('6 mois', 'AVE requise (7 CAD).'),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
    SA: EVISA({ duree: '90 jours', cout: '300–535 SAR', delai: '24–72h', lien: 'https://visa.visitsaudi.com' }),
    GE: LIBRE('365 jours'),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT BRITANNIQUE 🇬🇧
  // ══════════════════════════════════════════════════════════════════════════
  GB: {
    MA: LIBRE('90 jours'),
    FR: LIBRE('90 jours (accord post-Brexit pour courts séjours)'),
    ES: LIBRE('90 jours'),
    TN: LIBRE('90 jours'),
    AE: LIBRE('90 jours'),
    TR: EVISA({ duree: '90 jours', cout: '14 EUR', delai: 'Immédiat', lien: 'https://www.evisa.gov.tr' }),
    US: LIBRE('90 jours', 'ESTA requis (21 USD).'),
    CA: LIBRE('6 mois', 'AVE requise (7 CAD).'),
    AU: LIBRE('12 mois (ETA)', ''),
    SA: EVISA({ duree: '90 jours', cout: '300–535 SAR', delai: '24–72h', lien: 'https://visa.visitsaudi.com' }),
    GE: LIBRE('365 jours'),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT AMÉRICAIN 🇺🇸
  // ══════════════════════════════════════════════════════════════════════════
  US: {
    MA: LIBRE('90 jours'),
    FR: LIBRE('90 jours (Schengen)'),
    ES: LIBRE('90 jours (Schengen)'),
    DE: LIBRE('90 jours (Schengen)'),
    IT: LIBRE('90 jours (Schengen)'),
    GB: LIBRE('6 mois'),
    TR: EVISA({ duree: '90 jours', cout: '14 EUR', delai: 'Immédiat', lien: 'https://www.evisa.gov.tr' }),
    AE: LIBRE('90 jours'),
    SA: EVISA({ duree: '90 jours', cout: '300–535 SAR', delai: '24–72h', lien: 'https://visa.visitsaudi.com' }),
    IN: EVISA({ duree: '60 jours', cout: '80 USD', delai: '72 heures', lien: 'https://indianvisaonline.gov.in', medical: ['Fièvre jaune si arrivée de pays endémique.'] }),
    CN: AMBASSADE({ duree: '60–90 jours', cout: '140 USD', delai: '4–7 jours', documents: ['Formulaire DS-160 Chine', 'Billet', 'Hébergement', 'Relevés bancaires'], medical: [] }),
    JP: LIBRE('90 jours'),
    TH: LIBRE('30 jours'),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
    GE: LIBRE('365 jours'),
    TN: LIBRE('90 jours'),
    KE: EVISA({ duree: '90 jours', cout: '51 USD', delai: '48–72 heures', lien: 'https://etakenya.go.ke' }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT CANADIEN 🇨🇦
  // ══════════════════════════════════════════════════════════════════════════
  CA: {
    MA: LIBRE('90 jours'),
    FR: LIBRE('90 jours (Schengen)'),
    ES: LIBRE('90 jours (Schengen)'),
    GB: LIBRE('6 mois'),
    TR: EVISA({ duree: '90 jours', cout: '14 EUR', delai: 'Immédiat', lien: 'https://www.evisa.gov.tr' }),
    AE: LIBRE('90 jours'),
    IN: EVISA({ duree: '60 jours', cout: '80 USD', delai: '72 heures', lien: 'https://indianvisaonline.gov.in' }),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
    GE: LIBRE('365 jours'),
    TN: LIBRE('90 jours'),
    SA: EVISA({ duree: '90 jours', cout: '300–535 SAR', delai: '24–72h', lien: 'https://visa.visitsaudi.com' }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT SÉNÉGALAIS 🇸🇳
  // ══════════════════════════════════════════════════════════════════════════
  SN: {
    MA: LIBRE('90 jours'),
    ML: LIBRE('90 jours'),
    GN: LIBRE('90 jours'),
    CI: LIBRE('90 jours'),
    BF: LIBRE('90 jours'),
    TG: LIBRE('90 jours'),
    BJ: LIBRE('90 jours'),
    NE: LIBRE('90 jours'),
    GH: VOA({ duree: '60 jours', cout: '150 USD', delai: 'Immédiat' }),
    TR: LIBRE('90 jours'),
    MR: LIBRE('90 jours'),
    FR: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi', 'Billet + hébergement'], medical: [], notes: 'Via VFS Global à Dakar.' }),
    US: AMBASSADE({ duree: '10 ans (B1/B2)', cout: '185 USD', delai: '45–90 jours', documents: ['DS-160', 'Relevés bancaires', 'Preuve d\'emploi', 'Lettre de motivation'], medical: [], notes: 'Via l\'Ambassade des États-Unis à Dakar.' }),
    AE: AMBASSADE({ duree: '30 jours', cout: 'Variable', delai: '3–5 jours', documents: ['Photo', 'Relevés bancaires', 'Billet + hébergement'], medical: [] }),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT IVOIRIEN 🇨🇮
  // ══════════════════════════════════════════════════════════════════════════
  CI: {
    MA: LIBRE('90 jours'),
    SN: LIBRE('90 jours'),
    ML: LIBRE('90 jours'),
    BF: LIBRE('90 jours'),
    GN: LIBRE('90 jours'),
    TG: LIBRE('90 jours'),
    BJ: LIBRE('90 jours'),
    NE: LIBRE('90 jours'),
    GH: VOA({ duree: '60 jours', cout: '150 USD', delai: 'Immédiat' }),
    TR: LIBRE('90 jours'),
    FR: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi', 'Billet + hébergement'], medical: ['Vaccin fièvre jaune obligatoire.'], notes: 'Via VFS Global à Abidjan.' }),
    AE: AMBASSADE({ duree: '30 jours', cout: 'Variable', delai: '3–5 jours', documents: ['Photo', 'Relevés bancaires', 'Billet + hébergement'], medical: [] }),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT TURC 🇹🇷
  // ══════════════════════════════════════════════════════════════════════════
  TR: {
    MA: LIBRE('90 jours'),
    AZ: LIBRE('90 jours'),
    GE: LIBRE('90 jours'),
    QA: LIBRE('90 jours'),
    AE: LIBRE('90 jours'),
    SA: LIBRE('90 jours'),
    JP: LIBRE('90 jours'),
    KR: LIBRE('90 jours'),
    TH: LIBRE('30 jours'),
    SG: LIBRE('30 jours'),
    FR: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Preuve d\'emploi', 'Billet + hébergement'], medical: [], notes: 'Via le Consulat français à Istanbul ou Ankara.' }),
    US: AMBASSADE({ duree: '10 ans (B1/B2)', cout: '185 USD', delai: '45–90 jours', documents: ['DS-160', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [], notes: 'Via l\'Ambassade US à Ankara ou Istanbul.' }),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT SAOUDIEN 🇸🇦
  // ══════════════════════════════════════════════════════════════════════════
  SA: {
    MA: LIBRE('90 jours'),
    AE: LIBRE('90 jours'),
    QA: LIBRE('90 jours'),
    BH: LIBRE('90 jours'),
    KW: LIBRE('90 jours'),
    JO: LIBRE('90 jours'),
    EG: LIBRE('30 jours'),
    TR: LIBRE('90 jours'),
    GB: EVISA({ duree: '6 mois', cout: '115 GBP', delai: '15–21 jours', lien: 'https://www.gov.uk/standard-visitor-visa' }),
    FR: AMBASSADE({ duree: '90 jours (Schengen)', cout: '80 EUR', delai: '15 jours', documents: ['Formulaire Schengen', 'Assurance voyage', 'Relevés bancaires', 'Billet + hébergement'], medical: [] }),
    US: AMBASSADE({ duree: '10 ans (B1/B2)', cout: '185 USD', delai: '30–60 jours', documents: ['DS-160', 'Relevés bancaires', 'Preuve d\'emploi'], medical: [] }),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PASSEPORT ÉMIRATI 🇦🇪
  // ══════════════════════════════════════════════════════════════════════════
  AE: {
    MA: LIBRE('90 jours'),
    FR: LIBRE('90 jours (Schengen)'),
    ES: LIBRE('90 jours (Schengen)'),
    GB: LIBRE('6 mois'),
    US: LIBRE('90 jours'),
    JP: LIBRE('90 jours'),
    SG: LIBRE('30 jours'),
    TH: LIBRE('30 jours'),
    SA: LIBRE('90 jours'),
    QA: LIBRE('90 jours'),
    MV: VOA({ duree: '30 jours', cout: 'Gratuit', delai: 'Immédiat', medical: [] }),
    IN: EVISA({ duree: '60 jours', cout: '25 USD', delai: '72 heures', lien: 'https://indianvisaonline.gov.in' }),
  },
}

// ─── Lookup function ──────────────────────────────────────────────────────────
export function getVisaInfo(passportCountry, destinationCountry) {
  if (!passportCountry || !destinationCountry) return null
  if (passportCountry === destinationCountry) {
    return {
      type: 'libre',
      duree: 'Illimité',
      procedure: ['Pas de formalité — voyage intérieur / retour dans le pays d\'origine.'],
      documents: ['Document d\'identité national valide'],
      medical: [],
      cout: 'Gratuit',
      delai: 'Immédiat',
      notes: 'Ressortissant national.',
    }
  }
  const entry = VISA_DATA[passportCountry]?.[destinationCountry]
  return entry ?? null
}

// ─── Type metadata ────────────────────────────────────────────────────────────
export const VISA_TYPE_META = {
  libre:     { label: 'Sans visa',         color: '#16a34a', bg: '#dcfce7', icon: '✅' },
  voa:       { label: 'Visa à l\'arrivée',  color: '#0284c7', bg: '#e0f2fe', icon: '🛬' },
  evisa:     { label: 'e-Visa en ligne',   color: '#7c3aed', bg: '#ede9fe', icon: '💻' },
  ambassade: { label: 'Visa ambassade',    color: '#b45309', bg: '#fef3c7', icon: '🏛️' },
  refus:     { label: 'Entrée refusée',    color: '#dc2626', bg: '#fee2e2', icon: '🚫' },
}
