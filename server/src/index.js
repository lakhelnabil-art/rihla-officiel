import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { config, isProduction } from './config.js'
import authRoutes from './routes/auth.js'
import agencyRoutes from './routes/agencies.js'
import dataRoutes from './routes/data.js'
import platformRoutes from './routes/platform.js'
import mailRoutes from './routes/mail.js'
import usersRoutes from './routes/users.js'
import searchRoutes from './routes/search.js'
import gdsRoutes from './routes/gds.js'
import { scheduleBackup } from './backup.js'

const app = express()

const corsOrigins = config.corsOrigin.split(',').map(s => s.trim()).filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (corsOrigins.includes(origin)) return true
  if (!isProduction()) {
    return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin)
  }
  return false
}

app.use(cors({
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  credentials: true,
}))
app.use(express.json({ limit: '15mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'rihla-api',
    env: config.nodeEnv,
    smtp: Boolean(config.smtp.host),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/agencies', agencyRoutes)
app.use('/api/data', dataRoutes)
app.use('/api/platform', platformRoutes)
app.use('/api/mail', mailRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/gds', gdsRoutes)

if (isProduction() && fs.existsSync(config.staticDir)) {
  app.use(express.static(config.staticDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(config.staticDir, 'index.html'))
  })
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erreur serveur interne' })
})

const lanAddresses = () => {
  const addrs = []
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.family === 'IPv4' && !net.internal) addrs.push(net.address)
    }
  }
  return addrs
}

scheduleBackup()

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Rihla → http://localhost:${config.port} (${config.nodeEnv})`)
  if (isProduction() && fs.existsSync(config.staticDir)) {
    console.log(`Application → http://localhost:${config.port}`)
  }
  lanAddresses().forEach(ip => {
    console.log(`Réseau local (Wi‑Fi) → http://${ip}:${config.port}`)
  })
})
