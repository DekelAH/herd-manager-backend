import { Response } from 'express'
import { AuthenticatedRequest } from '../../shared/types/index.js'
import * as userService from './user.service.js'

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const user = await userService.updateProfile(req.user!.id, req.body)

  res.status(200).json({
    status: 'success',
    data: { user }
  })
}
