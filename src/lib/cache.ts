// In-memory cache implementation for development
// In production, this should be replaced with Redis or similar

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
}

class InMemoryCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>()
  private readonly cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key)
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  exists(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  clear(): void {
    this.cache.clear()
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

// Cache client singleton
let cacheInstance: InMemoryCache | null = null

function getCacheInstance(): InMemoryCache {
  cacheInstance ??= new InMemoryCache()
  return cacheInstance
}

// Cache utility functions
export class CacheManager {
  private static readonly cache = getCacheInstance()

  // Generate cache key
  static generateKey(prefix: string, params: Record<string, unknown> = {}): string {
    const sortedParams = Object.keys(params)
      .sort((a, b) => a.localeCompare(b))
      .reduce((obj, key) => {
        obj[key] = params[key]
        return obj
      }, {} as Record<string, unknown>)
    
    const paramString = JSON.stringify(sortedParams)
    return `${prefix}:${Buffer.from(paramString).toString('base64')}`
  }

  // Get cached data
  static async get<T>(key: string): Promise<T | null> {
    try {
      return this.cache.get<T>(key)
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Set cached data with TTL (time to live in seconds)
  static async set<T>(key: string, data: T, ttl: number = 3600): Promise<boolean> {
    try {
      this.cache.set(key, data, ttl)
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  // Delete cached data
  static async delete(key: string): Promise<boolean> {
    try {
      this.cache.delete(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  // Delete multiple keys by pattern
  static async deletePattern(pattern: string): Promise<boolean> {
    try {
      this.cache.deletePattern(pattern)
      return true
    } catch (error) {
      console.error('Cache delete pattern error:', error)
      return false
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      return this.cache.exists(key)
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  // Cache with stale-while-revalidate pattern
  static async getWithSWR<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = 3600,
    staleTime: number = 300
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<{ data: T; timestamp: number }>(key)
      
      if (cached) {
        const age = Date.now() - cached.timestamp
        
        // If data is fresh, return it
        if (age < staleTime * 1000) {
          return cached.data
        }
        
        // If data is stale but not expired, return stale data and refresh in background
        if (age < ttl * 1000) {
          // Background refresh (no await)
          this.refreshInBackground(key, fetchFunction, ttl)
          return cached.data
        }
      }
      
      // Data is expired or doesn't exist, fetch fresh data
      const freshData = await fetchFunction()
      await this.set(key, { data: freshData, timestamp: Date.now() }, ttl)
      return freshData
      
    } catch (error) {
      console.error('Cache SWR error:', error)
      // Fallback to direct fetch
      return fetchFunction()
    }
  }

  // Background refresh helper
  private static async refreshInBackground<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const freshData = await fetchFunction()
      await this.set(key, { data: freshData, timestamp: Date.now() }, ttl)
    } catch (error) {
      console.error('Background refresh error:', error)
    }
  }

  // Clear all cache
  static async clear(): Promise<void> {
    this.cache.clear()
  }
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  VERY_SHORT: 60,      // 1 minute
  SHORT: 300,          // 5 minutes
  MEDIUM: 1800,        // 30 minutes
  LONG: 3600,          // 1 hour
  VERY_LONG: 86400,    // 24 hours
  WEEK: 604800,        // 7 days
} as const

// Cache key prefixes
export const CACHE_KEYS = {
  HOTELS: 'hotels',
  RESTAURANTS: 'restaurants',
  ATTRACTIONS: 'attractions',
  EVENTS: 'events',
  SPORTS: 'sports',
  REVIEWS: 'reviews',
  USER_PROFILE: 'user_profile',
  SEARCH_RESULTS: 'search',
  ANALYTICS: 'analytics',
  POPULAR_ITEMS: 'popular',
  RECENT_ITEMS: 'recent',
} as const

export default CacheManager
