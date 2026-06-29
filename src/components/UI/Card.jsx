import React from 'react'

/** Full card with optional header row and footer row. */
export const Card = ({ children, className = '', noPadding = false }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${noPadding ? '' : ''} ${className}`}>
    {children}
  </div>
)

/** Pre-styled header row inside a Card. */
Card.Header = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between px-5 py-4 border-b border-slate-100 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-navy leading-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0 ml-4">{action}</div>}
  </div>
)

/** Padded body. Use noPadding on the root Card if you want full-bleed content. */
Card.Body = ({ children, className = '' }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
)

/** Footer row — subtle background to visually separate. */
Card.Footer = ({ children, className = '' }) => (
  <div className={`px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center gap-3 ${className}`}>
    {children}
  </div>
)

/** Simple KPI-style card. */
export const KpiCard = ({ icon: Icon, label, value, sub, iconColor = 'bg-primary-50 text-primary-600', trend }) => (
  <Card>
    <Card.Body className="flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-navy leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </Card.Body>
  </Card>
)
