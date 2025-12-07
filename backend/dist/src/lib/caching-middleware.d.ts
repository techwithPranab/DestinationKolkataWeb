import { NextRequest, NextResponse } from 'next/server';
export declare const ISR_CONFIG: {
    readonly STATIC_PAGES: 3600;
    readonly DYNAMIC_PAGES: 1800;
    readonly API_RESPONSES: 300;
    readonly SEARCH_RESULTS: 600;
    readonly USER_CONTENT: 60;
};
export declare function withCache(handler: (req: NextRequest, context?: {
    params?: Promise<Record<string, string>>;
}) => Promise<NextResponse>, options?: {
    ttl?: number;
    keyPrefix?: string;
    cacheKey?: (req: NextRequest, context?: {
        params?: Promise<Record<string, string>>;
    }) => string;
    skipCache?: (req: NextRequest) => boolean;
}): (req: NextRequest, context?: {
    params?: Promise<Record<string, string>>;
}) => Promise<NextResponse>;
export declare class CacheInvalidation {
    static invalidateEntity(entityType: string, entityId?: string): Promise<void>;
    static invalidateUser(userId: string): Promise<void>;
    static invalidateSearch(): Promise<void>;
    static invalidateAll(): Promise<void>;
}
export declare class CacheMetrics {
    private static hits;
    private static misses;
    private static errors;
    static recordHit(): void;
    static recordMiss(): void;
    static recordError(): void;
    static getStats(): {
        hits: number;
        misses: number;
        errors: number;
        hitRate: number;
        totalRequests: number;
    };
    static reset(): void;
}
export declare const pageCache: {
    readonly home: {
        readonly revalidate: 3600;
        readonly tags: readonly ["hotels", "restaurants", "attractions"];
    };
    readonly hotels: {
        readonly revalidate: 1800;
        readonly tags: readonly ["hotels"];
    };
    readonly restaurants: {
        readonly revalidate: 1800;
        readonly tags: readonly ["restaurants"];
    };
    readonly attractions: {
        readonly revalidate: 1800;
        readonly tags: readonly ["attractions"];
    };
    readonly entity: {
        readonly revalidate: 1800;
        readonly tags: (type: string, id: string) => string[];
    };
    readonly search: {
        readonly revalidate: 600;
        readonly tags: readonly ["search"];
    };
};
declare const _default: {
    withCache: typeof withCache;
    CacheInvalidation: typeof CacheInvalidation;
    CacheMetrics: typeof CacheMetrics;
    pageCache: {
        readonly home: {
            readonly revalidate: 3600;
            readonly tags: readonly ["hotels", "restaurants", "attractions"];
        };
        readonly hotels: {
            readonly revalidate: 1800;
            readonly tags: readonly ["hotels"];
        };
        readonly restaurants: {
            readonly revalidate: 1800;
            readonly tags: readonly ["restaurants"];
        };
        readonly attractions: {
            readonly revalidate: 1800;
            readonly tags: readonly ["attractions"];
        };
        readonly entity: {
            readonly revalidate: 1800;
            readonly tags: (type: string, id: string) => string[];
        };
        readonly search: {
            readonly revalidate: 600;
            readonly tags: readonly ["search"];
        };
    };
    ISR_CONFIG: {
        readonly STATIC_PAGES: 3600;
        readonly DYNAMIC_PAGES: 1800;
        readonly API_RESPONSES: 300;
        readonly SEARCH_RESULTS: 600;
        readonly USER_CONTENT: 60;
    };
};
export default _default;
//# sourceMappingURL=caching-middleware.d.ts.map