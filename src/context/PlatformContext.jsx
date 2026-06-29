import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../api/client'

const SESSION_KEY = 'platform_current_agency'

export const PlatformContext = createContext(null)

export const PlatformProvider = ({ children }) => {
  const {
    agencies,
    refreshAgencies,
    enterAgency,
    leaveAgency,
    user,
    agency: activeAgency,
    logout: authLogout,
  } = useAuth()

  const [currentAgencyId, setCurrentAgencyId] = useState(
    () => sessionStorage.getItem(SESSION_KEY),
  )

  useEffect(() => {
    if (activeAgency?.id) {
      setCurrentAgencyId(activeAgency.id)
      sessionStorage.setItem(SESSION_KEY, activeAgency.id)
    } else if (!sessionStorage.getItem(SESSION_KEY)) {
      setCurrentAgencyId(null)
    }
  }, [activeAgency?.id])

  const currentAgency = agencies.find(a => a.id === currentAgencyId) ?? null

  const selectAgency = useCallback(async (id) => {
    await enterAgency(id)
    sessionStorage.setItem(SESSION_KEY, id)
    setCurrentAgencyId(id)
  }, [enterAgency])

  const clearAgency = useCallback(async () => {
    await leaveAgency()
    sessionStorage.removeItem(SESSION_KEY)
    setCurrentAgencyId(null)
  }, [leaveAgency])

  const createAgency = useCallback(async (data) => {
    const created = await api.createAgency({
      nom: data.nom,
      logo: data.logo,
      templateId: data.templateId || 'rihla-demo',
      withDemo: data.withDemo,
      ville: data.ville,
      pays: data.pays,
      paysCode: data.paysCode,
      paysLibre: data.paysLibre,
      adresse: data.adresse,
      telephone: data.telephone,
      email: data.email,
      siteWeb: data.siteWeb,
      iceNumber: data.iceNumber,
    })
    await refreshAgencies()
    return created
  }, [refreshAgencies])

  const updateAgency = useCallback(async (id, patch) => {
    const updated = await api.updateAgency(id, {
      nom: patch.nom,
      logo: patch.logo,
      isConfigured: patch.isConfigured,
    })
    await refreshAgencies()
    return updated
  }, [refreshAgencies])

  const deleteAgency = useCallback(async (id) => {
    await api.deleteAgency(id)
    await refreshAgencies()
    if (currentAgencyId === id) clearAgency()
  }, [currentAgencyId, clearAgency, refreshAgencies])

  const verifySuperPin = (pin) => api.verifySuperPin(pin)

  const setSuperPin = (currentPin, newPin) => api.setSuperPin(currentPin, newPin)

  return (
    <PlatformContext.Provider value={{
      agencies,
      currentAgency,
      currentAgencyId,
      selectAgency,
      clearAgency,
      createAgency,
      updateAgency,
      deleteAgency,
      verifySuperPin,
      setSuperPin,
      logout: authLogout,
      isAuthenticated: !!user,
    }}>
      {children}
    </PlatformContext.Provider>
  )
}

export const usePlatform = () => useContext(PlatformContext)
