import { ACTOR_ROLES } from '../utils/constants.js'

export type ActorRole = typeof ACTOR_ROLES[keyof typeof ACTOR_ROLES]

export interface Actor {
  id:            string
  walletAddress: string
  role:          ActorRole
  name:          string
  licenseNumber: string | null
  city:          string | null
  isVerified:    boolean
  createdAt:     Date
}

export interface JwtPayload {
  actorId:       string
  walletAddress: string
  role:          ActorRole
  iat?:          number
  exp?:          number
}
