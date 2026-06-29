import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuth } from '../../context/AuthContext'
import { useAgencyData } from '../../context/AgencyDataContext'
import { useNotifications } from '../../hooks/useNotifications'
import { MigrationBanner } from '../MigrationBanner'

export const Layout = ({ agencyName }) => {
  const { logout: authLogout, leaveAgency } = useAuth()
  const { loading, error } = useAgencyData()
  const { isAdmin } = useAuth()
  const notifications = useNotifications()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try { await leaveAgency() } catch { /* platform token may already be cleared */ }
    authLogout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Chargement des données…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md text-center space-y-2">
          <p className="font-semibold text-navy">Erreur de synchronisation</p>
          <p className="text-sm text-slate-500">{error}</p>
          <p className="text-xs text-slate-400">Vérifiez que le serveur API est démarré.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed lg:relative z-40 h-full transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(v => !v)}
          onNavigate={() => setMobileOpen(false)}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          notifications={notifications}
          agencyName={agencyName}
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <MigrationBanner />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
