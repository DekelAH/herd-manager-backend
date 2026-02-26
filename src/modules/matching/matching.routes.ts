import { Router } from 'express'
import * as matchingController from './matching.controller.js'
import { authenticate } from '../../middleware/auth.js'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'

const router = Router()

router.use(authenticate)

/**
 * @swagger
 * /api/matching/stats:
 *   get:
 *     tags: [Matching]
 *     summary: Get breeding statistics for the herd
 *     responses:
 *       200:
 *         description: Breeding statistics
 */
router.get('/stats', asyncHandler(matchingController.getBreedingStats))

/**
 * @swagger
 * /api/matching/{sheepId}:
 *   get:
 *     tags: [Matching]
 *     summary: Get compatible matches for a sheep
 *     parameters:
 *       - in: path
 *         name: sheepId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of compatible matches with scores
 *       404:
 *         description: Sheep not found
 */
router.get('/:sheepId', asyncHandler(matchingController.getValidMatches))

export default router
