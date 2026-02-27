import { Request, Response, NextFunction } from 'express'
import logger from '../config/logger.js'

const SKIP_PATHS = ['/api/health']

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (SKIP_PATHS.includes(req.path)) return next()

  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const { method } = req
    const url = req.originalUrl
    const { statusCode } = res

    logger.http(`${method} ${url} ${statusCode} - ${duration}ms`)
  })

  next()
}
