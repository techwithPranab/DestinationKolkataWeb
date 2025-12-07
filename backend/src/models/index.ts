import mongoose, { Schema, Document } from 'mongoose'

// Base Location Schema for GeoJSON
const locationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    index: '2dsphere'
  }
})

// Common fields for all listings
const baseListingSchema = {
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  images: [{ 
    url: String, 
    alt: String, 
    isPrimary: { type: Boolean, default: false } 
  }],
  location: {
    type: locationSchema,
    required: true
  },
  address: {
    street: String,
    area: String,
    city: { type: String, default: 'Kolkata' },
    state: { type: String, default: 'West Bengal' },
    pincode: String,
    landmark: String
  },
  contact: {
    phone: [String],
    email: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 }
  },
  amenities: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'pending'
  },
  featured: { type: Boolean, default: false },
  promoted: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verificationDate: Date
}

// Hotel Schema
export interface IHotel extends Document {
  name: string
  description: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  priceRange: {
    min: number
    max: number
    currency: string
  }
  roomTypes: Array<{
    name: string
    price: number
    capacity: number
    amenities: string[]
    images: string[]
    available: boolean
  }>
  checkInTime: string
  checkOutTime: string
  cancellationPolicy: string
  policies: string[]
  category: string
}

const hotelSchema = new Schema({
  ...baseListingSchema,
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  roomTypes: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    amenities: [String],
    images: [String],
    available: { type: Boolean, default: true }
  }],
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '12:00' },
  cancellationPolicy: String,
  policies: [String],
  category: {
    type: String,
    enum: ['Luxury', 'Business', 'Budget', 'Boutique', 'Resort', 'Heritage'],
    required: true
  },
  slug: { type: String, unique: true, sparse: true }
})

// Virtual for URL slug
hotelSchema.virtual('urlSlug').get(function() {
  return this.slug || this.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
})

// Pre-save hook to generate slug
hotelSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
  next()
})

// Restaurant Schema
export interface IRestaurant extends Document {
  name: string
  description: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  cuisine: string[]
  priceRange: string
  openingHours: object
  menu: Array<{
    category: string
    items: Array<{
      name: string
      price: number
      description: string
      isVeg: boolean
      isVegan: boolean
      spiceLevel: number
    }>
  }>
}

const restaurantSchema = new Schema({
  ...baseListingSchema,
  cuisine: [{ type: String, required: true }],
  priceRange: {
    type: String,
    enum: ['Budget', 'Mid-range', 'Fine Dining', 'Luxury'],
    required: true
  },
  openingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  menu: [{
    category: { type: String, required: true },
    items: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: String,
      isVeg: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      spiceLevel: { type: Number, min: 0, max: 5, default: 0 },
      image: String
    }]
  }],
  deliveryPartners: [String],
  reservationRequired: { type: Boolean, default: false },
  avgMealCost: { type: Number },
  slug: { type: String, unique: true, sparse: true }
})

// Virtual for URL slug
restaurantSchema.virtual('urlSlug').get(function() {
  return this.slug || this.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
})

// Pre-save hook to generate slug
restaurantSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
  next()
})

// Attraction Schema
export interface IAttraction extends Document {
  name: string
  description: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  category: string
  entryFee: {
    adult: number
    child: number
    senior: number
    currency: string
  }
  timings: object
  bestTimeToVisit: string
  duration: string
}

const attractionSchema = new Schema({
  ...baseListingSchema,
  category: {
    type: String,
    enum: ['Historical', 'Religious', 'Museums', 'Parks', 'Architecture', 'Cultural', 'Educational', 'Entertainment'],
    required: true
  },
  entryFee: {
    adult: { type: Number, default: 0 },
    child: { type: Number, default: 0 },
    senior: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isFree: { type: Boolean, default: false }
  },
  timings: {
    open: String,
    close: String,
    closedDays: [String],
    specialHours: [{
      date: Date,
      open: String,
      close: String,
      note: String
    }]
  },
  bestTimeToVisit: String,
  duration: String, // e.g., "2-3 hours"
  guidedTours: {
    available: { type: Boolean, default: false },
    languages: [String],
    price: Number,
    duration: String
  },
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: false },
    parkingAvailable: { type: Boolean, default: false },
    publicTransport: String
  },
  slug: { type: String, unique: true, sparse: true }
})

// Virtual for URL slug
attractionSchema.virtual('urlSlug').get(function() {
  return this.slug || this.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
})

// Pre-save hook to generate slug
attractionSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
  next()
})

// Event Schema
export interface IEvent extends Document {
  name: string
  description: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  category: string
  startDate: Date
  endDate: Date
  ticketPrice: {
    min: number
    max: number
    currency: string
  }
  organizer: object
  capacity: number
  isRecurring: boolean
}

const eventSchema = new Schema({
  ...baseListingSchema,
  category: {
    type: String,
    enum: ['Concerts', 'Festivals', 'Theater', 'Sports', 'Workshops', 'Exhibitions', 'Cultural', 'Religious', 'Food'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: String,
  endTime: String,
  ticketPrice: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isFree: { type: Boolean, default: false }
  },
  organizer: {
    name: { type: String, required: true },
    contact: String,
    email: String,
    website: String
  },
  venue: {
    name: String,
    capacity: Number,
    type: String // Indoor, Outdoor, Virtual
  },
  ticketing: {
    bookingUrl: String,
    bookingPhone: String,
    advanceBookingRequired: { type: Boolean, default: false },
    refundPolicy: String
  },
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: String,
  ageRestriction: String,
  dresscode: String
})

// User Schema
export interface IUser extends Document {
  firstName?: string
  lastName?: string
  name?: string
  email: string
  password?: string
  role: string
  provider?: string
  providerId?: string
  profile?: object
  preferences?: object
  resetToken?: string
  resetTokenExpiry?: Date
  phone?: string
  businessName?: string
  businessType?: string
  city?: string
  membershipType?: string
  status?: string
  emailVerified?: boolean
  lastLogin?: Date
  bookingHistory?: Array<{
    type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
    itemId: mongoose.Types.ObjectId
    itemName: string
    bookingDate: Date
    visitDate?: Date
    status: 'confirmed' | 'cancelled' | 'completed'
    amount?: number
    currency?: string
    notes?: string
  }>
  wishlist?: Array<{
    type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports'
    itemId: mongoose.Types.ObjectId
    itemName: string
    addedDate: Date
    notes?: string
  }>
}

const userSchema = new Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  name: { type: String, trim: true }, // For backward compatibility
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // Made optional for OAuth users
  role: {
    type: String,
    enum: ['user', 'business', 'admin', 'moderator', 'customer'],
    default: 'customer'
  },
  provider: { type: String, enum: ['google', 'facebook', 'local'] },
  providerId: { type: String },
  phone: String,
  businessName: String,
  businessType: String,
  city: String,
  membershipType: { type: String, default: 'free' },
  membershipStatus: { type: String, default: 'active' },
  membershipStartDate: Date,
  membershipExpiryDate: Date,
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  lastPaymentDate: Date,
  billingInfo: {
    firstName: String,
    lastName: String,
    company: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    gstNumber: String
  },
  status: { type: String, default: 'active' },
  emailVerified: { type: Boolean, default: false },
  profile: {
    avatar: String,
    phone: String,
    dateOfBirth: Date,
    gender: String,
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' }
    },
    interests: [String],
    bio: String
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' }
  },
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    business: { type: Boolean, default: false }
  },
  resetToken: String,
  resetTokenExpiry: Date,
  lastLogin: Date,
  bookingHistory: [{
    type: {
      type: String,
      enum: ['hotel', 'restaurant', 'attraction', 'event', 'sports'],
      required: true
    },
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemName: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
    visitDate: Date,
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed'
    },
    amount: Number,
    currency: { type: String, default: 'INR' },
    notes: String
  }],
  wishlist: [{
    type: {
      type: String,
      enum: ['hotel', 'restaurant', 'attraction', 'event', 'sports'],
      required: true
    },
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemName: { type: String, required: true },
    addedDate: { type: Date, default: Date.now },
    notes: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Trip Schema
export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  startDate: Date
  endDate: Date
  destinations: Array<{
    location: {
      name: string
      coordinates: [number, number]
    }
    arrivalDate: Date
    departureDate: Date
    activities: Array<{
      type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports' | 'transport'
      itemId?: mongoose.Types.ObjectId
      itemName: string
      time?: Date
      notes?: string
    }>
    notes?: string
  }>
  totalBudget?: number
  currency: string
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled'
  isPublic: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
export interface ITravel extends Document {
  name: string
  description: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  category: string
  transportType: 'air' | 'train' | 'bus' | 'taxi' | 'metro' | 'tram'
  from: string
  to: string
  duration: string
  frequency: string
  priceRange: {
    min: number
    max: number
    currency: string
  }
  contact: {
    phone: string
    email?: string
    website?: string
  }
  features: string[]
  operatingHours?: {
    open: string
    close: string
    closedDays: string[]
  }
  isActive: boolean
}

const travelSchema = new Schema({
  ...baseListingSchema,
  category: {
    type: String,
    enum: ['Transport', 'TravelTip', 'Emergency', 'General'],
    required: true
  },
  transportType: {
    type: String,
    enum: ['air', 'train', 'bus', 'taxi', 'metro', 'tram']
  },
  from: { type: String, required: true },
  to: { type: String, required: true },
  duration: { type: String, required: true },
  frequency: { type: String, required: true },
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  contact: {
    phone: { type: String, required: true },
    email: String,
    website: String
  },
  features: [String],
  operatingHours: {
    open: String,
    close: String,
    closedDays: [String]
  },
  isActive: { type: Boolean, default: true }
})

// Travel Tips Schema
export interface ITravelTip extends Document {
  title: string
  description: string
  category: 'general' | 'transport' | 'safety' | 'culture' | 'food' | 'shopping'
  icon: string
  priority: number
  isActive: boolean
}

const travelTipSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['general', 'transport', 'safety', 'culture', 'food', 'shopping'],
    required: true
  },
  icon: { type: String, required: true },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Trip Schema
export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  startDate: Date
  endDate: Date
  destinations: Array<{
    location: {
      name: string
      coordinates: [number, number]
    }
    arrivalDate: Date
    departureDate: Date
    activities: Array<{
      type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports' | 'transport'
      itemId?: mongoose.Types.ObjectId
      itemName: string
      time?: Date
      notes?: string
    }>
    notes?: string
  }>
  totalBudget?: number
  currency: string
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled'
  isPublic: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const tripSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  destinations: [{
    location: {
      name: { type: String, required: true },
      coordinates: { type: [Number], required: true }
    },
    arrivalDate: { type: Date, required: true },
    departureDate: { type: Date, required: true },
    activities: [{
      type: {
        type: String,
        enum: ['hotel', 'restaurant', 'attraction', 'event', 'sports', 'transport'],
        required: true
      },
      itemId: { type: Schema.Types.ObjectId },
      itemName: { type: String, required: true },
      time: Date,
      notes: String
    }],
    notes: String
  }],
  totalBudget: Number,
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'completed', 'cancelled'],
    default: 'planning'
  },
  isPublic: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Create indexes
tripSchema.index({ userId: 1, createdAt: -1 })
tripSchema.index({ status: 1, startDate: 1 })

// Emergency Contacts Schema
export interface IEmergencyContact extends Document {
  service: string
  number: string
  description: string
  category: 'police' | 'medical' | 'fire' | 'tourist' | 'other'
  isActive: boolean
}

const emergencyContactSchema = new Schema({
  service: { type: String, required: true },
  number: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['police', 'medical', 'fire', 'tourist', 'other'],
    required: true
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

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
  source: { type: String, default: 'OpenStreetMap' }
}, {
  timestamps: true
})

// Create indexes
sportsSchema.index({ location: '2dsphere' })
sportsSchema.index({ category: 1, sport: 1 })
sportsSchema.index({ status: 1, featured: 1 })

// Promotion Schema
export interface IPromotion extends Document {
  title: string
  description: string
  business: mongoose.Types.ObjectId
  discountPercent: number
  validFrom: Date
  validUntil: Date
  code: string
  isActive: boolean
}

const promotionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  business: { type: Schema.Types.ObjectId, required: true, refPath: 'businessType' },
  businessType: {
    type: String,
    required: true,
    enum: ['Hotel', 'Restaurant', 'Attraction', 'Event']
  },
  discountPercent: { type: Number, min: 0, max: 100 },
  discountAmount: Number,
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  code: { type: String, uppercase: true, sparse: true },
  minAmount: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  terms: [String],
  createdAt: { type: Date, default: Date.now }
})

// Contact Schema
export interface IContact extends Document {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: Date
  updatedAt: Date
  respondedAt?: Date
  response?: string
  respondedBy?: mongoose.Types.ObjectId
  // View tracking fields
  viewedAt?: Date
  viewedBy?: mongoose.Types.ObjectId
  viewCount?: number
}

const contactSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'business', 'advertising', 'partnership', 'technical', 'feedback', 'other'],
    default: 'general'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  response: String,
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // View tracking fields
  viewedAt: Date,
  viewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  viewCount: { type: Number, default: 0 }
})

// Feedback Schema
export interface IFeedback extends Document {
  type: 'general' | 'bug' | 'feature' | 'content' | 'design' | 'other'
  subject: string
  message: string
  email?: string
  rating?: number
  likes?: string[]
  dislikes?: string[]
  status: 'new' | 'reviewed' | 'implemented' | 'declined'
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: Date
  updatedAt: Date
  reviewedAt?: Date
  reviewedBy?: mongoose.Types.ObjectId
  notes?: string
  // View tracking fields
  viewedAt?: Date
  viewedBy?: mongoose.Types.ObjectId
  viewCount?: number
}

const feedbackSchema = new Schema({
  type: {
    type: String,
    enum: ['general', 'bug', 'feature', 'content', 'design', 'other'],
    required: true
  },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  rating: { type: Number, min: 1, max: 5 },
  likes: [String],
  dislikes: [String],
  status: {
    type: String,
    enum: ['new', 'reviewed', 'implemented', 'declined'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['website', 'mobile', 'content', 'features', 'performance', 'other'],
    default: 'website'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  // View tracking fields
  viewedAt: Date,
  viewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  viewCount: { type: Number, default: 0 }
})

// Submission Schema
export interface ISubmission extends Document {
  type: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports' | 'travel'
  title: string
  description: string
  userId: mongoose.Types.ObjectId
  submissionData: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  adminId?: mongoose.Types.ObjectId
  adminNotes?: string
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const submissionSchema = new Schema({
  type: {
    type: String,
    enum: ['hotel', 'restaurant', 'attraction', 'event', 'sports', 'travel'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submissionData: { type: Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  adminNotes: String,
  processedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Report Issue Schema
export interface IReportIssue extends Document {
  type: 'inaccurate' | 'outdated' | 'closed' | 'inappropriate' | 'spam' | 'other'
  businessName: string
  location?: string
  description: string
  evidence?: string
  email?: string
  status: 'new' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: Date
  updatedAt: Date
  investigatedAt?: Date
  investigatedBy?: mongoose.Types.ObjectId
  resolution?: string
  actionTaken?: string
  // View tracking fields
  viewedAt?: Date
  viewedBy?: mongoose.Types.ObjectId
  viewCount?: number
}

const reportIssueSchema = new Schema({
  type: {
    type: String,
    enum: ['inaccurate', 'outdated', 'closed', 'inappropriate', 'spam', 'other'],
    required: true
  },
  businessName: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  description: { type: String, required: true },
  evidence: { type: String },
  email: { type: String, lowercase: true, trim: true },
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved', 'dismissed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['business', 'attraction', 'event', 'restaurant', 'hotel', 'travel', 'other'],
    default: 'other'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  investigatedAt: Date,
  investigatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  actionTaken: String,
  // View tracking fields
  viewedAt: Date,
  viewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  viewCount: { type: Number, default: 0 }
})

// Settings Schema
export interface ISetting extends Document {
  category: string
  key: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
  isPublic: boolean
  updatedBy?: mongoose.Types.ObjectId
  updatedAt: Date
}

const settingSchema = new Schema({
  category: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  description: String,
  isPublic: { type: Boolean, default: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
})

// Create indexes
hotelSchema.index({ location: '2dsphere' })
hotelSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 })
hotelSchema.index({ category: 1, status: 1 })

restaurantSchema.index({ location: '2dsphere' })
restaurantSchema.index({ cuisine: 1, priceRange: 1 })
restaurantSchema.index({ status: 1, featured: 1 })

attractionSchema.index({ location: '2dsphere' })
attractionSchema.index({ category: 1, status: 1 })

eventSchema.index({ location: '2dsphere' })
eventSchema.index({ startDate: 1, endDate: 1 })
eventSchema.index({ category: 1, status: 1 })

travelSchema.index({ location: '2dsphere' })
travelSchema.index({ category: 1, transportType: 1 })
travelSchema.index({ status: 1, isActive: 1 })

travelTipSchema.index({ category: 1, isActive: 1 })
emergencyContactSchema.index({ category: 1, isActive: 1 })

// userSchema.index({ email: 1 }) // Removed - unique constraint already creates index
promotionSchema.index({ validFrom: 1, validUntil: 1 })

// Export models
export const Hotel = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', hotelSchema)
export const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', restaurantSchema)
export const Attraction = mongoose.models.Attraction || mongoose.model<IAttraction>('Attraction', attractionSchema)
export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema)
export const Travel = mongoose.models.Travel || mongoose.model<ITravel>('Travel', travelSchema)
export const TravelTip = mongoose.models.TravelTip || mongoose.model<ITravelTip>('TravelTip', travelTipSchema)
export const Trip = mongoose.models.Trip || mongoose.model<ITrip>('Trip', tripSchema)
export const EmergencyContact = mongoose.models.EmergencyContact || mongoose.model<IEmergencyContact>('EmergencyContact', emergencyContactSchema)
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
export const Promotion = mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', promotionSchema)
export const Sports = mongoose.models.Sports || mongoose.model<ISports>('Sports', sportsSchema)
export const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema)
export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema)
export const ReportIssue = mongoose.models.ReportIssue || mongoose.model<IReportIssue>('ReportIssue', reportIssueSchema)
export const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', submissionSchema)
export const Setting = mongoose.models.Setting || mongoose.model<ISetting>('Setting', settingSchema)

// Import and export Review model
export { Review } from './Review'
