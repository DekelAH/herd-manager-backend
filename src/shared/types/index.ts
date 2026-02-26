import { Request } from 'express'
import { Types } from 'mongoose'

export interface AuthPayload {
  userId: string
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    _id: Types.ObjectId
  }
}
