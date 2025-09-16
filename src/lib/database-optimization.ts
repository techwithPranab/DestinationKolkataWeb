import mongoose from 'mongoose'

// Database optimization utilities
export class DatabaseOptimizer {
  
  // Create database indexes for better query performance
  static async createIndexes(): Promise<void> {
    try {
      console.log('Creating database indexes...')
      
      // Hotel indexes
      const Hotel = mongoose.models.Hotel
      if (Hotel) {
        await Hotel.collection.createIndex({ status: 1, featured: -1, promoted: -1 })
        await Hotel.collection.createIndex({ category: 1, status: 1 })
        await Hotel.collection.createIndex({ 'priceRange.min': 1, 'priceRange.max': 1 })
        await Hotel.collection.createIndex({ 'rating.average': -1, status: 1 })
        await Hotel.collection.createIndex({ 'address.city': 1, status: 1 })
        await Hotel.collection.createIndex({ amenities: 1, status: 1 })
        await Hotel.collection.createIndex({ location: '2dsphere' }) // Geospatial index
        await Hotel.collection.createIndex({ 
          name: 'text', 
          description: 'text', 
          tags: 'text',
          'address.area': 'text'
        })
        console.log('✓ Hotel indexes created')
      }
      
      // Restaurant indexes
      const Restaurant = mongoose.models.Restaurant
      if (Restaurant) {
        await Restaurant.collection.createIndex({ status: 1, featured: -1, promoted: -1 })
        await Restaurant.collection.createIndex({ cuisine: 1, status: 1 })
        await Restaurant.collection.createIndex({ priceRange: 1, status: 1 })
        await Restaurant.collection.createIndex({ avgMealCost: 1, status: 1 })
        await Restaurant.collection.createIndex({ 'rating.average': -1, status: 1 })
        await Restaurant.collection.createIndex({ 'address.area': 1, status: 1 })
        await Restaurant.collection.createIndex({ location: '2dsphere' })
        await Restaurant.collection.createIndex({ 
          name: 'text', 
          description: 'text', 
          tags: 'text',
          cuisine: 'text',
          'address.area': 'text'
        })
        console.log('✓ Restaurant indexes created')
      }
      
      // Attraction indexes
      const Attraction = mongoose.models.Attraction
      if (Attraction) {
        await Attraction.collection.createIndex({ status: 1, featured: -1, promoted: -1 })
        await Attraction.collection.createIndex({ category: 1, status: 1 })
        await Attraction.collection.createIndex({ entryFee: 1, status: 1 })
        await Attraction.collection.createIndex({ 'rating.average': -1, status: 1 })
        await Attraction.collection.createIndex({ location: '2dsphere' })
        await Attraction.collection.createIndex({ 
          name: 'text', 
          description: 'text', 
          category: 'text',
          'location.address': 'text'
        })
        console.log('✓ Attraction indexes created')
      }
      
      // Event indexes
      const Event = mongoose.models.Event
      if (Event) {
        await Event.collection.createIndex({ status: 1, eventDate: 1 })
        await Event.collection.createIndex({ category: 1, status: 1 })
        await Event.collection.createIndex({ eventDate: 1, status: 1 })
        await Event.collection.createIndex({ featured: -1, status: 1 })
        await Event.collection.createIndex({ location: '2dsphere' })
        await Event.collection.createIndex({ 
          title: 'text', 
          description: 'text', 
          category: 'text'
        })
        console.log('✓ Event indexes created')
      }
      
      // Review indexes
      const Review = mongoose.models.Review
      if (Review) {
        await Review.collection.createIndex({ entityId: 1, entityType: 1, status: 1 })
        await Review.collection.createIndex({ user: 1, createdAt: -1 })
        await Review.collection.createIndex({ rating: -1, status: 1 })
        await Review.collection.createIndex({ status: 1, createdAt: -1 })
        await Review.collection.createIndex({ 'helpfulUsers.user': 1 })
        console.log('✓ Review indexes created')
      }
      
      // User indexes
      const User = mongoose.models.User
      if (User) {
        await User.collection.createIndex({ email: 1 }, { unique: true })
        await User.collection.createIndex({ role: 1, isActive: 1 })
        await User.collection.createIndex({ createdAt: -1 })
        await User.collection.createIndex({ lastLoginAt: -1 })
        console.log('✓ User indexes created')
      }
      
      console.log('✓ All database indexes created successfully')
    } catch (error) {
      console.error('Error creating database indexes:', error)
      throw error
    }
  }
  
  // Analyze query performance
  static async analyzeQuery(
    collection: string, 
    query: object, 
    options?: object
  ): Promise<unknown> {
    try {
      const db = mongoose.connection.db
      if (!db) throw new Error('Database not connected')
      
      const result = await db.collection(collection).aggregate([
        { $match: query },
        { $explain: 'executionStats' }
      ]).toArray()
      
      return result[0]?.executionStats || null
    } catch (error) {
      console.error('Query analysis error:', error)
      return null
    }
  }
  
  // Get database statistics
  static async getDatabaseStats(): Promise<{
    collections: Array<{
      name: string
      count: number
      avgObjSize: number
      totalIndexSize: number
      indexes: string[]
    }>
    totalSize: number
    dataSize: number
    indexSize: number
  }> {
    try {
      const db = mongoose.connection.db
      if (!db) throw new Error('Database not connected')
      
      const stats = await db.stats()
      const collections = []
      
      const collectionNames = ['hotels', 'restaurants', 'attractions', 'events', 'reviews', 'users']
      
      for (const name of collectionNames) {
        try {
          const collectionStats = await db.collection(name).aggregate([{ $collStats: { storageStats: {} } }]).toArray()
          const storageStats = collectionStats[0]?.storageStats || {}
          const countResult = await db.collection(name).countDocuments()
          const indexes = await db.collection(name).indexes()
          
          collections.push({
            name,
            count: countResult,
            avgObjSize: storageStats.avgObjSize || 0,
            totalIndexSize: storageStats.totalIndexSize || 0,
            indexes: indexes.map((idx: { key: unknown }) => JSON.stringify(idx.key))
          })
        } catch (error) {
          console.warn(`Could not get stats for collection ${name}:`, error)
        }
      }
      
      return {
        collections,
        totalSize: stats.fsTotalSize || 0,
        dataSize: stats.dataSize || 0,
        indexSize: stats.indexSize || 0
      }
    } catch (error) {
      console.error('Error getting database stats:', error)
      throw error
    }
  }
  
  // Optimize aggregation pipelines
  static optimizeAggregationPipeline(pipeline: Record<string, unknown>[]): Record<string, unknown>[] {
    const optimized = [...pipeline]
    
    // Move $match stages as early as possible
    const matchStages = optimized.filter(stage => stage.$match)
    const nonMatchStages = optimized.filter(stage => !stage.$match)
    
    // Move $project stages after $match but before expensive operations
    const projectStages = nonMatchStages.filter(stage => stage.$project)
    const otherStages = nonMatchStages.filter(stage => !stage.$project && !stage.$sort && !stage.$limit && !stage.$skip)
    const sortStages = nonMatchStages.filter(stage => stage.$sort)
    const paginationStages = nonMatchStages.filter(stage => stage.$limit || stage.$skip)
    
    return [
      ...matchStages,
      ...projectStages,
      ...otherStages,
      ...sortStages,
      ...paginationStages
    ]
  }
  
  // Monitor slow queries
  static async enableSlowQueryLogging(): Promise<void> {
    try {
      const db = mongoose.connection.db
      if (!db) throw new Error('Database not connected')
      
      // Enable profiling for slow operations (>100ms)
      await db.admin().command({
        profile: 2,
        slowms: 100,
        sampleRate: 1.0
      })
      
      console.log('✓ Slow query logging enabled')
    } catch (error) {
      console.error('Error enabling slow query logging:', error)
    }
  }
  
  // Get slow queries
  static async getSlowQueries(limit: number = 10): Promise<unknown[]> {
    try {
      const db = mongoose.connection.db
      if (!db) throw new Error('Database not connected')
      
      const slowQueries = await db.collection('system.profile')
        .find({ ts: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        .sort({ ts: -1 })
        .limit(limit)
        .toArray()
      
      return slowQueries
    } catch (error) {
      console.error('Error getting slow queries:', error)
      return []
    }
  }
  
  // Clean up old data
  static async cleanupOldData(): Promise<{
    reviewsDeleted: number
    logsDeleted: number
    sessionsDeleted: number
  }> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      let reviewsDeleted = 0
      let logsDeleted = 0
      let sessionsDeleted = 0
      
      // Clean up rejected reviews older than 30 days
      const Review = mongoose.models.Review
      if (Review) {
        const result = await Review.deleteMany({
          status: 'rejected',
          createdAt: { $lt: thirtyDaysAgo }
        })
        reviewsDeleted = result.deletedCount || 0
      }
      
      // Clean up old log entries (if you have a logs collection)
      const db = mongoose.connection.db
      if (db) {
        try {
          const logResult = await db.collection('logs').deleteMany({
            timestamp: { $lt: sevenDaysAgo }
          })
          logsDeleted = logResult.deletedCount || 0
        } catch (error) {
          console.warn('Logs collection not found or accessible:', error)
        }
        
        try {
          const sessionResult = await db.collection('sessions').deleteMany({
            expires: { $lt: new Date() }
          })
          sessionsDeleted = sessionResult.deletedCount || 0
        } catch (error) {
          console.warn('Sessions collection not found or accessible:', error)
        }
      }
      
      console.log(`✓ Cleanup completed: ${reviewsDeleted} reviews, ${logsDeleted} logs, ${sessionsDeleted} sessions`)
      
      return {
        reviewsDeleted,
        logsDeleted,
        sessionsDeleted
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
      throw error
    }
  }
}

// Query optimization helpers
export class QueryOptimizer {
  
  // Build optimized aggregation pipeline for entity listing
  static buildEntityListingPipeline(
    entityType: string,
    filters: Record<string, unknown>,
    pagination: { page: number; limit: number },
    sorting: { field: string; order: 'asc' | 'desc' }
  ): Record<string, unknown>[] {
    const pipeline: Record<string, unknown>[] = []
    
    // 1. Match stage (most selective filters first)
    const matchStage: Record<string, unknown> = { status: 'active' }
    
    if (filters.category) matchStage.category = filters.category
    if (filters.minPrice || filters.maxPrice) {
      const priceRange: Record<string, unknown> = {}
      if (filters.minPrice) priceRange.$gte = filters.minPrice
      if (filters.maxPrice) priceRange.$lte = filters.maxPrice
      matchStage.priceRange = priceRange
    }
    if (filters.rating) matchStage['rating.average'] = { $gte: filters.rating }
    if (filters.location) matchStage['address.area'] = { $regex: filters.location, $options: 'i' }
    
    pipeline.push({ $match: matchStage })
    
    // 2. Add calculated fields
    pipeline.push({
      $addFields: {
        popularity: {
          $add: [
            { $multiply: ['$rating.average', 0.3] },
            { $multiply: ['$views', 0.0001] },
            { $cond: [{ $eq: ['$featured', true] }, 2, 0] },
            { $cond: [{ $eq: ['$promoted', true] }, 1, 0] }
          ]
        }
      }
    })
    
    // 3. Sort stage
    const sortField = sorting.field === 'popularity' ? 'popularity' : sorting.field
    pipeline.push({
      $sort: { [sortField]: sorting.order === 'desc' ? -1 : 1 }
    })
    
    // 4. Facet for pagination and count
    pipeline.push({
      $facet: {
        data: [
          { $skip: (pagination.page - 1) * pagination.limit },
          { $limit: pagination.limit }
        ],
        count: [
          { $count: 'total' }
        ]
      }
    })
    
    return pipeline
  }
  
  // Build search pipeline with text search
  static buildSearchPipeline(
    searchQuery: string,
    entityTypes: string[],
    pagination: { page: number; limit: number }
  ): Record<string, unknown>[] {
    const pipeline = []
    
    // Text search stage
    pipeline.push({
      $match: {
        $and: [
          { status: 'active' },
          { $text: { $search: searchQuery } }
        ]
      }
    })
    
    // Add text score for relevance
    pipeline.push({
      $addFields: {
        score: { $meta: 'textScore' }
      }
    })
    
    // Sort by relevance
    pipeline.push({
      $sort: { score: { $meta: 'textScore' } }
    })
    
    // Pagination
    pipeline.push(
      { $skip: (pagination.page - 1) * pagination.limit },
      { $limit: pagination.limit }
    )
    
    return pipeline
  }
}

export default {
  DatabaseOptimizer,
  QueryOptimizer
}
