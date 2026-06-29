import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, Wallet, FileText, Package,
  Calendar, UserCheck, Truck, Settings, ChevronLeft, ChevronRight,
  LogOut, Shield, FolderOpen, ArrowLeftRight,
  Plane, Hotel, Car, Compass, Ship, Sparkles,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, defaultSettings } from '../../utils/sampleData'
import { usePlatform } from '../../context/PlatformContext'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/',             label: 'Tableau de bord',  icon: LayoutDashboard, end: true },
  { to: '/reservations', label: 'Réservations',     icon: CalendarDays },
  { section: 'Recherches' },
  { to: '/recherche/vols',       label: 'Vols',        icon: Plane },
  { to: '/recherche/hotels',     label: 'Hôtels',      icon: Hotel },
  { to: '/recherche/transport',  label: 'Transport',   icon: Car },
  { to: '/recherche/activites',  label: 'Activités',   icon: Compass },
  { to: '/recherche/croisiere',  label: 'Croisières',  icon: Ship },
  { to: '/services',     label: 'Autres services',  icon: Sparkles },
  { section: 'Gestion' },
  { to: '/crm',          label: 'CRM Clients',      icon: Users },
  { to: '/finances',     label: 'Finances',         icon: Wallet,    adminOnly: true },
  { to: '/devis',        label: 'Devis & Factures', icon: FileText },
  { to: '/produits',     label: 'Produits & Tarifs',icon: Package },
  { to: '/calendrier',   label: 'Calendrier',       icon: Calendar },
  { to: '/documents',    label: 'Documents',        icon: FolderOpen },
  { to: '/equipe',       label: 'Équipe & Agents',  icon: UserCheck, adminOnly: true },
  { to: '/fournisseurs', label: 'Fournisseurs',     icon: Truck,     adminOnly: true },
  { to: '/parametres',   label: 'Paramètres',       icon: Settings,  adminOnly: true },
]

export const Sidebar = ({ collapsed, onToggleCollapse, onNavigate, isAdmin, onLogout }) => {
  const [settings] = useLocalStorage(STORAGE_KEYS.settings, defaultSettings)
  const { clearAgency } = usePlatform()
  const { leaveAgency } = useAuth()

  const agencyName = settings?.nom || 'Rihla'
  const [firstName, ...rest] = agencyName.split(' ')
  const lastName = rest.join(' ')

  const visibleNav = navItems.filter(item => item.section || !item.adminOnly || isAdmin)

  const handleSwitchAgency = async () => {
    onLogout()
    await leaveAgency()
    await clearAgency()
  }

  return (
  <aside
    className={`h-screen flex flex-col bg-navy-700 transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}
    style={{ minHeight: '100vh' }}
  >
    {/* Brand */}
    <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
      <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center flex-shrink-0 shadow overflow-hidden">
        {settings?.logo
          ? <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
          : <img src="/rihla-mark.svg" alt="Rihla" className="w-5 h-5 object-contain" />
        }
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <p className="text-white font-bold text-sm leading-tight truncate">{firstName}</p>
          <p className="text-white/50 text-xs truncate">{lastName || 'Voyages'}</p>
        </div>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
      {visibleNav.map((item, i) => {
        if (item.section) {
          const nextItems = visibleNav.slice(i + 1)
          const nextSectionIdx = nextItems.findIndex(n => n.section)
          const until = nextSectionIdx === -1 ? nextItems.length : nextSectionIdx
          const hasVisible = nextItems.slice(0, until).some(n => !n.section)
          if (!hasVisible) return null
          return (
            <div key={`section-${item.section}`} className={`px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/30 ${collapsed ? 'hidden' : ''}`}>
              {item.section}
            </div>
          )
        }
        const { to, label, icon: Icon, end } = item
        return (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'} ${collapsed ? 'justify-center' : ''}`
          }
        >
          <Icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
        )
      })}
    </nav>

    {/* Role badge + actions */}
    <div className="px-2 pb-2 border-t border-white/10 pt-2 space-y-0.5">
      {!collapsed && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isAdmin ? 'bg-amber-500/20' : 'bg-white/5'}`}>
          <Shield className={`w-3.5 h-3.5 flex-shrink-0 ${isAdmin ? 'text-amber-400' : 'text-white/40'}`} />
          <span className={`text-xs font-medium ${isAdmin ? 'text-amber-300' : 'text-white/40'}`}>
            {isAdmin ? 'Administrateur' : 'Agent'}
          </span>
        </div>
      )}
      <button
        onClick={onLogout}
        className="w-full sidebar-item sidebar-item-inactive justify-center text-white/50 hover:text-red-400"
        title="Changer de profil"
      >
        <LogOut className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span className="text-xs">Changer de profil</span>}
      </button>
      <button
        onClick={handleSwitchAgency}
        className="w-full sidebar-item sidebar-item-inactive justify-center text-white/30 hover:text-white/70"
        title="Changer d'agence"
      >
        <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span className="text-xs">Changer d'agence</span>}
      </button>
    </div>

    {/* Collapse toggle */}
    <div className="px-2 py-2 border-t border-white/10">
      <button
        onClick={onToggleCollapse}
        className="w-full sidebar-item sidebar-item-inactive justify-center"
        title={collapsed ? 'Développer' : 'Réduire'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        {!collapsed && <span className="text-xs">Réduire</span>}
      </button>
    </div>
  </aside>
  )
}
