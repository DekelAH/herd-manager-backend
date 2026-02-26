import { User } from './user.model.js'
import { ApiError } from '../../shared/utils/apiError.js'
import { UpdateProfileInput } from './user.validation.js'

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await User.findById(userId)

  if (!user) {
    throw ApiError.notFound('User not found')
  }

  if (input.email && input.email !== user.email) {
    const emailTaken = await User.findOne({ email: input.email, _id: { $ne: userId } })
    if (emailTaken) {
      throw ApiError.conflict('Email already in use')
    }
    user.email = input.email
  }

  if (input.farmName) {
    user.farmName = input.farmName
  }

  await user.save()
  return user.toJSON()
}
