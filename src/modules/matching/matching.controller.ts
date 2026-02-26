import { Response } from 'express'
import { AuthenticatedRequest } from '../../shared/types/index.js'
import * as matchingService from './matching.service.js'

export async function getValidMatches(req: AuthenticatedRequest, res: Response) {
  const matches = await matchingService.getValidMatches(
    req.user!.id,
    req.params.sheepId
  )

  res.status(200).json({
    status: 'success',
    results: matches.length,
    data: { matches }
  })
}

export async function getBreedingStats(req: AuthenticatedRequest, res: Response) {
  const stats = await matchingService.getBreedingStats(req.user!.id)

  res.status(200).json({
    status: 'success',
    data: { stats }
  })
}
