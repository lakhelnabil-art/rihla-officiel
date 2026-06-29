import React from 'react'
import { Phone, Mail, MapPin, Globe, ExternalLink } from 'lucide-react'

/**
 * Coordonnées publiques et lien de réservation commerciale d'un fournisseur.
 * @param {{ entry: import('./providersData').ProviderEntry, compact?: boolean }} props
 */
export const ProviderContactBlock = ({ entry, compact = false }) => {
  const { phone, email, address, website } = entry ?? {}
  if (!phone && !email && !address && !website) return null

  const text = compact ? 'text-[11px]' : 'text-xs'
  const icon = compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
  const row = `flex items-start gap-1.5 ${text} text-slate-600`
  const link = `${row} text-primary-600 hover:text-primary-700 font-medium`

  const href = website?.startsWith('http') ? website : website ? `https://${website}` : null

  return (
    <div className={`space-y-1 mt-2 pt-2 border-t border-slate-100 ${text}`}>
      {phone && (
        <p className={row}>
          <Phone className={`${icon} flex-shrink-0 mt-0.5 text-slate-400`} />
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary-600">{phone}</a>
        </p>
      )}
      {email && (
        <p className={row}>
          <Mail className={`${icon} flex-shrink-0 mt-0.5 text-slate-400`} />
          <a href={`mailto:${email}`} className="hover:text-primary-600 break-all">{email}</a>
        </p>
      )}
      {address && (
        <p className={row}>
          <MapPin className={`${icon} flex-shrink-0 mt-0.5 text-slate-400`} />
          <span>{address}</span>
        </p>
      )}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={link}
          onClick={e => e.stopPropagation()}
        >
          <Globe className={`${icon} flex-shrink-0 mt-0.5`} />
          <span>Réserver en ligne</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
        </a>
      )}
    </div>
  )
}

export default ProviderContactBlock
