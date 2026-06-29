/**
 * Modèles d'agence — la plateforme Rihla est globale ;
 * chaque agence est créée à partir d'un modèle + paramètres propres.
 */

const baseSettings = (agencyName, config = {}) => ({
  nom: agencyName || 'Mon Agence',
  adresse: config.adresse || '',
  telephone: config.telephone || '',
  email: config.email || '',
  siteWeb: config.siteWeb || '',
  ville: config.ville || '',
  pays: config.pays || '',
  paysCode: config.paysCode || 'MA',
  paysLibre: config.paysLibre || '',
  devise: config.devise || 'MAD',
  langue: config.langue || 'FR',
  logo: config.logo || null,
  iceNumber: config.iceNumber || '',
  patente: config.patente || '',
  rc: config.rc || '',
  if: config.if || '',
  cnss: config.cnss || '',
  margeMinimale: config.margeMinimale ?? 10,
  adminPin: config.adminPin || '1234',
  notifDevis: true,
  notifFactures: true,
  notifDeparts: true,
  notifObjectifs: true,
})

const DEMO_CLIENTS = [
  { id: 'cli-001', nom: 'Ahmed Benali', telephone: '0661234567', email: 'ahmed.benali@email.ma', ville: 'Casablanca', tag: 'VIP', dateCreation: '2021-03-10' },
  { id: 'cli-002', nom: 'Fatima Zahra Alaoui', telephone: '0662345678', email: 'fz.alaoui@gmail.com', ville: 'Rabat', tag: 'Régulier', dateCreation: '2022-06-15' },
]

const BAB_ANNASER_CLIENTS = [
  { id: 'cli-001', nom: 'Youssef Amrani', telephone: '0661122334', email: 'y.amrani@gmail.com', ville: 'Essaouira', tag: 'VIP', dateCreation: '2023-01-15', notes: 'Client local — circuits côte atlantique.' },
  { id: 'cli-002', nom: 'Sophie Martin', telephone: '+33 6 12 34 56 78', email: 's.martin@email.fr', ville: 'Paris', tag: 'Régulier', dateCreation: '2024-06-20', notes: 'Cliente française — riads Marrakech & Essaouira.' },
  { id: 'cli-003', nom: 'Karim Bennani', telephone: '0669988776', email: 'k.bennani@email.ma', ville: 'Marrakech', tag: 'Régulier', dateCreation: '2024-09-05' },
]

const DEMO_RESERVATIONS = [
  { id: 'res-001', ref: 'RES-2026-101', clientId: 'cli-001', clientNom: 'Ahmed Benali', destination: 'Istanbul, Turquie', type: 'Package', depart: '2026-05-10', retour: '2026-05-17', statut: 'Confirmée', montant: 18500, acompte: 5000, agentId: 'age-001', dateCreation: '2026-04-01' },
]

const BAB_ANNASER_RESERVATIONS = [
  { id: 'res-001', ref: 'RES-2026-201', clientId: 'cli-001', clientNom: 'Youssef Amrani', destination: 'Marrakech, Maroc', type: 'Package', depart: '2026-07-01', retour: '2026-07-05', statut: 'Confirmée', montant: 6200, acompte: 2000, agentId: 'age-001', notes: 'Week-end riad médina.', dateCreation: '2026-05-10' },
  { id: 'res-002', ref: 'RES-2026-202', clientId: 'cli-002', clientNom: 'Sophie Martin', destination: 'Essaouira, Maroc', type: 'Hôtel', depart: '2026-08-12', retour: '2026-08-19', statut: 'En attente', montant: 9800, acompte: 3000, agentId: 'age-001', notes: 'Séjour bord de mer 7 nuits.', dateCreation: '2026-06-01' },
]

const DEMO_PRODUCTS = [
  { id: 'prod-001', nom: 'Package Istanbul 7J/6N', type: 'Package', destination: 'Istanbul, Turquie', prixVente: 18500, prixAchat: 13200, disponible: true, stock: 10 },
]

const BAB_ANNASER_PRODUCTS = [
  { id: 'prod-001', nom: 'Essaouira — Escapade 3J/2N', type: 'Package', destination: 'Essaouira, Maroc', prixVente: 3200, prixAchat: 2400, disponible: true, stock: 20, description: 'Riad médina + petit-déjeuner + transfert aéroport.' },
  { id: 'prod-002', nom: 'Marrakech & Essaouira 5J', type: 'Circuit', destination: 'Maroc', prixVente: 7500, prixAchat: 5200, disponible: true, stock: 8, description: 'Circuit côte atlantique depuis Essaouira.' },
  { id: 'prod-003', nom: 'Vol Casablanca — Paris', type: 'Vol', destination: 'Paris, France', prixVente: 4200, prixAchat: 3600, disponible: true, stock: 15 },
]

export const AGENCY_TEMPLATES = {
  vide: {
    id: 'vide',
    label: 'Agence vierge',
    description: 'Aucune donnée de démo. Configurez l\'agence depuis Paramètres.',
    isReference: false,
    withDemo: false,
    buildSeed: (agencyName, config) => ({
      agency_settings: baseSettings(agencyName, config),
      agency_initialized: '1',
    }),
  },
  'rihla-demo': {
    id: 'rihla-demo',
    label: 'Démo Rihla (générique)',
    description: 'Données de démonstration standard — clients, réservations, produits.',
    isReference: false,
    withDemo: true,
    buildSeed: (agencyName, config) => ({
      agency_clients: DEMO_CLIENTS,
      agency_reservations: DEMO_RESERVATIONS,
      agency_agents: [
        { id: 'age-001', nom: 'Rachid Ennaji', poste: 'Responsable Commercial', email: 'commercial@rihla.ma', objectifMensuel: 80000, caRealise: 68500, dateEmbauche: '2019-03-01' },
      ],
      agency_products: DEMO_PRODUCTS,
      agency_finances: [
        { id: 'tra-001', date: '2026-04-01', libelle: 'Acompte RES-2026-101', type: 'Encaissement', montant: 5000, statut: 'Payé', categorie: 'Ventes' },
      ],
      agency_suppliers: [],
      agency_hotels: [],
      agency_devis: [],
      agency_factures: [],
      agency_calendar: [],
      agency_documents: [],
      agency_internal_docs: [],
      agency_derogations: [],
      agency_settings: baseSettings(agencyName, config),
      agency_initialized: '1',
    }),
  },
  'bab-annaser': {
    id: 'bab-annaser',
    label: 'Modèle Bab Annaser',
    description: 'Agence de référence — Essaouira, côte atlantique, clientèle locale & internationale.',
    isReference: true,
    withDemo: true,
    buildSeed: (agencyName, config) => {
      const settings = baseSettings(agencyName || 'Bab Annaser Voyages', {
        adresse: 'Rue Okba Ibn Nafiaa, Essaouira 44000',
        telephone: '+212 524 78 00 00',
        email: 'contact@babannaser.ma',
        siteWeb: 'www.babannaser.ma',
        ville: 'Essaouira',
        pays: 'Maroc',
        paysCode: 'MA',
        ...config,
        nom: agencyName || config.nom || 'Bab Annaser Voyages',
      })
      return {
        agency_clients: BAB_ANNASER_CLIENTS,
        agency_reservations: BAB_ANNASER_RESERVATIONS,
        agency_agents: [
          { id: 'age-001', nom: 'Nadia El Fassi', poste: 'Directrice', email: 'n.elfassi@babannaser.ma', objectifMensuel: 60000, caRealise: 42000, dateEmbauche: '2018-04-01' },
        ],
        agency_products: BAB_ANNASER_PRODUCTS,
        agency_finances: [
          { id: 'tra-001', date: '2026-05-10', libelle: 'Acompte RES-2026-201', type: 'Encaissement', montant: 2000, statut: 'Payé', categorie: 'Ventes' },
        ],
        agency_suppliers: [
          { id: 'sup-001', nom: 'Atlas Receptif Maroc', type: 'Réceptif', ville: 'Marrakech', telephone: '0524 000 000', email: 'contact@atlasreceptif.ma' },
        ],
        agency_hotels: [
          { id: 'hot-001', nom: 'Riad Bab Annaser', destination: 'Essaouira, Maroc', categorie: 'Riad', description: 'Riad partenaire médina Essaouira.' },
        ],
        agency_devis: [],
        agency_factures: [],
        agency_calendar: [],
        agency_documents: [],
        agency_internal_docs: [],
        agency_derogations: [],
        agency_settings: settings,
        agency_initialized: '1',
      }
    },
  },
}

export const listTemplates = () =>
  Object.values(AGENCY_TEMPLATES).map(t => ({
    id: t.id,
    label: t.label,
    description: t.description,
    isReference: t.isReference,
    withDemo: t.withDemo,
  }))

export const seedFromTemplate = (agencyId, templateId, agencyName, config = {}) => {
  const template = AGENCY_TEMPLATES[templateId] || AGENCY_TEMPLATES['rihla-demo']
  const seed = template.buildSeed(agencyName, config)
  return seed
}
