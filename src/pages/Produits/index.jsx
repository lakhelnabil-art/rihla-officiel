import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Package, Plus, Search, X,
  Edit2, Trash2, LayoutGrid, List, TrendingUp,
  Tag, MapPin, AlertTriangle, CheckCircle,
  Download, ToggleLeft, ToggleRight, BarChart2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'
import { STORAGE_KEYS } from '../../utils/sampleData'
import {
  formatCurrency, formatNumber, formatPercent,
  fuzzyMatch, sortByKey, sumBy, todayISO,
} from '../../utils/formatters'
import {
  Button, Card, Modal, ConfirmModal, Badge, ProgressBar, SortIcon,
} from '../../components/UI'
import { getBannedCountryError } from '../../data/bannedCountries'

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const TYPES = ['Package', 'Vol', 'Hôtel', 'Circuit', 'Omra', 'Croisière', 'Autre']
const HOTEL_CATEGORIES = ['3★', '4★', '5★', 'VIP', 'Riad', 'Apart-hôtel']
const SUPPLIER_TYPES   = ['Réceptif', 'Compagnie aérienne', 'Hôtel', 'Assurance', 'Autre']

const TYPE_COLORS = {
  Package:   '#1a56db',
  Vol:       '#7e3af2',
  Hôtel:     '#0e9f6e',
  Circuit:   '#ff8c00',
  Omra:      '#e3a008',
  Croisière: '#3f83f8',
  Autre:     '#9ca3af',
}

const EMPTY_PRODUCT = {
  nom: '', type: 'Package', destination: '',
  prixVente: 0, prixAchat: 0,
  disponible: true, description: '',
  fournisseurId: '', stock: 0,
  // ✈ Vol
  compagnieAerienne: '', classeVol: 'Économique',
  // 🏨 Hébergement
  dureeSejour: '', hotelId: '',
  // 📅 Validité
  dateDebutValidite: '', dateFinValidite: '', configuration: 'Solo',
  // 💰 Tarification
  tauxTaxe: 0, commissionAgent: 0, commissionMode: 'MAD',
  // 📋 Conditions
  conditionsAnnulation: '', tags: [],
}

/* ─────────────────────────────────────────
   MARGIN HELPERS
───────────────────────────────────────── */

const margeB  = (p) => (parseFloat(p.prixVente) || 0) - (parseFloat(p.prixAchat) || 0)
const tauxMarge = (p) => {
  const v = parseFloat(p.prixVente) || 0
  if (!v) return 0
  return (margeB(p) / v) * 100
}
const tauxMarque = (p) => {
  const a = parseFloat(p.prixAchat) || 0
  if (!a) return 0
  return (margeB(p) / a) * 100
}

const marginColor = (pct) => {
  if (pct >= 30) return 'green'
  if (pct >= 20) return 'blue'
  if (pct >= 10) return 'yellow'
  return 'red'
}

/* ─────────────────────────────────────────
   QUICK-ADD MODALS
───────────────────────────────────────── */

const QuickSupplierModal = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ nom: '', type: 'Réceptif', contact: '', telephone: '', email: '', conditionsPaiement: '', notes: '' })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.nom.trim()) return
    onAdd({ ...form, id: `fou-${Date.now()}`, note: 3 })
  }

  return (
    <Modal title="Nouveau fournisseur" onClose={onClose} size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={handleSave}>Ajouter</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nom *</label>
            <input className="input-field" value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Nom du fournisseur" autoFocus />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input-field" value={form.type} onChange={e => f('type', e.target.value)}>
              {SUPPLIER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Contact</label>
            <input className="input-field" value={form.contact} onChange={e => f('contact', e.target.value)} />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input-field" value={form.telephone} onChange={e => f('telephone', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={form.email} onChange={e => f('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Conditions de paiement</label>
          <input className="input-field" value={form.conditionsPaiement} onChange={e => f('conditionsPaiement', e.target.value)} placeholder="Ex : 30 jours fin de mois" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e => f('notes', e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}

const QuickHotelModal = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ nom: '', destination: '', categorie: '4★', typesChambres: '', description: '' })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.nom.trim()) return
    const chambres = form.typesChambres
      ? form.typesChambres.split(',').map(s => s.trim()).filter(Boolean)
      : []
    onAdd({ nom: form.nom, destination: form.destination, categorie: form.categorie, description: form.description, typesChambres: chambres, id: `hot-${Date.now()}` })
  }

  return (
    <Modal title="Nouvel hôtel" onClose={onClose} size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={handleSave}>Ajouter</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nom de l'hôtel *</label>
            <input className="input-field" value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Nom de l'hôtel" autoFocus />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select className="input-field" value={form.categorie} onChange={e => f('categorie', e.target.value)}>
              {HOTEL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Destination</label>
          <input className="input-field" value={form.destination} onChange={e => f('destination', e.target.value)} placeholder="Istanbul, Turquie…" />
        </div>
        <div>
          <label className="label">Types de chambres <span className="font-normal text-gray-400">(séparés par virgule)</span></label>
          <input className="input-field" value={form.typesChambres} onChange={e => f('typesChambres', e.target.value)} placeholder="Standard, Deluxe, Suite…" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => f('description', e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   PRODUCT FORM MODAL
───────────────────────────────────────── */

const SUGGESTED_TAGS = ['Omra', 'Hajj', 'Famille', 'Promo', 'VIP', 'Groupe', 'Ramadan', 'Dernière minute']

const ProductForm = ({ initial, suppliers, hotels = [], onAddSupplier, onAddHotel, onSave, onClose }) => {
  const isEdit = !!initial?.id
  const toast = useToast()
  const [form, setForm] = useState(() => initial ?? { ...EMPTY_PRODUCT })
  const [tagInput, setTagInput] = useState('')
  const [showQuickSupplier, setShowQuickSupplier] = useState(false)
  const [showQuickHotel,    setShowQuickHotel]    = useState(false)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleAddSupplier = (s) => { onAddSupplier?.(s); set('fournisseurId', s.id); setShowQuickSupplier(false) }
  const handleAddHotel    = (h) => { onAddHotel?.(h);    set('hotelId', h.id);        setShowQuickHotel(false)    }

  // Pricing & margin calculations
  const prixVente     = parseFloat(form.prixVente) || 0
  const prixAchat     = parseFloat(form.prixAchat) || 0
  const taux          = tauxMarge(form)
  const marque        = tauxMarque(form)
  const marge         = margeB(form)
  const tauxTaxeVal   = parseFloat(form.tauxTaxe) || 0
  const montantTaxe   = prixVente * (tauxTaxeVal / 100)
  const prixTTC       = prixVente + montantTaxe
  const commVal       = parseFloat(form.commissionAgent) || 0
  const commissionMAD = form.commissionMode === '%' ? prixVente * commVal / 100 : commVal
  const margeNetteMAD = marge - commissionMAD
  const margeNettePct = prixVente ? (margeNetteMAD / prixVente) * 100 : 0

  // Tags
  const tags = form.tags || []
  const addTag = (tag) => {
    const t = tag.trim()
    if (!t || tags.includes(t)) return
    set('tags', [...tags, t])
    setTagInput('')
  }
  const removeTag = (tag) => set('tags', tags.filter(t => t !== tag))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    const bannedError = getBannedCountryError(form.destination)
    if (bannedError) {
      toast.error(bannedError)
      return
    }
    onSave(form)
  }

  const SectionTitle = ({ children }) => (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</p>
  )

  return (
    <>
    <Modal
      title={isEdit ? `Modifier — ${form.nom}` : 'Nouveau produit / tarif'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Identité ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nom du produit *</label>
            <input className="input-field" value={form.nom}
              onChange={e => set('nom', e.target.value)}
              placeholder="Package Istanbul 7J/6N…" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input-field" value={form.type}
              onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Destination</label>
            <input className="input-field" value={form.destination}
              onChange={e => set('destination', e.target.value)}
              placeholder="Istanbul, Turquie…" />
          </div>
          <div>
            <label className="label">Fournisseur</label>
            <div className="flex gap-2">
              <select className="input-field flex-1" value={form.fournisseurId}
                onChange={e => set('fournisseurId', e.target.value)}>
                <option value="">— Aucun —</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowQuickSupplier(true)}
                title="Ajouter un fournisseur"
                className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                <Plus className="w-3.5 h-3.5" />Nouveau
              </button>
            </div>
          </div>
        </div>

        {/* ── ✈ Vol ── */}
        <div className="border-t border-gray-100 pt-5">
          <SectionTitle>✈ Vol</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Compagnie aérienne</label>
              <input className="input-field" value={form.compagnieAerienne || ''}
                onChange={e => set('compagnieAerienne', e.target.value)}
                placeholder="Royal Air Maroc, Air Arabia…" />
            </div>
            <div>
              <label className="label">Classe</label>
              <select className="input-field" value={form.classeVol || 'Économique'}
                onChange={e => set('classeVol', e.target.value)}>
                <option>Économique</option>
                <option>Business</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 🏨 Hébergement ── */}
        <div className="border-t border-gray-100 pt-5">
          <SectionTitle>🏨 Hébergement</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Durée du séjour</label>
              <input className="input-field" value={form.dureeSejour || ''}
                onChange={e => set('dureeSejour', e.target.value)}
                placeholder="7J/6N" />
            </div>
            <div>
              <label className="label">Hôtel</label>
              <div className="flex gap-2">
                <select className="input-field flex-1" value={form.hotelId || ''}
                  onChange={e => set('hotelId', e.target.value)}>
                  <option value="">— Aucun —</option>
                  {hotels.map(h => (
                    <option key={h.id} value={h.id}>{h.nom} ({h.categorie}) — {h.destination}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowQuickHotel(true)}
                  title="Ajouter un hôtel"
                  className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5" />Nouveau
                </button>
              </div>
              {!form.hotelId && form.categorieHotel && (
                <p className="text-xs text-gray-400 mt-1">Valeur précédente : {form.categorieHotel}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── 📅 Validité ── */}
        <div className="border-t border-gray-100 pt-5">
          <SectionTitle>📅 Validité</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Début de validité</label>
              <input type="date" className="input-field" value={form.dateDebutValidite || ''}
                onChange={e => set('dateDebutValidite', e.target.value)} />
            </div>
            <div>
              <label className="label">Fin de validité</label>
              <input type="date" className="input-field" value={form.dateFinValidite || ''}
                onChange={e => set('dateFinValidite', e.target.value)} />
            </div>
            <div>
              <label className="label">Configuration</label>
              <select className="input-field" value={form.configuration || 'Solo'}
                onChange={e => set('configuration', e.target.value)}>
                <option>Solo</option>
                <option>Couple</option>
                <option>Triple</option>
                <option>Quadruple</option>
                <option>Groupe</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 💰 Tarification & Fiscalité ── */}
        <div className="border-t border-gray-100 pt-5">
          <SectionTitle>💰 Tarification & Fiscalité</SectionTitle>
          <div className="space-y-4">

            {/* Prix HT + Prix achat */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prix de vente HT (MAD)</label>
                <input type="number" min="0" step="0.01" className="input-field"
                  value={form.prixVente}
                  onChange={e => set('prixVente', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Prix d'achat / coût (MAD)</label>
                <input type="number" min="0" step="0.01" className="input-field"
                  value={form.prixAchat}
                  onChange={e => set('prixAchat', parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            {/* Taux taxe + Commission */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Taux de taxe (%)</label>
                <input type="number" min="0" max="100" step="0.01" className="input-field"
                  value={form.tauxTaxe || ''}
                  onChange={e => set('tauxTaxe', parseFloat(e.target.value) || 0)}
                  placeholder="ex : 10" />
              </div>
              <div>
                <label className="label">Commission agent</label>
                <div className="flex">
                  <input type="number" min="0" step="0.01" className="input-field rounded-r-none"
                    value={form.commissionAgent || ''}
                    onChange={e => set('commissionAgent', parseFloat(e.target.value) || 0)}
                    placeholder="0" />
                  <button
                    type="button"
                    onClick={() => set('commissionMode', form.commissionMode === 'MAD' ? '%' : 'MAD')}
                    className="px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-600 transition-colors min-w-[52px]"
                  >
                    {form.commissionMode || 'MAD'}
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-calculated block */}
            {prixVente > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Calculs automatiques</p>

                {/* Row 1: taxe + TTC + commission */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <div className="text-sm font-bold text-gray-700">{formatCurrency(montantTaxe)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Montant taxe</div>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <div className="text-sm font-bold text-navy-700">{formatCurrency(prixTTC)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Prix TTC</div>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <div className="text-sm font-bold text-purple-700">{formatCurrency(commissionMAD)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Commission MAD</div>
                  </div>
                </div>

                {/* Row 2: marge brute + marge nette */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Marge brute</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        taux >= 30 ? 'bg-green-100 text-green-700'
                        : taux >= 20 ? 'bg-blue-100 text-blue-700'
                        : taux >= 10 ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                      }`}>{formatPercent(taux, 1)}</span>
                    </div>
                    <div className={`text-base font-bold ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(marge)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Marge nette</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        margeNettePct >= 30 ? 'bg-green-100 text-green-700'
                        : margeNettePct >= 20 ? 'bg-blue-100 text-blue-700'
                        : margeNettePct >= 10 ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                      }`}>{formatPercent(margeNettePct, 1)}</span>
                    </div>
                    <div className={`text-base font-bold ${margeNetteMAD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(margeNetteMAD)}
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={Math.max(0, Math.min(taux, 100))}
                  max={100}
                  color={marginColor(taux)}
                  size="sm"
                  showLabel
                  label={`Marge brute ${formatPercent(taux)}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Stock + Disponibilité ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Stock / Places disponibles</label>
            <input type="number" min="0" className="input-field"
              value={form.stock}
              onChange={e => set('stock', parseInt(e.target.value) || 0)} />
          </div>
          <div className="flex items-end pb-1">
            <button
              type="button"
              onClick={() => set('disponible', !form.disponible)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors w-full justify-center
                ${form.disponible
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                }`}
            >
              {form.disponible
                ? <><ToggleRight className="w-5 h-5" /> Disponible</>
                : <><ToggleLeft className="w-5 h-5" /> Indisponible</>
              }
            </button>
          </div>
        </div>

        {/* ── 📋 Conditions ── */}
        <div className="border-t border-gray-100 pt-5">
          <SectionTitle>📋 Conditions</SectionTitle>
          <div className="space-y-4">
            <div>
              <label className="label">Description</label>
              <textarea className="input-field resize-none" rows={2}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Inclusions, options, remarques…" />
            </div>

            <div>
              <label className="label">Conditions d'annulation</label>
              <input className="input-field" value={form.conditionsAnnulation || ''}
                onChange={e => set('conditionsAnnulation', e.target.value)}
                placeholder="Ex : Annulation gratuite 48h avant départ" />
            </div>

            <div>
              <label className="label">Tags</label>
              <div className="space-y-2">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-50 text-navy-700 border border-navy-200 text-xs font-medium rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}
                          className="hover:text-red-500 transition-colors ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  className="input-field"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                  placeholder="Saisir un tag et appuyer sur Entrée…"
                />
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTag(t)}
                      className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-navy-50 hover:text-navy-700 rounded-full transition-colors border border-gray-200 hover:border-navy-200"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>
    </Modal>
    {showQuickSupplier && <QuickSupplierModal onAdd={handleAddSupplier} onClose={() => setShowQuickSupplier(false)} />}
    {showQuickHotel    && <QuickHotelModal    onAdd={handleAddHotel}    onClose={() => setShowQuickHotel(false)}    />}
    </>
  )
}

/* ─────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────── */

const ProductCard = ({ product, supplier, hotel, onEdit, onDelete, onToggle, isAdmin }) => {
  const marge = margeB(product)
  const taux  = tauxMarge(product)
  const color = TYPE_COLORS[product.type] ?? '#9ca3af'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Color bar */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                {product.type}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border
                ${product.disponible
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                {product.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.nom}</h3>
          </div>
          {/* Actions — admin only */}
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => onToggle(product)}
                title={product.disponible ? 'Désactiver' : 'Activer'}
                className="p-1.5 rounded hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-colors">
                {product.disponible ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              </button>
              <button onClick={() => onEdit(product)}
                className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(product)}
                className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Destination */}
        {product.destination && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{product.destination}</span>
          </div>
        )}

        {/* Prices */}
        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className="text-base font-bold text-navy-700">{formatCurrency(product.prixVente)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Prix vente</div>
          </div>
          {isAdmin && (
            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
              <div className="text-base font-bold text-gray-600">{formatCurrency(product.prixAchat)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Prix achat</div>
            </div>
          )}
        </div>

        {/* Margin — admin only */}
        {isAdmin && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Marge brute</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(marge)}
              </span>
              <span className={`font-bold text-xs px-1.5 py-0.5 rounded-full
                ${taux >= 30 ? 'bg-green-100 text-green-700'
                  : taux >= 20 ? 'bg-blue-100 text-blue-700'
                  : taux >= 10 ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
                }`}
              >
                {formatPercent(taux, 0)}
              </span>
            </div>
          </div>
          <ProgressBar
            value={Math.max(0, Math.min(taux, 100))}
            max={100}
            color={marginColor(taux)}
            size="xs"
          />
        </div>
        )}

        {/* Footer: stock + supplier */}
        <div className="border-t border-gray-50 pt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Places</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                product.placesDisponibles === 0 && product.disponible ? 'text-red-500'
                : product.placesDisponibles <= 2 && product.disponible ? 'text-amber-600'
                : 'text-green-600'
              }`}>
                {product.placesDisponibles} dispo
              </span>
              {product.placesReservees > 0 && (
                <span className="text-blue-500 font-medium">{product.placesReservees} rés.</span>
              )}
              <span className="text-gray-300">/ {product.stock}</span>
            </div>
          </div>
          {product.stock > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${product.placesDisponibles === 0 ? 'bg-red-400' : 'bg-blue-400'}`}
                style={{ width: `${Math.min(100, (product.placesReservees / product.stock) * 100)}%` }}
              />
            </div>
          )}
          {supplier && <span className="text-xs text-gray-400 truncate block">🏢 {supplier.nom}</span>}
          {(hotel || product.categorieHotel) && (
            <span className="text-xs text-blue-400 truncate block">
              🏨 {hotel ? `${hotel.nom} · ${hotel.categorie}` : product.categorieHotel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   TABLE VIEW
───────────────────────────────────────── */

const ProductTable = ({ rows, suppliers, sortCol, sortDir, onSort, onEdit, onDelete, onToggle, isAdmin }) => {
  const allCols = [
    { key: 'nom',        label: 'Produit',      adminOnly: false },
    { key: 'type',       label: 'Type',         adminOnly: false },
    { key: 'destination',label: 'Destination',  adminOnly: false },
    { key: 'prixVente',  label: 'Prix vente',   align: 'right', adminOnly: false },
    { key: 'prixAchat',  label: 'Prix achat',   align: 'right', adminOnly: true },
    { key: 'marge',      label: 'Marge',        align: 'right', adminOnly: true },
    { key: 'taux',       label: 'Taux',         align: 'right', adminOnly: true },
    { key: 'stock',      label: 'Stock',        align: 'right', adminOnly: false },
    { key: 'disponible', label: 'Statut',       adminOnly: false },
    { key: 'actions',    label: '',             adminOnly: true },
  ]
  const cols = allCols.filter(c => !c.adminOnly || isAdmin)

  if (!rows.length) {
    return (
      <div className="py-16 flex flex-col items-center text-gray-400">
        <Package className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">Aucun produit trouvé</p>
      </div>
    )
  }

  const supMap = Object.fromEntries(suppliers.map(s => [s.id, s.nom]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {cols.map(c => (
              <th
                key={c.key}
                onClick={c.key !== 'actions' ? () => onSort(c.key) : undefined}
                className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
                  ${c.align === 'right' ? 'text-right' : 'text-left'}
                  ${c.key !== 'actions' ? 'cursor-pointer hover:text-gray-700 select-none' : ''}
                `}
              >
                <span className="inline-flex items-center">
                  {c.label}
                  {c.key !== 'actions' && <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(p => {
            const marge = margeB(p)
            const taux  = tauxMarge(p)
            const color = TYPE_COLORS[p.type] ?? '#9ca3af'
            return (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div>
                      <div className="font-medium text-gray-800">{p.nom}</div>
                      {p.description && (
                        <div className="text-xs text-gray-400 truncate max-w-48">{p.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.destination || '—'}</td>
                <td className="px-4 py-3 text-right font-semibold text-navy-700">
                  {formatCurrency(p.prixVente)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right text-gray-500">
                    {formatCurrency(p.prixAchat)}
                  </td>
                )}
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(marge)}
                    </span>
                  </td>
                )}
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                        ${taux >= 30 ? 'bg-green-100 text-green-700'
                          : taux >= 20 ? 'bg-blue-100 text-blue-700'
                          : taux >= 10 ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {formatPercent(taux, 0)}
                      </span>
                      <div className="w-16">
                        <ProgressBar value={Math.max(0, Math.min(taux, 100))} max={100}
                          color={marginColor(taux)} size="xs" />
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`font-semibold ${
                      p.placesDisponibles === 0 && p.disponible ? 'text-red-500'
                      : p.placesDisponibles <= 2 && p.disponible ? 'text-amber-600'
                      : 'text-gray-600'
                    }`}>
                      {p.placesDisponibles}/{p.stock}
                    </span>
                    {p.placesReservees > 0 && (
                      <span className="text-xs text-blue-500">{p.placesReservees} rés.</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border
                    ${p.disponible
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    {p.disponible ? 'Disponible' : 'Indispo.'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onToggle(p)} title="Basculer disponibilité"
                        className="p-1.5 rounded hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-colors">
                        {p.disponible ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => onEdit(p)}
                        className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(p)}
                        className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        {/* Footer totals */}
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
            <td colSpan={3} className="px-4 py-2.5 text-xs text-gray-500">
              {rows.length} produit(s)
            </td>
            <td className="px-4 py-2.5 text-right text-sm text-navy-700">
              {formatCurrency(sumBy(rows, 'prixVente'))}
            </td>
            {isAdmin && (
              <td className="px-4 py-2.5 text-right text-sm text-gray-600">
                {formatCurrency(sumBy(rows, 'prixAchat'))}
              </td>
            )}
            {isAdmin && (
              <td className="px-4 py-2.5 text-right text-sm text-green-600">
                {formatCurrency(rows.reduce((s, p) => s + margeB(p), 0))}
              </td>
            )}
            <td colSpan={isAdmin ? 4 : 3} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────
   MARGIN CHART
───────────────────────────────────────── */

const MarginChart = ({ products }) => {
  const data = useMemo(() => {
    const byType = {}
    products.forEach(p => {
      if (!byType[p.type]) byType[p.type] = { marges: [], type: p.type }
      byType[p.type].marges.push(tauxMarge(p))
    })
    return Object.values(byType)
      .map(({ type, marges }) => ({
        type,
        taux: Math.round(marges.reduce((a, b) => a + b, 0) / marges.length * 10) / 10,
        count: marges.length,
        color: TYPE_COLORS[type] ?? '#9ca3af',
      }))
      .sort((a, b) => b.taux - a.taux)
  }, [products])

  if (data.length === 0) return null

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-800">{d.type}</p>
        <p className="text-gray-600">Taux marge moyen : <span className="font-bold text-navy-700">{d.taux}%</span></p>
        <p className="text-gray-500">{d.count} produit(s)</p>
      </div>
    )
  }

  return (
    <Card>
      <Card.Header
        title="Marge par type de produit"
        subtitle="Taux de marge moyen (%) par catégorie"
        action={<BarChart2 className="w-5 h-5 text-gray-400" />}
      />
      <Card.Body>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="taux" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

export const ProduitsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [products,   setProducts]  = useLocalStorage(STORAGE_KEYS.products,  [])
  const [suppliers,  setSuppliers] = useLocalStorage(STORAGE_KEYS.suppliers, [])
  const [hotels,     setHotels]    = useLocalStorage(STORAGE_KEYS.hotels,    [])
  const [reservations]             = useLocalStorage(STORAGE_KEYS.reservations, [])
  const toast = useToast()

  /* ── places réservées par produit (hors annulées) ── */
  const reservedMap = useMemo(() => {
    const map = {}
    reservations
      .filter(r => r.produitId && r.statut !== 'Annulée')
      .forEach(r => { map[r.produitId] = (map[r.produitId] || 0) + 1 })
    return map
  }, [reservations])

  /* ── view / filters ── */
  const [view,     setView]    = useState('cards')   // 'cards' | 'table'
  const [search,   setSearch]  = useState('')
  const [typeF,    setTypeF]   = useState('')
  const [dispoF,   setDispoF]  = useState('')        // '' | 'true' | 'false'
  const [sortCol,  setSortCol] = useState('nom')
  const [sortDir,  setSortDir] = useState('asc')

  /* ── modals ── */
  const [formOpen,     setFormOpen]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  /* ── sort ── */
  const handleSort = useCallback((col) => {
    setSortCol(prev => {
      if (prev === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
      else setSortDir('asc')
      return col
    })
  }, [])

  /* ── filtered list (with computed fields for sort) ── */
  const enriched = useMemo(() =>
    products.map(p => {
      const reservees    = reservedMap[p.id] || 0
      const disponibles  = Math.max(0, (p.stock || 0) - reservees)
      return { ...p, marge: margeB(p), taux: tauxMarge(p), placesReservees: reservees, placesDisponibles: disponibles }
    }),
    [products, reservedMap]
  )

  const filtered = useMemo(() => {
    let list = enriched
    if (search) list = list.filter(p =>
      fuzzyMatch(p.nom, search) || fuzzyMatch(p.destination, search))
    if (typeF)  list = list.filter(p => p.type === typeF)
    if (dispoF !== '') list = list.filter(p =>
      String(p.disponible) === dispoF)
    return sortByKey(list, sortCol, sortDir)
  }, [enriched, search, typeF, dispoF, sortCol, sortDir])

  /* ── KPI ── */
  const kpi = useMemo(() => {
    const available  = products.filter(p => p.disponible)
    const avgTaux    = products.length
      ? products.reduce((s, p) => s + tauxMarge(p), 0) / products.length
      : 0
    const catalogueV = products.reduce((s, p) =>
      s + (parseFloat(p.prixVente) || 0) * (parseFloat(p.stock) || 0), 0)
    return { available, avgTaux, catalogueV }
  }, [products])

  /* ── CRUD ── */
  const handleSave = (form) => {
    const bannedError = getBannedCountryError(form.destination)
    if (bannedError) {
      toast.error(bannedError)
      return
    }
    if (editTarget?.id) {
      setProducts(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...form } : p))
      toast.success('Produit mis à jour')
    } else {
      const newP = { ...form, id: `prod-${Date.now()}` }
      setProducts(prev => [...prev, newP])
      toast.success(`Produit "${newP.nom}" créé`)
    }
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
    toast.success('Produit supprimé')
    setDeleteTarget(null)
  }

  const handleToggle = (product) => {
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, disponible: !p.disponible } : p
    ))
    toast.info(`${product.nom} — ${product.disponible ? 'désactivé' : 'activé'}`)
  }

  const openNew  = () => { setEditTarget(null); setFormOpen(true) }

  useEffect(() => {
    if (location.state?.openCreate && isAdmin) {
      openNew()
      navigate('/produits', { replace: true, state: {} })
    }
  }, [location.state?.openCreate, isAdmin])
  const openEdit = (p) => { setEditTarget(p); setFormOpen(true) }

  const clearFilters = () => { setSearch(''); setTypeF(''); setDispoF('') }
  const hasFilters = search || typeF || dispoF !== ''

  /* ── supplier / hotel maps ── */
  const supMap    = useMemo(() => Object.fromEntries(suppliers.map(s => [s.id, s])), [suppliers])
  const hotelsMap = useMemo(() => Object.fromEntries(hotels.map(h => [h.id, h])),   [hotels])

  const handleAddSupplier = useCallback((s) => {
    setSuppliers(prev => [...prev, s])
    toast.success(`Fournisseur "${s.nom}" ajouté`)
  }, [setSuppliers, toast])

  const handleAddHotel = useCallback((h) => {
    setHotels(prev => [...prev, h])
    toast.success(`Hôtel "${h.nom}" ajouté`)
  }, [setHotels, toast])

  /* ── CSV export ── */
  const exportCSV = () => {
    const headers = ['Nom', 'Type', 'Destination', 'Prix vente', 'Prix achat', 'Marge brute', 'Taux marge %', 'Stock', 'Disponible']
    const rows = filtered.map(p => [
      p.nom, p.type, p.destination,
      p.prixVente, p.prixAchat,
      margeB(p).toFixed(0),
      tauxMarge(p).toFixed(1),
      p.stock,
      p.disponible ? 'Oui' : 'Non',
    ])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `produits-${todayISO()}.csv`
    a.click()
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Produits & Tarifs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez votre catalogue et analysez vos marges</p>
        </div>
        {isAdmin && <Button icon={Plus} onClick={openNew}>Nouveau produit</Button>}
      </div>

      {/* ── KPI strip ── */}
      <div className={`grid gap-4 ${isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-50">
            <Package className="w-5 h-5 text-navy-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-navy-800">{products.length}</div>
            <div className="text-xs text-gray-500">Total produits</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{kpi.available.length}</div>
            <div className="text-xs text-gray-500">Disponibles</div>
            <div className="text-xs text-gray-400">{products.length - kpi.available.length} indisponible(s)</div>
          </div>
        </Card>
        {isAdmin && (
          <Card className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className={`text-xl font-bold ${kpi.avgTaux >= 20 ? 'text-green-600' : kpi.avgTaux >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                {formatPercent(kpi.avgTaux, 0)}
              </div>
              <div className="text-xs text-gray-500">Marge moyenne</div>
            </div>
          </Card>
        )}
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <Tag className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-amber-700">{formatCurrency(kpi.catalogueV)}</div>
            <div className="text-xs text-gray-500">Valeur catalogue</div>
            <div className="text-xs text-gray-400">prix × stock</div>
          </div>
        </Card>
      </div>

      {/* ── Margin chart — admin only ── */}
      {isAdmin && <MarginChart products={products} />}

      {/* ── Toolbar ── */}
      <Card noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          {/* search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Rechercher (nom, destination)…"
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

          {/* type */}
          <select className="input-field py-2 text-sm min-w-36" value={typeF}
            onChange={e => setTypeF(e.target.value)}>
            <option value="">Tous les types</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* dispo */}
          <select className="input-field py-2 text-sm min-w-36" value={dispoF}
            onChange={e => setDispoF(e.target.value)}>
            <option value="">Toutes disponibilités</option>
            <option value="true">Disponibles</option>
            <option value="false">Indisponibles</option>
          </select>

          {hasFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
              Réinitialiser
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">{filtered.length} produit(s)</span>
            <Button variant="secondary" size="sm" icon={Download} onClick={exportCSV}>CSV</Button>
            {/* view toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView('cards')}
                className={`p-2 transition-colors ${view === 'cards' ? 'bg-navy-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-2 transition-colors ${view === 'table' ? 'bg-navy-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── content ── */}
        {view === 'cards' ? (
          <div className="p-4">
            {filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-gray-400">
                <Package className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    supplier={supMap[p.fournisseurId]}
                    hotel={hotelsMap[p.hotelId]}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    onToggle={handleToggle}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <ProductTable
            rows={filtered}
            suppliers={suppliers}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onToggle={handleToggle}
            isAdmin={isAdmin}
          />
        )}
      </Card>

      {/* ── modals ── */}
      {formOpen && (
        <ProductForm
          initial={editTarget}
          suppliers={suppliers}
          hotels={hotels}
          onAddSupplier={handleAddSupplier}
          onAddHotel={handleAddHotel}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Supprimer "${deleteTarget.nom}" ?`}
          message="Cette action est irréversible."
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
