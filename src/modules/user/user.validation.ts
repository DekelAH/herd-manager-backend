import { z } from 'zod'

export const updateProfileSchema = z.object({
  email: z.string().email().trim().toLowerCase().optional(),
  farmName: z.string().min(1).max(100).trim().optional()
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
