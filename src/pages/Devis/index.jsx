import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Plus, Search, X,
  Printer, Trash2, Edit2, Eye, RefreshCw, Send,
  CheckCircle, Clock, AlertTriangle, Download,
  FilePlus, TrendingDown, Building2,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { api } from '../../api/client'
import {
  STORAGE_KEYS,
  defaultSettings,
} from '../../utils/sampleData'
import {
  formatCurrency, formatDate, formatDateShort,
  generateQuoteRef, generateInvoiceRef,
  todayISO, addDays, isExpired, daysUntil,
  fuzzyMatch, sortByKey, sumBy,
} from '../../utils/formatters'
import {
  agencyInfoFromSettings, initialAgenceForDoc,
  isAgencyConfigured, resolveAgenceInfo,
} from '../../utils/agencyBilling'
import {
  Button, Card, Modal, ConfirmModal, Badge, SortIcon,
  DiscountPanel, PINModal, MarginIndicator,
} from '../../components/UI'

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const STATUTS_DEVIS = ['Brouillon', 'Envoyé', 'Converti', 'Expiré']
const STATUTS_FAC   = ['Brouillon', 'Envoyée', 'Payée', 'En retard']

const TVA_RATES = [0, 7, 10, 14, 20]

const STATUT_COLORS_DEVIS = {
  Brouillon: 'gray',
  Envoyé:    'blue',
  Converti:  'green',
  Expiré:    'red',
}
const STATUT_COLORS_FAC = {
  Brouillon:   'gray',
  Envoyée:     'blue',
  Payée:       'green',
  'En retard': 'red',
}

const EMPTY_LINE = { description: '', quantite: 1, prixUnitaire: 0, total: 0 }

const EMPTY_DEVIS = {
  clientId: '', clientNom: '', date: todayISO(),
  validiteJours: 15, statut: 'Brouillon',
  lignes: [{ ...EMPTY_LINE }],
  tva: 0, totalHT: 0, totalTTC: 0, notes: '',
  prixAchatTotal: '', remisePct: 0, remiseLabel: '',
  manualTriggers: {}, isManagerOverride: false,
}

const EMPTY_FAC = {
  clientId: '', clientNom: '', date: todayISO(),
  echeance: addDays(todayISO(), 30), devisId: null,
  statut: 'Brouillon',
  lignes: [{ ...EMPTY_LINE }],
  tva: 0, totalHT: 0, totalTTC: 0, notes: '',
  prixAchatTotal: '', remisePct: 0, remiseLabel: '',
  manualTriggers: {}, isManagerOverride: false,
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

const calcTotals = (lignes, tvaRate, remisePct = 0) => {
  const montantBrut = lignes.reduce((s, l) => s + (parseFloat(l.total) || 0), 0)
  const remise      = Math.round(montantBrut * (parseFloat(remisePct) || 0) / 100)
  const totalHT     = montantBrut - remise
  const tva         = Math.round(totalHT * (parseFloat(tvaRate) || 0) / 100)
  return { montantBrut, remise, totalHT, tva, totalTTC: totalHT + tva }
}

const expiryDate = (d) => d ? addDays(d.date, d.validiteJours) : null

const isDevisExpired = (d) =>
  d.statut !== 'Converti' && d.statut !== 'Expiré' && isExpired(expiryDate(d))

const isFacOverdue = (f) =>
  f.statut !== 'Payée' && f.statut !== 'Brouillon' && isExpired(f.echeance)

/* ─────────────────────────────────────────
   BADGE HELPER
───────────────────────────────────────── */

const StatutBadge = ({ statut, isDevis = true }) => {
  const map = isDevis ? STATUT_COLORS_DEVIS : STATUT_COLORS_FAC
  const color = map[statut] ?? 'gray'
  return <Badge variant={color} dot>{statut}</Badge>
}

/* ─────────────────────────────────────────
   AGENCE EXPLOITANTE (devis / factures)
───────────────────────────────────────── */

const AgencyInfoSection = ({ agence, onChange, onSyncSettings, settingsConfigured }) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-navy">Agence exploitante</p>
          <p className="text-xs text-slate-400">Pré-rempli depuis Paramètres · modifiable sur ce document</p>
        </div>
      </div>
      <Button type="button" variant="secondary" size="sm" icon={RefreshCw} onClick={onSyncSettings}>
        Actualiser depuis Paramètres
      </Button>
    </div>

    {!settingsConfigured && (
      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-800">
        Complétez les informations dans{' '}
        <Link to="/parametres" className="font-semibold underline hover:text-amber-900">
          Paramètres → Agence & Facturation
        </Link>
        {' '}pour le remplissage automatique des prochains documents.
      </div>
    )}

    <div className="p-4 space-y-3">
      {agence?.logo && (
        <img src={agence.logo} alt="Logo agence" className="h-14 object-contain rounded-lg border border-slate-100 p-1 bg-white" />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="label">Nom de l'agence *</label>
          <input className="input-field" value={agence?.nom ?? ''}
            onChange={e => onChange('nom', e.target.value)} placeholder="Nom commercial" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Adresse</label>
          <textarea className="input-field resize-none" rows={2} value={agence?.adresse ?? ''}
            onChange={e => onChange('adresse', e.target.value)} placeholder="Adresse complète" />
        </div>
        <div>
          <label className="label">Ville</label>
          <input className="input-field" value={agence?.ville ?? ''}
            onChange={e => onChange('ville', e.target.value)} placeholder="Casablanca, Essaouira…" />
        </div>
        <div>
          <label className="label">Téléphone</label>
          <input className="input-field" value={agence?.telephone ?? ''}
            onChange={e => onChange('telephone', e.target.value)} placeholder="+212 5XX XX XX XX" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={agence?.email ?? ''}
            onChange={e => onChange('email', e.target.value)} placeholder="contact@agence.ma" />
        </div>
        <div>
          <label className="label">Site web</label>
          <input className="input-field" value={agence?.siteWeb ?? ''}
            onChange={e => onChange('siteWeb', e.target.value)} placeholder="www.agence.ma" />
        </div>
        <div>
          <label className="label">ICE</label>
          <input className="input-field" value={agence?.iceNumber ?? ''}
            onChange={e => onChange('iceNumber', e.target.value)} placeholder="ICE-000000000000000" />
        </div>
        <div>
          <label className="label">Patente</label>
          <input className="input-field" value={agence?.patente ?? ''}
            onChange={e => onChange('patente', e.target.value)} placeholder="PAT-XXXXXX" />
        </div>
        <div>
          <label className="label">RC</label>
          <input className="input-field" value={agence?.rc ?? ''}
            onChange={e => onChange('rc', e.target.value)} placeholder="RC-XXXXXX" />
        </div>
        <div>
          <label className="label">IF</label>
          <input className="input-field" value={agence?.if ?? ''}
            onChange={e => onChange('if', e.target.value)} placeholder="IF-XXXXXX" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">CNSS</label>
          <input className="input-field" value={agence?.cnss ?? ''}
            onChange={e => onChange('cnss', e.target.value)} placeholder="CNSS-XXXXXX" />
        </div>
      </div>
    </div>
  </div>
)

/* ─────────────────────────────────────────
   LINE ITEM EDITOR
───────────────────────────────────────── */

const LineEditor = ({ lignes, onChange }) => {
  const updateLine = (idx, field, raw) => {
    const updated = lignes.map((l, i) => {
      if (i !== idx) return l
      const next = { ...l, [field]: raw }
      if (field === 'quantite' || field === 'prixUnitaire') {
        const q = parseFloat(field === 'quantite' ? raw : next.quantite) || 0
        const p = parseFloat(field === 'prixUnitaire' ? raw : next.prixUnitaire) || 0
        next.total = Math.round(q * p * 100) / 100
      }
      return next
    })
    onChange(updated)
  }

  const addLine = () => onChange([...lignes, { ...EMPTY_LINE }])

  const removeLine = (idx) => onChange(lignes.filter((_, i) => i !== idx))

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase px-1">
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-right">Qté</div>
        <div className="col-span-3 text-right">Prix unit.</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {lignes.map((line, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-center group">
          <input
            className="col-span-5 input-field text-sm"
            placeholder="Description de la prestation…"
            value={line.description}
            onChange={e => updateLine(idx, 'description', e.target.value)}
          />
          <input
            type="number" min="1"
            className="col-span-2 input-field text-sm text-right"
            value={line.quantite}
            onChange={e => updateLine(idx, 'quantite', e.target.value)}
          />
          <input
            type="number" min="0" step="0.01"
            className="col-span-3 input-field text-sm text-right"
            value={line.prixUnitaire}
            onChange={e => updateLine(idx, 'prixUnitaire', e.target.value)}
          />
          <div className="col-span-2 flex items-center justify-end gap-1">
            <span className="text-sm font-medium text-gray-700">
              {formatCurrency(line.total, '')}
            </span>
            {lignes.length > 1 && (
              <button
                type="button"
                onClick={() => removeLine(idx)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addLine}
        className="flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 font-medium mt-1 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ajouter une ligne
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────
   TOTALS BLOCK
───────────────────────────────────────── */

const TotalsBlock = ({ lignes, tvaRate, onTvaChange, remisePct = 0, remiseLabel = '' }) => {
  const { montantBrut, remise, totalHT, tva, totalTTC } = calcTotals(lignes, tvaRate, remisePct)
  return (
    <div className="mt-4 flex justify-end">
      <div className="w-80 space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Montant HT (brut)</span>
          <span className="font-medium">{formatCurrency(montantBrut)}</span>
        </div>
        {remisePct > 0 && (
          <>
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                Réduction {remiseLabel ? `(${remiseLabel})` : ''} — {remisePct}%
              </span>
              <span className="font-medium">− {formatCurrency(remise)}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-semibold">
              <span>Montant HT remisé</span>
              <span>{formatCurrency(totalHT)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-2">
            TVA
            <select
              value={tvaRate}
              onChange={e => onTvaChange(e.target.value)}
              className="text-xs border border-gray-200 rounded px-1 py-0.5"
            >
              {TVA_RATES.map(r => (
                <option key={r} value={r}>{r}%</option>
              ))}
            </select>
          </span>
          <span className="font-medium">{formatCurrency(tva)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-1.5 text-base font-bold text-navy-800">
          <span>Total TTC</span>
          <span className="text-navy-700">{formatCurrency(totalTTC)}</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   DEVIS FORM MODAL
───────────────────────────────────────── */

const DevisFormModal = ({ initial, clients, reservations, settings, onSave, onClose, onLogDerogation }) => {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() => ({
    ...(initial ?? { ...EMPTY_DEVIS, lignes: [{ ...EMPTY_LINE }] }),
    agence: initialAgenceForDoc(initial?.agence, settings),
  }))
  const [tvaRate, setTvaRate] = useState(() => {
    if (!initial) return 0
    const ht = initial.totalHT || 0
    if (!ht) return 0
    return Math.round(((initial.tva || 0) / ht) * 100)
  })
  const [remisePct,        setRemisePct]        = useState(initial?.remisePct        ?? 0)
  const [remiseLabel,      setRemiseLabel]      = useState(initial?.remiseLabel      ?? '')
  const [manualTriggers,   setManualTriggers]   = useState(initial?.manualTriggers   ?? {})
  const [isManagerOverride,setIsManagerOverride] = useState(initial?.isManagerOverride ?? false)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const setAgence = (field, value) => setForm(f => ({
    ...f,
    agence: { ...(f.agence || agencyInfoFromSettings(settings)), [field]: value },
  }))

  const syncAgenceFromSettings = () => {
    setForm(f => ({ ...f, agence: agencyInfoFromSettings(settings) }))
  }

  const agencyConfigured = isAgencyConfigured(settings)

  const handleClientChange = (val) => {
    const c = clients.find(cl => cl.nom === val || cl.id === val)
    if (c) set('clientId', c.id)
    set('clientNom', val)
  }

  const totalBrut = useMemo(
    () => form.lignes.reduce((s, l) => s + (parseFloat(l.total) || 0), 0),
    [form.lignes]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.clientNom.trim()) return
    if (form.lignes.some(l => !l.description.trim())) return
    const totals = calcTotals(form.lignes, tvaRate, remisePct)
    const saved = {
      ...form, ...totals,
      remisePct, remiseLabel, manualTriggers, isManagerOverride,
    }
    if (isManagerOverride) {
      onLogDerogation?.({
        ref:             saved.ref ?? (isEdit ? form.ref : '—'),
        clientNom:       form.clientNom,
        montantBrut:     totals.montantBrut,
        remiseDemandee:  remisePct,
        remiseAppliquee: remisePct,
        margePct:        (() => {
          const pa = parseFloat(form.prixAchatTotal) || 0
          if (!pa) return '—'
          const pf = totals.totalHT
          return pf > 0 ? (((pf - pa) / pf) * 100).toFixed(1) + '%' : '—'
        })(),
      })
    }
    onSave(saved)
  }

  return (
    <Modal
      title={isEdit ? `Modifier ${form.ref ?? 'devis'}` : 'Nouveau devis'}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Enregistrer' : 'Créer le devis'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AgencyInfoSection
          agence={form.agence}
          onChange={setAgence}
          onSyncSettings={syncAgenceFromSettings}
          settingsConfigured={agencyConfigured}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client *</label>
            <input
              className="input-field"
              list="clients-list-dev"
              value={form.clientNom}
              onChange={e => handleClientChange(e.target.value)}
              placeholder="Nom du client…"
              required
            />
            <datalist id="clients-list-dev">
              {clients.map(c => <option key={c.id} value={c.nom} />)}
            </datalist>
          </div>
          <div>
            <label className="label">Statut</label>
            <select
              className="input-field"
              value={form.statut}
              onChange={e => set('statut', e.target.value)}
            >
              {STATUTS_DEVIS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input-field" value={form.date}
              onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="label">Validité (jours)</label>
            <input type="number" min="1" className="input-field" value={form.validiteJours}
              onChange={e => set('validiteJours', parseInt(e.target.value) || 15)} />
          </div>
        </div>

        <div>
          <label className="label mb-2 block">Lignes de prestation *</label>
          <LineEditor
            lignes={form.lignes}
            onChange={lines => set('lignes', lines)}
          />
          <TotalsBlock
            lignes={form.lignes}
            tvaRate={tvaRate}
            onTvaChange={v => setTvaRate(parseFloat(v) || 0)}
            remisePct={remisePct}
            remiseLabel={remiseLabel}
          />
        </div>

        {/* Prix d'achat + Discount panel */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="label">Prix d'achat total (MAD)</label>
            <input
              type="number" min="0" step="1"
              className="input-field"
              placeholder="Coût fournisseur…"
              value={form.prixAchatTotal}
              onChange={e => set('prixAchatTotal', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Utilisé pour le calcul de marge (non visible sur le devis).</p>
          </div>
        </div>

        {form.clientId && totalBrut > 0 && (
          <DiscountPanel
            clientId={form.clientId}
            clients={clients}
            reservations={reservations}
            totalBrut={totalBrut}
            prixAchatTotal={form.prixAchatTotal}
            settings={settings}
            manualTriggers={manualTriggers}
            onManualChange={(key, val) => setManualTriggers(prev => ({ ...prev, [key]: val }))}
            onDiscountChange={({ pct, label, isManagerOverride: mo }) => {
              setRemisePct(pct)
              setRemiseLabel(label)
              setIsManagerOverride(mo)
            }}
          />
        )}

        <div>
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Conditions, remarques…" />
        </div>
      </form>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   FACTURE FORM MODAL
───────────────────────────────────────── */

const FactureFormModal = ({ initial, clients, reservations, settings, onSave, onClose, onLogDerogation }) => {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() => ({
    ...(initial ?? { ...EMPTY_FAC, lignes: [{ ...EMPTY_LINE }] }),
    agence: initialAgenceForDoc(initial?.agence, settings),
  }))
  const [tvaRate, setTvaRate] = useState(() => {
    if (!initial) return 0
    const ht = initial.totalHT || 0
    if (!ht) return 0
    return Math.round(((initial.tva || 0) / ht) * 100)
  })
  const [remisePct,        setRemisePct]        = useState(initial?.remisePct        ?? 0)
  const [remiseLabel,      setRemiseLabel]      = useState(initial?.remiseLabel      ?? '')
  const [manualTriggers,   setManualTriggers]   = useState(initial?.manualTriggers   ?? {})
  const [isManagerOverride,setIsManagerOverride] = useState(initial?.isManagerOverride ?? false)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const setAgence = (field, value) => setForm(f => ({
    ...f,
    agence: { ...(f.agence || agencyInfoFromSettings(settings)), [field]: value },
  }))

  const syncAgenceFromSettings = () => {
    setForm(f => ({ ...f, agence: agencyInfoFromSettings(settings) }))
  }

  const agencyConfigured = isAgencyConfigured(settings)

  const handleClientChange = (val) => {
    const c = clients.find(cl => cl.nom === val || cl.id === val)
    if (c) set('clientId', c.id)
    set('clientNom', val)
  }

  const totalBrut = useMemo(
    () => form.lignes.reduce((s, l) => s + (parseFloat(l.total) || 0), 0),
    [form.lignes]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.clientNom.trim()) return
    if (form.lignes.some(l => !l.description.trim())) return
    const totals = calcTotals(form.lignes, tvaRate, remisePct)
    const saved = {
      ...form, ...totals,
      remisePct, remiseLabel, manualTriggers, isManagerOverride,
    }
    if (isManagerOverride) {
      onLogDerogation?.({
        ref:             saved.ref ?? (isEdit ? form.ref : '—'),
        clientNom:       form.clientNom,
        montantBrut:     totals.montantBrut,
        remiseDemandee:  remisePct,
        remiseAppliquee: remisePct,
        margePct:        (() => {
          const pa = parseFloat(form.prixAchatTotal) || 0
          if (!pa) return '—'
          const pf = totals.totalHT
          return pf > 0 ? (((pf - pa) / pf) * 100).toFixed(1) + '%' : '—'
        })(),
      })
    }
    onSave(saved)
  }

  return (
    <Modal
      title={isEdit ? `Modifier ${form.ref ?? 'facture'}` : 'Nouvelle facture'}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Enregistrer' : 'Créer la facture'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AgencyInfoSection
          agence={form.agence}
          onChange={setAgence}
          onSyncSettings={syncAgenceFromSettings}
          settingsConfigured={agencyConfigured}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client *</label>
            <input
              className="input-field"
              list="clients-list-fac"
              value={form.clientNom}
              onChange={e => handleClientChange(e.target.value)}
              placeholder="Nom du client…"
              required
            />
            <datalist id="clients-list-fac">
              {clients.map(c => <option key={c.id} value={c.nom} />)}
            </datalist>
          </div>
          <div>
            <label className="label">Statut</label>
            <select
              className="input-field"
              value={form.statut}
              onChange={e => set('statut', e.target.value)}
            >
              {STATUTS_FAC.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date de facturation</label>
            <input type="date" className="input-field" value={form.date}
              onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="label">Date d'échéance</label>
            <input type="date" className="input-field" value={form.echeance}
              onChange={e => set('echeance', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label mb-2 block">Lignes de prestation *</label>
          <LineEditor
            lignes={form.lignes}
            onChange={lines => set('lignes', lines)}
          />
          <TotalsBlock
            lignes={form.lignes}
            tvaRate={tvaRate}
            onTvaChange={v => setTvaRate(parseFloat(v) || 0)}
            remisePct={remisePct}
            remiseLabel={remiseLabel}
          />
        </div>

        {/* Prix d'achat + Discount panel */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="label">Prix d'achat total (MAD)</label>
            <input
              type="number" min="0" step="1"
              className="input-field"
              placeholder="Coût fournisseur…"
              value={form.prixAchatTotal}
              onChange={e => set('prixAchatTotal', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Utilisé pour le calcul de marge (non visible sur la facture).</p>
          </div>
        </div>

        {form.clientId && totalBrut > 0 && (
          <DiscountPanel
            clientId={form.clientId}
            clients={clients}
            reservations={reservations}
            totalBrut={totalBrut}
            prixAchatTotal={form.prixAchatTotal}
            settings={settings}
            manualTriggers={manualTriggers}
            onManualChange={(key, val) => setManualTriggers(prev => ({ ...prev, [key]: val }))}
            onDiscountChange={({ pct, label, isManagerOverride: mo }) => {
              setRemisePct(pct)
              setRemiseLabel(label)
              setIsManagerOverride(mo)
            }}
          />
        )}

        <div>
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Conditions de paiement, remarques…" />
        </div>
      </form>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   PRINT MODAL
───────────────────────────────────────── */

const PrintModal = ({ doc, isDevis, settings, onClose }) => {
  const expDate = isDevis ? expiryDate(doc) : null
  const ref = useRef(null)
  const agence = resolveAgenceInfo(doc.agence, settings)

  const fiscalParts = [
    agence.iceNumber && `ICE : ${agence.iceNumber}`,
    agence.rc && `RC : ${agence.rc}`,
    agence.patente && `Patente : ${agence.patente}`,
    agence.if && `IF : ${agence.if}`,
    agence.cnss && `CNSS : ${agence.cnss}`,
  ].filter(Boolean)

  const handlePrint = () => {
    const content = ref.current?.innerHTML
    if (!content) return
    const w = window.open('', '_blank', 'width=900,height=700')
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${doc.ref}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; padding: 30px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
          .agency-name { font-size: 22px; font-weight: 700; color: #1a3a5c; }
          .agency-info { font-size: 11px; color: #555; margin-top: 4px; line-height: 1.6; }
          .doc-title { text-align: right; }
          .doc-ref { font-size: 20px; font-weight: 700; color: #1a3a5c; }
          .doc-date { font-size: 11px; color: #666; margin-top: 4px; }
          .divider { border: none; border-top: 2px solid #1a3a5c; margin: 16px 0; }
          .client-block { background: #f8f9fa; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; }
          .client-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .client-name { font-size: 15px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1a3a5c; color: white; padding: 9px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
          th:last-child, td:last-child { text-align: right; }
          th:nth-child(2), td:nth-child(2), th:nth-child(3), td:nth-child(3) { text-align: right; }
          td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 12px; }
          tr:last-child td { border-bottom: none; }
          .totals { margin-left: auto; width: 260px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #444; }
          .totals-total { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; font-weight: 700; color: #1a3a5c; border-top: 2px solid #1a3a5c; margin-top: 4px; }
          .notes { margin-top: 24px; padding: 12px 16px; background: #f8f9fa; border-left: 3px solid #1a3a5c; font-size: 12px; color: #555; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          .validity { margin-top: 8px; font-size: 11px; color: #555; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 400)
  }

  return (
    <Modal
      title={`Aperçu — ${doc.ref}`}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button icon={Printer} onClick={handlePrint}>Imprimer / PDF</Button>
        </>
      }
    >
      <div ref={ref} className="bg-white p-8 text-sm text-gray-800 space-y-6 print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            {agence.logo && (
              <img
                src={agence.logo}
                alt="Logo agence"
                style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0, borderRadius: 6 }}
              />
            )}
            <div>
              <div className="text-xl font-bold text-navy-800">{agence.nom || 'Agence de voyage'}</div>
              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                {agence.adresse && <>{agence.adresse}<br /></>}
                {(agence.ville || agence.telephone || agence.email) && (
                  <>
                    {[agence.ville, agence.telephone, agence.email].filter(Boolean).join(' · ')}
                    <br />
                  </>
                )}
                {agence.siteWeb && <span>{agence.siteWeb}<br /></span>}
                {fiscalParts.length > 0 && (
                  <span className="text-[10px] text-gray-400">{fiscalParts.join(' · ')}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-navy-700">
              {isDevis ? 'DEVIS' : 'FACTURE'}
            </div>
            <div className="text-2xl font-bold text-navy-800 mt-0.5">{doc.ref}</div>
            <div className="text-xs text-gray-500 mt-1">
              Date : {formatDate(doc.date)}<br />
              {isDevis
                ? <span>Validité : {doc.validiteJours} jours (exp. {formatDate(expDate)})</span>
                : <span>Échéance : {formatDate(doc.echeance)}</span>
              }
            </div>
          </div>
        </div>

        <hr className="border-navy-800 border-t-2" />

        {/* Client */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Destinataire</div>
          <div className="text-base font-semibold">{doc.clientNom}</div>
          {doc.devisId && (
            <div className="text-xs text-gray-500 mt-1">Réf. devis : {doc.devisId}</div>
          )}
        </div>

        {/* Lines table */}
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-navy-800 text-white">
              <th className="text-left py-2 px-3 rounded-tl-md">Description</th>
              <th className="text-right py-2 px-3">Qté</th>
              <th className="text-right py-2 px-3">Prix unit.</th>
              <th className="text-right py-2 px-3 rounded-tr-md">Total</th>
            </tr>
          </thead>
          <tbody>
            {doc.lignes.map((l, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-3">{l.description}</td>
                <td className="py-2 px-3 text-right">{l.quantite}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(l.prixUnitaire)}</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Total HT</span>
              <span className="font-medium">{formatCurrency(doc.totalHT)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA</span>
              <span className="font-medium">{formatCurrency(doc.tva)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-navy-800 pt-2 text-sm font-bold text-navy-800">
              <span>Total TTC</span>
              <span>{formatCurrency(doc.totalTTC)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {doc.notes && (
          <div className="bg-gray-50 border-l-4 border-navy-700 pl-3 py-2 text-xs text-gray-600 rounded-r">
            <span className="font-semibold">Note : </span>{doc.notes}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-6">
          {[agence.nom, agence.adresse, agence.telephone].filter(Boolean).join(' — ')}
          {fiscalParts.length > 0 && (
            <div className="mt-1">{fiscalParts.join(' — ')}</div>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   KPI STRIP
───────────────────────────────────────── */

const KpiStrip = ({ items }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {items.map(({ label, value, sub, color = 'text-navy-700', icon: Icon }) => (
      <Card key={label} className="flex items-center gap-3 p-4">
        {Icon && (
          <div className="p-2 rounded-lg bg-navy-50 flex-shrink-0">
            <Icon className="w-5 h-5 text-navy-600" />
          </div>
        )}
        <div className="min-w-0">
          <div className={`text-lg font-bold truncate ${color}`}>{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
          {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
      </Card>
    ))}
  </div>
)

/* ─────────────────────────────────────────
   DEVIS TABLE
───────────────────────────────────────── */

const DevisTable = ({
  rows, sortCol, sortDir, onSort,
  onView, onEdit, onDelete, onConvert, onSend,
}) => {
  const cols = [
    { key: 'ref',       label: 'Référence' },
    { key: 'clientNom', label: 'Client' },
    { key: 'date',      label: 'Date' },
    { key: 'expiry',    label: 'Expiration' },
    { key: 'totalTTC',  label: 'Montant TTC', align: 'right' },
    { key: 'statut',    label: 'Statut' },
    { key: 'actions',   label: '' },
  ]

  if (!rows.length) {
    return (
      <div className="py-16 flex flex-col items-center text-gray-400">
        <FileText className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-medium text-sm">Aucun devis trouvé</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {cols.map(c => (
              <th
                key={c.key}
                className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
                  ${c.align === 'right' ? 'text-right' : 'text-left'}
                  ${c.key !== 'actions' && c.key !== 'expiry' ? 'cursor-pointer hover:text-gray-700 select-none' : ''}
                `}
                onClick={c.key !== 'actions' && c.key !== 'expiry' ? () => onSort(c.key) : undefined}
              >
                <span className="inline-flex items-center">
                  {c.label}
                  {c.key !== 'actions' && c.key !== 'expiry' && (
                    <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(d => {
            const exp = expiryDate(d)
            const expired = isDevisExpired(d)
            const daysLeft = exp ? daysUntil(exp) : null

            return (
              <tr
                key={d.id}
                className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                onClick={() => onView(d)}
              >
                <td className="px-4 py-3 font-mono text-xs text-navy-700 font-semibold">
                  {d.ref}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{d.clientNom}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(d.date)}</td>
                <td className="px-4 py-3">
                  {exp ? (
                    <span className={`text-xs ${expired ? 'text-red-600 font-semibold' : daysLeft <= 3 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                      {expired
                        ? `Expiré (${formatDate(exp)})`
                        : daysLeft === 0
                          ? "Expire aujourd'hui"
                          : `${formatDateShort(exp)} (J-${daysLeft})`
                      }
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                  {formatCurrency(d.totalTTC)}
                </td>
                <td className="px-4 py-3">
                  <StatutBadge statut={d.statut} isDevis />
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.statut === 'Brouillon' && (
                      <button
                        title="Marquer comme envoyé"
                        onClick={() => onSend(d)}
                        className="p-1.5 rounded hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(d.statut === 'Envoyé' || d.statut === 'Brouillon') && (
                      <button
                        title="Convertir en facture"
                        onClick={() => onConvert(d)}
                        className="p-1.5 rounded hover:bg-green-100 text-green-500 hover:text-green-700 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      title="Aperçu"
                      onClick={() => onView(d)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Modifier"
                      onClick={() => onEdit(d)}
                      className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Supprimer"
                      onClick={() => onDelete(d)}
                      className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────
   FACTURE TABLE
───────────────────────────────────────── */

const FactureTable = ({
  rows, sortCol, sortDir, onSort,
  onView, onEdit, onDelete, onMarkPaid,
}) => {
  const cols = [
    { key: 'ref',       label: 'Référence' },
    { key: 'clientNom', label: 'Client' },
    { key: 'date',      label: 'Date' },
    { key: 'echeance',  label: 'Échéance' },
    { key: 'totalTTC',  label: 'Montant TTC', align: 'right' },
    { key: 'statut',    label: 'Statut' },
    { key: 'actions',   label: '' },
  ]

  if (!rows.length) {
    return (
      <div className="py-16 flex flex-col items-center text-gray-400">
        <FileText className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-medium text-sm">Aucune facture trouvée</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {cols.map(c => (
              <th
                key={c.key}
                className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
                  ${c.align === 'right' ? 'text-right' : 'text-left'}
                  ${c.key !== 'actions' ? 'cursor-pointer hover:text-gray-700 select-none' : ''}
                `}
                onClick={c.key !== 'actions' ? () => onSort(c.key) : undefined}
              >
                <span className="inline-flex items-center">
                  {c.label}
                  {c.key !== 'actions' && (
                    <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(f => {
            const overdue = isFacOverdue(f)
            const daysLeft = daysUntil(f.echeance)

            return (
              <tr
                key={f.id}
                className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                onClick={() => onView(f)}
              >
                <td className="px-4 py-3">
                  <div className="font-mono text-xs text-navy-700 font-semibold">{f.ref}</div>
                  {f.devisId && (
                    <div className="text-xs text-gray-400 mt-0.5">→ {f.devisId}</div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{f.clientNom}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(f.date)}</td>
                <td className="px-4 py-3">
                  {f.echeance ? (
                    <span className={`text-xs ${
                      overdue
                        ? 'text-red-600 font-semibold'
                        : f.statut !== 'Payée' && daysLeft !== null && daysLeft <= 3
                          ? 'text-amber-600 font-medium'
                          : 'text-gray-500'
                    }`}>
                      {formatDate(f.echeance)}
                      {overdue && ' ⚠'}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                  {formatCurrency(f.totalTTC)}
                </td>
                <td className="px-4 py-3">
                  <StatutBadge statut={f.statut} isDevis={false} />
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {f.statut !== 'Payée' && (
                      <button
                        title="Marquer comme payée"
                        onClick={() => onMarkPaid(f)}
                        className="p-1.5 rounded hover:bg-green-100 text-green-500 hover:text-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      title="Aperçu"
                      onClick={() => onView(f)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Modifier"
                      onClick={() => onEdit(f)}
                      className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Supprimer"
                      onClick={() => onDelete(f)}
                      className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

export const DevisPage = () => {
  const [devis,       setDevis]       = useLocalStorage(STORAGE_KEYS.devis,       [])
  const [factures,    setFactures]    = useLocalStorage(STORAGE_KEYS.factures,    [])
  const [clients]                     = useLocalStorage(STORAGE_KEYS.clients,     [])
  const [reservations]                = useLocalStorage(STORAGE_KEYS.reservations,[])
  const [settings]                    = useLocalStorage(STORAGE_KEYS.settings,    defaultSettings)
  const [derogations, setDerogations] = useLocalStorage(STORAGE_KEYS.derogations, [])
  const toast = useToast()

  const handleLogDerogation = useCallback((entry) => {
    setDerogations(prev => [{
      id:   `der-${Date.now()}`,
      date: todayISO(),
      ...entry,
    }, ...prev])
  }, [setDerogations])

  /* ── tab ── */
  const [tab, setTab] = useState('devis')
  const isDevisTab = tab === 'devis'

  /* ── filters ── */
  const [search,  setSearch]  = useState('')
  const [statut,  setStatut]  = useState('')
  const [month,   setMonth]   = useState('')
  const [sortCol, setSortCol] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  /* ── modals ── */
  const [formOpen,    setFormOpen]    = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [printTarget, setPrintTarget] = useState(null)
  const [deleteTarget,setDeleteTarget]= useState(null)

  /* ── sort handler ── */
  const handleSort = useCallback((col) => {
    setSortCol(prev => {
      if (prev === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
      else setSortDir('asc')
      return col
    })
  }, [])

  /* ── auto-expire stale devis ── */
  const autoExpireDevis = useCallback((list) =>
    list.map(d =>
      isDevisExpired(d) ? { ...d, statut: 'Expiré' } : d
    ), [])

  /* ── filtered devis ── */
  const filteredDevis = useMemo(() => {
    let list = autoExpireDevis(devis)
    if (search) list = list.filter(d =>
      fuzzyMatch(d.ref, search) || fuzzyMatch(d.clientNom, search))
    if (statut) list = list.filter(d => d.statut === statut)
    if (month)  list = list.filter(d => d.date?.startsWith(month))
    return sortByKey(list, sortCol, sortDir)
  }, [devis, search, statut, month, sortCol, sortDir, autoExpireDevis])

  /* ── auto-overdue factures ── */
  const autoOverdueFactures = useCallback((list) =>
    list.map(f =>
      isFacOverdue(f) ? { ...f, statut: 'En retard' } : f
    ), [])

  /* ── filtered factures ── */
  const filteredFactures = useMemo(() => {
    let list = autoOverdueFactures(factures)
    if (search) list = list.filter(f =>
      fuzzyMatch(f.ref, search) || fuzzyMatch(f.clientNom, search))
    if (statut) list = list.filter(f => f.statut === statut)
    if (month)  list = list.filter(f => f.date?.startsWith(month))
    return sortByKey(list, sortCol, sortDir)
  }, [factures, search, statut, month, sortCol, sortDir, autoOverdueFactures])

  /* ── month options ── */
  const monthOptions = useMemo(() => {
    const src = isDevisTab ? devis : factures
    const months = [...new Set(src.map(d => d.date?.slice(0, 7)).filter(Boolean))].sort().reverse()
    return months
  }, [isDevisTab, devis, factures])

  /* ── KPI ── */
  const devisKpi = useMemo(() => {
    const all = autoExpireDevis(devis)
    const converted = all.filter(d => d.statut === 'Converti')
    const pending   = all.filter(d => d.statut === 'Envoyé')
    const expired   = all.filter(d => d.statut === 'Expiré')
    return [
      { icon: FileText,    label: 'Total devis',    value: all.length },
      { icon: CheckCircle, label: 'Convertis',       value: converted.length, color: 'text-green-600' },
      { icon: Send,        label: 'En attente',      value: pending.length,   color: 'text-blue-600' },
      { icon: AlertTriangle,label:'Expirés',         value: expired.length,   color: expired.length ? 'text-red-600' : 'text-gray-500' },
    ]
  }, [devis, autoExpireDevis])

  const facturesKpi = useMemo(() => {
    const all     = autoOverdueFactures(factures)
    const paid    = all.filter(f => f.statut === 'Payée')
    const overdue = all.filter(f => f.statut === 'En retard')
    const pending = all.filter(f => f.statut === 'Envoyée')
    const totalDue= sumBy(all.filter(f => f.statut !== 'Payée'), 'totalTTC')
    return [
      { icon: FileText,    label: 'Total factures',  value: all.length },
      { icon: CheckCircle, label: 'Payées',           value: paid.length,    color: 'text-green-600' },
      { icon: Clock,       label: 'En attente',       value: pending.length, color: 'text-blue-600' },
      { icon: AlertTriangle,label:'En retard',        value: overdue.length, color: overdue.length ? 'text-red-600' : 'text-gray-500' },
    ]
  }, [factures, autoOverdueFactures])

  /* ── CRUD ── */
  const handleSaveDevis = (form) => {
    if (editTarget?.id) {
      setDevis(prev => prev.map(d => d.id === editTarget.id ? { ...d, ...form } : d))
      toast.success('Devis mis à jour')
    } else {
      const seq = devis.length + 1
      const newD = {
        ...form,
        id:  `dev-${Date.now()}`,
        ref: generateQuoteRef(seq),
      }
      setDevis(prev => [newD, ...prev])
      toast.success(`Devis ${newD.ref} créé`)
    }
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleSaveFacture = (form) => {
    if (editTarget?.id) {
      setFactures(prev => prev.map(f => f.id === editTarget.id ? { ...f, ...form } : f))
      toast.success('Facture mise à jour')
    } else {
      const seq = factures.length + 1
      const newF = {
        ...form,
        id:  `fac-${Date.now()}`,
        ref: generateInvoiceRef(seq),
      }
      setFactures(prev => [newF, ...prev])
      toast.success(`Facture ${newF.ref} créée`)
    }
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleDeleteDevis = () => {
    setDevis(prev => prev.filter(d => d.id !== deleteTarget.id))
    toast.success('Devis supprimé')
    setDeleteTarget(null)
  }

  const handleDeleteFacture = () => {
    setFactures(prev => prev.filter(f => f.id !== deleteTarget.id))
    toast.success('Facture supprimée')
    setDeleteTarget(null)
  }

  const handleConvertToFacture = (d) => {
    const seq = factures.length + 1
    const newFac = {
      id:        `fac-${Date.now()}`,
      ref:       generateInvoiceRef(seq),
      devisId:   d.ref,
      clientId:  d.clientId,
      clientNom: d.clientNom,
      agence:    d.agence ? { ...d.agence } : agencyInfoFromSettings(settings),
      date:      todayISO(),
      echeance:  addDays(todayISO(), 30),
      statut:    'Brouillon',
      lignes:    d.lignes.map(l => ({ ...l })),
      totalHT:   d.totalHT,
      tva:       d.tva,
      totalTTC:  d.totalTTC,
      notes:     d.notes,
    }
    setFactures(prev => [newFac, ...prev])
    setDevis(prev => prev.map(x => x.id === d.id ? { ...x, statut: 'Converti' } : x))
    toast.success(`Converti en facture ${newFac.ref}`)
    setTab('factures')
  }

  const handleSendDevis = async (d) => {
    try {
      const result = await api.sendDevis(d.id)
      setDevis(prev => prev.map(x => x.id === d.id ? { ...x, statut: 'Envoyé' } : x))
      if (result.sent) {
        toast.success(`${d.ref} envoyé par email à ${result.to}`)
      } else if (result.mailto) {
        window.open(result.mailto, '_blank')
        toast.success(`${d.ref} marqué comme envoyé — client email ouvert`)
      } else {
        toast.success(`${d.ref} marqué comme envoyé`)
      }
    } catch (err) {
      toast.error(err.message || "Envoi impossible")
    }
  }

  const handleMarkPaid = (f) => {
    setFactures(prev => prev.map(x => x.id === f.id ? { ...x, statut: 'Payée' } : x))
    toast.success(`${f.ref} marquée comme payée`)
  }

  /* ── open form ── */
  const openNew   = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit  = (doc) => { setEditTarget(doc); setFormOpen(true) }

  /* ── tab switch resets filters ── */
  const switchTab = (t) => {
    setTab(t)
    setSearch('')
    setStatut('')
    setMonth('')
    setSortCol('date')
    setSortDir('desc')
  }

  /* ── statut options ── */
  const statutOptions = isDevisTab ? STATUTS_DEVIS : STATUTS_FAC

  /* ── CSV export ── */
  const exportCSV = () => {
    const rows = isDevisTab ? filteredDevis : filteredFactures
    const headers = isDevisTab
      ? ['Référence', 'Client', 'Date', 'Validité (j)', 'Statut', 'Total HT', 'TVA', 'Total TTC']
      : ['Référence', 'Client', 'Date', 'Échéance', 'Statut', 'Total HT', 'TVA', 'Total TTC', 'Devis']
    const csvRows = rows.map(r => isDevisTab
      ? [r.ref, r.clientNom, r.date, r.validiteJours, r.statut, r.totalHT, r.tva, r.totalTTC]
      : [r.ref, r.clientNom, r.date, r.echeance, r.statut, r.totalHT, r.tva, r.totalTTC, r.devisId ?? '']
    )
    const csv = [headers, ...csvRows].map(r => r.join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `${isDevisTab ? 'devis' : 'factures'}-${todayISO()}.csv`
    a.click()
  }

  const clearFilters = () => { setSearch(''); setStatut(''); setMonth('') }
  const hasFilters = search || statut || month

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* ── page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Devis & Factures</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez vos devis et factures clients</p>
        </div>
        <Button icon={Plus} onClick={openNew}>
          {isDevisTab ? 'Nouveau devis' : 'Nouvelle facture'}
        </Button>
      </div>

      {/* ── tabs ── */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {[
          { key: 'devis',    label: 'Devis',    count: devis.length,    icon: FileText },
          { key: 'factures', label: 'Factures', count: factures.length, icon: FilePlus  },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === t.key
                ? 'border-navy-600 text-navy-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
              ${tab === t.key ? 'bg-navy-100 text-navy-700' : 'bg-gray-100 text-gray-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── KPI strip ── */}
      <KpiStrip items={isDevisTab ? devisKpi : facturesKpi} />

      {/* ── toolbar ── */}
      <Card noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          {/* search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Rechercher (réf, client)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* statut */}
          <select
            className="input-field py-2 text-sm min-w-36"
            value={statut}
            onChange={e => setStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {statutOptions.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* month */}
          <select
            className="input-field py-2 text-sm min-w-36"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            <option value="">Tous les mois</option>
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {hasFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
              Réinitialiser
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {isDevisTab ? filteredDevis.length : filteredFactures.length} résultat(s)
            </span>
            <Button variant="secondary" size="sm" icon={Download} onClick={exportCSV}>
              CSV
            </Button>
          </div>
        </div>

        {/* ── table ── */}
        {isDevisTab ? (
          <DevisTable
            rows={filteredDevis}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            onView={setPrintTarget}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onConvert={handleConvertToFacture}
            onSend={handleSendDevis}
          />
        ) : (
          <FactureTable
            rows={filteredFactures}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            onView={setPrintTarget}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onMarkPaid={handleMarkPaid}
          />
        )}
      </Card>

      {/* ── modals ── */}

      {formOpen && isDevisTab && (
        <DevisFormModal
          initial={editTarget}
          clients={clients}
          reservations={reservations}
          settings={settings}
          onSave={handleSaveDevis}
          onClose={() => { setFormOpen(false); setEditTarget(null) }}
          onLogDerogation={handleLogDerogation}
        />
      )}

      {formOpen && !isDevisTab && (
        <FactureFormModal
          initial={editTarget}
          clients={clients}
          reservations={reservations}
          settings={settings}
          onSave={handleSaveFacture}
          onClose={() => { setFormOpen(false); setEditTarget(null) }}
          onLogDerogation={handleLogDerogation}
        />
      )}

      {printTarget && (
        <PrintModal
          doc={printTarget}
          isDevis={isDevisTab}
          settings={settings}
          onClose={() => setPrintTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Supprimer ${deleteTarget.ref} ?`}
          message="Cette action est irréversible."
          confirmLabel="Supprimer"
          onConfirm={isDevisTab ? handleDeleteDevis : handleDeleteFacture}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
