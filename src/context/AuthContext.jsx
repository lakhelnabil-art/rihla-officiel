import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setToken, getToken, ApiError } from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null)
  const [agencies, setAgencies]   = useState([])
  const [agency, setAgency]       = useState(null)
  const [role, setRole]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [apiOnline, setApiOnline] = useState(true)

  const hydrate = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setAgencies([])
      setAgency(null)
      setRole(null)
      setLoading(false)
      return
    }

    try {
      const data = await api.me()
      setUser(data.user)
      setAgencies(data.agencies ?? [])
      setAgency(data.agency ?? null)
      setRole(data.role ?? data.agency?.role ?? null)
      setApiOnline(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null)
      }
      setUser(null)
      setAgencies([])
      setAgency(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { hydrate() }, [hydrate])

  const login = async (email, password) => {
    const data = await api.login(email, password)
    setToken(data.token)
    setUser(data.user)
    setAgencies(data.agencies ?? [])
    setAgency(null)
    setRole(null)
    sessionStorage.removeItem('platform_current_agency')
    return data
  }

  const registerAgency = async (payload) => {
    const data = await api.registerAgency(payload)
    setToken(data.token)
    setUser(data.user)
    setAgencies(data.agencies ?? [])
    setAgency(null)
    setRole(null)
    sessionStorage.removeItem('platform_current_agency')
    return data
  }

  const enterAgency = async (agencyId) => {
    const data = await api.selectAgency(agencyId)
    setToken(data.token)
    setAgency(data.agency)
    setRole(data.role)
    return data
  }

  const leaveAgency = async () => {
    const data = await api.leaveAgency()
    setToken(data.token)
    setAgency(null)
    setRole(null)
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAgencies([])
    setAgency(null)
    setRole(null)
    sessionStorage.removeItem('platform_current_agency')
  }

  const refreshAgencies = async () => {
    const list = await api.getAgencies()
    setAgencies(list)
    return list
  }

  return (
    <AuthContext.Provider value={{
      user,
      agencies,
      agency,
      role,
      isAdmin: role === 'admin',
      loading,
      apiOnline,
      login,
      registerAgency,
      enterAgency,
      leaveAgency,
      logout,
      refreshAgencies,
      hydrate,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
