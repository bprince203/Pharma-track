import cron from 'node-cron'
import { db } from '../db/index.js'
import { batches } from '../db/schema.js'
import { and, eq, lt } from 'drizzle-orm'


export const startExpiryJob = (): void => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[CRON] Running expiry check...')

      const result = await db
        .update(batches)
        .set({ isExpired: true })
        .where(
          and(
            eq(batches.isExpired, false),
            lt(batches.expiryDate, new Date())
          )
        )
        .returning({ id: batches.id })

      if (result.length > 0) {
        console.log(`[CRON] Flagged ${result.length} expired batch(es):`, result.map((r) => r.id))
      } else {
        console.log('[CRON] No new expired batches found.')
      }
    } catch (err) {
      console.error('[CRON] Expiry job failed:', err)
    }
  })

  console.log('[CRON] Expiry job scheduled — runs every hour')
}
