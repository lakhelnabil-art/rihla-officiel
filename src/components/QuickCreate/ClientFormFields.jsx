import React, { useCallback } from 'react'
import {
  CLIENT_TAGS, CLIENT_VILLES, CLIENT_CIVILITES, CLIENT_DOC_TYPES,
  CLIENT_NATIONALITES, CLIENT_LANGUES, CLIENT_SOURCES, CLIENT_TRAVEL_TYPES,
} from './defaults'

const SectionTitle = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{children}</p>
)

const FieldError = ({ message }) =>
  message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null

/**
 * Shared client form fields — CRM full form & quick-create modal.
 * @param {{ compact?: boolean }} compact — identity + contact only (quick modal)
 */
export const ClientFormFields = ({ form, setForm, errors = {}, compact = false }) => {
  const f = useCallback((field, val) => {
    setForm(p => ({ ...p, [field]: val }))
  }, [setForm])

  const errCls = (key) => errors[key] ? 'border-red-300 ring-1 ring-red-200' : ''
  const docLabel = form.typeDocument === 'Passeport' ? 'N° passeport' : 'N° document'

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle>Identité</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Civilité</label>
            <select className="input-field" value={form.civilite || ''} onChange={e => f('civilite', e.target.value)}>
              <option value="">—</option>
              {CLIENT_CIVILITES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Profil client</label>
            <select className="input-field" value={form.tag} onChange={e => f('tag', e.target.value)}>
              {CLIENT_TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Nom complet <span className="text-red-500">*</span></label>
            <input
              className={`input-field ${errCls('nom')}`}
              value={form.nom}
              onChange={e => f('nom', e.target.value)}
              placeholder="Prénom Nom"
            />
            <FieldError message={errors.nom} />
          </div>
          <div>
            <label className="label">Téléphone <span className="text-red-500">*</span></label>
            <input
              className={`input-field ${errCls('telephone')}`}
              value={form.telephone}
              onChange={e => f('telephone', e.target.value)}
              placeholder="06XXXXXXXX"
            />
            <FieldError message={errors.telephone} />
          </div>
          <div>
            <label className="label">WhatsApp / 2e tél.</label>
            <input
              className={`input-field ${errCls('telephoneSecondaire')}`}
              value={form.telephoneSecondaire || ''}
              onChange={e => f('telephoneSecondaire', e.target.value)}
              placeholder="Optionnel"
            />
            <FieldError message={errors.telephoneSecondaire} />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className={`input-field ${errCls('email')}`}
              value={form.email}
              onChange={e => f('email', e.target.value)}
              placeholder="exemple@email.com"
            />
            <FieldError message={errors.email} />
          </div>
          <div>
            <label className="label">Ville</label>
            <select className="input-field" value={form.ville} onChange={e => f('ville', e.target.value)}>
              <option value="">— Sélectionner —</option>
              {CLIENT_VILLES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Nationalité</label>
            <select className="input-field" value={form.nationalite || ''} onChange={e => f('nationalite', e.target.value)}>
              {CLIENT_NATIONALITES.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Langue</label>
            <select className="input-field" value={form.langue || 'Français'} onChange={e => f('langue', e.target.value)}>
              {CLIENT_LANGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <div>
            <SectionTitle>Document de voyage</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Type de document</label>
                <select className="input-field" value={form.typeDocument || 'CIN'} onChange={e => f('typeDocument', e.target.value)}>
                  {CLIENT_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{docLabel}</label>
                <input className="input-field" value={form.cin} onChange={e => f('cin', e.target.value)} placeholder="AB123456" />
              </div>
              <div>
                <label className="label">Date de naissance</label>
                <input type="date" className="input-field" value={form.dateNaissance} onChange={e => f('dateNaissance', e.target.value)} />
              </div>
              <div>
                <label className="label">Expiration document</label>
                <input
                  type="date"
                  className={`input-field ${errCls('dateExpirationDocument')}`}
                  value={form.dateExpirationDocument || ''}
                  onChange={e => f('dateExpirationDocument', e.target.value)}
                />
                <FieldError message={errors.dateExpirationDocument} />
              </div>
              <div>
                <label className="label">Pays d&apos;émission</label>
                <input className="input-field" value={form.paysEmission || ''} onChange={e => f('paysEmission', e.target.value)} placeholder="Maroc" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Adresse</label>
                <input className="input-field" value={form.adresse} onChange={e => f('adresse', e.target.value)} placeholder="Rue, quartier, ville" />
              </div>
            </div>
          </div>

          <div>
            <SectionTitle>Contact d&apos;urgence</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nom du contact</label>
                <input className="input-field" value={form.contactUrgenceNom || ''} onChange={e => f('contactUrgenceNom', e.target.value)} placeholder="Proche, conjoint…" />
              </div>
              <div>
                <label className="label">Téléphone urgence</label>
                <input
                  className={`input-field ${errCls('contactUrgenceTel')}`}
                  value={form.contactUrgenceTel || ''}
                  onChange={e => f('contactUrgenceTel', e.target.value)}
                  placeholder="06XXXXXXXX"
                />
                <FieldError message={errors.contactUrgenceTel} />
              </div>
            </div>
          </div>

          <div>
            <SectionTitle>Profil commercial & préférences</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Profession</label>
                <input className="input-field" value={form.profession || ''} onChange={e => f('profession', e.target.value)} placeholder="Commerçant, cadre…" />
              </div>
              <div>
                <label className="label">Entreprise</label>
                <input className="input-field" value={form.entreprise || ''} onChange={e => f('entreprise', e.target.value)} placeholder="Société (MICE / corporate)" />
              </div>
              <div>
                <label className="label">Source d&apos;acquisition</label>
                <select className="input-field" value={form.source || ''} onChange={e => f('source', e.target.value)}>
                  <option value="">— Non renseigné —</option>
                  {CLIENT_SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Type de voyage préféré</label>
                <select className="input-field" value={form.typeVoyagePref || ''} onChange={e => f('typeVoyagePref', e.target.value)}>
                  <option value="">— Non renseigné —</option>
                  {CLIENT_TRAVEL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Préférences voyage</label>
                <textarea
                  className="input-field resize-none h-16"
                  value={form.preferencesVoyage || ''}
                  onChange={e => f('preferencesVoyage', e.target.value)}
                  placeholder="Destinations favorites, classe affaires, régime alimentaire, compagnie préférée…"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Notes internes</label>
                <textarea
                  className="input-field resize-none h-20"
                  value={form.notes}
                  onChange={e => f('notes', e.target.value)}
                  placeholder="Allergies, remarques commerciales, historique relation…"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {compact && (
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input-field resize-none h-16"
            value={form.notes}
            onChange={e => f('notes', e.target.value)}
            placeholder="Préférences, remarques…"
          />
        </div>
      )}
    </div>
  )
}
