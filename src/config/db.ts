import mongoose from 'mongoose'
import { env } from './env.js'

const isAtlas = env.ACTIVE_MONGODB_URI.startsWith('mongodb+srv')

const connectionOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: isAtlas ? 10000 : 5000,
  socketTimeoutMS: 45000,
}

export async function connectDB() {
  mongoose.connection.on('connected', () => {
    const target = isAtlas ? 'Atlas' : 'localhost'
    console.log(`MongoDB connected: ${mongoose.connection.host} (${target})`)
  })

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
  })

  try {
    await mongoose.connect(env.ACTIVE_MONGODB_URI, connectionOptions)
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}

export async function disconnectDB() {
  await mongoose.disconnect()
}
