import React from 'react'
import { Lock } from 'lucide-react'

export const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-20">
    <Lock className="w-12 h-12 text-gray-300" />
    <p className="text-lg font-semibold text-gray-500">Accès réservé à l'administrateur</p>
    <p className="text-sm text-gray-400">
      Reconnectez-vous avec le profil Administrateur pour accéder à cette section.
    </p>
  </div>
)
