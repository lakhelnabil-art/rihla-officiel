import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS, defaultSettings } from '../utils/sampleData'
import { addDays, daysUntil, isExpired, formatDateShort } from '../utils/formatters'

const devisExpiry = (d) => (d?.date ? addDays(d.date, d.validiteJours ?? 15) : null)

const isDevisExpired = (d) =>
  d.statut !== 'Converti' && d.statut !== 'Expiré' && isExpired(devisExpiry(d))

const isFacOverdue = (f) =>
  f.statut !== 'Payée' && f.statut !== 'Brouillon' && f.echeance && isExpired(f.echeance)

/**
 * Builds header alerts from agency data, respecting notification toggles in settings.
 * Each item: { message, type, severity? }
 */
export const useNotifications = () => {
  const [settings]     = useLocalStorage(STORAGE_KEYS.settings, defaultSettings)
  const [reservations] = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [devis]        = useLocalStorage(STORAGE_KEYS.devis, [])
  const [factures]     = useLocalStorage(STORAGE_KEYS.factures, [])
  const [finances]     = useLocalStorage(STORAGE_KEYS.finances, [])
  const [agents]       = useLocalStorage(STORAGE_KEYS.agents, [])

  const enabled = (key) => settings?.[key] ?? true

  return useMemo(() => {
    const list = []

    if (enabled('notifDevis')) {
      devis
        .filter(isDevisExpired)
        .forEach(d => {
          list.push({
            type: 'Devis',
            severity: 'danger',
            message: `${d.ref} — ${d.clientNom} a expiré le ${formatDateShort(devisExpiry(d))}`,
          })
        })

      devis
        .filter(d => {
          if (d.statut === 'Converti' || d.statut === 'Expiré') return false
          const exp = devisExpiry(d)
          const days = daysUntil(exp)
          return days !== null && days >= 0 && days <= 3
        })
        .forEach(d => {
          const days = daysUntil(devisExpiry(d))
          list.push({
            type: 'Devis',
            severity: 'warning',
            message: `${d.ref} — expire ${days === 0 ? "aujourd'hui" : `dans ${days} jour${days > 1 ? 's' : ''}`}`,
          })
        })
    }

    if (enabled('notifFactures')) {
      factures.filter(isFacOverdue).forEach(f => {
        list.push({
          type: 'Facture',
          severity: 'danger',
          message: `${f.ref} — ${f.clientNom} en retard (échéance ${formatDateShort(f.echeance)})`,
        })
      })
    }

    if (enabled('notifDeparts')) {
      reservations
        .filter(r => {
          if (r.statut !== 'Confirmée') return false
          const days = daysUntil(r.depart)
          return days !== null && days >= 0 && days <= 3
        })
        .forEach(r => {
          const days = daysUntil(r.depart)
          list.push({
            type: 'Départ',
            severity: days === 0 ? 'danger' : 'warning',
            message: `${r.clientNom} — ${r.destination} ${days === 0 ? "aujourd'hui" : `dans ${days} jour${days > 1 ? 's' : ''}`}`,
          })
        })
    }

    if (enabled('notifObjectifs')) {
      agents
        .filter(a => {
          const obj = parseFloat(a.objectifMensuel) || 0
          const ca  = parseFloat(a.caRealise) || 0
          return obj > 0 && ca / obj < 0.7
        })
        .forEach(a => {
          const pct = Math.round(((parseFloat(a.caRealise) || 0) / (parseFloat(a.objectifMensuel) || 1)) * 100)
          list.push({
            type: 'Objectif',
            severity: 'info',
            message: `${a.nom} — ${pct}% de l'objectif mensuel atteint`,
          })
        })
    }

    const pendingRes = reservations.filter(r => r.statut === 'En attente').length
    if (pendingRes > 0) {
      list.push({
        type: 'Réservation',
        severity: 'warning',
        message: `${pendingRes} réservation(s) en attente de confirmation`,
      })
    }

    const pendingPay = finances.filter(
      f => f.statut === 'En attente' && f.type === 'Encaissement',
    ).length
    if (pendingPay > 0) {
      list.push({
        type: 'Paiement',
        severity: 'danger',
        message: `${pendingPay} encaissement(s) en attente`,
      })
    }

    const severityOrder = { danger: 0, warning: 1, info: 2 }
    return list.sort(
      (a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9),
    )
  }, [settings, reservations, devis, factures, finances, agents])
}
