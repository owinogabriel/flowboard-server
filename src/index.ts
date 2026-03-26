import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()

import workspaceRoutes from './routes/workspaceRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import memberRoutes from './routes/memberRoutes.js'
import logger from './middleware/logger.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}))

app.use(express.json())
app.use(logger)

app.get('/', (req, res) => {
  res.json({ success: true, message: "Flowboard API is running! 🚀" })
})

app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/workspaces', memberRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✅ Flowboard API running on http://localhost:${PORT}`)
})