import React from 'react'
import { Loader2 } from 'lucide-react'

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-1'

const variants = {
  primary:   'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500',
  secondary: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-300',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-400',
  ghost:     'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 focus:ring-slate-300',
  gold:      'bg-gold hover:bg-yellow-600 active:bg-yellow-700 text-white focus:ring-yellow-400',
}

const sizes = {
  sm:  'text-xs px-3 py-1.5 h-8',
  md:  'text-sm px-4 py-2 h-9',
  lg:  'text-sm px-5 py-2.5 h-11',
  xl:  'text-base px-6 py-3 h-12',
  icon:'p-2 h-9 w-9',
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}) => (
  <button
    className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading
      ? <Loader2 className="w-4 h-4 animate-spin" />
      : Icon && <Icon className="w-4 h-4 flex-shrink-0" />
    }
    {size !== 'icon' && children}
    {!loading && IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
  </button>
)
