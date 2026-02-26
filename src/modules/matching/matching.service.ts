import { Types } from 'mongoose'
import { Sheep, ISheep } from '../sheep/sheep.model.js'
import { ApiError } from '../../shared/utils/apiError.js'
import {
  MIN_BREEDING_AGE_MONTHS,
  LITTER_SIZES,
  FertilityRating
} from '../../shared/constants/index.js'

interface CompatibilityResult {
  sheep: ISheep
  isCompatible: boolean
  score: number
  reasons: string[]
  recommendation: string
  fertility1: string
  fertility2: string
  expectedLitterSize: number
}

function getAgeInMonths(birthDate: Date): number {
  const today = new Date()
  return (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
}

function getLitterSize(fertility: FertilityRating): number {
  return LITTER_SIZES[fertility] || 1.2
}

function getRecommendation(score: number, isCompatible: boolean): string {
  if (!isCompatible) return 'Do not breed'
  if (score >= 90) return 'Best choice'
  if (score >= 70) return 'Good choice'
  if (score >= 50) return 'Acceptable'
  return 'Not recommended'
}

function checkCompatibility(
  sheep1: ISheep,
  sheep2: ISheep
): Omit<CompatibilityResult, 'sheep'> {
  const reasons: string[] = []
  let isCompatible = true
  let score = 100

  const id1 = sheep1._id.toString()
  const id2 = sheep2._id.toString()
  const mother1 = sheep1.mother?.toString()
  const father1 = sheep1.father?.toString()
  const mother2 = sheep2.mother?.toString()
  const father2 = sheep2.father?.toString()

  // Parent-child check
  if (mother1 === id2 || father1 === id2 || mother2 === id1 || father2 === id1) {
    isCompatible = false
    reasons.push('Blocked: parent-child relationship')
    score = 0
  }

  // Sibling check (same mother OR same father)
  if (mother1 && mother2 && mother1 === mother2) {
    isCompatible = false
    reasons.push('Blocked: siblings (same mother)')
    score = 0
  }

  if (father1 && father2 && father1 === father2) {
    isCompatible = false
    reasons.push('Blocked: siblings (same father)')
    score = 0
  }

  // Breeding age check
  const age1 = getAgeInMonths(sheep1.birthDate)
  const age2 = getAgeInMonths(sheep2.birthDate)
  const minAge1 = MIN_BREEDING_AGE_MONTHS[sheep1.gender]
  const minAge2 = MIN_BREEDING_AGE_MONTHS[sheep2.gender]

  if (age1 < minAge1) {
    isCompatible = false
    score = 0
    reasons.push(`${sheep1.tagNumber} is too young for breeding`)
  }

  if (age2 < minAge2) {
    isCompatible = false
    score = 0
    reasons.push(`${sheep2.tagNumber} is too young for breeding`)
  }

  // Fertility scoring
  const fertility1 = (sheep1.fertility || 'AA') as FertilityRating
  const fertility2 = (sheep2.fertility || 'AA') as FertilityRating
  const femaleSheep = sheep1.gender === 'female' ? sheep1 : sheep2
  const femaleFertility = (femaleSheep.fertility || 'AA') as FertilityRating
  const expectedLitterSize = getLitterSize(femaleFertility)

  if (fertility1 === 'BB' && fertility2 === 'BB') {
    score += 30
    reasons.push(`Excellent genetics — expected ${expectedLitterSize} lambs per pregnancy`)
  } else if (
    (fertility1 === 'BB' && fertility2 === 'B+') ||
    (fertility1 === 'B+' && fertility2 === 'BB')
  ) {
    score += 25
    reasons.push(`Very good genetics — expected ${expectedLitterSize} lambs per pregnancy`)
  } else if (fertility1 === 'B+' && fertility2 === 'B+') {
    score += 18
    reasons.push(`Good genetics — expected ${expectedLitterSize} lambs per pregnancy`)
  } else if (
    (fertility1 === 'B+' && fertility2 === 'AA') ||
    (fertility1 === 'AA' && fertility2 === 'B+')
  ) {
    score += 8
    reasons.push(`Average genetics — expected ${expectedLitterSize} lambs per pregnancy`)
  } else if (fertility1 === 'AA' && fertility2 === 'AA') {
    score -= 15
    reasons.push(`Basic genetics — expected ${expectedLitterSize} lambs`)
  }

  // Health check
  if (sheep1.healthStatus !== 'healthy') {
    score -= 15
    reasons.push(`${sheep1.tagNumber} needs health attention`)
  }
  if (sheep2.healthStatus !== 'healthy') {
    score -= 15
    reasons.push(`${sheep2.tagNumber} needs health attention`)
  }

  // Pregnancy check
  if (sheep2.isPregnant) {
    isCompatible = false
    score = 0
    reasons.push('Blocked: female is already pregnant')
  }

  if (reasons.length === 0) {
    reasons.push('Not related', 'Both healthy')
  }

  return {
    isCompatible,
    score: Math.max(0, score),
    reasons,
    recommendation: getRecommendation(score, isCompatible),
    fertility1,
    fertility2,
    expectedLitterSize
  }
}

export async function getValidMatches(
  ownerId: string,
  sheepId: string
): Promise<CompatibilityResult[]> {
  const ownerObjectId = new Types.ObjectId(ownerId)

  const allSheep = await Sheep.find({ owner: ownerObjectId })
  const targetSheep = allSheep.find(s => s._id.toString() === sheepId)

  if (!targetSheep) {
    throw ApiError.notFound('Sheep not found')
  }

  const oppositeGender = targetSheep.gender === 'male' ? 'female' : 'male'
  const today = new Date()

  const potentialMatches = allSheep.filter(s => {
    if (s.gender !== oppositeGender || s.isPregnant) return false

    const ageInMonths = (today.getTime() - s.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    const minAge = MIN_BREEDING_AGE_MONTHS[s.gender]
    return ageInMonths >= minAge
  })

  const matches: CompatibilityResult[] = potentialMatches.map(sheep => ({
    sheep,
    ...checkCompatibility(targetSheep, sheep)
  }))

  matches.sort((a, b) => {
    if (a.isCompatible !== b.isCompatible) {
      return b.isCompatible ? 1 : -1
    }
    return b.score - a.score
  })

  return matches
}

export async function getBreedingStats(ownerId: string) {
  const ownerObjectId = new Types.ObjectId(ownerId)
  const allSheep = await Sheep.find({ owner: ownerObjectId })

  const today = new Date()
  const males = allSheep.filter(s => s.gender === 'male')
  const females = allSheep.filter(s => s.gender === 'female')

  const malesWithOffspring = males.filter(m =>
    allSheep.some(s => s.father?.toString() === m._id.toString())
  ).length

  const femalesWithOffspring = females.filter(f =>
    allSheep.some(s => s.mother?.toString() === f._id.toString())
  ).length

  const breedingAgeMales = males.filter(s => {
    const ageInMonths = (today.getTime() - s.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return ageInMonths >= MIN_BREEDING_AGE_MONTHS.male && s.healthStatus === 'healthy'
  }).length

  const breedingAgeFemales = females.filter(s => {
    const ageInMonths = (today.getTime() - s.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return ageInMonths >= MIN_BREEDING_AGE_MONTHS.female && s.healthStatus === 'healthy' && !s.isPregnant
  }).length

  const growthPotential = females.reduce((total, female) => {
    const ageInMonths = (today.getTime() - female.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (ageInMonths >= MIN_BREEDING_AGE_MONTHS.female && female.healthStatus === 'healthy' && !female.isPregnant) {
      return total + getLitterSize((female.fertility || 'AA') as FertilityRating)
    }
    return total
  }, 0)

  return {
    totalMales: males.length,
    totalFemales: females.length,
    malesWithOffspring,
    femalesWithOffspring,
    breedingAgeMales,
    breedingAgeFemales,
    totalPairs: breedingAgeMales * breedingAgeFemales,
    growthPotential: Math.round(growthPotential * 10) / 10
  }
}
