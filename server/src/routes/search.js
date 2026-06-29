import { Router } from 'express'
import { authMiddleware, agencyMiddleware } from '../middleware/auth.js'
import { providerStatus, SEARCH_PROVIDERS } from '../services/search/providers.js'
import { rejectIfBanned } from '../utils/bannedCountries.js'

const router = Router()

router.use(authMiddleware, agencyMiddleware)

router.get('/status', (_req, res) => {
  res.json({ providers: providerStatus() })
})

function assistedResponse(type, params) {
  return {
    mode: 'assisted',
    message: 'Recherche assistée — résultats locaux + liens partenaires. Configurez une API pour le mode live.',
    provider: SEARCH_PROVIDERS[type]?.provider,
    query: params,
    results: [],
  }
}

router.post('/flights', (req, res) => {
  const { from, to, date, returnDate, pax = 1, cabin = 'economy' } = req.body || {}
  if (!from || !to || !date) {
    return res.status(400).json({ error: 'from, to et date sont requis' })
  }
  if (rejectIfBanned(res, from, to)) return
  if (SEARCH_PROVIDERS.flights.mode === 'live') {
    return res.status(501).json({ error: 'Intégration Duffel à brancher (Phase API)' })
  }
  res.json(assistedResponse('flights', { from, to, date, returnDate, pax, cabin }))
})

router.post('/hotels', (req, res) => {
  const { destination, checkIn, checkOut, guests = 2, rooms = 1 } = req.body || {}
  if (!destination || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'destination, checkIn et checkOut sont requis' })
  }
  if (rejectIfBanned(res, destination)) return
  if (SEARCH_PROVIDERS.hotels.mode === 'live') {
    return res.status(501).json({ error: 'Intégration Hotelbeds à brancher (Phase API)' })
  }
  res.json(assistedResponse('hotels', { destination, checkIn, checkOut, guests, rooms }))
})

router.post('/transport', (req, res) => {
  const { pickup, dropoff, date, returnDate, passengers = 1 } = req.body || {}
  if (!pickup || !date) {
    return res.status(400).json({ error: 'pickup et date sont requis' })
  }
  if (rejectIfBanned(res, pickup, dropoff)) return
  if (SEARCH_PROVIDERS.transport.mode === 'live') {
    return res.status(501).json({ error: 'Intégration Mozio à brancher (Phase API)' })
  }
  res.json(assistedResponse('transport', { pickup, dropoff, date, returnDate, passengers }))
})

router.post('/cruises', (req, res) => {
  const { region, month, passengers = 2 } = req.body || {}
  res.json(assistedResponse('cruises', { region, month, passengers }))
})

router.post('/activities', (req, res) => {
  const { destination, date, guests = 2 } = req.body || {}
  if (!destination) {
    return res.status(400).json({ error: 'destination est requis' })
  }
  if (rejectIfBanned(res, destination)) return
  if (SEARCH_PROVIDERS.activities.mode === 'live') {
    return res.status(501).json({ error: 'Intégration Viator à brancher (Phase API)' })
  }
  res.json(assistedResponse('activities', { destination, date, guests }))
})

export default router
