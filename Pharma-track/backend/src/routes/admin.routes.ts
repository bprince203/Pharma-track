import { Router } from 'express'
import { z } from 'zod'
import { registerActor, listActors } from '../controllers/admin.controller.js'
import { validateBody } from '../middleware/validate.middleware.js'

const router = Router()

const registerActorSchema = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
  role:          z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY']),
  name:          z.string().min(2).max(100),
  licenseNumber: z.string().max(50).optional(),
  city:          z.string().max(100).optional(),
  adminSecret:   z.string().min(1, 'Admin secret is required'),
})

// POST /api/admin/register-actor
router.post('/register-actor', validateBody(registerActorSchema), registerActor)

// GET /api/admin/actors?adminSecret=xxx
router.get('/actors', listActors)

export default router
