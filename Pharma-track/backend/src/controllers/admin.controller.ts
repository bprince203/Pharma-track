import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { actors } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { success } from '../utils/response.js'
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js'
import { config } from '../utils/config.js'

interface RegisterActorBody {
  walletAddress: string
  role:          'MANUFACTURER' | 'DISTRIBUTOR' | 'PHARMACY'
  name:          string
  licenseNumber?: string
  city?:         string
  adminSecret:   string
}

export const registerActor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.validatedBody as RegisterActorBody

    if (body.adminSecret !== config.adminSecret) {
      throw new UnauthorizedError('Invalid admin secret')
    }

    const existing = await db.query.actors.findFirst({
      where: eq(actors.walletAddress, body.walletAddress.toLowerCase()),
    })

    if (existing) {
      throw new ConflictError('Wallet address already registered')
    }

    const [newActor] = await db
      .insert(actors)
      .values({
        walletAddress: body.walletAddress.toLowerCase(),
        role:          body.role,
        name:          body.name,
        licenseNumber: body.licenseNumber ?? null,
        city:          body.city ?? null,
        isVerified:    true,
      })
      .returning()

    success(res, newActor, 'Actor registered successfully', 201)
  } catch (err) {
    next(err)
  }
}

export const listActors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adminSecret } = req.query
    if (adminSecret !== config.adminSecret) {
      throw new UnauthorizedError('Invalid admin secret')
    }

    const allActors = await db.query.actors.findMany({
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    })

    success(res, allActors)
  } catch (err) {
    next(err)
  }
}
