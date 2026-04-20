import { Router } from 'express'
import { getStrip, getInventory } from '../controllers/strip.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { requireRole }   from '../middleware/role.middleware.js'

const router = Router()

router.use(authMiddleware)

// GET /api/strip/inventory — PHARMACY only
router.get('/inventory', requireRole('PHARMACY'), getInventory)

// GET /api/strip/:stripId — PHARMACY only
router.get('/:stripId', requireRole('PHARMACY'), getStrip)

export default router
