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
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '12');
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const priceRange = req.query.priceRange;
        const rating = req.query.rating;
        const location = req.query.location;
        const search = req.query.search;
        const entryFeeType = req.query.entryFeeType;
        const hasGuidedTour = req.query.hasGuidedTour;
        const hasAudioGuide = req.query.hasAudioGuide;
        const isWheelchairAccessible = req.query.isWheelchairAccessible;
        const hasParking = req.query.hasParking;
        const query = {};
        if (category) {
            query.category = { $in: category.split(',') };
        }
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            query.entryFee = { $gte: min, $lte: max };
        }
        if (rating) {
            query.averageRating = { $gte: parseFloat(rating) };
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        if (entryFeeType) {
            query.entryFeeType = entryFeeType;
        }
        if (hasGuidedTour === 'true') {
            query.hasGuidedTour = true;
        }
        if (hasAudioGuide === 'true') {
            query.hasAudioGuide = true;
        }
        if (isWheelchairAccessible === 'true') {
            query.isWheelchairAccessible = true;
        }
        if (hasParking === 'true') {
            query.hasParking = true;
        }
        const attractions = await models_1.Attraction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await models_1.Attraction.countDocuments(query);
        res.status(200).json({
            success: true,
            data: attractions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            }
        });
    }
    catch (error) {
        console.error('Error fetching attractions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attractions',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.post('/', auth_1.requireAdmin, async (req, res) => {
    try {
        await (0, db_1.default)();
        const attractionData = req.body;
        const attraction = new models_1.Attraction(attractionData);
        const savedAttraction = await attraction.save();
        res.status(201).json({
            success: true,
            data: savedAttraction,
            message: 'Attraction created successfully'
        });
    }
    catch (error) {
        console.error('Error creating attraction:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create attraction',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const attraction = await models_1.Attraction.findById(id).lean();
        if (!attraction) {
            return res.status(404).json({
                success: false,
                message: 'Attraction not found'
            });
        }
        res.status(200).json({
            success: true,
            data: attraction
        });
    }
    catch (error) {
        console.error('Error fetching attraction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attraction',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=attractions.js.map