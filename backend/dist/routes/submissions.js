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
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const { status, type, sortBy = 'createdAt', limit = 20, skip = 0 } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const filter = {};
        if (userRole !== 'admin') {
            filter.userId = new mongodb_2.ObjectId(userId);
        }
        if (status) {
            filter.status = status;
        }
        if (type) {
            filter.type = type;
        }
        const sortOptions = {};
        switch (sortBy) {
            case 'oldest':
                sortOptions.createdAt = 1;
                break;
            case 'status':
                sortOptions.status = 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }
        const submissions = await db
            .collection('submissions')
            .find(filter)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip(Number(skip))
            .toArray();
        const totalCount = await db
            .collection('submissions')
            .countDocuments(filter);
        res.status(200).json({
            success: true,
            data: submissions,
            pagination: {
                total: totalCount,
                limit: Number(limit),
                skip: Number(skip)
            }
        });
    }
    catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions'
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
                message: 'Invalid submission ID'
            });
        }
        const submission = await db
            .collection('submissions')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        if (userRole !== 'admin' && submission.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this submission'
            });
        }
        res.status(200).json({
            success: true,
            data: submission
        });
    }
    catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submission'
        });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { type, title, description, category, location, contact, attachments } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (!type || !title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: type, title, description'
            });
        }
        const validTypes = ['place', 'event', 'business', 'general-inquiry', 'correction'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid submission type'
            });
        }
        const newSubmission = {
            userId: new mongodb_2.ObjectId(userId),
            type,
            title: title.trim(),
            description: description.trim(),
            category: category?.trim(),
            location,
            contact,
            attachments: attachments || [],
            status: 'pending',
            priority: 'medium',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db
            .collection('submissions')
            .insertOne(newSubmission);
        res.status(201).json({
            success: true,
            data: {
                _id: result.insertedId,
                ...newSubmission
            },
            message: 'Submission created successfully'
        });
    }
    catch (error) {
        console.error('Create submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create submission'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const { id } = req.params;
        const updates = req.body;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });
        }
        const submission = await db
            .collection('submissions')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        if (userRole !== 'admin') {
            if (submission.userId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to update this submission'
                });
            }
            if (submission.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only update pending submissions'
                });
            }
            delete updates.status;
            delete updates.adminNotes;
            delete updates.adminId;
            delete updates.priority;
        }
        delete updates.createdAt;
        const result = await db
            .collection('submissions')
            .findOneAndUpdate({ _id: new mongodb_2.ObjectId(id) }, {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value,
            message: 'Submission updated successfully'
        });
    }
    catch (error) {
        console.error('Update submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update submission'
        });
    }
});
router.put('/:id/review', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userRole = req.user?.role;
        const adminId = req.user?.userId;
        const { id } = req.params;
        const { status, adminNotes, priority } = req.body;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });
        }
        const validStatuses = ['approved', 'rejected', 'in-review'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        const result = await db
            .collection('submissions')
            .findOneAndUpdate({ _id: new mongodb_2.ObjectId(id) }, {
            $set: {
                status,
                adminNotes: adminNotes || '',
                priority: priority || 'medium',
                adminId: new mongodb_2.ObjectId(adminId),
                reviewedAt: new Date(),
                updatedAt: new Date()
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value,
            message: 'Submission reviewed successfully'
        });
    }
    catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review submission'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const { id } = req.params;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid submission ID'
            });
        }
        const submission = await db
            .collection('submissions')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        if (userRole !== 'admin') {
            if (submission.userId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to delete this submission'
                });
            }
            if (submission.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only delete pending submissions'
                });
            }
        }
        const result = await db
            .collection('submissions')
            .deleteOne({ _id: new mongodb_2.ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Submission deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete submission'
        });
    }
});
exports.default = router;
//# sourceMappingURL=submissions.js.map