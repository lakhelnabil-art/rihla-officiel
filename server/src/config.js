import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '../..')

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'rihla-dev-secret-change-in-production',
  dbPath: process.env.DATABASE_PATH || path.join(__dirname, '../data/rihla.db'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  staticDir: process.env.STATIC_DIR || path.join(rootDir, 'dist'),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@rihla.ma',
  },
}

export const isProduction = () => config.nodeEnv === 'production'
