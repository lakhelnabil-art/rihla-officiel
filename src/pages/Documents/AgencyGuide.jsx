import React, { useMemo, useState } from 'react'
import {
  BookOpen, Download, Printer, Search, ChevronDown, ChevronRight,
  Compass, LogIn, Shield, LayoutDashboard, CalendarDays, Users,
  Search as SearchIcon, FileText, Package, Wallet, Calendar,
  FolderOpen, UserCheck, Truck, Settings, CheckCircle, HelpCircle, Layers, Globe,
} from 'lucide-react'
import { Button, Card } from '../../components/UI'
import { GUIDE_META, GUIDE_SECTIONS, buildGuideHtml } from '../../content/guideAgences'
import { ErpValuePanel } from '../../components/ERP/ErpOverview'
import { ERP_BRAND_FULL } from '../../content/erpPositioning'

const ICON_MAP = {
  compass: Compass,
  'log-in': LogIn,
  shield: Shield,
  layout: LayoutDashboard,
  chart: LayoutDashboard,
  calendar: CalendarDays,
  users: Users,
  search: SearchIcon,
  'file-text': FileText,
  package: Package,
  wallet: Wallet,
  'calendar-days': Calendar,
  folder: FolderOpen,
  'user-check': UserCheck,
  truck: Truck,
  settings: Settings,
  'check-circle': CheckCircle,
  'help-circle': HelpCircle,
  layers: Layers,
  globe: Globe,
}

const GuideBlock = ({ block }) => {
  if (block.type === 'p') {
    return <p className="text-sm text-slate-600 leading-relaxed">{block.text}</p>
  }
  if (block.type === 'h4') {
    return <h4 className="text-sm font-semibold text-navy mt-4 mb-1.5">{block.text}</h4>
  }
  if (block.type === 'tip') {
    return (
      <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3 mt-3">
        <span className="text-amber-600 font-semibold text-xs uppercase tracking-wide flex-shrink-0 mt-0.5">Conseil</span>
        <p className="text-sm text-amber-900">{block.text}</p>
      </div>
    )
  }
  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul'
    return (
      <Tag className={`text-sm text-slate-600 space-y-1.5 mt-2 ${block.ordered ? 'list-decimal list-inside' : 'list-disc list-inside'}`}>
        {block.items.map((item, i) => (
          <li key={i} className="leading-relaxed">{item}</li>
        ))}
      </Tag>
    )
  }
  if (block.type === 'table') {
    return (
      <div className="overflow-x-auto mt-3 rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary-50">
              {block.headers.map((h, i) => (
                <th key={i} className="text-left px-3 py-2 font-semibold text-primary-700 border-b border-slate-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri} className="even:bg-slate-50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-slate-600 border-b border-slate-100">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return null
}

const GuideSection = ({ section, expanded, onToggle }) => {
  const Icon = ICON_MAP[section.icon] || BookOpen
  return (
    <div id={`guide-${section.id}`} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy">{section.titre}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{section.resume}</p>
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100">
          {section.contenu.map((block, i) => (
            <GuideBlock key={i} block={block} />
          ))}
        </div>
      )}
    </div>
  )
}

export const AgencyGuide = ({ agencyName = 'Mon Agence' }) => {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(() => new Set(['introduction']))

  const filteredSections = useMemo(() => {
    if (!search.trim()) return GUIDE_SECTIONS
    const q = search.toLowerCase()
    return GUIDE_SECTIONS.filter(s => {
      const inMeta = `${s.titre} ${s.resume}`.toLowerCase().includes(q)
      const inContent = s.contenu.some(b => {
        if (b.text) return b.text.toLowerCase().includes(q)
        if (b.items) return b.items.some(it => it.toLowerCase().includes(q))
        if (b.rows) return b.rows.flat().some(c => c.toLowerCase().includes(q))
        return false
      })
      return inMeta || inContent
    })
  }, [search])

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpanded(new Set(filteredSections.map(s => s.id)))
  const collapseAll = () => setExpanded(new Set())

  const downloadGuide = () => {
    const html = buildGuideHtml(agencyName)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Guide-Rihla-${agencyName.replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printGuide = () => {
    const w = window.open('', '_blank')
    w.document.write(buildGuideHtml(agencyName))
    w.document.close()
    w.onload = () => w.print()
  }

  return (
    <div className="space-y-4">
      <Card>
        <Card.Header
          title={GUIDE_META.titre}
          subtitle={`Version ${GUIDE_META.version} · ${GUIDE_META.date} · ${agencyName}`}
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" icon={Printer} onClick={printGuide}>
                Imprimer
              </Button>
              <Button size="sm" icon={Download} onClick={downloadGuide}>
                Télécharger
              </Button>
            </div>
          }
        />
        <Card.Body className="space-y-4">
          <p className="text-sm text-slate-600">
            Ce guide présente Rihla en tant que {ERP_BRAND_FULL} pour votre agence :
            vision métier, modules, cycle commercial et différenciation par rapport au marché.
          </p>

          <ErpValuePanel />

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                className="input-field pl-9"
                placeholder="Rechercher dans le guide…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={expandAll}>Tout ouvrir</Button>
              <Button size="sm" variant="secondary" onClick={collapseAll}>Tout fermer</Button>
            </div>
          </div>

          {/* Table des matières */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Sommaire
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {GUIDE_SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setExpanded(prev => new Set([...prev, s.id]))
                    document.getElementById(`guide-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="text-left text-xs text-primary-600 hover:text-primary-700 hover:underline py-0.5"
                >
                  {i + 1}. {s.titre}
                </button>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      {filteredSections.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-10 text-slate-400 text-sm">
            Aucune section ne correspond à votre recherche.
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSections.map(section => (
            <GuideSection
              key={section.id}
              section={section}
              expanded={expanded.has(section.id)}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
