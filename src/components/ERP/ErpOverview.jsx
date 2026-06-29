import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Layers, ChevronDown, ChevronRight, ArrowRight, BookOpen,
  Users, CalendarCheck, Wallet, BarChart3,
} from 'lucide-react'
import { Card } from '../UI'
import {
  ERP_BRAND, ERP_TAGLINE, ERP_SUBTITLE, ERP_PILLARS, ERP_MODULES,
  ERP_WORKFLOW, MARKET_COMPARISON, RIHLA_ADVANTAGES,
} from '../../content/erpPositioning'

const PILLAR_ICONS = {
  commercial: Users,
  operations: CalendarCheck,
  financier: Wallet,
  pilotage: BarChart3,
}

/** Bandeau ERP compact — tableau de bord. */
export const ErpBanner = ({ agencyName }) => (
  <Card className="overflow-hidden border-primary-100 bg-gradient-to-r from-primary-50/80 to-white">
    <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">{ERP_BRAND}</p>
          <h2 className="text-base font-bold text-navy leading-tight">{ERP_TAGLINE}</h2>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ERP_SUBTITLE}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0">
        {ERP_PILLARS.map(p => {
          const Icon = PILLAR_ICONS[p.id] || Layers
          return (
            <div
              key={p.id}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-center ${p.couleur}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold leading-tight">{p.titre}</span>
            </div>
          )
        })}
      </div>
      <Link
        to="/documents"
        className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 flex-shrink-0 whitespace-nowrap"
      >
        <BookOpen className="w-3.5 h-3.5" />
        Guide {ERP_BRAND}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
    {agencyName && (
      <div className="px-5 py-2 bg-primary-600/5 border-t border-primary-100">
        <p className="text-[11px] text-slate-500">
          Espace {ERP_BRAND} de <span className="font-semibold text-navy">{agencyName}</span> — données isolées et synchronisées
        </p>
      </div>
    )}
  </Card>
)

const ComparisonTable = () => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full text-sm min-w-[640px]">
      <thead>
        <tr className="bg-primary-50">
          {MARKET_COMPARISON.headers.map((h, i) => (
            <th
              key={h}
              className={`text-left px-3 py-2.5 font-semibold border-b border-slate-200 ${
                i === 1 ? 'text-primary-700 bg-primary-50' : 'text-slate-600'
              }`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {MARKET_COMPARISON.rows.map((row, ri) => (
          <tr key={ri} className="even:bg-slate-50">
            {row.map((cell, ci) => (
              <td
                key={ci}
                className={`px-3 py-2 border-b border-slate-100 ${
                  ci === 0 ? 'font-medium text-slate-700' : ''
                } ${ci === 1 ? 'text-primary-700 font-medium bg-primary-50/50' : 'text-slate-600'}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/** Panneau ERP détaillé — guide d'utilisation. */
export const ErpValuePanel = () => {
  const [showWorkflow, setShowWorkflow] = useState(true)
  const [showCompare, setShowCompare] = useState(false)

  return (
    <div className="space-y-4">
      <Card className="border-primary-100 bg-gradient-to-br from-primary-50 to-white">
        <Card.Body className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" />
            <p className="text-sm font-bold text-primary-700 uppercase tracking-wide">{ERP_BRAND}</p>
          </div>
          <h3 className="text-lg font-bold text-navy">{ERP_TAGLINE}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{ERP_SUBTITLE}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {RIHLA_ADVANTAGES.map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-600">
                <span className="text-primary-500 font-bold flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header title={`Modules ${ERP_BRAND}`} subtitle="Les 4 piliers de gestion de votre agence" />
        <Card.Body>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ERP_PILLARS.map(pilier => (
              <div key={pilier.id} className={`rounded-xl border p-4 ${pilier.couleur}`}>
                <p className="text-sm font-bold">{pilier.titre}</p>
                <p className="text-xs mt-1 opacity-80">{pilier.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {ERP_MODULES.filter(m => m.pilier === pilier.id).map(m => (
                    <Link
                      key={m.route}
                      to={m.route}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 hover:bg-white border border-current/20 transition-colors"
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <button
          type="button"
          onClick={() => setShowWorkflow(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-navy">Cycle métier {ERP_BRAND}</p>
            <p className="text-xs text-slate-400 mt-0.5">Du premier contact client au pilotage financier</p>
          </div>
          {showWorkflow ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        {showWorkflow && (
          <div className="px-5 pb-5 border-t border-slate-100">
            <ol className="space-y-3 mt-4">
              {ERP_WORKFLOW.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{step.etape}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      <Card>
        <button
          type="button"
          onClick={() => setShowCompare(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-navy">Rihla vs le marché</p>
            <p className="text-xs text-slate-400 mt-0.5">Pourquoi un {ERP_BRAND} plutôt que des outils dispersés</p>
          </div>
          {showCompare ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        {showCompare && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
            <ComparisonTable />
          </div>
        )}
      </Card>
    </div>
  )
}
