import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Plus, Search, Download, Eye, Edit2, Trash2,
  CalendarDays, X, Plane, Banknote, CheckCircle, Clock,
  CreditCard, Link2, AlertCircle, Wallet, TrendingDown,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS, defaultSettings } from '../../utils/sampleData'
import {
  formatCurrency, formatDate, formatDateShort, generateRef,
  todayISO, fuzzyMatch, sortByKey, sumBy,
} from '../../utils/formatters'
import { syncReservationToCalendar, removeReservationFromCalendar } from '../../utils/calendarSync'
import { applyAcompteFromFinances } from '../../utils/financeSync'
import { getBannedCountryError } from '../../data/bannedCountries'
import {
  Button, Card, Modal, ConfirmModal, Badge, StatusBadge,
  ProgressBar, Pagination, SortIcon, DocumentSection,
  DiscountPanel,
} from '../../components/UI'
import { ClientPickerField } from '../../components/QuickCreate'

/* ─── constants ─── */
const STATUTS = ['En attente', 'Confirmée', 'Terminée', 'Annulée']
const TYPES   = ['Package', 'Vol', 'Hôtel', 'Omra', 'Circuit', 'Transfert']
const PER_PAGE = 10

const EMPTY_FORM = {
  ref: '', clientId: '', clientNom: '', destination: '', type: 'Package',
  depart: '', retour: '', statut: 'En attente',
  prixVente: '', prixAchatTotal: '',
  montant: '', remisePct: 0, remiseLabel: '',
  manualTriggers: {}, isManagerOverride: false,
  acompte: '0', agentId: '', notes: '', dateCreation: todayISO(),
  produitId: '',
}

const PAYMENT_TYPES = ['Acompte', 'Solde', 'Remboursement', 'Autre']
const PAYMENT_MODES = ['Espèces', 'Virement', 'Chèque', 'Carte bancaire']

/* ─── payment status ─── */
const PAY_STATUS = {
  nonpaye: { label: 'Non payé',   color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200'   },
  partiel: { label: 'Acompte',    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  attente: { label: 'En attente', color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-200'  },
  solde:   { label: 'Soldé',      color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
}

const computePayStatus = (reservation, payByRes) => {
  const montant = parseFloat(reservation.montant) || 0
  const entry   = payByRes[reservation.id]
  // If linked finance transactions exist, use those; otherwise fall back to reservation.acompte
  const paid    = entry ? entry.paid    : (parseFloat(reservation.acompte) || 0)
  const pending = entry ? entry.pending : 0
  const remaining = Math.max(0, montant - paid)
  const pct = montant > 0 ? Math.round((paid / montant) * 100) : 0
  const base = { paid, pending, remaining, pct, montant }
  if (montant === 0 || paid >= montant) return { ...PAY_STATUS.solde, ...base }
  if (paid === 0 && pending > 0) return { ...PAY_STATUS.attente, ...base }
  if (paid === 0) return { ...PAY_STATUS.nonpaye, ...base }
  return { ...PAY_STATUS.partiel, ...base }
}

/* ─── mini helpers ─── */
const solde = (r) => Math.max(0, (parseFloat(r.montant) || 0) - (parseFloat(r.acompte) || 0))

/* ─── stat chip ─── */
const Stat = ({ icon: Icon, label, value, color = 'text-navy' }) => (
  <div className="flex items-center gap-2.5 px-4 py-3">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-slate-500" />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
    </div>
  </div>
)

/* ════════════════════════════════════════════════
   FORM MODAL
════════════════════════════════════════════════ */
const ReservationForm = ({ form, setForm, clients, onClientCreated, agents, products, reservations, settings, reservedByProduct, currency, onSave, onClose, isEdit }) => {
  const f = useCallback((field, val) => setForm(p => ({ ...p, [field]: val })), [setForm])

  const handleProductChange = (pid) => {
    const prod = products.find(p => p.id === pid)
    setForm(prev => {
      const newPrixVente = (!prev.prixVente || prev.prixVente === '0') && prod?.prixVente
        ? String(prod.prixVente)
        : prev.prixVente
      const newMontant = newPrixVente
        ? String(Math.round(parseFloat(newPrixVente) * (1 - (prev.remisePct || 0) / 100)))
        : prev.montant
      return {
        ...prev,
        produitId:   pid,
        destination: prev.destination || prod?.destination || '',
        prixVente:   newPrixVente,
        montant:     newMontant,
        prixAchatTotal: (!prev.prixAchatTotal || prev.prixAchatTotal === '0') && prod?.prixAchat
          ? String(prod.prixAchat)
          : prev.prixAchatTotal,
      }
    })
  }

  const handleDiscountChange = useCallback(({ pct, label, isManagerOverride }) => {
    setForm(prev => {
      const prixVenteNum = parseFloat(prev.prixVente) || 0
      const newMontant = prixVenteNum > 0
        ? String(Math.round(prixVenteNum * (1 - pct / 100)))
        : prev.montant
      return { ...prev, remisePct: pct, remiseLabel: label, isManagerOverride, montant: newMontant }
    })
  }, [setForm])

  const selectedProduct  = products.find(p => p.id === form.produitId)
  const reservedCount    = form.produitId ? (reservedByProduct[form.produitId] || 0) : 0
  const availablePlaces  = selectedProduct ? Math.max(0, (selectedProduct.stock || 0) - reservedCount) : null

  const prixVenteNum = parseFloat(form.prixVente) || 0
  const montantNum   = parseFloat(form.montant) || 0
  const acompteNum   = parseFloat(form.acompte)  || 0
  const soldeNum     = Math.max(0, montantNum - acompteNum)
  const remiseMAD    = prixVenteNum > 0 && form.remisePct > 0
    ? Math.round(prixVenteNum * form.remisePct / 100)
    : 0

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? 'Modifier la réservation' : 'Nouvelle réservation'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={onSave}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Référence */}
        <div>
          <label className="label">Référence</label>
          <input className="input-field" value={form.ref} onChange={e => f('ref', e.target.value)} />
        </div>

        {/* Client */}
        <div className="sm:col-span-2">
          <ClientPickerField
            clients={clients}
            clientId={form.clientId || ''}
            clientNom={form.clientNom || ''}
            onClientIdChange={(id, client) => setForm(p => ({
              ...p,
              clientId: id,
              clientNom: client?.nom || p.clientNom,
            }))}
            onClientNomChange={nom => setForm(p => ({ ...p, clientNom: nom, clientId: '' }))}
            onClientCreated={onClientCreated}
            variant="tailwind"
            label="Client"
          />
        </div>

        {/* Destination */}
        <div className="sm:col-span-2">
          <label className="label">Destination <span className="text-red-500">*</span></label>
          <input className="input-field" value={form.destination} onChange={e => f('destination', e.target.value)} placeholder="Ex : Istanbul, Turquie" />
        </div>

        {/* Produit lié */}
        <div className="sm:col-span-2">
          <label className="label">Produit / Tarif lié</label>
          <select className="input-field" value={form.produitId || ''} onChange={e => handleProductChange(e.target.value)}>
            <option value="">— Aucun produit lié —</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.nom} — {p.type}{p.destination ? ` · ${p.destination}` : ''}</option>
            ))}
          </select>
          {selectedProduct && availablePlaces !== null && (
            <p className={`text-xs mt-1.5 font-medium ${
              availablePlaces === 0 ? 'text-red-500'
              : availablePlaces <= 2 ? 'text-amber-600'
              : 'text-green-600'
            }`}>
              {availablePlaces === 0
                ? `⚠ Complet — ${selectedProduct.stock} place(s) toutes réservées`
                : `${availablePlaces} place(s) disponible(s) sur ${selectedProduct.stock} (${reservedCount} réservée(s))`
              }
            </p>
          )}
        </div>

        {/* Type + Statut */}
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

        {/* Dates */}
        <div>
          <label className="label">Départ <span className="text-red-500">*</span></label>
          <input type="date" className="input-field" value={form.depart} onChange={e => f('depart', e.target.value)} />
        </div>
        <div>
          <label className="label">Retour</label>
          <input type="date" className="input-field" value={form.retour} onChange={e => f('retour', e.target.value)} />
        </div>

        {/* Prix catalogue + Prix d'achat */}
        <div>
          <label className="label">Prix catalogue ({currency})</label>
          <input
            type="number" min="0" className="input-field"
            placeholder="Tarif avant réduction…"
            value={form.prixVente}
            onChange={e => {
              const v = e.target.value
              setForm(prev => ({
                ...prev,
                prixVente: v,
                montant: v && prev.remisePct > 0
                  ? String(Math.round(parseFloat(v) * (1 - prev.remisePct / 100)))
                  : v,
              }))
            }}
          />
        </div>
        <div>
          <label className="label">Prix d'achat ({currency})</label>
          <input
            type="number" min="0" className="input-field"
            placeholder="Coût fournisseur…"
            value={form.prixAchatTotal}
            onChange={e => f('prixAchatTotal', e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Non visible sur les documents clients.</p>
        </div>

        {/* DiscountPanel — appears once client + prixVente are set */}
        {form.clientId && prixVenteNum > 0 && (
          <div className="sm:col-span-2">
            <DiscountPanel
              clientId={form.clientId}
              clients={clients}
              reservations={reservations}
              totalBrut={prixVenteNum}
              prixAchatTotal={form.prixAchatTotal}
              settings={settings}
              manualTriggers={form.manualTriggers || {}}
              onManualChange={(key, val) =>
                setForm(prev => ({ ...prev, manualTriggers: { ...prev.manualTriggers, [key]: val } }))
              }
              onDiscountChange={handleDiscountChange}
            />
          </div>
        )}

        {/* Montant après remise + Acompte */}
        <div>
          <label className="label">
            Montant client ({currency})
            {form.remisePct > 0 && (
              <span className="ml-2 text-xs text-green-600 font-normal flex items-center gap-1 inline-flex">
                <TrendingDown className="w-3 h-3" />
                après {form.remisePct}% ({form.remiseLabel}) — économie {formatCurrency(remiseMAD, currency)}
              </span>
            )}
          </label>
          <input type="number" min="0" className="input-field" value={form.montant} onChange={e => f('montant', e.target.value)} />
        </div>
        <div>
          <label className="label">Acompte versé ({currency})</label>
          <input type="number" min="0" className="input-field" value={form.acompte} onChange={e => f('acompte', e.target.value)} />
        </div>

        {/* Solde preview */}
        {montantNum > 0 && (
          <div className="sm:col-span-2">
            <ProgressBar
              value={acompteNum}
              max={montantNum}
              size="sm"
              label={`Solde restant : ${formatCurrency(soldeNum, currency)}`}
              showLabel
            />
          </div>
        )}

        {/* Agent + Date création */}
        <div>
          <label className="label">Agent responsable</label>
          <select className="input-field" value={form.agentId} onChange={e => f('agentId', e.target.value)}>
            <option value="">— Aucun —</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date de création</label>
          <input type="date" className="input-field" value={form.dateCreation} onChange={e => f('dateCreation', e.target.value)} />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea className="input-field resize-none h-20" value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Informations complémentaires…" />
        </div>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════
   DETAIL MODAL
════════════════════════════════════════════════ */
const DetailModal = ({ r, agents, payByRes, currency, resDocs, onAddDoc, onDeleteDoc, onEdit, onDelete, onClose, onAddPayment }) => {
  if (!r) return null
  const agent   = agents.find(a => a.id === r.agentId)
  const ps      = computePayStatus(r, payByRes)
  const payments = (payByRes[r.id]?.payments || []).sort((a, b) => new Date(b.date) - new Date(a.date))

  const rows = [
    ['Référence',     r.ref,                      'font-mono text-primary-600'],
    ['Client',        r.clientNom,                'font-medium'],
    ['Destination',   r.destination,              ''],
    ['Type',          r.type,                     ''],
    ['Départ',        formatDate(r.depart),       ''],
    ['Retour',        formatDate(r.retour),       ''],
    ['Agent',         agent?.nom || '—',          ''],
    ['Date création', formatDate(r.dateCreation), ''],
  ]

  const modeIcon = { Espèces: '💵', Virement: '🏦', Chèque: '📝', 'Carte bancaire': '💳' }

  return (
    <Modal
      onClose={onClose}
      title={`Réservation ${r.ref}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
          <Button variant="secondary" icon={Edit2} onClick={() => { onClose(); onEdit(r) }}>Modifier</Button>
          <Button variant="danger" icon={Trash2} onClick={() => { onClose(); onDelete(r) }}>Supprimer</Button>
        </>
      }
    >
      <div className="space-y-1 text-sm">
        {/* Statut */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-slate-500">Statut</span>
          <StatusBadge statut={r.statut} />
        </div>

        {rows.map(([label, val, cls]) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className={`text-slate-800 text-right max-w-[60%] ${cls}`}>{val || '—'}</span>
          </div>
        ))}

        {/* ── Paiements ── */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paiements</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ps.bg} ${ps.color} ${ps.border}`}>
                {ps.label}{ps.pct > 0 && ps.pct < 100 ? ` · ${ps.pct}%` : ''}
              </span>
            </div>
            <button
              onClick={() => onAddPayment(r)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {/* 4-cell summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-xs font-bold text-navy">{formatCurrency(ps.montant, currency)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2.5">
              <p className="text-xs text-slate-400">Payé</p>
              <p className="text-xs font-bold text-green-700">{formatCurrency(ps.paid, currency)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2.5">
              <p className="text-xs text-slate-400">En attente</p>
              <p className="text-xs font-bold text-amber-600">{formatCurrency(ps.pending, currency)}</p>
            </div>
            <div className={`rounded-lg p-2.5 ${ps.remaining > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-xs text-slate-400">Restant</p>
              <p className={`text-xs font-bold ${ps.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(ps.remaining, currency)}
              </p>
            </div>
          </div>

          <ProgressBar value={ps.paid} max={ps.montant || 1} label={`Encaissé : ${ps.pct}%`} showLabel size="md" />

          {/* Payment history */}
          {payments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {payments.map(pay => (
                <div key={pay.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">
                      {modeIcon[pay.modePaiement] || '💳'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pay.paymentType && (
                          <span className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded">
                            {pay.paymentType}
                          </span>
                        )}
                        {pay.modePaiement && (
                          <span className="text-xs text-slate-500">{pay.modePaiement}</span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium border
                          ${pay.statut === 'Payé' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {pay.statut}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(pay.date)}{pay.notes ? ` · ${pay.notes}` : ''}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold whitespace-nowrap flex-shrink-0 ${pay.type === 'Encaissement' ? 'text-green-600' : 'text-red-600'}`}>
                    {pay.type === 'Encaissement' ? '+' : '−'}{formatCurrency(pay.montant, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {payments.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Aucun paiement enregistré — cliquez "Ajouter" pour démarrer le suivi.
            </div>
          )}
        </div>

        {r.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Notes</p>
            <p className="text-slate-700 text-sm">{r.notes}</p>
          </div>
        )}

        {/* ── Documents ── */}
        <DocumentSection
          compact
          docs={resDocs}
          onAdd={onAddDoc}
          onDelete={onDeleteDoc}
          clientId={r.clientId || ''}
          clientNom={r.clientNom || ''}
          reservationId={r.id}
          reservationRef={r.ref}
        />
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════
   PAYMENT MODAL
════════════════════════════════════════════════ */
const PaymentQuickModal = ({ reservation, payStatus, currency, onSave, onClose }) => {
  const suggestedMontant = payStatus?.remaining > 0 ? String(payStatus.remaining) : ''
  const suggestedType    = payStatus?.paid === 0 ? 'Acompte' : 'Solde'

  const [form, setForm] = useState({
    date:          todayISO(),
    montant:       suggestedMontant,
    paymentType:   suggestedType,
    modePaiement:  'Virement',
    statut:        'Payé',
    notes:         '',
  })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const montantNum  = parseFloat(form.montant) || 0
  const newPaid     = (payStatus?.paid || 0) + montantNum
  const totalDue    = parseFloat(reservation.montant) || 0
  const afterStatus = newPaid >= totalDue ? 'Soldé' : newPaid > 0 ? 'Partiel' : 'Non payé'

  const handleSave = () => {
    if (!form.montant || montantNum <= 0) return
    onSave({
      id:             `tra-${Date.now()}`,
      date:           form.date,
      libelle:        `${form.paymentType} ${reservation.ref} — ${reservation.clientNom}`,
      type:           'Encaissement',
      montant:        montantNum,
      statut:         form.statut,
      categorie:      'Ventes',
      notes:          form.notes,
      paymentType:    form.paymentType,
      modePaiement:   form.modePaiement,
      reservationId:  reservation.id,
      reservationRef: reservation.ref,
      clientId:       reservation.clientId  || '',
      clientNom:      reservation.clientNom || '',
    })
  }

  return (
    <Modal
      onClose={onClose}
      title={`Enregistrer un paiement — ${reservation.ref}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button icon={CreditCard} onClick={handleSave}>Enregistrer</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Reservation summary */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Client</span>
            <span className="font-semibold text-slate-700">{reservation.clientNom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total dû</span>
            <span className="font-semibold text-slate-700">{formatCurrency(totalDue, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Déjà encaissé</span>
            <span className="font-semibold text-green-600">{formatCurrency(payStatus?.paid || 0, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5">
            <span className="text-slate-500 font-medium">Restant</span>
            <span className={`font-bold ${(payStatus?.remaining || 0) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {formatCurrency(payStatus?.remaining || 0, currency)}
            </span>
          </div>
        </div>

        {/* Type + Mode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type de paiement</label>
            <select className="input-field" value={form.paymentType} onChange={e => f('paymentType', e.target.value)}>
              {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Mode de paiement</label>
            <select className="input-field" value={form.modePaiement} onChange={e => f('modePaiement', e.target.value)}>
              {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Date + Montant */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input-field" value={form.date} onChange={e => f('date', e.target.value)} />
          </div>
          <div>
            <label className="label">Montant ({currency}) *</label>
            <input type="number" min="0" step="0.01" className="input-field"
              value={form.montant} onChange={e => f('montant', e.target.value)} />
          </div>
        </div>

        {/* Statut */}
        <div>
          <label className="label">Statut</label>
          <div className="flex gap-2">
            {['Payé', 'En attente'].map(s => (
              <button key={s} type="button"
                onClick={() => f('statut', s)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${form.statut === s
                    ? s === 'Payé' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Preview new status */}
        {montantNum > 0 && (
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-xs">
            <span className="text-slate-500">Statut après ce paiement</span>
            <span className={`font-bold ${afterStatus === 'Soldé' ? 'text-green-600' : afterStatus === 'Partiel' ? 'text-amber-600' : 'text-slate-600'}`}>
              {afterStatus} · {formatCurrency(newPaid, currency)} / {formatCurrency(totalDue, currency)}
            </span>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <input className="input-field" value={form.notes} onChange={e => f('notes', e.target.value)}
            placeholder="Référence virement, numéro chèque…" />
        </div>
      </div>
    </Modal>
  )
}

/* ════════════════════════════════════════════════
   RESERVATIONS PAGE
════════════════════════════════════════════════ */
export const ReservationsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [reservations, setReservations] = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [finances,     setFinances]     = useLocalStorage(STORAGE_KEYS.finances,     [])
  const [documents,    setDocuments]    = useLocalStorage(STORAGE_KEYS.documents,    [])
  const [calendar,     setCalendar]     = useLocalStorage(STORAGE_KEYS.calendar,     [])
  const [clients, setClients]            = useLocalStorage(STORAGE_KEYS.clients, [])
  const [agents]                         = useLocalStorage(STORAGE_KEYS.agents, [])
  const [products]                       = useLocalStorage(STORAGE_KEYS.products, [])
  const [settings]                       = useLocalStorage(STORAGE_KEYS.settings, defaultSettings)
  const [derogations, setDerogations]    = useLocalStorage(STORAGE_KEYS.derogations, [])
  const { toast } = useToast()

  const handleLogDerogation = useCallback((entry) => {
    setDerogations(prev => [{ id: `der-${Date.now()}`, date: todayISO(), ...entry }, ...prev])
  }, [setDerogations])

  const currency = settings?.devise || 'MAD'

  /* ── ui state ── */
  const [search,      setSearch]      = useState('')
  const [filterStatut,setFilterStatut]= useState('')
  const [filterType,  setFilterType]  = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [sortCfg,     setSortCfg]     = useState({ key: 'dateCreation', dir: 'desc' })
  const [page,        setPage]        = useState(1)

  const [showForm,      setShowForm]      = useState(false)
  const [showDetail,    setShowDetail]    = useState(null)   // reservation obj
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [paymentTarget, setPaymentTarget] = useState(null)   // reservation to pay
  const [editing,       setEditing]       = useState(null)
  const [deleting,      setDeleting]      = useState(null)
  const [form,          setForm]          = useState(EMPTY_FORM)

  /* ── payments grouped by reservation ── */
  const payByRes = useMemo(() => {
    const map = {}
    finances
      .filter(f => f.reservationId && f.type === 'Encaissement')
      .forEach(f => {
        if (!map[f.reservationId]) map[f.reservationId] = { paid: 0, pending: 0, payments: [] }
        const amt = parseFloat(f.montant) || 0
        if (f.statut === 'Payé') map[f.reservationId].paid    += amt
        else                     map[f.reservationId].pending += amt
        map[f.reservationId].payments.push(f)
      })
    return map
  }, [finances])

  /* ── places réservées par produit (hors annulées, hors réservation en cours d'édition) ── */
  const reservedByProduct = useMemo(() => {
    const map = {}
    reservations
      .filter(r => r.produitId && r.statut !== 'Annulée' && r.id !== editing?.id)
      .forEach(r => { map[r.produitId] = (map[r.produitId] || 0) + 1 })
    return map
  }, [reservations, editing])

  /* ── toggle sort ── */
  const toggleSort = (key) =>
    setSortCfg(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))

  /* ── filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = reservations.filter(r => {
      if (search && !fuzzyMatch(r.clientNom + r.destination + r.ref, search)) return false
      if (filterStatut && r.statut !== filterStatut) return false
      if (filterType   && r.type   !== filterType)   return false
      if (filterMonth) {
        const d = new Date(r.depart)
        if (isNaN(d) || `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` !== filterMonth) return false
      }
      return true
    })
    return sortByKey(list, sortCfg.key, sortCfg.dir)
  }, [reservations, search, filterStatut, filterType, filterMonth, sortCfg])

  /* ── paginated slice ── */
  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, page])

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:     filtered.length,
    confirmed: filtered.filter(r => r.statut === 'Confirmée').length,
    montant:   sumBy(filtered, 'montant'),
    encaisse:  sumBy(filtered, 'acompte'),
  }), [filtered])

  /* ── month options from data ── */
  const monthOptions = useMemo(() => {
    const set = new Set()
    reservations.forEach(r => {
      if (!r.depart) return
      const d = new Date(r.depart)
      if (!isNaN(d)) set.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
    })
    return [...set].sort().reverse()
  }, [reservations])

  /* ── CRUD ── */
  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, ref: generateRef('RES') })
    setShowForm(true)
  }

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreate()
      navigate('/reservations', { replace: true, state: {} })
    }
  }, [location.state?.openCreate])

  const openEdit = (r) => {
    setEditing(r)
    setForm({ ...r })
    setShowForm(true)
  }

  const confirmDelete = (r) => {
    setDeleting(r)
    setShowConfirm(true)
  }

  const handleSave = () => {
    if (!form.clientNom?.trim()) { toast.error('Le nom du client est requis.'); return }
    if (!form.destination?.trim()) { toast.error('La destination est requise.'); return }
    const bannedError = getBannedCountryError(form.destination)
    if (bannedError) { toast.error(bannedError); return }
    if (!form.depart) { toast.error('La date de départ est requise.'); return }

    if (form.isManagerOverride) {
      handleLogDerogation({
        ref:             form.ref || '—',
        clientNom:       form.clientNom,
        montantBrut:     parseFloat(form.prixVente) || parseFloat(form.montant) || 0,
        remiseDemandee:  form.remisePct,
        remiseAppliquee: form.remisePct,
        margePct: (() => {
          const pa = parseFloat(form.prixAchatTotal) || 0
          const pf = parseFloat(form.montant) || 0
          return pa > 0 && pf > 0 ? (((pf - pa) / pf) * 100).toFixed(1) + '%' : '—'
        })(),
      })
    }

    if (editing) {
      const updated = { ...editing, ...form }
      setReservations(prev => prev.map(r => r.id === editing.id ? updated : r))
      setCalendar(prev => syncReservationToCalendar(prev, updated))
      toast.success('Réservation mise à jour.')
    } else {
      const newId  = `res-${Date.now()}`
      const newRef = form.ref || generateRef('RES')
      const newRes = { ...form, id: newId, ref: newRef }
      setReservations(prev => [newRes, ...prev])
      setCalendar(prev => syncReservationToCalendar(prev, newRes))
      // Auto-create finance transaction for acompte
      const acompteNum = parseFloat(form.acompte) || 0
      if (acompteNum > 0) {
        setFinances(prev => [{
          id:             `tra-${Date.now()}`,
          date:           form.dateCreation || todayISO(),
          libelle:        `Acompte ${newRef} — ${form.clientNom}`,
          type:           'Encaissement',
          montant:        acompteNum,
          statut:         'Payé',
          categorie:      'Ventes',
          notes:          '',
          paymentType:    'Acompte',
          modePaiement:   'Espèces',
          reservationId:  newId,
          reservationRef: newRef,
          clientId:       form.clientId  || '',
          clientNom:      form.clientNom || '',
        }, ...prev])
      }
      toast.success('Réservation créée.')
    }
    setShowForm(false)
    setPage(1)
  }

  const handleDelete = () => {
    setReservations(prev => prev.filter(r => r.id !== deleting.id))
    setCalendar(prev => removeReservationFromCalendar(prev, deleting.id))
    toast.success('Réservation supprimée.')
    setShowConfirm(false)
    setDeleting(null)
  }

  /* ── CSV export ── */
  const exportCSV = () => {
    const header = 'Réf,Client,Destination,Type,Départ,Retour,Statut,Montant,Acompte,Solde\n'
    const rows = filtered.map(r =>
      `${r.ref},"${r.clientNom}","${r.destination}",${r.type},${r.depart},${r.retour},${r.statut},${r.montant},${r.acompte},${solde(r)}`
    ).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `reservations_${todayISO()}.csv`
    a.click()
    toast.success('Export CSV téléchargé.')
  }

  /* ── clear filters ── */
  const hasFilters = search || filterStatut || filterType || filterMonth
  const clearFilters = () => { setSearch(''); setFilterStatut(''); setFilterType(''); setFilterMonth(''); setPage(1) }

  /* ── sortable th ── */
  const Th = ({ col, label, align = 'left' }) => (
    <th
      className={`table-th text-${align} cursor-pointer select-none hover:bg-slate-100`}
      onClick={() => { toggleSort(col); setPage(1) }}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon col={col} sortCol={sortCfg.key} sortDir={sortCfg.dir} />
      </span>
    </th>
  )

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Toolbar ── */}
      <Card>
        <Card.Body className="flex flex-wrap gap-3 items-center justify-between py-3">
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-9"
                placeholder="Rechercher client, destination, réf…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            {/* Filters */}
            <select
              className="input-field w-auto text-sm"
              value={filterStatut}
              onChange={e => { setFilterStatut(e.target.value); setPage(1) }}
            >
              <option value="">Tous les statuts</option>
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>

            <select
              className="input-field w-auto text-sm"
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setPage(1) }}
            >
              <option value="">Tous les types</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>

            <select
              className="input-field w-auto text-sm"
              value={filterMonth}
              onChange={e => { setFilterMonth(e.target.value); setPage(1) }}
            >
              <option value="">Tous les mois</option>
              {monthOptions.map(m => {
                const [y, mo] = m.split('-')
                const label = new Date(+y, +mo - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                return <option key={m} value={m}>{label}</option>
              })}
            </select>

            {hasFilters && (
              <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
                Effacer
              </Button>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" icon={Download} onClick={exportCSV}>CSV</Button>
            <Button icon={Plus} onClick={openCreate}>Nouvelle</Button>
          </div>
        </Card.Body>
      </Card>

      {/* ── Stats strip ── */}
      <Card noPadding>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          <Stat icon={CalendarDays} label="Résultats"      value={`${stats.total} réservation(s)`} />
          <Stat icon={CheckCircle}  label="Confirmées"     value={stats.confirmed} color="text-green-600" />
          <Stat icon={Banknote}     label="Montant total"  value={formatCurrency(stats.montant, currency)} />
          <Stat icon={Clock}        label="Encaissé"       value={formatCurrency(stats.encaisse, currency)} color="text-primary-600" />
        </div>
      </Card>

      {/* ── Table ── */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th col="ref"          label="Réf" />
                <Th col="clientNom"    label="Client" />
                <Th col="destination"  label="Destination" />
                <Th col="type"         label="Type" />
                <Th col="depart"       label="Départ" />
                <Th col="statut"       label="Statut" />
                <Th col="montant"      label="Montant" align="right" />
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <CalendarDays className="w-10 h-10 opacity-30" />
                      <p className="text-sm">
                        {hasFilters ? 'Aucune réservation ne correspond aux filtres.' : 'Aucune réservation enregistrée.'}
                      </p>
                      {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>Effacer les filtres</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(r => {
                const agent = agents.find(a => a.id === r.agentId)
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="table-td font-mono text-xs text-primary-600 whitespace-nowrap">{r.ref}</td>
                    <td className="table-td">
                      <div>
                        <p className="font-medium text-slate-800">{r.clientNom}</p>
                        {agent && <p className="text-xs text-slate-400">{agent.nom}</p>}
                      </div>
                    </td>
                    <td className="table-td text-slate-600 max-w-[160px]">
                      <div className="flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                        <span className="truncate">{r.destination}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <Badge variant="info">{r.type}</Badge>
                    </td>
                    <td className="table-td whitespace-nowrap text-slate-600">{formatDate(r.depart)}</td>
                    <td className="table-td"><StatusBadge statut={r.statut} /></td>
                    <td className="table-td text-right">
                      {(() => {
                        const ps = r.statut !== 'Annulée' ? computePayStatus(r, payByRes) : null
                        return (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-800 whitespace-nowrap">{formatCurrency(r.montant, currency)}</p>
                            {ps && (
                              <span className={`inline-flex text-xs font-medium px-1.5 py-0.5 rounded border ${ps.bg} ${ps.color} ${ps.border}`}>
                                {ps.label}{ps.pct > 0 && ps.pct < 100 ? ` ${ps.pct}%` : ''}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowDetail(r)}
                          className="p-1.5 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(r)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PER_PAGE && (
          <Pagination
            page={page}
            total={filtered.length}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        )}
      </Card>

      {/* ── Modals ── */}
      {showForm && (
        <ReservationForm
          form={form}
          setForm={setForm}
          clients={clients}
          onClientCreated={(client) => {
            setClients(prev => [client, ...prev])
            toast.success(`Client "${client.nom}" créé`)
          }}
          agents={agents}
          products={products}
          reservations={reservations}
          settings={settings}
          reservedByProduct={reservedByProduct}
          currency={currency}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
          isEdit={!!editing}
        />
      )}

      {showDetail && (
        <DetailModal
          r={showDetail}
          agents={agents}
          payByRes={payByRes}
          currency={currency}
          resDocs={documents.filter(d => d.reservationId === showDetail.id)}
          onAddDoc={doc => setDocuments(prev => [doc, ...prev])}
          onDeleteDoc={id => setDocuments(prev => prev.filter(d => d.id !== id))}
          onEdit={openEdit}
          onDelete={confirmDelete}
          onClose={() => setShowDetail(null)}
          onAddPayment={(r) => { setShowDetail(null); setPaymentTarget(r) }}
        />
      )}

      {paymentTarget && (
        <PaymentQuickModal
          reservation={paymentTarget}
          payStatus={computePayStatus(paymentTarget, payByRes)}
          currency={currency}
          onClose={() => setPaymentTarget(null)}
          onSave={(transaction) => {
            const nextFinances = [transaction, ...finances]
            setFinances(nextFinances)
            setReservations(prev =>
              applyAcompteFromFinances(prev, nextFinances, [paymentTarget.id]),
            )
            setPaymentTarget(null)
            toast.success('Paiement enregistré.')
          }}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer la réservation"
          message={`Supprimer "${deleting?.ref}" ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
        />
      )}
    </div>
  )
}
