import { Response } from 'express'
import { AuthenticatedRequest } from '../../shared/types/index.js'
import * as authService from './auth.service.js'

export async function signup(req: AuthenticatedRequest, res: Response) {
  const result = await authService.signup(req.body)

  res.status(201).json({
    status: 'success',
    data: result
  })
}

export async function login(req: AuthenticatedRequest, res: Response) {
  const result = await authService.login(req.body)

  res.status(200).json({
    status: 'success',
    data: result
  })
}

export async function refresh(req: AuthenticatedRequest, res: Response) {
  const { refreshToken } = req.body
  const result = await authService.refresh(refreshToken)

  res.status(200).json({
    status: 'success',
    data: result
  })
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  const { refreshToken } = req.body
  await authService.logout(req.user!.id, refreshToken)

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  })
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  const user = await authService.getMe(req.user!.id)

  res.status(200).json({
    status: 'success',
    data: { user }
  })
}
