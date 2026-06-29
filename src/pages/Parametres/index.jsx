import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Settings, Building2, CreditCard, Bell, Database,
  Save, RotateCcw, Trash2, Download, Upload,
  CheckCircle, AlertTriangle, Globe, Mail,
  FileText, Shield, ChevronRight, Eye, EyeOff,
  Image as ImageIcon, Lock, ShieldAlert, Link2, Copy, UserPlus, Users,
  FolderOpen, Plug,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'
import { usePlatform } from '../../context/PlatformContext'
import { useAgencyData } from '../../context/AgencyDataContext'
import { STORAGE_KEYS, defaultSettings, getAgencySeedPayload } from '../../utils/sampleData'
import { api } from '../../api/client'
import { Button, Card, ConfirmModal, Badge } from '../../components/UI'
import { formatDate, formatCurrency } from '../../utils/formatters'
import { AgencyFilesSection } from './AgencyFilesSection'
import { GdsSection } from './GdsSection'
import { CountryCityPhoneFields } from '../../components/Geo/CountryCityPhoneFields'
import {
  OTHER_COUNTRY, applyDialPrefix, getCountry, resolvePaysLabel,
} from '../../data/geoCountries'

/* ─────────────────────────────────────────
   SECTION NAV
───────────────────────────────────────── */

const SECTIONS = [
  { id: 'agence',       label: 'Agence',             icon: Building2   },
  { id: 'gds',          label: 'Connectivité GDS',   icon: Plug        },
  { id: 'facturation',  label: 'Facturation & Taxes', icon: CreditCard  },
  { id: 'preferences',  label: 'Préférences',         icon: Globe       },
  { id: 'documents',    label: "Documents agence",    icon: FolderOpen  },
  { id: 'utilisateurs', label: 'Comptes accès',       icon: Users       },
  { id: 'derogations',  label: 'Journal dérogations', icon: ShieldAlert },
  { id: 'donnees',      label: 'Données & Sauvegarde',icon: Database    },
]

/* ─────────────────────────────────────────
   FORM FIELD
───────────────────────────────────────── */

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
)

/* ─────────────────────────────────────────
   SECTION: AGENCE
───────────────────────────────────────── */

const AgenceSection = ({ settings, onChange, onPatch }) => {
  const fileRef = useRef(null)

  const handlePaysCodeChange = (code) => {
    const country = getCountry(code)
    const isOther = code === OTHER_COUNTRY
    onPatch({
      paysCode: code,
      paysLibre: isOther ? (settings.paysLibre ?? '') : '',
      ville: settings.paysCode !== code ? '' : (settings.ville ?? ''),
      pays: resolvePaysLabel({ paysCode: code, paysLibre: isOther ? settings.paysLibre : '' }),
      telephone: isOther
        ? (settings.telephone ?? '')
        : applyDialPrefix(country?.dial, settings.telephone ?? ''),
    })
  }

  const handlePaysLibreChange = (value) => {
    onPatch({
      paysLibre: value,
      pays: resolvePaysLabel({ paysCode: settings.paysCode ?? 'MA', paysLibre: value }),
    })
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => onChange('logo', reader.result)
    reader.readAsDataURL(file)
  }

  return (
  <div className="space-y-5">
    <div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">Informations de l'agence</h3>
      <p className="text-sm text-gray-500">Ces informations apparaissent sur vos devis et factures.</p>
    </div>

    {/* ── Logo ── */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Logo de l'agence</label>
      <div className="flex items-center gap-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-primary-400 transition-colors cursor-pointer overflow-hidden flex-shrink-0"
        >
          {settings.logo ? (
            <img src={settings.logo} alt="Logo agence" className="w-full h-full object-contain p-1.5" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-gray-300">
              <ImageIcon className="w-7 h-7" />
              <span className="text-xs font-medium">Logo</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
          <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileRef.current?.click()}>
            {settings.logo ? 'Changer le logo' : 'Importer un logo'}
          </Button>
          {settings.logo && (
            <button
              type="button"
              onClick={() => onChange('logo', null)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer le logo
            </button>
          )}
          <p className="text-xs text-gray-400">PNG, JPG, SVG · max 2 Mo</p>
        </div>
      </div>
    </div>

    <Field label="Nom de l'agence *">
      <input className="input-field" value={settings.nom ?? ''}
        onChange={e => onChange('nom', e.target.value)}
        placeholder="Rihla" />
    </Field>

    <CountryCityPhoneFields
      paysCode={settings.paysCode ?? 'MA'}
      paysLibre={settings.paysLibre ?? ''}
      ville={settings.ville ?? ''}
      telephone={settings.telephone ?? ''}
      onPaysCodeChange={handlePaysCodeChange}
      onPaysLibreChange={handlePaysLibreChange}
      onVilleChange={v => onChange('ville', v)}
      onTelephoneChange={v => onChange('telephone', v)}
      cityListId="parametres-agence-villes"
    />

    <Field label="Adresse complète">
      <textarea className="input-field resize-none" rows={2}
        value={settings.adresse ?? ''}
        onChange={e => onChange('adresse', e.target.value)}
        placeholder="Av. Hassan II, Casablanca 20000" />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Email">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" className="input-field pl-9" value={settings.email ?? ''}
            onChange={e => onChange('email', e.target.value)}
            placeholder="contact@agence.ma" />
        </div>
      </Field>
    </div>

    <Field label="Site web">
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input-field pl-9" value={settings.siteWeb ?? ''}
          onChange={e => onChange('siteWeb', e.target.value)}
          placeholder="www.agence.ma" />
      </div>
    </Field>
  </div>
  )
}

/* ─────────────────────────────────────────
   CHANGE PIN BLOCK
───────────────────────────────────────── */

const ChangePinBlock = ({ settings, onChange }) => {
  const [open,       setOpen]       = useState(false)
  const [current,    setCurrent]    = useState('')
  const [next,       setNext]       = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showCurrent,setShowCurrent]= useState(false)
  const [showNext,   setShowNext]   = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); setError(''); setSuccess(false) }

  const handleSave = () => {
    const adminPin = settings?.adminPin || '1234'
    if (current !== adminPin)        { setError('Code PIN actuel incorrect.'); return }
    if (next.length < 4)             { setError('Le nouveau PIN doit contenir au moins 4 caractères.'); return }
    if (next !== confirm)            { setError('Les deux nouveaux PIN ne correspondent pas.'); return }
    onChange('adminPin', next)
    setSuccess(true)
    setError('')
    setTimeout(() => { setOpen(false); reset() }, 1500)
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-400" />
        Sécurité — Code PIN administrateur
      </h4>

      {!open ? (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex-1">
            <p className="text-sm text-slate-700 font-medium">Code PIN actuel</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Requis pour déroger à la protection de marge. Longueur : {(settings?.adminPin || '1234').length} caractères.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg tracking-[0.3em] text-slate-400 select-none">
              {'•'.repeat((settings?.adminPin || '1234').length)}
            </span>
            <button
              onClick={() => { setOpen(true); reset() }}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Modifier
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <p className="text-sm font-medium text-slate-700">Changer le code PIN</p>

          {/* PIN actuel */}
          <div>
            <label className="label">PIN actuel</label>
            <div className="relative max-w-48">
              <input
                type={showCurrent ? 'text' : 'password'}
                maxLength={8}
                className="input-field pr-9 tracking-widest"
                placeholder="••••"
                value={current}
                onChange={e => { setCurrent(e.target.value); setError('') }}
                autoFocus
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nouveau PIN */}
          <div>
            <label className="label">Nouveau PIN</label>
            <div className="relative max-w-48">
              <input
                type={showNext ? 'text' : 'password'}
                maxLength={8}
                className="input-field pr-9 tracking-widest"
                placeholder="••••"
                value={next}
                onChange={e => { setNext(e.target.value); setError('') }}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowNext(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmer */}
          <div>
            <label className="label">Confirmer le nouveau PIN</label>
            <div className="relative max-w-48">
              <input
                type="password"
                maxLength={8}
                className={`input-field tracking-widest ${confirm && confirm !== next ? 'border-red-300 focus:ring-red-300' : ''}`}
                placeholder="••••"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
            {confirm && confirm !== next && (
              <p className="text-xs text-red-500 mt-1">Les PIN ne correspondent pas.</p>
            )}
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Code PIN modifié avec succès.
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setOpen(false); reset() }}
              className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!current || !next || !confirm}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   SECTION: FACTURATION
───────────────────────────────────────── */

const FacturationSection = ({ settings, onChange }) => {
  const [showIce, setShowIce] = useState(false)

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Informations légales & fiscales</h3>
        <p className="text-sm text-gray-500">Utilisées sur les documents officiels (devis, factures, contrats).</p>
      </div>

      <Field label="Numéro ICE" hint="Identifiant Commun de l'Entreprise — 15 chiffres">
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input-field pl-9 pr-10"
            type={showIce ? 'text' : 'password'}
            value={settings.iceNumber ?? ''}
            onChange={e => onChange('iceNumber', e.target.value)}
            placeholder="ICE-000000000000000"
          />
          <button type="button"
            onClick={() => setShowIce(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showIce ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Patente">
          <input className="input-field" value={settings.patente ?? ''}
            onChange={e => onChange('patente', e.target.value)}
            placeholder="PAT-XXXXXX" />
        </Field>
        <Field label="RC (Registre de Commerce)">
          <input className="input-field" value={settings.rc ?? ''}
            onChange={e => onChange('rc', e.target.value)}
            placeholder="RC-XXXXXX" />
        </Field>
        <Field label="IF (Identifiant Fiscal)">
          <input className="input-field" value={settings.if ?? ''}
            onChange={e => onChange('if', e.target.value)}
            placeholder="IF-XXXXXX" />
        </Field>
        <Field label="CNSS">
          <input className="input-field" value={settings.cnss ?? ''}
            onChange={e => onChange('cnss', e.target.value)}
            placeholder="CNSS-XXXXXX" />
        </Field>
      </div>

      {/* ── Politique de marge ── */}
      <div className="pt-2 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          Politique de marge & réductions
        </h4>
        <Field
          label={`Marge minimale : ${settings.margeMinimale ?? 10}%`}
          hint="En dessous de ce seuil, les réductions sont plafonnées automatiquement (dérogation PIN requise)."
        >
          <div className="flex items-center gap-4 mt-1">
            <input
              type="range" min={5} max={25} step={1}
              value={settings.margeMinimale ?? 10}
              onChange={e => onChange('margeMinimale', parseInt(e.target.value))}
              className="flex-1 accent-primary-600"
            />
            <span className="text-sm font-bold text-navy w-10 text-center">
              {settings.margeMinimale ?? 10}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5% (minimum)</span>
            <span>25% (maximum)</span>
          </div>
        </Field>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   SECTION: PRÉFÉRENCES
───────────────────────────────────────── */

const PreferencesSection = ({ settings, onChange }) => {
  const DEVISES  = ['MAD', 'EUR', 'USD', 'GBP', 'SAR', 'AED']
  const LANGUES  = [{ value: 'FR', label: 'Français' }, { value: 'AR', label: 'العربية' }]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Préférences d'affichage</h3>
        <p className="text-sm text-gray-500">Personnalisez l'affichage de l'application.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Devise">
          <select className="input-field" value={settings.devise ?? 'MAD'}
            onChange={e => onChange('devise', e.target.value)}>
            {DEVISES.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Langue">
          <select className="input-field" value={settings.langue ?? 'FR'}
            onChange={e => onChange('langue', e.target.value)}>
            {LANGUES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </Field>
      </div>

      {/* Notifications */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-400" />
          Notifications
        </h4>
        <div className="space-y-3">
          {[
            { key: 'notifDevis',     label: 'Devis expirés',          hint: 'Alerte quand un devis arrive à expiration' },
            { key: 'notifFactures',  label: 'Factures en retard',     hint: 'Alerte quand une facture dépasse son échéance' },
            { key: 'notifDeparts',   label: 'Départs imminents',      hint: 'Rappel 3 jours avant chaque départ' },
            { key: 'notifObjectifs', label: 'Objectifs commerciaux',  hint: 'Alerte si un agent est en-dessous de 70% de son objectif' },
          ].map(({ key, label, hint }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{hint}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(key, !(settings[key] ?? true))}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0
                  ${(settings[key] ?? true) ? 'bg-navy-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                  ${(settings[key] ?? true) ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── PIN administrateur ── */}
      <ChangePinBlock settings={settings} onChange={onChange} />
    </div>
  )
}

/* ─────────────────────────────────────────
   SECTION: COMPTES ACCÈS
───────────────────────────────────────── */

const UtilisateursSection = () => {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.getUsers()
      .then(setUsers)
      .catch(() => toast.error('Impossible de charger les comptes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.email || form.password.length < 6) {
      toast.error('Email et mot de passe (6+ car.) requis')
      return
    }
    setSaving(true)
    try {
      await api.createUser(form)
      toast.success('Compte créé')
      setForm({ name: '', email: '', password: '', role: 'agent' })
      load()
    } catch (err) {
      toast.error(err.message || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Comptes d'accès</h3>
        <p className="text-sm text-gray-500">
          Créez des identifiants email/mot de passe pour vos agents et administrateurs.
        </p>
      </div>

      <Card>
        <Card.Body className="p-0 divide-y divide-gray-100">
          {loading ? (
            <p className="p-4 text-sm text-gray-400">Chargement…</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Aucun compte lié à cette agence.</p>
          ) : (
            users.map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <Badge variant={u.role === 'admin' ? 'orange' : 'blue'}>{u.role === 'admin' ? 'Admin' : 'Agent'}</Badge>
              </div>
            ))
          )}
        </Card.Body>
      </Card>

      <form onSubmit={handleCreate} className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Nouveau compte
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom">
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prénom Nom" />
          </Field>
          <Field label="Email">
            <input type="email" className="input-field" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="agent@agence.ma" />
          </Field>
          <Field label="Mot de passe">
            <input type="password" className="input-field" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 caractères" />
          </Field>
          <Field label="Rôle">
            <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="agent">Agent</option>
              <option value="admin">Administrateur</option>
            </select>
          </Field>
        </div>
        <Button type="submit" icon={UserPlus} disabled={saving}>{saving ? 'Création…' : 'Créer le compte'}</Button>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────
   SECTION: DONNÉES
───────────────────────────────────────── */

const DonneesSection = ({ onExport, onReset, onClear }) => {
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const { currentAgency, currentAgencyId } = usePlatform()
  const { data } = useAgencyData()

  const STORAGE_LABELS = [
    { key: STORAGE_KEYS.clients,      label: 'Clients' },
    { key: STORAGE_KEYS.reservations, label: 'Réservations' },
    { key: STORAGE_KEYS.finances,     label: 'Transactions' },
    { key: STORAGE_KEYS.devis,        label: 'Devis' },
    { key: STORAGE_KEYS.factures,     label: 'Factures' },
    { key: STORAGE_KEYS.products,     label: 'Produits' },
    { key: STORAGE_KEYS.agents,       label: 'Agents' },
    { key: STORAGE_KEYS.suppliers,    label: 'Fournisseurs' },
    { key: STORAGE_KEYS.calendar,     label: 'Calendrier' },
    { key: STORAGE_KEYS.internalDocuments, label: 'Documents agence' },
  ]

  const storageStats = STORAGE_LABELS.map(({ key, label }) => {
    const val = data?.[key]
    const raw = val !== undefined ? JSON.stringify(val) : ''
    const bytes = raw ? new Blob([raw]).size : 0
    return { label, count: Array.isArray(val) ? val.length : (val ? 1 : 0), bytes }
  })

  const totalBytes = storageStats.reduce((s, r) => s + r.bytes, 0)
  const fmtSize = (b) => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`

  const handleExportAgence = async () => {
    try {
      const remote = await api.getAllData()
      const agencyData = {}
      Object.values(STORAGE_KEYS).forEach(key => {
        if (remote[key] !== undefined) {
          agencyData[`${currentAgencyId}_${key}`] = JSON.stringify(remote[key])
        }
      })

    const agencyJson    = JSON.stringify(currentAgency)
    const agencyDataStr = JSON.stringify(agencyData)
    const agencyId      = currentAgencyId
    const agencyName    = currentAgency?.nom || 'Agence'
    const slug          = agencyName.toLowerCase().replace(/\s+/g, '-')

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chargement — ${agencyName}</title>
  <style>
    body { margin:0; background:#0A6C62; display:flex; flex-direction:column;
           align-items:center; justify-content:center; height:100vh;
           font-family:system-ui,sans-serif; color:white; gap:16px; }
    .logo { width:56px; height:56px; background:#F4A24C; border-radius:14px;
            display:flex; align-items:center; justify-content:center; font-size:24px; }
    p { color:rgba(255,255,255,.5); font-size:14px; margin:0; }
    strong { color:white; font-size:18px; display:block; margin-bottom:4px; }
  </style>
</head>
<body>
  <div class="logo">✈</div>
  <div style="text-align:center">
    <strong>${agencyName}</strong>
    <p>Chargement de votre espace…</p>
  </div>
  <script>
  (function() {
    try {
      // 1 — Seed agency data into localStorage
      var data = ${agencyDataStr};
      Object.keys(data).forEach(function(k) {
        localStorage.setItem(k, data[k]);
      });

      // 2 — Register agency in platform list
      var agencies = [];
      try { agencies = JSON.parse(localStorage.getItem('platform_agencies') || '[]'); } catch(e) {}
      var agencyId = '${agencyId}';
      if (!agencies.some(function(a) { return a.id === agencyId; })) {
        agencies.push(${agencyJson});
        localStorage.setItem('platform_agencies', JSON.stringify(agencies));
      }

      // 3 — Set as current agency
      sessionStorage.setItem('platform_current_agency', agencyId);

      // 4 — Open the app
      window.location.replace('./index.html');
    } catch(e) {
      document.body.innerHTML = '<p style="color:#f87171;font-family:sans-serif;padding:32px">Erreur : ' + e.message + '</p>';
    }
  })();
  </script>
</body>
</html>`

    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    a.download = `demarrer-${slug}.html`
    a.click()
    } catch {
      // silent — export is optional
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Données & Sauvegarde</h3>
        <p className="text-sm text-gray-500">Gérez et exportez vos données (serveur cloud).</p>
      </div>

      {/* Storage overview */}
      <Card>
        <Card.Header title="Données serveur" subtitle={`Total : ${fmtSize(totalBytes)}`} />
        <Card.Body>
          <div className="divide-y divide-gray-50">
            {storageStats.map(({ label, count, bytes }) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{count} enregistrement{count !== 1 ? 's' : ''}</span>
                  <span className="w-14 text-right font-mono">{fmtSize(bytes)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Actions</h4>

        {/* Export agence — fichier HTML autonome */}
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
          <div>
            <p className="text-sm font-medium text-primary-800">Exporter cette agence</p>
            <p className="text-xs text-primary-600 mt-0.5">
              Génère un fichier <code className="bg-primary-100 px-1 rounded">demarrer.html</code> à placer dans le dossier <code className="bg-primary-100 px-1 rounded">dist/</code> — l'agence double-clique dessus pour accéder directement à son espace.
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportAgence}
            className="border-primary-200 text-primary-700 hover:bg-primary-100 flex-shrink-0 ml-4">
            Télécharger
          </Button>
        </div>

        {/* Export JSON */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Exporter toutes les données</p>
            <p className="text-xs text-gray-500 mt-0.5">Télécharger un fichier JSON de sauvegarde complet</p>
          </div>
          <Button variant="secondary" size="sm" icon={Download} onClick={onExport}>
            Exporter
          </Button>
        </div>

        {/* Reset */}
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div>
            <p className="text-sm font-medium text-amber-800">Réinitialiser les données</p>
            <p className="text-xs text-amber-600 mt-0.5">Recharge les données d'exemple. Efface vos modifications.</p>
          </div>
          <Button variant="secondary" size="sm" icon={RotateCcw}
            onClick={() => setConfirmReset(true)}
            className="border-amber-200 text-amber-700 hover:bg-amber-100">
            Réinitialiser
          </Button>
        </div>

        {/* Clear */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
          <div>
            <p className="text-sm font-medium text-red-800">Effacer toutes les données</p>
            <p className="text-xs text-red-500 mt-0.5">Supprime définitivement tout. Action irréversible.</p>
          </div>
          <Button variant="danger" size="sm" icon={Trash2}
            onClick={() => setConfirmClear(true)}>
            Effacer
          </Button>
        </div>
      </div>

      {confirmReset && (
        <ConfirmModal
          title="Réinitialiser les données ?"
          message="Toutes vos modifications seront perdues et remplacées par les données d'exemple."
          confirmLabel="Réinitialiser"
          onConfirm={() => { setConfirmReset(false); onReset() }}
          onClose={() => setConfirmReset(false)}
        />
      )}
      {confirmClear && (
        <ConfirmModal
          title="Effacer toutes les données ?"
          message="Cette action est irréversible. Toutes vos données seront supprimées définitivement."
          confirmLabel="Effacer définitivement"
          onConfirm={() => { setConfirmClear(false); onClear() }}
          onClose={() => setConfirmClear(false)}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   SECTION: DÉROGATIONS
───────────────────────────────────────── */

const DerogationsSection = () => {
  const [derogations, setDerogations] = useLocalStorage(STORAGE_KEYS.derogations, [])

  const handleClear = () => setDerogations([])

  if (derogations.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">Journal des dérogations</h3>
          <p className="text-sm text-gray-500">
            Historique des overrides manager sur la protection de marge.
          </p>
        </div>
        <div className="flex flex-col items-center py-12 text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-xl">
          <ShieldAlert className="w-8 h-8 opacity-30" />
          <p className="text-sm">Aucune dérogation enregistrée</p>
          <p className="text-xs text-gray-300">Les overrides PIN apparaîtront ici</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">Journal des dérogations</h3>
          <p className="text-sm text-gray-500">{derogations.length} dérogation(s) enregistrée(s)</p>
        </div>
        <Button variant="secondary" size="sm" icon={Trash2} onClick={handleClear}>
          Effacer le journal
        </Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Date', 'Réf document', 'Client', 'Montant HT', 'Remise demandée', 'Remise appliquée', 'Marge finale'].map(h => (
                  <th key={h} className="table-th text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...derogations].reverse().map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="table-td text-gray-500 whitespace-nowrap">{formatDate(d.date)}</td>
                  <td className="table-td font-mono text-xs text-primary-600">{d.ref || '—'}</td>
                  <td className="table-td font-medium text-gray-700">{d.clientNom}</td>
                  <td className="table-td font-semibold text-gray-800">{formatCurrency(d.montantHT)}</td>
                  <td className="table-td">
                    <span className="text-amber-600 font-semibold">{d.discountRequested}%</span>
                  </td>
                  <td className="table-td">
                    <span className="text-red-600 font-semibold">{d.discountApplied}%</span>
                  </td>
                  <td className="table-td">
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full
                      ${parseFloat(d.margePct) >= 10 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {d.margePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

const ParametresContent = () => {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, defaultSettings)
  const [draft,    setDraft]    = useState(() => ({ ...defaultSettings, ...settings }))
  const [searchParams] = useSearchParams()
  const [section,  setSection]  = useState(() => {
    const fromUrl = searchParams.get('section')
    return SECTIONS.some(s => s.id === fromUrl) ? fromUrl : 'agence'
  })
  const [saved,    setSaved]    = useState(false)
  const toast = useToast()
  const { currentAgency, currentAgencyId, updateAgency } = usePlatform()
  const { reload } = useAgencyData()
  const [isOnboardingComplete,    setIsOnboardingComplete]    = useState(false)
  const [showInstallInstructions, setShowInstallInstructions] = useState(false)

  useEffect(() => {
    const fromUrl = searchParams.get('section')
    if (fromUrl && SECTIONS.some(s => s.id === fromUrl)) {
      setSection(fromUrl)
    }
  }, [searchParams])

  const handleConfirmConfig = () => {
    updateAgency(currentAgencyId, { isConfigured: true })
    setIsOnboardingComplete(true)
    toast.success('Configuration terminée avec succès')
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings)

  const handleChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }))
    if (key === 'logo') setSettings(prev => ({ ...prev, logo: value }))
    setSaved(false)
  }

  const handlePatch = (patch) => {
    setDraft(prev => ({ ...prev, ...patch }))
    if ('logo' in patch) setSettings(prev => ({ ...prev, logo: patch.logo }))
    setSaved(false)
  }

  const handleSave = () => {
    setSettings(draft)
    setSaved(true)
    toast.success('Paramètres enregistrés')
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDiscard = () => {
    setDraft({ ...defaultSettings, ...settings })
    setSaved(false)
  }

  const handleExport = async () => {
    try {
      const remote = await api.getAllData()
      const data = {}
      Object.entries(STORAGE_KEYS).forEach(([k, storageKey]) => {
        if (remote[storageKey] !== undefined) data[k] = remote[storageKey]
      })
      const json = JSON.stringify(data, null, 2)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      a.download = `rihla-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      toast.success('Export téléchargé')
    } catch {
      toast.error('Export impossible — vérifiez la connexion API')
    }
  }

  const handleResetData = async () => {
    try {
      await api.bulkData(getAgencySeedPayload(settings?.nom || draft?.nom))
      await reload()
      toast.success('Données réinitialisées avec la démo')
      window.location.reload()
    } catch {
      toast.error('Réinitialisation impossible')
    }
  }

  const handleClearData = async () => {
    try {
      await api.clearData()
      await reload()
      toast.success('Données effacées')
      window.location.reload()
    } catch {
      toast.error('Effacement impossible')
    }
  }

  const activeSection = SECTIONS.find(s => s.id === section)

  const isConfigured = currentAgency?.isConfigured ?? true

  if (isOnboardingComplete) {
    const accessLink = `https://app.local/agency/${currentAgencyId}`

    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-slate-50 px-4">
        <div className="w-full max-w-lg animate-card-up">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />

            <div className="px-8 pt-10 pb-8 text-center">
              {/* Animated check icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <span className="absolute w-20 h-20 rounded-full bg-green-100 animate-ring" />
                <span className="absolute w-20 h-20 rounded-full bg-green-100 animate-ring" style={{ animationDelay: '0.5s' }} />
                <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-pop-in">
                  <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-navy mb-2">Agence configurée avec succès</h2>
              <p className="text-slate-400 text-sm">Votre espace est prêt à être utilisé</p>
            </div>

            {/* Access link */}
            <div className="px-8 pb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 text-center">Lien d'accès</p>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="flex-1 text-sm font-mono text-slate-600 truncate">{accessLink}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(accessLink).then(() => toast.info('Lien copié'))}
                  className="text-slate-400 hover:text-green-600 transition-colors flex-shrink-0"
                  title="Copier"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 mx-8" />

            {/* Actions */}
            <div className="px-8 py-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsOnboardingComplete(false)}
                className="btn-secondary text-sm"
              >
                Accéder aux paramètres
              </button>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(accessLink).then(() =>
                    toast.success('Lien copié avec succès')
                  )
                }
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                Copier le lien
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowInstallInstructions(v => !v)}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Installer l'application
                </button>
                {showInstallInstructions && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-navy-700 text-white rounded-xl shadow-xl p-4 text-left z-10 animate-fade-in">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">Comment installer</p>
                    <ol className="space-y-2.5">
                      {[
                        'Ouvrir dans Chrome',
                        'Cliquer sur les 3 points',
                        "Installer l'application",
                      ].map((step, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <span className="w-5 h-5 rounded-full bg-gold text-navy text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-navy-700 rotate-45" />
                  </div>
                )}
              </div>

              <button
                onClick={() => window.open(accessLink, '_blank')}
                className="btn-primary text-sm flex items-center gap-2"
              >
                Accéder à mon espace
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Setup banner ── */}
      {!isConfigured && (
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <strong>Configuration requise</strong> — Renseignez les informations de votre agence puis confirmez pour activer l'espace de travail.
          </p>
          <button
            onClick={() => setSection('agence')}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
          >
            Section Agence
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
      {/* ── Sidebar nav ── */}
      <aside className="w-52 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col overflow-y-auto">
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</p>
          <nav className="space-y-1">
            {SECTIONS.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                    ${section === s.id
                      ? 'bg-navy-50 text-navy-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="leading-tight">{s.label}</span>
                  {section === s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Save status */}
        <div className="mt-auto p-4 border-t border-gray-100">
          {saved ? (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Enregistré
            </div>
          ) : isDirty ? (
            <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
              <AlertTriangle className="w-4 h-4" />
              Modifications non sauvegardées
            </div>
          ) : (
            <div className="text-xs text-gray-400">Aucune modification</div>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {activeSection && <activeSection.icon className="w-5 h-5 text-gray-400" />}
            <h2 className="text-lg font-bold text-navy-800">{activeSection?.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button variant="ghost" size="sm" onClick={handleDiscard}>
                Annuler
              </Button>
            )}
            <Button
              icon={saved ? CheckCircle : Save}
              size="sm"
              onClick={handleSave}
              disabled={!isDirty && !saved}
              className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {saved ? 'Enregistré' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${section === 'documents' ? 'max-w-none' : ''}`}>
          <div className={section === 'documents' ? 'max-w-4xl' : 'max-w-2xl'}>
            {section === 'agence' && (
              <>
                <AgenceSection settings={draft} onChange={handleChange} onPatch={handlePatch} />
                {!isConfigured && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-start gap-4 p-5 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-800">Prêt à activer ?</p>
                        <p className="text-xs text-green-600 mt-0.5">
                          Une fois confirmée, la configuration de base sera verrouillée et l'agence sera marquée comme active.
                        </p>
                      </div>
                      <button
                        onClick={handleConfirmConfig}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirmer la configuration
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {section === 'gds' && (
              <GdsSection
                settings={draft}
                onChange={handleChange}
                onPersistMode={(mode) => setSettings(prev => ({ ...prev, gdsMode: mode }))}
              />
            )}
            {section === 'facturation' && (
              <FacturationSection settings={draft} onChange={handleChange} />
            )}
            {section === 'preferences' && (
              <PreferencesSection settings={draft} onChange={handleChange} />
            )}
            {section === 'documents' && (
              <AgencyFilesSection />
            )}
            {section === 'utilisateurs' && (
              <UtilisateursSection />
            )}
            {section === 'derogations' && (
              <DerogationsSection />
            )}
            {section === 'donnees' && (
              <DonneesSection
                onExport={handleExport}
                onReset={handleResetData}
                onClear={handleClearData}
              />
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export const ParametresPage = () => {
  const { isAdmin } = useAuth()

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
      <Lock className="w-12 h-12 text-gray-300" />
      <p className="text-lg font-semibold text-gray-500">Accès réservé à l'administrateur</p>
      <p className="text-sm text-gray-400">Reconnectez-vous avec le profil Administrateur pour accéder à cette section.</p>
    </div>
  )

  return <ParametresContent />
}
