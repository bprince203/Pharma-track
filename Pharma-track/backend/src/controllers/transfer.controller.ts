import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { batches, strips, supplyChainEvents, actors } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { contract, sendTransaction, getEventArgs } from '../lib/contract.js'
import { ethers } from 'ethers'
import { success } from '../utils/response.js'
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js'

export const transferToDistributor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { batchId, distributorWallet } = req.validatedBody as {
      batchId:           string
      distributorWallet: string
    }

    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId),
      with:  { manufacturer: true },
    })

    if (!batch) throw new NotFoundError('Batch not found')

    const distributor = await db.query.actors.findFirst({
      where: eq(actors.walletAddress, distributorWallet.toLowerCase()),
    })
    if (!distributor || distributor.role !== 'DISTRIBUTOR') {
      throw new BadRequestError('Distributor wallet not registered in Veri-Med')
    }

    const receipt = await sendTransaction(
      contract.transferToDistributor(
        ethers.id(batch.batchNumber),
        distributorWallet
      )
    )

    await db
      .update(batches)
      .set({ status: 'WITH_DISTRIBUTOR' })
      .where(eq(batches.id, batchId))

    const [event] = await db
      .insert(supplyChainEvents)
      .values({
        eventType: 'DISTRIBUTOR_RECEIVED',
        actorName: distributor.name,
        actorCity: distributor.city,
        txHash:    receipt.hash,
        batchId:   batch.id,
        actorId:   distributor.id,
      })
      .returning()

    success(res, { txHash: receipt.hash, supplyChainEvent: event })
  } catch (err) {
    next(err)
  }
}

export const transferToPharmacy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { batchId, pharmacyWallet } = req.validatedBody as {
      batchId:       string
      pharmacyWallet: string
    }

    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId),
    })
    if (!batch) throw new NotFoundError('Batch not found')
    if (batch.status !== 'WITH_DISTRIBUTOR') {
      throw new BadRequestError('Batch must be with a distributor before transferring to pharmacy')
    }

    const pharmacy = await db.query.actors.findFirst({
      where: eq(actors.walletAddress, pharmacyWallet.toLowerCase()),
    })
    if (!pharmacy || pharmacy.role !== 'PHARMACY') {
      throw new BadRequestError('Pharmacy wallet not registered in Veri-Med')
    }

    const receipt = await sendTransaction(
      contract.transferToPharmacy(
        ethers.id(batch.batchNumber),
        pharmacyWallet
      )
    )

    await db
      .update(batches)
      .set({ status: 'WITH_PHARMACY' })
      .where(eq(batches.id, batchId))

    const [event] = await db
      .insert(supplyChainEvents)
      .values({
        eventType: 'PHARMACY_RECEIVED',
        actorName: pharmacy.name,
        actorCity: pharmacy.city,
        txHash:    receipt.hash,
        batchId:   batch.id,
        actorId:   pharmacy.id,
      })
      .returning()

    success(res, { txHash: receipt.hash, supplyChainEvent: event })
  } catch (err) {
    next(err)
  }
}

export const confirmReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { batchId } = req.validatedBody as { batchId: string }

    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId),
    })
    if (!batch) throw new NotFoundError('Batch not found')

    const actor = req.actor!

    const eventType =
      actor.role === 'DISTRIBUTOR' ? 'DISTRIBUTOR_RECEIVED' : 'PHARMACY_RECEIVED'

    const [event] = await db
      .insert(supplyChainEvents)
      .values({
        eventType,
        actorName: actor.name,
        actorCity: actor.city,
        txHash:    null,
        batchId:   batch.id,
        actorId:   actor.id,
      })
      .returning()

    success(res, { eventType, supplyChainEvent: event })
  } catch (err) {
    next(err)
  }
}
