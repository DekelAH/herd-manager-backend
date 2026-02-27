import { z } from 'zod'
import { FERTILITY_RATINGS, HEALTH_STATUSES, GENDERS } from '../../shared/constants/index.js'

export const createSheepSchema = z.object({
  tagNumber: z.string().regex(/^\d{1,4}$/, 'Tag number must be 1-4 digits'),
  gender: z.enum(GENDERS),
  birthDate: z.string().datetime({ offset: true }).or(z.string().date()),
  mother: z.string().nullable().optional(),
  father: z.string().nullable().optional(),
  weight: z.number().min(0).max(300),
  breed: z.string().min(1).max(50).trim(),
  fertility: z.enum(FERTILITY_RATINGS).default('B+'),
  isPregnant: z.boolean().default(false),
  pregnancyStartDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  healthStatus: z.enum(HEALTH_STATUSES).default('healthy'),
  notes: z.string().max(500).default('')
})

export const updateSheepSchema = createSheepSchema.partial()

export const sheepIdParam = z.object({
  id: z.string().min(1)
})

export const sheepQuerySchema = z.object({
  gender: z.enum(GENDERS).optional(),
  healthStatus: z.enum(HEALTH_STATUSES).optional(),
  breed: z.string().optional(),
  ageGroup: z.enum(['lamb', 'adult']).optional(),
  search: z.string().optional()
})

export type CreateSheepInput = z.infer<typeof createSheepSchema>
export type UpdateSheepInput = z.infer<typeof updateSheepSchema>
export type SheepQuery = z.infer<typeof sheepQuerySchema>
