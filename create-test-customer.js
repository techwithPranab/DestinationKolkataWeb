const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createTestCustomer() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata');
    await client.connect();
    console.log('Connected to database');

    const db = client.db();
    
    // Check if test customer already exists
    const existingUser = await db.collection('users').findOne({ email: 'test@customer.com' });
    
    if (existingUser) {
      console.log('Test customer already exists:', existingUser.email);
      await client.close();
      return;
    }

    // Create test customer
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testCustomer = {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@customer.com',
      password: hashedPassword,
      role: 'customer',
      phone: '+91-9999999999',
      city: 'Kolkata',
      membershipType: 'free',
      status: 'active',
      emailVerified: true,
      profile: {},
      preferences: {},
      verification: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(testCustomer);
    console.log('Test customer created successfully:', result.insertedId);
    console.log('Login credentials: test@customer.com / password123');

    await client.close();
  } catch (error) {
    console.error('Error creating test customer:', error);
  }
}

createTestCustomer();
