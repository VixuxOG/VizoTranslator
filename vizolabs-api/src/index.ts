import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from 'dotenv'
import { rateLimit } from 'express-rate-limit'
import { translateRouter } from './routes/translate.js'
import { authRouter } from './routes/auth.js'
import { projectRouter } from './routes/projects.js'
import { userRouter } from './routes/users.js'
import { glossaryRouter } from './routes/glossary.js'
import { memoryRouter } from './routes/memory.js'
import { apiRouter } from './routes/api.js'
import { webhookRouter } from './routes/webhooks.js'
import { billingRouter } from './routes/billing.js'
import { errorHandler } from './middleware/errorHandler.js'

config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT || '100'),
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/v1/translate', translateRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/projects', projectRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/glossaries', glossaryRouter)
app.use('/api/v1/memory', memoryRouter)
app.use('/api/v1', apiRouter)
app.use('/api/v1/webhooks', webhookRouter)
app.use('/api/v1/billing', billingRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 VizoTranslator API running on port ${PORT}`)
  console.log(`📚 API Docs: http://localhost:${PORT}/api/v1/docs`)
})

export default app
