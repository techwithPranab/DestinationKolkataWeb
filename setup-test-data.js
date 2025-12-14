const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

async function setupTestData() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata');
    await client.connect();
    console.log('Connected to database');

    const db = client.db();

    // Find the test user
    const testUser = await db.collection('users').findOne({ email: 'test@customer.com' });
    if (!testUser) {
      console.log('Test user not found, creating one...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      const result = await db.collection('users').insertOne({
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
      });
      console.log('Test user created:', result.insertedId);
      return;
    }

    console.log('Test user found:', testUser._id.toString());

    // Check existing submissions
    const existingSubmissions = await db.collection('submissions').find({ userId: testUser._id }).toArray();
    console.log('Existing submissions:', existingSubmissions.length);

    if (existingSubmissions.length === 0) {
      console.log('Creating test submissions...');

      const testSubmissions = [
        {
          userId: testUser._id,
          type: 'hotel',
          title: 'Test Hotel - Taj Bengal',
          status: 'approved',
          data: {
            name: 'Test Hotel - Taj Bengal',
            description: 'A luxury hotel in Kolkata',
            address: '34B, Belvedere Road, Alipore, Kolkata',
            phone: '+91-33-2223-3000',
            email: 'reservations@tajhotels.com',
            website: 'https://www.tajhotels.com',
            amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
            priceRange: '$$$$',
            rating: 4.5,
            images: []
          },
          views: 150,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          updatedAt: new Date()
        },
        {
          userId: testUser._id,
          type: 'restaurant',
          title: 'Test Restaurant - 6 Ballygunge Place',
          status: 'pending',
          data: {
            name: 'Test Restaurant - 6 Ballygunge Place',
            description: 'Fine dining restaurant in Kolkata',
            address: '6 Ballygunge Place, Kolkata',
            phone: '+91-33-2464-6410',
            cuisine: 'Multi-cuisine',
            priceRange: '$$$',
            rating: 4.2,
            images: []
          },
          views: 75,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date()
        },
        {
          userId: testUser._id,
          type: 'event',
          title: 'Test Event - Kolkata Book Fair',
          status: 'rejected',
          data: {
            name: 'Test Event - Kolkata Book Fair',
            description: 'Annual book fair in Kolkata',
            venue: 'Milan Mela Ground, Kolkata',
            date: '2025-01-15',
            time: '10:00 AM - 8:00 PM',
            category: 'Cultural',
            images: []
          },
          views: 25,
          adminNotes: 'Event date has already passed',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date()
        }
      ];

      const result = await db.collection('submissions').insertMany(testSubmissions);
      console.log('Test submissions created:', result.insertedCount);
    }

    // Show final stats
    const finalSubmissions = await db.collection('submissions').find({ userId: testUser._id }).toArray();
    const stats = {
      total: finalSubmissions.length,
      approved: finalSubmissions.filter(s => s.status === 'approved').length,
      pending: finalSubmissions.filter(s => s.status === 'pending').length,
      rejected: finalSubmissions.filter(s => s.status === 'rejected').length,
      totalViews: finalSubmissions.reduce((sum, s) => sum + (s.views || 0), 0)
    };

    console.log('Final stats for test user:', stats);

    await client.close();
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}

setupTestData();
