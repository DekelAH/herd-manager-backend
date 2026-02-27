import { Router } from 'express'
import * as sheepController from './sheep.controller.js'
import { authenticate } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'
import {
  createSheepSchema,
  updateSheepSchema,
  sheepIdParam,
  sheepQuerySchema
} from './sheep.validation.js'

const router = Router()

router.use(authenticate)

/**
 * @swagger
 * /api/sheep:
 *   get:
 *     tags: [Sheep]
 *     summary: Get all sheep (with optional filters)
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female]
 *       - in: query
 *         name: healthStatus
 *         schema:
 *           type: string
 *           enum: [healthy, needs attention]
 *       - in: query
 *         name: breed
 *         schema:
 *           type: string
 *       - in: query
 *         name: ageGroup
 *         schema:
 *           type: string
 *           enum: [lamb, adult]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by tag number
 *     responses:
 *       200:
 *         description: List of sheep
 */
router.get(
  '/',
  validate({ query: sheepQuerySchema }),
  asyncHandler(sheepController.getAllSheep)
)

/**
 * @swagger
 * /api/sheep/{id}:
 *   get:
 *     tags: [Sheep]
 *     summary: Get a single sheep by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheep data
 *       404:
 *         description: Sheep not found
 */
router.get(
  '/:id',
  validate({ params: sheepIdParam }),
  asyncHandler(sheepController.getSheepById)
)

/**
 * @swagger
 * /api/sheep/{id}/family:
 *   get:
 *     tags: [Sheep]
 *     summary: Get family tree for a sheep
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Family data (mother, father, siblings, offspring)
 */
router.get(
  '/:id/family',
  validate({ params: sheepIdParam }),
  asyncHandler(sheepController.getSheepFamily)
)

/**
 * @swagger
 * /api/sheep:
 *   post:
 *     tags: [Sheep]
 *     summary: Add a new sheep
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tagNumber, gender, birthDate, weight, breed]
 *             properties:
 *               tagNumber:
 *                 type: string
 *                 pattern: '^\d{1,4}$'
 *                 description: Numeric tag (1-4 digits). Auto-prefixed with F/M based on gender (e.g. 42 + female = F0042)
 *                 example: "42"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               birthDate:
 *                 type: string
 *                 format: date
 *               mother:
 *                 type: string
 *                 nullable: true
 *               father:
 *                 type: string
 *                 nullable: true
 *               weight:
 *                 type: number
 *               breed:
 *                 type: string
 *               fertility:
 *                 type: string
 *                 enum: [AA, B+, BB]
 *               isPregnant:
 *                 type: boolean
 *               pregnancyStartDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               healthStatus:
 *                 type: string
 *                 enum: [healthy, needs attention]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sheep created (tagNumber stored as F/M + 4-digit padded number)
 *       409:
 *         description: Duplicate tag number
 */
router.post(
  '/',
  validate({ body: createSheepSchema }),
  asyncHandler(sheepController.createSheep)
)

/**
 * @swagger
 * /api/sheep/{id}:
 *   put:
 *     tags: [Sheep]
 *     summary: Update a sheep
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tagNumber:
 *                 type: string
 *                 pattern: '^\d{1,4}$'
 *                 description: Numeric tag (1-4 digits). Auto-prefixed with F/M based on gender
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Changing gender also updates the tag prefix (F/M)
 *               birthDate:
 *                 type: string
 *               weight:
 *                 type: number
 *               breed:
 *                 type: string
 *               fertility:
 *                 type: string
 *               isPregnant:
 *                 type: boolean
 *               healthStatus:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sheep updated
 *       404:
 *         description: Sheep not found
 */
router.put(
  '/:id',
  validate({ params: sheepIdParam, body: updateSheepSchema }),
  asyncHandler(sheepController.updateSheep)
)

/**
 * @swagger
 * /api/sheep/{id}:
 *   delete:
 *     tags: [Sheep]
 *     summary: Delete a sheep
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheep deleted
 *       400:
 *         description: Cannot delete sheep with offspring
 *       404:
 *         description: Sheep not found
 */
router.delete(
  '/:id',
  validate({ params: sheepIdParam }),
  asyncHandler(sheepController.deleteSheep)
)

export default router
