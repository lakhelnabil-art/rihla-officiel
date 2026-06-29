import React, { useState, useEffect, useCallback } from 'react'
import {
  Globe, RefreshCw, Search, Download, Plane, Ticket,
  TrendingUp, MapPin, Building2, Loader2, AlertCircle,
} from 'lucide-react'
import { Card, Button, Badge } from '../../components/UI'
import { useToast } from '../../hooks/useToast'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAgencyData } from '../../context/AgencyDataContext'
import { STORAGE_KEYS, defaultSettings } from '../../utils/sampleData'
import { gdsApi } from '../../api/gds'
import { formatCurrency } from '../../utils/formatters'
import { Link } from 'react-router-dom'

const PERIODS = [
  { id: 'day', label: 'Jour' },
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'year', label: 'Année' },
]

const KpiCard = ({ label, value, icon: Icon, color = 'text-primary-600' }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
)

export const GdsDashboardPage = () => {
  const toast = useToast()
  const { reload: reloadAgencyData } = useAgencyData()
  const [settings] = useLocalStorage(STORAGE_KEYS.settings, defaultSettings)
  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [pnrSearch, setPnrSearch] = useState('')
  const [importing, setImporting] = useState(false)

  const gdsMode = settings.gdsMode ?? 'none'
  const hasGds = gdsMode !== 'none'

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [s, d] = await Promise.all([
        gdsApi.status(),
        hasGds ? gdsApi.dashboard(period) : Promise.resolve(null),
      ])
      setStatus(s)
      setStats(d)
    } catch {
      setStatus(null)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [period, hasGds])

  useEffect(() => { reload() }, [reload])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await gdsApi.sync()
      toast.success(`${result.imported} PNR importé(s)${result.failed ? `, ${result.failed} échec(s)` : ''}`)
      await reloadAgencyData()
      await reload()
    } catch (err) {
      toast.error(err.message || 'Synchronisation échouée')
    } finally {
      setSyncing(false)
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!pnrSearch.trim()) return
    setImporting(true)
    try {
      await gdsApi.importPnr(pnrSearch.trim().toUpperCase())
      toast.success(`PNR ${pnrSearch.toUpperCase()} importé dans Rihla`)
      setPnrSearch('')
      await reloadAgencyData()
      await reload()
    } catch (err) {
      toast.error(err.message || 'Import échoué')
    } finally {
      setImporting(false)
    }
  }

  if (!hasGds) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <Globe className="w-12 h-12 text-slate-300 mx-auto" />
        <h1 className="text-xl font-bold text-navy">GDS — Mode autonome</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Votre agence utilise Rihla sans connecteur GDS. Tous les modules restent disponibles.
          Pour connecter Amadeus ou un autre GDS, configurez la connectivité dans les paramètres.
        </p>
        <Link to="/parametres" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
          Paramètres → Connectivité GDS
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-500" />
            Dashboard GDS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {status?.activeConnection
              ? `Connecteur actif : ${status.activeConnection.provider} — Office ${status.activeConnection.officeId}`
              : 'Connecteur configuré mais non activé'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  period === p.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={syncing ? Loader2 : RefreshCw}
            onClick={handleSync}
            disabled={syncing || !status?.activeConnection}
          >
            {syncing ? 'Sync…' : 'Synchroniser'}
          </Button>
        </div>
      </div>

      {!status?.activeConnection && (
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Activez votre connecteur GDS dans{' '}
            <Link to="/parametres" className="font-semibold underline">Paramètres</Link>
            {' '}pour importer des PNR.
          </p>
        </div>
      )}

      {/* Import PNR */}
      <Card>
        <Card.Header title="Recherche & import PNR" subtitle="Importer un dossier GDS dans Rihla (CRM + réservation + facture)" />
        <Card.Body>
          <form onSubmit={handleImport} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input w-full pl-9"
                placeholder="Record locator (ex. ABC123)"
                value={pnrSearch}
                onChange={e => setPnrSearch(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <Button type="submit" icon={importing ? Loader2 : Download} disabled={importing || !status?.activeConnection}>
              {importing ? 'Import…' : 'Importer'}
            </Button>
          </form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
        </div>
      ) : stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Réservations GDS" value={stats.reservations} icon={Plane} />
            <KpiCard label="Billets émis" value={stats.ticketsIssued} icon={Ticket} color="text-blue-600" />
            <KpiCard label="Chiffre d'affaires" value={formatCurrency(stats.revenue)} icon={TrendingUp} color="text-green-600" />
            <KpiCard label="Commissions" value={formatCurrency(stats.commissions)} icon={TrendingUp} color="text-amber-600" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header title="Top destinations" action={<MapPin className="w-4 h-4 text-slate-400" />} />
              <Card.Body>
                {stats.topDestinations?.length ? (
                  <ul className="space-y-2">
                    {stats.topDestinations.map(d => (
                      <li key={d.code} className="flex justify-between text-sm">
                        <span className="font-mono font-bold text-navy">{d.code}</span>
                        <span className="text-slate-500">{d.count} segment{d.count > 1 ? 's' : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Aucune donnée sur la période</p>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header title="Top compagnies" action={<Building2 className="w-4 h-4 text-slate-400" />} />
              <Card.Body>
                {stats.topCarriers?.length ? (
                  <ul className="space-y-2">
                    {stats.topCarriers.map(c => (
                      <li key={c.code} className="flex justify-between text-sm">
                        <span className="font-mono font-bold text-navy">{c.code}</span>
                        <span className="text-slate-500">{c.count} vol{c.count > 1 ? 's' : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Aucune donnée sur la période</p>
                )}
              </Card.Body>
            </Card>
          </div>

          {stats.recentPnrs?.length > 0 && (
            <Card>
              <Card.Header title="PNR récents" subtitle={`${stats.totalPnrs} dossier(s) au total`} />
              <Card.Body className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      <th className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400">PNR</th>
                      <th className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400">Statut</th>
                      <th className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400">Passagers</th>
                      <th className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400">Segments</th>
                      <th className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400">Import</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.recentPnrs.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-primary-600">{p.recordLocator}</td>
                        <td className="px-4 py-2.5"><Badge variant={p.status === 'CONFIRMED' ? 'success' : 'default'}>{p.status}</Badge></td>
                        <td className="px-4 py-2.5 text-slate-600">{p.passengers?.length ?? 0}</td>
                        <td className="px-4 py-2.5 text-slate-600">{p.segments?.length ?? 0}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-400">
                          {p.importedAt ? new Date(p.importedAt).toLocaleDateString('fr-MA') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default GdsDashboardPage
