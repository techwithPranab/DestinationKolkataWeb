import mongoose from 'mongoose';
import { Hotel } from '../src/models/index.js';

async function fixHotelSlugs() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata';
    await mongoose.connect(mongoUri);

    // First, remove all existing slugs to start fresh
    await Hotel.updateMany({}, { $unset: { slug: 1 } });
    console.log('Cleared all existing slugs');

    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels to update`);

    const usedSlugs = new Set();

    for (const hotel of hotels) {
      let baseSlug = hotel.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Handle empty slugs (e.g., from non-ASCII names)
      if (!baseSlug) {
        baseSlug = `hotel-${hotel._id.toString().slice(-6)}`;
      }
      
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Handle duplicates by appending a number
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      usedSlugs.add(finalSlug);
      
      await Hotel.findByIdAndUpdate(hotel._id, { slug: finalSlug });
      console.log(`Updated ${hotel.name} with slug: ${finalSlug}`);
    }

    console.log('All hotels updated with unique slugs');
    process.exit(0);
  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  }
}

fixHotelSlugs();
