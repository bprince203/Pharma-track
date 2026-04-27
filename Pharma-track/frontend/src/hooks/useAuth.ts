import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, clearToken } from '../lib/api'
import { useAppStore } from '../store/useAppStore'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const store = useAppStore()

  const signIn = useCallback(async (walletAddress: string, signMessage: (msg: string) => Promise<string>) => {
    setIsLoading(true)
    setError(null)
    try {
      const { nonce } = await authApi.getNonce(walletAddress)
      const message = `Sign this message to verify your identity.\n\nNonce: ${nonce}`
      const signature = await signMessage(message)
      const { actor, token } = await authApi.verifySignature(walletAddress, signature)

      store.setActor({
        id: actor.id,
        walletAddress: actor.walletAddress,
        role: actor.role,
        name: actor.name,
        city: actor.city,
      }, token)

      const rolePath = actor.role.toLowerCase()
      navigate(`/${rolePath}`)
      return actor
    } catch (err) {
      const msg = (err as Error).message
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [navigate, store])

  const signOut = useCallback(() => {
    store.clearActor()
    clearToken()
    localStorage.removeItem('pharmatrack_store')
    navigate('/')
  }, [navigate, store])

  return {
    isAuthenticated: store.jwtToken !== null && store.actorId !== null,
    role: store.role,
    actorName: store.actorName,
    walletAddress: store.walletAddress,
    signIn,
    signOut,
    isLoading,
    error,
  }
}
