import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './utils/config.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'


import authRoutes     from './routes/auth.routes.js'
import batchRoutes    from './routes/batch.routes.js'
import transferRoutes from './routes/transfer.routes.js'
import stripRoutes    from './routes/strip.routes.js'
import saleRoutes     from './routes/sale.routes.js'
import verifyRoutes   from './routes/verify.routes.js'
import adminRoutes    from './routes/admin.routes.js'
import statsRoutes    from './routes/stats.routes.js'

const app = express()


app.use(helmet())

app.use(
  cors({
    origin:      config.frontendUrl,
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(morgan(config.isDev ? 'dev' : 'combined'))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))


app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    env:       config.nodeEnv,
  })
})


app.use('/api/auth',     authRoutes)
app.use('/api/batch',    batchRoutes)
app.use('/api/transfer', transferRoutes)
app.use('/api/strip',    stripRoutes)
app.use('/api/sale',     saleRoutes)
app.use('/api/verify',   verifyRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/stats',    statsRoutes)


app.use(notFoundHandler)
app.use(errorHandler)

export default app