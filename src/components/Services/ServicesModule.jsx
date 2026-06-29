import React, { useState } from 'react'
import ServicesPage from './index'
import ServiceDetail from './ServiceDetail'
import { DEFAULT_COUNTRY } from './providersData'

export const PAGE_KEYS = {
  services: 'services',
  serviceDetail: 'serviceDetail',
}

/** Route shell: catalogue, provider selection, detail form, and local persistence. */
export const ServicesModule = () => {
  const [page, setPage] = useState(PAGE_KEYS.services)
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [offersVersion, setOffersVersion] = useState(0)

  const handleSelectService = (service) => {
    setSelectedService(service)
    setSelectedProvider(null)
  }

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider)
    setPage(PAGE_KEYS.serviceDetail)
  }

  const handleBack = () => {
    setPage(PAGE_KEYS.services)
    setSelectedProvider(null)
  }

  const handleSave = () => {
    setOffersVersion(v => v + 1)
    setSelectedProvider(null)
    setPage(PAGE_KEYS.services)
  }

  if (page === PAGE_KEYS.serviceDetail && selectedService && selectedProvider) {
    return (
      <ServiceDetail
        service={selectedService}
        country={selectedCountry}
        provider={selectedProvider}
        onBack={handleBack}
        onSave={handleSave}
      />
    )
  }

  return (
    <ServicesPage
      selectedCountry={selectedCountry}
      onCountryChange={setSelectedCountry}
      selectedService={selectedService}
      onSelectService={handleSelectService}
      onSelectProvider={handleSelectProvider}
      offersVersion={offersVersion}
    />
  )
}

export default ServicesModule
