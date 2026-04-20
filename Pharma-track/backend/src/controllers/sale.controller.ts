import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { strips, saleTokens, supplyChainEvents, batches } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import { success } from '../utils/response.js'
import { NotFoundError, BadRequestError } from '../utils/errors.js'
import { generateSaleTokenOnChain } from '../services/blockchain.service.js'
import { generateSaleTokenQR, dataURLToBuffer } from '../services/qr.service.js'
import { uploadToIPFS } from '../services/ipfs.service.js'
import { invalidateVerifyCache } from '../services/cache.service.js'
import { EVENT_TYPES, BATCH_STATUS } from '../utils/constants.js'

interface GenerateTokenBody {
  stripId:     string
  tabletsSold: number
}

export const generateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actor = req.actor!
    const { stripId, tabletsSold } = req.validatedBody as GenerateTokenBody

    const strip = await db.query.strips.findFirst({
      where: eq(strips.id, stripId),
      with: { batch: true },
    })
    if (!strip) throw new NotFoundError('Strip')

    if (tabletsSold <= 0) {
      throw new BadRequestError('tabletsSold must be greater than 0')
    }
    if (tabletsSold > strip.tabletsRemaining) {
      throw new BadRequestError(
        `Cannot sell ${tabletsSold} tablets — only ${strip.tabletsRemaining} remaining`
      )
    }

    const { tokenOnChainId, txHash } = await generateSaleTokenOnChain(
      strip.onChainId,
      tabletsSold
    )

    const qrDataUrl = await generateSaleTokenQR(tokenOnChainId)
    const qrBuffer  = dataURLToBuffer(qrDataUrl)
    const qrImageUrl = await uploadToIPFS(
      qrBuffer,
      `token-${tokenOnChainId}.png`
    )

    const [newToken] = await db
      .insert(saleTokens)
      .values({
        onChainId:   tokenOnChainId,
        tabletsSold,
        qrImageUrl,
        txHash,
        stripId:     strip.id,
        pharmacyId:  actor.id,
      })
      .returning()

    const tabletsRemaining = strip.tabletsRemaining - tabletsSold
    const isSold           = tabletsRemaining === 0

    await db
      .update(strips)
      .set({ tabletsRemaining, isSold })
      .where(eq(strips.id, strip.id))

    if (strip.batch) {
      const newStatus = isSold && strip.stripNumber === strip.batch.totalStrips
        ? BATCH_STATUS.FULLY_SOLD
        : BATCH_STATUS.PARTIALLY_SOLD

      await db
        .update(batches)
        .set({ status: newStatus })
        .where(eq(batches.id, strip.batch.id))
    }

    if (strip.batch) {
      await db.insert(supplyChainEvents).values({
        eventType: EVENT_TYPES.SOLD,
        actorName: actor.name,
        actorCity: actor.city,
        txHash,
        batchId:   strip.batch.id,
        actorId:   actor.id,
      })
    }

    await invalidateVerifyCache(tokenOnChainId)

    success(
      res,
      {
        token: newToken,
        qrImageUrl,
        qrDataUrl,
        txHash,
        tabletsRemaining,
        tokenOnChainId,
      },
      'Sale token generated successfully',
      201
    )
  } catch (err) {
    next(err)
  }
}

export const getRecentSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actor = req.actor!

    const recent = await db.query.saleTokens.findMany({
      where: eq(saleTokens.pharmacyId, actor.id),
      with: {
        strip: {
          with: {
            batch: {
              columns: { medicineName: true, batchNumber: true },
            },
          },
        },
      },
      orderBy: [desc(saleTokens.createdAt)],
      limit: 50,
    })

    success(res, recent)
  } catch (err) {
    next(err)
  }
}
