import React, { useState, useEffect, useCallback } from 'react'
import {
  Globe, Plug, CheckCircle, XCircle, RefreshCw, Save, Eye, EyeOff,
  AlertTriangle, Loader2, Zap, Power, PowerOff,
} from 'lucide-react'
import { Button, Card, Badge } from '../../components/UI'
import { useToast } from '../../hooks/useToast'
import { gdsApi, GDS_MODES, GDS_ENVIRONMENTS } from '../../api/gds'

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
)

const inputCls = 'input w-full'

const StatusBadge = ({ status }) => {
  const map = {
    connected: { label: 'Connecté', cls: 'bg-green-50 text-green-700' },
    disconnected: { label: 'Déconnecté', cls: 'bg-slate-100 text-slate-600' },
    error: { label: 'Erreur', cls: 'bg-red-50 text-red-700' },
    pending: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
  }
  const m = map[status] ?? map.disconnected
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.cls}`}>{m.label}</span>
}

const AmadeusConnectorForm = ({ config, onSaved }) => {
  const toast = useToast()
  const [form, setForm] = useState({
    agencyName: '', officeId: '', pcc: '', environment: 'test',
    endpointUrl: '', apiKey: '', apiSecret: '', username: '', password: '',
  })
  const [showSecrets, setShowSecrets] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    if (config) {
      setForm(f => ({
        ...f,
        agencyName: config.agencyName ?? '',
        officeId: config.officeId ?? '',
        pcc: config.pcc ?? '',
        environment: config.environment ?? 'test',
        endpointUrl: config.endpointUrl ?? '',
        username: config.credentials?.username ?? '',
      }))
    }
  }, [config])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await gdsApi.saveConfig('amadeus', form)
      toast.success('Configuration Amadeus enregistrée')
      onSaved?.()
    } catch (err) {
      toast.error(err.message || 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      if (form.officeId) await gdsApi.saveConfig('amadeus', form)
      const result = await gdsApi.testConnection('amadeus')
      result.ok ? toast.success(result.message) : toast.error(result.message)
      onSaved?.()
    } catch (err) {
      toast.error(err.message || 'Test échoué')
    } finally {
      setTesting(false)
    }
  }

  const handleActivate = async () => {
    setActivating(true)
    try {
      await gdsApi.activate('amadeus')
      toast.success('Connecteur Amadeus activé')
      onSaved?.()
    } catch (err) {
      toast.error(err.message || 'Activation impossible')
    } finally {
      setActivating(false)
    }
  }

  const handleDeactivate = async () => {
    try {
      await gdsApi.deactivate('amadeus')
      toast.success('Connecteur Amadeus désactivé')
      onSaved?.()
    } catch (err) {
      toast.error(err.message || 'Désactivation impossible')
    }
  }

  return (
    <Card className="mt-6">
      <Card.Header
        title="Connecteur Amadeus"
        subtitle="Paramètres Office ID, PCC et credentials API"
        action={<StatusBadge status={config?.status} />}
      />
      <Card.Body className="space-y-4">
        {config?.statusMessage && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{config.statusMessage}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom de l'agence">
            <input className={inputCls} value={form.agencyName} onChange={e => set('agencyName', e.target.value)} />
          </Field>
          <Field label="Office ID" hint="Identifiant bureau Amadeus">
            <input className={inputCls} value={form.officeId} onChange={e => set('officeId', e.target.value)} placeholder="CMN12345" />
          </Field>
          <Field label="PCC" hint="Pseudo City Code">
            <input className={inputCls} value={form.pcc} onChange={e => set('pcc', e.target.value)} placeholder="CMN1A" />
          </Field>
          <Field label="Environnement">
            <select className={inputCls} value={form.environment} onChange={e => set('environment', e.target.value)}>
              {GDS_ENVIRONMENTS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
          </Field>
          <Field label="Endpoint URL" hint="Optionnel — URL API personnalisée">
            <input className={inputCls} value={form.endpointUrl} onChange={e => set('endpointUrl', e.target.value)} placeholder="https://..." />
          </Field>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-navy">Identifiants API</p>
            <button type="button" onClick={() => setShowSecrets(s => !s)} className="text-xs text-primary-600 flex items-center gap-1">
              {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showSecrets ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="API Key">
              <input type={showSecrets ? 'text' : 'password'} className={inputCls} value={form.apiKey}
                onChange={e => set('apiKey', e.target.value)} placeholder={config?.credentials?.hasApiKey ? '••••••••' : ''} />
            </Field>
            <Field label="API Secret">
              <input type={showSecrets ? 'text' : 'password'} className={inputCls} value={form.apiSecret}
                onChange={e => set('apiSecret', e.target.value)} placeholder={config?.credentials?.hasApiSecret ? '••••••••' : ''} />
            </Field>
            <Field label="Username">
              <input className={inputCls} value={form.username} onChange={e => set('username', e.target.value)} />
            </Field>
            <Field label="Password">
              <input type={showSecrets ? 'text' : 'password'} className={inputCls} value={form.password}
                onChange={e => set('password', e.target.value)} placeholder={config?.credentials?.hasPassword ? '••••••••' : ''} />
            </Field>
          </div>
        </div>

        {config && (
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-4 py-3">
            <span>Dernière sync : {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString('fr-MA') : '—'}</span>
            <span>PNR synchronisés : {config.syncCount ?? 0}</span>
            {config.isActive && <Badge variant="success">Actif</Badge>}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button icon={Save} size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Sauvegarder'}
          </Button>
          <Button variant="secondary" icon={testing ? Loader2 : Zap} size="sm" onClick={handleTest} disabled={testing}>
            {testing ? 'Test…' : 'Tester la connexion'}
          </Button>
          {config?.isActive ? (
            <Button variant="ghost" icon={PowerOff} size="sm" onClick={handleDeactivate}>Désactiver</Button>
          ) : (
            <Button variant="secondary" icon={Power} size="sm" onClick={handleActivate} disabled={activating}>
              {activating ? 'Activation…' : 'Activer'}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

export const GdsSection = ({ settings, onChange, onPersistMode }) => {
  const toast = useToast()
  const [status, setStatus] = useState(null)
  const [amadeusConfig, setAmadeusConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [changingMode, setChangingMode] = useState(false)

  const gdsMode = settings.gdsMode ?? 'none'

  const reload = useCallback(async () => {
    try {
      const s = await gdsApi.status()
      setStatus(s)
      if (s.gdsMode === 'amadeus' || s.activeConnection?.provider === 'amadeus') {
        const { config } = await gdsApi.getConfig('amadeus')
        setAmadeusConfig(config)
      } else {
        setAmadeusConfig(null)
      }
    } catch {
      /* API offline — mode autonome */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const handleModeChange = async (mode) => {
    onChange('gdsMode', mode)
    onPersistMode?.(mode)
    setChangingMode(true)
    try {
      await gdsApi.setMode(mode)
      if (mode === 'amadeus') {
        const { config } = await gdsApi.getConfig('amadeus')
        setAmadeusConfig(config)
      }
      await reload()
      toast.success(mode === 'none' ? 'Mode autonome Rihla activé' : `Mode ${mode} configuré`)
    } catch (err) {
      toast.error(err.message || 'Impossible de changer le mode GDS')
    } finally {
      setChangingMode(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Connectivité GDS</h3>
        <p className="text-sm text-gray-500">
          Rihla fonctionne avec ou sans GDS. Les identifiants sont chiffrés côté serveur.
        </p>
      </div>

      <Card>
        <Card.Header
          title="Votre agence dispose-t-elle d'un accès actif à un GDS ?"
          subtitle="Cette configuration est optionnelle et réversible"
          action={<Globe className="w-5 h-5 text-primary-500" />}
        />
        <Card.Body className="space-y-3">
          {GDS_MODES.map(opt => (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                gdsMode === opt.id ? 'border-primary-400 bg-primary-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="gdsMode"
                value={opt.id}
                checked={gdsMode === opt.id}
                disabled={changingMode}
                onChange={() => handleModeChange(opt.id)}
                className="mt-1"
              />
              <span className="text-sm text-navy">{opt.label}</span>
            </label>
          ))}
        </Card.Body>
      </Card>

      {gdsMode === 'none' && (
        <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Mode autonome Rihla</p>
            <p className="text-xs text-green-700 mt-1 leading-relaxed">
              Tous les modules restent accessibles : CRM, réservations manuelles, devis, facturation,
              finances, produits, circuits, Omra/Hajj, MICE et reporting — sans connexion GDS.
            </p>
          </div>
        </div>
      )}

      {gdsMode === 'amadeus' && (
        loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
          </div>
        ) : (
          <AmadeusConnectorForm config={amadeusConfig} onSaved={reload} />
        )
      )}

      {['sabre', 'travelport', 'other'].includes(gdsMode) && (
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Connecteur en développement</p>
            <p className="text-xs text-amber-700 mt-1">
              L'architecture multi-GDS est prête. Le connecteur {gdsMode} sera disponible prochainement
              via la même couche d'intégration qu'Amadeus.
            </p>
          </div>
        </div>
      )}

      {status?.activeConnection && (
        <Card>
          <Card.Header title="Statut connecteur actif" action={<Plug className="w-4 h-4 text-primary-500" />} />
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-navy capitalize">{status.activeConnection.provider}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Office {status.activeConnection.officeId} · PCC {status.activeConnection.pcc}
                </p>
              </div>
              <StatusBadge status={status.activeConnection.status} />
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default GdsSection
