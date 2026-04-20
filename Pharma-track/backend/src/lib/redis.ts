import { Redis } from '@upstash/redis'
import { config } from '../utils/config.js'

export const redis = new Redis({
  url:   config.upstashRedisUrl,
  token: config.upstashToken,
})
