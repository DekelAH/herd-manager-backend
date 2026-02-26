import { Router } from 'express'
import * as userController from './user.controller.js'
import { authenticate } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../shared/utils/asyncHandler.js'
import { updateProfileSchema } from './user.validation.js'

const router = Router()

router.use(authenticate)

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               farmName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       409:
 *         description: Email already in use
 */
router.put(
  '/profile',
  validate({ body: updateProfileSchema }),
  asyncHandler(userController.updateProfile)
)

export default router
