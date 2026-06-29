import React, { useState } from 'react'
import { Plus, User } from 'lucide-react'
import { Button } from '../UI'
import { QuickClientModal } from './QuickClientModal'

const RECHERCHE = {
  lbl: { fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 },
  inp: {
    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '9px 12px', color: 'var(--text)', fontSize: '.85rem',
    outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  },
  row: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  btn: {
    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
    padding: '9px 12px', borderRadius: 8, background: 'rgba(108,99,255,.12)',
    border: '1px solid rgba(108,99,255,.3)', color: 'var(--accent)',
    fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
}

/**
 * Sélecteur client + bouton « Nouveau client » (ERP ou modules Recherche).
 */
export const ClientPickerField = ({
  clients = [],
  clientId = '',
  clientNom = '',
  onClientIdChange,
  onClientNomChange,
  onClientCreated,
  variant = 'tailwind',
  label = 'Client',
  required = true,
  showPhoneInOption = true,
}) => {
  const [showModal, setShowModal] = useState(false)

  const selectClient = (id) => {
    const c = clients.find(x => String(x.id) === String(id))
    onClientIdChange?.(id, c)
    onClientNomChange?.(c?.nom || '')
  }

  const handleCreated = (client) => {
    onClientCreated?.(client)
    onClientIdChange?.(client.id, client)
    onClientNomChange?.(client.nom)
    setShowModal(false)
  }

  const nouveauBtn = variant === 'recherche' ? (
    <button type="button" onClick={() => setShowModal(true)} style={RECHERCHE.btn} title="Nouveau client">
      <Plus size={14} /> Nouveau
    </button>
  ) : (
    <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
      Nouveau client
    </Button>
  )

  const labelEl = variant === 'recherche' ? (
    <label style={RECHERCHE.lbl}>
      {label.toUpperCase()} {required && <span style={{ color: 'var(--red)' }}>*</span>}
    </label>
  ) : (
    <label className="label flex items-center justify-between gap-2">
      <span>{label} {required && <span className="text-red-500">*</span>}</span>
    </label>
  )

  const content = clients.length > 0 ? (
    <select
      required={required}
      value={clientId}
      onChange={e => selectClient(e.target.value)}
      style={variant === 'recherche' ? RECHERCHE.inp : undefined}
      className={variant === 'tailwind' ? 'input-field flex-1 min-w-0' : undefined}
    >
      <option value="">── Choisir un client ──</option>
      {clients.map(c => (
        <option key={c.id} value={c.id}>
          {c.nom}{showPhoneInOption && c.telephone ? ` · ${c.telephone}` : ''}
        </option>
      ))}
    </select>
  ) : (
    <input
      required={required}
      value={clientNom}
      onChange={e => onClientNomChange?.(e.target.value)}
      placeholder="Nom complet du client"
      style={variant === 'recherche' ? RECHERCHE.inp : undefined}
      className={variant === 'tailwind' ? 'input-field flex-1 min-w-0' : undefined}
    />
  )

  return (
    <>
      <div className={variant === 'tailwind' ? 'space-y-1.5' : undefined}>
        {labelEl}
        <div style={variant === 'recherche' ? RECHERCHE.row : undefined}
          className={variant === 'tailwind' ? 'flex gap-2 items-stretch' : undefined}>
          <div style={variant === 'recherche' ? { flex: 1, minWidth: 0 } : undefined}
            className={variant === 'tailwind' ? 'flex-1 min-w-0' : undefined}>
            {content}
          </div>
          {nouveauBtn}
        </div>
        {variant === 'tailwind' && clientId && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <User className="w-3 h-3" />
            {clients.find(c => String(c.id) === String(clientId))?.ville || 'Ville non renseignée'}
          </p>
        )}
      </div>
      {showModal && (
        <QuickClientModal
          onClose={() => setShowModal(false)}
          onSave={handleCreated}
        />
      )}
    </>
  )
}
