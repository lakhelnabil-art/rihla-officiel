import React, { useState, useEffect, useMemo } from 'react'
import { Save, Sparkles, ArrowLeft, ClipboardList, Building, MapPinned, Link2 } from 'lucide-react'
import { Button, Card } from '../UI'
import { appendServiceOffer, loadServiceOffers } from './servicesStorage'
import { formatCurrency } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { DEFAULT_SERVICES } from './index'
import {
  DEFAULT_COUNTRY,
  getCountries,
  getProvidersForService,
  findProviderEntry,
  getProviderKeyForService,
} from './providersData'
import { getBannedCountryError } from '../../data/bannedCountries'
import { ProviderContactBlock } from './ProviderContactBlock'

const EMPTY_FORM = { client: '', description: '', price: '' }

const SavedOffersList = ({ serviceId }) => {
  const [offers, setOffers] = useState([])

  useEffect(() => {
    const reload = () => {
      const all = loadServiceOffers()
      setOffers(serviceId ? all.filter(o => o.serviceId === serviceId) : all)
    }
    reload()
    window.addEventListener('rihla-services-updated', reload)
    return () => window.removeEventListener('rihla-services-updated', reload)
  }, [serviceId])

  if (!offers.length) return null

  return (
    <Card>
      <Card.Header
        title="Offres enregistrées"
        subtitle="Historique pour ce service"
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600">
            <ClipboardList className="w-3.5 h-3.5" />
            {offers.length}
          </div>
        }
      />
      <Card.Body className="p-0">
        <ul className="divide-y divide-slate-100">
          {offers.map(offer => (
            <li
              key={offer.id}
              className="px-5 py-3 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 text-sm"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Client</p>
                <p className="font-medium text-navy mt-0.5">{offer.client}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Service</p>
                <p className="font-medium text-navy mt-0.5">{offer.serviceLabel || offer.service}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Fournisseur</p>
                <p className="font-medium text-navy mt-0.5">{offer.provider || '—'}</p>
                {offer.providerSource && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{offer.providerSource}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Prix</p>
                <p className="font-semibold text-primary-600 mt-0.5">{formatCurrency(offer.price)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  )
}

export const ServiceDetail = ({
  service: initialService,
  country: initialCountry = DEFAULT_COUNTRY,
  provider: initialProvider = '',
  onSave,
  onBack,
  className = '',
}) => {
  const toast = useToast()
  const countries = useMemo(() => getCountries(), [])

  const [formCountry, setFormCountry] = useState(initialCountry || DEFAULT_COUNTRY)
  const [formServiceId, setFormServiceId] = useState(initialService?.id ?? '')
  const [formProvider, setFormProvider] = useState(initialProvider || '')
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    description: initialService?.description ?? '',
  })

  const activeService = useMemo(
    () => DEFAULT_SERVICES.find(s => s.id === formServiceId) ?? initialService ?? null,
    [formServiceId, initialService],
  )

  const providerOptions = useMemo(
    () => (activeService ? getProvidersForService(formCountry, activeService) : []),
    [formCountry, activeService],
  )

  const selectedProviderEntry = useMemo(
    () => (activeService && formProvider
      ? findProviderEntry(formCountry, activeService, formProvider)
      : null),
    [formCountry, activeService, formProvider],
  )

  const providerKey = activeService ? getProviderKeyForService(activeService) : null

  useEffect(() => {
    if (formProvider && !providerOptions.some(p => p.name === formProvider)) {
      setFormProvider(providerOptions[0]?.name ?? '')
    }
  }, [formProvider, providerOptions])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleCountryChange = (value) => {
    const error = getBannedCountryError(value)
    if (error) {
      toast.error(error)
      return
    }
    setFormCountry(value)
    setFormProvider('')
  }

  const handleServiceChange = (serviceId) => {
    setFormServiceId(serviceId)
    setFormProvider('')
    const next = DEFAULT_SERVICES.find(s => s.id === serviceId)
    if (next?.description) {
      setForm(f => ({ ...f, description: next.description }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!activeService || !formProvider) return

    const bannedError = getBannedCountryError(formCountry)
    if (bannedError) {
      toast.error(bannedError)
      return
    }

    const entry = findProviderEntry(formCountry, activeService, formProvider)
    const payload = {
      service: { ...activeService, category: initialService?.category ?? activeService.categoryId },
      country: formCountry,
      provider: formProvider,
      providerSource: entry?.source ?? '',
      providerRole: entry?.role ?? '',
      client: form.client.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
    }
    appendServiceOffer(payload)
    toast.success('Service enregistré avec succès')
    onSave?.(payload)
  }

  const Icon = activeService?.icon || Sparkles

  return (
    <div className={`space-y-6 animate-fade-in ${className}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux services
        </button>
      )}

      {selectedProviderEntry && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/60 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary-600 mb-2">
            Source sélectionnée
          </p>
          <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-lg font-bold text-navy">
              <Building className="w-5 h-5 text-primary-600" />
              {selectedProviderEntry.name}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-slate-600">
              <Link2 className="w-3.5 h-3.5" />
              {selectedProviderEntry.source}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
              selectedProviderEntry.role === 'Provider'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {selectedProviderEntry.role}
            </span>
            {formCountry && (
              <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                <MapPinned className="w-3.5 h-3.5" />
                {formCountry}
              </span>
            )}
          </div>
        </div>
      )}

      <Card>
        <Card.Header
          title={activeService?.label ?? 'Service complémentaire'}
          subtitle={providerKey ? `Catalogue · ${providerKey}` : initialService?.category}
          action={
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
          }
        />
        <form onSubmit={handleSubmit}>
          <Card.Body className="space-y-5">
            <div>
              <label className="label" htmlFor="service-detail-client">
                Nom du client <span className="text-red-500">*</span>
              </label>
              <input
                id="service-detail-client"
                className="input-field"
                value={form.client}
                onChange={e => set('client', e.target.value)}
                placeholder="Nom du client"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="service-detail-country">
                  Pays
                </label>
                <select
                  id="service-detail-country"
                  className="input-field"
                  value={formCountry}
                  onChange={e => handleCountryChange(e.target.value)}
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="service-detail-service">
                  Service
                </label>
                <select
                  id="service-detail-service"
                  className="input-field"
                  value={formServiceId}
                  onChange={e => handleServiceChange(e.target.value)}
                  required
                >
                  <option value="">Choisir un service…</option>
                  {DEFAULT_SERVICES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="service-detail-provider">
                Provider / Fournisseur
              </label>
              <select
                id="service-detail-provider"
                className="input-field"
                value={formProvider}
                onChange={e => setFormProvider(e.target.value)}
                required
                disabled={!providerOptions.length}
              >
                <option value="">
                  {!activeService
                    ? 'Sélectionnez d\'abord un service'
                    : !providerKey
                      ? 'Aucun catalogue pour ce service'
                      : !providerOptions.length
                        ? `Aucun partenaire pour ${formCountry}`
                        : 'Choisir un provider / fournisseur…'}
                </option>
                {providerOptions.map(entry => (
                  <option key={entry.name} value={entry.name}>
                    {entry.name} · {entry.source} ({entry.role})
                  </option>
                ))}
              </select>
              {selectedProviderEntry && (
                <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">
                    Source : <span className="font-medium text-slate-700">{selectedProviderEntry.source}</span>
                    {' · '}
                    {selectedProviderEntry.role}
                  </p>
                  <ProviderContactBlock entry={selectedProviderEntry} />
                </div>
              )}
            </div>

            <div>
              <label className="label" htmlFor="service-detail-description">
                Description
              </label>
              <textarea
                id="service-detail-description"
                className="input-field resize-none"
                rows={4}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Détails de la prestation…"
              />
            </div>

            <div>
              <label className="label" htmlFor="service-detail-price">
                Prix (MAD) <span className="text-red-500">*</span>
              </label>
              <input
                id="service-detail-price"
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </Card.Body>

          <Card.Footer className="justify-end">
            <Button type="submit" icon={Save} disabled={!formProvider || !formServiceId}>
              Enregistrer
            </Button>
          </Card.Footer>
        </form>
      </Card>

      <SavedOffersList serviceId={activeService?.id} />
    </div>
  )
}

export default ServiceDetail
