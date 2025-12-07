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
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, sport, city, search, latitude, longitude, radius = 10, featured, sortBy = 'name', sortOrder = 'asc' } = req.query;
        const filter = { status: 'active' };
        if (category) {
            filter.category = category;
        }
        if (sport) {
            filter.sport = new RegExp(sport, 'i');
        }
        if (city) {
            filter['address.city'] = new RegExp(city, 'i');
        }
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { sport: new RegExp(search, 'i') },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }
        let query = models_1.Sports.find(filter);
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const radiusInMeters = parseFloat(radius) * 1000;
            query = models_1.Sports.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [lng, lat] },
                        distanceField: "distance",
                        maxDistance: radiusInMeters,
                        query: filter,
                        spherical: true
                    }
                },
                {
                    $addFields: {
                        distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] }
                    }
                }
            ]);
        }
        else {
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            query = query.sort(sortOptions);
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let sports, total;
        if (latitude && longitude) {
            const results = await query.skip(skip).limit(limitNum);
            sports = results;
            total = await models_1.Sports.countDocuments(filter);
        }
        else {
            sports = await query.skip(skip).limit(limitNum);
            total = await models_1.Sports.countDocuments(filter);
        }
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            data: sports,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            },
            filters: {
                category,
                sport,
                city,
                search,
                featured
            }
        });
    }
    catch (error) {
        console.error('Error fetching sports facilities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sports facilities',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/categories', async (req, res) => {
    try {
        const categories = await models_1.Sports.distinct('category', { status: 'active' });
        const sportsTypes = await models_1.Sports.distinct('sport', { status: 'active' });
        const cities = await models_1.Sports.distinct('address.city', { status: 'active' });
        res.json({
            success: true,
            data: {
                categories: categories.sort(),
                sports: sportsTypes.sort(),
                cities: cities.sort()
            }
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sports facility ID'
            });
        }
        const sportsFacility = await models_1.Sports.findById(id);
        if (!sportsFacility) {
            return res.status(404).json({
                success: false,
                message: 'Sports facility not found'
            });
        }
        res.json({
            success: true,
            data: sportsFacility
        });
    }
    catch (error) {
        console.error('Error fetching sports facility:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sports facility',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        const sportsFacility = new models_1.Sports(req.body);
        await sportsFacility.save();
        res.status(201).json({
            success: true,
            message: 'Sports facility created successfully',
            data: sportsFacility
        });
    }
    catch (error) {
        console.error('Error creating sports facility:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating sports facility',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
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
                message: 'Invalid sports facility ID'
            });
        }
        const sportsFacility = await models_1.Sports.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if (!sportsFacility) {
            return res.status(404).json({
                success: false,
                message: 'Sports facility not found'
            });
        }
        res.json({
            success: true,
            message: 'Sports facility updated successfully',
            data: sportsFacility
        });
    }
    catch (error) {
        console.error('Error updating sports facility:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating sports facility',
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
                message: 'Invalid sports facility ID'
            });
        }
        const sportsFacility = await models_1.Sports.findByIdAndDelete(id);
        if (!sportsFacility) {
            return res.status(404).json({
                success: false,
                message: 'Sports facility not found'
            });
        }
        res.json({
            success: true,
            message: 'Sports facility deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting sports facility:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting sports facility',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
exports.default = router;
//# sourceMappingURL=sports.js.map