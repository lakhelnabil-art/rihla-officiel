import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useAuth } from '../../context/AuthContext'
import { AccessDenied } from '../../components/UI'
import {
  UserCheck, Plus, Mail, Phone, Calendar, Edit2,
  Trash2, TrendingUp, Award, Target, Users,
  ChevronLeft, Briefcase, Star,
  FileSpreadsheet, ChevronRight, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS } from '../../utils/sampleData'
import {
  formatCurrency, formatDate, formatPhone,
  fuzzyMatch, sumBy, todayISO,
} from '../../utils/formatters'
import {
  Button, Card, Modal, ConfirmModal, Badge, ProgressBar,
} from '../../components/UI'
import { validateAgentForm } from '../../components/QuickCreate'

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const POSTES = [
  'Responsable Commercial', 'Directeur Agence',
  'Conseiller Voyages', 'Conseillère Voyages',
  'Agent Billetterie', 'Assistant(e) Commercial(e)', 'Autre',
]

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-rose-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-amber-500',
]

const EMPTY_AGENT = {
  nom: '', poste: 'Conseiller Voyages', email: '',
  telephone: '', objectifMensuel: 50000,
  caRealise: 0, dateEmbauche: todayISO(),
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

const initials = (nom) =>
  nom.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

const avatarColor = (id, agents) => {
  const idx = agents.findIndex(a => a.id === id)
  return AVATAR_COLORS[(idx < 0 ? 0 : idx) % AVATAR_COLORS.length]
}

const anciennete = (dateEmbauche) => {
  if (!dateEmbauche) return '—'
  const d = new Date(dateEmbauche)
  const now = new Date()
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
  if (months < 1)  return 'Moins d\'un mois'
  if (months < 12) return `${months} mois`
  const y = Math.floor(months / 12)
  const m = months % 12
  return m ? `${y} an${y > 1 ? 's' : ''} ${m} mois` : `${y} an${y > 1 ? 's' : ''}`
}

const tauxRealisation = (agent) => {
  const obj = parseFloat(agent.objectifMensuel) || 0
  if (!obj) return 0
  return Math.min((parseFloat(agent.caRealise) || 0) / obj * 100, 150)
}

/* ─────────────────────────────────────────
   AVATAR
───────────────────────────────────────── */

const Avatar = ({ nom, colorClass, size = 'md' }) => {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl' }
  return (
    <div className={`${sizes[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(nom || '?')}
    </div>
  )
}

/* ─────────────────────────────────────────
   AGENT FORM MODAL
───────────────────────────────────────── */

const AgentForm = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() => initial ?? { ...EMPTY_AGENT })
  const [errors, setErrors] = useState({})
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const taux = tauxRealisation(form)

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validateAgentForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave(form)
  }

  const errCls = (key) => errors[key] ? 'border-red-300 ring-1 ring-red-200' : ''

  return (
    <Modal
      title={isEdit ? `Modifier — ${form.nom}` : 'Nouvel agent'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Enregistrer' : 'Créer l\'agent'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Profil</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nom complet *</label>
              <input className={`input-field ${errCls('nom')}`} value={form.nom} required autoFocus
                onChange={e => set('nom', e.target.value)} placeholder="Prénom Nom" />
              {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
            </div>
            <div>
              <label className="label">Poste</label>
              <select className="input-field" value={form.poste}
                onChange={e => set('poste', e.target.value)}>
                {POSTES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Contact</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className={`input-field ${errCls('email')}`} value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="prenom.nom@agence.ma" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input-field" value={form.telephone}
                onChange={e => set('telephone', e.target.value)}
                placeholder="06XXXXXXXX" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Objectifs</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date d'embauche</label>
              <input type="date" className="input-field" value={form.dateEmbauche}
                onChange={e => set('dateEmbauche', e.target.value)} />
            </div>
            <div>
              <label className="label">Objectif mensuel (MAD)</label>
              <input type="number" min="0" className="input-field"
                value={form.objectifMensuel}
                onChange={e => set('objectifMensuel', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">CA réalisé ce mois (MAD)</label>
            <input type="number" min="0" className="input-field"
              value={form.caRealise}
              onChange={e => set('caRealise', parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        {/* Live performance preview */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Taux de réalisation</span>
            <span className={`font-bold ${taux >= 100 ? 'text-green-600' : taux >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
              {taux.toFixed(0)}%
            </span>
          </div>
          <ProgressBar
            value={Math.min(taux, 100)}
            max={100}
            color={taux >= 100 ? 'green' : taux >= 70 ? 'blue' : taux >= 50 ? 'yellow' : 'red'}
            size="sm"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatCurrency(form.caRealise)}</span>
            <span>/ {formatCurrency(form.objectifMensuel)}</span>
          </div>
        </div>
      </form>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   AGENT PROFILE (full view)
───────────────────────────────────────── */

const AgentProfile = ({ agent, agentResas, colorClass, onEdit, onBack }) => {
  const taux    = tauxRealisation(agent)
  const nbResas = agentResas.length
  const caTotal = sumBy(agentResas, 'montant')
  const encaisse= sumBy(agentResas, 'acompte')
  const confirmed = agentResas.filter(r => r.statut === 'Confirmée').length

  const recent  = [...agentResas]
    .sort((a, b) => b.dateCreation?.localeCompare(a.dateCreation ?? '') ?? 0)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-700 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à l'équipe
      </button>

      {/* Hero card */}
      <Card>
        <Card.Body className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar nom={agent.nom} colorClass={colorClass} size="xl" />
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-navy-800">{agent.nom}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="blue">{agent.poste}</Badge>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">Depuis {formatDate(agent.dateEmbauche)}</span>
                <span className="text-xs text-gray-400">({anciennete(agent.dateEmbauche)})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {agent.email && (
                <a href={`mailto:${agent.email}`}
                  className="flex items-center gap-1.5 hover:text-navy-700 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {agent.email}
                </a>
              )}
              {agent.telephone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {formatPhone(agent.telephone)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" icon={Edit2} onClick={() => onEdit(agent)}>
              Modifier
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Réservations',  value: nbResas,                   sub: `${confirmed} confirmée(s)`, color: 'text-navy-700' },
          { label: 'CA portefeuille', value: formatCurrency(caTotal), sub: `Encaissé : ${formatCurrency(encaisse)}`, color: 'text-navy-700' },
          { label: 'CA réalisé',    value: formatCurrency(agent.caRealise), sub: 'ce mois', color: taux >= 100 ? 'text-green-600' : 'text-navy-700' },
          { label: 'Objectif',      value: formatCurrency(agent.objectifMensuel), sub: 'mensuel', color: 'text-gray-600' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4">
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
            <div className="text-xs text-gray-400">{kpi.sub}</div>
          </Card>
        ))}
      </div>

      {/* Performance bar */}
      <Card>
        <Card.Header title="Performance mensuelle" subtitle="CA réalisé vs objectif mensuel" />
        <Card.Body className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taux de réalisation</span>
            <span className={`font-bold text-base ${taux >= 100 ? 'text-green-600' : taux >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
              {taux.toFixed(1)}%
              {taux >= 100 && <Star className="w-4 h-4 inline ml-1 text-amber-400" fill="currentColor" />}
            </span>
          </div>
          <ProgressBar
            value={Math.min(taux, 100)}
            max={100}
            color={taux >= 100 ? 'green' : taux >= 70 ? 'blue' : taux >= 50 ? 'yellow' : 'red'}
            size="lg"
            showLabel
            label={`${formatCurrency(agent.caRealise)} / ${formatCurrency(agent.objectifMensuel)}`}
          />
          {taux >= 100 && (
            <p className="text-xs text-green-600 font-medium">
              🎯 Objectif atteint ! Surplus de {formatCurrency(agent.caRealise - agent.objectifMensuel)}
            </p>
          )}
        </Card.Body>
      </Card>

      {/* Recent reservations */}
      <Card>
        <Card.Header title="Réservations récentes" subtitle={`${nbResas} au total`} />
        {recent.length === 0 ? (
          <Card.Body>
            <div className="py-8 text-center text-gray-400 text-sm">Aucune réservation</div>
          </Card.Body>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Référence', 'Client', 'Destination', 'Départ', 'Statut', 'Montant'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-navy-700 font-semibold">{r.ref}</td>
                    <td className="px-4 py-2.5 text-gray-700">{r.clientNom}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{r.destination}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{formatDate(r.depart)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${r.statut === 'Confirmée' ? 'bg-green-100 text-green-700'
                          : r.statut === 'Annulée' ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                        {r.statut}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-navy-700">{formatCurrency(r.montant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ─────────────────────────────────────────
   AGENT CARD
───────────────────────────────────────── */

const AgentCard = ({ agent, colorClass, resas, onEdit, onDelete, onView }) => {
  const taux   = tauxRealisation(agent)
  const nbResas = resas.length
  const caTotal = sumBy(resas, 'montant')

  return (
    <div
      onClick={() => onView(agent)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Color top bar */}
      <div className={`h-1.5 rounded-t-xl ${colorClass}`} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar nom={agent.nom} colorClass={colorClass} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{agent.nom}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{agent.poste}</p>
            <p className="text-xs text-gray-400 mt-0.5">{anciennete(agent.dateEmbauche)}</p>
          </div>
          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(agent)}
              className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(agent)}
              className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          {agent.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate"
              onClick={e => e.stopPropagation()}>
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${agent.email}`}
                className="hover:text-navy-700 transition-colors truncate"
                onClick={e => e.stopPropagation()}>
                {agent.email}
              </a>
            </div>
          )}
          {agent.telephone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {formatPhone(agent.telephone)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-navy-700">{nbResas}</div>
            <div className="text-xs text-gray-500">Rés.</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-navy-700 truncate">{formatCurrency(caTotal, '')}</div>
            <div className="text-xs text-gray-500">CA total</div>
          </div>
        </div>

        {/* Performance bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Objectif mensuel</span>
            <span className={`font-bold
              ${taux >= 100 ? 'text-green-600' : taux >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
              {taux.toFixed(0)}%
              {taux >= 100 && ' 🎯'}
            </span>
          </div>
          <ProgressBar
            value={Math.min(taux, 100)}
            max={100}
            color={taux >= 100 ? 'green' : taux >= 70 ? 'blue' : taux >= 50 ? 'yellow' : 'red'}
            size="sm"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatCurrency(agent.caRealise)}</span>
            <span>/ {formatCurrency(agent.objectifMensuel)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PERFORMANCE CHART
───────────────────────────────────────── */

const PerfChart = ({ agents }) => {
  const data = agents.map(a => ({
    nom: a.nom.split(' ')[0],
    'CA réalisé': parseFloat(a.caRealise) || 0,
    'Objectif':   parseFloat(a.objectifMensuel) || 0,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map(p => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.dataKey}</span>
            <span className="font-medium">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <Card.Header title="Performance mensuelle" subtitle="CA réalisé vs objectif" />
      <Card.Body>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="nom" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Legend
              iconType="circle" iconSize={8}
              formatter={v => <span className="text-xs text-gray-600">{v}</span>}
            />
            <Bar dataKey="CA réalisé" fill="#1a56db" radius={[4, 4, 0, 0]} maxBarSize={48} />
            <Bar dataKey="Objectif"   fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  )
}

/* ─────────────────────────────────────────
   IMPORT EXCEL MODAL
───────────────────────────────────────── */

const AGENT_FIELDS = {
  nom:            'Nom complet',
  poste:          'Poste / Fonction',
  email:          'Email',
  telephone:      'Téléphone',
  dateEmbauche:   "Date d'embauche",
  objectifMensuel:'Objectif mensuel (MAD)',
  caRealise:      'CA réalisé (MAD)',
}

const autoDetectAgent = (header) => {
  const h = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/\b(nom|name|agent|prenom)\b/.test(h))           return 'nom'
  if (/poste|titre|role|fonction|position/.test(h))    return 'poste'
  if (/email|mail|courriel/.test(h))                   return 'email'
  if (/tel|phone|mobile|portable/.test(h))             return 'telephone'
  if (/embauche|recrutement|hired|debut/.test(h))      return 'dateEmbauche'
  if (/objectif|target/.test(h))                       return 'objectifMensuel'
  if (/\bca\b|realise|chiffre|vente/.test(h))          return 'caRealise'
  return ''
}

const ImportAgentsModal = ({ existingAgents, onImport, onClose }) => {
  const fileRef    = useRef(null)
  const [step,     setStep]     = useState('upload')
  const [fileName, setFileName] = useState('')
  const [headers,  setHeaders]  = useState([])
  const [rows,     setRows]     = useState([])
  const [mapping,  setMapping]  = useState({})
  const [dupMode,  setDupMode]  = useState('skip')
  const [dragging, setDragging] = useState(false)
  const [parseErr, setParseErr] = useState('')

  const parseFile = async (file) => {
    setParseErr('')
    try {
      const isCSV = file.name.toLowerCase().endsWith('.csv')
      let wb
      if (isCSV) {
        const text = await file.text()
        wb = XLSX.read(text, { type: 'string' })
      } else {
        const buf = await file.arrayBuffer()
        wb = XLSX.read(new Uint8Array(buf), { type: 'array' })
      }
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (!json.length || !json[0].length) { setParseErr('Fichier vide ou non reconnu.'); return }

      const hdrs     = json[0].map(h => String(h).trim()).filter(Boolean)
      const dataRows = json.slice(1).filter(r => r.some(c => c !== ''))

      setFileName(file.name)
      setHeaders(hdrs)
      setRows(dataRows)

      const auto = {}
      hdrs.forEach(h => {
        const f = autoDetectAgent(h)
        if (f && !Object.values(auto).includes(h)) auto[f] = h
      })
      setMapping(auto)
      setStep('map')
    } catch {
      setParseErr('Impossible de lire ce fichier. Vérifiez le format.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  const getCellValue = (row, colHeader) => {
    const idx = headers.indexOf(colHeader)
    return idx >= 0 ? String(row[idx] ?? '').trim() : ''
  }

  const rowToAgent = (row) => ({
    nom:             getCellValue(row, mapping.nom            || ''),
    poste:           getCellValue(row, mapping.poste          || '') || 'Conseiller Voyages',
    email:           getCellValue(row, mapping.email          || ''),
    telephone:       getCellValue(row, mapping.telephone      || ''),
    dateEmbauche:    getCellValue(row, mapping.dateEmbauche   || '') || todayISO(),
    objectifMensuel: parseFloat(getCellValue(row, mapping.objectifMensuel || '')) || 50000,
    caRealise:       parseFloat(getCellValue(row, mapping.caRealise       || '')) || 0,
  })

  const isDup = (a) =>
    existingAgents.some(e =>
      (a.email     && e.email     === a.email) ||
      (a.telephone && e.telephone === a.telephone)
    )

  const allParsed = useMemo(() => rows.map(rowToAgent), [rows, mapping, headers])
  const valid     = useMemo(() => allParsed.filter(a => a.nom), [allParsed])
  const dups      = useMemo(() => valid.filter(isDup), [valid, existingAgents])
  const toAdd     = useMemo(() => valid.filter(a => !isDup(a)), [valid, existingAgents])
  const preview   = valid.slice(0, 5)

  const handleImport = () => {
    const newAgents = toAdd.map(a => ({
      ...a, id: `age-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }))
    const updatedAgents = dupMode === 'update'
      ? dups.map(a => {
          const existing = existingAgents.find(e =>
            (a.email && e.email === a.email) || (a.telephone && e.telephone === a.telephone)
          )
          return existing ? { ...existing, ...a } : null
        }).filter(Boolean)
      : []
    onImport(newAgents, updatedAgents)
    onClose()
  }

  return (
    <Modal
      onClose={onClose}
      title="Importer des agents"
      size="lg"
      footer={step === 'map' ? (
        <>
          <Button variant="ghost" onClick={() => setStep('upload')}>Retour</Button>
          <Button
            icon={CheckCircle2}
            onClick={handleImport}
            disabled={valid.length === 0}
          >
            Importer {toAdd.length + (dupMode === 'update' ? dups.length : 0)} agent(s)
          </Button>
        </>
      ) : (
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
      )}
    >
      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${dragging ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-700">Glissez votre fichier ici</p>
            <p className="text-xs text-slate-400 mt-1">ou cliquez pour sélectionner</p>
            <p className="text-xs text-slate-300 mt-3">Formats acceptés : .xlsx · .xls · .csv</p>
            <input ref={fileRef} type="file" className="hidden"
              accept=".xlsx,.xls,.csv" onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f) }} />
          </div>
          {parseErr && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{parseErr}
            </div>
          )}
          <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500 space-y-1.5">
            <p className="font-medium text-slate-600">Format attendu :</p>
            <p>• La <strong>première ligne</strong> doit contenir les en-têtes de colonnes</p>
            <p>• Colonnes reconnues automatiquement : Nom, Poste, Email, Téléphone, Date d'embauche, Objectif, CA réalisé</p>
            <p>• Les colonnes non reconnues pourront être mappées manuellement</p>
          </div>
        </div>
      )}

      {/* ── Step 2: Mapping + Preview ── */}
      {step === 'map' && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 text-sm">
            <FileSpreadsheet className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-700">{fileName}</p>
              <p className="text-xs text-slate-400">{rows.length} ligne(s) détectée(s)</p>
            </div>
            <button onClick={() => setStep('upload')} className="ml-auto text-xs text-primary-600 hover:underline">
              Changer
            </button>
          </div>

          {/* Column mapping */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Correspondance des colonnes
            </p>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="table-th text-left">Colonne Excel</th>
                    <th className="table-th text-left">
                      <span className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> Champ agent
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map(h => (
                    <tr key={h} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="table-td font-mono text-xs text-slate-600">{h}</td>
                      <td className="table-td">
                        <select
                          className="input-field text-xs py-1"
                          style={{ height: '30px' }}
                          value={Object.entries(mapping).find(([, v]) => v === h)?.[0] || ''}
                          onChange={e => {
                            const field = e.target.value
                            setMapping(prev => {
                              const next = { ...prev }
                              Object.keys(next).forEach(k => { if (next[k] === h) delete next[k] })
                              if (field) next[field] = h
                              return next
                            })
                          }}
                        >
                          <option value="">— Ignorer —</option>
                          {Object.entries(AGENT_FIELDS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Aperçu ({preview.length} premières lignes)
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['nom', 'poste', 'email', 'telephone'].map(f => (
                        <th key={f} className="table-th text-left whitespace-nowrap">{AGENT_FIELDS[f]}</th>
                      ))}
                      <th className="table-th text-left">Doublon ?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((a, i) => (
                      <tr key={i} className={`border-b border-slate-50 last:border-0 ${isDup(a) ? 'bg-amber-50' : ''}`}>
                        <td className="table-td font-medium text-slate-700">{a.nom || '—'}</td>
                        <td className="table-td text-slate-500">{a.poste || '—'}</td>
                        <td className="table-td text-slate-500 max-w-[140px] truncate">{a.email || '—'}</td>
                        <td className="table-td text-slate-500">{a.telephone || '—'}</td>
                        <td className="table-td">
                          {isDup(a)
                            ? <span className="text-xs text-amber-600 font-medium">⚠ Oui</span>
                            : <span className="text-xs text-green-600">✓ Non</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary + duplicate mode */}
          <div className="bg-slate-50 rounded-lg px-4 py-3 space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-slate-600">
                <span className="font-semibold text-navy">{valid.length}</span> lignes valides
              </span>
              <span className="text-green-600">
                <span className="font-semibold">{toAdd.length}</span> nouveaux agents
              </span>
              {dups.length > 0 && (
                <span className="text-amber-600">
                  <span className="font-semibold">{dups.length}</span> doublon(s) détecté(s)
                </span>
              )}
            </div>
            {dups.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-600">Gestion des doublons :</p>
                {[['skip', 'Ignorer les doublons (ne pas importer)'], ['update', 'Mettre à jour les agents existants']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="agentDupMode" value={val}
                      checked={dupMode === val} onChange={() => setDupMode(val)}
                      className="accent-primary-600" />
                    <span className="text-xs text-slate-600">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

const EquipeContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [agents,       setAgents]  = useLocalStorage(STORAGE_KEYS.agents,       [])
  const [reservations]             = useLocalStorage(STORAGE_KEYS.reservations,  [])
  const toast = useToast()

  const [profile,      setProfile]      = useState(null)
  const [formOpen,     setFormOpen]     = useState(false)
  const [showImport,   setShowImport]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search,       setSearch]       = useState('')

  /* ── per-agent reservations ── */
  const resasByAgent = useMemo(() => {
    const map = {}
    agents.forEach(a => { map[a.id] = [] })
    reservations.forEach(r => {
      if (map[r.agentId] !== undefined) map[r.agentId].push(r)
    })
    return map
  }, [agents, reservations])

  /* ── filtered agents ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return agents
    return agents.filter(a =>
      fuzzyMatch(a.nom, search) || fuzzyMatch(a.poste, search)
    )
  }, [agents, search])

  /* ── KPI ── */
  const kpi = useMemo(() => {
    const caTotal    = sumBy(agents, 'caRealise')
    const objTotal   = sumBy(agents, 'objectifMensuel')
    const avgTaux    = agents.length
      ? agents.reduce((s, a) => s + tauxRealisation(a), 0) / agents.length
      : 0
    const topAgent   = [...agents].sort((a, b) =>
      (parseFloat(b.caRealise) || 0) - (parseFloat(a.caRealise) || 0))[0]
    return { caTotal, objTotal, avgTaux, topAgent }
  }, [agents])

  /* ── CRUD ── */
  const handleSave = (form) => {
    if (editTarget?.id) {
      setAgents(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...form } : a))
      toast.success('Agent mis à jour')
    } else {
      const newA = { ...form, id: `age-${Date.now()}` }
      setAgents(prev => [...prev, newA])
      toast.success(`Agent "${newA.nom}" créé`)
    }
    setFormOpen(false)
    setEditTarget(null)
    // refresh profile if open
    if (profile && editTarget?.id === profile.id)
      setProfile(f => ({ ...f, ...form }))
  }

  const handleDelete = () => {
    setAgents(prev => prev.filter(a => a.id !== deleteTarget.id))
    toast.success('Agent supprimé')
    setDeleteTarget(null)
    if (profile?.id === deleteTarget.id) setProfile(null)
  }

  const openNew   = () => { setEditTarget(null); setFormOpen(true) }

  useEffect(() => {
    if (location.state?.openCreate) {
      openNew()
      navigate('/equipe', { replace: true, state: {} })
    }
  }, [location.state?.openCreate])
  const openEdit  = (a) => { setEditTarget(a);   setFormOpen(true) }

  const handleImportAgents = (newAgents, updatedAgents) => {
    setAgents(prev => {
      let list = [...prev]
      updatedAgents.forEach(upd => {
        const idx = list.findIndex(a => a.id === upd.id)
        if (idx >= 0) list[idx] = upd
      })
      return [...list, ...newAgents]
    })
    const msg = `${newAgents.length} agent(s) importé(s)${updatedAgents.length > 0 ? `, ${updatedAgents.length} mis à jour` : ''}.`
    toast.success(msg)
  }

  /* ── if profile open, show full view ── */
  if (profile) {
    const live = agents.find(a => a.id === profile.id) ?? profile
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <AgentProfile
          agent={live}
          agentResas={resasByAgent[live.id] ?? []}
          colorClass={avatarColor(live.id, agents)}
          onEdit={openEdit}
          onBack={() => setProfile(null)}
        />
        {formOpen && (
          <AgentForm
            initial={editTarget}
            onSave={handleSave}
            onClose={() => { setFormOpen(false); setEditTarget(null) }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Équipe & Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez votre équipe et suivez les performances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={FileSpreadsheet} onClick={() => setShowImport(true)}>Importer</Button>
          <Button icon={Plus} onClick={openNew}>Nouvel agent</Button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-50">
            <Users className="w-5 h-5 text-navy-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-navy-800">{agents.length}</div>
            <div className="text-xs text-gray-500">Agents</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-navy-800">{formatCurrency(kpi.caTotal)}</div>
            <div className="text-xs text-gray-500">CA total réalisé</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className={`text-xl font-bold ${kpi.avgTaux >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
              {kpi.avgTaux.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">Réalisation moyenne</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-navy-800 leading-tight">
              {kpi.topAgent?.nom?.split(' ')[0] ?? '—'}
            </div>
            <div className="text-xs text-gray-500">Meilleur CA</div>
            {kpi.topAgent && (
              <div className="text-xs text-gray-400">{formatCurrency(kpi.topAgent.caRealise)}</div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Performance chart ── */}
      {agents.length > 0 && <PerfChart agents={agents} />}

      {/* ── Search + grid ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <input
            className="input-field pl-9 py-2 text-sm"
            placeholder="Rechercher un agent…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
        <span className="text-xs text-gray-400">{filtered.length} agent(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-gray-400">
          <Users className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Aucun agent trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              colorClass={avatarColor(agent.id, agents)}
              resas={resasByAgent[agent.id] ?? []}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onView={setProfile}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {formOpen && (
        <AgentForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null) }}
        />
      )}

      {showImport && (
        <ImportAgentsModal
          existingAgents={agents}
          onImport={handleImportAgents}
          onClose={() => setShowImport(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Supprimer "${deleteTarget.nom}" ?`}
          message="Cet agent sera supprimé définitivement. Ses réservations seront conservées."
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export const EquipePage = () => {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <AccessDenied />
  return <EquipeContent />
}
