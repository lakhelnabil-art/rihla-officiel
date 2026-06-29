import React, { useState, useMemo, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { useAuth } from '../../context/AuthContext'
import { AccessDenied } from '../../components/UI'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart,
} from 'recharts'
import {
  Plus, Search, Edit2, Trash2, TrendingUp, TrendingDown,
  Wallet, Clock, Download, X, Link2, FileSpreadsheet, Receipt, TrendingUp as Forecast,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS } from '../../utils/sampleData'
import {
  formatCurrency, formatDate, getMonthLabel, todayISO,
  fuzzyMatch, sortByKey, sumBy,
} from '../../utils/formatters'
import { applyAcompteFromFinances } from '../../utils/financeSync'
import {
  Button, Card, KpiCard, Modal, ConfirmModal,
  Badge, StatusBadge, Pagination, SortIcon,
} from '../../components/UI'

/* ─── constants ─── */
const TYPES      = ['Encaissement', 'Dépense']
const STATUTS    = ['Payé', 'En attente']
const CATEGORIES = ['Ventes', 'Salaires', 'Charges fixes', 'Charges variables', 'Marketing', 'Autres']

/* Taux de TVA marocains (%) — aligné sur le module Devis */
const TVA_RATES = [0, 7, 10, 14, 20]

/* Palette alignée sur la charte Rihla (teal #0E8C7F, amber #F4A24C) */
const BRAND = { teal: '#0E8C7F', amber: '#F4A24C', green: '#10b981', red: '#ef4444' }
const CAT_COLORS = {
  Ventes:              '#0E8C7F',
  Salaires:            '#6366f1',
  'Charges fixes':     '#ef4444',
  'Charges variables': '#F4A24C',
  Marketing:           '#10b981',
  Autres:              '#94a3b8',
}

const PER_PAGE = 12

const PAYMENT_TYPES = ['Acompte', 'Solde', 'Remboursement', 'Autre']
const PAYMENT_MODES = ['Espèces', 'Virement', 'Chèque', 'Carte bancaire']

/* ─── TVA helpers — `montant` stocké en TTC (flux de trésorerie réel) ─── */
const tvaRateOf = (t) => parseFloat(t?.tvaRate) || 0
const htOf      = (ttc, rate) => (parseFloat(ttc) || 0) / (1 + (parseFloat(rate) || 0) / 100)
const tvaOf     = (ttc, rate) => (parseFloat(ttc) || 0) - htOf(ttc, rate)
const sumTvaBy  = (arr) => arr.reduce((s, t) => s + tvaOf(t.montant, tvaRateOf(t)), 0)
const sumHtBy   = (arr) => arr.reduce((s, t) => s + htOf(t.montant, tvaRateOf(t)), 0)

const EMPTY_FORM = {
  date: todayISO(), libelle: '', type: 'Encaissement',
  montant: '', statut: 'Payé', categorie: 'Ventes', notes: '',
  paymentType: '', modePaiement: '', tvaRate: 20,
  reservationId: '', reservationRef: '', clientId: '', clientNom: '',
  factureId: '', factureRef: '',
}

/* ─── Réconciliation factures ↔ encaissements ─── */
const REGLEMENT_BADGE = {
  'Soldée':     'success',
  'Partielle':  'warning',
  'Non réglée': 'danger',
  'Trop-perçu': 'info',
}
/** Pour chaque facture : encaissé (payé), en attente, reste, état de règlement. */
const reconcileFactures = (factures, finances) =>
  factures.map(fac => {
    const linked    = finances.filter(f => f.type === 'Encaissement' && f.factureId === fac.id)
    const encaisse  = sumBy(linked.filter(f => f.statut === 'Payé'), 'montant')
    const enAttente = sumBy(linked.filter(f => f.statut === 'En attente'), 'montant')
    const ttc       = parseFloat(fac.totalTTC) || 0
    const reste     = Math.round((ttc - encaisse) * 100) / 100
    const regl =
      encaisse <= 0      ? 'Non réglée' :
      reste > 0.005      ? 'Partielle'  :
      reste < -0.005     ? 'Trop-perçu' : 'Soldée'
    return { ...fac, ttc, encaisse, enAttente, reste, regl, nbPaiements: linked.length }
  })

/* ─── chart tooltip ─── */
const ChartTooltip = ({ active, payload, label, currency = 'MAD' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name} :</span>
          <span className="font-medium text-slate-700">{formatCurrency(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════
   TRANSACTION FORM MODAL
════════════════════════════════════════════════ */
const TransactionForm = ({ form, setForm, currency, reservations, facturesRecon, onSave, onClose, isEdit }) => {
  const f = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), [setForm])

  const handleFactureLink = (facId) => {
    if (!facId) {
      setForm(p => ({ ...p, factureId: '', factureRef: '' }))
      return
    }
    const fac = facturesRecon.find(x => x.id === facId)
    if (!fac) return
    const reste = Math.max(0, fac.reste)
    setForm(p => ({
      ...p,
      factureId:  fac.id,
      factureRef: fac.ref,
      type:       'Encaissement',
      categorie:  p.categorie === 'Ventes' ? 'Ventes' : p.categorie,
      clientId:   p.clientId  || fac.clientId  || '',
      clientNom:  p.clientNom || fac.clientNom || '',
      libelle:    p.libelle   || `Règlement ${fac.ref} — ${fac.clientNom || ''}`.trim(),
      montant:    p.montant   || (reste > 0 ? String(Math.round(reste)) : String(fac.ttc || '')),
    }))
  }

  const handleReservationLink = (resId) => {
    if (!resId) {
      setForm(p => ({ ...p, reservationId: '', reservationRef: '', clientId: '', clientNom: '' }))
      return
    }
    const res = reservations.find(r => r.id === resId)
    if (!res) return
    const solde = Math.max(0, (parseFloat(res.montant) || 0) - (parseFloat(res.acompte) || 0))
    setForm(p => ({
      ...p,
      reservationId: res.id,
      reservationRef: res.ref,
      clientId:  res.clientId  || '',
      clientNom: res.clientNom || '',
      libelle:   p.libelle || `Paiement ${res.ref} — ${res.clientNom}`,
      montant:   p.montant || (solde > 0 ? String(solde) : String(parseFloat(res.montant) || '')),
    }))
  }

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? 'Modifier la transaction' : 'Nouvelle transaction'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={onSave}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Button>
        </>
      }
    >
      <div className="space-y-4">

        {/* Facture link — encaissements only */}
        {form.type === 'Encaissement' && (
          <div>
            <label className="label flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-primary-500" />
              Facture à régler
            </label>
            <select
              className="input-field"
              value={form.factureId || ''}
              onChange={e => handleFactureLink(e.target.value)}
            >
              <option value="">— Aucune facture —</option>
              {facturesRecon
                .filter(fac => fac.reste > 0.005 || fac.id === form.factureId)
                .map(fac => (
                  <option key={fac.id} value={fac.id}>
                    {fac.ref} · {fac.clientNom} · reste {formatCurrency(Math.max(0, fac.reste), currency)}
                  </option>
                ))}
            </select>
            {form.factureRef && (
              <p className="text-xs text-primary-600 mt-1 font-medium">Rattaché à {form.factureRef}</p>
            )}
          </div>
        )}

        {/* Reservation link */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-primary-500" />
            Réservation liée
          </label>
          <select
            className="input-field"
            value={form.reservationId || ''}
            onChange={e => handleReservationLink(e.target.value)}
          >
            <option value="">— Aucune réservation —</option>
            {reservations.map(r => (
              <option key={r.id} value={r.id}>
                {r.ref} · {r.clientNom} · {r.destination?.split(',')[0]}
              </option>
            ))}
          </select>
          {form.clientNom && (
            <p className="text-xs text-primary-600 mt-1 font-medium">{form.clientNom}</p>
          )}
        </div>

        <div>
          <label className="label">Date <span className="text-red-500">*</span></label>
          <input type="date" className="input-field" value={form.date} onChange={e => f('date', e.target.value)} />
        </div>
        <div>
          <label className="label">Libellé <span className="text-red-500">*</span></label>
          <input
            className="input-field" value={form.libelle}
            onChange={e => f('libelle', e.target.value)}
            placeholder="Description de la transaction"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input-field" value={form.type} onChange={e => f('type', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Statut</label>
            <select className="input-field" value={form.statut} onChange={e => f('statut', e.target.value)}>
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {/* Payment type + mode — shown for Encaissements */}
        {form.type === 'Encaissement' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type de paiement</label>
              <select className="input-field" value={form.paymentType || ''} onChange={e => f('paymentType', e.target.value)}>
                <option value="">— Général —</option>
                {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Mode de paiement</label>
              <select className="input-field" value={form.modePaiement || ''} onChange={e => f('modePaiement', e.target.value)}>
                <option value="">— Non précisé —</option>
                {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
        )}
        <div>
          <label className="label">Catégorie</label>
          <select className="input-field" value={form.categorie} onChange={e => f('categorie', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Montant TTC ({currency}) <span className="text-red-500">*</span></label>
            <input
              type="number" min="0" step="0.01" className="input-field"
              value={form.montant} onChange={e => f('montant', e.target.value)}
            />
          </div>
          <div>
            <label className="label">TVA</label>
            <select className="input-field" value={form.tvaRate ?? 20} onChange={e => f('tvaRate', parseFloat(e.target.value))}>
              {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
        </div>
        {/* HT / TVA breakdown */}
        {parseFloat(form.montant) > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Montant HT</span>
              <span className="font-medium text-slate-700">{formatCurrency(htOf(form.montant, form.tvaRate), currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>TVA ({tvaRateOf(form)}%)</span>
              <span className="font-medium text-slate-700">{formatCurrency(tvaOf(form.montant, form.tvaRate), currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-700 font-semibold">
              <span>Total TTC</span>
              <span>{formatCurrency(form.montant, currency)}</span>
            </div>
          </div>
        )}
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input-field resize-none h-16"
            value={form.notes} onChange={e => f('notes', e.target.value)}
            placeholder="Optionnel…"
          />
        </div>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════
   FINANCES PAGE
════════════════════════════════════════════════ */
const FinancesContent = () => {
  const [finances,      setFinances]  = useLocalStorage(STORAGE_KEYS.finances, [])
  const [reservations,  setReservations] = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [factures,      setFactures]  = useLocalStorage(STORAGE_KEYS.factures, [])
  const [settings]                   = useLocalStorage(STORAGE_KEYS.settings, {})
  const { toast } = useToast()

  const currency = settings?.devise || 'MAD'
  const now = new Date()
  const CM  = now.getMonth()
  const CY  = now.getFullYear()

  /* ── ui state ── */
  const [search,      setSearch]      = useState('')
  const [filterType,  setFilterType]  = useState('')
  const [filterStatut,setFilterStatut]= useState('')
  const [filterCat,   setFilterCat]   = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [sortCfg,     setSortCfg]     = useState({ key: 'date', dir: 'desc' })
  const [page,        setPage]        = useState(1)
  const [showForm,    setShowForm]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [deleting,    setDeleting]    = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)

  /* ── global KPIs (all time) ── */
  const kpis = useMemo(() => {
    const encPaidRows = finances.filter(f => f.type === 'Encaissement' && f.statut === 'Payé')
    const depPaidRows = finances.filter(f => f.type === 'Dépense'      && f.statut === 'Payé')
    const encPendRows = finances.filter(f => f.type === 'Encaissement' && f.statut === 'En attente')
    const depPendRows = finances.filter(f => f.type === 'Dépense'      && f.statut === 'En attente')

    const encPaid    = sumBy(encPaidRows, 'montant')
    const depPaid    = sumBy(depPaidRows, 'montant')
    const encPending = sumBy(encPendRows, 'montant')
    const depPending = sumBy(depPendRows, 'montant')
    const solde      = encPaid - depPaid

    // trésorerie prévisionnelle : solde actuel + à encaisser − à décaisser
    const soldePrev  = solde + encPending - depPending

    // TVA (sur transactions payées) — collectée sur encaissements, déductible sur dépenses
    const tvaCollectee  = sumTvaBy(encPaidRows)
    const tvaDeductible = sumTvaBy(depPaidRows)
    const tvaNette      = tvaCollectee - tvaDeductible

    // this month
    const thisMonth  = finances.filter(f => {
      const d = new Date(f.date)
      return d.getMonth() === CM && d.getFullYear() === CY
    })
    const encMois    = sumBy(thisMonth.filter(f => f.type === 'Encaissement' && f.statut === 'Payé'), 'montant')
    const depMois    = sumBy(thisMonth.filter(f => f.type === 'Dépense'      && f.statut === 'Payé'), 'montant')

    return {
      encPaid, depPaid, encPending, depPending, solde, soldePrev,
      tvaCollectee, tvaDeductible, tvaNette, encMois, depMois,
    }
  }, [finances, CM, CY])

  /* ── réconciliation factures ↔ encaissements ── */
  const facturesRecon = useMemo(
    () => reconcileFactures(factures, finances),
    [factures, finances],
  )

  const reconKpis = useMemo(() => {
    const ouvertes  = facturesRecon.filter(f => f.reste > 0.005)
    const restToCash = ouvertes.reduce((s, f) => s + f.reste, 0)
    const totalFac   = facturesRecon.reduce((s, f) => s + f.ttc, 0)
    const totalEnc   = facturesRecon.reduce((s, f) => s + f.encaisse, 0)
    const tauxRegl   = totalFac > 0 ? (totalEnc / totalFac) * 100 : 0
    return {
      nbOuvertes: ouvertes.length,
      restToCash,
      tauxRegl,
      nbSoldees: facturesRecon.filter(f => f.regl === 'Soldée').length,
      total: facturesRecon.length,
    }
  }, [facturesRecon])

  /* ── 6-month bar chart ── */
  const monthlyData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(CY, CM - (5 - i), 1)
      const m   = d.getMonth()
      const y   = d.getFullYear()
      const ok  = (f) => { const fd = new Date(f.date); return fd.getMonth() === m && fd.getFullYear() === y }
      const enc = sumBy(finances.filter(f => ok(f) && f.type === 'Encaissement' && f.statut === 'Payé'), 'montant')
      const dep = sumBy(finances.filter(f => ok(f) && f.type === 'Dépense'      && f.statut === 'Payé'), 'montant')
      return { name: getMonthLabel(m), enc, dep, marge: enc - dep }
    }),
  [finances, CM, CY])

  /* ── cumulative cash-flow (running balance) ── */
  const cashFlowData = useMemo(() => {
    const sorted = [...finances]
      .filter(f => f.statut === 'Payé')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    let balance = 0
    return sorted.map(f => {
      balance += f.type === 'Encaissement' ? parseFloat(f.montant) || 0 : -(parseFloat(f.montant) || 0)
      return { date: formatDate(f.date), balance }
    })
  }, [finances])

  /* ── expense category breakdown (paid) ── */
  const catData = useMemo(() => {
    const map = {}
    finances
      .filter(f => f.type === 'Dépense' && f.statut === 'Payé')
      .forEach(f => {
        const cat = f.categorie || 'Autres'
        map[cat] = (map[cat] || 0) + (parseFloat(f.montant) || 0)
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [finances])

  /* ── month options from data ── */
  const monthOptions = useMemo(() => {
    const s = new Set()
    finances.forEach(f => {
      if (!f.date) return
      const d = new Date(f.date)
      if (!isNaN(d)) s.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })
    return [...s].sort().reverse()
  }, [finances])

  /* ── filtered + sorted transactions ── */
  const filtered = useMemo(() => {
    const list = finances.filter(f => {
      if (search       && !fuzzyMatch(f.libelle + (f.categorie || ''), search)) return false
      if (filterType   && f.type    !== filterType)   return false
      if (filterStatut && f.statut  !== filterStatut) return false
      if (filterCat    && f.categorie !== filterCat)  return false
      if (filterMonth) {
        const d = new Date(f.date)
        if (isNaN(d) || `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` !== filterMonth) return false
      }
      return true
    })
    return sortByKey(list, sortCfg.key, sortCfg.dir)
  }, [finances, search, filterType, filterStatut, filterCat, filterMonth, sortCfg])

  const paginated = useMemo(() => {
    const s = (page - 1) * PER_PAGE
    return filtered.slice(s, s + PER_PAGE)
  }, [filtered, page])

  /* ── filtered totals ── */
  const filteredTotals = useMemo(() => ({
    enc: sumBy(filtered.filter(f => f.type === 'Encaissement'), 'montant'),
    dep: sumBy(filtered.filter(f => f.type === 'Dépense'),      'montant'),
  }), [filtered])

  /* ── CRUD ── */
  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true) }
  const openEdit   = (t) => { setEditing(t);  setForm({ ...t });           setShowForm(true) }

  const syncReservationAcomptes = (nextFinances, reservationIds) => {
    const ids = [...new Set(reservationIds.filter(Boolean))]
    if (!ids.length) return
    setReservations(prev => applyAcompteFromFinances(prev, nextFinances, ids))
  }

  const handleSave = () => {
    if (!form.libelle?.trim()) { toast.error('Le libellé est requis.'); return }
    if (!form.montant || parseFloat(form.montant) <= 0) { toast.error('Le montant doit être supérieur à 0.'); return }

    const reservationIds = [form.reservationId, editing?.reservationId].filter(Boolean)
    let nextFinances

    if (editing) {
      nextFinances = finances.map(f =>
        f.id === editing.id ? { ...f, ...form, montant: parseFloat(form.montant) } : f,
      )
      setFinances(nextFinances)
      toast.success('Transaction mise à jour.')
    } else {
      nextFinances = [
        { ...form, id: `tra-${Date.now()}`, montant: parseFloat(form.montant) },
        ...finances,
      ]
      setFinances(nextFinances)
      toast.success('Transaction ajoutée.')
    }

    syncReservationAcomptes(nextFinances, reservationIds)
    setShowForm(false)
    setPage(1)
  }

  const handleDelete = () => {
    const reservationId = deleting?.reservationId
    const nextFinances = finances.filter(f => f.id !== deleting.id)
    setFinances(nextFinances)
    if (reservationId) syncReservationAcomptes(nextFinances, [reservationId])
    toast.success('Transaction supprimée.')
    setShowConfirm(false); setDeleting(null)
  }

  /* ── pointer une facture comme réglée (statut → Payée) ── */
  const markFacturePaid = (facId) => {
    setFactures(prev => prev.map(f => f.id === facId ? { ...f, statut: 'Payée' } : f))
    toast.success('Facture pointée comme payée.')
  }

  /* ── créer un encaissement pré-rempli depuis une facture ── */
  const payFacture = (fac) => {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      type: 'Encaissement', categorie: 'Ventes',
      factureId: fac.id, factureRef: fac.ref,
      clientId: fac.clientId || '', clientNom: fac.clientNom || '',
      libelle: `Règlement ${fac.ref} — ${fac.clientNom || ''}`.trim(),
      montant: fac.reste > 0 ? String(Math.round(fac.reste)) : '',
    })
    setShowForm(true)
  }

  /* ── CSV export ── */
  const exportCSV = () => {
    const header = 'Date,Libellé,Type,Catégorie,Statut,Mode,TVA%,Montant HT,TVA,Montant TTC\n'
    const rows   = filtered.map(f => {
      const r = tvaRateOf(f)
      return [
        f.date, `"${(f.libelle || '').replace(/"/g, '""')}"`, f.type, f.categorie || '',
        f.statut, f.modePaiement || '', r,
        Math.round(htOf(f.montant, r)), Math.round(tvaOf(f.montant, r)), f.montant,
      ].join(',')
    }).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `finances_${todayISO()}.csv`
    a.click()
    toast.success('Export CSV téléchargé.')
  }

  /* ── Excel export (transactions + synthèse) ── */
  const exportExcel = () => {
    const txRows = filtered.map(f => {
      const r = tvaRateOf(f)
      return {
        Date: f.date,
        Libellé: f.libelle || '',
        Type: f.type,
        Catégorie: f.categorie || '',
        Statut: f.statut,
        'Mode paiement': f.modePaiement || '',
        Réservation: f.reservationRef || '',
        Facture: f.factureRef || '',
        Client: f.clientNom || '',
        'TVA %': r,
        'Montant HT': Math.round(htOf(f.montant, r)),
        TVA: Math.round(tvaOf(f.montant, r)),
        'Montant TTC': parseFloat(f.montant) || 0,
      }
    })
    const wsTx = XLSX.utils.json_to_sheet(txRows)
    wsTx['!cols'] = [
      { wch: 11 }, { wch: 38 }, { wch: 13 }, { wch: 16 }, { wch: 11 }, { wch: 14 },
      { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 7 }, { wch: 12 }, { wch: 11 }, { wch: 12 },
    ]

    const synthRows = [
      { Indicateur: 'Recettes encaissées (TTC)', Valeur: Math.round(kpis.encPaid) },
      { Indicateur: 'Dépenses payées (TTC)',     Valeur: Math.round(kpis.depPaid) },
      { Indicateur: 'Solde net',                 Valeur: Math.round(kpis.solde) },
      { Indicateur: 'À encaisser (en attente)',  Valeur: Math.round(kpis.encPending) },
      { Indicateur: 'À décaisser (en attente)',  Valeur: Math.round(kpis.depPending) },
      { Indicateur: 'Solde projeté',             Valeur: Math.round(kpis.soldePrev) },
      { Indicateur: 'TVA collectée',             Valeur: Math.round(kpis.tvaCollectee) },
      { Indicateur: 'TVA déductible',            Valeur: Math.round(kpis.tvaDeductible) },
      { Indicateur: 'TVA nette à payer',         Valeur: Math.round(kpis.tvaNette) },
    ]
    const wsSyn = XLSX.utils.json_to_sheet(synthRows)
    wsSyn['!cols'] = [{ wch: 30 }, { wch: 16 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsSyn, 'Synthèse')
    XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions')
    XLSX.writeFile(wb, `finances_${todayISO()}.xlsx`)
    toast.success('Export Excel téléchargé.')
  }

  /* ── toggle sort ── */
  const toggleSort = (key) => {
    setSortCfg(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))
    setPage(1)
  }

  const hasFilters = search || filterType || filterStatut || filterCat || filterMonth
  const clearFilters = () => {
    setSearch(''); setFilterType(''); setFilterStatut(''); setFilterCat(''); setFilterMonth('')
    setPage(1)
  }

  const Th = ({ col, label, align = 'left' }) => (
    <th
      className={`table-th text-${align} cursor-pointer select-none hover:bg-slate-100`}
      onClick={() => toggleSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}<SortIcon col={col} sortCol={sortCfg.key} sortDir={sortCfg.dir} />
      </span>
    </th>
  )

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="Recettes encaissées"
          value={formatCurrency(kpis.encPaid, currency)}
          sub={`Ce mois : ${formatCurrency(kpis.encMois, currency)}`}
          iconColor="bg-green-50 text-green-600"
        />
        <KpiCard
          icon={TrendingDown}
          label="Dépenses payées"
          value={formatCurrency(kpis.depPaid, currency)}
          sub={`Ce mois : ${formatCurrency(kpis.depMois, currency)}`}
          iconColor="bg-red-50 text-red-600"
        />
        <KpiCard
          icon={Wallet}
          label="Solde net"
          value={formatCurrency(kpis.solde, currency)}
          sub="Recettes − Dépenses"
          iconColor={kpis.solde >= 0 ? 'bg-primary-50 text-primary-600' : 'bg-red-50 text-red-600'}
        />
        <KpiCard
          icon={Clock}
          label="En attente d'encaissement"
          value={formatCurrency(kpis.encPending, currency)}
          sub="Paiements non reçus"
          iconColor="bg-amber-50 text-amber-600"
        />
      </div>

      {/* ── Trésorerie prévisionnelle + TVA ── */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Forecast */}
        <Card className="xl:col-span-2">
          <Card.Header title="Trésorerie prévisionnelle" subtitle="Solde actuel et engagements en attente" />
          <Card.Body>
            <div className="flex flex-wrap items-stretch gap-3">
              <div className="flex-1 min-w-[140px] rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">Solde actuel</p>
                <p className={`text-lg font-bold ${kpis.solde >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  {formatCurrency(kpis.solde, currency)}
                </p>
              </div>
              <div className="flex-1 min-w-[140px] rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                <p className="text-xs text-green-600">+ À encaisser</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(kpis.encPending, currency)}</p>
              </div>
              <div className="flex-1 min-w-[140px] rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs text-red-600">− À décaisser</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(kpis.depPending, currency)}</p>
              </div>
              <div className={`flex-1 min-w-[140px] rounded-xl border px-4 py-3 ${kpis.soldePrev >= 0 ? 'border-primary-100 bg-primary-50' : 'border-red-200 bg-red-50'}`}>
                <p className="text-xs text-primary-600 flex items-center gap-1"><Forecast className="w-3 h-3" />Solde projeté</p>
                <p className={`text-lg font-bold ${kpis.soldePrev >= 0 ? 'text-primary-700' : 'text-red-700'}`}>
                  {formatCurrency(kpis.soldePrev, currency)}
                </p>
              </div>
            </div>
            {kpis.soldePrev < 0 && (
              <p className="text-xs text-red-600 mt-3 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                Solde projeté négatif : les dépenses en attente dépassent la trésorerie disponible.
              </p>
            )}
          </Card.Body>
        </Card>

        {/* TVA summary */}
        <Card>
          <Card.Header title="TVA" subtitle="Sur transactions payées" />
          <Card.Body>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-500"><Receipt className="w-3.5 h-3.5" />TVA collectée</span>
                <span className="font-medium text-green-600">{formatCurrency(kpis.tvaCollectee, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">TVA déductible</span>
                <span className="font-medium text-red-600">− {formatCurrency(kpis.tvaDeductible, currency)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-sm">
                <span className="font-semibold text-slate-700">TVA nette à payer</span>
                <span className={`font-bold ${kpis.tvaNette >= 0 ? 'text-primary-600' : 'text-green-600'}`}>
                  {formatCurrency(kpis.tvaNette, currency)}
                </span>
              </div>
              {kpis.tvaNette < 0 && (
                <p className="text-xs text-slate-400">Crédit de TVA reportable.</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* ── Charts row ── */}
      <div className="grid xl:grid-cols-3 gap-5">

        {/* Bar chart — 6 months */}
        <Card className="xl:col-span-2">
          <Card.Header title="Recettes vs Dépenses" subtitle="6 derniers mois · transactions payées" />
          <Card.Body>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barGap={3} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={36}
                />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Bar dataKey="enc" name="Recettes" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dep" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded bg-green-500" />Recettes
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded bg-red-500" />Dépenses
                </span>
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

        {/* Donut — expense by category */}
        <Card>
          <Card.Header title="Dépenses par catégorie" subtitle="Transactions payées" />
          <Card.Body>
            {catData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                Aucune dépense enregistrée
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={catData} cx="50%" cy="50%"
                      outerRadius={70} innerRadius={35}
                      dataKey="value" paddingAngle={2}
                    >
                      {catData.map((entry, i) => (
                        <Cell key={i} fill={CAT_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {catData.map(({ name, value }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[name] || '#94a3b8' }} />
                        <span className="text-slate-500">{name}</span>
                      </span>
                      <span className="font-medium text-slate-700">{formatCurrency(value, currency)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* ── Cash-flow area chart ── */}
      {cashFlowData.length > 1 && (
        <Card>
          <Card.Header title="Trésorerie cumulée" subtitle="Solde progressif · toutes transactions payées" />
          <Card.Body>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={BRAND.teal} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={BRAND.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={36} />
                <Tooltip formatter={v => formatCurrency(v, currency)} labelFormatter={l => `Date : ${l}`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="balance" name="Trésorerie" stroke={BRAND.teal} strokeWidth={2} fill="url(#balanceGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

      {/* ── Réconciliation factures ↔ encaissements ── */}
      {factures.length > 0 && (
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary-500" />
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Réconciliation factures</h3>
                <p className="text-xs text-slate-400">Rapprochement encaissements ↔ factures émises</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <p className="text-slate-400">Reste à encaisser</p>
                <p className="font-semibold text-red-600">{formatCurrency(reconKpis.restToCash, currency)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Factures ouvertes</p>
                <p className="font-semibold text-slate-700">{reconKpis.nbOuvertes} / {reconKpis.total}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Taux de règlement</p>
                <p className="font-semibold text-primary-600">{reconKpis.tauxRegl.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th text-left">Facture</th>
                  <th className="table-th text-left">Client</th>
                  <th className="table-th text-right">Total TTC</th>
                  <th className="table-th text-left w-48">Encaissé</th>
                  <th className="table-th text-right">Reste</th>
                  <th className="table-th text-left">Règlement</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...facturesRecon]
                  .sort((a, b) => b.reste - a.reste)
                  .map(fac => {
                    const pct = fac.ttc > 0 ? Math.min(100, Math.max(0, (fac.encaisse / fac.ttc) * 100)) : 0
                    const incoherent = fac.statut === 'Payée' && fac.reste > 0.005
                    return (
                      <tr key={fac.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="table-td font-mono text-xs text-primary-600 whitespace-nowrap">
                          {fac.ref}
                          {incoherent && (
                            <span className="ml-1 text-amber-600" title="Facture marquée Payée mais reste dû">⚠</span>
                          )}
                        </td>
                        <td className="table-td text-slate-700">{fac.clientNom || '—'}</td>
                        <td className="table-td text-right tabular-nums text-slate-700">{formatCurrency(fac.ttc, currency)}</td>
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden min-w-[60px]">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, background: fac.reste <= 0.005 ? '#10b981' : '#0E8C7F' }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">{formatCurrency(fac.encaisse, currency)}</span>
                          </div>
                          {fac.enAttente > 0 && (
                            <span className="text-[11px] text-amber-600">+ {formatCurrency(fac.enAttente, currency)} en attente</span>
                          )}
                        </td>
                        <td className={`table-td text-right tabular-nums font-medium ${fac.reste > 0.005 ? 'text-red-600' : 'text-slate-400'}`}>
                          {formatCurrency(Math.max(0, fac.reste), currency)}
                        </td>
                        <td className="table-td">
                          <Badge variant={REGLEMENT_BADGE[fac.regl] || 'gray'}>{fac.regl}</Badge>
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-1 justify-end">
                            {fac.reste > 0.005 && (
                              <Button variant="ghost" size="sm" icon={Plus} onClick={() => payFacture(fac)}>Encaisser</Button>
                            )}
                            {fac.regl === 'Soldée' && fac.statut !== 'Payée' && (
                              <Button variant="ghost" size="sm" onClick={() => markFacturePaid(fac.id)}>Pointer payée</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Transactions table ── */}
      <Card noPadding>
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 flex-1 min-w-0">
              <div className="relative flex-1 min-w-44">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-field pl-9 text-sm"
                  placeholder="Rechercher un libellé…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <select className="input-field w-auto text-sm" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
                <option value="">Tous types</option>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="input-field w-auto text-sm" value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1) }}>
                <option value="">Tous statuts</option>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="input-field w-auto text-sm" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}>
                <option value="">Toutes catégories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input-field w-auto text-sm" value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1) }}>
                <option value="">Tous les mois</option>
                {monthOptions.map(m => {
                  const [y, mo] = m.split('-')
                  const label = new Date(+y, +mo - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  return <option key={m} value={m}>{label}</option>
                })}
              </select>
              {hasFilters && <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Effacer</Button>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" icon={Download} onClick={exportCSV}>CSV</Button>
              <Button variant="secondary" icon={FileSpreadsheet} onClick={exportExcel}>Excel</Button>
              <Button icon={Plus} onClick={openCreate}>Ajouter</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th col="date"      label="Date" />
                <Th col="libelle"   label="Libellé" />
                <Th col="categorie" label="Catégorie" />
                <Th col="type"      label="Type" />
                <Th col="statut"    label="Statut" />
                <Th col="montant"   label="Montant" align="right" />
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Wallet className="w-9 h-9 opacity-30" />
                      <p className="text-sm">{hasFilters ? 'Aucune transaction ne correspond aux filtres.' : 'Aucune transaction enregistrée.'}</p>
                      {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Effacer les filtres</Button>}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(t => {
                const isEnc = t.type === 'Encaissement'
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="table-td text-slate-500 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="table-td">
                      <div>
                        <p className="font-medium text-slate-800">{t.libelle}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {t.paymentType && (
                            <span className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded">
                              {t.paymentType}
                            </span>
                          )}
                          {t.modePaiement && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {t.modePaiement}
                            </span>
                          )}
                          {tvaRateOf(t) > 0 && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              HT {formatCurrency(htOf(t.montant, tvaRateOf(t)), currency)} · TVA {tvaRateOf(t)}%
                            </span>
                          )}
                          {t.reservationRef && (
                            <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-mono bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded">
                              <Link2 className="w-2.5 h-2.5" />{t.reservationRef}
                            </span>
                          )}
                          {t.factureRef && (
                            <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-mono bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded">
                              <Receipt className="w-2.5 h-2.5" />{t.factureRef}
                            </span>
                          )}
                          {t.clientNom && (
                            <span className="text-xs text-slate-400">{t.clientNom}</span>
                          )}
                          {t.notes && <span className="text-xs text-slate-400 truncate max-w-[120px]">{t.notes}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: CAT_COLORS[t.categorie] || '#94a3b8' }}
                        />
                        {t.categorie || '—'}
                      </span>
                    </td>
                    <td className="table-td">
                      <Badge variant={isEnc ? 'success' : 'danger'}>{t.type}</Badge>
                    </td>
                    <td className="table-td">
                      <StatusBadge statut={t.statut} />
                    </td>
                    <td className="table-td text-right">
                      <span className={`font-semibold tabular-nums whitespace-nowrap ${isEnc ? 'text-green-600' : 'text-red-600'}`}>
                        {isEnc ? '+' : '−'}{formatCurrency(t.montant, currency)}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Modifier"
                        ><Edit2 className="w-4 h-4" /></button>
                        <button
                          onClick={() => { setDeleting(t); setShowConfirm(true) }}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer totals + pagination */}
        <div className="border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-50 text-xs text-slate-500 gap-3">
            <div className="flex gap-5">
              <span>
                <span className="text-slate-400">Résultats : </span>
                <span className="font-medium text-slate-700">{filtered.length} transaction(s)</span>
              </span>
              <span className="text-green-600 font-medium">
                + {formatCurrency(filteredTotals.enc, currency)}
              </span>
              <span className="text-red-600 font-medium">
                − {formatCurrency(filteredTotals.dep, currency)}
              </span>
              <span className={`font-semibold ${filteredTotals.enc - filteredTotals.dep >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                = {formatCurrency(filteredTotals.enc - filteredTotals.dep, currency)}
              </span>
            </div>
          </div>
          {filtered.length > PER_PAGE && (
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
          )}
        </div>
      </Card>

      {/* ── Modals ── */}
      {showForm && (
        <TransactionForm
          form={form} setForm={setForm} currency={currency}
          reservations={reservations} facturesRecon={facturesRecon}
          onSave={handleSave} onClose={() => setShowForm(false)} isEdit={!!editing}
        />
      )}
      {showConfirm && (
        <ConfirmModal
          onClose={() => setShowConfirm(false)} onConfirm={handleDelete}
          title="Supprimer la transaction"
          message={`Supprimer "${deleting?.libelle}" ? Cette action est irréversible.`}
          confirmLabel="Supprimer" danger
        />
      )}
    </div>
  )
}

export const FinancesPage = () => {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <AccessDenied />
  return <FinancesContent />
}
