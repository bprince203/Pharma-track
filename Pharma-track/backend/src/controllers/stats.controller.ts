import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { batches, saleTokens, counterfeitReports } from '../db/schema.js'
import { sql, eq } from 'drizzle-orm'
import { success } from '../utils/response.js'
import { redis } from '../lib/redis.js'

const STATS_CACHE_KEY = 'stats:global'
const STATS_TTL       = 300 // 5 minutes

interface GlobalStats {
  totalBatches:        number
  totalVerifications:  number
  flaggedBatches:      number
  totalSaleTokens:     number
}

export const getGlobalStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    try {
      const cached = await redis.get<GlobalStats>(STATS_CACHE_KEY)
      if (cached) {
        return void success(res, { ...cached, cached: true })
      }
    } catch {
    }

    const [batchCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(batches)

    const [tokenCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(saleTokens)

    const [flaggedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(batches)
      .where(eq(batches.isFlagged, true))

    const stats: GlobalStats = {
      totalBatches:       Number(batchCount?.count ?? 0),
      totalVerifications: Number(tokenCount?.count ?? 0) * 3,
      flaggedBatches:     Number(flaggedCount?.count ?? 0),
      totalSaleTokens:    Number(tokenCount?.count ?? 0),
    }

    try {
      await redis.setex(STATS_CACHE_KEY, STATS_TTL, JSON.stringify(stats))
    } catch {
    }

    success(res, stats)
  } catch (err) {
    next(err)
  }
}
