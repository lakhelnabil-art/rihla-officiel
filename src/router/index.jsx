import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { DashboardPage } from '../pages/Dashboard'
import { ReservationsPage } from '../pages/Reservations'
import { CRMPage } from '../pages/CRM'
import { FinancesPage } from '../pages/Finances'
import { DevisPage } from '../pages/Devis'
import { ProduitsPage } from '../pages/Produits'
import { CalendrierPage } from '../pages/Calendrier'
import { EquipePage } from '../pages/Equipe'
import { FournisseursPage } from '../pages/Fournisseurs'
import { ParametresPage } from '../pages/Parametres'
import { DocumentsPage } from '../pages/Documents'
import { RechercheVolsPage } from '../pages/Recherche/Vols/index.jsx'
import { RechercheHotelsPage } from '../pages/Recherche/Hotels/index.jsx'
import { RechercheTransportPage } from '../pages/Recherche/Transport/index.jsx'
import { RechercheActivitesPage } from '../pages/Recherche/Activites/index.jsx'
import { RechercheCroisierePage } from '../pages/Recherche/Croisiere/index.jsx'

export const router = createBrowserRouter([
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
    ],
  },
])
