#!/usr/bin/env node

// Simple script to generate admin user setup information
const bcrypt = require('bcryptjs')

async function generateAdminInfo() {
  console.log('🔐 Admin User Setup Information')
  console.log('================================\n')

  // Generate hashed password
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 12)

  console.log('📋 Default Admin Credentials:')
  console.log('Email: admin@destinationkolkata.com')
  console.log('Password: admin123')
  console.log('Role: admin')
  console.log('')

  console.log('🔒 Hashed Password (for manual database insertion):')
  console.log(hashedPassword)
  console.log('')

  console.log('📄 MongoDB Insert Command:')
  console.log(`db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@destinationkolkata.com",
  password: "${hashedPassword}",
  role: "admin",
  phone: "+91-9876543210",
  city: "Kolkata",
  membershipType: "premium",
  status: "active",
  emailVerified: true,
  profile: {
    bio: "System Administrator for Destination Kolkata",
    location: {
      city: "Kolkata",
      state: "West Bengal",
      country: "India"
    }
  },
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    language: "en",
    currency: "INR"
  },
  verification: {
    email: true,
    phone: true,
    business: false
  },
  createdAt: new Date(),
  updatedAt: new Date()
})`)

  console.log('')
  console.log('🚀 Next Steps:')
  console.log('1. Connect to your MongoDB database')
  console.log('2. Run the insert command above')
  console.log('3. Visit /admin/login to access the admin panel')
  console.log('4. Change the default password immediately!')
  console.log('')

  console.log('📖 For detailed instructions, see: ADMIN_USER_SETUP.md')
}

generateAdminInfo().catch(console.error)
