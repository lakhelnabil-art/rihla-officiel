import { useState, useRef, useEffect } from 'react'
import {
  Search, Plane, ArrowLeftRight, Users, ExternalLink, Plus, Info,
  Globe, AlertCircle, X, RefreshCw, Shield, FileText, Syringe,
  ChevronRight, ArrowLeft, CheckCircle2, User, CreditCard,
  TrendingDown,
} from 'lucide-react'
import { AIRPORTS, COUNTRY_AIRPORTS, searchAirports } from './data/airports'
import { AIRLINES, findAirlinesForRoute } from './data/airlines'
import { FLIGHT_PLATFORMS } from './data/platforms'
import { getVisaInfo, VISA_TYPE_META, PASSPORT_OPTIONS } from './data/visas'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useToast } from '../../../hooks/useToast'
import { formatCurrency } from '../../../utils/formatters'
import { RechercheShell } from '../RechercheShell'
import { STORAGE_KEYS, today, nextResRef, buildReservation } from '../shared'
import { getBannedCountryError } from '../../../data/bannedCountries'
import { ClientPickerField } from '../../../components/QuickCreate'

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const inp = {
  background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10,
  padding:'10px 14px', color:'var(--text)', fontSize:'.88rem',
  outline:'none', fontFamily:'inherit', width:'100%', boxSizing:'border-box',
}
const lbl = {
  fontSize:'.7rem', fontWeight:700, color:'var(--muted)',
  textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6, display:'block',
}

/* ─── Airport autocomplete ───────────────────────────────────────────────── */
function AirportInput({ label, value, onChange, placeholder }) {
  const [query, setQuery]   = useState(value ? `${value.code} – ${value.ville}` : '')
  const [open, setOpen]     = useState(false)
  const [results, setResults] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleInput(e) {
    const q = e.target.value; setQuery(q)
    const found = searchAirports(q); setResults(found); setOpen(found.length > 0)
    if (!q) onChange(null)
  }
  function select(a) { setQuery(`${a.code} – ${a.ville}`); onChange(a); setOpen(false) }

  return (
    <div style={{ position:'relative', flex:1, minWidth:0 }} ref={ref}>
      <label style={lbl}>{label}</label>
      <div style={{ position:'relative' }}>
        <Plane size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
        <input type="text" value={query} onChange={handleInput}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder={placeholder}
          style={{ ...inp, paddingLeft:36 }} />
        {value && (
          <button onClick={() => { onChange(null); setQuery(''); setResults([]) }}
            style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--muted)' }}>
            <X size={13} />
          </button>
        )}
      </div>
      {open && (
        <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:100, marginTop:4,
          background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
          {results.map(a => (
            <button key={a.code} onMouseDown={() => select(a)}
              style={{ width:'100%', textAlign:'left', padding:'10px 14px', background:'none', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid var(--border)', fontFamily:'inherit',
                transition:'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontFamily:'monospace', fontSize:'.82rem', fontWeight:800, color:'var(--accent)', width:36, flexShrink:0 }}>{a.code}</span>
              <div>
                <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text)' }}>{a.ville} — {a.nom}</div>
                <div style={{ fontSize:'.68rem', color:'var(--muted)', marginTop:2 }}>{a.pays}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const CABIN_LABELS = { economy:'Économique', business:'Business', first:'Première' }

/* ─── Comparateur Card ───────────────────────────────────────────────────── */
function ComparatorCard({ platform, searchParams }) {
  const { from, to, date, returnDate, pax, cabin } = searchParams
  const url = platform.buildUrl(searchParams)
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden',
      transition:'border-color .15s, box-shadow .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = platform.couleur; e.currentTarget.style.boxShadow = `0 4px 20px ${platform.couleur}33` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor:platform.couleur }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.3rem' }}>{platform.emoji}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:'.85rem', color:platform.textColor }}>{platform.nom}</div>
            {platform.badge && (
              <div style={{ fontSize:'.62rem', fontWeight:700, color:platform.textColor, opacity:.8, marginTop:1 }}>{platform.badge}</div>
            )}
          </div>
        </div>
        <TrendingDown size={16} style={{ color:platform.textColor, opacity:.6 }} />
      </div>
      <div style={{ padding:'14px 16px' }}>
        <p style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:12, lineHeight:1.5 }}>{platform.description}</p>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg2)', borderRadius:8, padding:'8px 12px', marginBottom:12 }}>
          <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'.9rem', color:'var(--accent)' }}>{from.code}</span>
          <div style={{ flex:1, height:1, borderTop:'1px dashed var(--border)', position:'relative' }}>
            <Plane size={12} style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:'var(--muted)' }} />
          </div>
          <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'.9rem', color:'var(--accent)' }}>{to.code}</span>
          {returnDate && <span style={{ fontSize:'.68rem', color:'var(--muted)', marginLeft:4 }}>↩ A/R</span>}
        </div>
        <div style={{ fontSize:'.68rem', color:'var(--muted)', marginBottom:12 }}>
          {date} · {pax} pax · {CABIN_LABELS[cabin] || cabin}
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            padding:'8px 12px', borderRadius:8, fontSize:'.78rem', fontWeight:700,
            color:platform.textColor, backgroundColor:platform.couleur, textDecoration:'none',
            transition:'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <ExternalLink size={13} /> Comparer les prix
        </a>
      </div>
    </div>
  )
}

/* ─── Airline Card ───────────────────────────────────────────────────────── */
function AirlineCard({ airline, searchParams, onCreateResa }) {
  const { from, to, date, returnDate, pax, cabin } = searchParams
  const url = airline.buildUrl({ from:from.code, to:to.code, date, returnDate, pax, cabin })
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden',
      transition:'border-color .15s, box-shadow .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,.15)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
      {/* Color band */}
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor:airline.couleur }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.3rem' }}>{airline.drapeau}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:'.85rem', color:airline.textColor }}>{airline.nom}</div>
            <div style={{ fontSize:'.68rem', opacity:.75, color:airline.textColor }}>{airline.iata} · {airline.pays}</div>
          </div>
        </div>
        <Globe size={16} style={{ color:airline.textColor, opacity:.6 }} />
      </div>
      {/* Body */}
      <div style={{ padding:'14px 16px' }}>
        <p style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:12, lineHeight:1.5 }}>{airline.description}</p>
        {/* Route */}
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg2)', borderRadius:8, padding:'8px 12px', marginBottom:12 }}>
          <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'.9rem', color:'var(--accent)' }}>{from.code}</span>
          <div style={{ flex:1, height:1, borderTop:'1px dashed var(--border)', position:'relative' }}>
            <Plane size={12} style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:'var(--muted)' }} />
          </div>
          <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'.9rem', color:'var(--accent)' }}>{to.code}</span>
          {returnDate && <span style={{ fontSize:'.68rem', color:'var(--muted)', marginLeft:4 }}>↩ A/R</span>}
        </div>
        {/* CTAs */}
        <div style={{ display:'flex', gap:8 }}>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'8px 12px', borderRadius:8, fontSize:'.78rem', fontWeight:700,
              color:airline.textColor, backgroundColor:airline.couleur, textDecoration:'none',
              transition:'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <ExternalLink size={13} /> Voir les vols
          </a>
          <button onClick={() => onCreateResa(airline)}
            title="Créer une réservation"
            style={{ padding:'8px 12px', borderRadius:8, background:'rgba(108,99,255,.15)',
              border:'1px solid rgba(108,99,255,.35)', color:'var(--accent)',
              cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:'.75rem', fontWeight:600, fontFamily:'inherit' }}>
            <Plus size={14} /> Réserver
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Visa panel (dark theme) ────────────────────────────────────────────── */
const VISA_COLLECT_FIELDS = [
  { id:'type',           icon:'🏷️', label:'Type de visa',              detail:'Touristique, Affaires, Transit, Long séjour…' },
  { id:'numero',         icon:'#️⃣', label:'Numéro du visa',            detail:'Référence unique figurant sur le visa.' },
  { id:'delivrance',     icon:'📅', label:'Date de délivrance',        detail:'Date d\'émission par le consulat.' },
  { id:'expiration',     icon:'⏳', label:'Date d\'expiration',         detail:'Valide pour toute la durée du séjour + retour.' },
  { id:'entrees',        icon:'🔢', label:'Nombre d\'entrées',          detail:'Simple / Double / Multiple.' },
  { id:'sejour',         icon:'📆', label:'Durée de séjour autorisée', detail:'Jours max par séjour (ex: 90/180j).' },
  { id:'pays_emission',  icon:'🏛️', label:'Pays & consulat d\'émission',detail:'Premier pays d\'entrée Schengen doit correspondre.' },
  { id:'scan',           icon:'📄', label:'Copie scannée du visa',      detail:'Conserver dans le dossier client.' },
  { id:'passeport',      icon:'🛂', label:'Validité du passeport',      detail:'Min 6 mois après la date de retour.' },
]

function VisaAlreadyObtainedPanel({ destinationCountry }) {
  const [open, setOpen] = useState(false)
  const isSchengen = ['FR','ES','DE','IT','NL','BE','PT','CH','AT','GR','SE','DK','NO','FI','PL','CZ','RO'].includes(destinationCountry)
  return (
    <div style={{ marginTop:12, border:'1px solid rgba(34,197,94,.3)', borderRadius:10, overflow:'hidden', background:'rgba(34,197,94,.05)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'1.1rem' }}>✅</span>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:'.82rem', fontWeight:700, color:'var(--green)' }}>Client avec visa existant</div>
            <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:2 }}>Informations à collecter pour le dossier</div>
          </div>
        </div>
        <ChevronRight size={14} color="var(--green)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition:'transform .2s' }} />
      </button>
      {open && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(34,197,94,.2)' }}>
          {isSchengen && (
            <div style={{ display:'flex', gap:8, padding:'10px 12px', background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.3)', borderRadius:8, margin:'12px 0', fontSize:'.75rem', color:'var(--yellow)' }}>
              <span>⚠️</span>
              <p style={{ margin:0, lineHeight:1.5 }}>Schengen : le pays d'émission doit correspondre au premier pays d'entrée prévu.</p>
            </div>
          )}
          <div style={{ display:'grid', gap:6, marginTop:12 }}>
            {VISA_COLLECT_FIELDS.map(f => (
              <div key={f.id} style={{ display:'flex', gap:10, padding:'9px 12px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
                <span style={{ fontSize:'1rem', flexShrink:0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize:'.78rem', fontWeight:600, color:'var(--text)' }}>{f.label}</div>
                  <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:2 }}>{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VisaPanel({ passportCountry, destinationCountry, destinationName }) {
  const [open, setOpen] = useState(true)
  const visa = getVisaInfo(passportCountry, destinationCountry)
  if (!visa) return null
  const meta = VISA_TYPE_META[visa.type] ?? VISA_TYPE_META.ambassade
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', background:meta.bg }}>{meta.icon}</span>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:'.84rem', fontWeight:700, color:'var(--text)', display:'flex', alignItems:'center', gap:8 }}>
              Visa & Formalités
              <span style={{ fontSize:'.7rem', fontWeight:700, padding:'2px 9px', borderRadius:20, background:meta.bg, color:meta.color }}>{meta.label}</span>
            </div>
            <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:2 }}>{destinationName} · Durée : {visa.duree}</div>
          </div>
        </div>
        <ChevronRight size={14} color="var(--muted)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition:'transform .2s' }} />
      </button>
      {open && (
        <div style={{ padding:'0 18px 18px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:14 }}>
            {[
              { label:`💰 ${visa.cout}` },
              { label:`⏱️ ${visa.delai}` },
            ].map(c => (
              <span key={c.label} style={{ padding:'5px 12px', borderRadius:20, background:'var(--bg3)', border:'1px solid var(--border)', fontSize:'.75rem', color:'var(--text)' }}>{c.label}</span>
            ))}
            {visa.lien && (
              <a href={visa.lien} target="_blank" rel="noopener noreferrer"
                style={{ padding:'5px 12px', borderRadius:20, background:'rgba(108,99,255,.12)', border:'1px solid rgba(108,99,255,.3)', fontSize:'.75rem', color:'var(--accent)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                <ExternalLink size={11} /> Portail officiel
              </a>
            )}
          </div>

          <div style={{ marginTop:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.7rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
              <Shield size={12} /> Procédure
            </div>
            <ol style={{ padding:0, margin:0, listStyle:'none', display:'flex', flexDirection:'column', gap:6 }}>
              {visa.procedure.map((step, i) => (
                <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ width:22, height:22, borderRadius:'50%', background:meta.bg, color:meta.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:700, flexShrink:0 }}>{i+1}</span>
                  <span style={{ fontSize:'.8rem', color:'var(--text)', lineHeight:1.5 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div style={{ marginTop:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.7rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
              <FileText size={12} /> Documents requis
            </div>
            <ul style={{ padding:0, margin:0, listStyle:'none', display:'flex', flexDirection:'column', gap:5 }}>
              {visa.documents.map((doc, i) => (
                <li key={i} style={{ display:'flex', gap:8, fontSize:'.78rem', color:'var(--text)' }}>
                  <span style={{ color:'var(--muted)' }}>•</span>{doc}
                </li>
              ))}
            </ul>
          </div>

          {visa.medical?.length > 0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.7rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
                <Syringe size={12} /> Exigences médicales
              </div>
              {visa.medical.map((req, i) => (
                <div key={i} style={{ display:'flex', gap:8, padding:'8px 12px', background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.25)', borderRadius:8, marginBottom:5, fontSize:'.78rem', color:'var(--yellow)' }}>
                  <span>💉</span>{req}
                </div>
              ))}
            </div>
          )}

          {visa.notes && (
            <div style={{ marginTop:14, display:'flex', gap:10, padding:'10px 14px', background:'rgba(108,99,255,.07)', border:'1px solid rgba(108,99,255,.2)', borderRadius:8 }}>
              <Info size={13} color="var(--accent)" style={{ flexShrink:0, marginTop:2 }} />
              <p style={{ margin:0, fontSize:'.78rem', color:'var(--muted)', lineHeight:1.5 }}>{visa.notes}</p>
            </div>
          )}

          <p style={{ marginTop:12, fontSize:'.68rem', color:'var(--muted)', fontStyle:'italic' }}>
            ⚠️ Informations indicatives. Vérifiez auprès du consulat concerné.
          </p>

          <VisaAlreadyObtainedPanel destinationCountry={destinationCountry} />
        </div>
      )}
    </div>
  )
}

/* ─── Inline Booking Form ────────────────────────────────────────────────── */
function BookingForm({ airline, searchParams, clients, onClientCreated, onSave, onBack }) {
  const { from, to, date, returnDate, pax, cabin } = searchParams
  const [clientId, setClientId]   = useState('')
  const [clientNom, setClientNom] = useState('')
  const [montant, setMontant]     = useState('')
  const [acompte, setAcompte]     = useState('')
  const [notes, setNotes]         = useState(`Vol ${airline.nom} — ${from?.code}→${to?.code} — ${pax} pax — ${CABIN_LABELS[cabin] || cabin}`)

  function submit(e) {
    e.preventDefault()
    const c = clients.find(x => String(x.id) === String(clientId))
    const ref = nextResRef()
    onSave({
      id: Date.now(), ref,
      clientId, client: c?.nom || clientNom, clientNom: c?.nom || clientNom,
      destination: to?.ville || to?.code || '',
      type: 'vol', depart: date, retour: returnDate || '',
      statut: 'en_attente',
      montant: Number(montant) || 0,
      acompte: Number(acompte) || 0,
      notes,
    }, ref)
  }

  const reste = (Number(montant) || 0) - (Number(acompte) || 0)

  return (
    <form onSubmit={submit}>
      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button type="button" onClick={onBack}
            style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', color:'var(--muted)', fontSize:'.82rem', cursor:'pointer', fontFamily:'inherit' }}>
            <ArrowLeft size={14} /> Retour aux résultats
          </button>
          <div>
            <div style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text)' }}>Créer une réservation vol</div>
            <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>
              {airline.drapeau} {airline.nom} · {from?.code} → {to?.code}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button type="button" onClick={onBack} style={{ padding:'9px 18px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--muted)', fontSize:'.82rem', cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
          <button type="submit" style={{ padding:'9px 22px', borderRadius:8, background:'var(--accent)', border:'none', color:'#fff', fontSize:'.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:7 }}>
            <CheckCircle2 size={15} /> Créer la réservation
          </button>
        </div>
      </div>

      {/* Two-column */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }}>
        <div>
          {/* Airline banner */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, marginBottom:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:airline.couleur, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>{airline.drapeau}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'.9rem', fontWeight:700, color:'var(--text)' }}>{airline.nom}</div>
              <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:3 }}>
                {from?.code} → {to?.code} · {date}{returnDate ? ` — ${returnDate}` : ''} · {pax} pax · {CABIN_LABELS[cabin] || cabin}
              </div>
            </div>
            <a href={airline.buildUrl({ from:from.code, to:to.code, date, returnDate, pax, cabin })}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8,
                background:'rgba(108,99,255,.12)', border:'1px solid rgba(108,99,255,.3)',
                color:'var(--accent)', fontSize:'.75rem', fontWeight:600, textDecoration:'none' }}>
              <ExternalLink size={12} /> Site compagnie
            </a>
          </div>

          {/* Client */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg3)' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(108,99,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <User size={15} color="var(--accent)" />
              </div>
              <span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)' }}>Client</span>
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

          {/* Tarification */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg3)' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(0,212,170,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CreditCard size={15} color="var(--accent2)" />
              </div>
              <span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)' }}>Tarification</span>
            </div>
            <div style={{ padding:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Montant total (MAD) <span style={{ color:'var(--red)' }}>*</span></label>
                  <input type="number" min="0" step="0.01" required value={montant} onChange={e => setMontant(e.target.value)} style={inp} placeholder="0.00" />
                </div>
                <div>
                  <label style={lbl}>Acompte versé (MAD)</label>
                  <input type="number" min="0" step="0.01" value={acompte} onChange={e => setAcompte(e.target.value)} style={inp} placeholder="0.00" />
                </div>
              </div>
              {montant && (
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  background: reste > 0 ? 'rgba(245,158,11,.08)' : 'rgba(34,197,94,.08)',
                  border: `1px solid ${reste > 0 ? 'rgba(245,158,11,.3)' : 'rgba(34,197,94,.3)'}`, borderRadius:8 }}>
                  <span style={{ fontSize:'.78rem', color:'var(--muted)' }}>Reste à payer :</span>
                  <span style={{ fontSize:'.9rem', fontWeight:700, color: reste > 0 ? 'var(--yellow)' : 'var(--green)' }}>
                    {formatCurrency(Math.max(0, reste))}
                  </span>
                  {reste <= 0 && <span style={{ fontSize:'.72rem', color:'var(--green)', marginLeft:'auto' }}>✓ Soldé</span>}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg3)' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(108,99,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FileText size={15} color="var(--accent)" />
              </div>
              <span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)' }}>Notes</span>
            </div>
            <div style={{ padding:20 }}>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inp, resize:'vertical' }} />
            </div>
          </div>
        </div>

        {/* Right summary */}
        <div style={{ position:'sticky', top:80 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg3)', display:'flex', alignItems:'center', gap:8 }}>
              <Plane size={13} color="var(--accent2)" />
              <span style={{ fontSize:'.8rem', fontWeight:700, color:'var(--text)' }}>Récapitulatif vol</span>
            </div>
            <div style={{ padding:18 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--bg2)', borderRadius:8, marginBottom:14, border:'1px solid var(--border)' }}>
                <div style={{ width:36, height:36, borderRadius:9, background:airline.couleur, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>{airline.drapeau}</div>
                <div>
                  <div style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)' }}>{airline.nom}</div>
                  <div style={{ fontSize:'.68rem', color:'var(--muted)', marginTop:2 }}>{airline.iata}</div>
                </div>
              </div>
              {[
                { label:'De',       val: from ? `${from.code} – ${from.ville}` : '—' },
                { label:'Vers',     val: to   ? `${to.code} – ${to.ville}` : '—' },
                { label:'Départ',   val: date || '—' },
                { label:'Retour',   val: returnDate || '—' },
                { label:'Pax',      val: `${pax} passager${pax > 1 ? 's' : ''}` },
                { label:'Classe',   val: CABIN_LABELS[cabin] || cabin },
                { label:'Client',   val: clientNom || (clients.find(c => String(c.id) === String(clientId))?.nom) || '—' },
              ].map(({ label, val }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'.73rem', color:'var(--muted)' }}>{label}</span>
                  <span style={{ fontSize:'.76rem', fontWeight:600, color:'var(--text)', maxWidth:150, textAlign:'right' }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop:14, padding:'12px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>Total</span>
                  <span style={{ fontSize:'.9rem', fontWeight:800, color:'var(--text)' }}>{formatCurrency(Number(montant)||0)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>Reste</span>
                  <span style={{ fontSize:'.85rem', fontWeight:700, color: reste <= 0 ? 'var(--green)' : 'var(--yellow)' }}>{formatCurrency(Math.max(0,reste))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
const CABIN_OPTIONS = [
  { value:'economy', label:'Économique' },
  { value:'business', label:'Business' },
  { value:'first', label:'Première' },
]

export default function RechercheVolsPageInner() {
  const [, setReservations] = useLocalStorage(STORAGE_KEYS.reservations, [])
  const [clients, setClients] = useLocalStorage(STORAGE_KEYS.clients, [])
  const [settings]          = useLocalStorage(STORAGE_KEYS.settings, {})
  const homeCountry = settings.paysAgence || 'MA'
  const { toasts, addToast, removeToast } = useToast()

  const [passport, setPassport] = useState(homeCountry)
  const [from, setFrom]         = useState(null)
  const [to, setTo]             = useState(null)
  const [date, setDate]         = useState(today())
  const [returnDate, setReturnDate] = useState('')
  const [pax, setPax]           = useState(1)
  const [cabin, setCabin]       = useState('economy')
  const [isReturn, setIsReturn] = useState(false)
  const [searched, setSearched] = useState(false)
  const [airlines, setAirlines] = useState([])

  // Booking form view
  const [bookingAirline, setBookingAirline] = useState(null)

  function swap() { const t = from; setFrom(to); setTo(t) }

  function handleSearch(e) {
    e.preventDefault()
    if (!from || !to) return
    const bannedError = getBannedCountryError(from.pays) || getBannedCountryError(to.pays)
      || getBannedCountryError(from.ville) || getBannedCountryError(to.ville)
    if (bannedError) {
      addToast(bannedError, 'error')
      return
    }
    setAirlines(findAirlinesForRoute(from.code, to.code, homeCountry))
    setSearched(true)
  }

  function handleBookingSave(resa, ref) {
    setReservations(prev => [...prev, buildReservation(resa)])
    addToast(`Réservation créée : ${ref}`, 'success')
    setBookingAirline(null)
  }

  const searchParams = { from, to, date, returnDate: isReturn ? returnDate : '', pax, cabin }

  /* ── Booking view ── */
  if (bookingAirline) {
    return (
      <>
        <BookingForm
          airline={bookingAirline}
          searchParams={searchParams}
          clients={clients}
          onClientCreated={(client) => {
            setClients(prev => [client, ...prev])
            addToast(`Client "${client.nom}" ajouté`, 'success')
          }}
          onSave={handleBookingSave}
          onBack={() => setBookingAirline(null)}
        />
      </>
    )
  }

  /* ── Search view ── */
  const countryInfo = COUNTRY_AIRPORTS[homeCountry]
  const homeAirports = (countryInfo ? countryInfo.airports : COUNTRY_AIRPORTS.MA.airports)
    .map(code => AIRPORTS.find(a => a.code === code)).filter(Boolean)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize:'1.15rem', fontWeight:800, color:'var(--text)', margin:0 }}>Recherche de Vols</h1>
        <p style={{ fontSize:'.75rem', color:'var(--muted)', margin:'4px 0 0' }}>
          Comparez les meilleurs prix (Google Flights, Skyscanner…) puis accédez aux sites des compagnies
        </p>
      </div>

      {/* Info banner */}
      <div style={{ display:'flex', gap:10, padding:'12px 16px', background:'rgba(108,99,255,.07)', border:'1px solid rgba(108,99,255,.25)', borderRadius:10 }}>
        <Info size={15} color="var(--accent)" style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ margin:0, fontSize:'.78rem', color:'var(--muted)', lineHeight:1.6 }}>
          Rihla ouvre les comparateurs de prix (Google Flights, Skyscanner, Kayak…) avec votre itinéraire pré-rempli, puis liste les compagnies qui desservent la route. Tarifs affichés en temps réel sur chaque site.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
        {/* Airport row */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:16 }}>
          <AirportInput label="Départ" value={from} onChange={setFrom} placeholder="CMN — Casablanca…" />
          <button type="button" onClick={swap}
            style={{ padding:'10px 12px', borderRadius:9, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--muted)', cursor:'pointer', display:'flex', alignItems:'center', marginBottom:2, flexShrink:0, transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}>
            <ArrowLeftRight size={15} />
          </button>
          <AirportInput label="Arrivée" value={to} onChange={setTo} placeholder="CDG — Paris…" />
        </div>

        {/* Options row */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:16 }}>
          <div style={{ flex:'1 1 130px' }}>
            <label style={lbl}>Date de départ</label>
            <input type="date" required value={date} min={today()} onChange={e => setDate(e.target.value)} style={inp} />
          </div>
          <div style={{ flex:'1 1 130px' }}>
            <label style={{ ...lbl, display:'flex', alignItems:'center', gap:6 }}>
              <input type="checkbox" checked={isReturn} onChange={e => setIsReturn(e.target.checked)}
                style={{ width:14, height:14 }} />
              Date retour
            </label>
            <input type="date" value={returnDate} min={date} disabled={!isReturn} onChange={e => setReturnDate(e.target.value)}
              style={{ ...inp, opacity: isReturn ? 1 : .4 }} />
          </div>
          <div style={{ flex:'0 0 auto', minWidth:100 }}>
            <label style={lbl}>Passagers</label>
            <div style={{ position:'relative' }}>
              <Users size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
              <select value={pax} onChange={e => setPax(Number(e.target.value))} style={{ ...inp, paddingLeft:32, width:'auto', minWidth:100 }}>
                {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} pax</option>)}
              </select>
            </div>
          </div>
          <div style={{ flex:'0 0 auto', minWidth:140 }}>
            <label style={lbl}>Classe</label>
            <select value={cabin} onChange={e => setCabin(e.target.value)} style={{ ...inp, width:'auto', minWidth:140 }}>
              {CABIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ flex:'0 0 auto', minWidth:160 }}>
            <label style={lbl}>Nationalité voyageur</label>
            <select value={passport} onChange={e => setPassport(e.target.value)} style={{ ...inp, width:'auto', minWidth:160 }}>
              {PASSPORT_OPTIONS.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={!from || !to}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:10,
            background:'var(--accent)', border:'none', color:'#fff', fontSize:'.9rem', fontWeight:700,
            cursor: (!from || !to) ? 'not-allowed' : 'pointer', opacity: (!from || !to) ? .5 : 1,
            fontFamily:'inherit', transition:'opacity .15s' }}>
          <Search size={17} /> Rechercher les vols
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div>
          {/* Result header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--text)' }}>
                Résultats pour{' '}
                <span style={{ color:'var(--accent)' }}>{from?.code}</span>
                {' → '}
                <span style={{ color:'var(--accent)' }}>{to?.code}</span>
              </div>
              <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:3 }}>
                {from?.ville} → {to?.ville} · {pax} pax · {CABIN_OPTIONS.find(c=>c.value===cabin)?.label}
                {isReturn && returnDate ? ` · A/R ${returnDate}` : ''}
              </div>
            </div>
            <button onClick={() => setSearched(false)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8,
                background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--muted)',
                fontSize:'.75rem', cursor:'pointer', fontFamily:'inherit' }}>
              <RefreshCw size={12} /> Modifier
            </button>
          </div>

          {/* Comparateurs de prix */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <TrendingDown size={18} color="var(--accent)" />
                <div>
                  <div style={{ fontSize:'.9rem', fontWeight:700, color:'var(--text)' }}>
                    Comparateurs — meilleurs prix
                  </div>
                  <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:2 }}>
                    {FLIGHT_PLATFORMS.length} sites dont Google Flights, Skyscanner, Kayak…
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  FLIGHT_PLATFORMS.forEach(p => {
                    window.open(p.buildUrl(searchParams), '_blank', 'noopener,noreferrer')
                  })
                  addToast(`${FLIGHT_PLATFORMS.length} comparateurs ouverts`, 'success')
                }}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
                  background:'rgba(66,133,244,.12)', border:'1px solid rgba(66,133,244,.35)', color:'#4285f4',
                  fontSize:'.75rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                <ExternalLink size={13} /> Tout ouvrir ({FLIGHT_PLATFORMS.length})
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
              {FLIGHT_PLATFORMS.map(platform => (
                <ComparatorCard key={platform.id} platform={platform} searchParams={searchParams} />
              ))}
            </div>
          </div>

          {/* Visa panel */}
          {to?.country && (
            <VisaPanel passportCountry={passport} destinationCountry={to.country} destinationName={to.ville || to.pays} />
          )}

          {/* Compagnies aériennes */}
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:'.9rem', fontWeight:700, color:'var(--text)' }}>
                  Compagnies aériennes ({airlines.length})
                </div>
                <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:2 }}>
                  Sites officiels des compagnies desservant cet itinéraire
                </div>
              </div>
              {airlines.length > 0 && (
                <button
                  onClick={() => {
                    airlines.forEach(a => {
                      window.open(a.buildUrl({ from:from.code, to:to.code, date, returnDate:isReturn?returnDate:'', pax, cabin }), '_blank', 'noopener,noreferrer')
                    })
                    addToast(`${airlines.length} sites compagnies ouverts`, 'success')
                  }}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
                    background:'rgba(108,99,255,.12)', border:'1px solid rgba(108,99,255,.3)', color:'var(--accent)',
                    fontSize:'.75rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  <ExternalLink size={13} /> Ouvrir tous ({airlines.length})
                </button>
              )}
            </div>

            {airlines.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 20px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:12 }}>
                <AlertCircle size={32} color="var(--yellow)" style={{ marginBottom:10, opacity:.7 }} />
                <div style={{ fontSize:'.85rem', fontWeight:600, color:'var(--text)', marginBottom:4 }}>Aucune compagnie listée</div>
                <p style={{ fontSize:'.75rem', color:'var(--muted)' }}>
                  Utilisez les comparateurs ci-dessus — ils couvrent toutes les compagnies, y compris low-cost.
                </p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
                {airlines.map(airline => (
                  <AirlineCard
                    key={airline.id}
                    airline={airline}
                    searchParams={searchParams}
                    onCreateResa={a => setBookingAirline(a)}
                  />
                ))}
              </div>
            )}
          </div>

          <p style={{ marginTop:8, textAlign:'center', fontSize:'.68rem', color:'var(--muted)' }}>
            Tarifs et disponibilités affichés en temps réel sur chaque site. Rihla ne stocke pas de données de prix.
          </p>
        </div>
      )}

      {/* Quick airport reference */}
      {!searched && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:18 }}>
          <div style={{ fontSize:'.8rem', fontWeight:700, color:'var(--text)', marginBottom:12 }}>
            ✈️ Aéroports — {countryInfo?.label || 'Maroc'}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:8 }}>
            {homeAirports.map(a => (
              <button key={a.code} onClick={() => setFrom(a)}
                style={{ textAlign:'left', padding:'10px 12px', borderRadius:8, background:'var(--bg2)', border:'1px solid var(--border)', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)' }}>
                <div style={{ fontFamily:'monospace', fontSize:'.82rem', fontWeight:800, color:'var(--accent)' }}>{a.code}</div>
                <div style={{ fontSize:'.75rem', color:'var(--text)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.ville}</div>
                <div style={{ fontSize:'.68rem', color:'var(--muted)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.nom}</div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export const RechercheVolsPage = () => (
  <RechercheShell><RechercheVolsPageInner /></RechercheShell>
)
