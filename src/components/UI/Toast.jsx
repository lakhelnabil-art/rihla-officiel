import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const config = {
  success: { icon: CheckCircle,  bar: 'bg-green-500',  text: 'text-green-600'  },
  error:   { icon: XCircle,      bar: 'bg-red-500',    text: 'text-red-600'    },
  warning: { icon: AlertTriangle, bar: 'bg-amber-500',  text: 'text-amber-600' },
  info:    { icon: Info,          bar: 'bg-blue-500',   text: 'text-blue-600'  },
}

const Toast = ({ toast, onRemove }) => {
  const [removing, setRemoving] = useState(false)
  const { icon: Icon, bar, text } = config[toast.type] ?? config.info

  const dismiss = useCallback(() => {
    setRemoving(true)
    setTimeout(() => onRemove(toast.id), 260)
  }, [toast.id, onRemove])

  useEffect(() => {
    const duration = toast.duration ?? 3000
    if (duration === Infinity) return
    const t = setTimeout(dismiss, duration)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`${removing ? 'animate-toast-out' : 'animate-toast-in'} relative flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-xl shadow-lg pointer-events-auto w-80 overflow-hidden bg-white border border-slate-100`}
      role="alert"
    >
      <span className={`absolute left-0 inset-y-0 w-1 rounded-l-xl ${bar}`} />
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${text}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-slate-800 leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm text-slate-600 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
        aria-label="Fermer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export const ToastContainer = ({ toasts = [], removeToast }) =>
  createPortal(
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>,
    document.body,
  )
