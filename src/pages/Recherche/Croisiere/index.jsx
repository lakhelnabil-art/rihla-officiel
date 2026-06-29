import { useState } from 'react'
import {
  Search, MapPin, Calendar, Users, ExternalLink, ArrowLeft, Anchor, Ship,
} from 'lucide-react'
import { RechercheShell } from '../RechercheShell'
import { STORAGE_KEYS, today, nextResRef, buildReservation } from '../shared'

const PLATFORMS = [
  {
    id: 'msc',
    name: 'MSC Croisières',
    url: 'https://www.msccruises.fr',
    color: '#003087',
    desc: 'Leader mondial des croisières',
    logo: '🚢',
    regions: ['Méditerranée', 'Caraïbes', 'Nord Europe'],
  },
  {
    id: 'costa',
    name: 'Costa Croisières',
    url: 'https://www.costacruises.fr',
    color: '#0066CC',
    desc: 'Croisières Italian style',
    logo: '⚓',
    regions: ['Méditerranée', 'Baltique', 'Canaries'],
  },
  {
    id: 'princess',
    name: 'Princess Cruises',
    url: 'https://www.princess.com',
    color: '#1a237e',
    desc: 'Luxe & destinations d\'exception',
    logo: '👑',
    regions: ['Alaska', 'Caraïbes', 'Méditerranée'],
  },
  {
    id: 'ncl',
    name: 'Norwegian Cruise',
    url: 'https://www.ncl.com/fr',
    color: '#C8102E',
    desc: 'Freestyle cruising — liberté totale',
    logo: '🌊',
    regions: ['Caraïbes', 'Europe', 'Bermudes'],
  },
  {
    id: 'royal',
    name: 'Royal Caribbean',
    url: 'https://www.royalcaribbean.com/fre',
    color: '#0071CE',
    desc: 'Plus grands navires du monde',
    logo: '🏖️',
    regions: ['Caraïbes', 'Méditerranée', 'Alaska'],
  },
  {
    id: 'celebrity',
    name: 'Celebrity Cruises',
    url: 'https://www.celebritycruises.com',
    color: '#8B0000',
    desc: 'Luxe moderne et gastronomie',
    logo: '⭐',
    regions: ['Méditerranée', 'Caraïbes', 'Asie'],
  },
  {
    id: 'celestyal',
    name: 'Celestyal Cruises',
    url: 'https://www.celestyal.com/fr',
    color: '#1565C0',
    desc: 'Spécialiste Méditerranée orientale',
    logo: '🏛️',
    regions: ['Grèce', 'Turquie', 'Égypte'],
  },
  {
    id: 'cunard',
    name: 'Cunard',
    url: 'https://www.cunard.fr',
    color: '#8B1A1A',
    desc: 'L\'élite des croisières transatlantiques',
    logo: '🎩',
    regions: ['Transatlantique', 'Nord Europe', 'Monde'],
  },
]

const REGIONS = [
  { id: 'all',          label: 'Toutes',          emoji: '🌍' },
  { id: 'med',          label: 'Méditerranée',     emoji: '🌊' },
  { id: 'caraïbes',     label: 'Caraïbes',         emoji: '🏝️' },
  { id: 'nord',         label: 'Nord Europe',      emoji: '🧊' },
  { id: 'asie',         label: 'Asie',             emoji: '🏯' },
  { id: 'amerique',     label: 'Amériques',        emoji: '🗽' },
]

const PORTS = [
  { name: 'Barcelone', country: 'ES', emoji: '🇪🇸' },
  { name: 'Marseille', country: 'FR', emoji: '🇫🇷' },
  { name: 'Rome (Civitavecchia)', country: 'IT', emoji: '🇮🇹' },
  { name: 'Venise', country: 'IT', emoji: '🚤' },
  { name: 'Athènes (Pirée)', country: 'GR', emoji: '🇬🇷' },
  { name: 'Dubaï', country: 'AE', emoji: '🇦🇪' },
  { name: 'Miami', country: 'US', emoji: '🇺🇸' },
  { name: 'Southampton', country: 'GB', emoji: '🇬🇧' },
  { name: 'Istanbul', country: 'TR', emoji: '🇹🇷' },
  { name: 'Singapour', country: 'SG', emoji: '🇸🇬' },
  { name: 'Casablanca', country: 'MA', emoji: '🇲🇦' },
  { name: 'Tanger Med', country: 'MA', emoji: '⚓' },
]

function BookingForm({ platform, searchParams, onBack }) {
  const buildUrl = () => {
    const dest = encodeURIComponent(searchParams.departure || '')
    if (platform.id === 'msc') return `${platform.url}/fr-FR/rechercher-une-croisiere`
    if (platform.id === 'royal') return `${platform.url}/cruises`
    return platform.url
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
          <span style={{ fontSize: 36 }}>{platform.logo}</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{platform.name}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{platform.desc}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {platform.regions.map(r => (
                <span key={r} style={{
                  padding: '2px 8px', borderRadius: 10,
                  background: 'var(--bg3)', color: 'var(--muted)',
                  fontSize: '.68rem', border: '1px solid var(--border)',
                }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginBottom: 8 }}>Votre recherche</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Port départ', value: searchParams.departure || '—' },
              { label: 'Destination', value: searchParams.destination || '—' },
              { label: 'Date', value: searchParams.date || '—' },
              { label: 'Passagers', value: searchParams.pax ? `${searchParams.pax} pers.` : '—' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text)' }}>{f.value}</div>
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
          Voir les croisières {platform.name}
        </a>
      </div>
    </div>
  )
}

function RechercheCroisieresInner() {
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [pax, setPax] = useState('2')
  const [region, setRegion] = useState('all')
  const [view, setView] = useState('search')
  const [activePlatform, setActivePlatform] = useState(null)

  const searchParams = { departure, destination, date, pax }

  const openPlatform = (p) => { setActivePlatform(p); setView('booking') }

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
          Recherche de Croisières
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
          Compagnies maritimes & réservation de cabines pour vos clients
        </div>
      </div>

      {/* Search bar */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 20, marginBottom: 24,
        display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 12, alignItems: 'end',
      }}>
        <div>
          <label style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>PORT DE DÉPART</label>
          <div style={{ position: 'relative' }}>
            <Anchor size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input value={departure} onChange={e => setDeparture(e.target.value)} placeholder="Port d'embarquement..."
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '9px 10px 9px 32px', color: 'var(--text)', fontSize: '.85rem',
                outline: 'none', fontFamily: 'inherit' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>DESTINATION / RÉGION</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Méditerranée, Caraïbes..."
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '9px 10px 9px 32px', color: 'var(--text)', fontSize: '.85rem',
                outline: 'none', fontFamily: 'inherit' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>DATE</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '9px 12px', color: 'var(--text)', fontSize: '.85rem',
              outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div>
          <label style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>PASSAGERS</label>
          <div style={{ position: 'relative' }}>
            <Users size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input type="number" min="1" max="30" value={pax} onChange={e => setPax(e.target.value)}
              style={{ width: 80, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '9px 10px 9px 30px', color: 'var(--text)', fontSize: '.85rem',
                outline: 'none', fontFamily: 'inherit' }} />
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px',
          background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
          fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Search size={14} /> Rechercher
        </button>
      </div>

      {/* Region filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {REGIONS.map(r => {
          const active = region === r.id
          return (
            <button key={r.id} onClick={() => setRegion(r.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20,
                background: active ? 'var(--accent)' : 'var(--bg3)',
                color: active ? '#fff' : 'var(--muted)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: '.78rem', fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
              <span>{r.emoji}</span> {r.label}
            </button>
          )
        })}
      </div>

      {/* Platforms grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 32 }}>
        {PLATFORMS.map(p => (
          <div key={p.id} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'border-color .15s, transform .1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{p.logo}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>{p.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {p.regions.map(r => (
                <span key={r} style={{ padding: '2px 7px', borderRadius: 8, background: 'var(--bg3)',
                  color: 'var(--muted)', fontSize: '.66rem', border: '1px solid var(--border)' }}>
                  {r}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openPlatform(p)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, background: p.color, color: '#fff',
                  border: 'none', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Ship size={13} /> Voir croisières
              </button>
              <a href={p.url} target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)', color: 'var(--muted)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none' }}>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Ports grid */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
          Principaux ports d'embarquement
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {PORTS.map(d => (
            <button key={d.name} onClick={() => setDeparture(d.name)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
                background: departure === d.name ? 'var(--accent)' : 'var(--bg3)',
                color: departure === d.name ? '#fff' : 'var(--text)',
                border: `1px solid ${departure === d.name ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <span>{d.emoji}</span>
              <span style={{ flex: 1 }}>{d.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


export const RechercheCroisierePage = () => (
  <RechercheShell><RechercheCroisieresInner /></RechercheShell>
)
