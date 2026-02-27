import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env.js'
import { ApiError } from '../shared/utils/apiError.js'
import logger from '../config/logger.js'

interface ErrorWithStatus {
  statusCode?: number
  message: string
  isOperational?: boolean
  stack?: string
}

export function errorHandler(
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  logger.error(message, { statusCode, stack: err.stack })

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}
