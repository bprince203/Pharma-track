import { useState, useCallback } from 'react'
import { verifyApi, type VerifyResult } from '../lib/api'

export function useVerify() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VerifyResult | null>(null)

  const verify = useCallback(async (tokenId: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const raw = await verifyApi.verifyToken(tokenId)
      // Normalise: derive isGenuine and tabletsSold
      const data: VerifyResult = {
        ...raw,
        isGenuine:   raw.verdict === 'AUTHENTIC',
        tabletsSold: raw.strip?.tabletsSold ?? null,
      }
      setResult(data)
      return data
    } catch (err) {
      const message = (err as Error).message || 'Verification failed'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reportCounterfeit = useCallback(async (reportedQR: string, city?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await verifyApi.reportCounterfeit(reportedQR, city)
      return data
    } catch (err) {
      const message = (err as Error).message || 'Report failed'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setResult(null)
  }, [])

  return {
    verify,
    reportCounterfeit,
    reset,
    isLoading,
    error,
    result,
  }
}
