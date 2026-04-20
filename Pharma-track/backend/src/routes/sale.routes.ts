import { Router } from 'express'
import { z } from 'zod'
import { generateToken, getRecentSales } from '../controllers/sale.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { requireRole }   from '../middleware/role.middleware.js'
import { validateBody }  from '../middleware/validate.middleware.js'

const router = Router()

const generateTokenSchema = z.object({
  stripId:     z.string().min(1, 'stripId is required'),
  tabletsSold: z
    .number()
    .int()
    .min(1, 'Must sell at least 1 tablet')
    .max(10, 'Cannot sell more than 10 tablets per sale'),
})

router.use(authMiddleware)
router.use(requireRole('PHARMACY'))

// POST /api/sale/generate-token
router.post('/generate-token', validateBody(generateTokenSchema), generateToken)

// GET /api/sale/recent
router.get('/recent', getRecentSales)

export default router
