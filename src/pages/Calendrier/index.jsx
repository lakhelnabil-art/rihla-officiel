import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Calendar, ChevronLeft, ChevronRight, Plus, X,
  Edit2, Trash2, List, LayoutGrid, Clock,
  Plane, RotateCcw, CreditCard, Users, Tag,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToast } from '../../hooks/useToast'
import { STORAGE_KEYS } from '../../utils/sampleData'
import { formatDateLong, todayISO } from '../../utils/formatters'
import { Button, Modal, ConfirmModal } from '../../components/UI'

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const EVENT_TYPES = ['Départ', 'Retour', 'Paiement', 'RDV', 'Tâche', 'Autre']

const TYPE_META = {
  Départ:   { color: 'blue',   bg: 'bg-blue-500',   light: 'bg-blue-50 text-blue-700 border-blue-200',   icon: Plane },
  Retour:   { color: 'green',  bg: 'bg-green-500',  light: 'bg-green-50 text-green-700 border-green-200', icon: RotateCcw },
  Paiement: { color: 'orange', bg: 'bg-orange-500', light: 'bg-orange-50 text-orange-700 border-orange-200', icon: CreditCard },
  RDV:      { color: 'purple', bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200', icon: Users },
  Tâche:    { color: 'gray',   bg: 'bg-gray-500',   light: 'bg-gray-50 text-gray-700 border-gray-200',   icon: Tag },
  Autre:    { color: 'red',    bg: 'bg-red-500',    light: 'bg-red-50 text-red-700 border-red-200',     icon: Tag },
}

const COLOR_TO_TYPE = {
  blue: 'Départ', green: 'Retour', orange: 'Paiement',
  purple: 'RDV', gray: 'Tâche', red: 'Autre',
}

const DOT_COLORS = {
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  gray:   'bg-gray-400',
  red:    'bg-red-500',
}

const CHIP_COLORS = {
  blue:   'bg-blue-500 text-white',
  green:  'bg-green-500 text-white',
  orange: 'bg-orange-500 text-white',
  purple: 'bg-purple-500 text-white',
  gray:   'bg-gray-400 text-white',
  red:    'bg-red-500 text-white',
}

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

/* ─────────────────────────────────────────
   DATE HELPERS
───────────────────────────────────────── */

const toISO = (d) => d.toISOString().split('T')[0]

const parseISO = (s) => {
  const [y, m, day] = s.split('-').map(Number)
  return new Date(y, m - 1, day)
}

// Returns grid days for a month (Mon-start, 6 weeks)
const buildGrid = (year, month) => {
  const first = new Date(year, month, 1)
  // Monday=0 … Sunday=6
  const startDow = (first.getDay() + 6) % 7
  const days = []
  // pad from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: toISO(d), cur: false })
  }
  // current month
  const last = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= last; d++) {
    days.push({ date: toISO(new Date(year, month, d)), cur: true })
  }
  // pad to complete 6 weeks
  let next = 1
  while (days.length < 42) {
    days.push({ date: toISO(new Date(year, month + 1, next++)), cur: false })
  }
  return days
}

/* ─────────────────────────────────────────
   EVENT FORM MODAL
───────────────────────────────────────── */

const EventForm = ({ initial, defaultDate, onSave, onClose }) => {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() => initial ?? {
    title: '', date: defaultDate ?? todayISO(),
    type: 'RDV', color: 'purple', notes: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTypeChange = (type) => {
    const meta = TYPE_META[type]
    set('type', type)
    if (meta) set('color', meta.color)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    onSave(form)
  }

  const TypeIcon = TYPE_META[form.type]?.icon ?? Tag

  return (
    <Modal
      title={isEdit ? 'Modifier l\'événement' : 'Nouvel événement'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Titre *</label>
          <input className="input-field" value={form.title} required
            onChange={e => set('title', e.target.value)}
            placeholder="Départ client, RDV, Paiement…" autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input-field" value={form.date} required
              onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input-field" value={form.type}
              onChange={e => handleTypeChange(e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Type preview */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
          ${TYPE_META[form.type]?.light ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
          <TypeIcon className="w-4 h-4" />
          {form.type}
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} value={form.notes ?? ''}
            onChange={e => set('notes', e.target.value)}
            placeholder="Informations complémentaires…" />
        </div>
      </form>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   EVENT DETAIL MODAL
───────────────────────────────────────── */

const EventDetail = ({ event, onEdit, onDelete, onClose }) => {
  const meta = TYPE_META[event.type] ?? TYPE_META.Autre
  const TypeIcon = meta.icon

  return (
    <Modal title="" onClose={onClose} size="sm" footer={
      <>
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => { onClose(); onDelete(event) }}>
          Supprimer
        </Button>
        <Button size="sm" icon={Edit2} onClick={() => { onClose(); onEdit(event) }}>
          Modifier
        </Button>
      </>
    }>
      <div className="space-y-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${meta.light}`}>
          <TypeIcon className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-base leading-tight">{event.title}</div>
            <div className="text-xs mt-0.5 opacity-75">{event.type}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDateLong(event.date)}</span>
        </div>
        {event.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            {event.notes}
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ─────────────────────────────────────────
   CALENDAR GRID
───────────────────────────────────────── */

const MonthGrid = ({ year, month, events, typeFilter, onDayClick, onEventClick }) => {
  const today = todayISO()
  const grid  = useMemo(() => buildGrid(year, month), [year, month])

  // index events by date
  const byDate = useMemo(() => {
    const map = {}
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [events])

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS_FR.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-gray-100">
        {grid.map(({ date, cur }) => {
          const dayEvents = (byDate[date] ?? [])
            .filter(e => !typeFilter || e.type === typeFilter)
          const isToday = date === today
          const d = parseInt(date.split('-')[2])
          const visible   = dayEvents.slice(0, 3)
          const overflow  = dayEvents.length - 3

          return (
            <div
              key={date}
              onClick={() => cur && onDayClick(date)}
              className={`min-h-[90px] p-1.5 flex flex-col gap-1 transition-colors
                ${cur ? 'bg-white hover:bg-blue-50/40 cursor-pointer' : 'bg-gray-50/60'}
                ${isToday ? 'ring-1 ring-inset ring-navy-400' : ''}
              `}
            >
              {/* Day number */}
              <div className="flex justify-end">
                <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full
                  ${isToday
                    ? 'bg-navy-700 text-white'
                    : cur ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  {d}
                </span>
              </div>

              {/* Events */}
              {visible.map(evt => (
                <button
                  key={evt.id}
                  onClick={e => { e.stopPropagation(); onEventClick(evt) }}
                  className={`w-full text-left text-xs px-1.5 py-0.5 rounded font-medium truncate
                    leading-5 transition-opacity hover:opacity-80
                    ${CHIP_COLORS[evt.color] ?? 'bg-gray-400 text-white'}`}
                  title={evt.title}
                >
                  {evt.title}
                </button>
              ))}

              {overflow > 0 && (
                <span className="text-xs text-gray-400 px-1 font-medium">+{overflow} autre{overflow > 1 ? 's' : ''}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   AGENDA VIEW
───────────────────────────────────────── */

const AgendaView = ({ events, typeFilter, onEventClick, onEdit, onDelete }) => {
  const today = todayISO()

  const sorted = useMemo(() => {
    let list = [...events]
    if (typeFilter) list = list.filter(e => e.type === typeFilter)
    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [events, typeFilter])

  // group by month-year
  const grouped = useMemo(() => {
    const map = {}
    sorted.forEach(e => {
      const key = e.date.slice(0, 7)
      ;(map[key] ??= []).push(e)
    })
    return Object.entries(map)
  }, [sorted])

  if (!sorted.length) {
    return (
      <div className="py-16 flex flex-col items-center text-gray-400">
        <Calendar className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">Aucun événement</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {grouped.map(([monthKey, evts]) => {
        const [y, m] = monthKey.split('-').map(Number)
        return (
          <div key={monthKey}>
            <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest sticky top-0">
              {MONTHS_FR[m - 1]} {y}
            </div>
            {evts.map(e => {
              const meta = TYPE_META[e.type] ?? TYPE_META.Autre
              const TypeIcon = meta.icon
              const isPast = e.date < today
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group
                    ${isPast ? 'opacity-60' : ''}`}
                >
                  {/* date block */}
                  <div className="w-10 text-center flex-shrink-0">
                    <div className={`text-lg font-bold leading-none
                      ${e.date === today ? 'text-navy-700' : 'text-gray-700'}`}>
                      {parseInt(e.date.split('-')[2])}
                    </div>
                    <div className="text-xs text-gray-400">
                      {['dim','lun','mar','mer','jeu','ven','sam'][parseISO(e.date).getDay()]}
                    </div>
                  </div>

                  {/* color bar */}
                  <div className={`w-1 h-10 rounded-full flex-shrink-0 ${DOT_COLORS[e.color] ?? 'bg-gray-400'}`} />

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">{e.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TypeIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{e.type}</span>
                    </div>
                    {e.notes && (
                      <div className="text-xs text-gray-400 truncate mt-0.5">{e.notes}</div>
                    )}
                  </div>

                  {/* actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => onEdit(e)}
                      className="p-1.5 rounded hover:bg-navy-100 text-gray-400 hover:text-navy-600 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(e)}
                      className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────
   UPCOMING MINI-LIST (sidebar)
───────────────────────────────────────── */

const UpcomingList = ({ events, onEventClick }) => {
  const today = todayISO()
  const upcoming = useMemo(() =>
    [...events]
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8),
    [events, today]
  )

  if (!upcoming.length) return (
    <div className="text-xs text-gray-400 text-center py-4">Aucun événement à venir</div>
  )

  return (
    <div className="space-y-1">
      {upcoming.map(e => (
        <button
          key={e.id}
          onClick={() => onEventClick(e)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[e.color] ?? 'bg-gray-400'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-700 truncate">{e.title}</div>
            <div className="text-xs text-gray-400">{formatDateLong(e.date).replace(/^\w+\s/, '')}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

export const CalendrierPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.calendar, [])
  const toast = useToast()

  const now   = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [view,  setView]  = useState('month')   // 'month' | 'agenda'
  const [typeFilter, setTypeFilter] = useState('')

  /* ── modals ── */
  const [formOpen,     setFormOpen]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [clickedDate,  setClickedDate]  = useState(null)

  /* ── navigation ── */
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  /* ── CRUD ── */
  const handleSave = (form) => {
    if (editTarget?.id) {
      setEvents(prev => prev.map(e => e.id === editTarget.id ? { ...e, ...form } : e))
      toast.success('Événement mis à jour')
    } else {
      const newE = { ...form, id: `evt-${Date.now()}` }
      setEvents(prev => [...prev, newE])
      toast.success('Événement créé')
    }
    setFormOpen(false)
    setEditTarget(null)
    setClickedDate(null)
  }

  const handleDelete = () => {
    setEvents(prev => prev.filter(e => e.id !== deleteTarget.id))
    toast.success('Événement supprimé')
    setDeleteTarget(null)
  }

  const openNew = (date = null) => {
    setEditTarget(null)
    setClickedDate(date)
    setFormOpen(true)
  }

  useEffect(() => {
    if (location.state?.openCreate) {
      openNew()
      navigate('/calendrier', { replace: true, state: {} })
    }
  }, [location.state?.openCreate])

  const openEdit = (evt) => {
    setEditTarget(evt)
    setClickedDate(null)
    setFormOpen(true)
  }

  const handleDayClick = (date) => openNew(date)

  /* ── type legend counts ── */
  const typeCounts = useMemo(() => {
    const map = {}
    events.forEach(e => { map[e.type] = (map[e.type] ?? 0) + 1 })
    return map
  }, [events])

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col overflow-y-auto">
        <div className="p-4 space-y-4">
          <Button icon={Plus} onClick={() => openNew()} className="w-full justify-center">
            Nouvel événement
          </Button>

          {/* Type filter */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Filtrer par type</p>
            <div className="space-y-1">
              <button
                onClick={() => setTypeFilter('')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${typeFilter === '' ? 'bg-navy-50 text-navy-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>Tous les types</span>
                <span className="text-gray-400">{events.length}</span>
              </button>
              {EVENT_TYPES.map(type => {
                const meta = TYPE_META[type]
                const TypeIcon = meta.icon
                const count = typeCounts[type] ?? 0
                if (!count) return null
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(t => t === type ? '' : type)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${typeFilter === type
                        ? `${meta.light} border`
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <TypeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left">{type}</span>
                    <span className="text-gray-400">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Upcoming events */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">À venir</p>
            <UpcomingList
              events={events}
              onEventClick={setDetailTarget}
            />
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          {/* Nav */}
          <button onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold text-navy-800 min-w-44">
            {MONTHS_FR[month]} {year}
          </h2>

          <Button variant="secondary" size="sm" onClick={goToday}>
            Aujourd'hui
          </Button>

          <div className="ml-auto flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                ${view === 'month' ? 'bg-navy-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Mois
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                ${view === 'agenda' ? 'bg-navy-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>
        </div>

        {/* Calendar content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {view === 'month' ? (
            <div className="h-full">
              <MonthGrid
                year={year}
                month={month}
                events={events}
                typeFilter={typeFilter}
                onDayClick={handleDayClick}
                onEventClick={setDetailTarget}
              />
            </div>
          ) : (
            <AgendaView
              events={events}
              typeFilter={typeFilter}
              onEventClick={setDetailTarget}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {formOpen && (
        <EventForm
          initial={editTarget}
          defaultDate={clickedDate}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null); setClickedDate(null) }}
        />
      )}

      {detailTarget && (
        <EventDetail
          event={detailTarget}
          onEdit={(e) => { setDetailTarget(null); openEdit(e) }}
          onDelete={(e) => { setDetailTarget(null); setDeleteTarget(e) }}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Supprimer l'événement ?"
          message={`"${deleteTarget.title}" sera supprimé définitivement.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
