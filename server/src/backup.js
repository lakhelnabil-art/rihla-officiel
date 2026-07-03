import fs from 'fs'
import path from 'path'
import { config, isProduction } from './config.js'

const BACKUP_DIR = path.join(path.dirname(config.dbPath), 'backups')
const MAX_BACKUPS = 7

function runBackup() {
  if (!fs.existsSync(config.dbPath)) {
    console.log('[backup] Base de données introuvable, sauvegarde ignorée.')
    return
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true })

  const date = new Date().toISOString().slice(0, 10)
  const dest = path.join(BACKUP_DIR, `rihla-${date}.db`)
  fs.copyFileSync(config.dbPath, dest)
  console.log(`[backup] ✓ Sauvegarde créée : ${dest}`)

  // Garder uniquement les MAX_BACKUPS plus récentes
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('rihla-') && f.endsWith('.db'))
    .sort()

  if (files.length > MAX_BACKUPS) {
    const toDelete = files.slice(0, files.length - MAX_BACKUPS)
    for (const f of toDelete) {
      fs.unlinkSync(path.join(BACKUP_DIR, f))
      console.log(`[backup] Ancienne sauvegarde supprimée : ${f}`)
    }
  }
}

export function scheduleBackup() {
  if (!isProduction()) return

  // Première sauvegarde 1 minute après le démarrage
  setTimeout(() => {
    runBackup()
    // Puis toutes les 24h
    setInterval(runBackup, 24 * 60 * 60 * 1000)
  }, 60 * 1000)

  console.log('[backup] Sauvegarde automatique planifiée (toutes les 24h, 7 versions conservées)')
}
