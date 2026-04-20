import 'dotenv/config'

const required = (key: string): string => {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

const optional = (key: string, fallback = ''): string => {
  return process.env[key] ?? fallback
}

export const config = {
  nodeEnv:          process.env.NODE_ENV ?? 'development',
  port:             parseInt(process.env.PORT ?? '5000', 10),
  databaseUrl:      required('DATABASE_URL'),
  jwtSecret:        required('JWT_SECRET'),
  jwtExpiresIn:     process.env.JWT_EXPIRES_IN ?? '7d',
  contractAddress:  required('CONTRACT_ADDRESS'),
  privateKey:       required('PRIVATE_KEY'),
  polygonRpc:       required('POLYGON_RPC'),
  polygonWsRpc:     optional('POLYGON_WS_RPC'),
  upstashRedisUrl:  required('UPSTASH_REDIS_URL'),
  upstashToken:     required('UPSTASH_REDIS_TOKEN'),
  web3StorageToken: optional('WEB3_STORAGE_TOKEN'),
  frontendUrl:      optional('FRONTEND_URL', 'http://localhost:5173'),
  adminSecret:      optional('ADMIN_SECRET', 'veri-med-admin-secret-change-me'),
  adminWallet:      optional('ADMIN_WALLET'),
  isDev:            process.env.NODE_ENV !== 'production',
} as const

export type Config = typeof config
