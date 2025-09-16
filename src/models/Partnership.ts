import mongoose, { Schema, Document } from 'mongoose'

// Partnerships Schema
export interface IPartnership extends Document {
  partnerName: string
  partnerType: 'hotel' | 'restaurant' | 'travel-agency' | 'attraction' | 'event-organizer' | 'transport' | 'technology' | 'media' | 'government' | 'other'
  contactPerson: {
    name: string
    designation: string
    email: string
    phone?: string
  }
  companyDetails: {
    website?: string
    address: {
      street?: string
      city: string
      state: string
      pincode: string
      country: string
    }
    established?: Date
    employeeCount?: string
    description: string
  }
  partnershipType: 'listing' | 'promotional' | 'strategic' | 'affiliate' | 'content' | 'technology' | 'event'
  proposedBenefits: string[]
  offerDetails?: string
  expectedOutcome: string
  duration?: {
    startDate: Date
    endDate?: Date
    renewable: boolean
  }
  financialTerms?: {
    commissionRate?: number
    flatFee?: number
    revenueShare?: number
    paymentTerms?: string
  }
  status: 'inquiry' | 'under-review' | 'negotiation' | 'approved' | 'active' | 'paused' | 'terminated' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: mongoose.Types.ObjectId // Admin handling this partnership
  notes?: string
  internalNotes?: string // Only visible to admins
  documents?: {
    filename: string
    url: string
    uploadedAt: Date
    type: 'contract' | 'proposal' | 'certificate' | 'other'
  }[]
  communicationLog?: {
    date: Date
    type: 'email' | 'call' | 'meeting' | 'other'
    summary: string
    nextAction?: string
    nextActionDate?: Date
    createdBy: mongoose.Types.ObjectId
  }[]
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  rejectionReason?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

const partnershipSchema = new Schema({
  partnerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  partnerType: {
    type: String,
    enum: ['hotel', 'restaurant', 'travel-agency', 'attraction', 'event-organizer', 'transport', 'technology', 'media', 'government', 'other'],
    required: true,
    index: true
  },
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[1-9]\d{0,15}$/, 'Please enter a valid phone number']
    }
  },
  companyDetails: {
    website: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'India'
      }
    },
    established: Date,
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    }
  },
  partnershipType: {
    type: String,
    enum: ['listing', 'promotional', 'strategic', 'affiliate', 'content', 'technology', 'event'],
    required: true,
    index: true
  },
  proposedBenefits: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  offerDetails: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  expectedOutcome: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  duration: {
    startDate: Date,
    endDate: Date,
    renewable: {
      type: Boolean,
      default: true
    }
  },
  financialTerms: {
    commissionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    flatFee: {
      type: Number,
      min: 0
    },
    revenueShare: {
      type: Number,
      min: 0,
      max: 100
    },
    paymentTerms: String
  },
  status: {
    type: String,
    enum: ['inquiry', 'under-review', 'negotiation', 'approved', 'active', 'paused', 'terminated', 'rejected'],
    default: 'inquiry',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  documents: [{
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
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['contract', 'proposal', 'certificate', 'other'],
      default: 'other'
    }
  }],
  communicationLog: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'other'],
      required: true
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    nextAction: {
      type: String,
      trim: true,
      maxlength: 200
    },
    nextActionDate: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
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
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
})

// Indexes for efficient queries
partnershipSchema.index({ status: 1, partnerType: 1 })
partnershipSchema.index({ priority: 1, status: 1 })
partnershipSchema.index({ assignedTo: 1, status: 1 })
partnershipSchema.index({ 'contactPerson.email': 1 })
partnershipSchema.index({ partnerName: 'text', 'companyDetails.description': 'text' })

// Pre-save middleware to set approval data
partnershipSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date()
  }
  next()
})

// Static method to get partnerships by status
partnershipSchema.statics.getByStatus = async function(status: string) {
  return await this.find({ status })
    .populate('assignedTo', 'firstName lastName name email')
    .populate('approvedBy', 'firstName lastName name')
    .sort({ createdAt: -1 })
}

export const Partnership = mongoose.models.Partnership || mongoose.model<IPartnership>('Partnership', partnershipSchema)
