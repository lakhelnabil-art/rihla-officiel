import React, { useState, useEffect } from 'react'
import {
  Plus, Settings, ChevronLeft, Building2,
  Trash2, Edit2, ShieldCheck, Eye, EyeOff,
} from 'lucide-react'
import { usePlatform } from '../../context/PlatformContext'
import { useAuth } from '../../context/AuthContext'
import { ApiError, api } from '../../api/client'
import { CountryCityPhoneFields } from '../../components/Geo/CountryCityPhoneFields'
import {
  OTHER_COUNTRY, applyDialPrefix, getCountry, resolvePaysLabel,
} from '../../data/geoCountries'
import { ERP_BRAND, ERP_BRAND_FULL } from '../../content/erpPositioning'

/* ─── helpers ─────────────────────────────────────────────────────── */

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── NewAgencyModal ──────────────────────────────────────────────── */

const EMPTY = {
  nom: '',
  logo: '',
  templateId: 'rihla-demo',
  withDemo: true,
  paysCode: 'MA',
  paysLibre: '',
  ville: '',
  adresse: '',
  telephone: '+212 ',
  email: '',
  siteWeb: '',
  iceNumber: '',
}

const TEMPLATE_LABELS = {
  vide: 'Vierge',
  'rihla-demo': 'Démo Rihla',
  'bab-annaser': 'Modèle Bab Annaser',
}

const NewAgencyModal = ({ onClose, onCreated }) => {
  const { createAgency } = usePlatform()
  const [form, setForm] = useState(EMPTY)
  const [templates, setTemplates] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getAgencyTemplates().then(r => setTemplates(r.templates || [])).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedTemplate = templates.find(t => t.id === form.templateId)

  const applyTemplateDefaults = (templateId) => {
    set('templateId', templateId)
    if (templateId === 'bab-annaser') {
      setForm(f => ({
        ...f,
        templateId,
        withDemo: true,
        paysCode: 'MA',
        paysLibre: '',
        ville: f.ville || 'Essaouira',
        adresse: f.adresse || 'Rue Okba Ibn Nafiaa, Essaouira 44000',
        telephone: f.telephone?.trim() ? f.telephone : '+212 524 78 00 00',
        email: f.email || 'contact@babannaser.ma',
      }))
    } else if (templateId === 'vide') {
      setForm(f => ({ ...f, templateId, withDemo: false }))
    } else {
      setForm(f => ({
        ...f,
        templateId,
        withDemo: true,
        paysCode: f.paysCode || 'MA',
        telephone: f.telephone?.trim() ? f.telephone : applyDialPrefix(getCountry('MA')?.dial, f.telephone, { onlyIfEmpty: true }),
      }))
    }
  }

  const handlePaysCodeChange = (code) => {
    const country = getCountry(code)
    setForm(f => ({
      ...f,
      paysCode: code,
      paysLibre: code === OTHER_COUNTRY ? f.paysLibre : '',
      ville: f.paysCode !== code ? '' : f.ville,
      telephone: code === OTHER_COUNTRY
        ? f.telephone
        : applyDialPrefix(country?.dial, f.telephone),
    }))
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('logo', reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!form.nom.trim()) { setError("Le nom de l'agence est requis."); return }
    setSaving(true)
    setError('')
    try {
      const agency = await createAgency({
        nom: form.nom.trim(),
        logo: form.logo || null,
        templateId: form.templateId,
        withDemo: form.templateId === 'vide' ? false : form.withDemo,
        pays: resolvePaysLabel(form),
        paysCode: form.paysCode,
        paysLibre: form.paysLibre.trim(),
        ville: form.ville.trim(),
        adresse: form.adresse.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        siteWeb: form.siteWeb.trim(),
        iceNumber: form.iceNumber.trim(),
      })
      onCreated(agency)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8">

        <div className="bg-navy-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Nouvelle agence</h2>
            <p className="text-white/50 text-xs mt-0.5">Plateforme Rihla — choisissez un modèle</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Modèle de départ</label>
            <div className="grid gap-2">
              {(templates.length ? templates : Object.entries(TEMPLATE_LABELS).map(([id, label]) => ({ id, label, description: '' }))).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplateDefaults(t.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                    form.templateId === t.id
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                  {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                  {t.isReference && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Référence</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom de l'agence <span className="text-red-500">*</span>
            </label>
            <input
              className="input-field"
              placeholder={form.templateId === 'bab-annaser' ? 'Ex: Bab Annaser Voyages' : 'Ex: Agence Casablanca Centre'}
              value={form.nom}
              onChange={e => set('nom', e.target.value)}
              autoFocus
            />
          </div>

          <CountryCityPhoneFields
            paysCode={form.paysCode}
            paysLibre={form.paysLibre}
            ville={form.ville}
            telephone={form.telephone}
            onPaysCodeChange={handlePaysCodeChange}
            onPaysLibreChange={v => set('paysLibre', v)}
            onVilleChange={v => set('ville', v)}
            onTelephoneChange={v => set('telephone', v)}
            cityListId="new-agency-villes"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input className="input-field" value={form.adresse} onChange={e => set('adresse', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email agence</label>
              <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ICE</label>
              <input className="input-field" value={form.iceNumber} onChange={e => set('iceNumber', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo (optionnel)</label>
            {form.logo ? (
              <div className="flex items-center gap-3">
                <img src={form.logo} alt="" className="w-12 h-12 rounded-lg object-contain border border-slate-200 p-1" />
                <button onClick={() => set('logo', '')} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={handleLogo} className="text-sm text-slate-500" />
            )}
          </div>

          {form.templateId !== 'vide' && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.withDemo}
                onChange={e => set('withDemo', e.target.checked)}
                className="w-4 h-4 accent-navy"
              />
              <span className="text-sm text-slate-600">
                Charger des <strong>données de démonstration</strong>
                {selectedTemplate?.label ? ` (${selectedTemplate.label})` : ''}
              </span>
            </label>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end border-t border-slate-100 pt-4">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Création…' : "Créer l'agence"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── SuperAdminPanel ─────────────────────────────────────────────── */

const SuperAdminPanel = ({ onClose }) => {
  const { agencies, deleteAgency, setSuperPin } = usePlatform()
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const handleSavePin = async () => {
    if (newPin.length < 4 || currentPin.length < 4) return
    try {
      await setSuperPin(currentPin, newPin)
      setNewPin('')
      setCurrentPin('')
      setSaved(true)
      setError('')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="bg-navy-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold" />
            <h2 className="text-white font-bold text-lg">Super-admin</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Change super PIN */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Changer le PIN super-admin</h3>
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <div className="space-y-2">
              <input
                type="password"
                className="input-field tracking-widest font-bold"
                placeholder="PIN actuel"
                value={currentPin}
                maxLength={8}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPin ? 'text' : 'password'}
                  className="input-field pr-10 tracking-widest font-bold"
                  placeholder="Nouveau PIN (min. 4 chiffres)"
                  value={newPin}
                  maxLength={8}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSavePin}
                disabled={newPin.length < 4 || currentPin.length < 4}
                className="btn-primary disabled:opacity-40"
              >
                {saved ? 'Enregistré ✓' : 'Enregistrer'}
              </button>
            </div>
            </div>
          </div>

          {/* Agency list */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Agences enregistrées ({agencies.length})
            </h3>
            {agencies.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucune agence créée.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {agencies.map(ag => (
                  <div key={ag.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {ag.logo
                        ? <img src={ag.logo} alt="" className="w-full h-full object-contain rounded-lg" />
                        : initials(ag.nom)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{ag.nom}</p>
                      <p className="text-xs text-slate-400">Créée le {formatDate(ag.createdAt)}</p>
                    </div>
                    {confirmDel === ag.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600">Confirmer ?</span>
                        <button
                          onClick={() => { deleteAgency(ag.id); setConfirmDel(null) }}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Oui
                        </button>
                        <button
                          onClick={() => setConfirmDel(null)}
                          className="text-xs text-slate-500"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDel(ag.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── PlatformScreen ──────────────────────────────────────────────── */

export const PlatformScreen = () => {
  const { agencies, selectAgency, verifySuperPin, logout } = usePlatform()
  const { user } = useAuth()
  const [showNew,    setShowNew]    = useState(false)
  const [showAdmin,  setShowAdmin]  = useState(false)
  const [pinPrompt,  setPinPrompt]  = useState(false)
  const [pin,        setPin]        = useState('')
  const [pinError,   setPinError]   = useState('')
  const [loading,    setLoading]    = useState(false)

  const handleAgencyClick = async (ag) => {
    setLoading(true)
    try {
      await selectAgency(ag.id)
    } finally {
      setLoading(false)
    }
  }

  const openAdmin = () => { setPinPrompt(true); setPin(''); setPinError('') }

  const checkAdminPin = async () => {
    try {
      await verifySuperPin(pin)
      setPinPrompt(false)
      setShowAdmin(true)
    } catch {
      setPinError('PIN incorrect')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen bg-navy-700 flex flex-col items-center justify-center p-6">

      {/* Modals */}
      {showNew && (
        <NewAgencyModal
          onClose={() => setShowNew(false)}
          onCreated={async (ag) => { setShowNew(false); await selectAgency(ag.id) }}
        />
      )}
      {showAdmin && <SuperAdminPanel onClose={() => setShowAdmin(false)} />}

      {/* PIN prompt for super-admin */}
      {pinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-800">Accès super-admin</h2>
            </div>
            <input
              type="password"
              className="input-field text-center text-2xl tracking-[0.6em] font-bold"
              placeholder="••••"
              value={pin}
              maxLength={8}
              onChange={e => { setPin(e.target.value); setPinError('') }}
              onKeyDown={e => e.key === 'Enter' && checkAdminPin()}
              autoFocus
            />
            {pinError && <p className="text-xs text-red-500 text-center">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setPinPrompt(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={checkAdminPin} className="btn-primary flex-1">Entrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Platform header */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center p-1.5">
              <img src="/rihla-mark.svg" alt="Rihla" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Rihla Platform</h1>
              <p className="text-white/40 text-xs">{ERP_BRAND_FULL} — une plateforme, un {ERP_BRAND} par agence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAdmin}
              className="p-2 text-white/30 hover:text-white/70 transition-colors"
              title="Super-admin"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="text-xs text-white/40 hover:text-white/80 px-3 py-1.5 rounded-lg border border-white/10"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {user && (
          <p className="text-white/30 text-xs mb-6 -mt-6">Connecté en tant que {user.email}</p>
        )}

        {/* Agency list */}
        {agencies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg font-medium mb-1">{ERP_BRAND_FULL}</p>
            <p className="text-white/30 text-sm mb-8 max-w-md mx-auto">
              Créez des agences avec leur {ERP_BRAND} complet et isolé : CRM, réservations, finances, facturation et pilotage. Chaque agence démarre vierge ou avec un modèle de référence (Bab Annaser).
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 bg-gold text-navy font-bold px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors"
            >
              <Plus className="w-5 h-5" /> Créer une agence
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm mb-4 font-medium uppercase tracking-wide">
              Choisissez une agence
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {agencies.map(ag => (
                <button
                  key={ag.id}
                  onClick={() => handleAgencyClick(ag)}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl px-5 py-4 text-left transition-all duration-200 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                    {ag.logo
                      ? <img src={ag.logo} alt="" className="w-full h-full object-contain p-1" />
                      : <span className="text-gold font-bold text-lg">{initials(ag.nom)}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{ag.nom}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {ag.ville ? `${ag.ville} · ` : ''}Créée le {formatDate(ag.createdAt)}
                    </p>
                    {ag.templateId && ag.templateId !== 'vide' && (
                      <span className="inline-block mt-1 text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                        {TEMPLATE_LABELS[ag.templateId] || ag.templateId}
                      </span>
                    )}
                  </div>
                  <ChevronLeft className="w-4 h-4 text-white/20 rotate-180 group-hover:text-white/60 transition-colors flex-shrink-0" />
                </button>
              ))}

              {/* Add new agency card */}
              <button
                onClick={() => setShowNew(true)}
                className="bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 rounded-2xl px-5 py-4 text-left transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-white/30" />
                </div>
                <p className="text-white/40 font-medium text-sm">Nouvelle agence</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
