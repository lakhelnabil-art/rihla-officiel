import React, { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button, Modal } from '../UI'
import { ClientFormFields } from './ClientFormFields'
import { EMPTY_CLIENT, newClientId, validateClientForm, normalizeClient } from './defaults'

export const QuickClientModal = ({ onClose, onSave, title = 'Nouveau client' }) => {
  const [form, setForm] = useState({ ...EMPTY_CLIENT })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    const nextErrors = validateClientForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    onSave(normalizeClient({
      ...form,
      id: newClientId(),
      nom: form.nom.trim(),
      telephone: form.telephone.trim(),
      telephoneSecondaire: (form.telephoneSecondaire || '').trim(),
      email: form.email.trim(),
      ville: form.ville.trim(),
      cin: form.cin.trim(),
      adresse: form.adresse.trim(),
      notes: form.notes.trim(),
      contactUrgenceNom: (form.contactUrgenceNom || '').trim(),
      contactUrgenceTel: (form.contactUrgenceTel || '').trim(),
      profession: (form.profession || '').trim(),
      entreprise: (form.entreprise || '').trim(),
      preferencesVoyage: (form.preferencesVoyage || '').trim(),
    }))
    onClose()
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button icon={UserPlus} onClick={handleSubmit}>Créer le client</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <ClientFormFields form={form} setForm={setForm} errors={errors} compact />
      </form>
    </Modal>
  )
}
