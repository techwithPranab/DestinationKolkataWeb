const mongoose = require('mongoose');

async function testConnection() {
  const uri = 'mongodb+srv://pranabpiitk2024:Kolkata%401984@cluster0.vhghaza.mongodb.net/destination-kolkata?retryWrites=true&w=majority';

  console.log('🔍 Testing MongoDB Atlas connection...');

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected successfully to MongoDB Atlas');

    // Test ping
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');

    // Check if users collection exists and has data
    const collections = await mongoose.connection.db.listCollections().toArray();
    const usersCollection = collections.find(col => col.name === 'users');
    console.log('📊 Users collection exists:', !!usersCollection);

    if (usersCollection) {
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log('👥 Users in database:', userCount);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
