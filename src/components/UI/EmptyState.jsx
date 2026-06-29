import React from 'react'
import { Inbox } from 'lucide-react'

export const EmptyState = ({ icon: Icon = Inbox, title = 'Aucun résultat', description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-400" />
    </div>
    <p className="text-base font-medium text-slate-600">{title}</p>
    {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)
