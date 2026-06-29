/**
 * Recalcule reservation.acompte depuis les encaissements payés liés (Finances).
 */
export const sumPaidEncaissementsForReservation = (finances, reservationId) =>
  finances
    .filter(f =>
      f.reservationId === reservationId
      && f.type === 'Encaissement'
      && f.statut === 'Payé',
    )
    .reduce((sum, f) => sum + (parseFloat(f.montant) || 0), 0)

/** Met à jour acompte pour une ou plusieurs réservations après changement Finances. */
export const applyAcompteFromFinances = (reservations, finances, reservationIds) => {
  const ids = [...new Set((reservationIds || []).filter(Boolean))]
  if (!ids.length) return reservations

  return reservations.map(r => {
    if (!ids.includes(r.id)) return r
    const paid = sumPaidEncaissementsForReservation(finances, r.id)
    const linked = finances.some(f => f.reservationId === r.id && f.type === 'Encaissement')
    if (!linked) return r
    return { ...r, acompte: Math.round(paid * 100) / 100 }
  })
}

/** Finances après CRUD + ids réservations impactées → nouvelles listes. */
export const syncFinancesToReservations = (reservations, finances, reservationIds) => ({
  reservations: applyAcompteFromFinances(reservations, finances, reservationIds),
})
