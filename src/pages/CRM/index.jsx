import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import {
  Plus, Search, Edit2, Trash2, User, Phone, Mail, MapPin,
  LayoutGrid, List, Download, X, ArrowLeft, CalendarDays,
  Banknote, TrendingUp, Star, Clock, Plane, Link2,
  Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS } from '../../utils/sampleData'
import {
  formatCurrency, formatDate, formatPhone, todayISO,
  fuzzyMatch, sortByKey, sumBy, daysUntil,
} from '../../utils/formatters'
import {
  Button, Card, KpiCard, Modal, ConfirmModal,
  Badge, StatusBadge, tagBadge, Avatar, DocumentSection,
} from '../../components/UI'
import { validateClientForm, CLIENT_TAGS, CLIENT_VILLES, EMPTY_CLIENT, CLIENT_FIELD_LABELS, normalizeClient, ClientFormFields } from '../../components/QuickCreate'

/* ─── constants ─── */
const TAGS   = CLIENT_TAGS
const VILLES = CLIENT_VILLES

/* ─── client stats helper ─── */
const clientStats = (client, reservations, currency) => {
  const resas   = reservations.filter(r => r.clientId === client.id || r.clientNom === client.nom)
  const active  = resas.filter(r => r.statut !== 'Annulée')
  const ca      = sumBy(active, 'montant')
  const encaisse= sumBy(active, 'acompte')
  const solde   = Math.max(0, ca - encaisse)
  const last    = [...resas].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))[0]
  return { resas, active, ca, encaisse, solde, last }
}

/* ════════════════════════════════════════════════
   CLIENT FORM MODAL
════════════════════════════════════════════════ */
const ClientForm = ({ form, setForm, onSave, onClose, isEdit }) => {
  const [errors, setErrors] = useState({})

  const handleSave = () => {
    const nextErrors = validateClientForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave()
  }

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? 'Modifier le client' : 'Nouveau client'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>{isEdit ? 'Enregistrer' : 'Créer le client'}</Button>
        </>
      }
    >
      <ClientFormFields form={form} setForm={setForm} errors={errors} />
    </Modal>
  )
}

/* ════════════════════════════════════════════════
   CLIENT CARD (grid view)
════════════════════════════════════════════════ */
const ClientCard = ({ client, reservations, currency, onView, onEdit, onDelete }) => {
  const { resas, ca, last } = clientStats(client, reservations, currency)
  return (
    <div
      className="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onView(client)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={client.nom} />
          <div className="min-w-0">
            <p className="font-semibold text-navy text-sm leading-tight truncate">{client.nom}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{client.ville || '—'}
            </p>
          </div>
        </div>
        <Badge variant={tagBadge(client.tag)}>{client.tag}</Badge>
      </div>

      {/* Contact */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span>{formatPhone(client.telephone)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span className="truncate">{client.email || '—'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-slate-100 text-center">
        <div>
          <p className="text-sm font-bold text-navy">{resas.length}</p>
          <p className="text-xs text-slate-400">Voyages</p>
        </div>
        <div>
          <p className="text-sm font-bold text-navy truncate">{formatCurrency(ca, currency)}</p>
          <p className="text-xs text-slate-400">CA total</p>
        </div>
        <div>
          <p className="text-sm font-bold text-navy">{last ? formatDate(last.depart) : '—'}</p>
          <p className="text-xs text-slate-400">Dernier</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm" variant="secondary" icon={Edit2}
          className="flex-1 justify-center"
          onClick={e => { e.stopPropagation(); onEdit(client) }}
        >
          Modifier
        </Button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(client) }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   CLIENT PROFILE PAGE
════════════════════════════════════════════════ */
const ClientProfile = ({ client, reservations, finances, clientDocs, onAddDoc, onDeleteDoc, currency, onBack, onEdit, onDelete }) => {
  const { resas, ca, solde, last } = clientStats(client, reservations, currency)
  const sorted = [...resas].sort((a, b) => new Date(b.depart) - new Date(a.depart))

  const payments = finances.filter(f =>
    f.clientId === client.id ||
    resas.some(r => r.id === f.reservationId)
  ).sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>
          Retour à la liste
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Edit2} onClick={() => onEdit(client)}>Modifier</Button>
          <Button variant="danger"    icon={Trash2} onClick={() => onDelete(client)}>Supprimer</Button>
        </div>
      </div>

      {/* Hero card */}
      <Card>
        <Card.Body>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={client.nom} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-navy">
                  {[client.civilite, client.nom].filter(Boolean).join(' ')}
                </h2>
                <Badge variant={tagBadge(client.tag)} dot>{client.tag}</Badge>
                {client.nationalite && (
                  <Badge variant="gray">{client.nationalite}</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-sm text-slate-500">
                {client.telephone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {formatPhone(client.telephone)}
                  </span>
                )}
                {client.telephoneSecondaire && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {formatPhone(client.telephoneSecondaire)} <span className="text-xs text-slate-400">(WhatsApp)</span>
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {client.email}
                  </span>
                )}
                {client.ville && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {client.ville}
                  </span>
                )}
              </div>
              {client.adresse && (
                <p className="text-xs text-slate-400 mt-1.5">{client.adresse}</p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-slate-400">Client depuis</p>
              <p className="text-sm font-medium text-slate-700">{formatDate(client.dateCreation)}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={Plane}      label="Total voyages"  value={resas.length}                  iconColor="bg-primary-50 text-primary-600" />
        <KpiCard icon={TrendingUp} label="CA total"       value={formatCurrency(ca, currency)}   iconColor="bg-green-50 text-green-600" />
        <KpiCard icon={Banknote}   label="Solde en cours" value={formatCurrency(solde, currency)} iconColor="bg-amber-50 text-amber-600" />
        <KpiCard
          icon={Clock}
          label="Dernier voyage"
          value={last ? formatDate(last.depart) : '—'}
          sub={last?.destination?.split(',')[0] || ''}
          iconColor="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Info panels */}
      <div className="grid xl:grid-cols-3 gap-5">

        <Card>
          <Card.Header title="Identité & contact" />
          <Card.Body className="space-y-3 text-sm">
            {[
              ['Civilité', client.civilite],
              ['Nationalité', client.nationalite],
              ['Langue', client.langue],
              ['Date de naissance', formatDate(client.dateNaissance)],
              ['Profession', client.profession],
              ['Entreprise', client.entreprise],
              ['Adresse', client.adresse],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-400 flex-shrink-0">{label}</span>
                <span className="text-slate-700 text-right">{val || '—'}</span>
              </div>
            ))}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header title="Document de voyage" />
          <Card.Body className="space-y-3 text-sm">
            {[
              ['Type', client.typeDocument],
              ['N° document', client.cin],
              ['Expiration', formatDate(client.dateExpirationDocument)],
              ['Pays émission', client.paysEmission],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-400 flex-shrink-0">{label}</span>
                <span className="text-slate-700 text-right">{val || '—'}</span>
              </div>
            ))}
            {client.dateExpirationDocument && (() => {
              const days = daysUntil(client.dateExpirationDocument)
              if (days == null) return null
              if (days < 0) {
                return (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Document expiré
                  </div>
                )
              }
              if (days <= 180) {
                return (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Expire dans {days} jour{days > 1 ? 's' : ''} — renouveler avant départ
                  </div>
                )
              }
              return null
            })()}
            {(client.contactUrgenceNom || client.contactUrgenceTel) && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contact urgence</p>
                <p className="text-slate-700">{client.contactUrgenceNom || '—'}</p>
                {client.contactUrgenceTel && (
                  <p className="text-slate-500 text-xs mt-0.5">{formatPhone(client.contactUrgenceTel)}</p>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header title="Profil commercial" />
          <Card.Body className="space-y-3 text-sm">
            {[
              ['Source', client.source],
              ['Voyage préféré', client.typeVoyagePref],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-400 flex-shrink-0">{label}</span>
                <span className="text-slate-700 text-right">{val || '—'}</span>
              </div>
            ))}
            {client.preferencesVoyage && (
              <div className="p-3 bg-primary-50/50 rounded-lg border border-primary-100">
                <p className="text-xs text-primary-600 mb-1 font-medium uppercase tracking-wide">Préférences</p>
                <p className="text-slate-600">{client.preferencesVoyage}</p>
              </div>
            )}
            {client.notes && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Notes</p>
                <p className="text-slate-600">{client.notes}</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      <Card>
          <Card.Header
            title="Historique des réservations"
            subtitle={`${resas.length} au total`}
          />
          {sorted.length === 0 ? (
            <Card.Body>
              <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
                <CalendarDays className="w-8 h-8 opacity-30" />
                <p className="text-sm">Aucune réservation enregistrée</p>
              </div>
            </Card.Body>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Réf</th>
                    <th className="table-th">Destination</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Départ</th>
                    <th className="table-th text-right">Montant</th>
                    <th className="table-th">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-td font-mono text-xs text-primary-600">{r.ref}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-1.5">
                          <Plane className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-slate-700">{r.destination.split(',')[0]}</span>
                        </div>
                      </td>
                      <td className="table-td"><Badge variant="info">{r.type}</Badge></td>
                      <td className="table-td text-slate-500 whitespace-nowrap">{formatDate(r.depart)}</td>
                      <td className="table-td text-right font-semibold text-slate-800 whitespace-nowrap">
                        {formatCurrency(r.montant, currency)}
                      </td>
                      <td className="table-td"><StatusBadge statut={r.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      {/* Payments */}
      <Card>
        <Card.Header
          title="Paiements enregistrés"
          subtitle={`${payments.length} transaction(s) liée(s)`}
        />
        {payments.length === 0 ? (
          <Card.Body>
            <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
              <Banknote className="w-8 h-8 opacity-30" />
              <p className="text-sm">Aucun paiement enregistré</p>
            </div>
          </Card.Body>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Libellé</th>
                  <th className="table-th">Réservation</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td text-slate-500 whitespace-nowrap">{formatDate(p.date)}</td>
                    <td className="table-td text-slate-700">{p.libelle}</td>
                    <td className="table-td">
                      {p.reservationRef
                        ? <span className="font-mono text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{p.reservationRef}</span>
                        : <span className="text-slate-400">—</span>
                      }
                    </td>
                    <td className="table-td"><StatusBadge statut={p.statut} /></td>
                    <td className="table-td text-right">
                      <span className={`font-bold whitespace-nowrap ${p.type === 'Encaissement' ? 'text-green-600' : 'text-red-600'}`}>
                        {p.type === 'Encaissement' ? '+' : '−'}{formatCurrency(p.montant, currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-sm">
                  <td colSpan={4} className="table-td text-slate-500">{payments.length} transaction(s)</td>
                  <td className="table-td text-right text-green-600">
                    +{formatCurrency(payments.filter(p => p.type === 'Encaissement').reduce((s, p) => s + (parseFloat(p.montant) || 0), 0), currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Documents */}
      <DocumentSection
        docs={clientDocs}
        onAdd={onAddDoc}
        onDelete={onDeleteDoc}
        clientId={client.id}
        clientNom={client.nom}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════
   IMPORT EXCEL MODAL
════════════════════════════════════════════════ */
const CLIENT_FIELDS = CLIENT_FIELD_LABELS

const autoDetect = (header) => {
  const h = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/\b(nom|name|client|prenom|fullname)\b/.test(h)) return 'nom'
  if (/civilite|title|genre/.test(h))                         return 'civilite'
  if (/tel|phone|mobile|portable/.test(h) && !/urgence|second|whatsapp/.test(h)) return 'telephone'
  if (/whatsapp|second|tel2/.test(h))                          return 'telephoneSecondaire'
  if (/email|mail|courriel/.test(h))                            return 'email'
  if (/ville|city|localite/.test(h))                            return 'ville'
  if (/nationalite|nationality|pays.*(?!emission)/.test(h))   return 'nationalite'
  if (/langue|language/.test(h))                                return 'langue'
  if (/type.*doc|document/.test(h))                             return 'typeDocument'
  if (/\b(cin|id)\b|identite|passeport|passport|numero/.test(h)) return 'cin'
  if (/expir|validite|validity/.test(h))                        return 'dateExpirationDocument'
  if (/emission|issued/.test(h))                                return 'paysEmission'
  if (/adresse|address|domicile/.test(h))                       return 'adresse'
  if (/naissance|birthday|birth|dob|nee/.test(h))               return 'dateNaissance'
  if (/urgence.*nom|emergency.*name/.test(h))                   return 'contactUrgenceNom'
  if (/urgence|emergency/.test(h))                              return 'contactUrgenceTel'
  if (/profession|metier|job/.test(h))                          return 'profession'
  if (/entreprise|societe|company/.test(h))                     return 'entreprise'
  if (/source|provenance|canal/.test(h))                        return 'source'
  if (/type.*voyage|travel.*type|pref.*voyage/.test(h))         return 'typeVoyagePref'
  if (/preference|destinations/.test(h))                        return 'preferencesVoyage'
  if (/notes|remarques|comment/.test(h))                        return 'notes'
  if (/tag|profil|categorie/.test(h))                           return 'tag'
  return ''
}

const ImportClientsModal = ({ existingClients, onImport, onClose }) => {
  const fileRef    = useRef(null)
  const [step,     setStep]     = useState('upload') // 'upload' | 'map'
  const [fileName, setFileName] = useState('')
  const [headers,  setHeaders]  = useState([])
  const [rows,     setRows]     = useState([])       // raw rows: string[][]
  const [mapping,  setMapping]  = useState({})       // { fieldName: colHeader }
  const [dupMode,  setDupMode]  = useState('skip')   // 'skip' | 'update'
  const [dragging, setDragging] = useState(false)
  const [parseErr, setParseErr] = useState('')

  const parseFile = async (file) => {
    setParseErr('')
    try {
      const isCSV = file.name.toLowerCase().endsWith('.csv')
      let wb
      if (isCSV) {
        const text = await file.text()
        wb = XLSX.read(text, { type: 'string' })
      } else {
        const buf = await file.arrayBuffer()
        wb = XLSX.read(new Uint8Array(buf), { type: 'array' })
      }
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (!json.length || !json[0].length) { setParseErr('Fichier vide ou non reconnu.'); return }

      const hdrs     = json[0].map(h => String(h).trim()).filter(Boolean)
      const dataRows = json.slice(1).filter(r => r.some(c => c !== ''))

      setFileName(file.name)
      setHeaders(hdrs)
      setRows(dataRows)

      const auto = {}
      hdrs.forEach(h => {
        const f = autoDetect(h)
        if (f && !Object.values(auto).includes(h)) auto[f] = h
      })
      setMapping(auto)
      setStep('map')
    } catch (e) {
      setParseErr('Impossible de lire ce fichier. Vérifiez le format.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const getCellValue = useCallback((row, colHeader) => {
    const idx = headers.indexOf(colHeader)
    return idx >= 0 ? String(row[idx] ?? '').trim() : ''
  }, [headers])

  const rowToClient = useCallback((row) => {
    const parsed = {}
    Object.keys(CLIENT_FIELDS).forEach(k => {
      parsed[k] = getCellValue(row, mapping[k] || '')
    })
    if (!parsed.tag) parsed.tag = 'Nouveau'
    return parsed
  }, [getCellValue, mapping])

  const isDup = useCallback((c) =>
    existingClients.some(e =>
      (c.cin && e.cin === c.cin) ||
      (c.telephone && e.telephone === c.telephone)
    ), [existingClients])

  const allParsed = useMemo(() => rows.map(rowToClient), [rows, rowToClient])
  const valid     = useMemo(() => allParsed.filter(c => c.nom), [allParsed])
  const dups      = useMemo(() => valid.filter(isDup), [valid, isDup])
  const toAdd     = useMemo(() => valid.filter(c => !isDup(c)), [valid, isDup])
  const preview   = valid.slice(0, 5)

  const handleImport = () => {
    const newClients = toAdd.map(c => ({
      ...normalizeClient(c),
      id: `cli-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dateCreation: todayISO(),
    }))
    const updatedClients = dupMode === 'update'
      ? dups.map(c => {
          const existing = existingClients.find(e =>
            (c.cin && e.cin === c.cin) || (c.telephone && e.telephone === c.telephone)
          )
          return existing ? { ...existing, ...c } : null
        }).filter(Boolean)
      : []
    onImport(newClients, updatedClients)
    onClose()
  }

  return (
    <Modal
      onClose={onClose}
      title="Importer des clients"
      size="lg"
      footer={step === 'map' ? (
        <>
          <Button variant="secondary" onClick={() => setStep('upload')}>Retour</Button>
          <Button
            icon={CheckCircle2}
            onClick={handleImport}
            disabled={valid.length === 0}
          >
            Importer {toAdd.length + (dupMode === 'update' ? dups.length : 0)} client(s)
          </Button>
        </>
      ) : (
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
      )}
    >
      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${dragging ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-700">Glissez votre fichier ici</p>
            <p className="text-xs text-slate-400 mt-1">ou cliquez pour sélectionner</p>
            <p className="text-xs text-slate-300 mt-3">Formats acceptés : .xlsx · .xls · .csv</p>
            <input ref={fileRef} type="file" className="hidden"
              accept=".xlsx,.xls,.csv" onChange={handleFileInput} />
          </div>
          {parseErr && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {parseErr}
            </div>
          )}
          <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500 space-y-1.5">
            <p className="font-medium text-slate-600">Format attendu :</p>
            <p>• La <strong>première ligne</strong> doit contenir les en-têtes de colonnes</p>
            <p>• Colonnes reconnues : Nom, Civilité, Téléphone, WhatsApp, Email, Nationalité, Passeport, Expiration, Source, Préférences…</p>
            <p>• Les colonnes non reconnues pourront être mappées manuellement</p>
          </div>
        </div>
      )}

      {/* ── Step 2: Mapping + Preview ── */}
      {step === 'map' && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 text-sm">
            <FileSpreadsheet className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-700">{fileName}</p>
              <p className="text-xs text-slate-400">{rows.length} ligne(s) détectée(s)</p>
            </div>
            <button onClick={() => setStep('upload')} className="ml-auto text-xs text-primary-600 hover:underline">
              Changer
            </button>
          </div>

          {/* Column mapping */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Correspondance des colonnes
            </p>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="table-th text-left">Colonne Excel</th>
                    <th className="table-th text-left">
                      <span className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> Champ client
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map(h => (
                    <tr key={h} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="table-td font-mono text-xs text-slate-600">{h}</td>
                      <td className="table-td">
                        <select
                          className="input-field text-xs py-1"
                          style={{ height: '30px' }}
                          value={Object.entries(mapping).find(([, v]) => v === h)?.[0] || ''}
                          onChange={e => {
                            const field = e.target.value
                            setMapping(prev => {
                              const next = { ...prev }
                              Object.keys(next).forEach(k => { if (next[k] === h) delete next[k] })
                              if (field) next[field] = h
                              return next
                            })
                          }}
                        >
                          <option value="">— Ignorer —</option>
                          {Object.entries(CLIENT_FIELDS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Aperçu ({preview.length} premières lignes)
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['nom', 'telephone', 'email', 'ville', 'cin'].map(f => (
                        <th key={f} className="table-th text-left whitespace-nowrap">{CLIENT_FIELDS[f]}</th>
                      ))}
                      <th className="table-th text-left">Doublon ?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((c, i) => (
                      <tr key={i} className={`border-b border-slate-50 last:border-0 ${isDup(c) ? 'bg-amber-50' : ''}`}>
                        <td className="table-td font-medium text-slate-700">{c.nom || '—'}</td>
                        <td className="table-td text-slate-500">{c.telephone || '—'}</td>
                        <td className="table-td text-slate-500 max-w-[140px] truncate">{c.email || '—'}</td>
                        <td className="table-td text-slate-500">{c.ville || '—'}</td>
                        <td className="table-td font-mono text-slate-500">{c.cin || '—'}</td>
                        <td className="table-td">
                          {isDup(c)
                            ? <span className="text-xs text-amber-600 font-medium">⚠ Oui</span>
                            : <span className="text-xs text-green-600">✓ Non</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary + duplicate mode */}
          <div className="bg-slate-50 rounded-lg px-4 py-3 space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-slate-600">
                <span className="font-semibold text-navy">{valid.length}</span> lignes valides
              </span>
              <span className="text-green-600">
                <span className="font-semibold">{toAdd.length}</span> nouveaux clients
              </span>
              {dups.length > 0 && (
                <span className="text-amber-600">
                  <span className="font-semibold">{dups.length}</span> doublon(s) détecté(s)
                </span>
              )}
            </div>
            {dups.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-600">Gestion des doublons :</p>
                {[['skip', 'Ignorer les doublons (ne pas importer)'], ['update', 'Mettre à jour les doublons existants']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="dupMode" value={val}
                      checked={dupMode === val} onChange={() => setDupMode(val)}
                      className="accent-primary-600" />
                    <span className="text-xs text-slate-600">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ════════════════════════════════════════════════
   CRM PAGE
════════════════════════════════════════════════ */
export const CRMPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [clients,      setClients]     = useLocalStorage(STORAGE_KEYS.clients, [])
  const [reservations]                 = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [finances]                     = useLocalStorage(STORAGE_KEYS.finances, [])
  const [documents,    setDocuments]   = useLocalStorage(STORAGE_KEYS.documents, [])
  const [settings]                     = useLocalStorage(STORAGE_KEYS.settings, {})
  const { toast } = useToast()

  const currency = settings?.devise || 'MAD'

  /* ── ui state ── */
  const [profile,     setProfile]     = useState(null)   // selected client for profile view
  const [search,      setSearch]      = useState('')
  const [filterTag,   setFilterTag]   = useState('')
  const [filterVille, setFilterVille] = useState('')
  const [viewMode,    setViewMode]    = useState('cards') // 'cards' | 'table'
  const [sortKey,     setSortKey]     = useState('nom')
  const [sortDir,     setSortDir]     = useState('asc')
  const [showForm,    setShowForm]    = useState(false)
  const [showImport,  setShowImport]  = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [deleting,    setDeleting]    = useState(null)
  const [form,        setForm]        = useState({ ...EMPTY_CLIENT })

  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    const list = clients.filter(c => {
      if (search && !fuzzyMatch(`${c.nom} ${c.email} ${c.telephone} ${c.ville}`, search)) return false
      if (filterTag   && c.tag   !== filterTag)   return false
      if (filterVille && c.ville !== filterVille) return false
      return true
    })
    return sortByKey(list, sortKey, sortDir)
  }, [clients, search, filterTag, filterVille, sortKey, sortDir])

  /* ── unique villes from data ── */
  const villesInData = useMemo(() => {
    const s = new Set(clients.map(c => c.ville).filter(Boolean))
    return [...s].sort()
  }, [clients])

  /* ── stats ── */
  const tagCounts = useMemo(() =>
    TAGS.reduce((acc, t) => ({ ...acc, [t]: clients.filter(c => c.tag === t).length }), {}),
  [clients])

  /* ── CRUD ── */
  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_CLIENT })
    setShowForm(true)
  }

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreate()
      navigate('/crm', { replace: true, state: {} })
    }
  }, [location.state?.openCreate])

  const openEdit = (c) => {
    setEditing(c)
    setForm(normalizeClient(c))
    setShowForm(true)
    setProfile(null)
  }

  const handleSave = () => {
    if (!form.nom?.trim())       { toast.error('Le nom est requis.'); return }
    if (!form.telephone?.trim()) { toast.error('Le téléphone est requis.'); return }

    if (editing) {
      setClients(prev => prev.map(c => c.id === editing.id ? normalizeClient({ ...c, ...form }) : c))
      toast.success('Client mis à jour.')
    } else {
      setClients(prev => [normalizeClient({ ...form, id: `cli-${Date.now()}` }), ...prev])
      toast.success('Client ajouté.')
    }
    setShowForm(false)
  }

  const askDelete = (c) => {
    setDeleting(c)
    setShowConfirm(true)
    setProfile(null)
  }

  const handleDelete = () => {
    setClients(prev => prev.filter(c => c.id !== deleting.id))
    toast.success('Client supprimé.')
    setShowConfirm(false)
    setDeleting(null)
  }

  /* ── Excel import ── */
  const handleImportClients = (newClients, updatedClients) => {
    setClients(prev => {
      let list = [...prev]
      updatedClients.forEach(upd => {
        const idx = list.findIndex(c => c.id === upd.id)
        if (idx >= 0) list[idx] = upd
      })
      return [...newClients, ...list]
    })
    const msg = `${newClients.length} client(s) importé(s)${updatedClients.length > 0 ? `, ${updatedClients.length} mis à jour` : ''}.`
    toast.success(msg)
  }

  /* ── CSV export ── */
  const exportCSV = () => {
    const exportCols = ['nom', 'civilite', 'telephone', 'telephoneSecondaire', 'email', 'ville', 'nationalite', 'typeDocument', 'cin', 'dateExpirationDocument', 'source', 'typeVoyagePref', 'tag']
    const header = [...exportCols.map(k => CLIENT_FIELDS[k]), 'Voyages', 'CA Total'].join(',') + '\n'
    const rows = filtered.map(c => {
      const { resas, ca } = clientStats(c, reservations, currency)
      const vals = exportCols.map(k => `"${String(c[k] ?? '').replace(/"/g, '""')}"`)
      return [...vals, resas.length, ca].join(',')
    }).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `clients_${todayISO()}.csv`
    a.click()
    toast.success('Export CSV téléchargé.')
  }

  const hasFilters = search || filterTag || filterVille
  const clearFilters = () => { setSearch(''); setFilterTag(''); setFilterVille('') }

  /* ── if profile is open, show profile view ── */
  if (profile) {
    return (
      <>
        <ClientProfile
          client={profile}
          reservations={reservations}
          finances={finances}
          clientDocs={documents.filter(d => d.clientId === profile.id)}
          onAddDoc={doc => setDocuments(prev => [doc, ...prev])}
          onDeleteDoc={id => setDocuments(prev => prev.filter(d => d.id !== id))}
          currency={currency}
          onBack={() => setProfile(null)}
          onEdit={openEdit}
          onDelete={askDelete}
        />
        {showForm && (
          <ClientForm form={form} setForm={setForm} onSave={handleSave} onClose={() => setShowForm(false)} isEdit={!!editing} />
        )}
        {showConfirm && (
          <ConfirmModal
            onClose={() => setShowConfirm(false)} onConfirm={handleDelete}
            title="Supprimer le client"
            message={`Supprimer "${deleting?.nom}" définitivement ?`}
            confirmLabel="Supprimer"
            danger
          />
        )}
      </>
    )
  }

  /* ════════════════════════════════════════════════
     LIST VIEW
  ════════════════════════════════════════════════ */
  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Toolbar ── */}
      <Card>
        <Card.Body className="flex flex-wrap gap-3 items-center justify-between py-3">
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-9"
                placeholder="Nom, email, téléphone, ville…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="input-field w-auto text-sm" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
              <option value="">Tous les profils</option>
              {TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="input-field w-auto text-sm" value={filterVille} onChange={e => setFilterVille(e.target.value)}>
              <option value="">Toutes les villes</option>
              {villesInData.map(v => <option key={v}>{v}</option>)}
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Effacer</Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View toggle */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 ${viewMode === 'cards' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                title="Cartes"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                title="Tableau"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button variant="secondary" icon={Download} onClick={exportCSV}>CSV</Button>
            <Button variant="secondary" icon={FileSpreadsheet} onClick={() => setShowImport(true)}>Importer</Button>
            <Button icon={Plus} onClick={openCreate}>Nouveau client</Button>
          </div>
        </Card.Body>
      </Card>

      {/* ── Tag counts ── */}
      <div className="grid grid-cols-3 gap-4">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
            className={`card p-4 text-center transition-all hover:shadow-md ${filterTag === tag ? 'ring-2 ring-primary-500' : ''}`}
          >
            <p className="text-2xl font-bold text-navy mb-1">{tagCounts[tag] ?? 0}</p>
            <Badge variant={tagBadge(tag)} dot>{tag}</Badge>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="flex flex-col items-center py-12 text-slate-400 gap-3">
              <User className="w-12 h-12 opacity-30" />
              <p className="text-sm">{hasFilters ? 'Aucun client ne correspond aux filtres.' : 'Aucun client enregistré.'}</p>
              {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Effacer les filtres</Button>}
            </div>
          </Card.Body>
        </Card>
      ) : viewMode === 'cards' ? (
        /* CARD GRID */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <ClientCard
              key={c.id}
              client={c}
              reservations={reservations}
              currency={currency}
              onView={setProfile}
              onEdit={openEdit}
              onDelete={askDelete}
            />
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {[
                    ['nom', 'Client'], ['ville', 'Ville'], ['tag', 'Profil'],
                    ['telephone', 'Téléphone'], ['email', 'Email'],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className="table-th cursor-pointer select-none hover:bg-slate-100"
                      onClick={() => { setSortKey(key); setSortDir(d => sortKey === key && d === 'asc' ? 'desc' : 'asc') }}
                    >
                      {label}
                    </th>
                  ))}
                  <th className="table-th">Voyages</th>
                  <th className="table-th text-right">CA total</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const { resas, ca } = clientStats(c, reservations, currency)
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setProfile(c)}
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.nom} size="sm" />
                          <span className="font-medium text-slate-800">{c.nom}</span>
                        </div>
                      </td>
                      <td className="table-td text-slate-500">{c.ville || '—'}</td>
                      <td className="table-td"><Badge variant={tagBadge(c.tag)} dot>{c.tag}</Badge></td>
                      <td className="table-td text-slate-500">{formatPhone(c.telephone)}</td>
                      <td className="table-td text-slate-500 max-w-[180px] truncate">{c.email || '—'}</td>
                      <td className="table-td text-center font-medium text-slate-700">{resas.length}</td>
                      <td className="table-td text-right font-semibold text-slate-800 whitespace-nowrap">
                        {formatCurrency(ca, currency)}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(c) }}
                            className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          ><Edit2 className="w-4 h-4" /></button>
                          <button
                            onClick={e => { e.stopPropagation(); askDelete(c) }}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          ><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            {filtered.length} client(s)
          </div>
        </Card>
      )}

      {/* ── Modals ── */}
      {showForm && (
        <ClientForm form={form} setForm={setForm} onSave={handleSave} onClose={() => setShowForm(false)} isEdit={!!editing} />
      )}
      {showImport && (
        <ImportClientsModal
          existingClients={clients}
          onImport={handleImportClients}
          onClose={() => setShowImport(false)}
        />
      )}
      {showConfirm && (
        <ConfirmModal
          onClose={() => setShowConfirm(false)} onConfirm={handleDelete}
          title="Supprimer le client"
          message={`Supprimer "${deleting?.nom}" définitivement ? Ses réservations ne seront pas supprimées.`}
          confirmLabel="Supprimer"
          danger
        />
      )}
    </div>
  )
}
