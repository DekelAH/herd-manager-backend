import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

interface ValidationSchemas {
  body?: ZodSchema
  params?: ZodSchema
  query?: ZodSchema
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body)
      }
      if (schemas.params) {
        schemas.params.parse(req.params)
      }
      if (schemas.query) {
        schemas.query.parse(req.query)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
        next({ statusCode: 400, message: messages.join(', '), isOperational: true })
      } else {
        next(error)
      }
    }
  }
}
