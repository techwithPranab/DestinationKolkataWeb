/**
 * Database Migration Script - Add createdBy field to existing listings
 * 
 * This script adds the 'createdBy' field to all existing listings in the database.
 * For listings without this field, it sets the value to null, which allows backward compatibility.
 * 
 * Usage:
 *   npm run migrate:createdby
 * 
 * Or run directly:
 *   npx ts-node scripts/migrate-createdby.ts
 */

import { connectToDatabase } from '../src/lib/mongodb';
import { ObjectId } from 'mongodb';

async function migrateCreatedByField() {
  console.log('🚀 Starting migration: Add createdBy field to listings...\n');

  try {
    const { db } = await connectToDatabase();
    
    // Collections to migrate
    const collections = [
      'hotels',
      'restaurants',
      'attractions',
      'events',
      'sports',
      'promotions',
      'travels'
    ];

    let totalUpdated = 0;

    for (const collectionName of collections) {
      console.log(`\n📦 Processing collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      
      // Count documents without createdBy field
      const countWithoutCreatedBy = await collection.countDocuments({
        createdBy: { $exists: false }
      });

      console.log(`   Found ${countWithoutCreatedBy} documents without 'createdBy' field`);

      if (countWithoutCreatedBy > 0) {
        // Update documents without createdBy field
        const result = await collection.updateMany(
          { createdBy: { $exists: false } },
          { 
            $set: { 
              createdBy: null,
              updatedAt: new Date()
            } 
          }
        );

        console.log(`   ✅ Updated ${result.modifiedCount} documents`);
        totalUpdated += result.modifiedCount;
      } else {
        console.log(`   ℹ️  No documents to update`);
      }
    }

    console.log(`\n\n✅ Migration completed successfully!`);
    console.log(`📊 Total documents updated: ${totalUpdated}`);
    
    // Optional: Find an admin user to assign ownership
    console.log(`\n💡 Note: Documents with createdBy=null can be edited by any admin.`);
    console.log(`   To assign ownership to a specific admin, run:`);
    console.log(`   db.<collection>.updateMany({ createdBy: null }, { $set: { createdBy: ObjectId("ADMIN_USER_ID") } })`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Execute migration
migrateCreatedByField()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
