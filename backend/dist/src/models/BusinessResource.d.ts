import mongoose, { Document } from 'mongoose';
export interface IBusinessResource extends Document {
    title: string;
    description: string;
    category: 'guides' | 'templates' | 'tools' | 'webinars' | 'case-studies' | 'market-insights' | 'legal' | 'financial';
    subcategory?: string;
    content: string;
    fileAttachments?: {
        filename: string;
        url: string;
        fileType: string;
        size: number;
    }[];
    tags?: string[];
    targetAudience: 'restaurants' | 'hotels' | 'travel-agencies' | 'event-organizers' | 'attractions' | 'all';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
    downloadCount: number;
    viewCount: number;
    likes: number;
    likedBy?: mongoose.Types.ObjectId[];
    featured: boolean;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date;
    author: mongoose.Types.ObjectId;
    lastUpdatedBy?: mongoose.Types.ObjectId;
    seoMeta?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        canonicalUrl?: string;
    };
    relatedResources?: mongoose.Types.ObjectId[];
    comments?: {
        user: mongoose.Types.ObjectId;
        comment: string;
        rating?: number;
        createdAt: Date;
        replies?: {
            user: mongoose.Types.ObjectId;
            reply: string;
            createdAt: Date;
        }[];
    }[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const BusinessResource: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=BusinessResource.d.ts.map