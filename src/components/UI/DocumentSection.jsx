import React, { useRef, useState } from 'react'
import { Upload, Trash2, Eye, Download, FolderOpen, FileText, Image, File } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { formatDate } from '../../utils/formatters'

export const DOC_TYPES = ['Passeport', 'Visa', "Billet d'avion", 'Bon de voyage', 'Contrat', 'Assurance', 'Photo', 'Autre']
const MAX_SIZE_MB = 2

const fileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return { icon: Image, color: 'text-green-500' }
  if (mimeType === 'application/pdf') return { icon: FileText, color: 'text-red-500' }
  return { icon: File, color: 'text-slate-400' }
}

export const formatDocSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
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

/**
 * Reusable document section.
 * - Default (compact=false): wraps everything in a Card (for full-page views like CRM profile)
 * - compact=true: renders as a borderless section (for use inside modals)
 */
export const DocumentSection = ({
  docs = [],
  onAdd,
  onDelete,
  clientId = '',
  clientNom = '',
  reservationId = '',
  reservationRef = '',
  compact = false,
}) => {
  const inputRef = useRef(null)
  const [docType, setDocType] = useState('Passeport')
  const [uploading, setUploading] = useState(false)
  const [sizeError, setSizeError] = useState('')

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
      onAdd({
        id: `doc-${Date.now()}`,
        nom: file.name,
        type: docType,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data: ev.target.result,
        clientId,
        clientNom,
        reservationId,
        reservationRef,
        dateAjout: new Date().toISOString().slice(0, 10),
      })
      setUploading(false)
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const uploadAction = (
    <div className="flex items-center gap-2">
      <select
        className="input-field text-xs"
        style={{ height: '32px', paddingTop: '4px', paddingBottom: '4px' }}
        value={docType}
        onChange={e => setDocType(e.target.value)}
      >
        {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
      <Button size="sm" icon={Upload} loading={uploading} onClick={() => inputRef.current?.click()}>
        Ajouter
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
        onChange={handleFileChange}
      />
    </div>
  )

  const docList = docs.length === 0 ? (
    <div className={`flex flex-col items-center py-8 text-slate-400 gap-2 ${compact ? '' : 'px-5'}`}>
      <FolderOpen className="w-7 h-7 opacity-30" />
      <p className="text-sm">Aucun document enregistré</p>
      <p className="text-xs text-slate-300">Passeports, visas, billets, contrats…</p>
    </div>
  ) : (
    <div className={compact ? 'space-y-1.5' : 'divide-y divide-slate-50'}>
      {docs.map(doc => {
        const { icon: Icon, color } = fileIcon(doc.mimeType)
        return (
          <div
            key={doc.id}
            className={`flex items-center gap-3 hover:bg-slate-50 transition-colors rounded-lg
              ${compact ? 'px-2 py-2' : 'px-5 py-3'}`}
          >
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
              <p className="text-xs text-slate-400 mt-0.5">
                {formatDocSize(doc.size)} · {formatDate(doc.dateAjout)}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => openDoc(doc)}
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Voir"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => downloadDoc(doc)}
                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Télécharger"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(doc.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )

  if (compact) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        {sizeError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{sizeError}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Documents ({docs.length})
          </p>
          {uploadAction}
        </div>
        {docList}
      </div>
    )
  }

  return (
    <Card>
      <Card.Header
        title="Documents"
        subtitle={`${docs.length} fichier${docs.length !== 1 ? 's' : ''}`}
        action={uploadAction}
      />
      {sizeError && (
        <div className="mx-5 mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {sizeError}
        </div>
      )}
      {docList}
    </Card>
  )
}
