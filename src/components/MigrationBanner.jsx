import React, { useState } from 'react'
import { Database, X, Loader2 } from 'lucide-react'
import { usePlatform } from '../context/PlatformContext'
import { useAgencyData } from '../context/AgencyDataContext'
import { api } from '../api/client'
import { collectLegacyAgencyData, clearLegacyAgencyData } from '../utils/migrateLocalStorage'
import { useToast } from '../hooks/useToast'

export const MigrationBanner = () => {
  const { currentAgencyId } = usePlatform()
  const { reload } = useAgencyData()
  const toast = useToast()
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  const legacy = currentAgencyId ? collectLegacyAgencyData(currentAgencyId) : null
  if (!legacy || dismissed) return null

  const keyCount = Object.keys(legacy).length

  const handleMigrate = async () => {
    setLoading(true)
    try {
      await api.bulkData(legacy)
      clearLegacyAgencyData(currentAgencyId)
      await reload()
      toast.success('Données locales importées dans le cloud.')
      setDismissed(true)
    } catch {
      toast.error('Migration échouée — vérifiez la connexion API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <Database className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-900">Données locales détectées</p>
        <p className="text-amber-800/80 mt-0.5">
          {keyCount} jeu(x) de données trouvé(s) dans ce navigateur. Importer vers le serveur ?
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleMigrate}
            disabled={loading}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 disabled:opacity-60 flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Importer maintenant
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-1.5 text-amber-700 text-xs font-medium hover:underline"
          >
            Plus tard
          </button>
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
