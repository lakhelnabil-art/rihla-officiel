import { useState } from 'react'
import {
  Search, Users, ExternalLink, BedDouble, Moon, Star,
  MapPin, ArrowLeft, Hotel, RefreshCw,
} from 'lucide-react'
import { HOTEL_PLATFORMS } from './data/platforms'
import { findHotels5Stars } from './data/hotels5stars'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useToast } from '../../../hooks/useToast'
import { RechercheShell } from '../RechercheShell'
import { STORAGE_KEYS, today, nextResRef, buildReservation } from '../shared'
import { ClientPickerField } from '../../../components/QuickCreate'
import { getBannedCountryError } from '../../../data/bannedCountries'

const POPULAR = [
  { city: 'Marrakech', country: 'Maroc', emoji: '🇲🇦' },
  { city: 'Agadir', country: 'Maroc', emoji: '🇲🇦' },
  { city: 'Casablanca', country: 'Maroc', emoji: '🇲🇦' },
  { city: 'Fès', country: 'Maroc', emoji: '🇲🇦' },
  { city: 'Paris', country: 'France', emoji: '🇫🇷' },
  { city: 'Dubaï', country: 'UAE', emoji: '🇦🇪' },
  { city: 'Istanbul', country: 'Turquie', emoji: '🇹🇷' },
  { city: 'La Mecque', country: 'Arabie Saoudite', emoji: '🇸🇦' },
  { city: 'Le Caire', country: 'Égypte', emoji: '🇪🇬' },
  { city: 'Barcelone', country: 'Espagne', emoji: '🇪🇸' },
  { city: 'Rome', country: 'Italie', emoji: '🇮🇹' },
  { city: 'New York', country: 'États-Unis', emoji: '🇺🇸' },
]

const INPUT = {
  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', color: 'var(--text)', fontSize: '.85rem',
  outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
}
const LABEL = { fontSize: '.72rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }

// ─── Platform card ────────────────────────────────────────────────────────────
function PlatformCard({ platform, searchParams, onBook }) {
  const url = platform.buildUrl(searchParams)
  const nights = Math.max(1, Math.round(
    (new Date(searchParams.checkOut) - new Date(searchParams.checkIn)) / 86400000
  ))
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{
        background: 'var(--card)', border: `1px solid ${hov ? platform.couleur : 'var(--border)'}`,
        borderRadius: 14, overflow: 'hidden', transition: 'border-color .15s, transform .1s',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ padding: '12px 16px', background: platform.couleur, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{platform.emoji}</span>
          <span style={{ fontWeight: 700, fontSize: '.88rem', color: platform.textColor }}>{platform.nom}</span>
        </div>
        <Hotel size={16} style={{ color: platform.textColor, opacity: .5 }} />
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: '.74rem', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>{platform.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', borderRadius: 8, padding: '7px 10px', marginBottom: 12, flexWrap: 'wrap' }}>
          <BedDouble size={12} style={{ color: 'var(--muted)' }} />
          <span style={{ fontSize: '.74rem', color: 'var(--text)', fontWeight: 500 }}>{searchParams.destination}</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <Moon size={11} style={{ color: 'var(--muted)' }} />
          <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{nights} nuit{nights > 1 ? 's' : ''}</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <Users size={11} style={{ color: 'var(--muted)' }} />
          <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{searchParams.guests} pers.</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px', borderRadius: 8, background: platform.couleur,
              color: platform.textColor, fontWeight: 600, fontSize: '.78rem', textDecoration: 'none',
            }}
          >
            <ExternalLink size={13} /> Rechercher
          </a>
          <button
            onClick={() => onBook(platform)}
            style={{
              padding: '8px 12px', borderRadius: 8, background: 'var(--bg3)',
              border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Créer réservation"
          >
            <BedDouble size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 5-star hotel card ────────────────────────────────────────────────────────
function Hotel5StarCard({ hotel }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg,#2a1f00,#3d2e00)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{hotel.emoji}</span>
          <div>
            <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#fff' }}>{hotel.nom}</div>
            <div style={{ fontSize: '.7rem', color: '#f59e0b' }}>{hotel.chaine}</div>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />)}
        </div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: 4 }}>{hotel.quartier}</div>
        <div style={{ fontSize: '.74rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: 12 }}>{hotel.description}</div>
        <a
          href={hotel.site} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px', borderRadius: 8, background: '#f59e0b',
            color: '#1a0f00', fontWeight: 700, fontSize: '.78rem', textDecoration: 'none',
          }}
        >
          <ExternalLink size={13} /> Site officiel
        </a>
      </div>
    </div>
  )
}

// ─── Booking mini form (inline) ───────────────────────────────────────────────
function BookingInline({ platform, searchParams, onBack, onSave, clients, onClientCreated }) {
  const [clientId, setClientId] = useState('')
  const [montant, setMontant] = useState('')
  const nights = Math.max(1, Math.round(
    (new Date(searchParams.checkOut) - new Date(searchParams.checkIn)) / 86400000
  ))

  const handleSave = () => {
    const client = clients.find(c => String(c.id) === String(clientId))
    onSave({
      clientId, client: client?.nom || '',
      notes: `Hôtel via ${platform.nom} — ${searchParams.destination} — ${nights} nuit${nights > 1 ? 's' : ''} — ${searchParams.guests} pers.`,
      montant: Number(montant) || 0,
    })
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 0' }}>
      <button onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--muted)', fontSize: '.82rem', marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={16} /> Retour à la recherche
      </button>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>{platform.emoji}</span>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{platform.nom}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
              {searchParams.destination} · {nights} nuit{nights > 1 ? 's' : ''} · {searchParams.guests} pers.
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          <ClientPickerField
            clients={clients}
            clientId={clientId}
            onClientIdChange={(id) => setClientId(id)}
            onClientCreated={onClientCreated}
            variant="recherche"
            label="Client"
          />
          <div>
            <label style={LABEL}>MONTANT (MAD)</label>
            <input type="number" min="0" value={montant} onChange={e => setMontant(e.target.value)}
              placeholder="Prix trouvé sur la plateforme" style={INPUT} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={platform.buildUrl(searchParams)} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', borderRadius: 8, background: platform.couleur, color: platform.textColor,
                fontWeight: 600, fontSize: '.85rem', textDecoration: 'none' }}>
              <ExternalLink size={14} /> Voir prix sur {platform.nom}
            </a>
            <button onClick={handleSave} disabled={!clientId || !montant}
              style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'var(--accent)',
                color: '#fff', border: 'none', fontWeight: 600, fontSize: '.85rem',
                cursor: clientId && montant ? 'pointer' : 'not-allowed',
                opacity: clientId && montant ? 1 : .5, fontFamily: 'inherit' }}>
              Créer réservation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function RechercheHotelsPageInner() {
  const [reservations, setReservations] = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [clients, setClients] = useLocalStorage(STORAGE_KEYS.clients, [])
  const { addToast } = useToast()

  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState(today())
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [stars, setStars] = useState(0)
  const [searched, setSearched] = useState(false)

  const [view, setView] = useState('search') // 'search' | 'booking'
  const [activePlatform, setActivePlatform] = useState(null)
  const [saved, setSaved] = useState(false)

  const hotels5 = searched ? findHotels5Stars(destination) : []
  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0

  function handleCheckInChange(val) {
    setCheckIn(val)
    if (!checkOut || checkOut <= val) {
      const d = new Date(val); d.setDate(d.getDate() + 1)
      setCheckOut(d.toISOString().split('T')[0])
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!destination.trim() || !checkIn || !checkOut) return
    const bannedError = getBannedCountryError(destination)
    if (bannedError) {
      addToast(bannedError, 'error')
      return
    }
    setSearched(true)
  }

  function openBooking(platform) { setActivePlatform(platform); setView('booking') }

  function saveReservation({ clientId, client, notes, montant }) {
    const ref = nextResRef()
    setReservations(prev => [...prev, buildReservation({
      id: Date.now(), ref, clientId, client, clientNom: client,
      destination: destination.trim(), type: 'hotel',
      depart: checkIn, retour: checkOut, statut: 'en_attente', montant, notes,
    })])
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setView('search')
  }

  const searchParams = { destination: destination.trim(), checkIn, checkOut, guests, rooms, stars }

  if (view === 'booking' && activePlatform) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <BookingInline
          platform={activePlatform}
          searchParams={searchParams}
          onBack={() => setView('search')}
          onSave={saveReservation}
          clients={clients}
          onClientCreated={(client) => setClients(prev => [client, ...prev])}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Recherche d'Hôtels
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
          Liens directs vers les 10 grandes plateformes mondiales de réservation hôtelière
        </div>
      </div>

      {saved && (
        <div style={{ background: '#0d2e20', border: '1px solid var(--green)', borderRadius: 10, padding: '10px 16px',
          color: 'var(--green)', fontSize: '.82rem', marginBottom: 16 }}>
          ✓ Réservation créée avec succès
        </div>
      )}

      {/* Search form */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={LABEL}>DESTINATION</label>
            <div style={{ position: 'relative' }}>
              <Hotel size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input value={destination} onChange={e => setDestination(e.target.value)}
                placeholder="Ex : Marrakech, Paris, Dubaï…"
                style={{ ...INPUT, paddingLeft: 32 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={LABEL}>ARRIVÉE</label>
              <input type="date" value={checkIn} min={today()} onChange={e => handleCheckInChange(e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>DÉPART</label>
              <input type="date" value={checkOut} min={checkIn || today()} onChange={e => setCheckOut(e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>PERS.</label>
              <div style={{ position: 'relative' }}>
                <Users size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                  style={{ ...INPUT, paddingLeft: 28, width: 90 }}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={LABEL}>CH.</label>
              <div style={{ position: 'relative' }}>
                <BedDouble size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <select value={rooms} onChange={e => setRooms(Number(e.target.value))}
                  style={{ ...INPUT, paddingLeft: 28, width: 80 }}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Stars filter */}
          <div>
            <label style={LABEL}>CATÉGORIE MINIMALE</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0,1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setStars(n)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                    background: stars === n ? '#f59e0b' : 'var(--bg3)',
                    border: `1px solid ${stars === n ? '#f59e0b' : 'var(--border)'}`,
                    color: stars === n ? '#1a0f00' : 'var(--muted)',
                    fontSize: '.75rem', fontWeight: stars === n ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  {n === 0 ? 'Toutes' : (
                    <>{Array.from({ length: n }).map((_, i) => <Star key={i} size={11} fill="currentColor" color="currentColor" />)} <span>et +</span></>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!destination.trim() || !checkIn || !checkOut}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px', borderRadius: 10, background: 'var(--accent)', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit',
              opacity: !destination.trim() || !checkIn || !checkOut ? .5 : 1,
            }}
          >
            <Search size={16} /> Rechercher sur les {HOTEL_PLATFORMS.length} plateformes
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--text)' }}>
                {HOTEL_PLATFORMS.length} plateformes pour <span style={{ color: 'var(--accent)' }}>{destination}</span>
              </div>
              <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: 2 }}>
                {checkIn} → {checkOut} · {nights} nuit{nights > 1 ? 's' : ''} · {guests} pers. · {rooms} ch.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => HOTEL_PLATFORMS.forEach(p => window.open(p.buildUrl(searchParams), '_blank', 'noopener,noreferrer'))}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
                  fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                <ExternalLink size={13} /> Tout ouvrir
              </button>
              <button onClick={() => setSearched(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)',
                  fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                <RefreshCw size={13} /> Modifier
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
            {HOTEL_PLATFORMS.map(p => (
              <PlatformCard key={p.id} platform={p} searchParams={searchParams} onBook={openBooking} />
            ))}
          </div>

          {hotels5.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <div style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--text)' }}>
                  Hôtels 5★ à <span style={{ color: '#f59e0b' }}>{destination}</span>
                </div>
                <span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: 10,
                  background: 'var(--bg3)', color: 'var(--muted)', fontSize: '.72rem',
                  border: '1px solid var(--border)' }}>
                  {hotels5.length} établissement{hotels5.length > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {hotels5.map((hotel, i) => <Hotel5StarCard key={i} hotel={hotel} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* Popular destinations */}
      {!searched && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
            Destinations populaires
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {POPULAR.map(d => (
              <button key={d.city} onClick={() => setDestination(d.city)}
                style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: 8,
                  background: destination === d.city ? 'var(--accent)' : 'var(--bg3)',
                  border: `1px solid ${destination === d.city ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                <div style={{ fontSize: 18 }}>{d.emoji}</div>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: destination === d.city ? '#fff' : 'var(--text)', marginTop: 4 }}>{d.city}</div>
                <div style={{ fontSize: '.68rem', color: destination === d.city ? 'rgba(255,255,255,.7)' : 'var(--muted)' }}>{d.country}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


export const RechercheHotelsPage = () => (
  <RechercheShell><RechercheHotelsPageInner /></RechercheShell>
)
