import React, { useMemo, useState, useEffect } from 'react'
import {
  FileCheck, Shield, Car, Smartphone, Coffee, KeyRound,
  Compass, Luggage, Headphones, Banknote, ChevronDown, Sparkles,
  Plane, Train, Ship, MapPin, Building2, Briefcase, Users, Crown,
  Globe, HeartPulse, Wifi, ClipboardList, MapPinned, Building, Link2,
} from 'lucide-react'
import { Card } from '../UI'
import { loadServiceOffers } from './servicesStorage'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import {
  DEFAULT_COUNTRY,
  getCountries,
  getProvidersForService,
  getProviderKeyForService,
  getPrimaryProvider,
} from './providersData'
import { getBannedCountryError } from '../../data/bannedCountries'
import { ProviderContactBlock } from './ProviderContactBlock'

/** Catégories de services complémentaires. */
export const SERVICE_CATEGORIES = [
  {
    id: 'transport',
    label: 'Transport & Voyage',
    description: 'Mobilité, transferts et options vol',
  },
  {
    id: 'tourisme',
    label: 'Tourisme',
    description: 'Expériences, visites et activités sur destination',
  },
  {
    id: 'administratif',
    label: 'Administratif',
    description: 'Formalités, assurances et documents de voyage',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Voyages d\'affaires et gestion de groupes professionnels',
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Confort haut de gamme et conciergerie VIP',
  },
  {
    id: 'additionnels',
    label: 'Services additionnels',
    description: 'Connectivité, finances et assistance au quotidien',
  },
]

/** Services complémentaires proposés par une agence de voyage. */
export const DEFAULT_SERVICES = [
  // Transport & Voyage
  {
    id: 'transfert',
    label: 'Transferts aéroport',
    description: 'Navettes privées ou partagées, accueil avec pancarte.',
    icon: Car,
    categoryId: 'transport',
  },
  {
    id: 'location',
    label: 'Location de voiture',
    description: 'Réservation véhicule avec assurance et options GPS.',
    icon: KeyRound,
    categoryId: 'transport',
  },
  {
    id: 'bagages',
    label: 'Bagages supplémentaires',
    description: 'Franchises additionnelles et suivi des colis en soute.',
    icon: Luggage,
    categoryId: 'transport',
  },
  {
    id: 'billet-train',
    label: 'Billets train & rail',
    description: 'Eurail, TGV, trains régionaux et pass multi-destinations.',
    icon: Train,
    categoryId: 'transport',
  },
  {
    id: 'ferry',
    label: 'Traversées maritimes',
    description: 'Ferries, bateaux rapides et réservation de cabines.',
    icon: Ship,
    categoryId: 'transport',
  },
  // Tourisme
  {
    id: 'excursion',
    label: 'Excursions à la carte',
    description: 'Visites guidées, activités locales et expériences sur mesure.',
    icon: Compass,
    categoryId: 'tourisme',
  },
  {
    id: 'guide-local',
    label: 'Guide local privé',
    description: 'Accompagnement francophone ou multilingue sur place.',
    icon: MapPin,
    categoryId: 'tourisme',
  },
  {
    id: 'circuit',
    label: 'Circuits sur mesure',
    description: 'Itinéraires personnalisés, étapes et hébergements inclus.',
    icon: Globe,
    categoryId: 'tourisme',
  },
  // Administratif
  {
    id: 'visa',
    label: 'Assistance visa',
    description: 'Demande, suivi et dossier consulaire pour vos clients.',
    icon: FileCheck,
    categoryId: 'administratif',
  },
  {
    id: 'assurance',
    label: 'Assurance voyage',
    description: 'Couverture multirisque, annulation et assistance médicale.',
    icon: Shield,
    categoryId: 'administratif',
  },
  {
    id: 'sante-voyage',
    label: 'Formalités santé',
    description: 'Vaccins, attestations et couverture médicale à l\'étranger.',
    icon: HeartPulse,
    categoryId: 'administratif',
  },
  // Corporate
  {
    id: 'voyage-affaires',
    label: 'Voyages d\'affaires',
    description: 'Réservations flexibles, facturation entreprise et reporting.',
    icon: Briefcase,
    categoryId: 'corporate',
  },
  {
    id: 'mice',
    label: 'Séminaires & MICE',
    description: 'Organisation d\'événements, incentives et team building.',
    icon: Building2,
    categoryId: 'corporate',
  },
  {
    id: 'groupes-pro',
    label: 'Groupes professionnels',
    description: 'Gestion de délégations, tarifs négociés et coordination.',
    icon: Users,
    categoryId: 'corporate',
  },
  // Premium
  {
    id: 'lounge',
    label: 'Salon aéroport',
    description: 'Accès lounge, restauration et confort avant le vol.',
    icon: Coffee,
    categoryId: 'premium',
  },
  {
    id: 'conciergerie',
    label: 'Conciergerie VIP',
    description: 'Fast-track, meet & greet et services personnalisés.',
    icon: Crown,
    categoryId: 'premium',
  },
  {
    id: 'classe-affaires',
    label: 'Upgrade cabine',
    description: 'Surclassement business ou première sur demande.',
    icon: Plane,
    categoryId: 'premium',
  },
  // Services additionnels
  {
    id: 'esim',
    label: 'Carte SIM / eSIM',
    description: 'Forfaits data internationaux activables à l\'arrivée.',
    icon: Smartphone,
    categoryId: 'additionnels',
  },
  {
    id: 'change',
    label: 'Change de devises',
    description: 'Taux préférentiels et bons de change pour le départ.',
    icon: Banknote,
    categoryId: 'additionnels',
  },
  {
    id: 'assistance',
    label: 'Assistance 24/7',
    description: 'Hotline dédiée pour urgences et réorganisation de voyage.',
    icon: Headphones,
    categoryId: 'additionnels',
  },
  {
    id: 'wifi-voyage',
    label: 'Wi-Fi portable',
    description: 'Location de hotspot 4G/5G pour plusieurs appareils.',
    icon: Wifi,
    categoryId: 'additionnels',
  },
]

const groupServicesByCategory = (services, categories) =>
  categories
    .map(category => ({
      ...category,
      services: services.filter(s => s.categoryId === category.id),
    }))
    .filter(group => group.services.length > 0)

const ServiceOffersPanel = ({ refreshKey = 0 }) => {
  const [offers, setOffers] = useState([])

  useEffect(() => {
    const reload = () => setOffers(loadServiceOffers())
    reload()
    window.addEventListener('rihla-services-updated', reload)
    return () => window.removeEventListener('rihla-services-updated', reload)
  }, [refreshKey])

  if (!offers.length) return null

  return (
    <Card>
      <Card.Header
        title="Offres enregistrées"
        subtitle="Prestations créées pour vos clients"
        action={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600">
            <ClipboardList className="w-3.5 h-3.5" />
            {offers.length} offre{offers.length > 1 ? 's' : ''}
          </div>
        }
      />
      <Card.Body className="p-0">
        <ul className="divide-y divide-slate-100">
          {offers.map(offer => (
            <li key={offer.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy">{offer.serviceLabel}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {offer.client}
                  {offer.provider && (
                    <span className="text-slate-400"> · {offer.provider}</span>
                  )}
                  {offer.providerSource && (
                    <span className="text-slate-400"> · {offer.providerSource}</span>
                  )}
                  {offer.serviceCategory && (
                    <span className="text-slate-400"> · {offer.serviceCategory}</span>
                  )}
                </p>
                {offer.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{offer.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 sm:text-right">
                <span className="text-sm font-bold text-primary-600">{formatCurrency(offer.price)}</span>
                <span className="text-[11px] text-slate-400">{formatDateShort(offer.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  )
}

const ServiceItem = ({ service, categoryLabel, country, isOpen, onToggle, onSelectProvider }) => {
  const Icon = service.icon || Sparkles
  const providers = useMemo(
    () => (isOpen ? getProvidersForService(country, service) : []),
    [isOpen, country, service],
  )
  const providerKey = getProviderKeyForService(service)
  const primary = useMemo(
    () => (isOpen ? null : getPrimaryProvider(country, service)),
    [isOpen, country, service],
  )

  return (
    <li className={`rounded-xl border overflow-hidden transition-colors ${
      isOpen ? 'border-primary-300 shadow-sm' : 'border-slate-200 bg-white'
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className={`group w-full text-left flex items-center gap-3 px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
          isOpen ? 'bg-primary-50/80' : 'hover:bg-slate-50'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isOpen ? 'bg-primary-100 text-primary-700' : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-tight ${isOpen ? 'font-bold text-navy' : 'font-semibold text-navy'}`}>
            {service.label}
          </p>
          {!isOpen && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{service.description}</p>
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
        <div className="px-4 pb-4 pt-1 border-t border-primary-100 bg-primary-50/30 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>

          {providerKey ? (
            providers.length > 0 ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                  Fournisseurs · {country} · {providerKey}
                </p>
                <ul className="space-y-2">
                  {providers.map(entry => (
                    <li key={entry.name}>
                      <button
                        type="button"
                        onClick={() => onSelectProvider?.(entry.name)}
                        className="group w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-3 hover:border-primary-300 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-navy block">{entry.name}</span>
                            <span className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Link2 className="w-3 h-3 flex-shrink-0" />
                              {entry.source}
                            </span>
                            <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              entry.role === 'Provider'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {entry.role}
                            </span>
                            <ProviderContactBlock entry={entry} compact />
                          </div>
                          <span className="text-xs font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
                            Créer offre →
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-3 text-center rounded-lg border border-dashed border-slate-200 bg-white">
                Aucun fournisseur pour {country}.
              </p>
            )
          ) : (
            <p className="text-sm text-slate-500 py-2 px-3 rounded-lg bg-white border border-slate-200">
              Aucun catalogue fournisseur configuré pour ce service.
            </p>
          )}
        </div>
      )}
    </li>
  )
}

const CountrySelector = ({ value, onChange }) => {
  const countries = useMemo(() => getCountries(), [])

  const handleChange = (next) => {
    const error = getBannedCountryError(next)
    if (error) return
    onChange?.(next)
  }

  return (
    <div>
      <label className="label" htmlFor="services-country">
        Pays
      </label>
      <div className="relative max-w-xs">
        <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          id="services-country"
          className="input-field pl-9"
          value={value}
          onChange={e => handleChange(e.target.value)}
        >
          {countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/**
 * Liste des services complémentaires d'une agence de voyage, organisée par catégorie.
 * @param {{ services?: typeof DEFAULT_SERVICES, categories?: typeof SERVICE_CATEGORIES, selectedCountry?: string, onCountryChange?: (country: string) => void, selectedService?: object | null, onSelectService?: (service: object) => void, onSelectProvider?: (provider: string) => void, title?: string, subtitle?: string, className?: string, offersVersion?: number }} props
 */
export const Services = ({
  services = DEFAULT_SERVICES,
  categories = SERVICE_CATEGORIES,
  selectedCountry = DEFAULT_COUNTRY,
  onCountryChange,
  selectedService = null,
  onSelectService,
  onSelectProvider,
  title = 'Services complémentaires',
  subtitle = 'Prestations additionnelles à proposer à vos clients',
  className = '',
  offersVersion = 0,
}) => {
  const [openServiceId, setOpenServiceId] = useState(selectedService?.id ?? null)

  useEffect(() => {
    if (selectedService?.id) setOpenServiceId(selectedService.id)
  }, [selectedService?.id])

  const grouped = useMemo(
    () => groupServicesByCategory(services, categories),
    [services, categories],
  )

  const handleToggle = (service, categoryLabel) => {
    const nextId = openServiceId === service.id ? null : service.id
    setOpenServiceId(nextId)
    if (nextId) {
      onSelectService?.({ ...service, category: categoryLabel })
    }
  }

  return (
    <div className={`space-y-6 animate-fade-in ${className}`}>
      <ServiceOffersPanel refreshKey={offersVersion} />

      <Card>
        <Card.Header
          title={title}
          subtitle={subtitle}
          action={
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600">
              <Sparkles className="w-3.5 h-3.5" />
              {services.length} service{services.length > 1 ? 's' : ''}
            </div>
          }
        />
        <Card.Body className="space-y-6">
          <CountrySelector value={selectedCountry} onChange={onCountryChange} />

          <div className="space-y-6">
            {grouped.map((group, index) => (
              <section
                key={group.id}
                className={index > 0 ? 'pt-6 border-t border-slate-100' : ''}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-1 self-stretch min-h-[2rem] rounded-full bg-primary-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-navy">{group.label}</h4>
                    {group.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{group.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full flex-shrink-0">
                    {group.services.length}
                  </span>
                </div>

                <ul className="space-y-2 pl-4">
                  {group.services.map(service => (
                    <ServiceItem
                      key={service.id}
                      service={service}
                      categoryLabel={group.label}
                      country={selectedCountry}
                      isOpen={openServiceId === service.id}
                      onToggle={() => handleToggle(service, group.label)}
                      onSelectProvider={onSelectProvider}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {!openServiceId && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Building className="w-5 h-5 text-slate-300 flex-shrink-0" />
              <p className="text-sm text-slate-500">
                Développez un service pour voir les fournisseurs et créer une offre client.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default Services
