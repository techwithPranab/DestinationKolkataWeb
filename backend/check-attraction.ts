import mongoose from 'mongoose';
import { Attraction } from './src/models';

async function checkSlugs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/destination-kolkata');
    console.log('Connected to database:', mongoose.connection.db?.databaseName);
    console.log('Connection ready state:', mongoose.connection.readyState);

    const attractions = await Attraction.find({ slug: { $exists: true } }).limit(5);
    console.log('Attractions with slugs:');
    attractions.forEach(attr => {
      console.log(`Name: ${attr.name}, Slug: ${attr.slug}`);
    });

    if (attractions.length === 0) {
      console.log('No attractions with slugs found. Checking total attractions...');
      const total = await Attraction.countDocuments();
      console.log(`Total attractions in database: ${total}`);

      // Check one attraction to see its structure
      const sample = await Attraction.findOne({});
      if (sample) {
        console.log('Sample attraction keys:', Object.keys(sample.toObject()));
        console.log('Sample attraction name:', sample.name);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSlugs();
