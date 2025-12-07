import mongoose from 'mongoose';
import { Restaurant } from '../src/models';
import dbConnect from '../src/lib/db';

async function updateAllRestaurantSlugs() {
  try {
    await dbConnect();
    console.log('Connected to database');

    // Get all restaurants without slugs
    const restaurants = await Restaurant.find({ slug: { $exists: false } }).exec();
    console.log(`Found ${restaurants.length} restaurants without slugs`);

    // Prepare bulk operations
    const bulkOps = restaurants.map(restaurant => ({
      updateOne: {
        filter: { _id: restaurant._id },
        update: { 
          $set: { 
            slug: restaurant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      const result = await Restaurant.bulkWrite(bulkOps);
      console.log(`Bulk update completed. Modified ${result.modifiedCount} documents`);
    }

    console.log('Restaurant slug update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating restaurant slugs:', error);
    process.exit(1);
  }
}

updateAllRestaurantSlugs();
