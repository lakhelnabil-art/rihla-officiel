/**
 * Crée le compte démo Essaouira (idempotent).
 * Usage: npm run seed:demo --prefix server
 */
import bcrypt from 'bcryptjs'
import { db, uid } from '../db.js'
import { seedAgencyFromTemplate } from '../seed.js'

const DEMO_EMAIL = 'demo.essaouira@rihla.ma'
const DEMO_PASSWORD = 'Rihla2026!'
const AGENCY_NAME = 'Bab Annaser Voyages'
const TEMPLATE_ID = 'bab-annaser'

const config = {
  ville: 'Essaouira',
  pays: 'Maroc',
  paysCode: 'MA',
  adresse: 'Rue Okba Ibn Nafiaa, Essaouira 44000',
  telephone: '+212 524 47 00 00',
  email: 'contact@babannaser.ma',
  siteWeb: 'https://babannaser.ma',
  iceNumber: 'ICE-001234567890123',
}

const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL)

if (existingUser) {
  const agencies = db.prepare(`
    SELECT a.id, a.nom FROM agencies a
    JOIN user_agencies ua ON ua.agency_id = a.id
    WHERE ua.user_id = ? AND a.template_id = ?
  `).all(existingUser.id, TEMPLATE_ID)

  console.log('')
  console.log('  ✓ Compte démo déjà présent')
  console.log(`    Email    : ${DEMO_EMAIL}`)
  console.log(`    Password : ${DEMO_PASSWORD}`)
  if (agencies.length) {
    agencies.forEach(a => console.log(`    Agence   : ${a.nom} (${a.id})`))
  }
  console.log('')
  process.exit(0)
}

const hash = await bcrypt.hash(DEMO_PASSWORD, 10)
const userId = uid()
const agencyId = `ag-demo-essaouira`
const now = new Date().toISOString()

const tx = db.transaction(() => {
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, DEMO_EMAIL, hash, 'Admin Essaouira', now)

  db.prepare(`
    INSERT INTO agencies (id, nom, logo, is_configured, created_at, template_id, ville, is_reference)
    VALUES (?, ?, NULL, 1, ?, ?, ?, 1)
  `).run(agencyId, AGENCY_NAME, now, TEMPLATE_ID, config.ville)

  db.prepare(`
    INSERT INTO user_agencies (user_id, agency_id, role)
    VALUES (?, ?, 'admin')
  `).run(userId, agencyId)
})

tx()
seedAgencyFromTemplate(agencyId, TEMPLATE_ID, AGENCY_NAME, config)

console.log('')
console.log('  ✓ Compte démo Essaouira créé')
console.log(`    Email    : ${DEMO_EMAIL}`)
console.log(`    Password : ${DEMO_PASSWORD}`)
console.log(`    Agence   : ${AGENCY_NAME} (modèle ${TEMPLATE_ID})`)
console.log('    URL      : http://localhost:3001')
console.log('')
