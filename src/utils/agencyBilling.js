/**
 * Données agence exploitante pour devis & factures.
 * Pré-remplies depuis Paramètres (agency_settings).
 */

export const EMPTY_AGENCE_INFO = {
  nom: '',
  adresse: '',
  ville: '',
  pays: '',
  telephone: '',
  email: '',
  siteWeb: '',
  iceNumber: '',
  patente: '',
  rc: '',
  if: '',
  cnss: '',
  logo: null,
}

/** Extrait les champs facturation depuis les paramètres agence. */
export const agencyInfoFromSettings = (settings = {}) => ({
  nom: settings.nom?.trim() || '',
  adresse: settings.adresse?.trim() || '',
  ville: settings.ville?.trim() || '',
  pays: settings.pays?.trim() || '',
  telephone: settings.telephone?.trim() || '',
  email: settings.email?.trim() || '',
  siteWeb: settings.siteWeb?.trim() || '',
  iceNumber: settings.iceNumber?.trim() || '',
  patente: settings.patente?.trim() || '',
  rc: settings.rc?.trim() || '',
  if: settings.if?.trim() || '',
  cnss: settings.cnss?.trim() || '',
  logo: settings.logo || null,
})

/** Paramètres agence configurés au minimum (nom renseigné). */
export const isAgencyConfigured = (settings = {}) => !!settings.nom?.trim()

/** Agence à afficher sur un document : snapshot du doc ou paramètres courants. */
export const resolveAgenceInfo = (docAgence, settings = {}) => {
  const fromSettings = agencyInfoFromSettings(settings)
  if (!docAgence?.nom?.trim()) return fromSettings
  return { ...fromSettings, ...docAgence }
}

/** Initialise l'agence sur un nouveau document ou conserve le snapshot existant. */
export const initialAgenceForDoc = (existingAgence, settings = {}) => {
  if (existingAgence?.nom?.trim()) return { ...EMPTY_AGENCE_INFO, ...existingAgence }
  return agencyInfoFromSettings(settings)
}
