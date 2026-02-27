import { Response } from 'express'
import { AuthenticatedRequest } from '../../shared/types/index.js'
import * as sheepService from './sheep.service.js'

export async function getAllSheep(req: AuthenticatedRequest, res: Response) {
  const sheep = await sheepService.getAllSheep(req.user!.id, req.query as never)

  res.status(200).json({
    status: 'success',
    results: sheep.length,
    data: { sheep }
  })
}

export async function getSheepById(req: AuthenticatedRequest, res: Response) {
  const sheep = await sheepService.getSheepById(req.user!.id, req.params.id as string)

  res.status(200).json({
    status: 'success',
    data: { sheep }
  })
}

export async function createSheep(req: AuthenticatedRequest, res: Response) {
  const sheep = await sheepService.createSheep(req.user!.id, req.body)

  res.status(201).json({
    status: 'success',
    data: { sheep }
  })
}

export async function updateSheep(req: AuthenticatedRequest, res: Response) {
  const sheep = await sheepService.updateSheep(
    req.user!.id,
    req.params.id as string,
    req.body
  )

  res.status(200).json({
    status: 'success',
    data: { sheep }
  })
}

export async function deleteSheep(req: AuthenticatedRequest, res: Response) {
  await sheepService.deleteSheep(req.user!.id, req.params.id as string)

  res.status(200).json({
    status: 'success',
    message: 'Sheep deleted successfully'
  })
}

export async function getSheepFamily(req: AuthenticatedRequest, res: Response) {
  const family = await sheepService.getSheepFamily(req.user!.id, req.params.id as string)

  res.status(200).json({
    status: 'success',
    data: family
  })
}
