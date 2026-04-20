import { Router } from 'express'
import { z } from 'zod'
import {
  createBatch,
  listBatches,
  getBatch,
  getIncomingBatches,
} from '../controllers/batch.controller.js'
import { authMiddleware }   from '../middleware/auth.middleware.js'
import { requireRole }      from '../middleware/role.middleware.js'
import { validateBody }     from '../middleware/validate.middleware.js'

const router = Router()

const createBatchSchema = z.object({
  medicineName: z.string().min(2, 'Medicine name too short').max(100),
  batchNumber:  z.string().min(2, 'Batch number too short').max(50),
  expiryDate:   z.string().datetime({ message: 'Invalid expiry date format (use ISO 8601)' }),
  totalStrips:  z
    .number()
    .int()
    .min(1, 'Must have at least 1 strip')
    .max(10000, 'Cannot exceed 10,000 strips'),
})

// All batch routes require authentication
router.use(authMiddleware)

// POST /api/batch/create — MANUFACTURER only
router.post(
  '/create',
  requireRole('MANUFACTURER'),
  validateBody(createBatchSchema),
  createBatch
)

// GET /api/batch/list — MANUFACTURER only
router.get('/list', requireRole('MANUFACTURER'), listBatches)

// GET /api/batch/incoming — DISTRIBUTOR or PHARMACY
router.get(
  '/incoming',
  requireRole('DISTRIBUTOR', 'PHARMACY'),
  getIncomingBatches
)

// GET /api/batch/:batchId — any authenticated role
router.get('/:batchId', getBatch)

export default router
