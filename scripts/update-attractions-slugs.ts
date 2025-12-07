import mongoose from 'mongoose';
import { Attraction } from '../src/models';
import dbConnect from '../src/lib/db';

async function updateAttractionSlugs() {
  try {
    await dbConnect();
    console.log('Connected to database');

    const attractions = await Attraction.find({ slug: { $exists: false } }).exec();
    console.log(`Found ${attractions.length} attractions without slugs`);

    for (const attraction of attractions) {
      const slug = attraction.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      attraction.slug = slug;
      await attraction.save();
      console.log(`Updated ${attraction.name} with slug: ${slug}`);
    }

    console.log('Attraction slug update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating attraction slugs:', error);
    process.exit(1);
  }
}

updateAttractionSlugs();
