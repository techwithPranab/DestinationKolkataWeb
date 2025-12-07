"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("../lib/mongodb");
const mongodb_2 = require("mongodb");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const { status, severity, itemType, sortBy = 'createdAt', limit = 20, skip = 0 } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (severity) {
            filter.severity = severity;
        }
        if (itemType) {
            filter.itemType = itemType;
        }
        const sortOptions = {};
        switch (sortBy) {
            case 'oldest':
                sortOptions.createdAt = 1;
                break;
            case 'severity':
                sortOptions.severity = -1;
                sortOptions.createdAt = -1;
                break;
            default:
                sortOptions.createdAt = -1;
        }
        const reports = await db
            .collection('reports')
            .find(filter)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip(Number(skip))
            .toArray();
        const totalCount = await db
            .collection('reports')
            .countDocuments(filter);
        const statusBreakdown = await db
            .collection('reports')
            .aggregate([
            { $match: filter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
            .toArray();
        const severityBreakdown = await db
            .collection('reports')
            .aggregate([
            { $match: filter },
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ])
            .toArray();
        res.status(200).json({
            success: true,
            data: reports,
            analytics: {
                statusBreakdown: Object.fromEntries(statusBreakdown.map(s => [s._id, s.count])),
                severityBreakdown: Object.fromEntries(severityBreakdown.map(s => [s._id, s.count]))
            },
            pagination: {
                total: totalCount,
                limit: Number(limit),
                skip: Number(skip)
            }
        });
    }
    catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
});
router.get('/user/my-reports', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { status, limit = 20, skip = 0 } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const filter = { userId: new mongodb_2.ObjectId(userId) };
        if (status) {
            filter.status = status;
        }
        const reports = await db
            .collection('reports')
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip))
            .toArray();
        const totalCount = await db
            .collection('reports')
            .countDocuments(filter);
        res.status(200).json({
            success: true,
            data: reports,
            pagination: {
                total: totalCount,
                limit: Number(limit),
                skip: Number(skip)
            }
        });
    }
    catch (error) {
        console.error('Get user reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user reports'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const { id } = req.params;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report ID'
            });
        }
        const report = await db
            .collection('reports')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        if (userRole !== 'admin' && report.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this report'
            });
        }
        res.status(200).json({
            success: true,
            data: report
        });
    }
    catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report'
        });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { itemId, itemType, reason, description, severity, attachments } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (!itemId || !itemType || !reason || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: itemId, itemType, reason, description'
            });
        }
        const validItemTypes = ['review', 'listing', 'comment', 'user', 'content'];
        if (!validItemTypes.includes(itemType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item type'
            });
        }
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        const reportSeverity = validSeverities.includes(severity) ? severity : 'medium';
        const existingReport = await db
            .collection('reports')
            .findOne({
            userId: new mongodb_2.ObjectId(userId),
            itemId: new mongodb_2.ObjectId(itemId),
            status: { $in: ['open', 'investigating'] }
        });
        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You already have an open report for this item'
            });
        }
        const newReport = {
            userId: new mongodb_2.ObjectId(userId),
            itemId: new mongodb_2.ObjectId(itemId),
            itemType,
            reason,
            description: description.trim(),
            severity: reportSeverity,
            status: 'open',
            attachments: attachments || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db
            .collection('reports')
            .insertOne(newReport);
        res.status(201).json({
            success: true,
            data: {
                _id: result.insertedId,
                ...newReport
            },
            message: 'Report submitted successfully'
        });
    }
    catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create report'
        });
    }
});
router.put('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userRole = req.user?.role;
        const adminId = req.user?.userId;
        const { id } = req.params;
        const { status, actionTaken } = req.body;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report ID'
            });
        }
        const validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        const updateData = {
            status,
            adminId: new mongodb_2.ObjectId(adminId),
            updatedAt: new Date()
        };
        if (actionTaken) {
            updateData.actionTaken = actionTaken;
        }
        if (status === 'resolved' || status === 'dismissed') {
            updateData.resolvedAt = new Date();
        }
        const result = await db
            .collection('reports')
            .findOneAndUpdate({ _id: new mongodb_2.ObjectId(id) }, { $set: updateData }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value,
            message: 'Report status updated successfully'
        });
    }
    catch (error) {
        console.error('Update report status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update report status'
        });
    }
});
router.get('/stats/overview', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const [totalReports, openReports, investigatingReports, resolvedReports] = await Promise.all([
            db.collection('reports').countDocuments({}),
            db.collection('reports').countDocuments({ status: 'open' }),
            db.collection('reports').countDocuments({ status: 'investigating' }),
            db.collection('reports').countDocuments({ status: 'resolved' })
        ]);
        const itemTypeBreakdown = await db
            .collection('reports')
            .aggregate([
            { $group: { _id: '$itemType', count: { $sum: 1 } } }
        ])
            .toArray();
        const severityBreakdown = await db
            .collection('reports')
            .aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ])
            .toArray();
        res.status(200).json({
            success: true,
            data: {
                totalReports,
                openReports,
                investigatingReports,
                resolvedReports,
                itemTypeBreakdown: Object.fromEntries(itemTypeBreakdown.map(i => [i._id, i.count])),
                severityBreakdown: Object.fromEntries(severityBreakdown.map(s => [s._id, s.count]))
            }
        });
    }
    catch (error) {
        console.error('Get report statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=report.js.map