import React from 'react'

const variants = {
  success:  'bg-green-100  text-green-700',
  danger:   'bg-red-100    text-red-700',
  warning:  'bg-amber-100  text-amber-700',
  info:     'bg-blue-100   text-blue-700',
  default:  'bg-slate-100  text-slate-600',
  purple:   'bg-purple-100 text-purple-700',
  orange:   'bg-orange-100 text-orange-700',
  gold:     'bg-yellow-100 text-yellow-800',
  navy:     'bg-slate-800  text-white',
  // aliases
  blue:     'bg-blue-100   text-blue-700',
  green:    'bg-green-100  text-green-700',
  red:      'bg-red-100    text-red-700',
  gray:     'bg-slate-100  text-slate-600',
}

const dots = {
  success: 'bg-green-500',
  danger:  'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
  default: 'bg-slate-400',
  purple:  'bg-purple-500',
  orange:  'bg-orange-500',
  gold:    'bg-yellow-500',
  navy:    'bg-white',
  blue:    'bg-blue-500',
  green:   'bg-green-500',
  red:     'bg-red-500',
  gray:    'bg-slate-400',
}

export const Badge = ({
  children,
  variant = 'default',
  dot = false,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] ?? variants.default} ${className}`}
  >
    {dot && (
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[variant] ?? dots.default}`} />
    )}
    {children}
  </span>
)

/* ---------- domain helpers ---------- */

const statusMap = {
  'Confirmée':  'success',
  'En attente': 'warning',
  'Annulée':    'danger',
  'Terminée':   'default',
  'Payée':      'success',
  'Payé':       'success',
  'Brouillon':  'default',
  'Envoyée':    'info',
  'Envoyé':     'info',
  'Converti':   'purple',
  'En retard':  'danger',
}

const tagMap = {
  VIP:      'gold',
  Régulier: 'info',
  Nouveau:  'success',
}

export const statusBadge = (statut) => statusMap[statut] ?? 'default'
export const tagBadge    = (tag)    => tagMap[tag]    ?? 'default'

export const StatusBadge = ({ statut }) => (
  <Badge variant={statusBadge(statut)} dot>{statut}</Badge>
)
