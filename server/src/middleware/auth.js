import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export const signToken = (payload, expiresIn = '7d') =>
  jwt.sign(payload, config.jwtSecret, { expiresIn })

export const verifyToken = (token) =>
  jwt.verify(token, config.jwtSecret)

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' })
  }
  try {
    req.user = verifyToken(header.slice(7))
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

/** Requires agency-scoped token (type === 'agency'). */
export const agencyMiddleware = (req, res, next) => {
  if (req.user?.type !== 'agency' || !req.user?.agencyId) {
    return res.status(403).json({ error: 'Accès agence requis' })
  }
  next()
}

export const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès administrateur requis' })
  }
  next()
}
