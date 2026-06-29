import React, { useState } from 'react'
import { UserCheck } from 'lucide-react'
import { Button, Modal } from '../UI'
import { AGENT_POSTES, EMPTY_AGENT, newAgentId, validateAgentForm } from './defaults'

export const QuickAgentModal = ({ onClose, onSave, title = 'Nouvel agent' }) => {
  const [form, setForm] = useState({ ...EMPTY_AGENT })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    const nextErrors = validateAgentForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    onSave({
      ...form,
      id: newAgentId(),
      nom: form.nom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
    })
    onClose()
  }

  const fieldError = (key) =>
    errors[key] ? <p className="text-xs text-red-500 mt-1">{errors[key]}</p> : null

  return (
    <Modal
      title={title}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button icon={UserCheck} onClick={handleSubmit}>Créer l'agent</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nom complet <span className="text-red-500">*</span></label>
            <input
              className={`input-field ${errors.nom ? 'border-red-300 ring-1 ring-red-200' : ''}`}
              value={form.nom}
              onChange={e => set('nom', e.target.value)}
              placeholder="Prénom Nom"
              autoFocus
            />
            {fieldError('nom')}
          </div>
          <div>
            <label className="label">Poste</label>
            <select className="input-field" value={form.poste} onChange={e => set('poste', e.target.value)}>
              {AGENT_POSTES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className={`input-field ${errors.email ? 'border-red-300 ring-1 ring-red-200' : ''}`}
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="prenom.nom@agence.ma"
            />
            {fieldError('email')}
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input
              className="input-field"
              value={form.telephone}
              onChange={e => set('telephone', e.target.value)}
              placeholder="06XXXXXXXX"
            />
          </div>
          <div>
            <label className="label">Date d'embauche</label>
            <input
              type="date"
              className="input-field"
              value={form.dateEmbauche}
              onChange={e => set('dateEmbauche', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Objectif mensuel (MAD)</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={form.objectifMensuel}
              onChange={e => set('objectifMensuel', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
