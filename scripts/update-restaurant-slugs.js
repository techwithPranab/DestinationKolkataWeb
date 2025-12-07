const mongoose = require('mongoose');
const { Restaurant } = require('./backend/src/models');
const dbConnect = require('./backend/src/lib/db');

async function updateRestaurantSlugs() {
  try {
    await dbConnect();
    console.log('Connected to database');

    const restaurants = await Restaurant.find({ slug: { $exists: false } });
    console.log(`Found ${restaurants.length} restaurants without slugs`);

    for (const restaurant of restaurants) {
      const slug = restaurant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await Restaurant.findByIdAndUpdate(restaurant._id, { slug });
      console.log(`Updated ${restaurant.name} with slug: ${slug}`);
    }

    console.log('Restaurant slug update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating restaurant slugs:', error);
    process.exit(1);
  }
}

updateRestaurantSlugs();
