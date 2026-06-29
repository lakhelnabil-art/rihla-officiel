import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, User, Menu } from 'lucide-react'

const routeLabels = {
  '/':             'Tableau de bord',
  '/reservations': 'Réservations',
  '/crm':          'CRM Clients',
  '/finances':     'Finances',
  '/devis':        'Devis & Factures',
  '/produits':     'Produits & Tarifs',
  '/calendrier':   'Calendrier',
  '/equipe':       'Équipe & Agents',
  '/fournisseurs': 'Fournisseurs',
  '/parametres':   'Paramètres',
  '/documents':    'Documents',
}

const today = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date())

const severityStyles = {
  danger:  'border-l-red-500',
  warning: 'border-l-amber-500',
  info:    'border-l-primary-500',
}

export const Header = ({ notifications = [], onMobileMenuToggle, agencyName = 'Rihla', isAdmin = false, onLogout }) => {
  const { pathname } = useLocation()
  const [showNotif, setShowNotif] = useState(false)
  const pageTitle = routeLabels[pathname] ?? 'Page'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-navy">{pageTitle}</h1>
          <p className="text-xs text-slate-400 hidden sm:block capitalize">{today}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(v => !v)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-navy">
                  Alertes{notifications.length > 0 ? ` (${notifications.length})` : ''}
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-400 text-center">Aucune alerte pour le moment</p>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 border-l-4 ${severityStyles[n.severity] ?? 'border-l-slate-300'}`}
                    >
                      <p className="text-sm text-slate-700">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.type}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-amber-500' : 'bg-primary-600'}`}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-700">{isAdmin ? 'Administrateur' : 'Agent'}</p>
            <p className="text-xs text-slate-400">{isAdmin ? 'Accès complet' : 'Accès limité'}</p>
          </div>
        </div>
      </div>

      {showNotif && <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />}
    </header>
  )
}
