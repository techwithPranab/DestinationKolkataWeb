import mongoose, { Schema, Document } from 'mongoose'

// Sports Schema
export interface ISports extends Document {
  name: string
  description: string
  shortDescription: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  address: {
    street: string
    area: string
    city: string
    state: string
    pincode: string
    landmark: string
  }
  contact: {
    phone: string[]
    email: string
    website: string
    socialMedia: object
  }
  category: 'Stadium' | 'Sports Grounds' | 'Coaching Centers' | 'Sports Clubs' | 'Sports Facilities'
  sport: string
  capacity: number
  facilities: string[]
  entryFee: {
    adult: number
    child: number
    senior: number
    currency: string
    isFree: boolean
  }
  timings: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  bestTimeToVisit: string
  duration: string
  amenities: string[]
  rating: {
    average: number
    count: number
  }
  tags: string[]
  status: string
  featured: boolean
  promoted: boolean
  osmId: number
  source: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

const sportsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: {
    street: { type: String, default: '' },
    area: { type: String, default: '' },
    city: { type: String, default: 'Kolkata' },
    state: { type: String, default: 'West Bengal' },
    pincode: { type: String, default: '' },
    landmark: { type: String, default: '' }
  },
  contact: {
    phone: [{ type: String }],
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    socialMedia: { type: Object, default: {} }
  },
  category: {
    type: String,
    enum: ['Stadium', 'Sports Grounds', 'Coaching Centers', 'Sports Clubs', 'Sports Facilities'],
    required: true
  },
  sport: { type: String, required: true },
  capacity: { type: Number, default: 100 },
  facilities: [{ type: String }],
  entryFee: {
    adult: { type: Number, default: 0 },
    child: { type: Number, default: 0 },
    senior: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isFree: { type: Boolean, default: false }
  },
  timings: {
    monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } },
    sunday: { open: { type: String, default: '09:00' }, close: { type: String, default: '21:00' }, closed: { type: Boolean, default: false } }
  },
  bestTimeToVisit: { type: String, default: 'Morning and evening' },
  duration: { type: String, default: '1-2 hours' },
  amenities: [{ type: String }],
  rating: {
    average: { type: Number, default: 3.5 },
    count: { type: Number, default: 10 }
  },
  tags: [{ type: String }],
  status: { type: String, default: 'active' },
  featured: { type: Boolean, default: false },
  promoted: { type: Boolean, default: false },
  osmId: { type: Number, sparse: true },
  source: { type: String, default: 'OpenStreetMap' },
  images: [{ type: String }]
}, {
  timestamps: true
})

// Create indexes
sportsSchema.index({ location: '2dsphere' })
sportsSchema.index({ category: 1, sport: 1 })
sportsSchema.index({ status: 1, featured: 1 })

export const Sports = mongoose.models.Sports || mongoose.model<ISports>('Sports', sportsSchema)
