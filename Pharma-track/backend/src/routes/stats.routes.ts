import { Router } from 'express'
import { getGlobalStats } from '../controllers/stats.controller.js'

const router = Router()

// GET /api/stats/global — public, no auth
router.get('/global', getGlobalStats)

export default router
