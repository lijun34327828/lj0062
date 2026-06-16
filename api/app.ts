/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import './db/init.js'
import authRoutes from './routes/auth.js'
import exhibitionsRoutes from './routes/exhibitions.js'
import guidesRoutes from './routes/guides.js'
import bookingsRoutes from './routes/bookings.js'
import collectionsRoutes from './routes/collections.js'
import schedulesRoutes from './routes/schedules.js'
import statisticsRoutes from './routes/statistics.js'
import settingsRoutes from './routes/settings.js'
import usersRoutes from './routes/users.js'
import tasksRoutes from './routes/tasks.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/exhibitions', exhibitionsRoutes)
app.use('/api/guides', guidesRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/schedules', schedulesRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/tasks', tasksRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
