import React, { useId } from 'react'
import {
  COUNTRIES, OTHER_COUNTRY, citiesForCountry,
  phonePlaceholder, resolvePaysLabel,
} from '../../data/geoCountries'
import { getBannedCountryError } from '../../data/bannedCountries'

/**
 * Pays (liste + saisie libre), ville (datalist par pays + saisie libre), téléphone (indicatif).
 */
export const CountryCityPhoneFields = ({
  paysCode = 'MA',
  paysLibre = '',
  ville = '',
  telephone = '',
  onPaysCodeChange,
  onPaysLibreChange,
  onVilleChange,
  onTelephoneChange,
  cityListId: cityListIdProp,
  onBannedCountry,
}) => {
  const uid = useId().replace(/:/g, '')
  const cityListId = cityListIdProp || `villes-${uid}`
  const cities = citiesForCountry(paysCode)
  const isOther = paysCode === OTHER_COUNTRY

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pays de domiciliation</label>
        <select
          className="input-field"
          value={paysCode}
          onChange={e => onPaysCodeChange(e.target.value)}
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
          <option value={OTHER_COUNTRY}>Autre pays (saisie libre)…</option>
        </select>
        {isOther && (
          <input
            className="input-field mt-2"
            placeholder="Nom du pays"
            value={paysLibre}
            onChange={e => {
              const next = e.target.value
              const error = getBannedCountryError(next)
              if (error) {
                onBannedCountry?.(error)
                return
              }
              onPaysLibreChange(next)
            }}
          />
        )}
        {!isOther && resolvePaysLabel({ paysCode, paysLibre }) && (
          <p className="text-xs text-slate-400 mt-1">
            Indicatif téléphonique : {COUNTRIES.find(c => c.code === paysCode)?.dial}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
          <input
            className="input-field"
            list={cityListId}
            placeholder={isOther ? 'Saisir la ville' : 'Choisir ou saisir une ville'}
            value={ville}
            onChange={e => onVilleChange(e.target.value)}
          />
          <datalist id={cityListId}>
            {cities.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <p className="text-xs text-slate-400 mt-1">Liste indicative — saisie libre acceptée</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
          <input
            className="input-field"
            placeholder={phonePlaceholder(paysCode)}
            value={telephone}
            onChange={e => onTelephoneChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
