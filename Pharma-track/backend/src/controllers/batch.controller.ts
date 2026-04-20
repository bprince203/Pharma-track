import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { batches, strips, supplyChainEvents } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import { success } from '../utils/response.js'
import { NotFoundError, BadRequestError } from '../utils/errors.js'
import { registerBatchOnChain, registerStripOnChain } from '../services/blockchain.service.js'
import { generateBatchQR, generateStripQR, dataURLToBuffer } from '../services/qr.service.js'
import { uploadToIPFS } from '../services/ipfs.service.js'
import { TABLETS_PER_STRIP, EVENT_TYPES, BATCH_STATUS } from '../utils/constants.js'

interface CreateBatchBody {
  medicineName: string
  batchNumber:  string
  expiryDate:   string
  totalStrips:  number
}

export const createBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actor = req.actor!
    const { medicineName, batchNumber, expiryDate, totalStrips } =
      req.validatedBody as CreateBatchBody

    const parsedExpiry = new Date(expiryDate)
    if (parsedExpiry <= new Date()) {
      throw new BadRequestError('Expiry date must be in the future')
    }

    const { batchOnChainId, txHash } = await registerBatchOnChain({
      batchNumber,
      medicineName,
      expiryDate: parsedExpiry,
      totalStrips,
    })

    const batchQrDataUrl = await generateBatchQR(batchOnChainId)
    const batchQrBuffer  = dataURLToBuffer(batchQrDataUrl)
    const batchQrUrl     = await uploadToIPFS(
      batchQrBuffer,
      `batch-${batchOnChainId}.png`
    )

    const [newBatch] = await db
      .insert(batches)
      .values({
        onChainId:       batchOnChainId,
        medicineName,
        batchNumber,
        manufactureDate: new Date(),
        expiryDate:      parsedExpiry,
        totalStrips,
        status:          BATCH_STATUS.MANUFACTURED,
        qrImageUrl:      batchQrUrl,
        txHash,
        manufacturerId:  actor.id,
      })
      .returning()

    if (!newBatch) throw new Error('Failed to insert batch')

    const stripQrUrls: string[] = []

    for (let i = 1; i <= totalStrips; i++) {
      const { stripOnChainId, txHash: stripTxHash } = await registerStripOnChain({
        batchOnChainId,
        stripNumber:  i,
        tabletsTotal: TABLETS_PER_STRIP,
      })

      const stripQrDataUrl = await generateStripQR(stripOnChainId)
      const stripQrBuffer  = dataURLToBuffer(stripQrDataUrl)
      const stripQrUrl     = await uploadToIPFS(
        stripQrBuffer,
        `strip-${stripOnChainId}.png`
      )
      stripQrUrls.push(stripQrUrl)

      await db.insert(strips).values({
        onChainId:        stripOnChainId,
        stripNumber:      i,
        tabletsTotal:     TABLETS_PER_STRIP,
        tabletsRemaining: TABLETS_PER_STRIP,
        qrImageUrl:       stripQrUrl,
        batchId:          newBatch.id,
      })
    }

    await db.insert(supplyChainEvents).values({
      eventType: EVENT_TYPES.MANUFACTURED,
      actorName: actor.name,
      actorCity: actor.city,
      txHash,
      batchId:   newBatch.id,
      actorId:   actor.id,
    })

    success(
      res,
      {
        batch:       newBatch,
        stripsCount: totalStrips,
        batchQrUrl,
        stripQrUrls,
      },
      'Batch registered successfully',
      201
    )
  } catch (err) {
    next(err)
  }
}

export const listBatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actor = req.actor!

    const allBatches = await db.query.batches.findMany({
      where:   eq(batches.manufacturerId, actor.id),
      with: {
        events: true,
        strips: {
          columns: { id: true, tabletsRemaining: true, isSold: true },
        },
      },
      orderBy: [desc(batches.createdAt)],
    })

    success(res, allBatches)
  } catch (err) {
    next(err)
  }
}

export const getBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { batchId } = req.params

    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId!),
      with: {
        manufacturer: {
          columns: { id: true, name: true, city: true, walletAddress: true },
        },
        strips: {
          orderBy: (s, { asc }) => [asc(s.stripNumber)],
        },
        events: {
          orderBy: (e, { asc }) => [asc(e.timestamp)],
        },
      },
    })

    if (!batch) throw new NotFoundError('Batch')

    success(res, batch)
  } catch (err) {
    next(err)
  }
}

export const getIncomingBatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actor = req.actor!

    const incomingBatches = await db.query.batches.findMany({
      with: {
        manufacturer: {
          columns: { id: true, name: true, city: true },
        },
        events: {
          orderBy: (e, { desc }) => [desc(e.timestamp)],
        },
        strips: {
          columns: { id: true, tabletsRemaining: true },
        },
      },
      orderBy: [desc(batches.createdAt)],
    })

    const filtered = incomingBatches.filter((b) => {
      const lastEvent = b.events[0]
      return lastEvent?.actorId === actor.id
    })

    success(res, filtered)
  } catch (err) {
    next(err)
  }
}
