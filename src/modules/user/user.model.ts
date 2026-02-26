import mongoose, { Schema, Document, Types } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  _id: Types.ObjectId
  username: string
  email: string
  password: string
  farmName: string
  refreshTokens: { token: string; expiresAt: Date }[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    farmName: {
      type: String,
      default: 'My Farm',
      trim: true
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshTokens
  return obj
}

export const User = mongoose.model<IUser>('User', userSchema)
