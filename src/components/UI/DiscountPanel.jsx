import React, { useState, useMemo } from 'react'
import {
  Lock, Unlock, Tag, Users, CalendarCheck,
  Gift, UserPlus, ShieldAlert,
} from 'lucide-react'
import { calculateDiscount } from '../../utils/discount'
import { applyDiscountWithMarginProtection } from '../../utils/margin'
import { Modal } from './Modal'
import { Button } from './Button'

/* ── Traffic-light margin indicator ── */
export const MarginIndicator = ({ margePct }) => {
  const pct = parseFloat(margePct) || 0
  if (pct >= 20) return (
    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <span className="text-base">🟢</span>
      <span className="font-medium">Marge confortable — {pct.toFixed(1)}%</span>
    </div>
  )
  if (pct >= 10) return (
    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <span className="text-base">🟡</span>
      <span className="font-medium">Marge acceptable — {pct.toFixed(1)}%</span>
    </div>
  )
  return (
    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <span className="text-base">🔴</span>
      <span className="font-medium">Marge insuffisante — {pct.toFixed(1)}% — réduction plafonnée</span>
    </div>
  )
}

/* ── PIN override modal ── */
export const PINModal = ({ settings, onSuccess, onClose }) => {
  const [pin,   setPin]   = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const adminPin = settings?.adminPin || '1234'
    if (pin === adminPin) { onSuccess(); onClose() }
    else { setError('Code PIN incorrect'); setPin('') }
  }

  return (
    <Modal
      onClose={onClose}
      title="Dérogation manager requise"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button icon={Unlock} onClick={handleSubmit} disabled={pin.length < 4}>Confirmer</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            La réduction demandée dépasse la marge minimale autorisée. Saisissez le code PIN administrateur pour forcer la dérogation.
          </p>
        </div>
        <div>
          <label className="label">Code PIN administrateur</label>
          <input
            type="password"
            maxLength={8}
            className="input-field text-center text-lg tracking-widest"
            placeholder="••••"
            value={pin}
            onChange={e => { setPin(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && pin.length >= 4 && handleSubmit()}
            autoFocus
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>
    </Modal>
  )
}

/* ── Manual trigger options ── */
const MANUAL_OPTIONS = [
  { key: 'groupe',       label: 'Groupe (5+ personnes)',        pct: 7, icon: Users        },
  { key: 'anticipe',     label: 'Réservation anticipée (90j+)', pct: 5, icon: CalendarCheck },
  { key: 'anniversaire', label: 'Anniversaire client',          pct: 3, icon: Gift          },
  { key: 'parrainage',   label: 'Parrainage',                   pct: 2, icon: UserPlus      },
]

/* ── Main DiscountPanel component ── */
export const DiscountPanel = ({
  clientId,
  clients,
  reservations,
  totalBrut,
  prixAchatTotal,
  settings,
  manualTriggers,
  onManualChange,
  onDiscountChange, // ({ pct, label, isManagerOverride })
}) => {
  const [showPIN,           setShowPIN]           = useState(false)
  const [isManagerOverride, setIsManagerOverride] = useState(false)

  const client      = clients.find(c => c.id === clientId) || {}
  const clientResas = (reservations || []).filter(r => r.clientId === clientId && r.statut !== 'Annulée')

  const enrichedClient = useMemo(() => ({
    ...client,
    totalReservations: clientResas.length,
    isBirthdayMonth: (() => {
      if (!client.dateNaissance) return false
      return new Date(client.dateNaissance).getMonth() === new Date().getMonth()
    })(),
  }), [client, clientResas.length])

  const result   = calculateDiscount(enrichedClient, totalBrut, manualTriggers)
  const margeMin = settings?.margeMinimale ?? 10
  const prixAchat = parseFloat(prixAchatTotal) || 0

  const marginResult = useMemo(() => {
    if (!prixAchat || !totalBrut) return null
    return applyDiscountWithMarginProtection(
      prixAchat, totalBrut, result.percentage,
      isManagerOverride, margeMin
    )
  }, [prixAchat, totalBrut, result.percentage, isManagerOverride, margeMin])

  const finalPct  = marginResult ? marginResult.discountApplied : result.percentage
  const isBlocked = marginResult?.blockedByMargin && !isManagerOverride

  // auto-tick anniversaire if birthday month
  useMemo(() => {
    if (enrichedClient.isBirthdayMonth && !manualTriggers.anniversaire) {
      onManualChange('anniversaire', true)
    }
  }, [enrichedClient.isBirthdayMonth])

  // notify parent on discount change
  useMemo(() => {
    onDiscountChange({ pct: finalPct, label: result.label, isManagerOverride })
  }, [finalPct, result.label, isManagerOverride])

  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" /> Réductions commerciales
        </p>
        {finalPct > 0 && (
          <span className="text-xs font-bold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
            {result.label} — {finalPct}%
          </span>
        )}
      </div>

      {/* Auto badges */}
      <div className="flex flex-wrap gap-2">
        {result.loyalty.value > 0 && (
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium
            ${result.source === 'loyalty' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            ⭐ {result.loyalty.label} ({result.loyalty.value}%)
          </span>
        )}
        {result.amount.value > 0 && (
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium
            ${result.source === 'amount' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
            💰 {result.amount.label} ({result.amount.value}%)
          </span>
        )}
        {result.loyalty.value === 0 && result.amount.value === 0 && (
          <span className="text-xs text-slate-400 italic">Aucune réduction automatique</span>
        )}
      </div>

      {/* Manual checkboxes */}
      <div className="grid grid-cols-2 gap-2">
        {MANUAL_OPTIONS.map(({ key, label, pct, icon: Icon }) => (
          <label key={key}
            className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-xs font-medium transition-colors
              ${manualTriggers[key]
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            <input type="checkbox" className="accent-primary-600 flex-shrink-0"
              checked={!!manualTriggers[key]}
              onChange={e => onManualChange(key, e.target.checked)} />
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{label}</span>
            <span className="ml-auto flex-shrink-0 font-bold">{pct}%</span>
          </label>
        ))}
      </div>

      <p className="text-xs text-slate-400 italic">
        Règle de cumul : seule la réduction la plus avantageuse est appliquée · Plafond : 10%
      </p>

      {/* Margin protection */}
      {marginResult && (
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <MarginIndicator margePct={marginResult.margePct} />
          {marginResult.warning && (
            <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border
              ${isManagerOverride
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-red-50 border-red-200 text-red-700'}`}
            >
              {isBlocked
                ? <button onClick={() => setShowPIN(true)} className="flex items-center gap-1.5 font-medium hover:underline">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    {marginResult.warning} Cliquez 🔒 pour déroger.
                  </button>
                : <span><ShieldAlert className="w-3.5 h-3.5 inline mr-1" />{marginResult.warning}</span>
              }
            </div>
          )}
        </div>
      )}

      {showPIN && (
        <PINModal
          settings={settings}
          onSuccess={() => { setIsManagerOverride(true); setShowPIN(false) }}
          onClose={() => setShowPIN(false)}
        />
      )}
    </div>
  )
}
