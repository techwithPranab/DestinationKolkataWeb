"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("../lib/mongodb");
const mongodb_2 = require("mongodb");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/review/:reviewId', async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!mongodb_2.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const reviewObjectId = mongodb_2.ObjectId.createFromHexString(reviewId);
        const review = await db.collection('reviews').findOne({
            _id: reviewObjectId
        });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        const voteStats = await db.collection('helpful_votes').aggregate([
            { $match: { reviewId: reviewObjectId } },
            {
                $group: {
                    _id: null,
                    helpful: {
                        $sum: {
                            $cond: [{ $eq: ['$helpful', true] }, 1, 0]
                        }
                    },
                    notHelpful: {
                        $sum: {
                            $cond: [{ $eq: ['$helpful', false] }, 1, 0]
                        }
                    },
                    total: { $sum: 1 }
                }
            }
        ]).toArray();
        const stats = voteStats.length > 0 ? voteStats[0] : {
            helpful: 0,
            notHelpful: 0,
            total: 0
        };
        res.status(200).json({
            success: true,
            data: {
                reviewId,
                helpfulCount: stats.helpful || 0,
                notHelpfulCount: stats.notHelpful || 0,
                totalVotes: stats.total || 0,
                helpfulPercentage: stats.total > 0 ? Math.round(((stats.helpful || 0) / stats.total) * 100) : 0
            }
        });
    }
    catch (error) {
        console.error('Get helpful votes stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const { reviewId, helpful } = req.body;
        if (!reviewId || typeof helpful !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'reviewId and helpful (boolean) are required'
            });
        }
        if (!mongodb_2.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const reviewObjectId = mongodb_2.ObjectId.createFromHexString(reviewId);
        const userId = mongodb_2.ObjectId.createFromHexString(user.userId);
        const review = await db.collection('reviews').findOne({
            _id: reviewObjectId
        });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        const existingVote = await db.collection('helpful_votes').findOne({
            reviewId: reviewObjectId,
            userId
        });
        if (existingVote) {
            if (existingVote.helpful === helpful) {
                const deleteResult = await db.collection('helpful_votes').deleteOne({
                    reviewId: reviewObjectId,
                    userId
                });
                return res.status(200).json({
                    success: true,
                    message: 'Vote removed',
                    data: {
                        reviewId,
                        voted: false,
                        helpful: null
                    }
                });
            }
            else {
                const updateResult = await db.collection('helpful_votes').updateOne({ reviewId: reviewObjectId, userId }, {
                    $set: {
                        helpful,
                        updatedAt: new Date()
                    }
                });
                return res.status(200).json({
                    success: true,
                    message: 'Vote updated',
                    data: {
                        reviewId,
                        voted: true,
                        helpful
                    }
                });
            }
        }
        const voteDocument = {
            reviewId: reviewObjectId,
            userId,
            helpful,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const insertResult = await db.collection('helpful_votes').insertOne(voteDocument);
        res.status(201).json({
            success: true,
            message: 'Vote recorded',
            data: {
                reviewId,
                voteId: insertResult.insertedId,
                voted: true,
                helpful
            }
        });
    }
    catch (error) {
        console.error('Submit helpful vote error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/user/review/:reviewId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const { reviewId } = req.params;
        if (!mongodb_2.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const reviewObjectId = mongodb_2.ObjectId.createFromHexString(reviewId);
        const userId = mongodb_2.ObjectId.createFromHexString(user.userId);
        const userVote = await db.collection('helpful_votes').findOne({
            reviewId: reviewObjectId,
            userId
        });
        res.status(200).json({
            success: true,
            data: {
                reviewId,
                hasVoted: !!userVote,
                vote: userVote ? {
                    helpful: userVote.helpful,
                    votedAt: userVote.createdAt
                } : null
            }
        });
    }
    catch (error) {
        console.error('Get user vote error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '10'), 100);
        const page = Math.max(parseInt(req.query.page || '1'), 1);
        const skip = (page - 1) * limit;
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const leaderboard = await db.collection('helpful_votes').aggregate([
            {
                $group: {
                    _id: '$reviewId',
                    helpfulCount: {
                        $sum: {
                            $cond: [{ $eq: ['$helpful', true] }, 1, 0]
                        }
                    },
                    totalVotes: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    helpfulPercentage: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ['$helpfulCount', '$totalVotes'] },
                                    100
                                ]
                            },
                            2
                        ]
                    }
                }
            },
            { $sort: { helpfulCount: -1, helpfulPercentage: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'review'
                }
            },
            { $unwind: '$review' }
        ]).toArray();
        const totalCount = await db.collection('helpful_votes').aggregate([
            {
                $group: {
                    _id: '$reviewId'
                }
            },
            {
                $count: 'count'
            }
        ]).toArray();
        res.status(200).json({
            success: true,
            data: leaderboard.map((item) => ({
                reviewId: item._id,
                helpfulCount: item.helpfulCount,
                totalVotes: item.totalVotes,
                helpfulPercentage: item.helpfulPercentage,
                review: {
                    title: item.review.title,
                    rating: item.review.rating,
                    text: item.review.text
                }
            })),
            pagination: {
                total: totalCount.length > 0 ? totalCount[0].count : 0,
                limit,
                page,
                pages: totalCount.length > 0 ? Math.ceil(totalCount[0].count / limit) : 0
            }
        });
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/:voteId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const { voteId } = req.params;
        if (!mongodb_2.ObjectId.isValid(voteId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote ID'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const voteObjectId = mongodb_2.ObjectId.createFromHexString(voteId);
        const userId = mongodb_2.ObjectId.createFromHexString(user.userId);
        const vote = await db.collection('helpful_votes').findOne({
            _id: voteObjectId
        });
        if (!vote) {
            return res.status(404).json({
                success: false,
                message: 'Vote not found'
            });
        }
        if (vote.userId.toString() !== userId.toString() && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only delete your own votes'
            });
        }
        const deleteResult = await db.collection('helpful_votes').deleteOne({
            _id: voteObjectId
        });
        res.status(200).json({
            success: true,
            message: 'Vote deleted',
            data: {
                deletedCount: deleteResult.deletedCount
            }
        });
    }
    catch (error) {
        console.error('Delete vote error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=helpful-votes.js.map