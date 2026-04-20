import { Router } from 'express'
import { z } from 'zod'
import { getNonce, verifySignature } from '../controllers/auth.controller.js'
import { validateBody } from '../middleware/validate.middleware.js'

const router = Router()

const verifySchema = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
  signature: z.string().min(1, 'Signature is required'),
})

// GET /api/auth/nonce/:walletAddress
router.get('/nonce/:walletAddress', getNonce)

// POST /api/auth/verify
router.post('/verify', validateBody(verifySchema), verifySignature)

export default router
