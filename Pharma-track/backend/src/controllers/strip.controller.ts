import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/index.js'
import { strips } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { success } from '../utils/response.js'
import { NotFoundError } from '../utils/errors.js'

export const getStrip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { stripId } = req.params

    const strip = await db.query.strips.findFirst({
      where: eq(strips.id, stripId!),
      with: {
        batch: {
          columns: {
            id:           true,
            medicineName: true,
            batchNumber:  true,
            expiryDate:   true,
            isExpired:    true,
            isFlagged:    true,
          },
        },
      },
    })

    if (!strip) throw new NotFoundError('Strip')

    success(res, strip)
  } catch (err) {
    next(err)
  }
}

export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actor = req.actor!

    const allStrips = await db.query.strips.findMany({
      where: and(
        eq(strips.isSold, false)
      ),
      with: {
        batch: {
          columns: {
            id:           true,
            medicineName: true,
            batchNumber:  true,
            expiryDate:   true,
            isExpired:    true,
            status:       true,
          },
          with: {
            events: {
              orderBy: (e, { desc }) => [desc(e.timestamp)],
            },
          },
        },
      },
    })

    const inventory = allStrips.filter((s) => {
      const lastEvent = s.batch?.events?.[0]
      return lastEvent?.actorId === actor.id
    })

    success(res, inventory)
  } catch (err) {
    next(err)
  }
}
