import React, { useMemo, useRef, useState } from 'react'
import {
  FolderOpen, Upload, Trash2, Eye, Download, Search,
  FileText, Image, File, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS } from '../../utils/sampleData'
import { formatDate } from '../../utils/formatters'
import { Button, Card, ConfirmModal, formatDocSize } from '../../components/UI'

export const AGENCY_DOC_TYPES = [
  'Administratif',
  'Réglementation',
  'Financier',
  'Fiscal',
  'Gestion',
  'RH & Équipe',
  'Commercial',
  'Autre',
]

const MAX_SIZE_MB = 5
const ALL = 'Tous'

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
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {formatDocSize(doc.size)} · {formatDate(doc.dateAjout)}
          {doc.description && <> · {doc.description}</>}
        </p>
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

const CategoryGroup = ({ category, docs, expanded, onToggle, onDeleteDoc }) => {
  const totalSize = docs.reduce((s, d) => s + (d.size || 0), 0)
  return (
    <Card>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy">{category}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {docs.length} fichier{docs.length !== 1 ? 's' : ''}
            {totalSize > 0 && <> · {formatDocSize(totalSize)}</>}
          </p>
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-100">
          {docs.map(doc => (
            <DocRow key={doc.id} doc={doc} onDelete={onDeleteDoc} />
          ))}
        </div>
      )}
    </Card>
  )
}

export const AgencyFilesSection = () => {
  const [files, setFiles] = useLocalStorage(STORAGE_KEYS.internalDocuments, [])
  const { toast } = useToast()
  const inputRef = useRef(null)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState(ALL)
  const [docType, setDocType] = useState(AGENCY_DOC_TYPES[0])
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sizeError, setSizeError] = useState('')
  const [expanded, setExpanded] = useState(() => new Set(AGENCY_DOC_TYPES))
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const filtered = useMemo(() => {
    return files.filter(f => {
      if (search) {
        const q = search.toLowerCase()
        if (!`${f.nom} ${f.type} ${f.description || ''}`.toLowerCase().includes(q)) return false
      }
      if (filterType !== ALL && f.type !== filterType) return false
      return true
    })
  }, [files, search, filterType])

  const byCategory = useMemo(() => {
    const groups = new Map()
    filtered.forEach(doc => {
      const key = doc.type || 'Autre'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(doc)
    })
    return AGENCY_DOC_TYPES
      .filter(t => groups.has(t))
      .map(type => ({
        type,
        docs: groups.get(type).sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout)),
      }))
  }, [filtered])

  const totalSize = files.reduce((s, d) => s + (d.size || 0), 0)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSizeError('')
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSizeError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo)`)
      e.target.value = ''
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setFiles(prev => [{
        id: `afd-${Date.now()}`,
        nom: file.name,
        type: docType,
        description: description.trim(),
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data: ev.target.result,
        dateAjout: new Date().toISOString().slice(0, 10),
      }, ...prev])
      setDescription('')
      setUploading(false)
      e.target.value = ''
      toast.success('Document ajouté.')
    }
    reader.readAsDataURL(file)
  }

  const askDelete = (doc) => { setDeleting(doc); setShowConfirm(true) }
  const handleDelete = () => {
    setFiles(prev => prev.filter(f => f.id !== deleting.id))
    toast.success('Document supprimé.')
    setShowConfirm(false)
    setDeleting(null)
  }

  const toggleCategory = (type) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  return (
    <div className="space-y-5">
      {showConfirm && (
        <ConfirmModal
          title="Supprimer le document"
          message={`Supprimer « ${deleting?.nom} » ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onClose={() => { setShowConfirm(false); setDeleting(null) }}
        />
      )}

      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Documents de l'agence</h3>
        <p className="text-sm text-gray-500">
          Centralisez les documents internes : administratifs, réglementaires, financiers, gestion, etc.
          Ces fichiers sont réservés à l'administration et ne sont pas visibles par les agents.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AGENCY_DOC_TYPES.slice(0, 4).map(type => {
          const count = files.filter(f => f.type === type).length
          return (
            <Card key={type}>
              <Card.Body className="py-3">
                <p className="text-xl font-bold text-navy">{count}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate" title={type}>{type}</p>
              </Card.Body>
            </Card>
          )
        })}
      </div>
      <p className="text-xs text-slate-400 -mt-2">
        {files.length} fichier{files.length !== 1 ? 's' : ''} au total · {formatDocSize(totalSize)} utilisés
      </p>

      {/* Upload */}
      <Card>
        <Card.Header title="Ajouter un document" subtitle="PDF, images, Word · max 5 Mo" />
        <Card.Body className="space-y-3">
          {sizeError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{sizeError}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
              <select className="input-field" value={docType} onChange={e => setDocType(e.target.value)}>
                {AGENCY_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (optionnel)</label>
              <input
                className="input-field"
                placeholder="Ex. Licence IATA 2026, RC signé…"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" icon={Upload} loading={uploading} onClick={() => inputRef.current?.click()}>
            Choisir un fichier
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />
        </Card.Body>
      </Card>

      {/* Filters */}
      <Card>
        <Card.Body>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                className="input-field pl-9"
                placeholder="Rechercher par nom ou description…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="input-field sm:w-52" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value={ALL}>Toutes les catégories</option>
              {AGENCY_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </Card.Body>
      </Card>

      {/* List by category */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-xl">
          <FolderOpen className="w-8 h-8 opacity-30" />
          <p className="text-sm">Aucun document enregistré</p>
          <p className="text-xs text-gray-300">Licence, statuts, contrats fournisseurs, procédures internes…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {byCategory.map(group => (
            <CategoryGroup
              key={group.type}
              category={group.type}
              docs={group.docs}
              expanded={expanded.has(group.type)}
              onToggle={() => toggleCategory(group.type)}
              onDeleteDoc={askDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
