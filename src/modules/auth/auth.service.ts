import crypto from 'node:crypto'
import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { User } from '../user/user.model.js'
import { ApiError } from '../../shared/utils/apiError.js'
import { AuthPayload } from '../../shared/types/index.js'
import { SignupInput, LoginInput } from './auth.validation.js'

function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId } satisfies AuthPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN, jwtid: crypto.randomUUID() } as SignOptions
  )
}

function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId } satisfies AuthPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN, jwtid: crypto.randomUUID() } as SignOptions
  )
}

// SHA-256 instead of bcrypt -- bcrypt truncates at 72 bytes, JWTs are longer
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function getRefreshTokenExpiry(): Date {
  const match = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms])$/)
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const value = parseInt(match[1])
  const unit = match[2]
  const ms = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  }[unit] || 24 * 60 * 60 * 1000

  return new Date(Date.now() + value * ms)
}

export async function signup(input: SignupInput) {
  const existingUser = await User.findOne({
    $or: [{ username: input.username }, { email: input.email }]
  })

  if (existingUser) {
    if (existingUser.username === input.username) {
      throw ApiError.conflict('Username already exists')
    }
    throw ApiError.conflict('Email already exists')
  }

  const user = await User.create(input)

  const accessToken = generateAccessToken(user._id.toString())
  const refreshToken = generateRefreshToken(user._id.toString())

  user.refreshTokens.push({
    token: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry()
  })
  await user.save()

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  }
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ username: input.username })

  if (!user || !(await user.comparePassword(input.password))) {
    throw ApiError.unauthorized('Invalid username or password')
  }

  user.refreshTokens = user.refreshTokens.filter(
    rt => rt.expiresAt > new Date()
  )

  const accessToken = generateAccessToken(user._id.toString())
  const refreshToken = generateRefreshToken(user._id.toString())

  user.refreshTokens.push({
    token: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry()
  })
  await user.save()

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  }
}

export async function refresh(oldRefreshToken: string) {
  let payload: AuthPayload
  try {
    payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as AuthPayload
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token')
  }

  const user = await User.findById(payload.userId)
  if (!user) {
    throw ApiError.unauthorized('User not found')
  }

  const oldHash = hashToken(oldRefreshToken)
  const tokenIndex = user.refreshTokens.findIndex(
    rt => rt.expiresAt > new Date() && rt.token === oldHash
  )

  if (tokenIndex === -1) {
    user.refreshTokens = []
    await user.save()
    throw ApiError.unauthorized('Refresh token not recognized. All sessions revoked.')
  }

  const accessToken = generateAccessToken(user._id.toString())
  const refreshToken = generateRefreshToken(user._id.toString())

  await User.findByIdAndUpdate(user._id, {
    $set: {
      refreshTokens: [
        ...user.refreshTokens.filter((_, i) => i !== tokenIndex),
        { token: hashToken(refreshToken), expiresAt: getRefreshTokenExpiry() }
      ]
    }
  })

  return { accessToken, refreshToken }
}

export async function logout(userId: string, refreshToken: string) {
  const user = await User.findById(userId)
  if (!user) return

  const tokenHash = hashToken(refreshToken)
  user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== tokenHash)
  await user.save()
}

export async function getMe(userId: string) {
  const user = await User.findById(userId)
  if (!user) {
    throw ApiError.notFound('User not found')
  }
  return user.toJSON()
}
