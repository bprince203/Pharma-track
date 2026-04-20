import 'dotenv/config'
import app from './app.js'
import { config } from './utils/config.js'
import { verifyContractConnection } from './lib/contract.js'
import { startBlockchainListener } from './listeners/blockchain.listener.js'
import { startExpiryJob } from './jobs/expiry.job.js'

const PORT = config.port

const server = app.listen(PORT, async () => {
  console.log(`
╔══════════════════════════════════════════╗
║         PharmaTrack Backend Server       ║
╠══════════════════════════════════════════╣
║  Status  : Running                       ║
║  Port    : ${PORT}                            ║
║  Env     : ${config.nodeEnv.padEnd(30)}║
╚══════════════════════════════════════════╝
  `)


  await verifyContractConnection()


  startBlockchainListener()


  startExpiryJob()
})


const shutdown = (signal: string) => {
  console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`)
  server.close(() => {
    console.log('[SERVER] HTTP server closed.')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('[SERVER] Forced exit after timeout.')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[SERVER] Unhandled Promise Rejection:', reason)
})

process.on('uncaughtException', (err: Error) => {
  console.error('[SERVER] Uncaught Exception:', err)
  process.exit(1)
})

export default server