import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { PlatformProvider, usePlatform } from './context/PlatformContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AgencyDataProvider } from './context/AgencyDataContext'
import { PlatformScreen } from './pages/Platform'
import { LoginPage } from './pages/Auth/Login'
import { Loader2 } from 'lucide-react'
import { Layout } from './components/Layout/Layout'
import { DashboardPage } from './pages/Dashboard'
import { ReservationsPage } from './pages/Reservations'
import { CRMPage } from './pages/CRM'
import { FinancesPage } from './pages/Finances'
import { DevisPage } from './pages/Devis'
import { ProduitsPage } from './pages/Produits'
import { CalendrierPage } from './pages/Calendrier'
import { EquipePage } from './pages/Equipe'
import { FournisseursPage } from './pages/Fournisseurs'
import { ParametresPage } from './pages/Parametres'
import { DocumentsPage } from './pages/Documents'
import { RechercheVolsPage } from './pages/Recherche/Vols/index.jsx'
import { RechercheHotelsPage } from './pages/Recherche/Hotels/index.jsx'
import { RechercheTransportPage } from './pages/Recherche/Transport/index.jsx'
import { RechercheActivitesPage } from './pages/Recherche/Activites/index.jsx'
import { RechercheCroisierePage } from './pages/Recherche/Croisiere/index.jsx'
import ServicesModule from './components/Services/ServicesModule'

const LoadingScreen = () => (
  <div className="min-h-screen bg-navy-700 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-white animate-spin" />
  </div>
)


const agencyRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,               element: <DashboardPage /> },
      { path: 'reservations',      element: <ReservationsPage /> },
      { path: 'crm',               element: <CRMPage /> },
      { path: 'finances',          element: <FinancesPage /> },
      { path: 'devis',             element: <DevisPage /> },
      { path: 'produits',          element: <ProduitsPage /> },
      { path: 'calendrier',        element: <CalendrierPage /> },
      { path: 'equipe',            element: <EquipePage /> },
      { path: 'fournisseurs',      element: <FournisseursPage /> },
      { path: 'parametres',        element: <ParametresPage /> },
      { path: 'documents',         element: <DocumentsPage /> },
      { path: 'recherche/vols',      element: <RechercheVolsPage /> },
      { path: 'recherche/hotels',    element: <RechercheHotelsPage /> },
      { path: 'recherche/transport', element: <RechercheTransportPage /> },
      { path: 'recherche/activites', element: <RechercheActivitesPage /> },
      { path: 'recherche/croisiere', element: <RechercheCroisierePage /> },
      { path: 'gds',                 element: <Navigate to="/parametres?section=gds" replace /> },
      { path: 'services',          element: <ServicesModule /> },
    ],
  },
])

const AgencyApp = () => (
  <AgencyDataProvider>
    <ToastProvider>
      <RouterProvider router={agencyRouter} />
    </ToastProvider>
  </AgencyDataProvider>
)

const AppGate = () => {
  const { user, loading } = useAuth()
  const { currentAgency } = usePlatform()

  if (loading) return <LoadingScreen />
  if (!user) return <LoginPage />
  if (!currentAgency) return <PlatformScreen />

  return <AgencyApp />
}

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <AppGate />
      </PlatformProvider>
    </AuthProvider>
  )
}
