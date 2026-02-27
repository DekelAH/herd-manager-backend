import mongoose, { Schema, Types } from 'mongoose'
import { FERTILITY_RATINGS, HEALTH_STATUSES, GENDERS } from '../../shared/constants/index.js'

export interface ISheep {
  _id: Types.ObjectId
  tagNumber: string
  gender: 'male' | 'female'
  birthDate: Date
  mother: Types.ObjectId | null
  father: Types.ObjectId | null
  weight: number
  breed: string
  fertility: 'AA' | 'B+' | 'BB'
  isPregnant: boolean
  pregnancyStartDate: Date | null
  healthStatus: 'healthy' | 'needs attention'
  notes: string
  owner: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const sheepSchema = new Schema<ISheep>(
  {
    tagNumber: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      required: true,
      enum: GENDERS
    },
    birthDate: {
      type: Date,
      required: true
    },
    mother: {
      type: Schema.Types.ObjectId,
      ref: 'Sheep',
      default: null
    },
    father: {
      type: Schema.Types.ObjectId,
      ref: 'Sheep',
      default: null
    },
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    breed: {
      type: String,
      required: true,
      trim: true
    },
    fertility: {
      type: String,
      required: true,
      enum: FERTILITY_RATINGS,
      default: 'B+'
    },
    isPregnant: {
      type: Boolean,
      default: false
    },
    pregnancyStartDate: {
      type: Date,
      default: null
    },
    healthStatus: {
      type: String,
      required: true,
      enum: HEALTH_STATUSES,
      default: 'healthy'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
)

sheepSchema.index({ owner: 1, tagNumber: 1 }, { unique: true })
sheepSchema.index({ owner: 1, gender: 1 })
sheepSchema.index({ owner: 1, healthStatus: 1 })

export const Sheep = mongoose.model<ISheep>('Sheep', sheepSchema)
