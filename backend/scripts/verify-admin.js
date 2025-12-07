#!/usr/bin/env node

// Script to verify admin user creation
const { MongoClient } = require('mongodb')

async function verifyAdminUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata'

  console.log('🔍 Verifying admin user creation...')
  console.log('📍 MongoDB URI:', uri.replace(/\/\/.*@/, '//***:***@'))

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    const db = client.db('destination-kolkata')
    const usersCollection = db.collection('users')

    // Find admin user
    const adminUser = await usersCollection.findOne({ role: 'admin' })

    if (adminUser) {
      console.log('✅ Admin user found!')
      console.log('📧 Email:', adminUser.email)
      console.log('👤 Name:', `${adminUser.firstName} ${adminUser.lastName}`)
      console.log('📞 Phone:', adminUser.phone)
      console.log('🏙️  City:', adminUser.city)
      console.log('📊 Status:', adminUser.status)
      console.log('⭐ Membership:', adminUser.membershipType)
      console.log('✅ Email Verified:', adminUser.emailVerified)
      console.log('🕒 Created:', adminUser.createdAt)
      console.log('')
      console.log('🚀 You can now login to /admin/login with:')
      console.log('   Email: admin@destinationkolkata.com')
      console.log('   Password: admin123')
    } else {
      console.log('❌ Admin user not found in database')
      console.log('💡 Try running: npm run seed-admin')
    }

    // Count total users
    const userCount = await usersCollection.countDocuments()
    console.log(`👥 Total users in database: ${userCount}`)

  } catch (error) {
    console.error('❌ Error verifying admin user:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Database connection closed')
  }
}

verifyAdminUser()
