import { NextRequest, NextResponse } from 'next/server'
import CacheManager from '@/lib/cache'

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  onLimitReached?: (req: NextRequest, key: string) => void // Callback when limit is reached
}

// Default configurations for different API types
export const RATE_LIMIT_CONFIGS = {
  // Public APIs - more lenient
  PUBLIC: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Search APIs - moderate limits
  SEARCH: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Search rate limit exceeded. Please wait before searching again.'
  },
  
  // Authentication APIs - stricter limits
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.'
  },
  
  // User content APIs - moderate limits
  USER_CONTENT: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Rate limit exceeded. Please slow down your requests.'
  },
  
  // Admin APIs - strict limits
  ADMIN: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Admin API rate limit exceeded.'
  }
} as const

// Rate limiter class
export class RateLimiter {
  private readonly config: Required<RateLimitConfig>
  
  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: this.defaultKeyGenerator,
      message: 'Rate limit exceeded',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      onLimitReached: () => {},
      ...config
    }
  }
  
  private defaultKeyGenerator(req: NextRequest): string {
    // Use IP address as default key
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    return `rate_limit:${ip}`
  }
  
  async isAllowed(req: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: Date
    totalHits: number
  }> {
    const key = this.config.keyGenerator(req)
    return this.isAllowedForKey(key)
  }

  async isAllowedForKey(key: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: Date
    totalHits: number
  }> {
    const windowKey = `${key}:${this.getCurrentWindow()}`
    
    try {
      // Get current count
      const currentCount = await this.getCurrentCount(windowKey)
      const remaining = Math.max(0, this.config.maxRequests - currentCount - 1)
      const resetTime = new Date(this.getNextWindowStart())
      
      if (currentCount >= this.config.maxRequests) {
        // Limit exceeded
        this.config.onLimitReached({} as NextRequest, key) // Pass empty request since we don't have it
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          totalHits: currentCount
        }
      }
      
      // Increment counter
      await this.incrementCounter(windowKey)
      
      return {
        allowed: true,
        remaining,
        resetTime,
        totalHits: currentCount + 1
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      // On error, allow the request to prevent blocking due to cache issues
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: new Date(this.getNextWindowStart()),
        totalHits: 1
      }
    }
  }
  
  private getCurrentWindow(): number {
    return Math.floor(Date.now() / this.config.windowMs)
  }
  
  private getNextWindowStart(): number {
    const currentWindow = this.getCurrentWindow()
    return (currentWindow + 1) * this.config.windowMs
  }
  
  private async getCurrentCount(key: string): Promise<number> {
    const count = await CacheManager.get<number>(key)
    return count || 0
  }
  
  private async incrementCounter(key: string): Promise<void> {
    const ttl = Math.ceil(this.config.windowMs / 1000)
    const current = await this.getCurrentCount(key)
    await CacheManager.set(key, current + 1, ttl)
  }
}

// Rate limiting middleware
export function withRateLimit(
  handler: (req: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  const rateLimiter = new RateLimiter(config)
  
  return async (req: NextRequest, context?: { params?: Record<string, string> }): Promise<NextResponse> => {
    try {
      const result = await rateLimiter.isAllowed(req)
      
      if (!result.allowed) {
        const response = NextResponse.json(
          {
            success: false,
            message: config.message || 'Rate limit exceeded',
            rateLimitExceeded: true
          },
          { status: 429 }
        )
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString())
        response.headers.set('Retry-After', Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString())
        
        return response
      }
      
      // Execute the handler
      const response = await handler(req, context)
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString())
      
      return response
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      // On error, allow the request
      return handler(req, context)
    }
  }
}

// IP-based rate limiter (simple implementation)
export class IPRateLimiter {
  private static readonly instances = new Map<string, RateLimiter>()
  
  static getInstance(name: string, config: RateLimitConfig): RateLimiter {
    if (!this.instances.has(name)) {
      this.instances.set(name, new RateLimiter(config))
    }
    return this.instances.get(name)!
  }
  
  static async checkLimit(
    req: NextRequest,
    limiterName: string,
    config: RateLimitConfig
  ): Promise<NextResponse | null> {
    const limiter = this.getInstance(limiterName, config)
    const result = await limiter.isAllowed(req)
    
    if (!result.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          message: config.message || 'Rate limit exceeded',
          rateLimitExceeded: true
        },
        { status: 429 }
      )
      
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString())
      response.headers.set('Retry-After', Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString())
      
      return response
    }
    
    return null // Allow request
  }
}

// User-based rate limiter
export class UserRateLimiter {
  static generateUserKey(userId: string, endpoint: string): string {
    return `user_rate_limit:${userId}:${endpoint}`
  }
  
  static async checkUserLimit(
    userId: string,
    endpoint: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date; totalHits: number }> {
    const limiter = new RateLimiter({
      ...config,
      keyGenerator: () => this.generateUserKey(userId, endpoint)
    })
    
    // Use a simplified version that doesn't require a full request object
    return limiter.isAllowedForKey(this.generateUserKey(userId, endpoint))
  }
}

// Global rate limiting statistics
export class RateLimitStats {
  private static blockedRequests = 0
  private static allowedRequests = 0
  
  static recordBlocked(): void {
    this.blockedRequests++
  }
  
  static recordAllowed(): void {
    this.allowedRequests++
  }
  
  static getStats(): {
    blocked: number
    allowed: number
    total: number
    blockRate: number
  } {
    const total = this.blockedRequests + this.allowedRequests
    return {
      blocked: this.blockedRequests,
      allowed: this.allowedRequests,
      total,
      blockRate: total > 0 ? (this.blockedRequests / total) * 100 : 0
    }
  }
  
  static reset(): void {
    this.blockedRequests = 0
    this.allowedRequests = 0
  }
}

export default {
  withRateLimit,
  RateLimiter,
  IPRateLimiter,
  UserRateLimiter,
  RateLimitStats,
  RATE_LIMIT_CONFIGS
}
