"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../lib/db"));
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        await (0, db_1.default)();
        const entityId = req.query.entityId;
        const entityType = req.query.entityType;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        if (!entityId || !entityType) {
            return res.status(400).json({
                success: false,
                message: 'entityId and entityType are required'
            });
        }
        const validEntityTypes = ['hotel', 'restaurant', 'attraction', 'event', 'sports'];
        if (!validEntityTypes.includes(entityType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid entityType'
            });
        }
        const query = {
            entityId,
            entityType,
            status: 'approved'
        };
        if (req.user && req.user.role === 'admin') {
            delete query.status;
        }
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        const reviews = await models_1.Review.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .lean();
        const total = await models_1.Review.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const ratingStats = await models_1.Review.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratings: {
                        $push: {
                            rating: '$rating',
                            count: 1
                        }
                    }
                }
            }
        ]);
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (ratingStats.length > 0) {
            ratingStats[0].ratings.forEach((r) => {
                ratingDistribution[r.rating]++;
            });
        }
        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            stats: {
                averageRating: ratingStats[0]?.averageRating || 0,
                totalReviews: ratingStats[0]?.totalReviews || 0,
                ratingDistribution
            }
        });
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        await (0, db_1.default)();
        const { entityId, entityType, rating, title, comment } = req.body;
        if (!entityId || !entityType || !rating) {
            return res.status(400).json({
                success: false,
                message: 'entityId, entityType, and rating are required'
            });
        }
        const validEntityTypes = ['hotel', 'restaurant', 'attraction', 'event', 'sports'];
        if (!validEntityTypes.includes(entityType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid entityType'
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        const existingReview = await models_1.Review.findOne({
            user: req.user.userId,
            entityId,
            entityType
        });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this item'
            });
        }
        const review = new models_1.Review({
            user: req.user.userId,
            entityId,
            entityType,
            rating,
            title,
            comment,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await review.save();
        res.status(201).json({
            success: true,
            data: review,
            message: 'Review submitted successfully. It will be reviewed before being published.'
        });
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const review = await models_1.Review.findById(id)
            .populate('userId', 'name email')
            .lean();
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        if (review.status !== 'approved' && (!req.user || (req.user.userId !== review.user?.toString() && req.user.role !== 'admin'))) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        res.status(200).json({
            success: true,
            data: review
        });
    }
    catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review'
        });
    }
});
router.put('/:id/helpful', auth_1.authenticateToken, async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const userId = req.user.userId;
        const review = await models_1.Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        const helpfulUsers = review.helpfulUsers || [];
        const existingVote = helpfulUsers.find(vote => vote.user.toString() === userId);
        if (existingVote) {
            existingVote.helpful = !existingVote.helpful;
        }
        else {
            helpfulUsers.push({
                user: userId,
                helpful: true,
                votedAt: new Date()
            });
        }
        review.helpful = helpfulUsers.filter(vote => vote.helpful).length;
        review.helpfulUsers = helpfulUsers;
        await review.save();
        res.status(200).json({
            success: true,
            data: {
                helpful: existingVote ? existingVote.helpful : true,
                helpfulCount: review.helpful
            }
        });
    }
    catch (error) {
        console.error('Error updating helpful votes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update helpful votes'
        });
    }
});
router.put('/:id/report', auth_1.authenticateToken, async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user.userId;
        const review = await models_1.Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        if (!review.reportedBy) {
            review.reportedBy = [];
        }
        const alreadyReported = review.reportedBy.some(reporterId => reporterId.toString() === userId);
        if (alreadyReported) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this review'
            });
        }
        review.reportedBy.push(userId);
        await review.save();
        res.status(200).json({
            success: true,
            message: 'Review reported successfully'
        });
    }
    catch (error) {
        console.error('Error reporting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report review'
        });
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map