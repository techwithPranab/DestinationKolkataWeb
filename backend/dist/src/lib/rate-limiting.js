"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitStats = exports.UserRateLimiter = exports.IPRateLimiter = exports.RateLimiter = exports.RATE_LIMIT_CONFIGS = void 0;
exports.withRateLimit = withRateLimit;
const server_1 = require("next/server");
const cache_1 = __importDefault(require("@/lib/cache"));
exports.RATE_LIMIT_CONFIGS = {
    PUBLIC: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 1000,
        message: 'Too many requests from this IP, please try again later.'
    },
    SEARCH: {
        windowMs: 1 * 60 * 1000,
        maxRequests: 60,
        message: 'Search rate limit exceeded. Please wait before searching again.'
    },
    AUTH: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
        message: 'Too many authentication attempts. Please try again later.'
    },
    USER_CONTENT: {
        windowMs: 1 * 60 * 1000,
        maxRequests: 30,
        message: 'Rate limit exceeded. Please slow down your requests.'
    },
    ADMIN: {
        windowMs: 1 * 60 * 1000,
        maxRequests: 100,
        message: 'Admin API rate limit exceeded.'
    }
};
class RateLimiter {
    constructor(config) {
        this.config = {
            keyGenerator: this.defaultKeyGenerator,
            message: 'Rate limit exceeded',
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            onLimitReached: () => { },
            ...config
        };
    }
    defaultKeyGenerator(req) {
        const forwarded = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const ip = forwarded?.split(',')[0] || realIp || 'unknown';
        return `rate_limit:${ip}`;
    }
    async isAllowed(req) {
        const key = this.config.keyGenerator(req);
        return this.isAllowedForKey(key);
    }
    async isAllowedForKey(key) {
        const windowKey = `${key}:${this.getCurrentWindow()}`;
        try {
            const currentCount = await this.getCurrentCount(windowKey);
            const remaining = Math.max(0, this.config.maxRequests - currentCount - 1);
            const resetTime = new Date(this.getNextWindowStart());
            if (currentCount >= this.config.maxRequests) {
                this.config.onLimitReached({}, key);
                return {
                    allowed: false,
                    remaining: 0,
                    resetTime,
                    totalHits: currentCount
                };
            }
            await this.incrementCounter(windowKey);
            return {
                allowed: true,
                remaining,
                resetTime,
                totalHits: currentCount + 1
            };
        }
        catch (error) {
            console.error('Rate limiter error:', error);
            return {
                allowed: true,
                remaining: this.config.maxRequests - 1,
                resetTime: new Date(this.getNextWindowStart()),
                totalHits: 1
            };
        }
    }
    getCurrentWindow() {
        return Math.floor(Date.now() / this.config.windowMs);
    }
    getNextWindowStart() {
        const currentWindow = this.getCurrentWindow();
        return (currentWindow + 1) * this.config.windowMs;
    }
    async getCurrentCount(key) {
        const count = await cache_1.default.get(key);
        return count || 0;
    }
    async incrementCounter(key) {
        const ttl = Math.ceil(this.config.windowMs / 1000);
        const current = await this.getCurrentCount(key);
        await cache_1.default.set(key, current + 1, ttl);
    }
}
exports.RateLimiter = RateLimiter;
function withRateLimit(handler, config) {
    const rateLimiter = new RateLimiter(config);
    return async (req, context) => {
        try {
            const result = await rateLimiter.isAllowed(req);
            if (!result.allowed) {
                const response = server_1.NextResponse.json({
                    success: false,
                    message: config.message || 'Rate limit exceeded',
                    rateLimitExceeded: true
                }, { status: 429 });
                response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
                response.headers.set('X-RateLimit-Remaining', '0');
                response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());
                response.headers.set('Retry-After', Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString());
                return response;
            }
            const response = await handler(req, context);
            response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
            response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
            response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());
            return response;
        }
        catch (error) {
            console.error('Rate limit middleware error:', error);
            return handler(req, context);
        }
    };
}
class IPRateLimiter {
    static getInstance(name, config) {
        if (!this.instances.has(name)) {
            this.instances.set(name, new RateLimiter(config));
        }
        return this.instances.get(name);
    }
    static async checkLimit(req, limiterName, config) {
        const limiter = this.getInstance(limiterName, config);
        const result = await limiter.isAllowed(req);
        if (!result.allowed) {
            const response = server_1.NextResponse.json({
                success: false,
                message: config.message || 'Rate limit exceeded',
                rateLimitExceeded: true
            }, { status: 429 });
            response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
            response.headers.set('X-RateLimit-Remaining', '0');
            response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());
            response.headers.set('Retry-After', Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString());
            return response;
        }
        return null;
    }
}
exports.IPRateLimiter = IPRateLimiter;
IPRateLimiter.instances = new Map();
class UserRateLimiter {
    static generateUserKey(userId, endpoint) {
        return `user_rate_limit:${userId}:${endpoint}`;
    }
    static async checkUserLimit(userId, endpoint, config) {
        const limiter = new RateLimiter({
            ...config,
            keyGenerator: () => this.generateUserKey(userId, endpoint)
        });
        return limiter.isAllowedForKey(this.generateUserKey(userId, endpoint));
    }
}
exports.UserRateLimiter = UserRateLimiter;
class RateLimitStats {
    static recordBlocked() {
        this.blockedRequests++;
    }
    static recordAllowed() {
        this.allowedRequests++;
    }
    static getStats() {
        const total = this.blockedRequests + this.allowedRequests;
        return {
            blocked: this.blockedRequests,
            allowed: this.allowedRequests,
            total,
            blockRate: total > 0 ? (this.blockedRequests / total) * 100 : 0
        };
    }
    static reset() {
        this.blockedRequests = 0;
        this.allowedRequests = 0;
    }
}
exports.RateLimitStats = RateLimitStats;
RateLimitStats.blockedRequests = 0;
RateLimitStats.allowedRequests = 0;
exports.default = {
    withRateLimit,
    RateLimiter,
    IPRateLimiter,
    UserRateLimiter,
    RateLimitStats,
    RATE_LIMIT_CONFIGS: exports.RATE_LIMIT_CONFIGS
};
//# sourceMappingURL=rate-limiting.js.map