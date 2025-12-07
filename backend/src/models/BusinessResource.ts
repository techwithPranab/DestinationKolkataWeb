import mongoose, { Schema, Document } from 'mongoose'

// Business Resources Schema
export interface IBusinessResource extends Document {
  title: string
  description: string
  category: 'guides' | 'templates' | 'tools' | 'webinars' | 'case-studies' | 'market-insights' | 'legal' | 'financial'
  subcategory?: string
  content: string // Rich text content
  fileAttachments?: {
    filename: string
    url: string
    fileType: string
    size: number
  }[]
  tags?: string[]
  targetAudience: 'restaurants' | 'hotels' | 'travel-agencies' | 'event-organizers' | 'attractions' | 'all'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number // in minutes
  downloadCount: number
  viewCount: number
  likes: number
  likedBy?: mongoose.Types.ObjectId[]
  featured: boolean
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  author: mongoose.Types.ObjectId
  lastUpdatedBy?: mongoose.Types.ObjectId
  seoMeta?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    canonicalUrl?: string
  }
  relatedResources?: mongoose.Types.ObjectId[]
  comments?: {
    user: mongoose.Types.ObjectId
    comment: string
    rating?: number
    createdAt: Date
    replies?: {
      user: mongoose.Types.ObjectId
      reply: string
      createdAt: Date
    }[]
  }[]
  createdAt: Date
  updatedAt: Date
}

const businessResourceSchema = new Schema({
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
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['guides', 'templates', 'tools', 'webinars', 'case-studies', 'market-insights', 'legal', 'financial'],
    required: true,
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true
  },
  fileAttachments: [{
    filename: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  targetAudience: {
    type: String,
    enum: ['restaurants', 'hotels', 'travel-agencies', 'event-organizers', 'attractions', 'all'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true
  },
  estimatedReadTime: {
    type: Number,
    required: true,
    min: 1
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  publishedAt: Date,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  seoMeta: {
    metaTitle: {
      type: String,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },
    keywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: {
      type: String,
      trim: true
    }
  },
  relatedResources: [{
    type: Schema.Types.ObjectId,
    ref: 'BusinessResource'
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reply: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }]
}, {
  timestamps: true
})

// Indexes for efficient queries
businessResourceSchema.index({ status: 1, category: 1, targetAudience: 1 })
businessResourceSchema.index({ featured: 1, status: 1, publishedAt: -1 })
businessResourceSchema.index({ tags: 1, status: 1 })
businessResourceSchema.index({ author: 1, status: 1 })
businessResourceSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text', 
  tags: 'text' 
})

// Virtual for URL slug
businessResourceSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
})

// Pre-save middleware to set publishedAt
businessResourceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// Static method to get featured resources
businessResourceSchema.statics.getFeaturedResources = async function(limit: number = 5) {
  return await this.find({
    status: 'published',
    featured: true
  })
  .populate('author', 'firstName lastName name')
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('-content -comments')
}

// Static method to get popular resources
businessResourceSchema.statics.getPopularResources = async function(limit: number = 5) {
  return await this.find({
    status: 'published'
  })
  .populate('author', 'firstName lastName name')
  .sort({ 
    viewCount: -1, 
    downloadCount: -1, 
    likes: -1 
  })
  .limit(limit)
  .select('-content -comments')
}

export const BusinessResource = mongoose.models.BusinessResource || mongoose.model<IBusinessResource>('BusinessResource', businessResourceSchema)
