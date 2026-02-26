export const SHEEP_GESTATION_DAYS = 147
export const SHEEP_OVERDUE_DAYS = 150

export const MIN_BREEDING_AGE_MONTHS = {
  female: 16.8,
  male: 19.2
} as const

export const FERTILITY_RATINGS = ['AA', 'B+', 'BB'] as const
export type FertilityRating = typeof FERTILITY_RATINGS[number]

export const LITTER_SIZES: Record<FertilityRating, number> = {
  'AA': 1.2,
  'B+': 2.0,
  'BB': 2.5
}

export const HEALTH_STATUSES = ['healthy', 'needs attention'] as const
export type HealthStatus = typeof HEALTH_STATUSES[number]

export const GENDERS = ['male', 'female'] as const
export type Gender = typeof GENDERS[number]

export const BREED_OPTIONS = [
  'Afek',
  'Assaf',
  'Dropper',
  'English Dorset',
  'English Slowfek',
  'French Dorset',
  'French Slowfek',
  'Romano',
  'Sherolle'
] as const
