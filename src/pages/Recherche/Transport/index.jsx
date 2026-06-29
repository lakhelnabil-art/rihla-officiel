import { useState } from 'react'
import {
  Search, Car, MapPin, Users, Calendar, ExternalLink,
  Plus, Info, RefreshCw, ArrowLeft, CheckCircle2, User, CreditCard, FileText,
} from 'lucide-react'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useToast } from '../../../hooks/useToast'
import { formatCurrency } from '../../../utils/formatters'
import { RechercheShell } from '../RechercheShell'
import { STORAGE_KEYS, today, nextResRef, buildReservation } from '../shared'
import { ClientPickerField } from '../../../components/QuickCreate'

/* ─── Transport platforms ────────────────────────────────────────────────── */
const PLATFORMS = [
  {
    id: 'hertz', nom: 'Hertz', emoji: '🟡', couleur: '#FFD700', textColor: '#1a1a1a',
    description: 'Leader mondial de la location de voitures. Présent dans 150 pays, flotte premium.',
    buildUrl: ({ pickup, dropoff, date, returnDate }) =>
      `https://www.hertz.fr/rentacar/reservation/?from=${encodeURIComponent(pickup)}&to=${encodeURIComponent(dropoff)}&pickupDate=${date}&returnDate=${returnDate}`,
  },
  {
    id: 'avis', nom: 'Avis', emoji: '🔴', couleur: '#CC0000', textColor: '#fff',
    description: 'Compagnie internationale premium. Réservation flexible, large gamme de véhicules.',
    buildUrl: ({ pickup, date, returnDate }) =>
      `https://www.avis.fr/car-rental/search?from=${encodeURIComponent(pickup)}&pickupDate=${date}&returnDate=${returnDate}`,
  },
  {
    id: 'europcar', nom: 'Europcar', emoji: '🟢', couleur: '#007A3D', textColor: '#fff',
    description: 'N°1 en Europe. Location courte et longue durée, véhicules utilitaires inclus.',
    buildUrl: ({ pickup, date, returnDate }) =>
      `https://www.europcar.fr/location-voiture?pickup=${encodeURIComponent(pickup)}&pickupDate=${date}&returnDate=${returnDate}`,
  },
  {
    id: 'sixt', nom: 'Sixt', emoji: '🟠', couleur: '#FF7900', textColor: '#fff',
    description: 'Flotte haut de gamme, nombreuses marques premium. Application mobile primée.',
    buildUrl: ({ pickup, date, returnDate }) =>
      `https://www.sixt.fr/rent-a-car/?pickup=${encodeURIComponent(pickup)}&pickupDate=${date}&returnDate=${returnDate}`,
  },
  {
    id: 'budget', nom: 'Budget', emoji: '🔵', couleur: '#003087', textColor: '#fff',
    description: 'Meilleur rapport qualité/prix. Idéal pour les groupes et les longs séjours.',
    buildUrl: ({ pickup, date, returnDate }) =>
      `https://www.budget.fr/reservation?pickup=${encodeURIComponent(pickup)}&pickupDate=${date}&returnDate=${returnDate}`,
  },
  {
    id: 'rentalcars', nom: 'RentalCars', emoji: '🌐', couleur: '#2563EB', textColor: '#fff',
    description: 'Comparateur mondial. Agrège 900 loueurs. Trouve toujours le meilleur tarif.',
    buildUrl: ({ pickup, dropoff, date, returnDate, passengers }) =>
      `https://www.rentalcars.com/fr/?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}&pickupDate=${date}&returnDate=${returnDate}`,
  },
  {
    id: 'discovercars', nom: 'DiscoverCars', emoji: '🔍', couleur: '#6C63FF', textColor: '#fff',
    description: 'Comparateur transparant avec assurance tout-risque incluse. Zéro frais cachés.',
    buildUrl: ({ pickup, date, returnDate }) =>
      `https://www.discovercars.com/fr/cars/${encodeURIComponent(pickup)}?date_from=${date}&date_to=${returnDate}`,
  },
  {
    id: 'transfert_privaxi', nom: 'Blacklane', emoji: '🖤', couleur: '#111111', textColor: '#fff',
    description: 'Transferts aéroport & VTC haut de gamme. Chauffeurs professionnels dans 50+ pays.',
    buildUrl: ({ pickup, date }) =>
      `https://www.blacklane.com/fr/?from=${encodeURIComponent(pickup)}&date=${date}`,
  },
]

const TYPES_SERVICE = [
  { value: 'location', label: 'Location de voiture', icon: Car },
  { value: 'transfert', label: 'Transfert aéroport', icon: MapPin },
  { value: 'chauffeur', label: 'Voiture avec chauffeur', icon: Users },
]

const VILLES_POPULAIRES = [
  { city: 'Casablanca — CMN', emoji: '🇲🇦' },
  { city: 'Marrakech — RAK', emoji: '🇲🇦' },
  { city: 'Agadir — AGA', emoji: '🇲🇦' },
  { city: 'Paris — CDG', emoji: '🇫🇷' },
  { city: 'Dubai — DXB', emoji: '🇦🇪' },
  { city: 'Istanbul — IST', emoji: '🇹🇷' },
  { city: 'Madrid — MAD', emoji: '🇪🇸' },
  { city: 'Rome — FCO', emoji: '🇮🇹' },
]

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const inp = { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', color:'var(--text)', fontSize:'.88rem', outline:'none', fontFamily:'inherit', width:'100%', boxSizing:'border-box' }
const lbl = { fontSize:'.7rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6, display:'block' }

/* ─── Platform Card ──────────────────────────────────────────────────────── */
function PlatformCard({ platform, searchParams, onReserver }) {
  const url = platform.buildUrl(searchParams)
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', transition:'border-color .15s, box-shadow .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(108,99,255,.15)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}>
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor: platform.couleur }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.3rem' }}>{platform.emoji}</span>
          <div style={{ fontWeight:700, fontSize:'.88rem', color: platform.textColor }}>{platform.nom}</div>
        </div>
        <Car size={16} style={{ color: platform.textColor, opacity:.6 }} />
      </div>
      <div style={{ padding:'14px 16px' }}>
        <p style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:12, lineHeight:1.5 }}>{platform.description}</p>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg2)', borderRadius:8, padding:'8px 12px', marginBottom:12, fontSize:'.75rem', color:'var(--muted)', flexWrap:'wrap' }}>
          <MapPin size={12} /> <span style={{ fontWeight:600, color:'var(--text)' }}>{searchParams.pickup || '—'}</span>
          {searchParams.dropoff && searchParams.dropoff !== searchParams.pickup && <><span>→</span><span>{searchParams.dropoff}</span></>}
          <span style={{ color:'var(--border)' }}>·</span>
          <Calendar size={12} /> <span>{searchParams.date}</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 12px', borderRadius:8, fontSize:'.78rem', fontWeight:700, color: platform.textColor, backgroundColor: platform.couleur, textDecoration:'none', transition:'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <ExternalLink size={13} /> Voir les offres
          </a>
          <button onClick={() => onReserver(platform)}
            style={{ padding:'8px 12px', borderRadius:8, background:'rgba(108,99,255,.15)', border:'1px solid rgba(108,99,255,.35)', color:'var(--accent)', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:'.75rem', fontWeight:600, fontFamily:'inherit' }}>
            <Plus size={14} /> Réserver
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Inline Booking Form ────────────────────────────────────────────────── */
function BookingForm({ platform, searchParams, clients, onClientCreated, onSave, onBack }) {
  const [clientId, setClientId] = useState('')
  const [clientNom, setClientNom] = useState('')
  const [montant, setMontant]   = useState('')
  const [notes, setNotes]       = useState(`Transport ${platform.nom} — ${searchParams.pickup}${searchParams.dropoff ? ' → ' + searchParams.dropoff : ''} — ${searchParams.passengers} pers.`)

  function submit(e) {
    e.preventDefault()
    const c = clients.find(x => String(x.id) === String(clientId))
    const ref = nextResRef()
    onSave({ id:Date.now(), ref, clientId, client:c?.nom||clientNom, clientNom:c?.nom||clientNom,
      destination: searchParams.pickup, type:'transport', depart:searchParams.date, retour:searchParams.returnDate||'',
      statut:'en_attente', montant:Number(montant)||0, notes }, ref)
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button type="button" onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', color:'var(--muted)', fontSize:'.82rem', cursor:'pointer', fontFamily:'inherit' }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <div>
            <div style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text)' }}>{platform.emoji} {platform.nom} — Réservation transport</div>
            <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{searchParams.pickup} · {searchParams.date}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button type="button" onClick={onBack} style={{ padding:'9px 18px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:'.82rem', cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
          <button type="submit" style={{ padding:'9px 22px', borderRadius:8, background:'var(--accent)', border:'none', color:'#fff', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:7 }}>
            <CheckCircle2 size={15} /> Créer la réservation
          </button>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <div>
          {/* Client */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg3)' }}>
              <User size={15} color="var(--accent)" /><span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)' }}>Client</span>
            </div>
            <div style={{ padding:20 }}>
              <ClientPickerField
                clients={clients}
                clientId={clientId}
                clientNom={clientNom}
                onClientIdChange={(id, c) => { setClientId(id); setClientNom(c?.nom || '') }}
                onClientNomChange={setClientNom}
                onClientCreated={onClientCreated}
                variant="recherche"
                label="Client"
              />
            </div>
          </div>
          {/* Tarif */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg3)' }}>
              <CreditCard size={15} color="var(--accent2)" /><span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)' }}>Tarif</span>
            </div>
            <div style={{ padding:20 }}>
              <label style={lbl}>Montant (MAD) <span style={{ color:'var(--red)' }}>*</span></label>
              <input type="number" min="0" step="0.01" required value={montant} onChange={e => setMontant(e.target.value)} style={inp} placeholder="0.00" />
            </div>
          </div>
          {/* Notes */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg3)' }}>
              <FileText size={15} color="var(--accent)" /><span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)' }}>Notes</span>
            </div>
            <div style={{ padding:20 }}>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inp, resize:'vertical' }} />
            </div>
          </div>
        </div>
        {/* Summary */}
        <div style={{ position:'sticky', top:80 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg3)', display:'flex', alignItems:'center', gap:8 }}>
              <Car size={13} color="var(--accent2)" /><span style={{ fontSize:'.8rem', fontWeight:700, color:'var(--text)' }}>Récapitulatif</span>
            </div>
            <div style={{ padding:18 }}>
              <div style={{ padding:'10px 12px', background:`${platform.couleur}22`, border:`1px solid ${platform.couleur}55`, borderRadius:8, marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:'1.3rem' }}>{platform.emoji}</span>
                <div>
                  <div style={{ fontSize:'.85rem', fontWeight:700, color:'var(--text)' }}>{platform.nom}</div>
                </div>
              </div>
              {[
                { label:'Prise en charge', val: searchParams.pickup||'—' },
                { label:'Restitution',     val: searchParams.dropoff||searchParams.pickup||'—' },
                { label:'Date départ',     val: searchParams.date||'—' },
                { label:'Date retour',     val: searchParams.returnDate||'—' },
                { label:'Passagers',       val: `${searchParams.passengers} pers.` },
                { label:'Client',          val: clientNom||(clients.find(c=>String(c.id)===String(clientId))?.nom)||'—' },
              ].map(({ label, val }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'.73rem', color:'var(--muted)' }}>{label}</span>
                  <span style={{ fontSize:'.76rem', fontWeight:600, color:'var(--text)', maxWidth:140, textAlign:'right' }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop:14, padding:'12px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'.8rem', fontWeight:700, color:'var(--text)' }}>Montant</span>
                <span style={{ fontSize:'.95rem', fontWeight:800, color:'var(--accent2)' }}>{formatCurrency(Number(montant)||0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
function RechercheTransportPageInner() {
  const [, setReservations] = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [clients, setClients] = useLocalStorage(STORAGE_KEYS.clients, [])
  const { toasts, addToast, removeToast } = useToast()

  const [pickup, setPickup]         = useState('')
  const [dropoff, setDropoff]       = useState('')
  const [dateDepart, setDateDepart] = useState(today())
  const [dateRetour, setDateRetour] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [typeService, setTypeService] = useState('location')
  const [searched, setSearched]     = useState(false)
  const [bookingPlatform, setBookingPlatform] = useState(null)

  const searchParams = { pickup, dropoff, date: dateDepart, returnDate: dateRetour, passengers, typeService }

  function handleSave(resa, ref) {
    setReservations(prev => [...prev, buildReservation(resa)])
    addToast(`Réservation créée : ${ref}`, 'success')
    setBookingPlatform(null)
  }

  if (bookingPlatform) return (
    <>
      <BookingForm platform={bookingPlatform} searchParams={searchParams} clients={clients}
        onClientCreated={(client) => setClients(prev => [client, ...prev])}
        onSave={handleSave} onBack={() => setBookingPlatform(null)} />
    </>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h1 style={{ fontSize:'1.15rem', fontWeight:800, color:'var(--text)', margin:0 }}>Recherche Transport</h1>
        <p style={{ fontSize:'.75rem', color:'var(--muted)', margin:'4px 0 0' }}>Location de voitures, transferts aéroport et VTC premium</p>
      </div>

      <div style={{ display:'flex', gap:10, padding:'12px 16px', background:'rgba(108,99,255,.07)', border:'1px solid rgba(108,99,255,.25)', borderRadius:10 }}>
        <Info size={15} color="var(--accent)" style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ margin:0, fontSize:'.78rem', color:'var(--muted)', lineHeight:1.6 }}>
          Rihla génère un lien pré-rempli vers chaque prestataire de transport. Tarifs affichés en temps réel sur leur site.
        </p>
      </div>

      {/* Type selector */}
      <div style={{ display:'flex', gap:8 }}>
        {TYPES_SERVICE.map(t => {
          const Icon = t.icon
          return (
            <button key={t.value} onClick={() => setTypeService(t.value)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:'.8rem', fontWeight:600, transition:'all .15s',
                background: typeService === t.value ? 'var(--accent)' : 'var(--bg3)',
                border: `1px solid ${typeService === t.value ? 'var(--accent)' : 'var(--border)'}`,
                color: typeService === t.value ? '#fff' : 'var(--muted)' }}>
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Search form */}
      <form onSubmit={e => { e.preventDefault(); if(pickup.trim()) setSearched(true) }}
        style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div>
            <label style={lbl}>Lieu de prise en charge</label>
            <div style={{ position:'relative' }}>
              <MapPin size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
              <input required value={pickup} onChange={e => setPickup(e.target.value)} style={{ ...inp, paddingLeft:36 }} placeholder="Aéroport, ville, adresse…" />
            </div>
          </div>
          <div>
            <label style={lbl}>Lieu de restitution</label>
            <div style={{ position:'relative' }}>
              <MapPin size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
              <input value={dropoff} onChange={e => setDropoff(e.target.value)} style={{ ...inp, paddingLeft:36 }} placeholder="Même lieu ou destination différente" />
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px', gap:14, marginBottom:16 }}>
          <div>
            <label style={lbl}>Date de départ</label>
            <input type="date" required value={dateDepart} min={today()} onChange={e => setDateDepart(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Date de retour</label>
            <input type="date" value={dateRetour} min={dateDepart} onChange={e => setDateRetour(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Passagers</label>
            <div style={{ position:'relative' }}>
              <Users size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} style={{ ...inp, paddingLeft:30 }}>
                {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button type="submit" disabled={!pickup.trim()}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:10, background:'var(--accent)', border:'none', color:'#fff', fontSize:'.9rem', fontWeight:700, cursor: pickup.trim() ? 'pointer' : 'not-allowed', opacity: pickup.trim() ? 1 : .5, fontFamily:'inherit' }}>
          <Search size={17} /> Rechercher les prestataires
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--text)' }}>
                {PLATFORMS.length} prestataires pour <span style={{ color:'var(--accent)' }}>{pickup}</span>
              </div>
              <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:3 }}>{dateDepart}{dateRetour ? ` → ${dateRetour}` : ''} · {passengers} pers.</div>
            </div>
            <button onClick={() => setSearched(false)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:'.75rem', cursor:'pointer', fontFamily:'inherit' }}>
              <RefreshCw size={12} /> Modifier
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
            {PLATFORMS.map(p => (
              <PlatformCard key={p.id} platform={p} searchParams={searchParams} onReserver={setBookingPlatform} />
            ))}
          </div>
        </div>
      )}

      {/* Quick access */}
      {!searched && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:18 }}>
          <div style={{ fontSize:'.8rem', fontWeight:700, color:'var(--text)', marginBottom:12 }}>🚗 Villes & Aéroports populaires</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:8 }}>
            {VILLES_POPULAIRES.map(v => (
              <button key={v.city} onClick={() => setPickup(v.city)}
                style={{ textAlign:'left', padding:'10px 12px', borderRadius:8, background:'var(--bg2)', border:'1px solid var(--border)', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--bg3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg2)' }}>
                <span style={{ fontSize:'.9rem' }}>{v.emoji}</span>
                <div style={{ fontSize:'.78rem', fontWeight:600, color:'var(--text)', marginTop:3 }}>{v.city}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


export const RechercheTransportPage = () => (
  <RechercheShell><RechercheTransportPageInner /></RechercheShell>
)
