import mongoose from 'mongoose'
import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  // During build time, don't throw error - just log warning
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE?.includes('build')) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    )
  }
  console.warn('MONGODB_URI not found - database operations will be skipped during build')
}

declare global {
  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  } | undefined
  var mongoClient: {
    client: MongoClient | null
    promise: Promise<MongoClient> | null
  } | undefined
}

let cached = global.mongoose ?? { conn: null, promise: null }
let clientCached = global.mongoClient ?? { client: null, promise: null }

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

if (!clientCached) {
  clientCached = global.mongoClient = { client: null, promise: null }
}

async function connectDB(): Promise<mongoose.Connection> {
  // If no MongoDB URI, return a mock connection for build time
  if (!MONGODB_URI) {
    console.warn('No MONGODB_URI provided - returning mock connection for build time')
    // Return a mock connection object that won't break the build
    return {} as mongoose.Connection
  }

  if (cached.conn) {
    return cached.conn
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased from 5000 to 10000ms
      socketTimeoutMS: 60000, // Increased from 45000 to 60000ms
      connectTimeoutMS: 10000,
      family: 4,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB')
      return mongoose.connection
    })
  }
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('MongoDB connection error:', e)
    throw e
  }

  return cached.conn
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found')
  }

  if (clientCached.client) {
    return {
      client: clientCached.client,
      db: clientCached.client.db()
    }
  }

  if (!clientCached.promise) {
    clientCached.promise ??= MongoClient.connect(MONGODB_URI)
  }

  try {
    clientCached.client = await clientCached.promise
    return {
      client: clientCached.client,
      db: clientCached.client.db()
    }
  } catch (e) {
    clientCached.promise = null
    throw e
  }
}

export default connectDB
