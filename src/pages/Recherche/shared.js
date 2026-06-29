import { STORAGE_KEYS } from '../../utils/sampleData'
import { generateRef, todayISO } from '../../utils/formatters'

export { STORAGE_KEYS }

export const today = todayISO
export const nextResRef = () => generateRef('RES')

const TYPE_MAP = {
  vol: 'Vol',
  hotel: 'Hôtel',
  transport: 'Transfert',
  croisiere: 'Croisière',
  activite: 'Circuit',
}

/** Normalize reservation payload from search modules → ERP schema. */
export const buildReservation = (payload) => ({
  ...payload,
  id: payload.id || `res-${Date.now()}`,
  ref: payload.ref || nextResRef(),
  clientNom: payload.clientNom || payload.client || '',
  type: TYPE_MAP[payload.type] || payload.type || 'Package',
  statut: payload.statut === 'en_attente' ? 'En attente' : (payload.statut || 'En attente'),
  montant: Number(payload.montant) || 0,
  acompte: Number(payload.acompte) || 0,
  dateCreation: payload.dateCreation || todayISO(),
})
