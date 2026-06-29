import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, Users, CalendarCheck, Wallet, Clock, AlertCircle,
  FileWarning, MapPin, Plane, ChevronRight, TrendingDown,
  UserPlus, UserCheck, Package, FileText, Calendar,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../../utils/sampleData'
import {
  formatCurrency, formatDate, formatDateShort, formatPercent,
  getMonthLabel, daysUntil, sumBy, groupByKey,
} from '../../utils/formatters'
import { Card, KpiCard } from '../../components/UI/Card'
import { Badge, StatusBadge } from '../../components/UI/Badge'
import { ProgressBar } from '../../components/UI/ProgressBar'
import { ErpBanner } from '../../components/ERP/ErpOverview'
import { DashboardServicesSection } from './DashboardServicesSection'

/* ─── palette ─── */
const PALETTE = ['#1a56db', '#c9a84c', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

/* ─────────────────────────────────────────────────────────
   Custom tooltip for recharts
───────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, currency = 'MAD' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name} :</span>
          <span className="font-medium text-slate-700">{formatCurrency(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Alert item
───────────────────────────────────────────────────────── */
const AlertItem = ({ icon: Icon, message, type = 'warning' }) => {
  const styles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger:  'bg-red-50   border-red-200   text-red-800',
    info:    'bg-blue-50  border-blue-200  text-blue-800',
  }
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-sm ${styles[type]}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Legend dot for pie chart
───────────────────────────────────────────────────────── */
const PieLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
    {payload.map((p, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
        <span className="text-xs text-slate-500">{p.value}</span>
      </div>
    ))}
  </div>
)

/* ═════════════════════════════════════════════════════════
   DASHBOARD PAGE
═════════════════════════════════════════════════════════ */
export const DashboardPage = () => {
  const [reservations] = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [finances]     = useLocalStorage(STORAGE_KEYS.finances, [])
  const [clients]      = useLocalStorage(STORAGE_KEYS.clients, [])
  const [agents]       = useLocalStorage(STORAGE_KEYS.agents, [])
  const [settings]     = useLocalStorage(STORAGE_KEYS.settings, {})

  const currency = settings?.devise || 'MAD'
  const now      = new Date()
  const CM       = now.getMonth()
  const CY       = now.getFullYear()

  /* ── KPIs ── */
  const kpis = useMemo(() => {
    const thisMonthRes = reservations.filter(r => {
      const d = new Date(r.dateCreation)
      return d.getMonth() === CM && d.getFullYear() === CY
    })

    const caMonth = finances
      .filter(f => {
        const d = new Date(f.date)
        return d.getMonth() === CM && d.getFullYear() === CY
          && f.type === 'Encaissement' && f.statut === 'Payé'
      })
      .reduce((s, f) => s + (parseFloat(f.montant) || 0), 0)

    const confirmed = thisMonthRes.filter(
      r => r.statut === 'Confirmée' || r.statut === 'Terminée',
    ).length
    const tauxConv = thisMonthRes.length > 0
      ? Math.round((confirmed / thisMonthRes.length) * 100) : 0

    const activeClients = new Set(
      reservations
        .filter(r => r.statut === 'Confirmée' || r.statut === 'En attente')
        .map(r => r.clientId),
    ).size

    const panierMoyen = confirmed > 0
      ? Math.round(sumBy(thisMonthRes.filter(r => r.statut === 'Confirmée' || r.statut === 'Terminée'), 'montant') / confirmed)
      : 0

    return { caMonth, totalRes: thisMonthRes.length, tauxConv, activeClients, panierMoyen, confirmed }
  }, [reservations, finances, CM, CY])

  /* ── Revenue chart — last 6 months ── */
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d  = new Date(CY, CM - (5 - i), 1)
      const m  = d.getMonth()
      const y  = d.getFullYear()
      const match = (f) => { const fd = new Date(f.date); return fd.getMonth() === m && fd.getFullYear() === y }
      const recettes = finances.filter(f => match(f) && f.type === 'Encaissement' && f.statut === 'Payé').reduce((s, f) => s + (parseFloat(f.montant) || 0), 0)
      const depenses = finances.filter(f => match(f) && f.type === 'Dépense'      && f.statut === 'Payé').reduce((s, f) => s + (parseFloat(f.montant) || 0), 0)
      return { name: getMonthLabel(m), recettes, depenses, marge: recettes - depenses }
    })
  }, [finances, CM, CY])

  /* ── Pie — CA by product type ── */
  const typeData = useMemo(() => {
    const grouped = groupByKey(
      reservations.filter(r => r.statut !== 'Annulée'),
      'type',
    )
    return Object.entries(grouped)
      .map(([name, rows]) => ({ name, value: sumBy(rows, 'montant') }))
      .sort((a, b) => b.value - a.value)
  }, [reservations])

  /* ── Recent reservations (last 5) ── */
  const recentRes = useMemo(
    () => [...reservations].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)).slice(0, 6),
    [reservations],
  )

  /* ── Upcoming departures ── */
  const upcomingDepartures = useMemo(
    () => reservations
      .filter(r => r.statut === 'Confirmée' && daysUntil(r.depart) >= 0)
      .sort((a, b) => new Date(a.depart) - new Date(b.depart))
      .slice(0, 5),
    [reservations],
  )

  /* ── Top destinations this month ── */
  const topDest = useMemo(() => {
    const counts = {}
    reservations
      .filter(r => {
        const d = new Date(r.dateCreation)
        return d.getMonth() === CM && d.getFullYear() === CY && r.statut !== 'Annulée'
      })
      .forEach(r => {
        const dest = (r.destination || '').split(',')[0].trim() || 'Non renseigné'
        counts[dest] = (counts[dest] || 0) + 1
      })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [reservations, CM, CY])

  /* ── Alerts ── */
  const alerts = useMemo(() => {
    const list = []
    const pending = reservations.filter(r => r.statut === 'En attente').length
    if (pending > 0)
      list.push({ icon: Clock, message: `${pending} réservation(s) en attente de confirmation`, type: 'warning' })
    const overduePayments = finances.filter(f => f.statut === 'En attente' && f.type === 'Encaissement').length
    if (overduePayments > 0)
      list.push({ icon: AlertCircle, message: `${overduePayments} encaissement(s) en attente`, type: 'danger' })
    const noAcompte = reservations.filter(r => r.statut === 'En attente' && (!r.acompte || r.acompte === 0)).length
    if (noAcompte > 0)
      list.push({ icon: FileWarning, message: `${noAcompte} réservation(s) sans acompte enregistré`, type: 'info' })
    const soonDeparture = reservations.filter(r => {
      const d = daysUntil(r.depart)
      return r.statut === 'Confirmée' && d !== null && d >= 0 && d <= 3
    }).length
    if (soonDeparture > 0)
      list.push({ icon: Plane, message: `${soonDeparture} départ(s) dans les 3 prochains jours`, type: 'warning' })
    return list
  }, [reservations, finances])

  /* ── total revenue this month for sparkline label ── */
  const currentMonthRevenue = monthlyData[5]?.recettes ?? 0
  const prevMonthRevenue    = monthlyData[4]?.recettes ?? 0
  const revTrend = prevMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : null

  /* ═══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 animate-fade-in">

      <ErpBanner agencyName={settings?.nom} />

      {/* ── Actions rapides ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { to: '/crm', state: { openCreate: true }, icon: UserPlus, label: 'Nouveau client', color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' },
          { to: '/equipe', state: { openCreate: true }, icon: UserCheck, label: 'Nouvel agent', color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' },
          { to: '/reservations', state: { openCreate: true }, icon: CalendarCheck, label: 'Nouvelle résa.', color: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' },
          { to: '/produits', state: { openCreate: true }, icon: Package, label: 'Nouveau produit', color: 'bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100' },
          { to: '/devis', icon: FileText, label: 'Nouveau devis', color: 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100' },
          { to: '/calendrier', state: { openCreate: true }, icon: Calendar, label: 'Nouvel événement', color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' },
        ].map(({ to, state, icon: Icon, label, color }) => (
          <Link
            key={label}
            to={to}
            state={state}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors ${color}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Services complémentaires : rubriques verticales + détail inline ── */}
      <DashboardServicesSection />

      {/* ── Row 1: KPI cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="CA encaissé ce mois"
          value={formatCurrency(kpis.caMonth, currency)}
          sub={revTrend !== null ? `${revTrend >= 0 ? '+' : ''}${revTrend}% vs mois précédent` : 'Encaissements confirmés'}
          iconColor="bg-primary-50 text-primary-600"
          trend={revTrend}
        />
        <KpiCard
          icon={CalendarCheck}
          label="Réservations ce mois"
          value={kpis.totalRes}
          sub={`${kpis.confirmed} confirmée(s)`}
          iconColor="bg-green-50 text-green-600"
        />
        <KpiCard
          icon={Wallet}
          label="Panier moyen"
          value={formatCurrency(kpis.panierMoyen, currency)}
          sub="Par réservation confirmée"
          iconColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          icon={Users}
          label="Clients actifs"
          value={kpis.activeClients}
          sub={`sur ${clients.length} au total`}
          iconColor="bg-purple-50 text-purple-600"
        />
      </div>

      {/* ── Row 2: Charts ── */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* Revenue bar chart */}
        <Card className="xl:col-span-2">
          <Card.Header
            title="Recettes vs Dépenses"
            subtitle="6 derniers mois · transactions payées"
          />
          <Card.Body>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlyData} barGap={3} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Bar dataKey="recettes" name="Recettes" fill="#1a56db" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" name="Dépenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Marge footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-primary-600" />
                  <span className="text-xs text-slate-500">Recettes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span className="text-xs text-slate-500">Dépenses</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Marge ce mois</p>
                <p className={`text-sm font-semibold ${(monthlyData[5]?.marge ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlyData[5]?.marge ?? 0, currency)}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Pie — type breakdown */}
        <Card>
          <Card.Header title="Répartition par type" subtitle="CA hors annulations" />
          <Card.Body>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%" cy="45%"
                    outerRadius={75}
                    innerRadius={38}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={v => formatCurrency(v, currency)}
                    contentStyle={{ borderRadius: 10, fontSize: 12 }}
                  />
                  <Legend content={<PieLegend />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                Aucune donnée disponible
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* ── Row 3: Recent reservations + Right column ── */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* Recent reservations */}
        <Card className="xl:col-span-2">
          <Card.Header title="Réservations récentes" subtitle="Les 6 dernières créées" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Référence', 'Client', 'Destination', 'Départ', 'Montant', 'Statut'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                      Aucune réservation
                    </td>
                  </tr>
                ) : recentRes.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td font-mono text-xs text-primary-600">{r.ref}</td>
                    <td className="table-td font-medium text-slate-800">{r.clientNom}</td>
                    <td className="table-td text-slate-500 max-w-[120px] truncate">{(r.destination || '—').split(',')[0]}</td>
                    <td className="table-td text-slate-500 whitespace-nowrap">{formatDateShort(r.depart)}</td>
                    <td className="table-td font-medium text-slate-700 whitespace-nowrap">{formatCurrency(r.montant, currency)}</td>
                    <td className="table-td"><StatusBadge statut={r.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right column: Alerts + Departures */}
        <div className="flex flex-col gap-6">

          {/* Alerts */}
          <Card>
            <Card.Header
              title="Alertes"
              action={
                alerts.length > 0
                  ? <Badge variant="danger">{alerts.length}</Badge>
                  : null
              }
            />
            <Card.Body className="space-y-2">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center py-4 text-slate-400 gap-2">
                  <AlertCircle className="w-7 h-7 opacity-30" />
                  <span className="text-sm">Aucune alerte active</span>
                </div>
              ) : alerts.map((a, i) => (
                <AlertItem key={i} {...a} />
              ))}
            </Card.Body>
          </Card>

          {/* Upcoming departures */}
          <Card>
            <Card.Header title="Prochains départs" subtitle="Réservations confirmées" />
            <Card.Body className="space-y-3">
              {upcomingDepartures.length === 0 ? (
                <div className="flex flex-col items-center py-4 text-slate-400 gap-2">
                  <Plane className="w-7 h-7 opacity-30" />
                  <span className="text-sm">Aucun départ imminent</span>
                </div>
              ) : upcomingDepartures.map(r => {
                const days = daysUntil(r.depart)
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{r.clientNom}</p>
                      <p className="text-xs text-slate-400 truncate">{(r.destination || '—').split(',')[0]}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-primary-600">{formatDateShort(r.depart)}</p>
                      <p className="text-xs text-slate-400">
                        {days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `J−${days}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ── Row 4: Agent performance + Top destinations ── */}
      <div className="grid xl:grid-cols-2 gap-6">

        {/* Agent performance */}
        <Card>
          <Card.Header title="Performance Agents" subtitle="CA réalisé vs objectif mensuel" />
          <Card.Body className="space-y-5">
            {agents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aucun agent enregistré</p>
            ) : agents.map(agent => {
              const pct = agent.objectifMensuel > 0
                ? Math.min(100, Math.round((agent.caRealise / agent.objectifMensuel) * 100)) : 0
              return (
                <div key={agent.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-700">
                          {agent.nom.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-tight">{agent.nom}</p>
                        <p className="text-xs text-slate-400">{agent.poste}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(agent.caRealise, currency)}</p>
                      <p className="text-xs text-slate-400">/ {formatCurrency(agent.objectifMensuel, currency)}</p>
                    </div>
                  </div>
                  <ProgressBar
                    value={agent.caRealise}
                    max={agent.objectifMensuel}
                    size="sm"
                    showLabel
                  />
                </div>
              )
            })}
          </Card.Body>
        </Card>

        {/* Top destinations */}
        <Card>
          <Card.Header
            title="Top Destinations"
            subtitle="Ce mois · hors annulations"
            action={<MapPin className="w-4 h-4 text-slate-400" />}
          />
          <Card.Body className="space-y-4">
            {topDest.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-slate-400 gap-2">
                <MapPin className="w-7 h-7 opacity-30" />
                <span className="text-sm">Aucune destination ce mois</span>
              </div>
            ) : topDest.map(([dest, count], i) => (
              <div key={dest} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  i === 0 ? 'bg-gold text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700 font-medium">{dest}</span>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{count} rés.</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(count / topDest[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </div>

    </div>
  )
}
