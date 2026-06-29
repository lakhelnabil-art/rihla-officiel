import { todayISO } from '../../utils/formatters'

export const CLIENT_TAGS = ['Nouveau', 'Régulier', 'VIP']

export const CLIENT_CIVILITES = ['', 'M.', 'Mme', 'Mlle']

export const CLIENT_DOC_TYPES = ['CIN', 'Passeport', 'Carte séjour', 'Autre']

export const CLIENT_NATIONALITES = [
  'Marocaine', 'Française', 'Espagnole', 'Belge', 'Allemande', 'Britannique',
  'Canadienne', 'Américaine', 'Italienne', 'Saoudienne', 'Émiratie', 'Turque', 'Autre',
]

export const CLIENT_LANGUES = ['Français', 'Arabe', 'Anglais', 'Espagnol', 'Autre']

export const CLIENT_SOURCES = [
  'Passage agence', 'Recommandation', 'Réseaux sociaux', 'Site web',
  'Salon / Événement', 'Partenaire', 'Autre',
]

export const CLIENT_TRAVEL_TYPES = [
  'Omra / Hajj', 'Circuit', 'City break', 'Croisière', 'Affaires', 'Famille', 'Lune de miel', 'Autre',
]

export const CLIENT_VILLES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Tétouan', 'Safi', 'El Jadida', 'Kénitra',
  'Nador', 'Settat', 'Béni Mellal', 'Khouribga', 'Khémisset',
  'Mohammedia', 'Laâyoune', 'Dakhla', 'Guelmim', 'Tiznit',
  'Ouarzazate', 'Errachidia', 'Taza', 'Al Hoceïma', 'Larache',
  'Essaouira', 'Ifrane', 'Azrou', 'Midelt', 'Taroudant',
  'Berrechid', 'Inezgane', 'Salé', 'Témara', 'Autre',
]

/** Labels for import/export mapping */
export const CLIENT_FIELD_LABELS = {
  nom: 'Nom complet',
  civilite: 'Civilité',
  telephone: 'Téléphone',
  telephoneSecondaire: 'Tél. secondaire / WhatsApp',
  email: 'Email',
  ville: 'Ville',
  nationalite: 'Nationalité',
  langue: 'Langue',
  typeDocument: 'Type document',
  cin: 'N° document',
  dateExpirationDocument: 'Expiration document',
  paysEmission: 'Pays émission',
  dateNaissance: 'Date de naissance',
  adresse: 'Adresse',
  contactUrgenceNom: 'Contact urgence (nom)',
  contactUrgenceTel: 'Contact urgence (tél.)',
  profession: 'Profession',
  entreprise: 'Entreprise',
  source: 'Source acquisition',
  typeVoyagePref: 'Type voyage préféré',
  preferencesVoyage: 'Préférences voyage',
  notes: 'Notes internes',
  tag: 'Profil client',
}

export const EMPTY_CLIENT = {
  nom: '',
  civilite: '',
  telephone: '',
  telephoneSecondaire: '',
  email: '',
  ville: '',
  nationalite: 'Marocaine',
  langue: 'Français',
  typeDocument: 'CIN',
  dateNaissance: '',
  cin: '',
  dateExpirationDocument: '',
  paysEmission: 'Maroc',
  adresse: '',
  contactUrgenceNom: '',
  contactUrgenceTel: '',
  profession: '',
  entreprise: '',
  source: '',
  typeVoyagePref: '',
  preferencesVoyage: '',
  notes: '',
  tag: 'Nouveau',
  dateCreation: todayISO(),
}

export const AGENT_POSTES = [
  'Responsable Commercial', 'Directeur Agence',
  'Conseiller Voyages', 'Conseillère Voyages',
  'Agent Billetterie', 'Assistant(e) Commercial(e)', 'Autre',
]

export const EMPTY_AGENT = {
  nom: '',
  poste: 'Conseiller Voyages',
  email: '',
  telephone: '',
  objectifMensuel: 50000,
  caRealise: 0,
  dateEmbauche: todayISO(),
}

export const newClientId = () => `cli-${Date.now()}`
export const newAgentId = () => `age-${Date.now()}`

/** Merge stored client with defaults (backward compatible). */
export const normalizeClient = (client) => ({ ...EMPTY_CLIENT, ...client })

export function validateClientForm(form) {
  const errors = {}
  if (!form.nom?.trim()) errors.nom = 'Le nom est requis'
  if (!form.telephone?.trim()) errors.telephone = 'Le téléphone est requis'
  else if (!/^[\d+\s()-]{8,}$/.test(form.telephone.trim())) {
    errors.telephone = 'Numéro invalide (min. 8 chiffres)'
  }
  if (form.telephoneSecondaire?.trim() && !/^[\d+\s()-]{8,}$/.test(form.telephoneSecondaire.trim())) {
    errors.telephoneSecondaire = 'Numéro invalide'
  }
  if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Email invalide'
  }
  if (form.contactUrgenceTel?.trim() && !/^[\d+\s()-]{8,}$/.test(form.contactUrgenceTel.trim())) {
    errors.contactUrgenceTel = 'Numéro invalide'
  }
  if (form.dateExpirationDocument && form.dateNaissance) {
    if (new Date(form.dateExpirationDocument) < new Date(form.dateNaissance)) {
      errors.dateExpirationDocument = 'Date incohérente'
    }
  }
  return errors
}

export function validateAgentForm(form) {
  const errors = {}
  if (!form.nom?.trim()) errors.nom = 'Le nom est requis'
  if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Email invalide'
  }
  return errors
}
