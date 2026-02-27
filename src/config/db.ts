import mongoose from 'mongoose'
import { env } from './env.js'
import logger from './logger.js'

const isAtlas = env.ACTIVE_MONGODB_URI.startsWith('mongodb+srv')

const connectionOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: isAtlas ? 10000 : 5000,
  socketTimeoutMS: 45000,
}

export async function connectDB() {
  mongoose.connection.on('connected', () => {
    const target = isAtlas ? 'Atlas' : 'localhost'
    logger.info(`MongoDB connected: ${mongoose.connection.host} (${target})`)
  })

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err)
  })

  mongoose.connection.on('disconnected', () => {
    logger.info('MongoDB disconnected')
  })

  try {
    await mongoose.connect(env.ACTIVE_MONGODB_URI, connectionOptions)
  } catch (error) {
    logger.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}

export async function disconnectDB() {
  await mongoose.disconnect()
}
