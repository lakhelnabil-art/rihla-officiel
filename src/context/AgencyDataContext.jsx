import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { usePlatform } from './PlatformContext'
import { api } from '../api/client'
import { STORAGE_KEYS } from '../utils/sampleData'

const AgencyDataContext = createContext(null)

const ALL_KEYS = Object.values(STORAGE_KEYS)

export const AgencyDataProvider = ({ children }) => {
  const { agency, role } = useAuth()
  const { currentAgencyId } = usePlatform()
  const agencyId = currentAgencyId || agency?.id

  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const pendingRef            = useRef({})
  const timerRef              = useRef(null)

  useEffect(() => {
    if (!agencyId || !role) {
      setData({})
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    api.getAllData()
      .then(remote => {
        if (!cancelled) setData(remote ?? {})
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Impossible de charger les données')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [agencyId, role])

  const flush = useCallback(async () => {
    const batch = { ...pendingRef.current }
    pendingRef.current = {}
    timerRef.current = null

    await Promise.all(
      Object.entries(batch).map(([key, value]) => api.putData(key, value)),
    )
  }, [])

  const scheduleSave = useCallback((key, value) => {
    pendingRef.current[key] = value
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      flush().catch(err => console.warn('[AgencyData] save failed:', err))
    }, 400)
  }, [flush])

  const getValue = useCallback((key, initialValue) => {
    if (key in data) return data[key]
    return initialValue
  }, [data])

  const setKey = useCallback((key, value) => {
    setData(prev => {
      const next = typeof value === 'function' ? value(prev[key]) : value
      scheduleSave(key, next)
      return { ...prev, [key]: next }
    })
  }, [scheduleSave])

  const removeKey = useCallback((key, initialValue) => {
    setData(prev => {
      const next = { ...prev }
      delete next[key]
      scheduleSave(key, initialValue)
      return next
    })
  }, [scheduleSave])

  const bulkReplace = useCallback(async (payload) => {
    await api.bulkData(payload)
    setData(prev => ({ ...prev, ...payload }))
  }, [])

  const reload = useCallback(async () => {
    const remote = await api.getAllData()
    setData(remote ?? {})
    return remote
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (Object.keys(pendingRef.current).length) {
      flush().catch(() => {})
    }
  }, [flush])

  return (
    <AgencyDataContext.Provider value={{
      data,
      loading,
      error,
      getValue,
      setKey,
      removeKey,
      bulkReplace,
      reload,
      allKeys: ALL_KEYS,
    }}>
      {children}
    </AgencyDataContext.Provider>
  )
}

export const useAgencyData = () => useContext(AgencyDataContext)
