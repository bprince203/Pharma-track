import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { counterfeitReports, batches } from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'
import { success } from '../utils/response.js'
import { verifyToken } from '../services/verify.service.js'
import { invalidateBatchCache } from '../services/cache.service.js'
import { COUNTERFEIT_REPORT_THRESHOLD } from '../utils/constants.js'

export const verifyMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tokenId } = req.params
    const result = await verifyToken(tokenId!)
    success(res, result)
  } catch (err) {
    next(err)
  }
}

interface ReportBody {
  reportedQR: string
  city?:      string
}

export const createReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reportedQR, city } = req.validatedBody as ReportBody
    const reporterIP = req.ip ?? 'unknown'

    let batchId: string | null = null
    const matchingBatch = await db.query.batches.findFirst({
      where: eq(batches.onChainId, reportedQR),
    })
    if (matchingBatch) batchId = matchingBatch.id

    const [report] = await db
      .insert(counterfeitReports)
      .values({ reportedQR, reporterIP, city, batchId: batchId ?? undefined })
      .returning()

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(counterfeitReports)
      .where(eq(counterfeitReports.reportedQR, reportedQR))

    const reportCount = Number(countResult[0]?.count ?? 0)

    let batchFlagged = false
    if (batchId && reportCount >= COUNTERFEIT_REPORT_THRESHOLD) {
      await db
        .update(batches)
        .set({ isFlagged: true })
        .where(eq(batches.id, batchId))

      await invalidateBatchCache(batchId)
      batchFlagged = true
    }

    success(
      res,
      { report, reportCount, batchFlagged },
      batchFlagged
        ? 'Report submitted. This batch has been flagged system-wide.'
        : 'Report submitted. Thank you.',
      201
    )
  } catch (err) {
    next(err)
  }
}
