import mongoose, { Document } from 'mongoose';
export interface IHelpfulVote {
    user: mongoose.Types.ObjectId;
    helpful: boolean;
    votedAt: Date;
}
export interface IReview extends Document {
    entityId: mongoose.Types.ObjectId;
    entityType: 'hotel' | 'restaurant' | 'attraction' | 'event' | 'sports';
    user?: mongoose.Types.ObjectId;
    authorName?: string;
    authorEmail?: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    helpful: number;
    helpfulUsers?: IHelpfulVote[];
    verified: boolean;
    status: 'pending' | 'approved' | 'rejected';
    moderatedBy?: mongoose.Types.ObjectId;
    moderatedAt?: Date;
    moderationNotes?: string;
    reportedBy?: mongoose.Types.ObjectId[];
    isEdited: boolean;
    lastEditedAt?: Date;
    visitDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
interface IReviewModel extends mongoose.Model<IReview> {
    getAverageRating(entityId: string, entityType: string): Promise<{
        averageRating: number;
        totalReviews: number;
    }>;
    getEntityReviews(entityId: string, entityType: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string): Promise<{
        reviews: IReview[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
interface IReviewModel extends mongoose.Model<IReview> {
    getAverageRating(entityId: string, entityType: string): Promise<{
        averageRating: number;
        totalReviews: number;
    }>;
    getEntityReviews(entityId: string, entityType: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string): Promise<{
        reviews: IReview[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
export declare const Review: IReviewModel;
export {};
//# sourceMappingURL=Review.d.ts.map