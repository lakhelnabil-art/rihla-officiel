export const STORAGE_KEY = 'rihla_services'

export const loadServiceOffers = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveServiceOffers = (offers) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offers))
    window.dispatchEvent(new CustomEvent('rihla-services-updated'))
  } catch (err) {
    console.warn('[servicesStorage] write failed:', err)
  }
}

export const createOfferId = () =>
  `offer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/** Persist a service offer from the detail form. */
export const appendServiceOffer = (payload) => {
  const date = new Date().toISOString()
  const serviceLabel = payload.service?.label ?? payload.service ?? ''

  const offer = {
    id: createOfferId(),
    createdAt: date,
    date,
    serviceId: payload.service?.id ?? '',
    serviceLabel,
    service: serviceLabel,
    serviceCategory: payload.service?.category ?? '',
    client: payload.client,
    country: payload.country ?? '',
    provider: payload.provider ?? '',
    providerSource: payload.providerSource ?? '',
    providerRole: payload.providerRole ?? '',
    description: payload.description,
    price: payload.price,
  }
  saveServiceOffers([offer, ...loadServiceOffers()])
  return offer
}
