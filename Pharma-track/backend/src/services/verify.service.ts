import { db } from '../db/index.js'
import { batches, strips, saleTokens, supplyChainEvents } from '../db/schema.js'
import { eq, asc } from 'drizzle-orm'
import { verifyTokenOnChain } from './blockchain.service.js'
import { getCachedVerification, setCachedVerification } from './cache.service.js'
import { VERDICT } from '../utils/constants.js'
import type { VerifyResult } from '../types/batch.types.js'

export const verifyToken = async (tokenId: string): Promise<VerifyResult> => {

  const cached = await getCachedVerification(tokenId)
  if (cached) {
    return { ...cached, cached: true }
  }

  const onChainData = await verifyTokenOnChain(tokenId)

  if (!onChainData) {
    const result: VerifyResult = {
      verdict: VERDICT.UNREGISTERED,
      batch:   null,
      strip:   null,
      events:  [],
      txHash:  null,
    }
    await setCachedVerification(tokenId, result)
    return result
  }

  const saleToken = await db.query.saleTokens.findFirst({
    where: eq(saleTokens.onChainId, tokenId),
    with: {
      strip: {
        with: {
          batch: {
            with: {
              manufacturer: true,
              events: {
                orderBy: [asc(supplyChainEvents.timestamp)],
              },
            },
          },
        },
      },
    },
  })

  let verdict: VerifyResult['verdict'] = VERDICT.AUTHENTIC

  if (saleToken?.strip?.batch) {
    const batch = saleToken.strip.batch

    if (batch.isFlagged) {
      verdict = VERDICT.COUNTERFEIT
    } else if (batch.isExpired || new Date(batch.expiryDate) < new Date()) {
      verdict = VERDICT.EXPIRED
    }
  } else {
    verdict = VERDICT.AUTHENTIC
  }

  const result: VerifyResult = {
    verdict,
    batch: saleToken?.strip?.batch
      ? {
          medicineName:    saleToken.strip.batch.medicineName,
          batchNumber:     saleToken.strip.batch.batchNumber,
          manufacturer:    saleToken.strip.batch.manufacturer?.name ?? 'Unknown',
          manufactureDate: saleToken.strip.batch.manufactureDate.toISOString(),
          expiryDate:      saleToken.strip.batch.expiryDate.toISOString(),
        }
      : {
          medicineName:    onChainData.batch.medicineName,
          batchNumber:     onChainData.batch.batchId,
          manufacturer:    onChainData.batch.manufacturer,
          manufactureDate: new Date(onChainData.batch.manufactureDate * 1000).toISOString(),
          expiryDate:      new Date(onChainData.batch.expiryDate * 1000).toISOString(),
        },
    strip: {
      stripNumber:  onChainData.strip.stripNumber,
      tabletsSold:  onChainData.saleToken.tabletsSold,
      tabletsTotal: onChainData.strip.tabletsTotal,
    },
    events: (saleToken?.strip?.batch?.events ?? []).map((e) => ({
      id:        e.id,
      eventType: e.eventType as VerifyResult['events'][0]['eventType'],
      actorName: e.actorName,
      actorCity: e.actorCity,
      txHash:    e.txHash,
      batchId:   e.batchId,
      actorId:   e.actorId,
      timestamp: e.timestamp,
    })),
    txHash: saleToken?.txHash ?? null,
  }

  await setCachedVerification(tokenId, result)
  return result
}
