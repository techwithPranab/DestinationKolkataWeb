import mongoose from 'mongoose';
import { Hotel } from '../src/models/index.js';

async function updateHotelSlugs() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata';
    await mongoose.connect(mongoUri);

    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels to update`);

    for (const hotel of hotels) {
      const slug = hotel.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await Hotel.findByIdAndUpdate(hotel._id, { slug });
      console.log(`Updated ${hotel.name} with slug: ${slug}`);
    }

    console.log('All hotels updated with slugs');
    process.exit(0);
  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  }
}

updateHotelSlugs();
