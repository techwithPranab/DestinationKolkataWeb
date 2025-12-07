import mongoose, { Document } from 'mongoose';
export interface IAdvertising extends Document {
    title: string;
    description: string;
    advertiserName: string;
    advertiserEmail: string;
    advertiserPhone?: string;
    category: 'banner' | 'sponsored-content' | 'directory-listing' | 'event-promotion' | 'featured-placement';
    targetLocation?: string[];
    targetAudience?: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    status: 'pending' | 'approved' | 'active' | 'paused' | 'completed' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    placement?: string[];
    images?: string[];
    clickCount: number;
    viewCount: number;
    conversionCount: number;
    ctr: number;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentId?: string;
    analytics: {
        impressions: number;
        clicks: number;
        conversions: number;
        spend: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Advertising: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Advertising.d.ts.map