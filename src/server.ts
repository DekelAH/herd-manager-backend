import app from './app.js'
import { env } from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'
import logger from './config/logger.js'

async function start() {
  await connectDB()

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
    logger.info(`API docs: http://localhost:${env.PORT}/api-docs`)
  })

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch(err => {
  logger.error('Failed to start server:', err)
  process.exit(1)
})
