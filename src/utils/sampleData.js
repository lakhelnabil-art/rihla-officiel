/* ─────────────────────────────────────────
   CLIENTS
───────────────────────────────────────── */

export const sampleClients = [
  {
    id: 'cli-001',
    nom: 'Ahmed Benali',
    civilite: 'M.',
    telephone: '0661234567',
    telephoneSecondaire: '0661234568',
    email: 'ahmed.benali@email.ma',
    ville: 'Casablanca',
    nationalite: 'Marocaine',
    langue: 'Français',
    typeDocument: 'Passeport',
    dateNaissance: '1980-05-15',
    cin: 'MA1234567',
    dateExpirationDocument: '2028-03-15',
    paysEmission: 'Maroc',
    adresse: '45 Rue Mohammed V, Casablanca',
    contactUrgenceNom: 'Fatima Benali',
    contactUrgenceTel: '0661112233',
    profession: 'Commerçant',
    entreprise: '',
    source: 'Recommandation',
    typeVoyagePref: 'Circuit',
    preferencesVoyage: 'Classe affaires, hôtels 4-5★, éviter escales longues',
    notes: 'Client fidèle depuis 2021. Préfère les voyages en famille.',
    tag: 'VIP',
    dateCreation: '2021-03-10',
  },
  {
    id: 'cli-002',
    nom: 'Fatima Zahra Alaoui',
    telephone: '0662345678',
    email: 'fz.alaoui@gmail.com',
    ville: 'Rabat',
    dateNaissance: '1990-11-20',
    cin: 'AA987654',
    adresse: '12 Avenue Hassan II, Rabat',
    notes: "Intéressée par les circuits culturels et l'Omra.",
    tag: 'Régulier',
    dateCreation: '2022-06-15',
  },
  {
    id: 'cli-003',
    nom: 'Youssef Tazi',
    telephone: '0663456789',
    email: 'ytazi@hotmail.com',
    ville: 'Fès',
    dateNaissance: '1975-07-08',
    cin: 'CD456789',
    adresse: '7 Boulevard Allal El Fassi, Fès',
    notes: "Homme d'affaires. Voyage souvent seul en classe affaires.",
    tag: 'VIP',
    dateCreation: '2020-11-22',
  },
  {
    id: 'cli-004',
    nom: 'Khadija Moukhliss',
    telephone: '0664567890',
    email: 'kmoukhliss@yahoo.fr',
    ville: 'Marrakech',
    dateNaissance: '1988-03-25',
    cin: 'EF789012',
    adresse: '33 Rue Ibn Battouta, Marrakech',
    notes: 'Nouvelle cliente. Très enthousiaste pour les circuits Europe.',
    tag: 'Nouveau',
    dateCreation: '2024-01-08',
  },
  {
    id: 'cli-005',
    nom: 'Mohammed Cherkaoui',
    telephone: '0665678901',
    email: 'm.cherkaoui@outlook.com',
    ville: 'Tanger',
    dateNaissance: '1965-09-12',
    cin: 'GH345678',
    adresse: '88 Rue de Hollande, Tanger',
    notes: 'Retraité. Voyage plusieurs fois par an avec son épouse.',
    tag: 'VIP',
    dateCreation: '2019-07-30',
  },
  {
    id: 'cli-006',
    nom: 'Nadia Serghini',
    telephone: '0666789012',
    email: 'nadia.serghini@gmail.com',
    ville: 'Meknès',
    dateNaissance: '1993-02-14',
    cin: 'IJ567890',
    adresse: '21 Rue Zine El Abidine, Meknès',
    notes: 'Préfère les destinations balnéaires. Groupe de amies.',
    tag: 'Régulier',
    dateCreation: '2023-04-20',
  },
  {
    id: 'cli-007',
    nom: 'Karim El Idrissi',
    telephone: '0667890123',
    email: 'k.elidrissi@proton.me',
    ville: 'Agadir',
    dateNaissance: '1978-12-03',
    cin: 'KL678901',
    adresse: '5 Résidence Talborjt, Agadir',
    notes: 'Agent immobilier. Voyage pour affaires et loisirs.',
    tag: 'Régulier',
    dateCreation: '2022-09-11',
  },
]

/* ─────────────────────────────────────────
   RÉSERVATIONS
───────────────────────────────────────── */

export const sampleReservations = [
  {
    id: 'res-001',
    ref: 'RES-2026-101',
    clientId: 'cli-001',
    clientNom: 'Ahmed Benali',
    destination: 'Istanbul, Turquie',
    type: 'Package',
    depart: '2026-05-10',
    retour: '2026-05-17',
    statut: 'Confirmée',
    montant: 18500,
    acompte: 5000,
    agentId: 'age-001',
    notes: 'Vol + Hôtel 4 étoiles + Transferts.',
    dateCreation: '2026-04-01',
  },
  {
    id: 'res-002',
    ref: 'RES-2026-102',
    clientId: 'cli-002',
    clientNom: 'Fatima Zahra Alaoui',
    destination: 'La Mecque, Arabie Saoudite',
    type: 'Omra',
    depart: '2026-06-01',
    retour: '2026-06-15',
    statut: 'En attente',
    montant: 25000,
    acompte: 10000,
    agentId: 'age-002',
    notes: 'Omra Ramadan. Documents passeport en cours.',
    dateCreation: '2026-03-20',
  },
  {
    id: 'res-003',
    ref: 'RES-2026-103',
    clientId: 'cli-003',
    clientNom: 'Youssef Tazi',
    destination: 'Dubaï, EAU',
    type: 'Vol',
    depart: '2026-04-28',
    retour: '2026-05-03',
    statut: 'Confirmée',
    montant: 8200,
    acompte: 8200,
    agentId: 'age-001',
    notes: 'Billet affaires. Payé intégralement.',
    dateCreation: '2026-04-10',
  },
  {
    id: 'res-004',
    ref: 'RES-2026-104',
    clientId: 'cli-005',
    clientNom: 'Mohammed Cherkaoui',
    destination: 'Paris, France',
    type: 'Package',
    depart: '2026-07-15',
    retour: '2026-07-25',
    statut: 'En attente',
    montant: 32000,
    acompte: 8000,
    agentId: 'age-003',
    notes: 'Couple. Paris + Versailles + Mont-Saint-Michel.',
    dateCreation: '2026-04-15',
  },
  {
    id: 'res-005',
    ref: 'RES-2026-105',
    clientId: 'cli-004',
    clientNom: 'Khadija Moukhliss',
    destination: 'Andalousie, Espagne',
    type: 'Circuit',
    depart: '2026-05-20',
    retour: '2026-05-28',
    statut: 'Confirmée',
    montant: 14500,
    acompte: 7000,
    agentId: 'age-002',
    notes: 'Circuit culture 8 jours. Groupe de 4.',
    dateCreation: '2026-04-18',
  },
  {
    id: 'res-006',
    ref: 'RES-2026-106',
    clientId: 'cli-001',
    clientNom: 'Ahmed Benali',
    destination: 'Rome, Italie',
    type: 'Hôtel',
    depart: '2026-08-01',
    retour: '2026-08-07',
    statut: 'En attente',
    montant: 11200,
    acompte: 3000,
    agentId: 'age-001',
    notes: 'Hôtel 5 étoiles centre ville. Famille 4 personnes.',
    dateCreation: '2026-04-20',
  },
  {
    id: 'res-007',
    ref: 'RES-2025-087',
    clientId: 'cli-003',
    clientNom: 'Youssef Tazi',
    destination: 'New York, USA',
    type: 'Vol',
    depart: '2025-12-20',
    retour: '2026-01-02',
    statut: 'Terminée',
    montant: 15600,
    acompte: 15600,
    agentId: 'age-001',
    notes: 'Voyage Nouvel An. Payé intégralement.',
    dateCreation: '2025-11-05',
  },
  {
    id: 'res-008',
    ref: 'RES-2026-108',
    clientId: 'cli-002',
    clientNom: 'Fatima Zahra Alaoui',
    destination: 'Sharm El-Sheikh, Égypte',
    type: 'Package',
    depart: '2026-03-15',
    retour: '2026-03-22',
    statut: 'Annulée',
    montant: 12800,
    acompte: 0,
    agentId: 'age-003',
    notes: 'Annulée par le client pour raisons personnelles.',
    dateCreation: '2026-02-01',
  },
  {
    id: 'res-009',
    ref: 'RES-2026-109',
    clientId: 'cli-006',
    clientNom: 'Nadia Serghini',
    destination: 'Bali, Indonésie',
    type: 'Package',
    depart: '2026-09-05',
    retour: '2026-09-15',
    statut: 'En attente',
    montant: 28000,
    acompte: 6000,
    agentId: 'age-002',
    notes: 'Groupe de 4 amies. Hôtel bord de mer.',
    dateCreation: '2026-04-22',
  },
  {
    id: 'res-010',
    ref: 'RES-2026-110',
    clientId: 'cli-007',
    clientNom: 'Karim El Idrissi',
    destination: 'Istanbul, Turquie',
    type: 'Package',
    depart: '2026-06-20',
    retour: '2026-06-27',
    statut: 'Confirmée',
    montant: 9800,
    acompte: 9800,
    agentId: 'age-001',
    notes: 'Seul. Payé intégralement.',
    dateCreation: '2026-04-23',
  },
]

/* ─────────────────────────────────────────
   AGENTS
───────────────────────────────────────── */

export const sampleAgents = [
  {
    id: 'age-001',
    nom: 'Rachid Ennaji',
    poste: 'Responsable Commercial',
    email: 'r.ennaji@rihla.ma',
    telephone: '0661111111',
    objectifMensuel: 80000,
    caRealise: 68500,
    dateEmbauche: '2019-03-01',
  },
  {
    id: 'age-002',
    nom: 'Salma Bennani',
    poste: 'Conseillère Voyages',
    email: 's.bennani@rihla.ma',
    telephone: '0662222222',
    objectifMensuel: 60000,
    caRealise: 57200,
    dateEmbauche: '2021-06-15',
  },
  {
    id: 'age-003',
    nom: 'Khalid Ouazzani',
    poste: 'Conseiller Voyages',
    email: 'k.ouazzani@rihla.ma',
    telephone: '0663333333',
    objectifMensuel: 55000,
    caRealise: 43800,
    dateEmbauche: '2023-01-10',
  },
]

/* ─────────────────────────────────────────
   PRODUITS
───────────────────────────────────────── */

export const sampleProducts = [
  {
    id: 'prod-001',
    nom: 'Package Istanbul 7J/6N',
    type: 'Package',
    destination: 'Istanbul, Turquie',
    prixVente: 18500,
    prixAchat: 13200,
    disponible: true,
    description: 'Vol A/R + Hôtel 4* + Transferts + Petit-déjeuner. Départs hebdomadaires.',
    fournisseurId: 'fou-001',
    stock: 10,
  },
  {
    id: 'prod-002',
    nom: 'Omra Standard 15 Jours',
    type: 'Omra',
    destination: 'La Mecque & Médine',
    prixVente: 25000,
    prixAchat: 18500,
    disponible: true,
    description: 'Vol + Hôtel 4* à proximité des lieux saints + Guide + Visa.',
    fournisseurId: 'fou-002',
    stock: 20,
  },
  {
    id: 'prod-003',
    nom: 'Vol Casablanca–Dubaï',
    type: 'Vol',
    destination: 'Dubaï, EAU',
    prixVente: 4200,
    prixAchat: 3100,
    disponible: true,
    description: 'Vol direct Emirates. Classe économique. Bagage inclus 30 kg.',
    fournisseurId: 'fou-003',
    stock: 50,
  },
  {
    id: 'prod-004',
    nom: 'Circuit Andalousie 8 Jours',
    type: 'Circuit',
    destination: 'Espagne',
    prixVente: 14500,
    prixAchat: 10800,
    disponible: true,
    description: 'Séville, Grenade, Cordoue. Vol + Hôtels 3* + Guide FR.',
    fournisseurId: 'fou-001',
    stock: 15,
  },
  {
    id: 'prod-005',
    nom: 'Hôtel La Mamounia Marrakech',
    type: 'Hôtel',
    destination: 'Marrakech, Maroc',
    prixVente: 3500,
    prixAchat: 2400,
    disponible: false,
    description: 'Nuit en chambre double. Petit-déjeuner inclus. 5 étoiles.',
    fournisseurId: 'fou-004',
    stock: 0,
  },
  {
    id: 'prod-006',
    nom: 'Package Bali 10J/9N',
    type: 'Package',
    destination: 'Bali, Indonésie',
    prixVente: 28000,
    prixAchat: 20500,
    disponible: true,
    description: 'Vol + Hôtel 4* bord de mer + Excursions + Transferts.',
    fournisseurId: 'fou-001',
    stock: 8,
  },
]

/* ─────────────────────────────────────────
   FINANCES (transactions)
───────────────────────────────────────── */

export const sampleTransactions = [
  { id: 'tra-001', date: '2026-04-01', libelle: 'Acompte RES-2026-101 — Benali', type: 'Encaissement', montant: 5000, statut: 'Payé', categorie: 'Ventes' },
  { id: 'tra-002', date: '2026-04-05', libelle: 'Solde RES-2026-103 — Tazi (Dubai)', type: 'Encaissement', montant: 8200, statut: 'Payé', categorie: 'Ventes' },
  { id: 'tra-003', date: '2026-04-10', libelle: 'Loyer bureau — avril 2026', type: 'Dépense', montant: 8500, statut: 'Payé', categorie: 'Charges fixes' },
  { id: 'tra-004', date: '2026-04-12', libelle: 'Acompte RES-2026-102 — Alaoui (Omra)', type: 'Encaissement', montant: 10000, statut: 'Payé', categorie: 'Ventes' },
  { id: 'tra-005', date: '2026-04-15', libelle: 'Salaires équipe — avril 2026', type: 'Dépense', montant: 22000, statut: 'Payé', categorie: 'Salaires' },
  { id: 'tra-006', date: '2026-04-18', libelle: 'Acompte RES-2026-104 — Cherkaoui (Paris)', type: 'Encaissement', montant: 8000, statut: 'Payé', categorie: 'Ventes' },
  { id: 'tra-007', date: '2026-04-19', libelle: 'Acompte RES-2026-105 — Moukhliss (Andalousie)', type: 'Encaissement', montant: 7000, statut: 'Payé', categorie: 'Ventes' },
  { id: 'tra-008', date: '2026-04-20', libelle: 'Abonnements logiciels', type: 'Dépense', montant: 1200, statut: 'Payé', categorie: 'Charges variables' },
  { id: 'tra-009', date: '2026-04-22', libelle: 'Acompte RES-2026-109 — Serghini (Bali)', type: 'Encaissement', montant: 6000, statut: 'Payé', categorie: 'Ventes' },
  { id: 'tra-010', date: '2026-04-23', libelle: 'Solde RES-2026-110 — El Idrissi', type: 'Encaissement', montant: 9800, statut: 'Payé', categorie: 'Ventes' },
  { id: 'tra-011', date: '2026-04-25', libelle: 'Solde dû RES-2026-102 — Alaoui', type: 'Encaissement', montant: 15000, statut: 'En attente', categorie: 'Ventes' },
  { id: 'tra-012', date: '2026-04-28', libelle: 'Frais marketing — flyers & réseaux sociaux', type: 'Dépense', montant: 3500, statut: 'En attente', categorie: 'Marketing' },
  { id: 'tra-013', date: '2026-05-01', libelle: 'Loyer bureau — mai 2026', type: 'Dépense', montant: 8500, statut: 'En attente', categorie: 'Charges fixes' },
  { id: 'tra-014', date: '2026-05-15', libelle: 'Salaires équipe — mai 2026', type: 'Dépense', montant: 22000, statut: 'En attente', categorie: 'Salaires' },
]

/* ─────────────────────────────────────────
   FOURNISSEURS
───────────────────────────────────────── */

export const sampleSuppliers = [
  {
    id: 'fou-001',
    nom: 'MedTours Operator',
    type: 'Réceptif',
    contact: 'Hassan Larbi',
    telephone: '+212 522 345678',
    email: 'hassan@medtours.ma',
    conditionsPaiement: '30 jours fin de mois',
    note: 5,
    ville: 'Casablanca',
    notes: 'Partenaire depuis 5 ans. Très fiable pour les circuits Europe.',
  },
  {
    id: 'fou-002',
    nom: 'Saudi Hajj Services',
    type: 'Réceptif',
    contact: 'Omar Al-Rashid',
    telephone: '+966 11 234567',
    email: 'omar@shs.sa',
    conditionsPaiement: '100% à la commande',
    note: 4,
    ville: 'Djeddah',
    notes: 'Spécialisé Omra et Hajj. Hôtels bien localisés.',
  },
  {
    id: 'fou-003',
    nom: 'Emirates Airlines',
    type: 'Compagnie aérienne',
    contact: 'BSP Maroc',
    telephone: '+212 522 999888',
    email: 'bsp@emirates.ma',
    conditionsPaiement: 'Immédiat via BSP',
    note: 5,
    ville: 'Casablanca',
    notes: 'Meilleurs tarifs sur le Golfe. Ponctualité excellente.',
  },
  {
    id: 'fou-004',
    nom: 'La Mamounia',
    type: 'Hôtel',
    contact: 'Direction Commerciale',
    telephone: '+212 524 888888',
    email: 'commercial@mamounia.com',
    conditionsPaiement: '60 jours',
    note: 5,
    ville: 'Marrakech',
    notes: 'Palace 5 étoiles. Tarifs contractuels disponibles.',
  },
  {
    id: 'fou-005',
    nom: 'AXA Assurances Voyages',
    type: 'Assurance',
    contact: 'Amina Tahiri',
    telephone: '+212 522 112233',
    email: 'amina.tahiri@axa.ma',
    conditionsPaiement: 'Mensuel',
    note: 4,
    ville: 'Casablanca',
    notes: 'Couverture voyage mondiale. Bons délais de remboursement.',
  },
]

/* ─────────────────────────────────────────
   DEVIS
───────────────────────────────────────── */

export const sampleDevis = [
  {
    id: 'dev-001',
    ref: 'DEV-2026-001',
    clientId: 'cli-001',
    clientNom: 'Ahmed Benali',
    date: '2026-04-01',
    validiteJours: 15,
    statut: 'Converti',
    lignes: [
      { description: 'Vol A/R Casablanca–Istanbul (×2)', quantite: 2, prixUnitaire: 4500, total: 9000 },
      { description: 'Hôtel 4* Istanbul 6 nuits', quantite: 1, prixUnitaire: 7200, total: 7200 },
      { description: 'Transferts aéroport', quantite: 1, prixUnitaire: 800, total: 800 },
    ],
    totalHT: 17000,
    tva: 1500,
    totalTTC: 18500,
    notes: 'Prix incluent taxes aéroportuaires.',
  },
  {
    id: 'dev-002',
    ref: 'DEV-2026-002',
    clientId: 'cli-004',
    clientNom: 'Khadija Moukhliss',
    date: '2026-04-15',
    validiteJours: 10,
    statut: 'Envoyé',
    lignes: [
      { description: 'Circuit Andalousie 8J/7N', quantite: 1, prixUnitaire: 13000, total: 13000 },
      { description: 'Assurance voyage multirisque', quantite: 1, prixUnitaire: 500, total: 500 },
    ],
    totalHT: 13500,
    tva: 1000,
    totalTTC: 14500,
    notes: 'Départ garanti minimum 10 personnes.',
  },
  {
    id: 'dev-003',
    ref: 'DEV-2026-003',
    clientId: 'cli-006',
    clientNom: 'Nadia Serghini',
    date: '2026-04-22',
    validiteJours: 7,
    statut: 'Brouillon',
    lignes: [
      { description: 'Package Bali 10J/9N (×4 personnes)', quantite: 4, prixUnitaire: 7000, total: 28000 },
    ],
    totalHT: 26000,
    tva: 2000,
    totalTTC: 28000,
    notes: 'Tarif groupe 4 personnes. Chambre double.',
  },
]

/* ─────────────────────────────────────────
   FACTURES
───────────────────────────────────────── */

export const sampleFactures = [
  {
    id: 'fac-001',
    ref: 'FAC-2026-001',
    devisId: 'dev-001',
    clientId: 'cli-001',
    clientNom: 'Ahmed Benali',
    date: '2026-04-05',
    echeance: '2026-04-30',
    statut: 'Payée',
    lignes: [
      { description: 'Vol A/R Casablanca–Istanbul (×2)', quantite: 2, prixUnitaire: 4500, total: 9000 },
      { description: 'Hôtel 4* Istanbul 6 nuits', quantite: 1, prixUnitaire: 7200, total: 7200 },
      { description: 'Transferts aéroport', quantite: 1, prixUnitaire: 800, total: 800 },
    ],
    totalHT: 17000,
    tva: 1500,
    totalTTC: 18500,
    notes: 'Merci pour votre confiance.',
  },
  {
    id: 'fac-002',
    ref: 'FAC-2026-002',
    devisId: null,
    clientId: 'cli-003',
    clientNom: 'Youssef Tazi',
    date: '2026-04-10',
    echeance: '2026-04-25',
    statut: 'Payée',
    lignes: [
      { description: 'Vol Casablanca–Dubaï, classe affaires', quantite: 1, prixUnitaire: 8200, total: 8200 },
    ],
    totalHT: 7700,
    tva: 500,
    totalTTC: 8200,
    notes: '',
  },
]

/* ─────────────────────────────────────────
   CALENDRIER
───────────────────────────────────────── */

export const sampleCalendarEvents = [
  { id: 'evt-001', title: 'Départ — Benali (Istanbul)', date: '2026-05-10', type: 'Départ', color: 'blue' },
  { id: 'evt-002', title: 'Retour — Benali (Istanbul)', date: '2026-05-17', type: 'Retour', color: 'green' },
  { id: 'evt-003', title: 'Départ Omra — Alaoui', date: '2026-06-01', type: 'Départ', color: 'blue' },
  { id: 'evt-004', title: 'Retour Omra — Alaoui', date: '2026-06-15', type: 'Retour', color: 'green' },
  { id: 'evt-005', title: 'Échéance facture — RES-2026-102', date: '2026-04-25', type: 'Paiement', color: 'orange' },
  { id: 'evt-006', title: 'RDV client — Cherkaoui', date: '2026-04-28', type: 'RDV', color: 'purple' },
  { id: 'evt-007', title: 'Départ — Moukhliss (Andalousie)', date: '2026-05-20', type: 'Départ', color: 'blue' },
  { id: 'evt-008', title: 'Départ — El Idrissi (Istanbul)', date: '2026-06-20', type: 'Départ', color: 'blue' },
  { id: 'evt-009', title: 'Départ — Cherkaoui (Paris)', date: '2026-07-15', type: 'Départ', color: 'blue' },
  { id: 'evt-010', title: 'Réunion équipe mensuelle', date: '2026-05-05', type: 'RDV', color: 'purple' },
]

/* ─────────────────────────────────────────
   PARAMÈTRES PAR DÉFAUT
───────────────────────────────────────── */

export const defaultSettings = {
  nom: '',
  adresse: '',
  telephone: '',
  email: '',
  siteWeb: '',
  ville: '',
  pays: '',
  paysCode: 'MA',
  paysLibre: '',
  devise: 'MAD',
  langue: 'FR',
  logo: null,
  iceNumber: 'ICE-001234567890123',
  patente: 'PAT-123456',
  rc: 'RC-123456',
  if: 'IF-123456',
  cnss: 'CNSS-123456',
  margeMinimale: 10,
  adminPin: '1234',
  notifDevis: true,
  notifFactures: true,
  notifDeparts: true,
  notifObjectifs: true,
  /** GDS mode: none | amadeus | sabre | travelport | other */
  gdsMode: 'none',
}

/* ─────────────────────────────────────────
   STORAGE KEYS (single source of truth)
───────────────────────────────────────── */

/* ─────────────────────────────────────────
   HÔTELS
───────────────────────────────────────── */

export const sampleHotels = [
  {
    id: 'hot-001',
    nom: 'Hilton Istanbul Bomonti',
    destination: 'Istanbul, Turquie',
    categorie: '5★',
    typesChambres: ['Standard', 'Deluxe', 'Suite Executive'],
    description: 'Vue panoramique sur Istanbul. Idéal pour les packages Europe.',
  },
  {
    id: 'hot-002',
    nom: 'La Mamounia',
    destination: 'Marrakech, Maroc',
    categorie: '5★',
    typesChambres: ['Chambre Supérieure', 'Suite Jardin', 'Suite Atlas'],
    description: 'Palace iconique au cœur de la médina de Marrakech.',
  },
  {
    id: 'hot-003',
    nom: 'Raffles Dubai',
    destination: 'Dubaï, EAU',
    categorie: '5★',
    typesChambres: ['Chambre Supérieure', 'Suite Deluxe', 'Penthouse'],
    description: 'Luxe au cœur de Downtown Dubaï.',
  },
  {
    id: 'hot-004',
    nom: 'Mövenpick Médine',
    destination: 'Médine, Arabie Saoudite',
    categorie: '4★',
    typesChambres: ['Standard', 'Supérieure', 'Suite'],
    description: 'À 200 m de la Mosquée du Prophète. Idéal Omra.',
  },
  {
    id: 'hot-005',
    nom: 'Barceló Malaga',
    destination: 'Malaga, Espagne',
    categorie: '4★',
    typesChambres: ['Standard', 'Supérieure Vue Mer', 'Junior Suite'],
    description: 'Hôtel moderne en bord de mer. Base circuits Andalousie.',
  },
]

export const STORAGE_KEYS = {
  clients:      'agency_clients',
  reservations: 'agency_reservations',
  agents:       'agency_agents',
  products:     'agency_products',
  finances:     'agency_finances',
  suppliers:    'agency_suppliers',
  hotels:       'agency_hotels',
  devis:        'agency_devis',
  factures:     'agency_factures',
  calendar:     'agency_calendar',
  settings:     'agency_settings',
  documents:    'agency_documents',
  internalDocuments: 'agency_internal_docs',
  derogations:  'agency_derogations',
  initialized:  'agency_initialized',
}

/* ─────────────────────────────────────────
   INIT / RESET HELPERS
───────────────────────────────────────── */

const seed = {
  [STORAGE_KEYS.clients]:      sampleClients,
  [STORAGE_KEYS.reservations]: sampleReservations,
  [STORAGE_KEYS.agents]:       sampleAgents,
  [STORAGE_KEYS.products]:     sampleProducts,
  [STORAGE_KEYS.finances]:     sampleTransactions,
  [STORAGE_KEYS.suppliers]:    sampleSuppliers,
  [STORAGE_KEYS.hotels]:       sampleHotels,
  [STORAGE_KEYS.devis]:        sampleDevis,
  [STORAGE_KEYS.factures]:     sampleFactures,
  [STORAGE_KEYS.calendar]:     sampleCalendarEvents,
  [STORAGE_KEYS.settings]:     defaultSettings,
}

/** Demo seed payload for API bulk import / reset. */
export const getAgencySeedPayload = (agencyName) => ({
  ...seed,
  [STORAGE_KEYS.settings]: { ...defaultSettings, nom: agencyName || defaultSettings.nom },
  [STORAGE_KEYS.documents]: [],
  [STORAGE_KEYS.internalDocuments]: [],
  [STORAGE_KEYS.derogations]: [],
  [STORAGE_KEYS.initialized]: '1',
})

/** Writes sample data only for keys that don't exist yet. */
export const initializeSampleData = () => {
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return
  Object.entries(seed).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  })
  localStorage.setItem(STORAGE_KEYS.initialized, '1')
}

/** Seeds sample data for a specific agency (multi-tenant). */
export const seedAgencyData = (agencyId) => {
  const prefix = agencyId ? `${agencyId}_` : ''
  const initKey = `${prefix}${STORAGE_KEYS.initialized}`
  if (localStorage.getItem(initKey)) return
  Object.entries(seed).forEach(([key, value]) => {
    const fullKey = `${prefix}${key}`
    if (!localStorage.getItem(fullKey)) {
      localStorage.setItem(fullKey, JSON.stringify(value))
    }
  })
  localStorage.setItem(initKey, '1')
}

/** Overwrites all keys with sample data and reloads. */
export const resetSampleData = () => {
  Object.entries(seed).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
  localStorage.setItem(STORAGE_KEYS.initialized, '1')
  window.location.reload()
}

/** Clears all app data for a specific agency. */
export const clearAgencyData = (agencyId) => {
  const prefix = agencyId ? `${agencyId}_` : ''
  Object.values(STORAGE_KEYS).forEach(key =>
    localStorage.removeItem(`${prefix}${key}`)
  )
}

/** Clears all app data from localStorage. */
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  window.location.reload()
}
