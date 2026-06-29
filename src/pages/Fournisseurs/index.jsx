import React, { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { AccessDenied } from '../../components/UI'
import {
  Truck, Plus, Search, X, Edit2, Trash2, Star,
  Mail, Phone, MapPin, ChevronLeft, LayoutGrid,
  List, Package, Download,
  CreditCard, FileText, Building2,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS } from '../../utils/sampleData'
import {
  formatPhone, fuzzyMatch, sortByKey, todayISO,
} from '../../utils/formatters'
import {
  Button, Card, Modal, ConfirmModal, Badge, SortIcon,
} from '../../components/UI'

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const TYPES = ['Réceptif', 'Compagnie aérienne', 'Hôtel', 'Assurance', 'Transport', 'Visa', 'Autre']

const TYPE_META = {
  'Réceptif':           { color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-700 border-blue-200',     icon: Building2 },
  'Compagnie aérienne': { color: 'bg-purple-500',  light: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
  'Hôtel':              { color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Building2 },
  'Assurance':          { color: 'bg-orange-500',  light: 'bg-orange-50 text-orange-700 border-orange-200', icon: FileText },
  'Transport':          { color: 'bg-teal-500',    light: 'bg-teal-50 text-teal-700 border-teal-200',    icon: Truck },
  'Visa':               { color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-700 border-amber-200', icon: FileText },
  'Autre':              { color: 'bg-gray-400',    light: 'bg-gray-50 text-gray-700 border-gray-200',    icon: Building2 },
}

const CONDITIONS = [
  'Immédiat', 'Immédiat via BSP', '100% à la commande',
  '30 jours', '30 jours fin de mois', '60 jours', 'Mensuel', 'Autre',
]

const EMPTY_SUPPLIER = {
  nom: '', type: 'Réceptif', contact: '',
  telephone: '', email: '', ville: '',
  conditionsPaiement: '30 jours', note: 4, notes: '',
}

/* ─────────────────────────────────────────
   STAR RATING
───────────────────────────────────────── */

const StarRating = ({ value, max = 5, onChange, size = 'sm' }) => {
  const [hovered, setHovered] = useState(null)
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = (hovered ?? value) > i
        return (
          <button
            key={i}
            type="button"
            onClick={onChange ? () => onChange(i + 1) : undefined}
            onMouseEnter={onChange ? () => setHovered(i + 1) : undefined}
            onMouseLeave={onChange ? () => setHovered(null) : undefined}
            className={onChange ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`${sz} transition-colors ${filled ? 'text-amber-400' : 'text-gray-200'}`}
              fill={filled ? 'currentColor' : 'none'}
            />
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────
   SUPPLIER FORM
───────────────────────────────────────── */

const SupplierForm = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() => initial ?? { ...EMPTY_SUPPLIER })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    onSave(form)
  }

  const TypeIcon = TYPE_META[form.type]?.icon ?? Building2

  return (
    <Modal
      title={isEdit ? `Modifier — ${form.nom}` : 'Nouveau fournisseur'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nom + Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nom *</label>
            <input className="input-field" value={form.nom} required autoFocus
              onChange={e => set('nom', e.target.value)}
              placeholder="MedTours Operator…" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input-field" value={form.type}
              onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Type preview */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
          ${TYPE_META[form.type]?.light ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
          <TypeIcon className="w-4 h-4" />
          {form.type}
        </div>

        {/* Contact + Ville */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Interlocuteur</label>
            <input className="input-field" value={form.contact}
              onChange={e => set('contact', e.target.value)}
              placeholder="Prénom Nom" />
          </div>
          <div>
            <label className="label">Ville / Pays</label>
            <input className="input-field" value={form.ville}
              onChange={e => set('ville', e.target.value)}
              placeholder="Casablanca, Maroc" />
          </div>
        </div>

        {/* Email + Téléphone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="contact@fournisseur.com" />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input-field" value={form.telephone}
              onChange={e => set('telephone', e.target.value)}
              placeholder="+212 5XX XXXXXX" />
          </div>
        </div>

        {/* Conditions + Note */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Conditions de paiement</label>
            <select className="input-field" value={form.conditionsPaiement}
              onChange={e => set('conditionsPaiement', e.target.value)}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Note partenaire</label>
            <div className="mt-1">
              <StarRating value={form.note} max={5} onChange={v => set('note', v)} size="md" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes internes</label>
          <textarea className="input-field resize-none" rows={3} value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Fiabilité, remarques, conditions particulières…" />
        </div>
      </form>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   SUPPLIER PROFILE
───────────────────────────────────────── */

const SupplierProfile = ({ supplier, linkedProducts, onEdit, onBack }) => {
  const meta = TYPE_META[supplier.type] ?? TYPE_META.Autre
  const TypeIcon = meta.icon

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-700 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour aux fournisseurs
      </button>

      {/* Hero */}
      <Card>
        <Card.Body className="flex flex-col sm:flex-row items-start gap-6">
          <div className={`w-16 h-16 rounded-2xl ${meta.color} flex items-center justify-center flex-shrink-0`}>
            <TypeIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-2xl font-bold text-navy-800">{supplier.nom}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.light}`}>
                  {supplier.type}
                </span>
                {supplier.ville && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {supplier.ville}
                  </span>
                )}
              </div>
            </div>
            <StarRating value={supplier.note} />
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-1">
              {supplier.contact && (
                <span className="text-gray-700 font-medium">{supplier.contact}</span>
              )}
              {supplier.email && (
                <a href={`mailto:${supplier.email}`}
                  className="flex items-center gap-1.5 hover:text-navy-700 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {supplier.email}
                </a>
              )}
              {supplier.telephone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {supplier.telephone}
                </span>
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm" icon={Edit2} onClick={() => onEdit(supplier)}>
            Modifier
          </Button>
        </Card.Body>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conditions paiement */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Paiement</span>
          </div>
          <p className="text-sm font-medium text-gray-800">{supplier.conditionsPaiement || '—'}</p>
        </Card>

        {/* Produits liés */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Produits</span>
          </div>
          <p className="text-2xl font-bold text-navy-700">{linkedProducts.length}</p>
          <p className="text-xs text-gray-500">produit(s) lié(s)</p>
        </Card>

        {/* Note */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Star className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">{supplier.note}</span>
            <span className="text-gray-400 text-sm">/ 5</span>
          </div>
          <StarRating value={supplier.note} size="sm" />
        </Card>
      </div>

      {/* Notes internes */}
      {supplier.notes && (
        <Card>
          <Card.Header title="Notes internes" />
          <Card.Body>
            <p className="text-sm text-gray-600 leading-relaxed">{supplier.notes}</p>
          </Card.Body>
        </Card>
      )}

      {/* Produits liés */}
      <Card>
        <Card.Header title="Produits liés" subtitle={`${linkedProducts.length} produit(s) associé(s)`} />
        {linkedProducts.length === 0 ? (
          <Card.Body>
            <div className="py-8 text-center text-gray-400 text-sm">
              Aucun produit lié à ce fournisseur
            </div>
          </Card.Body>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Produit', 'Type', 'Destination', 'Prix vente', 'Disponible'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {linkedProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{p.nom}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.type}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.destination || '—'}</td>
                    <td className="px-4 py-2.5 font-semibold text-navy-700">
                      {new Intl.NumberFormat('fr-MA').format(p.prixVente)} MAD
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${p.disponible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                        }`}>
                        {p.disponible ? 'Disponible' : 'Indispo.'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ─────────────────────────────────────────
   SUPPLIER CARD
───────────────────────────────────────── */

const SupplierCard = ({ supplier, productCount, onEdit, onDelete, onView }) => {
  const meta = TYPE_META[supplier.type] ?? TYPE_META.Autre
  const TypeIcon = meta.icon

  return (
    <div
      onClick={() => onView(supplier)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
    >
      <div className={`h-1.5 ${meta.color}`} />
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0`}>
            <TypeIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{supplier.nom}</h3>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${meta.light}`}>
              {supplier.type}
            </span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(supplier)}
              className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(supplier)}
              className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          {supplier.contact && (
            <div className="text-xs text-gray-600 font-medium">{supplier.contact}</div>
          )}
          {supplier.ville && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {supplier.ville}
            </div>
          )}
          {supplier.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate"
              onClick={e => e.stopPropagation()}>
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${supplier.email}`}
                className="hover:text-navy-700 transition-colors truncate"
                onClick={e => e.stopPropagation()}>
                {supplier.email}
              </a>
            </div>
          )}
          {supplier.telephone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {supplier.telephone}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <StarRating value={supplier.note ?? 0} />
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Package className="w-3.5 h-3.5" />
            <span>{productCount} produit{productCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Conditions */}
        {supplier.conditionsPaiement && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 rounded-lg px-2.5 py-1.5">
            <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
            {supplier.conditionsPaiement}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   TABLE VIEW
───────────────────────────────────────── */

const SupplierTable = ({ rows, productsBySupplier, sortCol, sortDir, onSort, onEdit, onDelete, onView }) => {
  const cols = [
    { key: 'nom',     label: 'Fournisseur' },
    { key: 'type',    label: 'Type' },
    { key: 'ville',   label: 'Ville' },
    { key: 'contact', label: 'Contact' },
    { key: 'conditionsPaiement', label: 'Paiement' },
    { key: 'note',    label: 'Note', align: 'center' },
    { key: 'produits',label: 'Produits', align: 'center' },
    { key: 'actions', label: '' },
  ]

  if (!rows.length) return (
    <div className="py-16 flex flex-col items-center text-gray-400">
      <Truck className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm font-medium">Aucun fournisseur trouvé</p>
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {cols.map(c => (
              <th
                key={c.key}
                onClick={c.key !== 'actions' && c.key !== 'produits' ? () => onSort(c.key) : undefined}
                className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
                  ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'}
                  ${c.key !== 'actions' && c.key !== 'produits' ? 'cursor-pointer hover:text-gray-700 select-none' : ''}
                `}
              >
                <span className="inline-flex items-center">
                  {c.label}
                  {c.key !== 'actions' && c.key !== 'produits' && (
                    <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(s => {
            const meta = TYPE_META[s.type] ?? TYPE_META.Autre
            const TypeIcon = meta.icon
            const pCount = productsBySupplier[s.id] ?? 0
            return (
              <tr key={s.id}
                onClick={() => onView(s)}
                className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${meta.color} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">{s.nom}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.light}`}>
                    {s.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{s.ville || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{s.contact || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{s.conditionsPaiement || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <StarRating value={s.note ?? 0} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    {pCount}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(s)}
                      className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(s)}
                      className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

const FournisseursContent = () => {
  const [suppliers, setSuppliers] = useLocalStorage(STORAGE_KEYS.suppliers, [])
  const [products]                = useLocalStorage(STORAGE_KEYS.products,  [])
  const toast = useToast()

  const [profile,      setProfile]      = useState(null)
  const [view,         setView]         = useState('cards')
  const [search,       setSearch]       = useState('')
  const [typeF,        setTypeF]        = useState('')
  const [sortCol,      setSortCol]      = useState('nom')
  const [sortDir,      setSortDir]      = useState('asc')
  const [formOpen,     setFormOpen]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  /* ── products per supplier ── */
  const productsBySupplier = useMemo(() => {
    const map = {}
    products.forEach(p => {
      if (p.fournisseurId) map[p.fournisseurId] = (map[p.fournisseurId] ?? 0) + 1
    })
    return map
  }, [products])

  const linkedProductsFor = (supplierId) =>
    products.filter(p => p.fournisseurId === supplierId)

  /* ── sort ── */
  const handleSort = (col) => {
    setSortCol(prev => {
      if (prev === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
      else setSortDir('asc')
      return col
    })
  }

  /* ── filtered ── */
  const filtered = useMemo(() => {
    let list = suppliers
    if (search) list = list.filter(s =>
      fuzzyMatch(s.nom, search) || fuzzyMatch(s.contact, search) || fuzzyMatch(s.ville, search))
    if (typeF) list = list.filter(s => s.type === typeF)
    return sortByKey(list, sortCol, sortDir)
  }, [suppliers, search, typeF, sortCol, sortDir])

  /* ── KPI ── */
  const kpi = useMemo(() => {
    const avgNote = suppliers.length
      ? suppliers.reduce((s, f) => s + (parseFloat(f.note) || 0), 0) / suppliers.length
      : 0
    const active = suppliers.filter(s => (productsBySupplier[s.id] ?? 0) > 0).length
    const top5   = [...suppliers].sort((a, b) => (b.note ?? 0) - (a.note ?? 0)).slice(0, 1)[0]
    return { avgNote, active, top5 }
  }, [suppliers, productsBySupplier])

  /* ── types for filter ── */
  const typeOptions = useMemo(() => [...new Set(suppliers.map(s => s.type))].sort(), [suppliers])

  /* ── CRUD ── */
  const handleSave = (form) => {
    if (editTarget?.id) {
      setSuppliers(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...form } : s))
      toast.success('Fournisseur mis à jour')
      if (profile?.id === editTarget.id) setProfile(p => ({ ...p, ...form }))
    } else {
      const newS = { ...form, id: `fou-${Date.now()}` }
      setSuppliers(prev => [...prev, newS])
      toast.success(`Fournisseur "${newS.nom}" créé`)
    }
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleDelete = () => {
    setSuppliers(prev => prev.filter(s => s.id !== deleteTarget.id))
    toast.success('Fournisseur supprimé')
    setDeleteTarget(null)
    if (profile?.id === deleteTarget.id) setProfile(null)
  }

  const openNew  = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (s) => { setEditTarget(s); setFormOpen(true) }

  const clearFilters = () => { setSearch(''); setTypeF('') }
  const hasFilters = search || typeF

  /* ── CSV ── */
  const exportCSV = () => {
    const headers = ['Nom', 'Type', 'Contact', 'Email', 'Téléphone', 'Ville', 'Paiement', 'Note', 'Produits']
    const rows = filtered.map(s => [
      s.nom, s.type, s.contact, s.email, s.telephone,
      s.ville, s.conditionsPaiement, s.note,
      productsBySupplier[s.id] ?? 0,
    ])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `fournisseurs-${todayISO()}.csv`
    a.click()
  }

  /* ── profile view ── */
  if (profile) {
    const live = suppliers.find(s => s.id === profile.id) ?? profile
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <SupplierProfile
          supplier={live}
          linkedProducts={linkedProductsFor(live.id)}
          onEdit={openEdit}
          onBack={() => setProfile(null)}
        />
        {formOpen && (
          <SupplierForm
            initial={editTarget}
            onSave={handleSave}
            onClose={() => { setFormOpen(false); setEditTarget(null) }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Fournisseurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez vos partenaires et prestataires</p>
        </div>
        <Button icon={Plus} onClick={openNew}>Nouveau fournisseur</Button>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-50">
            <Truck className="w-5 h-5 text-navy-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-navy-800">{suppliers.length}</div>
            <div className="text-xs text-gray-500">Fournisseurs</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-600">{kpi.active}</div>
            <div className="text-xs text-gray-500">Partenaires actifs</div>
            <div className="text-xs text-gray-400">avec produits liés</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-600">{kpi.avgNote.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Note moyenne</div>
            <StarRating value={Math.round(kpi.avgNote)} size="sm" />
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-navy-800 leading-tight truncate">
              {kpi.top5?.nom?.split(' ').slice(0, 2).join(' ') ?? '—'}
            </div>
            <div className="text-xs text-gray-500">Mieux noté</div>
            {kpi.top5 && <StarRating value={kpi.top5.note ?? 0} size="sm" />}
          </div>
        </Card>
      </div>

      {/* ── Toolbar ── */}
      <Card noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Rechercher (nom, contact, ville)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type */}
          <select className="input-field py-2 text-sm min-w-40" value={typeF}
            onChange={e => setTypeF(e.target.value)}>
            <option value="">Tous les types</option>
            {typeOptions.map(t => <option key={t}>{t}</option>)}
          </select>

          {hasFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
              Réinitialiser
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">{filtered.length} fournisseur(s)</span>
            <Button variant="secondary" size="sm" icon={Download} onClick={exportCSV}>CSV</Button>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView('cards')}
                className={`p-2 transition-colors ${view === 'cards' ? 'bg-navy-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-2 transition-colors ${view === 'table' ? 'bg-navy-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'cards' ? (
          <div className="p-4">
            {filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-gray-400">
                <Truck className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">Aucun fournisseur trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(s => (
                  <SupplierCard
                    key={s.id}
                    supplier={s}
                    productCount={productsBySupplier[s.id] ?? 0}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    onView={setProfile}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <SupplierTable
            rows={filtered}
            productsBySupplier={productsBySupplier}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onView={setProfile}
          />
        )}
      </Card>

      {/* ── Modals ── */}
      {formOpen && (
        <SupplierForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Supprimer "${deleteTarget.nom}" ?`}
          message="Ce fournisseur sera supprimé définitivement. Les produits liés ne seront pas affectés."
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export const FournisseursPage = () => {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <AccessDenied />
  return <FournisseursContent />
}
