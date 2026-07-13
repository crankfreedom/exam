import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { Environment } from './config/environment'
import indexRoutes from '@/routes/index'
import chalkRoutes from '@/routes/chalk'
import notFoundRoutes from '@/routes/notFound'

const app = express()

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())

// 路由接口
app.use("/", indexRoutes);
app.use("/chalk", chalkRoutes);
app.use("/", notFoundRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const { HOST, PORT } = Environment
app.listen(PORT, HOST, () => {
  console.log(`ExamHub server running on http://${HOST}:${PORT}`)
})
