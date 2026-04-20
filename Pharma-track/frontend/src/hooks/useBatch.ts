import { useState, useCallback, useEffect } from 'react'
import {
  batchApi,
  transferApi,
  type BatchWithDetails,
  type BatchCreateResponse,
  type CreateBatchInput,
  type TransferResponse,
} from '../lib/api'
import toast from 'react-hot-toast'

export function useBatch() {
  const [batches, setBatches]    = useState<BatchWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]        = useState<string | null>(null)

  // ─── Fetch batches ──────────────────────────────────────────────────────────

  const fetchBatches = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await batchApi.list()
      setBatches(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchIncoming = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await batchApi.getIncoming()
      setBatches(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ─── Create batch ──────────────────────────────────────────────────────────

  const createBatch = useCallback(async (input: CreateBatchInput): Promise<BatchCreateResponse | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await batchApi.create(input)
      toast.success(`Batch ${input.batchNumber} registered on blockchain!`)
      // Refresh list
      await fetchBatches()
      return data
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [fetchBatches])

  // ─── Transfer ───────────────────────────────────────────────────────────────

  const transferToDistributor = useCallback(async (
    batchId: string,
    distributorWallet: string
  ): Promise<TransferResponse | null> => {
    setIsLoading(true)
    try {
      const data = await transferApi.toDistributor(batchId, distributorWallet)
      toast.success('Batch transferred to distributor!')
      await fetchBatches()
      return data
    } catch (err) {
      toast.error((err as Error).message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [fetchBatches])

  const transferToPharmacy = useCallback(async (
    batchId: string,
    pharmacyWallet: string
  ): Promise<TransferResponse | null> => {
    setIsLoading(true)
    try {
      const data = await transferApi.toPharmacy(batchId, pharmacyWallet)
      toast.success('Batch transferred to pharmacy!')
      return data
    } catch (err) {
      toast.error((err as Error).message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const confirmReceipt = useCallback(async (batchId: string) => {
    setIsLoading(true)
    try {
      const data = await transferApi.confirmReceipt(batchId)
      toast.success('Receipt confirmed!')
      return data
    } catch (err) {
      toast.error((err as Error).message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    batches,
    isLoading,
    error,
    fetchBatches,
    fetchIncoming,
    createBatch,
    transferToDistributor,
    transferToPharmacy,
    confirmReceipt,
  }
}
