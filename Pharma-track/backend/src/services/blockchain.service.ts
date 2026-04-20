import { ethers } from 'ethers'
import { contract, sendTransaction, getEventArgs } from '../lib/contract.js'
import { BlockchainError } from '../utils/errors.js'

export interface RegisterBatchInput {
  batchNumber:  string
  medicineName: string
  expiryDate:   Date
  totalStrips:  number
}

export interface RegisterBatchOutput {
  batchOnChainId: string
  txHash:         string
}

export const registerBatchOnChain = async (
  input: RegisterBatchInput
): Promise<RegisterBatchOutput> => {
  try {
    const batchOnChainId = ethers.id(input.batchNumber)
    const expiryUnix    = Math.floor(input.expiryDate.getTime() / 1000)

    const receipt = await sendTransaction(
      contract.registerBatch(
        batchOnChainId,
        input.medicineName,
        expiryUnix,
        input.totalStrips
      ) as Promise<ethers.ContractTransactionResponse>
    )

    return { batchOnChainId, txHash: receipt.hash }
  } catch (err) {
    throw new BlockchainError(`registerBatch failed: ${(err as Error).message}`)
  }
}

export interface RegisterStripInput {
  batchOnChainId: string
  stripNumber:    number
  tabletsTotal:   number
}

export interface RegisterStripOutput {
  stripOnChainId: string
  txHash:         string
}

export const registerStripOnChain = async (
  input: RegisterStripInput
): Promise<RegisterStripOutput> => {
  try {
    const stripOnChainId = ethers.id(
      `${input.batchOnChainId}-strip-${input.stripNumber}`
    )

    const receipt = await sendTransaction(
      contract.registerStrip(
        stripOnChainId,
        input.batchOnChainId,
        input.stripNumber,
        input.tabletsTotal
      ) as Promise<ethers.ContractTransactionResponse>
    )

    return { stripOnChainId, txHash: receipt.hash }
  } catch (err) {
    throw new BlockchainError(`registerStrip failed: ${(err as Error).message}`)
  }
}

export const transferToDistributorOnChain = async (
  batchOnChainId:     string,
  distributorAddress: string
): Promise<string> => {
  try {
    const receipt = await sendTransaction(
      contract.transferToDistributor(
        batchOnChainId,
        distributorAddress
      ) as Promise<ethers.ContractTransactionResponse>
    )
    return receipt.hash
  } catch (err) {
    throw new BlockchainError(`transferToDistributor failed: ${(err as Error).message}`)
  }
}

export const transferToPharmacyOnChain = async (
  batchOnChainId:  string,
  pharmacyAddress: string
): Promise<string> => {
  try {
    const receipt = await sendTransaction(
      contract.transferToPharmacy(
        batchOnChainId,
        pharmacyAddress
      ) as Promise<ethers.ContractTransactionResponse>
    )
    return receipt.hash
  } catch (err) {
    throw new BlockchainError(`transferToPharmacy failed: ${(err as Error).message}`)
  }
}

export interface GenerateSaleTokenOutput {
  tokenOnChainId: string
  txHash:         string
}

export const generateSaleTokenOnChain = async (
  stripOnChainId: string,
  tabletsSold:    number
): Promise<GenerateSaleTokenOutput> => {
  try {
    const receipt = await sendTransaction(
      contract.generateSaleToken(
        stripOnChainId,
        tabletsSold
      ) as Promise<ethers.ContractTransactionResponse>
    )

    const args = getEventArgs(receipt, 'SaleTokenCreated')
    if (!args) {
      throw new BlockchainError('SaleTokenCreated event not found in receipt')
    }

    const tokenOnChainId = args[0] as string
    return { tokenOnChainId, txHash: receipt.hash }
  } catch (err) {
    if (err instanceof BlockchainError) throw err
    throw new BlockchainError(`generateSaleToken failed: ${(err as Error).message}`)
  }
}

export interface OnChainVerifyResult {
  saleToken: {
    tokenId:     string
    stripId:     string
    pharmacy:    string
    tabletsSold: number
    timestamp:   number
  }
  strip: {
    stripId:          string
    batchId:          string
    stripNumber:      number
    tabletsTotal:     number
    tabletsRemaining: number
  }
  batch: {
    batchId:         string
    medicineName:    string
    manufacturer:    string
    manufactureDate: number
    expiryDate:      number
    totalStrips:     number
    isActive:        boolean
  }
}

export const verifyTokenOnChain = async (
  tokenOnChainId: string
): Promise<OnChainVerifyResult | null> => {
  try {
    const [saleToken, strip, batch] = await contract.verifyToken(tokenOnChainId) as [
      [string, string, string, bigint, bigint],
      [string, string, bigint, bigint, bigint],
      [string, string, string, bigint, bigint, bigint, boolean]
    ]

    return {
      saleToken: {
        tokenId:     saleToken[0] as string,
        stripId:     saleToken[1] as string,
        pharmacy:    saleToken[2] as string,
        tabletsSold: Number(saleToken[3]),
        timestamp:   Number(saleToken[4]),
      },
      strip: {
        stripId:          strip[0] as string,
        batchId:          strip[1] as string,
        stripNumber:      Number(strip[2]),
        tabletsTotal:     Number(strip[3]),
        tabletsRemaining: Number(strip[4]),
      },
      batch: {
        batchId:         batch[0] as string,
        medicineName:    batch[1] as string,
        manufacturer:    batch[2] as string,
        manufactureDate: Number(batch[3]),
        expiryDate:      Number(batch[4]),
        totalStrips:     Number(batch[5]),
        isActive:        batch[6] as boolean,
      },
    }
  } catch {
    return null
  }
}
