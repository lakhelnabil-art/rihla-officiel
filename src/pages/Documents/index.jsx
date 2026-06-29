import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  FolderOpen, Search, FileText, Image, File,
  Eye, Download, Trash2, BookOpen, User, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS, defaultSettings } from '../../utils/sampleData'
import { formatDate } from '../../utils/formatters'
import {
  Card, ConfirmModal, EmptyState, Avatar, Badge,
  DOC_TYPES, formatDocSize,
} from '../../components/UI'
import { AgencyGuide } from './AgencyGuide'

const ALL = 'Tous'
const FILTER_TYPES = [ALL, ...DOC_TYPES]

const TABS = [
  { id: 'guide', label: "Guide ERP Rihla", icon: BookOpen },
  { id: 'fichiers', label: 'Mes fichiers', icon: FolderOpen },
]

const fileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return { icon: Image, color: 'text-green-500' }
  if (mimeType === 'application/pdf') return { icon: FileText, color: 'text-red-500' }
  return { icon: File, color: 'text-slate-400' }
}

const openDoc = (doc) => {
  const w = window.open('', '_blank')
  if (doc.mimeType?.startsWith('image/')) {
    w.document.write(`<body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${doc.data}" style="max-width:100%;max-height:100vh;display:block" /></body>`)
  } else {
    w.document.write(`<body style="margin:0"><iframe src="${doc.data}" style="width:100vw;height:100vh;border:none"></iframe></body>`)
  }
}

const downloadDoc = (doc) => {
  const a = document.createElement('a')
  a.href = doc.data
  a.download = doc.nom
  a.click()
}

const UNASSIGNED_KEY = '__none__'

const DocRow = ({ doc, onDelete }) => {
  const { icon: Icon, color } = fileIcon(doc.mimeType)
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-slate-700 truncate">{doc.nom}</p>
          <span className="text-xs text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
            {doc.type}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
          <span>{formatDocSize(doc.size)}</span>
          <span>·</span>
          <span>{formatDate(doc.dateAjout)}</span>
          {doc.reservationRef && (
            <>
              <span>·</span>
              <span className="font-mono text-primary-600">{doc.reservationRef}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => openDoc(doc)}
          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Voir"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => downloadDoc(doc)}
          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Télécharger"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(doc)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const ClientDocGroup = ({ group, expanded, onToggle, onDeleteDoc }) => {
  const totalSize = group.docs.reduce((s, d) => s + (d.size || 0), 0)
  const isUnassigned = !group.clientId

  return (
    <Card>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        {isUnassigned ? (
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-slate-400" />
          </div>
        ) : (
          <Avatar name={group.clientNom} size="md" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-navy">{group.clientNom}</p>
            {group.tag && <Badge variant="default">{group.tag}</Badge>}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {group.docs.length} fichier{group.docs.length !== 1 ? 's' : ''}
            {totalSize > 0 && <> · {formatDocSize(totalSize)}</>}
            {group.ville && <> · {group.ville}</>}
          </p>
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-100">
          {group.docs.map(doc => (
            <DocRow key={doc.id} doc={doc} onDelete={onDeleteDoc} />
          ))}
        </div>
      )}
    </Card>
  )
}

export const DocumentsPage = () => {
  const [documents, setDocuments] = useLocalStorage(STORAGE_KEYS.documents, [])
  const [clients]     = useLocalStorage(STORAGE_KEYS.clients, [])
  const [settings]    = useLocalStorage(STORAGE_KEYS.settings, defaultSettings)
  const { toast } = useToast()

  const [activeTab,       setActiveTab]       = useState('guide')
  const [search,          setSearch]          = useState('')
  const [filterType,      setFilterType]      = useState(ALL)
  const [filterClient,    setFilterClient]    = useState(ALL)
  const [expandedClients, setExpandedClients] = useState(new Set())
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [deleting,        setDeleting]        = useState(null)

  const agencyName = settings?.nom || 'Mon Agence'

  const filtered = useMemo(() => {
    return documents.filter(d => {
      if (search) {
        const q = search.toLowerCase()
        if (!`${d.nom} ${d.clientNom} ${d.reservationRef} ${d.type}`.toLowerCase().includes(q)) return false
      }
      if (filterType !== ALL && d.type !== filterType) return false
      if (filterClient !== ALL) {
        const key = d.clientId || UNASSIGNED_KEY
        if (key !== filterClient) return false
      }
      return true
    })
  }, [documents, search, filterType, filterClient])

  const byClient = useMemo(() => {
    const groups = new Map()

    filtered.forEach(doc => {
      const key = doc.clientId || UNASSIGNED_KEY
      if (!groups.has(key)) {
        const client = clients.find(c => c.id === doc.clientId)
        groups.set(key, {
          key,
          clientId: doc.clientId || null,
          clientNom: client?.nom || doc.clientNom || 'Sans client assigné',
          tag: client?.tag,
          ville: client?.ville,
          docs: [],
        })
      }
      groups.get(key).docs.push(doc)
    })

    return [...groups.values()]
      .sort((a, b) => {
        if (a.key === UNASSIGNED_KEY) return 1
        if (b.key === UNASSIGNED_KEY) return -1
        return a.clientNom.localeCompare(b.clientNom, 'fr')
      })
      .map(g => ({
        ...g,
        docs: g.docs.sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout)),
      }))
  }, [filtered, clients])

  const clientFilterOptions = useMemo(() => {
    const keys = new Set(documents.map(d => d.clientId || UNASSIGNED_KEY))
    const options = clients
      .filter(c => keys.has(c.id))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
      .map(c => ({ key: c.id, label: c.nom }))
    if (keys.has(UNASSIGNED_KEY)) {
      options.push({ key: UNASSIGNED_KEY, label: 'Sans client assigné' })
    }
    return options
  }, [documents, clients])

  const prevTabRef = useRef(activeTab)

  useEffect(() => {
    const switchedToFichiers = activeTab === 'fichiers' && prevTabRef.current !== 'fichiers'
    prevTabRef.current = activeTab
    if (!switchedToFichiers || byClient.length === 0) return
    setExpandedClients(new Set(byClient.map(g => g.key)))
  }, [activeTab, byClient])

  const totalSize = documents.reduce((s, d) => s + (d.size || 0), 0)
  const clientCount = byClient.length

  const kpiTypes = ['Passeport', 'Visa', "Billet d'avion", 'Contrat']

  const askDelete = (doc) => { setDeleting(doc); setShowConfirm(true) }
  const handleDelete = () => {
    setDocuments(prev => prev.filter(d => d.id !== deleting.id))
    toast.success('Document supprimé.')
    setShowConfirm(false)
    setDeleting(null)
  }

  const toggleClient = (key) => {
    setExpandedClients(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const expandAllClients = () => setExpandedClients(new Set(byClient.map(g => g.key)))
  const collapseAllClients = () => setExpandedClients(new Set())

  return (
    <div className="space-y-6">


      {showConfirm && (
        <ConfirmModal
          title="Supprimer le document"
          message={`Supprimer "${deleting?.nom}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onClose={() => { setShowConfirm(false); setDeleting(null) }}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Documents</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Guide d'utilisation et fichiers clients · {documents.length} fichier{documents.length !== 1 ? 's' : ''} · {formatDocSize(totalSize)} utilisés
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'guide' && (
        <AgencyGuide agencyName={agencyName} />
      )}

      {activeTab === 'fichiers' && (<>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiTypes.map(type => {
          const count = documents.filter(d => d.type === type).length
          return (
            <Card key={type}>
              <Card.Body className="py-3">
                <p className="text-2xl font-bold text-navy">{count}</p>
                <p className="text-xs text-slate-400 mt-0.5">{type}{count > 1 ? 's' : ''}</p>
              </Card.Body>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <Card.Body className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                className="input-field pl-9"
                placeholder="Rechercher par nom, client, référence…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input-field sm:w-44"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              {FILTER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select
              className="input-field sm:w-52"
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
            >
              <option value={ALL}>Tous les clients</option>
              {clientFilterOptions.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          {byClient.length > 1 && (
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={expandAllClients} className="text-xs text-primary-600 hover:underline">
                Tout développer
              </button>
              <span className="text-slate-300">·</span>
              <button type="button" onClick={collapseAllClients} className="text-xs text-slate-500 hover:underline">
                Tout réduire
              </button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* List by client */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Aucun document trouvé"
          message="Ajoutez des documents depuis la fiche client ou la réservation."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            {clientCount} client{clientCount !== 1 ? 's' : ''} · {filtered.length} fichier{filtered.length !== 1 ? 's' : ''}
          </p>
          {byClient.map(group => (
            <ClientDocGroup
              key={group.key}
              group={group}
              expanded={expandedClients.has(group.key)}
              onToggle={() => toggleClient(group.key)}
              onDeleteDoc={askDelete}
            />
          ))}
        </div>
      )}

      </>)}
    </div>
  )
}
