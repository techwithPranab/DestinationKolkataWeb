"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageCache = exports.CacheMetrics = exports.CacheInvalidation = exports.ISR_CONFIG = void 0;
exports.withCache = withCache;
const server_1 = require("next/server");
const cache_1 = __importStar(require("@/lib/cache"));
exports.ISR_CONFIG = {
    STATIC_PAGES: 3600,
    DYNAMIC_PAGES: 1800,
    API_RESPONSES: 300,
    SEARCH_RESULTS: 600,
    USER_CONTENT: 60,
};
function withCache(handler, options = {}) {
    return async (req, context) => {
        const { ttl = cache_1.CACHE_TTL.MEDIUM, keyPrefix = 'api', cacheKey = (req) => `${keyPrefix}:${req.url}`, skipCache = (req) => req.method !== 'GET' } = options;
        if (skipCache(req)) {
            return handler(req, context);
        }
        const key = cacheKey(req, context);
        try {
            const cached = await cache_1.default.get(key);
            if (cached) {
                const response = server_1.NextResponse.json(cached.data, { status: cached.status });
                response.headers.set('X-Cache-Status', 'HIT');
                response.headers.set('Cache-Control', `public, s-maxage=${ttl}`);
                if (cached.headers) {
                    Object.entries(cached.headers).forEach(([name, value]) => {
                        response.headers.set(name, value);
                    });
                }
                return response;
            }
            const response = await handler(req, context);
            if (response.status >= 200 && response.status < 300) {
                try {
                    const responseBody = await response.json();
                    await cache_1.default.set(key, {
                        data: responseBody,
                        status: response.status,
                        headers: Object.fromEntries(response.headers.entries())
                    }, ttl);
                    const cachedResponse = server_1.NextResponse.json(responseBody, { status: response.status });
                    cachedResponse.headers.set('X-Cache-Status', 'MISS');
                    cachedResponse.headers.set('Cache-Control', `public, s-maxage=${ttl}`);
                    response.headers.forEach((value, name) => {
                        if (!cachedResponse.headers.has(name)) {
                            cachedResponse.headers.set(name, value);
                        }
                    });
                    return cachedResponse;
                }
                catch (error) {
                    console.error('Failed to cache response:', error);
                    response.headers.set('X-Cache-Status', 'BYPASS');
                    return response;
                }
            }
            response.headers.set('X-Cache-Status', 'BYPASS');
            return response;
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            const response = await handler(req, context);
            response.headers.set('X-Cache-Status', 'ERROR');
            return response;
        }
    };
}
class CacheInvalidation {
    static async invalidateEntity(entityType, entityId) {
        const patterns = [
            `${entityType}:*`,
            `search:*${entityType}*`,
            `popular:${entityType}*`,
            `recent:${entityType}*`
        ];
        if (entityId) {
            patterns.push(`${entityType}:${entityId}:*`);
        }
        await Promise.all(patterns.map(pattern => cache_1.default.deletePattern(pattern)));
    }
    static async invalidateUser(userId) {
        await Promise.all([
            cache_1.default.deletePattern(`user_profile:${userId}*`),
            cache_1.default.deletePattern(`user_reviews:${userId}*`),
            cache_1.default.deletePattern(`user_bookings:${userId}*`),
            cache_1.default.deletePattern(`user_wishlist:${userId}*`)
        ]);
    }
    static async invalidateSearch() {
        await cache_1.default.deletePattern('search:*');
    }
    static async invalidateAll() {
        await cache_1.default.clear();
    }
}
exports.CacheInvalidation = CacheInvalidation;
class CacheMetrics {
    static recordHit() {
        this.hits++;
    }
    static recordMiss() {
        this.misses++;
    }
    static recordError() {
        this.errors++;
    }
    static getStats() {
        const totalRequests = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            errors: this.errors,
            hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
            totalRequests
        };
    }
    static reset() {
        this.hits = 0;
        this.misses = 0;
        this.errors = 0;
    }
}
exports.CacheMetrics = CacheMetrics;
CacheMetrics.hits = 0;
CacheMetrics.misses = 0;
CacheMetrics.errors = 0;
exports.pageCache = {
    home: {
        revalidate: exports.ISR_CONFIG.STATIC_PAGES,
        tags: ['hotels', 'restaurants', 'attractions']
    },
    hotels: {
        revalidate: exports.ISR_CONFIG.DYNAMIC_PAGES,
        tags: ['hotels']
    },
    restaurants: {
        revalidate: exports.ISR_CONFIG.DYNAMIC_PAGES,
        tags: ['restaurants']
    },
    attractions: {
        revalidate: exports.ISR_CONFIG.DYNAMIC_PAGES,
        tags: ['attractions']
    },
    entity: {
        revalidate: exports.ISR_CONFIG.DYNAMIC_PAGES,
        tags: (type, id) => [`${type}`, `${type}:${id}`]
    },
    search: {
        revalidate: exports.ISR_CONFIG.SEARCH_RESULTS,
        tags: ['search']
    }
};
exports.default = {
    withCache,
    CacheInvalidation,
    CacheMetrics,
    pageCache: exports.pageCache,
    ISR_CONFIG: exports.ISR_CONFIG
};
//# sourceMappingURL=caching-middleware.js.map