import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActorRole } from '../lib/api'

interface ActorState {
  // Stored state
  actorId:       string | null
  walletAddress: string | null
  role:          ActorRole | null
  jwtToken:      string | null
  actorName:     string | null
  actorCity:     string | null

  // Actions
  setActor: (actor: {
    id:            string
    walletAddress: string
    role:          ActorRole
    name:          string
    city:          string | null
  }, token: string) => void

  clearActor: () => void
}

export const useAppStore = create<ActorState>()(
  persist(
    (set) => ({
      actorId:       null,
      walletAddress: null,
      role:          null,
      jwtToken:      null,
      actorName:     null,
      actorCity:     null,

      setActor: (actor, token) => {
        // Also store JWT in localStorage for the API client
        localStorage.setItem('pharmatrack_token', token)

        set({
          actorId:       actor.id,
          walletAddress: actor.walletAddress,
          role:          actor.role,
          jwtToken:      token,
          actorName:     actor.name,
          actorCity:     actor.city,
        })
      },

      clearActor: () => {
        localStorage.removeItem('pharmatrack_token')
        set({
          actorId:       null,
          walletAddress: null,
          role:          null,
          jwtToken:      null,
          actorName:     null,
          actorCity:     null,
        })
      },
    }),
    {
      name: 'pharmatrack_store',
      partialize: (state) => ({
        actorId:       state.actorId,
        walletAddress: state.walletAddress,
        role:          state.role,
        jwtToken:      state.jwtToken,
        actorName:     state.actorName,
        actorCity:     state.actorCity,
      }),
    }
  )
)

// ─── Computed selectors ───────────────────────────────────────────────────────

export const useIsAuthenticated = () =>
  useAppStore((s) => s.jwtToken !== null && s.actorId !== null)

export const useRole = () =>
  useAppStore((s) => s.role)

export const useActorName = () =>
  useAppStore((s) => s.actorName)
