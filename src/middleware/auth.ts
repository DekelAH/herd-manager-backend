import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../shared/utils/apiError.js'
import { AuthPayload, AuthenticatedRequest } from '../shared/types/index.js'
import { Types } from 'mongoose'

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid authorization header'))
  }

  const token = header.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload

    req.user = {
      id: payload.userId,
      _id: new Types.ObjectId(payload.userId)
    }

    next()
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'))
  }
}
