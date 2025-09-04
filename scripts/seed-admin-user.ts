import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Define User interface for the seed script
interface IUser {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  phone: string
  city: string
  membershipType: string
  status: string
  emailVerified: boolean
  profile?: object
  preferences?: object
  verification?: object
  createdAt: Date
  updatedAt: Date
}

async function seedAdminUser() {
  try {
    console.log('🔄 Connecting to database...')

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata'

    console.log('📍 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'))

    // Connect to MongoDB with explicit options
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: false, // Disable mongoose buffering
    })

    console.log('✅ Connected to database successfully!')

    // Define User schema for this script
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'user' },
      phone: String,
      city: String,
      membershipType: { type: String, default: 'free' },
      status: { type: String, default: 'active' },
      emailVerified: { type: Boolean, default: false },
      profile: Object,
      preferences: Object,
      verification: Object,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    })

    // Create User model
    const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

    // Check if admin user already exists
    console.log('🔍 Checking for existing admin user...')
    const existingAdmin = await User.findOne({ role: 'admin' })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!')
      console.log('📧 Email:', existingAdmin.email)
      console.log('🔗 Admin Panel: /admin/login')
      console.log('')
      console.log('💡 You can use this account to login to the admin panel.')
      await mongoose.disconnect()
      process.exit(0)
    }

    console.log('🆕 Creating new admin user...')

    // Admin user data
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@destinationkolkata.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      phone: '+91-9876543210',
      city: 'Kolkata',
      membershipType: 'premium',
      status: 'active',
      emailVerified: true,
      profile: {
        bio: 'System Administrator for Destination Kolkata',
        location: {
          city: 'Kolkata',
          state: 'West Bengal',
          country: 'India'
        }
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR'
      },
      verification: {
        email: true,
        phone: true,
        business: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Create admin user
    const adminUser = new User(adminData)
    await adminUser.save()

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@destinationkolkata.com')
    console.log('🔑 Password: admin123')
    console.log('🔗 Admin Panel: /admin/login')
    console.log('')
    console.log('⚠️  IMPORTANT: Please change the default password after first login!')
    console.log('')

    await mongoose.disconnect()
    console.log('🔌 Database connection closed.')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error seeding admin user:', error)

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('')
        console.log('💡 Troubleshooting tips:')
        console.log('1. Make sure MongoDB is running: brew services start mongodb-community')
        console.log('2. Check if MongoDB is listening on the correct port: lsof -i :27017')
        console.log('3. Verify your MONGODB_URI in .env.local')
      } else if (error.message.includes('authentication failed')) {
        console.log('')
        console.log('💡 Troubleshooting tips:')
        console.log('1. Check your MongoDB credentials in MONGODB_URI')
        console.log('2. Make sure the database user has write permissions')
        console.log('3. Try using the local MongoDB URI: mongodb://localhost:27017/destination-kolkata')
      }
    }

    process.exit(1)
  }
}

seedAdminUser()
