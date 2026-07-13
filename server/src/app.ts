import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { env } from '@/config'
import { chalkRouter } from '@/modules/chalk'
import { requestLogger } from '@/middleware/logger'
import { notFound } from '@/middleware/not-found'

const app = express()

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(requestLogger)

// 路由
app.use('/chalk', chalkRouter)

// 404 兜底
app.use(notFound)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const { HOST, PORT } = env
app.listen(PORT, HOST, () => {
  console.log(`ExamHub server running on http://${HOST}:${PORT}`)
})
