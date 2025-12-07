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
        const { page = 1, limit = 10, category, transportType, from, to, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
        const filter = { isActive: true };
        if (category) {
            filter.category = category;
        }
        if (transportType) {
            filter.transportType = transportType;
        }
        if (from) {
            filter.from = new RegExp(from, 'i');
        }
        if (to) {
            filter.to = new RegExp(to, 'i');
        }
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { from: new RegExp(search, 'i') },
                { to: new RegExp(search, 'i') }
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const travelInfo = await models_1.Travel.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
        const total = await models_1.Travel.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            data: travelInfo,
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
                transportType,
                from,
                to,
                search
            }
        });
    }
    catch (error) {
        console.error('Error fetching travel information:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching travel information',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/types', async (req, res) => {
    try {
        const categories = await models_1.Travel.distinct('category', { isActive: true });
        const transportTypes = await models_1.Travel.distinct('transportType', { isActive: true });
        const fromLocations = await models_1.Travel.distinct('from', { isActive: true });
        const toLocations = await models_1.Travel.distinct('to', { isActive: true });
        res.json({
            success: true,
            data: {
                categories: categories.sort(),
                transportTypes: transportTypes.sort(),
                fromLocations: fromLocations.sort(),
                toLocations: toLocations.sort()
            }
        });
    }
    catch (error) {
        console.error('Error fetching travel types:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching travel types',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/tips', async (req, res) => {
    try {
        const { category, priority, limit = 20, sortBy = 'priority', sortOrder = 'asc' } = req.query;
        const filter = { isActive: true };
        if (category) {
            filter.category = category;
        }
        if (priority) {
            filter.priority = parseInt(priority);
        }
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const tips = await models_1.TravelTip.find(filter)
            .sort(sortOptions)
            .limit(parseInt(limit));
        const categories = await models_1.TravelTip.distinct('category', { isActive: true });
        res.json({
            success: true,
            data: tips,
            categories: categories.sort(),
            count: tips.length
        });
    }
    catch (error) {
        console.error('Error fetching travel tips:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching travel tips',
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
                message: 'Invalid travel information ID'
            });
        }
        const travelInfo = await models_1.Travel.findById(id);
        if (!travelInfo) {
            return res.status(404).json({
                success: false,
                message: 'Travel information not found'
            });
        }
        res.json({
            success: true,
            data: travelInfo
        });
    }
    catch (error) {
        console.error('Error fetching travel information:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching travel information',
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
        const travelInfo = new models_1.Travel(req.body);
        await travelInfo.save();
        res.status(201).json({
            success: true,
            message: 'Travel information created successfully',
            data: travelInfo
        });
    }
    catch (error) {
        console.error('Error creating travel information:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating travel information',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.post('/tips', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        const tip = new models_1.TravelTip(req.body);
        await tip.save();
        res.status(201).json({
            success: true,
            message: 'Travel tip created successfully',
            data: tip
        });
    }
    catch (error) {
        console.error('Error creating travel tip:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating travel tip',
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
                message: 'Invalid travel information ID'
            });
        }
        const travelInfo = await models_1.Travel.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if (!travelInfo) {
            return res.status(404).json({
                success: false,
                message: 'Travel information not found'
            });
        }
        res.json({
            success: true,
            message: 'Travel information updated successfully',
            data: travelInfo
        });
    }
    catch (error) {
        console.error('Error updating travel information:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating travel information',
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
                message: 'Invalid travel information ID'
            });
        }
        const travelInfo = await models_1.Travel.findByIdAndDelete(id);
        if (!travelInfo) {
            return res.status(404).json({
                success: false,
                message: 'Travel information not found'
            });
        }
        res.json({
            success: true,
            message: 'Travel information deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting travel information:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting travel information',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
exports.default = router;
//# sourceMappingURL=travel.js.map