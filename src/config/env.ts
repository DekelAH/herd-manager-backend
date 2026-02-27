import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default(''),
  MONGODB_ATLAS_URI: z.string().default(''),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  /* eslint-disable no-console */
  console.error('Invalid environment variables:')
  console.error(parsed.error.format())
  /* eslint-enable no-console */
  process.exit(1)
}

const data = parsed.data

const mongoUri = data.NODE_ENV === 'production'
  ? data.MONGODB_ATLAS_URI
  : data.MONGODB_URI

if (!mongoUri) {
  const needed = data.NODE_ENV === 'production' ? 'MONGODB_ATLAS_URI' : 'MONGODB_URI'
  // eslint-disable-next-line no-console
  console.error(`Missing ${needed} for ${data.NODE_ENV} environment`)
  process.exit(1)
}

export const env = { ...data, ACTIVE_MONGODB_URI: mongoUri }
