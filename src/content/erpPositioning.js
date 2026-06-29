/**
 * Positionnement ERP Rihla — source unique pour l'interface et le guide.
 * Chaque agence dispose d'un ERP métier voyage complet et isolé.
 */

/** Libellé court (badges, menus) */
export const ERP_BRAND = 'ERP Rihla'

/** Libellé complet (titres, présentations) */
export const ERP_BRAND_FULL = 'ERP Rihla Agence de Voyage'

export const ERP_TAGLINE = "L'ERP Rihla tout-en-un pour agences de voyage"
export const ERP_SUBTITLE =
  'CRM, réservations, finances, devis & factures, produits, équipe, fournisseurs et documents — un seul système Rihla pour piloter toute votre agence.'

export const ERP_DEFINITION =
  'Rihla n\'est pas un simple outil de réservation : c\'est l\'ERP Rihla Agence de Voyage — un système de gestion intégré dédié aux agences de voyage. Il unifie l\'ensemble des processus métier — commercial, opérationnel, financier et administratif — dans un espace unique, sécurisé et adapté au contexte marocain.'

export const ERP_PILLARS = [
  {
    id: 'commercial',
    titre: 'Commercial',
    description: 'Clients, devis, produits et conversion des ventes.',
    couleur: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    id: 'operations',
    titre: 'Opérations',
    description: 'Réservations, calendrier, recherches voyage et documents clients.',
    couleur: 'bg-green-50 text-green-700 border-green-100',
  },
  {
    id: 'financier',
    titre: 'Financier',
    description: 'Encaissements, dépenses, facturation et marges.',
    couleur: 'bg-amber-50 text-amber-800 border-amber-100',
  },
  {
    id: 'pilotage',
    titre: 'Pilotage',
    description: 'Tableau de bord, équipe, fournisseurs et reporting.',
    couleur: 'bg-purple-50 text-purple-700 border-purple-100',
  },
]

export const ERP_MODULES = [
  { label: 'CRM Clients', route: '/crm', pilier: 'commercial' },
  { label: 'Devis & Factures', route: '/devis', pilier: 'commercial' },
  { label: 'Produits & Tarifs', route: '/produits', pilier: 'commercial' },
  { label: 'Réservations', route: '/reservations', pilier: 'operations' },
  { label: 'Recherches voyage', route: '/recherche/vols', pilier: 'operations' },
  { label: 'Calendrier', route: '/calendrier', pilier: 'operations' },
  { label: 'Documents clients', route: '/documents', pilier: 'operations' },
  { label: 'Finances', route: '/finances', pilier: 'financier' },
  { label: 'Fournisseurs', route: '/fournisseurs', pilier: 'pilotage' },
  { label: 'Équipe & Agents', route: '/equipe', pilier: 'pilotage' },
  { label: 'Tableau de bord', route: '/', pilier: 'pilotage' },
  { label: 'Paramètres & docs agence', route: '/parametres', pilier: 'pilotage' },
]

export const ERP_WORKFLOW = [
  { etape: '1. Prospection & CRM', detail: 'Créer la fiche client, historiser les préférences et segmenter (VIP, Régulier…).' },
  { etape: '2. Offre commerciale', detail: 'Rechercher vols/hôtels, construire un devis avec marges contrôlées.' },
  { etape: '3. Réservation', detail: 'Confirmer le dossier, enregistrer acompte et lier l\'agent responsable.' },
  { etape: '4. Opérations', detail: 'Attacher passeports/visas, suivre départs sur le calendrier.' },
  { etape: '5. Facturation', detail: 'Émettre facture, tracer encaissements dans Finances.' },
  { etape: '6. Pilotage', detail: 'Analyser CA, performance agents et marges sur le tableau de bord.' },
]

export const MARKET_COMPARISON = {
  headers: ['Critère', ERP_BRAND_FULL, 'Outils séparés (Excel, WhatsApp…)', 'CRM générique', 'Plateformes réservation seules'],
  rows: [
    ['Conçu pour agences de voyage', '✓ Natif', '— Manuel', '— Générique', 'Partiel'],
    ['CRM + Réservations intégrés', '✓', '—', 'CRM seul', 'Résa seule'],
    ['Devis & factures marocains (ICE, MAD)', '✓', '—', '—', '—'],
    ['Suivi finances & trésorerie', '✓', 'Excel', '—', '—'],
    ['Gestion équipe & objectifs', '✓', '—', 'Partiel', '—'],
    ['Documents clients & agence', '✓', 'Dossiers locaux', '—', '—'],
    ['Protection des marges', '✓', '—', '—', '—'],
    ['Multi-agences isolées', '✓', '—', 'Rare', '—'],
    ['Interface en français', '✓', 'Variable', 'Variable', 'Souvent EN'],
    ['Coût & complexité', 'Un seul outil', 'Multi-abonnements', 'Hors métier', 'Incomplet'],
  ],
}

export const RIHLA_ADVANTAGES = [
  'Un seul ERP Rihla remplace 5 à 8 outils dispersés (Excel, CRM, facturation, stockage fichiers…).',
  'Données connectées : un client créé en CRM est immédiatement disponible pour devis, réservation et facture.',
  'Adapté au Maroc : devise MAD, identifiants fiscaux (ICE, RC, patente), interface en français.',
  'Chaque agence est un tenant isolé — idéal pour groupes, franchises ou réseaux.',
  'Rôles admin/agent : vos commerciaux travaillent sans exposer finances et paramètres sensibles.',
  'Recherches voyage intégrées au flux commercial (vol → devis → réservation en chaîne).',
  'Tableau de bord temps réel : CA, conversion, départs, alertes — pilotage sans export manuel.',
]
