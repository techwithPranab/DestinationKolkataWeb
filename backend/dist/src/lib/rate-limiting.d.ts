import { NextRequest, NextResponse } from 'next/server';
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: NextRequest) => string;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    onLimitReached?: (req: NextRequest, key: string) => void;
}
export declare const RATE_LIMIT_CONFIGS: {
    readonly PUBLIC: {
        readonly windowMs: number;
        readonly maxRequests: 1000;
        readonly message: "Too many requests from this IP, please try again later.";
    };
    readonly SEARCH: {
        readonly windowMs: number;
        readonly maxRequests: 60;
        readonly message: "Search rate limit exceeded. Please wait before searching again.";
    };
    readonly AUTH: {
        readonly windowMs: number;
        readonly maxRequests: 5;
        readonly message: "Too many authentication attempts. Please try again later.";
    };
    readonly USER_CONTENT: {
        readonly windowMs: number;
        readonly maxRequests: 30;
        readonly message: "Rate limit exceeded. Please slow down your requests.";
    };
    readonly ADMIN: {
        readonly windowMs: number;
        readonly maxRequests: 100;
        readonly message: "Admin API rate limit exceeded.";
    };
};
export declare class RateLimiter {
    private readonly config;
    constructor(config: RateLimitConfig);
    private defaultKeyGenerator;
    isAllowed(req: NextRequest): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
        totalHits: number;
    }>;
    isAllowedForKey(key: string): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
        totalHits: number;
    }>;
    private getCurrentWindow;
    private getNextWindowStart;
    private getCurrentCount;
    private incrementCounter;
}
export declare function withRateLimit(handler: (req: NextRequest, context?: {
    params?: Record<string, string>;
}) => Promise<NextResponse>, config: RateLimitConfig): (req: NextRequest, context?: {
    params?: Record<string, string>;
}) => Promise<NextResponse>;
export declare class IPRateLimiter {
    private static readonly instances;
    static getInstance(name: string, config: RateLimitConfig): RateLimiter;
    static checkLimit(req: NextRequest, limiterName: string, config: RateLimitConfig): Promise<NextResponse | null>;
}
export declare class UserRateLimiter {
    static generateUserKey(userId: string, endpoint: string): string;
    static checkUserLimit(userId: string, endpoint: string, config: RateLimitConfig): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
        totalHits: number;
    }>;
}
export declare class RateLimitStats {
    private static blockedRequests;
    private static allowedRequests;
    static recordBlocked(): void;
    static recordAllowed(): void;
    static getStats(): {
        blocked: number;
        allowed: number;
        total: number;
        blockRate: number;
    };
    static reset(): void;
}
declare const _default: {
    withRateLimit: typeof withRateLimit;
    RateLimiter: typeof RateLimiter;
    IPRateLimiter: typeof IPRateLimiter;
    UserRateLimiter: typeof UserRateLimiter;
    RateLimitStats: typeof RateLimitStats;
    RATE_LIMIT_CONFIGS: {
        readonly PUBLIC: {
            readonly windowMs: number;
            readonly maxRequests: 1000;
            readonly message: "Too many requests from this IP, please try again later.";
        };
        readonly SEARCH: {
            readonly windowMs: number;
            readonly maxRequests: 60;
            readonly message: "Search rate limit exceeded. Please wait before searching again.";
        };
        readonly AUTH: {
            readonly windowMs: number;
            readonly maxRequests: 5;
            readonly message: "Too many authentication attempts. Please try again later.";
        };
        readonly USER_CONTENT: {
            readonly windowMs: number;
            readonly maxRequests: 30;
            readonly message: "Rate limit exceeded. Please slow down your requests.";
        };
        readonly ADMIN: {
            readonly windowMs: number;
            readonly maxRequests: 100;
            readonly message: "Admin API rate limit exceeded.";
        };
    };
};
export default _default;
//# sourceMappingURL=rate-limiting.d.ts.map