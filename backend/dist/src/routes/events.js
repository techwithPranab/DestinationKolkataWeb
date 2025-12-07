"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../lib/db"));
const models_1 = require("../models");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        await (0, db_1.default)();
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '12');
        const skip = (page - 1) * limit;
        const query = {};
        if (req.query.category) {
            query.category = { $in: req.query.category.split(',') };
        }
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        const events = await models_1.Event.find(query)
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await models_1.Event.countDocuments(query);
        res.status(200).json({
            success: true,
            data: events,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.post('/', async (req, res) => {
    try {
        await (0, db_1.default)();
        const event = new models_1.Event(req.body);
        const savedEvent = await event.save();
        res.status(201).json({
            success: true,
            data: savedEvent,
            message: 'Event created successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create event',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        await (0, db_1.default)();
        const event = await models_1.Event.findById(req.params.id).lean();
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        res.status(200).json({
            success: true,
            data: event
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event'
        });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map