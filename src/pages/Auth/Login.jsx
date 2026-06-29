import React, { useState, useEffect } from 'react'
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePlatform } from '../../context/PlatformContext'
import { ApiError } from '../../api/client'
import { CountryCityPhoneFields } from '../../components/Geo/CountryCityPhoneFields'
import {
  OTHER_COUNTRY, applyDialPrefix, getCountry, resolvePaysLabel,
} from '../../data/geoCountries'

const REGISTER_TEMPLATES = [
  { id: 'rihla-demo', label: 'Démo Rihla', description: 'Données génériques pour découvrir la plateforme' },
  { id: 'bab-annaser', label: 'Modèle Bab Annaser', description: 'Référence Essaouira — clients & produits pré-remplis' },
  { id: 'vide', label: 'Agence vierge', description: 'Aucune donnée de démo' },
]

export const LoginPage = () => {
  const { login, registerAgency } = useAuth()
  const { selectAgency } = usePlatform()
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [templateId, setTemplateId] = useState('rihla-demo')
  const [paysCode, setPaysCode] = useState('MA')
  const [paysLibre, setPaysLibre] = useState('')
  const [ville, setVille] = useState('')
  const [telephone, setTelephone] = useState('+212 ')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (templateId === 'bab-annaser') {
      setPaysCode('MA')
      setPaysLibre('')
      if (!ville) setVille('Essaouira')
      if (!telephone.trim()) setTelephone('+212 524 78 00 00')
    } else if (templateId === 'vide') {
      setVille('')
    } else if (!telephone.trim()) {
      setTelephone(applyDialPrefix(getCountry('MA')?.dial, telephone, { onlyIfEmpty: true }))
    }
  }, [templateId])

  const handlePaysCodeChange = (code) => {
    const country = getCountry(code)
    setPaysCode(code)
    if (code !== OTHER_COUNTRY) setPaysLibre('')
    if (paysCode !== code) setVille('')
    if (code !== OTHER_COUNTRY) {
      setTelephone(t => applyDialPrefix(country?.dial, t))
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        if (!agencyName.trim()) {
          setError("Nom de l'agence requis")
          return
        }
        const data = await registerAgency({
          nom: agencyName.trim(),
          adminEmail: email.trim(),
          adminPassword: password,
          adminName: name.trim() || 'Administrateur',
          templateId,
          withDemo: templateId !== 'vide',
          pays: resolvePaysLabel({ paysCode, paysLibre }),
          paysCode,
          paysLibre: paysLibre.trim(),
          ville: ville.trim(),
          telephone: telephone.trim(),
        })
        const created = data.agency ?? data.agencies?.[data.agencies.length - 1]
        if (created?.id) await selectAgency(created.id)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-navy-700 px-8 py-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gold rounded-xl flex items-center justify-center mb-3 p-2">
            <img src="/rihla-mark.svg" alt="Rihla" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-white font-bold text-xl">Rihla</h1>
          <p className="text-white/50 text-sm mt-0.5">ERP Rihla Agence de Voyage — connexion</p>
        </div>

        <form onSubmit={submit} className="p-8 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="label">Modèle de départ</label>
                <select
                  className="input-field"
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value)}
                >
                  {REGISTER_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {REGISTER_TEMPLATES.find(t => t.id === templateId)?.description}
                </p>
              </div>
              <div>
                <label className="label">Nom de l'agence</label>
                <input
                  className="input-field"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  placeholder={templateId === 'bab-annaser' ? 'Ex: Bab Annaser Voyages' : 'Ex: Agence Casablanca Centre'}
                  required
                />
              </div>
              {templateId !== 'vide' && (
                <CountryCityPhoneFields
                  paysCode={paysCode}
                  paysLibre={paysLibre}
                  ville={ville}
                  telephone={telephone}
                  onPaysCodeChange={handlePaysCodeChange}
                  onPaysLibreChange={setPaysLibre}
                  onVilleChange={setVille}
                  onTelephoneChange={setTelephone}
                  cityListId="register-agence-villes"
                />
              )}
              <div>
                <label className="label">Votre nom</label>
                <input
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Prénom Nom"
                />
              </div>
            </>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@agence.ma"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 6 caractères' : '••••••••'}
                required
                minLength={mode === 'register' ? 6 : undefined}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-700 text-white rounded-xl font-semibold text-sm hover:bg-navy-700/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {mode === 'login' ? 'Se connecter' : "Créer l'agence"}
          </button>

          <p className="text-center text-sm text-slate-500 pt-2">
            {mode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button type="button" onClick={() => { setMode('register'); setError('') }}
                  className="text-primary-600 font-medium hover:underline">
                  Créer une agence
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?{' '}
                <button type="button" onClick={() => { setMode('login'); setError('') }}
                  className="text-primary-600 font-medium hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
