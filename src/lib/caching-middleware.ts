import { NextRequest, NextResponse } from 'next/server'
import CacheManager, { CACHE_TTL } from '@/lib/cache'

// ISR and caching configuration
export const ISR_CONFIG = {
  // Static pages revalidation time (in seconds)
  STATIC_PAGES: 3600, // 1 hour
  DYNAMIC_PAGES: 1800, // 30 minutes
  API_RESPONSES: 300,  // 5 minutes
  SEARCH_RESULTS: 600, // 10 minutes
  USER_CONTENT: 60,    // 1 minute
} as const

// Caching middleware for API routes
export function withCache(
  handler: (req: NextRequest, context?: { params?: Promise<Record<string, string>> }) => Promise<NextResponse>,
  options: {
    ttl?: number
    keyPrefix?: string
    cacheKey?: (req: NextRequest, context?: { params?: Promise<Record<string, string>> }) => string
    skipCache?: (req: NextRequest) => boolean
  } = {}
) {
  return async (req: NextRequest, context?: { params?: Promise<Record<string, string>> }): Promise<NextResponse> => {
    const {
      ttl = CACHE_TTL.MEDIUM,
      keyPrefix = 'api',
      cacheKey = (req) => `${keyPrefix}:${req.url}`,
      skipCache = (req) => req.method !== 'GET'
    } = options

    // Skip caching for non-GET requests or when skipCache returns true
    if (skipCache(req)) {
      return handler(req, context)
    }

    const key = cacheKey(req, context)

    try {
      // Try to get cached response
      const cached = await CacheManager.get<{
        data: unknown
        status: number
        headers?: Record<string, string>
      }>(key)

      if (cached) {
        const response = NextResponse.json(cached.data, { status: cached.status })
        
        // Add cache headers
        response.headers.set('X-Cache-Status', 'HIT')
        response.headers.set('Cache-Control', `public, s-maxage=${ttl}`)
        
        // Restore cached headers
        if (cached.headers) {
          Object.entries(cached.headers).forEach(([name, value]) => {
            response.headers.set(name, value)
          })
        }
        
        return response
      }

      // Cache miss - execute handler
      const response = await handler(req, context)
      
      // Only cache successful responses
      if (response.status >= 200 && response.status < 300) {
        try {
          const responseBody = await response.json()
          
          await CacheManager.set(key, {
            data: responseBody,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          }, ttl)

          // Create new response with cache headers
          const cachedResponse = NextResponse.json(responseBody, { status: response.status })
          cachedResponse.headers.set('X-Cache-Status', 'MISS')
          cachedResponse.headers.set('Cache-Control', `public, s-maxage=${ttl}`)
          
          // Copy original headers
          response.headers.forEach((value, name) => {
            if (!cachedResponse.headers.has(name)) {
              cachedResponse.headers.set(name, value)
            }
          })
          
          return cachedResponse
        } catch (error) {
          console.error('Failed to cache response:', error)
          response.headers.set('X-Cache-Status', 'BYPASS')
          return response
        }
      }

      response.headers.set('X-Cache-Status', 'BYPASS')
      return response
    } catch (error) {
      console.error('Cache middleware error:', error)
      const response = await handler(req, context)
      response.headers.set('X-Cache-Status', 'ERROR')
      return response
    }
  }
}

// Cache invalidation helpers
export class CacheInvalidation {
  // Invalidate entity-related caches when entity is updated
  static async invalidateEntity(entityType: string, entityId?: string): Promise<void> {
    const patterns = [
      `${entityType}:*`,
      `search:*${entityType}*`,
      `popular:${entityType}*`,
      `recent:${entityType}*`
    ]

    if (entityId) {
      patterns.push(`${entityType}:${entityId}:*`)
    }

    await Promise.all(
      patterns.map(pattern => CacheManager.deletePattern(pattern))
    )
  }

  // Invalidate user-related caches
  static async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      CacheManager.deletePattern(`user_profile:${userId}*`),
      CacheManager.deletePattern(`user_reviews:${userId}*`),
      CacheManager.deletePattern(`user_bookings:${userId}*`),
      CacheManager.deletePattern(`user_wishlist:${userId}*`)
    ])
  }

  // Invalidate search caches
  static async invalidateSearch(): Promise<void> {
    await CacheManager.deletePattern('search:*')
  }

  // Invalidate all caches (use with caution)
  static async invalidateAll(): Promise<void> {
    await CacheManager.clear()
  }
}

// Performance monitoring for cache
export class CacheMetrics {
  private static hits = 0
  private static misses = 0
  private static errors = 0

  static recordHit(): void {
    this.hits++
  }

  static recordMiss(): void {
    this.misses++
  }

  static recordError(): void {
    this.errors++
  }

  static getStats(): {
    hits: number
    misses: number
    errors: number
    hitRate: number
    totalRequests: number
  } {
    const totalRequests = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
      totalRequests
    }
  }

  static reset(): void {
    this.hits = 0
    this.misses = 0
    this.errors = 0
  }
}

// Page-level caching for static generation
export const pageCache = {
  // Home page with popular items
  home: {
    revalidate: ISR_CONFIG.STATIC_PAGES,
    tags: ['hotels', 'restaurants', 'attractions']
  },
  
  // Category listing pages
  hotels: {
    revalidate: ISR_CONFIG.DYNAMIC_PAGES,
    tags: ['hotels']
  },
  
  restaurants: {
    revalidate: ISR_CONFIG.DYNAMIC_PAGES,
    tags: ['restaurants']
  },
  
  attractions: {
    revalidate: ISR_CONFIG.DYNAMIC_PAGES,
    tags: ['attractions']
  },
  
  // Individual entity pages
  entity: {
    revalidate: ISR_CONFIG.DYNAMIC_PAGES,
    tags: (type: string, id: string) => [`${type}`, `${type}:${id}`]
  },
  
  // Search results
  search: {
    revalidate: ISR_CONFIG.SEARCH_RESULTS,
    tags: ['search']
  }
} as const

export default {
  withCache,
  CacheInvalidation,
  CacheMetrics,
  pageCache,
  ISR_CONFIG
}
