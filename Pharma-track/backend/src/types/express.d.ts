import type { Actor } from './actor.types.js'

declare global {
  namespace Express {
    interface Request {
      actor?: Actor
      validatedBody?: unknown
    }
  }
}

export {}
