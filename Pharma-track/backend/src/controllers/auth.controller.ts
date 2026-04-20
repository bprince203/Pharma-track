import type { Request, Response, NextFunction } from 'express'
import { ethers } from 'ethers'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { actors, authNonces } from '../db/schema.js'
import { eq, lt } from 'drizzle-orm'
import { config } from '../utils/config.js'
import { createId } from '@paralleldrive/cuid2'
import { success } from '../utils/response.js'
import { UnauthorizedError, NotFoundError } from '../utils/errors.js'

export const getNonce = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { walletAddress } = req.params
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new UnauthorizedError('Invalid wallet address')
    }

    await db.delete(authNonces).where(eq(authNonces.walletAddress, walletAddress.toLowerCase()))

    const nonce     = createId()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.insert(authNonces).values({
      walletAddress: walletAddress.toLowerCase(),
      nonce,
      expiresAt,
    })

    success(res, { nonce, expiresAt: expiresAt.toISOString() })
  } catch (err) {
    next(err)
  }
}

export const verifySignature = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { walletAddress, signature } = req.validatedBody as {
      walletAddress: string
      signature:     string
    }

    const lowerWallet = walletAddress.toLowerCase()

    const nonceRecord = await db.query.authNonces.findFirst({
      where: eq(authNonces.walletAddress, lowerWallet),
    })

    if (!nonceRecord) {
      throw new UnauthorizedError('No nonce found — request a new one')
    }

    if (new Date() > nonceRecord.expiresAt) {
      await db.delete(authNonces).where(eq(authNonces.id, nonceRecord.id))
      throw new UnauthorizedError('Nonce expired — request a new one')
    }

    const message = `Sign in to Veri-Med\nNonce: ${nonceRecord.nonce}`

    const recoveredAddress = ethers.verifyMessage(message, signature)

    if (recoveredAddress.toLowerCase() !== lowerWallet) {
      throw new UnauthorizedError('Signature verification failed')
    }

    await db.delete(authNonces).where(eq(authNonces.id, nonceRecord.id))

    const actor = await db.query.actors.findFirst({
      where: eq(actors.walletAddress, lowerWallet),
    })

    if (!actor) {
      throw new NotFoundError('Wallet not registered — contact admin to register your wallet')
    }

    const token = jwt.sign(
      { actorId: actor.id, role: actor.role, walletAddress: actor.walletAddress },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    )

    success(res, { actor, token })
  } catch (err) {
    next(err)
  }
}
