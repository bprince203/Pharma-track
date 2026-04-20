import { Router } from 'express'
import { z } from 'zod'
import { verifyMedicine, createReport } from '../controllers/verify.controller.js'
import { validateBody } from '../middleware/validate.middleware.js'

const router = Router()

const reportSchema = z.object({
  reportedQR: z.string().min(1, 'Reported QR value is required'),
  city:       z.string().optional(),
})

// GET /api/verify/:tokenId — public, no auth
router.get('/:tokenId', verifyMedicine)

// POST /api/verify/report — public, no auth
router.post('/report', validateBody(reportSchema), createReport)

export default router
