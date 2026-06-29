import { getAgencyDataArray, putAgencyData } from './agencyData.js'
import { upsertPnr } from './pnrService.js'
import { incrementSyncCount } from './connectionService.js'
import { logGdsAudit } from './auditLog.js'

const todayISO = () => new Date().toISOString().slice(0, 10)

/** Match or create CRM client from PNR passenger data. */
const syncClient = (agencyId, passenger) => {
  const clients = getAgencyDataArray(agencyId, 'agency_clients')
  const fullName = `${passenger.firstName} ${passenger.lastName}`.trim()
  const email = passenger.email?.toLowerCase()
  const phone = passenger.phone?.replace(/\s/g, '') ?? ''

  let client = clients.find(c =>
    (email && c.email?.toLowerCase() === email)
    || (phone && c.telephone?.replace(/\s/g, '') === phone)
    || c.nom?.toLowerCase() === fullName.toLowerCase(),
  )

  if (client) {
    client = {
      ...client,
      nom: fullName || client.nom,
      telephone: phone || client.telephone,
      email: email || client.email,
      notes: client.notes?.includes('GDS') ? client.notes : `${client.notes || ''}\nSync GDS ${todayISO()}`.trim(),
    }
    const idx = clients.findIndex(c => c.id === client.id)
    clients[idx] = client
  } else {
    client = {
      id: `cli-gds-${Date.now()}`,
      nom: fullName,
      telephone: phone,
      email: email || '',
      ville: '',
      dateNaissance: passenger.dateOfBirth || '',
      cin: '',
      adresse: '',
      notes: `Client importé depuis GDS le ${todayISO()}`,
      tag: 'Nouveau',
      dateCreation: todayISO(),
    }
    clients.unshift(client)
  }

  putAgencyData(agencyId, 'agency_clients', clients)
  return client
}

/** Create or update reservation from PNR. */
const syncReservation = (agencyId, pnr, client) => {
  const reservations = getAgencyDataArray(agencyId, 'agency_reservations')
  const ref = `GDS-${pnr.recordLocator}`
  const firstSeg = pnr.segments?.[0]
  const lastSeg = pnr.segments?.[pnr.segments.length - 1]
  const destination = lastSeg
    ? `${lastSeg.destination} (${lastSeg.carrier}${lastSeg.flightNumber})`
    : pnr.recordLocator

  const ticketTotal = pnr.tickets?.reduce((s, t) => s + (t.total || 0), 0) ?? 0
  const commission = pnr.tickets?.reduce((s, t) => s + (t.commission || 0), 0) ?? 0
  const prixAchat = ticketTotal - commission

  let resa = reservations.find(r => r.ref === ref || r.gdsRecordLocator === pnr.recordLocator)

  const payload = {
    ref,
    clientId: client.id,
    clientNom: client.nom,
    destination,
    type: 'Vol',
    depart: firstSeg?.departureDate ?? todayISO(),
    retour: lastSeg?.departureDate ?? '',
    statut: pnr.status === 'CONFIRMED' ? 'Confirmée' : 'En attente',
    prixVente: String(ticketTotal || 0),
    prixAchatTotal: String(prixAchat || 0),
    montant: String(ticketTotal || 0),
    remisePct: 0,
    remiseLabel: '',
    manualTriggers: {},
    isManagerOverride: false,
    acompte: '0',
    agentId: '',
    notes: `Import GDS ${pnr.provider.toUpperCase()} — PNR ${pnr.recordLocator}`,
    dateCreation: todayISO(),
    produitId: '',
    gdsProvider: pnr.provider,
    gdsRecordLocator: pnr.recordLocator,
    gdsSyncedAt: new Date().toISOString(),
  }

  if (resa) {
    Object.assign(resa, payload)
    const idx = reservations.findIndex(r => r.id === resa.id)
    reservations[idx] = resa
  } else {
    resa = { id: `resa-gds-${Date.now()}`, ...payload }
    reservations.unshift(resa)
  }

  putAgencyData(agencyId, 'agency_reservations', reservations)
  return resa
}

/** Create facture linked to PNR. */
const syncFacture = (agencyId, pnr, client, reservation) => {
  const factures = getAgencyDataArray(agencyId, 'agency_factures')
  const ref = `FAC-GDS-${pnr.recordLocator}`
  const ticketTotal = pnr.tickets?.reduce((s, t) => s + (t.total || 0), 0) ?? 0

  let facture = factures.find(f => f.gdsRecordLocator === pnr.recordLocator)

  const payload = {
    ref,
    clientId: client.id,
    clientNom: client.nom,
    reservationId: reservation.id,
    reservationRef: reservation.ref,
    montant: ticketTotal,
    statut: 'Émise',
    dateEmission: todayISO(),
    dateEcheance: todayISO(),
    notes: `Facture auto GDS — PNR ${pnr.recordLocator}`,
    gdsProvider: pnr.provider,
    gdsRecordLocator: pnr.recordLocator,
    gdsPnrRef: pnr.recordLocator,
    tickets: pnr.tickets ?? [],
  }

  if (facture) {
    Object.assign(facture, payload)
    const idx = factures.findIndex(f => f.id === facture.id)
    factures[idx] = facture
  } else {
    facture = { id: `fac-gds-${Date.now()}`, ...payload }
    factures.unshift(facture)
  }

  putAgencyData(agencyId, 'agency_factures', factures)
  return facture
}

/**
 * Full PNR import pipeline: CRM → Réservation → Facture → stockage PNR.
 */
export const importPnrToRihla = (agencyId, provider, pnr, userId) => {
  const passenger = pnr.passengers?.[0]
  if (!passenger) throw new Error('PNR sans passager')

  const client = syncClient(agencyId, passenger)
  const reservation = syncReservation(agencyId, pnr, client)
  const facture = syncFacture(agencyId, pnr, client, reservation)

  const stored = upsertPnr(agencyId, provider, pnr, {
    clientId: client.id,
    reservationId: reservation.id,
    factureId: facture.id,
  })

  logGdsAudit(agencyId, 'pnr_import', {
    provider,
    userId,
    details: { recordLocator: pnr.recordLocator, clientId: client.id, reservationId: reservation.id },
  })

  return { pnr: stored, client, reservation, facture }
}

/** Sync multiple PNRs from provider. */
export const syncPnrs = (agencyId, provider, pnrs, userId) => {
  const results = []
  for (const pnr of pnrs) {
    try {
      results.push({ ok: true, ...importPnrToRihla(agencyId, provider, pnr, userId) })
    } catch (err) {
      results.push({ ok: false, recordLocator: pnr.recordLocator, error: err.message })
    }
  }
  incrementSyncCount(agencyId, provider)
  logGdsAudit(agencyId, 'sync', {
    provider,
    userId,
    details: { imported: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length },
  })
  return results
}
