import { useState, useEffect, useCallback, useRef } from 'react'
import { useAgencyData } from '../context/AgencyDataContext'
import { usePlatform } from '../context/PlatformContext'

/**
 * Persists agency state via API (AgencyDataContext) when inside an agency session.
 * Falls back to localStorage when API context is unavailable (legacy / offline).
 */
export const useLocalStorage = (key, initialValue) => {
  const agencyData = useAgencyData()
  const platform = usePlatform()
  const agencyId = platform?.currentAgencyId
  const fullKey = agencyId ? `${agencyId}_${key}` : key
  const keyRef = useRef(fullKey)

  const [localValue, setLocalValue] = useState(() => {
    if (agencyData) return agencyData.getValue(key, initialValue)
    try {
      const raw = window.localStorage.getItem(fullKey)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    keyRef.current = fullKey
    if (agencyData) {
      setLocalValue(agencyData.getValue(key, initialValue))
      return
    }
    try {
      const raw = window.localStorage.getItem(fullKey)
      setLocalValue(raw !== null ? JSON.parse(raw) : initialValue)
    } catch {
      setLocalValue(initialValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey, agencyData, key, agencyData?.data?.[key]])

  const setValue = useCallback((value) => {
    if (agencyData) {
      agencyData.setKey(key, value)
      setLocalValue(prev => typeof value === 'function' ? value(prev) : value)
      return
    }
    setLocalValue(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        window.localStorage.setItem(keyRef.current, JSON.stringify(next))
      } catch (err) {
        console.warn('[useLocalStorage] write failed:', err)
      }
      return next
    })
  }, [agencyData, key])

  const removeValue = useCallback(() => {
    if (agencyData) {
      agencyData.removeKey(key, initialValue)
      setLocalValue(initialValue)
      return
    }
    try {
      window.localStorage.removeItem(keyRef.current)
    } catch {}
    setLocalValue(initialValue)
  }, [agencyData, key, initialValue])

  useEffect(() => {
    if (agencyData) return undefined
    const onStorage = (e) => {
      if (e.key !== keyRef.current) return
      try {
        setLocalValue(e.newValue !== null ? JSON.parse(e.newValue) : initialValue)
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [agencyData, initialValue])

  const storedValue = agencyData
    ? (key in agencyData.data ? agencyData.data[key] : localValue)
    : localValue

  return [storedValue, setValue, removeValue]
}
