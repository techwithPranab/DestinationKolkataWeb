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
        const { page = 1, limit = 10, businessType, active, search, sortBy = 'validUntil', sortOrder = 'asc', includeExpired = false } = req.query;
        const filter = {};
        if (businessType) {
            filter.businessType = businessType;
        }
        if (active !== undefined) {
            filter.isActive = active === 'true';
        }
        if (!includeExpired || includeExpired === 'false') {
            filter.validUntil = { $gte: new Date() };
        }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { code: new RegExp(search, 'i') }
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const promotions = await models_1.Promotion.find(filter)
            .populate('business', 'name')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
        const total = await models_1.Promotion.countDocuments(filter);
        console.log('Total promotions found:', total);
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            data: promotions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            },
            filters: {
                businessType,
                active,
                search,
                includeExpired
            }
        });
    }
    catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching promotions',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/active', async (req, res) => {
    try {
        const { businessType, limit = 20 } = req.query;
        const filter = {
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        };
        if (businessType) {
            filter.businessType = businessType;
        }
        const promotions = await models_1.Promotion.find(filter)
            .populate('business', 'name location')
            .sort({ validUntil: 1 })
            .limit(parseInt(limit));
        res.json({
            success: true,
            data: promotions,
            count: promotions.length
        });
    }
    catch (error) {
        console.error('Error fetching active promotions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active promotions',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.get('/validate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { businessType, amount } = req.query;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Promotion code is required'
            });
        }
        const filter = {
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        };
        if (businessType) {
            filter.businessType = businessType;
        }
        const promotion = await models_1.Promotion.findOne(filter).populate('business', 'name');
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired promotion code'
            });
        }
        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Promotion code usage limit exceeded'
            });
        }
        if (amount && promotion.minAmount && parseFloat(amount) < promotion.minAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum amount of ₹${promotion.minAmount} required for this promotion`
            });
        }
        let discountAmount = 0;
        if (promotion.discountPercent && amount) {
            discountAmount = (parseFloat(amount) * promotion.discountPercent) / 100;
            if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
                discountAmount = promotion.maxDiscount;
            }
        }
        else if (promotion.discountAmount) {
            discountAmount = promotion.discountAmount;
        }
        res.json({
            success: true,
            data: {
                promotion,
                discountAmount,
                finalAmount: amount ? parseFloat(amount) - discountAmount : null
            },
            message: 'Promotion code is valid'
        });
    }
    catch (error) {
        console.error('Error validating promotion code:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating promotion code',
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
                message: 'Invalid promotion ID'
            });
        }
        const promotion = await models_1.Promotion.findById(id).populate('business', 'name location contact');
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        res.json({
            success: true,
            data: promotion
        });
    }
    catch (error) {
        console.error('Error fetching promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching promotion',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!['admin', 'business'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or business role required.'
            });
        }
        const { title, description, business, businessType, validFrom, validUntil } = req.body;
        if (!title || !description || !business || !businessType || !validFrom || !validUntil) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        if (!req.body.code) {
            req.body.code = `PROMO${Date.now().toString().slice(-6)}`;
        }
        const promotion = new models_1.Promotion(req.body);
        await promotion.save();
        res.status(201).json({
            success: true,
            message: 'Promotion created successfully',
            data: promotion
        });
    }
    catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating promotion',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!['admin', 'business'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or business role required.'
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid promotion ID'
            });
        }
        const promotion = await models_1.Promotion.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        res.json({
            success: true,
            message: 'Promotion updated successfully',
            data: promotion
        });
    }
    catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating promotion',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
router.post('/:id/use', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid promotion ID'
            });
        }
        const promotion = await models_1.Promotion.findByIdAndUpdate(id, { $inc: { usedCount: 1 } }, { new: true });
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        res.json({
            success: true,
            message: 'Promotion usage recorded',
            data: { usedCount: promotion.usedCount }
        });
    }
    catch (error) {
        console.error('Error recording promotion usage:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording promotion usage',
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
                message: 'Invalid promotion ID'
            });
        }
        const promotion = await models_1.Promotion.findByIdAndDelete(id);
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        res.json({
            success: true,
            message: 'Promotion deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting promotion',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});
exports.default = router;
//# sourceMappingURL=promotions.js.map