"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const sampleFeedbackData = [
    {
        type: 'feature',
        subject: 'Add Dark Mode Support',
        message: 'It would be great to have a dark mode option for the website. Many users prefer dark themes, especially for evening browsing.',
        email: 'user@example.com',
        rating: 4,
        likes: ['Easy navigation', 'Good content', 'Fast loading'],
        dislikes: ['Bright colors at night'],
        status: 'new',
        priority: 'medium',
        category: 'UI/UX Enhancement',
        viewCount: 0
    },
    {
        type: 'bug',
        subject: 'Search Not Working Properly',
        message: 'The search function is not returning accurate results when searching for hotels in specific areas.',
        email: 'reporter@example.com',
        rating: 2,
        likes: ['Good hotel listings'],
        dislikes: ['Search functionality', 'Slow results'],
        status: 'reviewed',
        priority: 'high',
        category: 'Technical Issue',
        viewCount: 5
    },
    {
        type: 'general',
        subject: 'Excellent Service',
        message: 'Great website with comprehensive information about Kolkata. Really helped in planning my trip!',
        email: 'happy.user@example.com',
        rating: 5,
        likes: ['Complete information', 'User-friendly', 'Good recommendations'],
        dislikes: [],
        status: 'reviewed',
        priority: 'low',
        category: 'General Feedback',
        viewCount: 2
    },
    {
        type: 'content',
        subject: 'Missing Restaurant Information',
        message: 'Some popular restaurants are missing from the listings. Would be helpful to add more local eateries.',
        rating: 3,
        likes: ['Existing restaurant info is good'],
        dislikes: ['Incomplete listings'],
        status: 'new',
        priority: 'medium',
        category: 'Content Suggestion',
        viewCount: 1
    }
];
const initializeSampleData = async () => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            console.log('⏳ Database not ready, skipping feedback initialization');
            return;
        }
        const existingCount = await models_1.Feedback.countDocuments();
        if (existingCount === 0) {
            await models_1.Feedback.insertMany(sampleFeedbackData);
            console.log('✅ Sample feedback data initialized');
        }
    }
    catch (error) {
        console.error('❌ Error initializing feedback sample data:', error);
    }
};
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        await initializeSampleData();
        const { page = 1, limit = 10, type, status, priority, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = {};
        if (type) {
            filter.type = type;
        }
        if (status) {
            filter.status = status;
        }
        if (priority) {
            filter.priority = priority;
        }
        if (category) {
            filter.category = new RegExp(category, 'i');
        }
        if (search) {
            filter.$or = [
                { subject: new RegExp(search, 'i') },
                { message: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const feedback = await models_1.Feedback.find(filter)
            .populate('reviewedBy', 'name email')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
        const total = await models_1.Feedback.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);
        const stats = await models_1.Feedback.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);
        const typeStats = await models_1.Feedback.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json({
            success: true,
            data: feedback,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            },
            statistics: {
                byStatus: stats,
                byType: typeStats
            },
            filters: {
                type,
                status,
                priority,
                category,
                search
            }
        });
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        const totalFeedback = await models_1.Feedback.countDocuments();
        const avgRating = await models_1.Feedback.aggregate([
            { $match: { rating: { $exists: true } } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
        ]);
        const statusBreakdown = await models_1.Feedback.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const typeBreakdown = await models_1.Feedback.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);
        const priorityBreakdown = await models_1.Feedback.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);
        const recentFeedback = await models_1.Feedback.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('subject type status createdAt rating');
        res.json({
            success: true,
            data: {
                total: totalFeedback,
                averageRating: avgRating.length > 0 ? avgRating[0].average : 0,
                statusBreakdown,
                typeBreakdown,
                priorityBreakdown,
                recentFeedback
            }
        });
    }
    catch (error) {
        console.error('Error fetching feedback statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback statistics',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid feedback ID'
            });
        }
        const feedback = await models_1.Feedback.findById(id).populate('reviewedBy', 'name email');
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        await models_1.Feedback.findByIdAndUpdate(id, {
            $inc: { viewCount: 1 },
            $set: {
                viewedAt: new Date(),
                viewedBy: user.userId
            }
        });
        res.json({
            success: true,
            data: feedback
        });
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const { type, subject, message, email, rating, likes, dislikes, category } = req.body;
        if (!type || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Type, subject, and message are required'
            });
        }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        const feedback = new models_1.Feedback({
            type,
            subject,
            message,
            email,
            rating,
            likes: Array.isArray(likes) ? likes : [],
            dislikes: Array.isArray(dislikes) ? dislikes : [],
            category: category || 'General',
            status: 'new',
            priority: 'medium',
            viewCount: 0
        });
        await feedback.save();
        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully. Thank you for your input!',
            data: {
                id: feedback._id,
                status: feedback.status
            }
        });
    }
    catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.put('/:id/review', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { status, priority, notes } = req.body;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid feedback ID'
            });
        }
        const updateData = {
            reviewedAt: new Date(),
            reviewedBy: user.userId
        };
        if (status)
            updateData.status = status;
        if (priority)
            updateData.priority = priority;
        if (notes)
            updateData.notes = notes;
        const feedback = await models_1.Feedback.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).populate('reviewedBy', 'name email');
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        res.json({
            success: true,
            message: 'Feedback reviewed successfully',
            data: feedback
        });
    }
    catch (error) {
        console.error('Error reviewing feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error reviewing feedback',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid feedback ID'
            });
        }
        const feedback = await models_1.Feedback.findByIdAndDelete(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting feedback',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
exports.default = router;
//# sourceMappingURL=feedback.js.map