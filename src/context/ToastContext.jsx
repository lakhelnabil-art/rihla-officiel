import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { ToastContainer } from '../components/UI/Toast'

export const ToastContext = createContext(null)

let _seq = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const removeToast = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((message, type, opts = {}) => {
    const { title, duration = 3000 } = opts
    const id = `t-${++_seq}`
    setToasts(prev => [...prev, { id, message, type, title, duration }])
    return id
  }, [])

  const methods = {
    success: (msg, opts) => add(msg, 'success', opts ?? {}),
    error:   (msg, opts) => add(msg, 'error',   opts ?? {}),
    warning: (msg, opts) => add(msg, 'warning', opts ?? {}),
    info:    (msg, opts) => add(msg, 'info',     opts ?? {}),
  }

  // Expose all calling patterns:
  //   const toast = useToast()       → toast.success(msg)      ✓
  //   const { toast } = useToast()   → toast.success(msg)      ✓
  //   const { showSuccess } = useToast() → showSuccess(msg)    ✓
  const value = {
    toasts,
    removeToast,
    addToast: (message, type = 'success') => add(message, type),
    toast: methods,
    ...methods,
    showSuccess: methods.success,
    showError:   methods.error,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}
