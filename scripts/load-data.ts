#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { Hotel, Restaurant, Attraction, Event, Promotion, Sports } from '../src/models/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '..', 'data', 'ingested')
const BATCH_SIZE = 100 // Process in batches to avoid memory issues

interface LoadStats {
  total: number
  success: number
  failed: number
  skipped: number
}

async function connectToDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata'

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB successfully')
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

async function loadCollection<T>(
  model: mongoose.Model<T>,
  filePath: string,
  collectionName: string
): Promise<LoadStats> {
  const stats: LoadStats = { total: 0, success: 0, failed: 0, skipped: 0 }

  try {
    console.log(`\n📂 Loading ${collectionName} from ${filePath}...`)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return stats
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)

    if (!Array.isArray(data)) {
      console.error(`❌ Invalid data format in ${filePath}. Expected array.`)
      return stats
    }

    stats.total = data.length
    console.log(`📊 Found ${stats.total} ${collectionName} records`)

    // Process in batches
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(data.length / BATCH_SIZE)

      console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`)

      try {
        // Check for existing records to avoid duplicates
        const existingIds = new Set()
        if (collectionName === 'hotels' || collectionName === 'restaurants' || collectionName === 'attractions' || collectionName === 'sports') {
          const existingRecords = await model.find({}, { osmId: 1 }).lean()
          existingRecords.forEach((record: any) => {
            if (record.osmId) existingIds.add(record.osmId)
          })
        }

        const validBatch = batch.filter((item: any) => {
          if (item.osmId && existingIds.has(item.osmId)) {
            stats.skipped++
            return false
          }
          return true
        })

        if (validBatch.length > 0) {
          const result = await model.insertMany(validBatch, {
            ordered: false, // Continue on errors
            lean: true
          })

          stats.success += result.length
          console.log(`✅ Batch ${batchNumber} completed: ${result.length} inserted`)
        } else {
          console.log(`⏭️  Batch ${batchNumber} skipped: all records already exist`)
        }
      } catch (batchError: any) {
        console.error(`❌ Error in batch ${batchNumber}:`, batchError.message)

        // Try individual inserts for failed batch
        for (const item of batch) {
          try {
            await model.create(item)
            stats.success++
          } catch (itemError: any) {
            stats.failed++
            console.error(`❌ Failed to insert item:`, itemError.message)
          }
        }
      }
    }

    console.log(`📈 ${collectionName} loading completed:`)
    console.log(`   Total: ${stats.total}`)
    console.log(`   Success: ${stats.success}`)
    console.log(`   Failed: ${stats.failed}`)
    console.log(`   Skipped: ${stats.skipped}`)

  } catch (error: any) {
    console.error(`❌ Error loading ${collectionName}:`, error.message)
    stats.failed = stats.total
  }

  return stats
}

async function loadAllData(): Promise<void> {
  const overallStats: Record<string, LoadStats> = {
    hotels: { total: 0, success: 0, failed: 0, skipped: 0 },
    restaurants: { total: 0, success: 0, failed: 0, skipped: 0 },
    attractions: { total: 0, success: 0, failed: 0, skipped: 0 },
    events: { total: 0, success: 0, failed: 0, skipped: 0 },
    promotions: { total: 0, success: 0, failed: 0, skipped: 0 },
    sports: { total: 0, success: 0, failed: 0, skipped: 0 }
  }

  console.log('🚀 Starting data loading process...')
  console.log('📁 Data directory:', DATA_DIR)

  // Load each collection
  overallStats.hotels = await loadCollection(Hotel, path.join(DATA_DIR, 'hotels.json'), 'hotels')
  overallStats.restaurants = await loadCollection(Restaurant, path.join(DATA_DIR, 'restaurants.json'), 'restaurants')
  overallStats.attractions = await loadCollection(Attraction, path.join(DATA_DIR, 'attractions.json'), 'attractions')
  overallStats.events = await loadCollection(Event, path.join(DATA_DIR, 'events.json'), 'events')
  overallStats.promotions = await loadCollection(Promotion, path.join(DATA_DIR, 'promotions.json'), 'promotions')
  overallStats.sports = await loadCollection(Sports, path.join(DATA_DIR, 'sports.json'), 'sports')

  // Print overall summary
  console.log('\n🎉 Data loading process completed!')
  console.log('📊 Overall Statistics:')
  console.log('═'.repeat(50))

  const totalRecords = Object.values(overallStats).reduce((sum, stats) => sum + stats.total, 0)
  const totalSuccess = Object.values(overallStats).reduce((sum, stats) => sum + stats.success, 0)
  const totalFailed = Object.values(overallStats).reduce((sum, stats) => sum + stats.failed, 0)
  const totalSkipped = Object.values(overallStats).reduce((sum, stats) => sum + stats.skipped, 0)

  Object.entries(overallStats).forEach(([collection, stats]) => {
    if (stats.total > 0) {
      console.log(`${collection.padEnd(12)}: ${stats.success}/${stats.total} loaded (${stats.skipped} skipped, ${stats.failed} failed)`)
    }
  })

  console.log('═'.repeat(50))
  console.log(`Total Records: ${totalRecords}`)
  console.log(`Successfully Loaded: ${totalSuccess}`)
  console.log(`Skipped (duplicates): ${totalSkipped}`)
  console.log(`Failed: ${totalFailed}`)

  if (totalFailed > 0) {
    console.log('\n⚠️  Some records failed to load. Check the error messages above.')
  }

  if (totalSuccess > 0) {
    console.log('\n✅ Data loading completed successfully!')
    console.log('💡 You can now use the API endpoints to access the loaded data.')
  }
}

async function main(): Promise<void> {
  try {
    await connectToDatabase()
    await loadAllData()
  } catch (error: any) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, closing database connection...')
  await mongoose.connection.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM, closing database connection...')
  await mongoose.connection.close()
  process.exit(0)
})

// Run the script
main().catch((error) => {
  console.error('💥 Unhandled error:', error)
  process.exit(1)
})
