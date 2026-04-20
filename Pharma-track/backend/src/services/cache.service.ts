import { redis } from '../lib/redis.js'
import { VERIFY_CACHE_TTL } from '../utils/constants.js'
import type { VerifyResult } from '../types/batch.types.js'

const VERIFY_KEY  = (tokenId: string) => `verify:${tokenId}`
const BATCH_KEY   = (batchId: string) => `batch:${batchId}`

export const getCachedVerification = async (
  tokenId: string
): Promise<VerifyResult | null> => {
  try {
    const cached = await redis.get<VerifyResult>(VERIFY_KEY(tokenId))
    return cached ?? null
  } catch {
    return null
  }
}

export const setCachedVerification = async (
  tokenId: string,
  result: VerifyResult
): Promise<void> => {
  try {
    await redis.setex(VERIFY_KEY(tokenId), VERIFY_CACHE_TTL, JSON.stringify(result))
  } catch (err) {
    console.warn('[CACHE] Failed to set verify cache:', err)
  }
}

export const invalidateVerifyCache = async (tokenId: string): Promise<void> => {
  try {
    await redis.del(VERIFY_KEY(tokenId))
  } catch {
  }
}

export const invalidateBatchCache = async (batchId: string): Promise<void> => {
  try {
    await redis.del(BATCH_KEY(batchId))
  } catch {
  }
}
