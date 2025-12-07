import mongoose, { Schema, Document } from 'mongoose'

// Advertising Schema
export interface IAdvertising extends Document {
  title: string
  description: string
  advertiserName: string
  advertiserEmail: string
  advertiserPhone?: string
  category: 'banner' | 'sponsored-content' | 'directory-listing' | 'event-promotion' | 'featured-placement'
  targetLocation?: string[] // Areas in Kolkata to target
  targetAudience?: string
  startDate: Date
  endDate: Date
  budget: number
  status: 'pending' | 'approved' | 'active' | 'paused' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  placement?: string[] // Where the ad will be placed (homepage, categories, etc.)
  images?: string[] // Ad creative images
  clickCount: number
  viewCount: number
  conversionCount: number
  ctr: number // Click-through rate
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  rejectionReason?: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentId?: string // Stripe payment ID
  analytics: {
    impressions: number
    clicks: number
    conversions: number
    spend: number
  }
  createdAt: Date
  updatedAt: Date
}

const advertisingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  advertiserName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  advertiserEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  advertiserPhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  category: {
    type: String,
    enum: ['banner', 'sponsored-content', 'directory-listing', 'event-promotion', 'featured-placement'],
    required: true,
    index: true
  },
  targetLocation: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    trim: true,
    maxlength: 500
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'paused', 'completed', 'rejected'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  placement: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  clickCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  conversionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  ctr: {
    type: Number,
    default: 0,
    min: 0
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentId: {
    type: String,
    trim: true
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0,
      min: 0
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    conversions: {
      type: Number,
      default: 0,
      min: 0
    },
    spend: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
advertisingSchema.index({ status: 1, startDate: 1, endDate: 1 })
advertisingSchema.index({ advertiserEmail: 1, createdAt: -1 })
advertisingSchema.index({ category: 1, status: 1 })
advertisingSchema.index({ startDate: 1, endDate: 1, status: 1 })

// Pre-save middleware to calculate CTR
advertisingSchema.pre('save', function(next) {
  if (this.viewCount > 0) {
    this.ctr = (this.clickCount / this.viewCount) * 100
  }
  next()
})

// Static method to get active ads for placement
advertisingSchema.statics.getActiveAds = async function(placement?: string, category?: string) {
  const now = new Date()
  const query: {
    status: string
    startDate: { $lte: Date }
    endDate: { $gte: Date }
    placement?: string
    category?: string
  } = {
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }

  if (placement) {
    query.placement = placement
  }

  if (category) {
    query.category = category
  }

  return await this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .select('-analytics -approvedBy -rejectionReason')
}

export const Advertising = mongoose.models.Advertising || mongoose.model<IAdvertising>('Advertising', advertisingSchema)
