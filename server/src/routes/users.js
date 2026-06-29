import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, agencyMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware, agencyMiddleware, adminMiddleware)

/** List login accounts linked to the current agency. */
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.email, u.name, u.created_at, ua.role
    FROM user_agencies ua
    JOIN users u ON u.id = ua.user_id
    WHERE ua.agency_id = ?
    ORDER BY u.created_at ASC
  `).all(req.user.agencyId)

  res.json(rows.map(r => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    createdAt: r.created_at,
  })))
})

export default router
