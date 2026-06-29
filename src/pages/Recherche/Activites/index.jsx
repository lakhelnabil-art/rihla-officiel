import { useState } from 'react'
import {
  Search, MapPin, Calendar, Users, ExternalLink,
  ArrowLeft, Star, Zap, Camera, Compass, Music, Utensils, Waves,
} from 'lucide-react'
import { RechercheShell } from '../RechercheShell'
import { STORAGE_KEYS, today, nextResRef, buildReservation } from '../shared'

const PLATFORMS = [
  {
    id: 'viator',
    name: 'Viator',
    url: 'https://www.viator.com',
    color: '#1C8F4C',
    desc: 'Tours & activités dans 150+ pays',
    logo: '🟢',
  },
  {
    id: 'getyourguide',
    name: 'GetYourGuide',
    url: 'https://www.getyourguide.fr',
    color: '#FF5534',
    desc: 'Expériences locales authentiques',
    logo: '🔴',
  },
  {
    id: 'klook',
    name: 'Klook',
    url: 'https://www.klook.com/fr',
    color: '#FF5722',
    desc: 'Activités & pass touristiques Asie',
    logo: '🟠',
  },
  {
    id: 'airbnbexp',
    name: 'Airbnb Expériences',
    url: 'https://www.airbnb.fr/experiences',
    color: '#FF385C',
    desc: 'Expériences uniques chez l\'habitant',
    logo: '🏠',
  },
  {
    id: 'musement',
    name: 'Musement',
    url: 'https://www.musement.com/fr',
    color: '#2B6CB0',
    desc: 'Culture, musées & visites guidées',
    logo: '🎨',
  },
  {
    id: 'tiqets',
    name: 'Tiqets',
    url: 'https://www.tiqets.com/fr',
    color: '#6B46C1',
    desc: 'Billets skip-the-line monuments',
    logo: '🎫',
  },
  {
    id: 'civitatis',
    name: 'Civitatis',
    url: 'https://www.civitatis.com/fr',
    color: '#E53E3E',
    desc: 'Excursions guidées en français',
    logo: '🗺️',
  },
  {
    id: 'tourradar',
    name: 'TourRadar',
    url: 'https://www.tourradar.com/fr',
    color: '#2D7D46',
    desc: 'Tours organisés multi-jours',
    logo: '📡',
  },
]

const CATEGORIES = [
  { id: 'all',       label: 'Toutes',        icon: Compass },
  { id: 'culture',   label: 'Culture',       icon: Camera },
  { id: 'aventure',  label: 'Aventure',      icon: Zap },
  { id: 'gastronomie',label: 'Gastronomie',  icon: Utensils },
  { id: 'musique',   label: 'Spectacles',    icon: Music },
  { id: 'nature',    label: 'Nature',        icon: Waves },
]

const DESTINATIONS = [
  { city: 'Paris', country: 'FR', emoji: '🗼' },
  { city: 'Marrakech', country: 'MA', emoji: '🕌' },
  { city: 'Dubaï', country: 'AE', emoji: '🏙️' },
  { city: 'Istanbul', country: 'TR', emoji: '🕍' },
  { city: 'Rome', country: 'IT', emoji: '🏛️' },
  { city: 'Barcelone', country: 'ES', emoji: '🎨' },
  { city: 'Bali', country: 'ID', emoji: '🌺' },
  { city: 'Tokyo', country: 'JP', emoji: '⛩️' },
  { city: 'New York', country: 'US', emoji: '🗽' },
  { city: 'Le Caire', country: 'EG', emoji: '🏺' },
  { city: 'Séville', country: 'ES', emoji: '💃' },
  { city: 'Phuket', country: 'TH', emoji: '🏝️' },
]

function BookingForm({ platform, searchParams, onBack }) {
  const buildUrl = () => {
    const base = platform.url
    const dest = encodeURIComponent(searchParams.destination || '')
    if (platform.id === 'viator') return `${base}/search/results?text=${dest}`
    if (platform.id === 'getyourguide') return `${base}/s/?q=${dest}`
    if (platform.id === 'klook') return `${base}/search/${dest}/`
    if (platform.id === 'tiqets') return `${base}/search/?q=${dest}`
    return `${base}?q=${dest}`
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 0' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--muted)', fontSize: '.82rem', marginBottom: 24, padding: 0 }}
      >
        <ArrowLeft size={16} /> Retour à la recherche
      </button>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <span style={{ fontSize: 32 }}>{platform.logo}</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{platform.name}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{platform.desc}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginBottom: 8 }}>Votre recherche</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Destination', value: searchParams.destination || '—' },
              { label: 'Date', value: searchParams.date || '—' },
              { label: 'Personnes', value: searchParams.pax ? `${searchParams.pax} pers.` : '—' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text)' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <a
          href={buildUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, background: platform.color,
            color: '#fff', fontWeight: 700, fontSize: '.9rem',
            textDecoration: 'none', width: '100%', boxSizing: 'border-box',
          }}
        >
          <ExternalLink size={16} />
          Rechercher sur {platform.name}
        </a>
      </div>
    </div>
  )
}

function RechercheActivitesPageInner() {
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [pax, setPax] = useState('2')
  const [category, setCategory] = useState('all')
  const [view, setView] = useState('search') // 'search' | 'booking'
  const [activePlatform, setActivePlatform] = useState(null)

  const searchParams = { destination, date, pax }

  const openPlatform = (platform) => {
    setActivePlatform(platform)
    setView('booking')
  }

  if (view === 'booking' && activePlatform) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <BookingForm platform={activePlatform} searchParams={searchParams} onBack={() => setView('search')} />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Recherche d'Activités & Expériences
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
          Comparez les meilleures plateformes d'activités touristiques et réservez en quelques clics
        </div>
      </div>

      {/* Search bar */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 20, marginBottom: 24,
        display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'end',
      }}>
        <div>
          <label style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
            DESTINATION
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Ville ou pays..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '9px 10px 9px 32px', color: 'var(--text)', fontSize: '.85rem',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>DATE</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '9px 12px', color: 'var(--text)', fontSize: '.85rem',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>PERSONNES</label>
          <div style={{ position: 'relative' }}>
            <Users size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="number" min="1" max="30"
              value={pax}
              onChange={e => setPax(e.target.value)}
              style={{
                width: 90, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '9px 10px 9px 30px', color: 'var(--text)', fontSize: '.85rem',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px',
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Search size={14} /> Rechercher
        </button>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const active = category === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20,
                background: active ? 'var(--accent)' : 'var(--bg3)',
                color: active ? '#fff' : 'var(--muted)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: '.78rem', fontWeight: active ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Icon size={12} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Platforms grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
        {PLATFORMS.map(p => (
          <div key={p.id} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 20, cursor: 'pointer',
            transition: 'border-color .15s, transform .1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{p.logo}</span>
                <div>
                  <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>{p.desc}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => openPlatform(p)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 8,
                  background: p.color, color: '#fff',
                  border: 'none', fontSize: '.78rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Search size={13} /> Rechercher
              </button>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: 'var(--bg3)', color: 'var(--muted)',
                  border: '1px solid var(--border)', fontSize: '.78rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Quick destinations */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
          Destinations populaires
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          {DESTINATIONS.map(d => (
            <button
              key={d.city}
              onClick={() => setDestination(d.city)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 8,
                background: destination === d.city ? 'var(--accent)' : 'var(--bg3)',
                color: destination === d.city ? '#fff' : 'var(--text)',
                border: `1px solid ${destination === d.city ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span>{d.emoji}</span>
              <span>{d.city}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


export const RechercheActivitesPage = () => (
  <RechercheShell><RechercheActivitesPageInner /></RechercheShell>
)
