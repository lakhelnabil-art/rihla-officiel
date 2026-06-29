import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ChevronDown, Building, MapPinned, Link2,
  ClipboardList, ArrowRight,
} from 'lucide-react'
import { Card } from '../../components/UI'
import { DEFAULT_SERVICES, SERVICE_CATEGORIES } from '../../components/Services'
import {
  DEFAULT_COUNTRY,
  FLIGHT_SOURCING,
  getCountries,
  getProvidersForService,
  getProviderKeyForService,
  getPrimaryProvider,
} from '../../components/Services/providersData'
import { getBannedCountryError } from '../../data/bannedCountries'
import { loadServiceOffers } from '../../components/Services/servicesStorage'
import { formatCurrency } from '../../utils/formatters'
import { ProviderContactBlock } from '../../components/Services/ProviderContactBlock'

const groupServicesByCategory = (services, categories) =>
  categories
    .map(category => ({
      ...category,
      services: services.filter(s => s.categoryId === category.id),
    }))
    .filter(group => group.services.length > 0)

const ServiceExpandedDetail = ({ service, categoryLabel, country }) => {
  const providers = useMemo(
    () => getProvidersForService(country, service),
    [country, service],
  )
  const providerKey = getProviderKeyForService(service)
  const recentOffers = useMemo(
    () => loadServiceOffers().filter(o => o.serviceId === service.id).slice(0, 3),
    [service.id],
  )

  return (
    <div className="px-4 pb-4 pt-1 border-t border-primary-100 bg-primary-50/30 space-y-4">
      <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>

      {providerKey && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Fournisseurs · {country}
            </p>
            <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
              {providerKey}
            </span>
          </div>

          {providerKey === 'Vols' && country === DEFAULT_COUNTRY && (
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              GDS principal : <span className="font-semibold text-navy">{FLIGHT_SOURCING.GDS_principal}</span>
              {' · '}
              Alternatives : {FLIGHT_SOURCING.autres_options.join(', ')}
            </p>
          )}

          {providers.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {providers.map(entry => (
                <li
                  key={entry.name}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-navy flex items-center gap-1.5 flex-wrap">
                    {entry.name}
                    {entry.primary && (
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">
                        GDS principal
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Link2 className="w-3 h-3 flex-shrink-0" />
                    {entry.source}
                  </p>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    entry.role === 'Provider'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {entry.role}
                  </span>
                  <ProviderContactBlock entry={entry} compact />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 py-3 text-center rounded-lg border border-dashed border-slate-200 bg-white">
              Aucun partenaire configuré pour {country}.
            </p>
          )}
        </div>
      )}

      {recentOffers.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            Dernières offres
          </p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {recentOffers.map(offer => (
              <li key={offer.id} className="px-3 py-2 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-navy truncate">{offer.client}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {offer.provider || '—'}
                    {offer.providerSource ? ` · ${offer.providerSource}` : ''}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary-600 flex-shrink-0">
                  {formatCurrency(offer.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        Gérer ce service
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

const ServiceAccordionItem = ({ service, categoryLabel, country, isOpen, onToggle }) => {
  const Icon = service.icon || Sparkles
  const primary = useMemo(
    () => (!isOpen ? getPrimaryProvider(country, service) : null),
    [isOpen, country, service],
  )

  return (
    <li className={`rounded-xl border overflow-hidden transition-colors ${
      isOpen ? 'border-primary-300 shadow-sm' : 'border-slate-200 bg-white'
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
          isOpen ? 'bg-primary-50/80' : 'hover:bg-slate-50'
        }`}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isOpen ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-tight ${isOpen ? 'font-bold text-navy' : 'font-semibold text-slate-800'}`}>
            {service.label}
          </p>
          {!isOpen && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{service.description}</p>
          )}
          {!isOpen && primary && (
            <p className="text-[11px] font-semibold text-primary-600 mt-0.5">
              {country} · {primary.name}
            </p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-primary-500' : ''
        }`} />
      </button>

      {isOpen && (
        <ServiceExpandedDetail
          service={service}
          categoryLabel={categoryLabel}
          country={country}
        />
      )}
    </li>
  )
}

export const DashboardServicesSection = () => {
  const [openServiceId, setOpenServiceId] = useState(null)
  const [country, setCountry] = useState(DEFAULT_COUNTRY)

  const grouped = useMemo(
    () => groupServicesByCategory(DEFAULT_SERVICES, SERVICE_CATEGORIES),
    [],
  )
  const countries = useMemo(() => getCountries(), [])

  const toggleService = (serviceId) => {
    setOpenServiceId(prev => (prev === serviceId ? null : serviceId))
  }

  return (
    <Card>
      <Card.Header
        title="Services complémentaires"
        subtitle={`${DEFAULT_SERVICES.length} prestations · sélectionnez une rubrique`}
        action={
          <div className="flex items-center gap-2">
            <MapPinned className="w-3.5 h-3.5 text-slate-400" />
            <select
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600"
              value={country}
              onChange={e => {
                const error = getBannedCountryError(e.target.value)
                if (error) return
                setCountry(e.target.value)
              }}
            >
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      />
      <Card.Body className="space-y-6">
        {grouped.map((group, index) => (
          <section
            key={group.id}
            className={index > 0 ? 'pt-6 border-t border-slate-100' : ''}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-1 self-stretch min-h-[2rem] rounded-full bg-primary-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-navy">{group.label}</h4>
                {group.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{group.description}</p>
                )}
              </div>
              <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full flex-shrink-0">
                {group.services.length}
              </span>
            </div>

            <ul className="space-y-2 pl-4">
              {group.services.map(service => (
                <ServiceAccordionItem
                  key={service.id}
                  service={service}
                  categoryLabel={group.label}
                  country={country}
                  isOpen={openServiceId === service.id}
                  onToggle={() => toggleService(service.id)}
                />
              ))}
            </ul>
          </section>
        ))}

        {!openServiceId && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-300 flex-shrink-0" />
            <p className="text-sm text-slate-500">
              Cliquez sur un service pour afficher fournisseurs et offres directement ici.
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default DashboardServicesSection
