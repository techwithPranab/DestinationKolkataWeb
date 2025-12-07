"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    entityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    entityType: {
        type: String,
        enum: ['hotel', 'restaurant', 'attraction', 'event', 'sports'],
        required: true,
        index: true
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    authorName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    authorEmail: {
        type: String,
        lowercase: true,
        trim: true,
        maxlength: 255,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    images: [{
            type: String,
            trim: true
        }],
    helpful: {
        type: Number,
        default: 0,
        min: 0
    },
    helpfulUsers: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            helpful: {
                type: Boolean,
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }],
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    moderatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: Date,
    moderationNotes: String,
    reportedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    isEdited: {
        type: Boolean,
        default: false
    },
    lastEditedAt: Date,
    visitDate: Date
}, {
    timestamps: true
});
// Compound indexes for efficient queries
reviewSchema.index({ entityId: 1, entityType: 1, status: 1 });
reviewSchema.index({ entityId: 1, entityType: 1, createdAt: -1 });
reviewSchema.index({ user: 1, entityId: 1, entityType: 1 }); // Prevent duplicate reviews from same user
reviewSchema.index({ authorEmail: 1, entityId: 1, entityType: 1 }); // Prevent duplicate reviews from same email
// Validation to ensure either user or authorName/authorEmail is provided
reviewSchema.pre('validate', function (next) {
    if (!this.user && (!this.authorName || !this.authorEmail)) {
        this.invalidate('user', 'Either user ID or author name and email must be provided');
    }
    next();
});
// Prevent duplicate reviews from the same user/email for the same entity
reviewSchema.pre('save', async function (next) {
    const review = this;
    if (review.user) {
        // Check for existing review from this user
        const existingReview = await mongoose_1.default.models.Review.findOne({
            entityId: review.entityId,
            entityType: review.entityType,
            user: review.user,
            _id: { $ne: review._id }
        });
        if (existingReview) {
            return next(new Error('You have already reviewed this item'));
        }
    }
    else if (review.authorEmail) {
        // Check for existing review from this email
        const existingReview = await mongoose_1.default.models.Review.findOne({
            entityId: review.entityId,
            entityType: review.entityType,
            authorEmail: review.authorEmail,
            _id: { $ne: review._id }
        });
        if (existingReview) {
            return next(new Error('A review from this email address already exists for this item'));
        }
    }
    next();
});
// Static method to get average rating for an entity
reviewSchema.statics.getAverageRating = async function (entityId, entityType) {
    const result = await this.aggregate([
        {
            $match: {
                entityId: new mongoose_1.default.Types.ObjectId(entityId),
                entityType: entityType,
                status: 'approved'
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
    return result[0] || { averageRating: 0, totalReviews: 0 };
};
// Static method to get reviews for an entity
reviewSchema.statics.getEntityReviews = async function (entityId, entityType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const reviews = await this.find({
        entityId: new mongoose_1.default.Types.ObjectId(entityId),
        entityType: entityType,
        status: 'approved'
    })
        .populate('user', 'firstName lastName name email profile.avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v');
    const total = await this.countDocuments({
        entityId: new mongoose_1.default.Types.ObjectId(entityId),
        entityType: entityType,
        status: 'approved'
    });
    return {
        reviews,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    };
};
exports.Review = (mongoose_1.default.models.Review || mongoose_1.default.model('Review', reviewSchema));
