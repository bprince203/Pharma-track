import { ethers, WebSocketProvider, Contract } from 'ethers'
import { ABI } from '../lib/contract.js'
import { config } from '../utils/config.js'
import { db } from '../db/index.js'
import { batches, strips, saleTokens } from '../db/schema.js'
import { eq } from 'drizzle-orm'

let wsContract: Contract | null = null

export const startBlockchainListener = (): void => {
  const rpcUrl = config.polygonWsRpc || config.polygonRpc

  let provider: ethers.Provider

  if (rpcUrl.startsWith('wss://')) {
    provider = new WebSocketProvider(rpcUrl)
    console.log('[LISTENER] Using WebSocket provider for real-time events')
  } else {
    provider = new ethers.JsonRpcProvider(rpcUrl)
    console.log('[LISTENER] Using JSON-RPC provider (polling) for events')
  }

  wsContract = new Contract(config.contractAddress, ABI, provider)

  console.log('[LISTENER] Starting blockchain event listener...')

  wsContract.on('BatchRegistered', async (batchId: string, manufacturer: string) => {
    try {
      const existing = await db.query.batches.findFirst({
        where: eq(batches.onChainId, batchId),
      })
      if (!existing) {
        console.log(`[LISTENER] BatchRegistered: ${batchId} — no DB record found, logging.`)
      }
    } catch (err) {
      console.error('[LISTENER] BatchRegistered handler failed:', err)
    }
  })

  wsContract.on('SaleTokenCreated', async (tokenId: string, stripId: string, tabletsSold: bigint) => {
    try {
      const existing = await db.query.saleTokens.findFirst({
        where: eq(saleTokens.onChainId, tokenId),
      })
      if (!existing) {
        console.log(`[LISTENER] SaleTokenCreated: ${tokenId} not in DB — recording from event.`)
        const strip = await db.query.strips.findFirst({
          where: eq(strips.onChainId, stripId),
        })
        if (strip) {
          await db.insert(saleTokens).values({
            onChainId:   tokenId,
            tabletsSold: Number(tabletsSold),
            stripId:     strip.id,
            pharmacyId:  strip.batchId,
          })
        }
      }
    } catch (err) {
      console.error('[LISTENER] SaleTokenCreated handler failed:', err)
    }
  })

  wsContract.on('BatchTransferred', async (batchId: string, from: string, to: string, role: string) => {
    try {
      console.log(`[LISTENER] BatchTransferred: ${batchId} → ${to} (${role})`)
    } catch (err) {
      console.error('[LISTENER] BatchTransferred handler failed:', err)
    }
  })

  console.log('[LISTENER] Listening for: BatchRegistered, SaleTokenCreated, BatchTransferred')
}

export const stopBlockchainListener = (): void => {
  if (wsContract) {
    wsContract.removeAllListeners()
    console.log('[LISTENER] All listeners removed.')
  }
}
