import { Types } from 'mongoose'
import { Sheep } from './sheep.model.js'
import { ApiError } from '../../shared/utils/apiError.js'
import { CreateSheepInput, UpdateSheepInput, SheepQuery } from './sheep.validation.js'
import { formatTagNumber } from './sheep.utils.js'

export async function getAllSheep(ownerId: string, query: SheepQuery) {
  const filter: Record<string, unknown> = { owner: new Types.ObjectId(ownerId) }

  if (query.gender) {
    filter.gender = query.gender
  }

  if (query.healthStatus) {
    filter.healthStatus = query.healthStatus
  }

  if (query.breed) {
    filter.breed = { $regex: query.breed, $options: 'i' }
  }

  if (query.search) {
    filter.tagNumber = { $regex: query.search, $options: 'i' }
  }

  let sheep = await Sheep.find(filter).sort({ createdAt: -1 })

  if (query.ageGroup) {
    const today = new Date()
    sheep = sheep.filter(s => {
      const ageInMonths = (today.getTime() - s.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (query.ageGroup === 'lamb') return ageInMonths < 12
      if (query.ageGroup === 'adult') return ageInMonths >= 12
      return true
    })
  }

  return sheep
}

export async function getSheepById(ownerId: string, sheepId: string) {
  const sheep = await Sheep.findOne({
    _id: sheepId,
    owner: new Types.ObjectId(ownerId)
  })

  if (!sheep) {
    throw ApiError.notFound('Sheep not found')
  }

  return sheep
}

export async function createSheep(ownerId: string, input: CreateSheepInput) {
  const ownerObjectId = new Types.ObjectId(ownerId)
  const tagNumber = formatTagNumber(input.tagNumber, input.gender)

  const existing = await Sheep.findOne({
    owner: ownerObjectId,
    tagNumber
  })

  if (existing) {
    throw ApiError.conflict('A sheep with this tag number already exists')
  }

  if (input.mother) {
    await validateParentOwnership(ownerId, input.mother, 'Mother')
  }
  if (input.father) {
    await validateParentOwnership(ownerId, input.father, 'Father')
  }

  const sheep = await Sheep.create({
    ...input,
    tagNumber,
    owner: ownerObjectId
  })

  return sheep
}

export async function updateSheep(
  ownerId: string,
  sheepId: string,
  input: UpdateSheepInput
) {
  const ownerObjectId = new Types.ObjectId(ownerId)
  const updates: Record<string, unknown> = { ...input }

  if (input.tagNumber || input.gender) {
    const current = await Sheep.findOne({ _id: sheepId, owner: ownerObjectId })
    if (!current) {
      throw ApiError.notFound('Sheep not found')
    }

    const effectiveGender = input.gender ?? current.gender
    const rawTag = input.tagNumber ?? current.tagNumber.slice(1)
    updates.tagNumber = formatTagNumber(rawTag, effectiveGender)

    const duplicate = await Sheep.findOne({
      owner: ownerObjectId,
      tagNumber: updates.tagNumber as string,
      _id: { $ne: sheepId }
    })

    if (duplicate) {
      throw ApiError.conflict('A sheep with this tag number already exists')
    }
  }

  if (input.mother) {
    await validateParentOwnership(ownerId, input.mother, 'Mother')
  }
  if (input.father) {
    await validateParentOwnership(ownerId, input.father, 'Father')
  }

  const sheep = await Sheep.findOneAndUpdate(
    { _id: sheepId, owner: ownerObjectId },
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  )

  if (!sheep) {
    throw ApiError.notFound('Sheep not found')
  }

  return sheep
}

export async function deleteSheep(ownerId: string, sheepId: string) {
  const ownerObjectId = new Types.ObjectId(ownerId)

  const hasOffspring = await Sheep.exists({
    owner: ownerObjectId,
    $or: [{ mother: sheepId }, { father: sheepId }]
  })

  if (hasOffspring) {
    throw ApiError.badRequest(
      'Cannot delete a sheep that has offspring. Remove or reassign offspring first.'
    )
  }

  const sheep = await Sheep.findOneAndDelete({
    _id: sheepId,
    owner: ownerObjectId
  })

  if (!sheep) {
    throw ApiError.notFound('Sheep not found')
  }

  return { success: true }
}

export async function getSheepFamily(ownerId: string, sheepId: string) {
  const ownerObjectId = new Types.ObjectId(ownerId)

  const sheep = await Sheep.findOne({
    _id: sheepId,
    owner: ownerObjectId
  })

  if (!sheep) {
    throw ApiError.notFound('Sheep not found')
  }

  const [mother, father, siblings, offspring] = await Promise.all([
    sheep.mother
      ? Sheep.findOne({ _id: sheep.mother, owner: ownerObjectId })
      : null,
    sheep.father
      ? Sheep.findOne({ _id: sheep.father, owner: ownerObjectId })
      : null,
    Sheep.find({
      owner: ownerObjectId,
      _id: { $ne: sheep._id },
      $or: [
        ...(sheep.mother ? [{ mother: sheep.mother }] : []),
        ...(sheep.father ? [{ father: sheep.father }] : [])
      ]
    }),
    Sheep.find({
      owner: ownerObjectId,
      $or: [{ mother: sheep._id }, { father: sheep._id }]
    })
  ])

  return {
    sheep,
    mother,
    father,
    siblings: sheep.mother || sheep.father ? siblings : [],
    offspring
  }
}

async function validateParentOwnership(
  ownerId: string,
  parentId: string,
  label: string
) {
  const parent = await Sheep.findOne({
    _id: parentId,
    owner: new Types.ObjectId(ownerId)
  })

  if (!parent) {
    throw ApiError.badRequest(`${label} sheep not found in your herd`)
  }
}
