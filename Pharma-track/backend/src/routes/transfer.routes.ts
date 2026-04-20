import { Router } from 'express'
import { z } from 'zod'
import {
  transferToDistributor,
  transferToPharmacy,
  confirmReceipt,
} from '../controllers/transfer.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { requireRole }   from '../middleware/role.middleware.js'
import { validateBody }  from '../middleware/validate.middleware.js'

const router = Router()

const walletSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address')

const toDistributorSchema = z.object({
  batchId:           z.string().min(1),
  distributorWallet: walletSchema,
})

const toPharmacySchema = z.object({
  batchId:        z.string().min(1),
  pharmacyWallet: walletSchema,
})

const confirmReceiptSchema = z.object({
  batchId: z.string().min(1),
})

router.use(authMiddleware)

// POST /api/transfer/to-distributor — MANUFACTURER only
router.post(
  '/to-distributor',
  requireRole('MANUFACTURER'),
  validateBody(toDistributorSchema),
  transferToDistributor
)

// POST /api/transfer/to-pharmacy — DISTRIBUTOR only
router.post(
  '/to-pharmacy',
  requireRole('DISTRIBUTOR'),
  validateBody(toPharmacySchema),
  transferToPharmacy
)

// POST /api/transfer/confirm-receipt — DISTRIBUTOR or PHARMACY
router.post(
  '/confirm-receipt',
  requireRole('DISTRIBUTOR', 'PHARMACY'),
  validateBody(confirmReceiptSchema),
  confirmReceipt
)

export default router
