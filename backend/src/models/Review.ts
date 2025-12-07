import mongoose, { Schema, Document } from 'mongoose'

// Review Schema for all entities (hotels, restaurants, attractions, events, sports)
export interface IHelpfulVote {
  user: mongoose.Types.ObjectId
  helpful: boolean
  votedAt: Date
}

export interface IReview extends Document {
  entityId: mongoose.Types.ObjectId
  entityType: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
  user?: mongoose.Types.ObjectId // Optional for registered users
  authorName?: string // For anonymous reviews
  authorEmail?: string // For anonymous reviews
  rating: number // 1-5 stars
  title?: string
  comment: string
  images?: string[] // URLs to review images
  helpful: number // Number of users who found this helpful
  helpfulUsers?: IHelpfulVote[] // Users who marked this as helpful with vote data
  verified: boolean // Whether the reviewer actually visited/used the service
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: mongoose.Types.ObjectId // Admin who approved/rejected
  moderatedAt?: Date
  moderationNotes?: string
  reportedBy?: mongoose.Types.ObjectId[] // Users who reported this review
  isEdited: boolean // Whether review was edited after posting
  lastEditedAt?: Date
  visitDate?: Date // When the user visited the place
  createdAt: Date
  updatedAt: Date
}

// Interface for the Review model with static methods
interface IReviewModel extends mongoose.Model<IReview> {
  getAverageRating(entityId: string, entityType: string): Promise<{ averageRating: number; totalReviews: number }>
  getEntityReviews(
    entityId: string,
    entityType: string,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{
    reviews: IReview[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>
}

const reviewSchema = new Schema({
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['hotel', 'restaurant', 'attraction', 'event', 'sports'],
    required: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  authorName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  authorEmail: {
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 255,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  images: [{
    type: String,
    trim: true
  }],
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulUsers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    helpful: {
      type: Boolean,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNotes: String,
  reportedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  lastEditedAt: Date,
  visitDate: Date
}, {
  timestamps: true
})

// Compound indexes for efficient queries
reviewSchema.index({ entityId: 1, entityType: 1, status: 1 })
reviewSchema.index({ entityId: 1, entityType: 1, createdAt: -1 })
reviewSchema.index({ user: 1, entityId: 1, entityType: 1 }) // Prevent duplicate reviews from same user
reviewSchema.index({ authorEmail: 1, entityId: 1, entityType: 1 }) // Prevent duplicate reviews from same email

// Validation to ensure either user or authorName/authorEmail is provided
reviewSchema.pre('validate', function(next) {
  if (!this.user && (!this.authorName || !this.authorEmail)) {
    this.invalidate('user', 'Either user ID or author name and email must be provided')
  }
  next()
})

// Prevent duplicate reviews from the same user/email for the same entity
reviewSchema.pre('save', async function(next) {
  const review = this as IReview & mongoose.Document

  if (review.user) {
    // Check for existing review from this user
    const existingReview = await mongoose.models.Review.findOne({
      entityId: review.entityId,
      entityType: review.entityType,
      user: review.user,
      _id: { $ne: review._id }
    })

    if (existingReview) {
      return next(new Error('You have already reviewed this item'))
    }
  } else if (review.authorEmail) {
    // Check for existing review from this email
    const existingReview = await mongoose.models.Review.findOne({
      entityId: review.entityId,
      entityType: review.entityType,
      authorEmail: review.authorEmail,
      _id: { $ne: review._id }
    })

    if (existingReview) {
      return next(new Error('A review from this email address already exists for this item'))
    }
  }

  next()
})

// Static method to get average rating for an entity
reviewSchema.statics.getAverageRating = async function(entityId: string, entityType: string) {
  const result = await (this as mongoose.Model<IReview>).aggregate([
    {
      $match: {
        entityId: new mongoose.Types.ObjectId(entityId),
        entityType: entityType,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ])

  return result[0] || { averageRating: 0, totalReviews: 0 }
}

// Static method to get reviews for an entity
reviewSchema.statics.getEntityReviews = async function(
  entityId: string,
  entityType: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: string = 'desc'
) {
  const skip = (page - 1) * limit
  const sort: Record<string, 1 | -1> = {}
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1

  const reviews = await (this as mongoose.Model<IReview>).find({
    entityId: new mongoose.Types.ObjectId(entityId),
    entityType: entityType,
    status: 'approved'
  })
  .populate('user', 'firstName lastName name email profile.avatar')
  .sort(sort)
  .skip(skip)
  .limit(limit)
  .select('-__v')

  const total = await (this as mongoose.Model<IReview>).countDocuments({
    entityId: new mongoose.Types.ObjectId(entityId),
    entityType: entityType,
    status: 'approved'
  })

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }
}

// Interface for the Review model with static methods
interface IReviewModel extends mongoose.Model<IReview> {
  getAverageRating(entityId: string, entityType: string): Promise<{ averageRating: number; totalReviews: number }>
  getEntityReviews(
    entityId: string,
    entityType: string,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{
    reviews: IReview[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>
}

export const Review = (mongoose.models.Review || mongoose.model<IReview, IReviewModel>('Review', reviewSchema)) as IReviewModel
