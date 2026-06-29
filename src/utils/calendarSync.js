/** Sync calendar events from a reservation (départ + retour). */

const makeEvent = (id, reservation, kind, date, type, color) => ({
  id,
  reservationId: reservation.id,
  reservationRef: reservation.ref,
  title: `${kind} — ${reservation.clientNom} (${reservation.destination})`,
  date,
  type,
  color,
})

export const syncReservationToCalendar = (calendar, reservation) => {
  const rest = (calendar ?? []).filter(e => e.reservationId !== reservation.id)

  if (reservation.statut === 'Annulée') return rest

  const extra = []
  if (reservation.depart) {
    extra.push(makeEvent(
      `evt-dep-${reservation.id}`,
      reservation,
      'Départ',
      reservation.depart,
      'Départ',
      'blue',
    ))
  }
  if (reservation.retour) {
    extra.push(makeEvent(
      `evt-ret-${reservation.id}`,
      reservation,
      'Retour',
      reservation.retour,
      'Retour',
      'green',
    ))
  }
  return [...rest, ...extra]
}

export const removeReservationFromCalendar = (calendar, reservationId) =>
  (calendar ?? []).filter(e => e.reservationId !== reservationId)
