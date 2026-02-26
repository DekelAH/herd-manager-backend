import app from './app.js'
import { env } from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'

async function start() {
  await connectDB()

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
    console.log(`API docs: http://localhost:${env.PORT}/api-docs`)
  })

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
