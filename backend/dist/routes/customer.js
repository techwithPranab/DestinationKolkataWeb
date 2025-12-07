"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("../lib/mongodb");
const mongodb_2 = require("mongodb");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const customer = await db
            .collection('customers')
            .findOne({ userId: new mongodb_2.ObjectId(userId) });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }
        res.status(200).json({
            success: true,
            data: customer
        });
    }
    catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer profile'
        });
    }
});
router.get('/preferences', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const customer = await db
            .collection('customers')
            .findOne({ userId: new mongodb_2.ObjectId(userId) }, { projection: { preferences: 1 } });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        res.status(200).json({
            success: true,
            data: customer.preferences || {}
        });
    }
    catch (error) {
        console.error('Get customer preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch preferences'
        });
    }
});
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { phone, profilePicture, bio } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const updates = {};
        if (phone)
            updates.phone = phone;
        if (profilePicture)
            updates.profilePicture = profilePicture;
        if (bio)
            updates.bio = bio;
        const result = await db
            .collection('customers')
            .findOneAndUpdate({ userId: new mongodb_2.ObjectId(userId) }, {
            $set: {
                ...updates,
                'metadata.lastLogin': new Date()
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        console.error('Update customer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});
router.put('/preferences', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const preferences = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (preferences.language) {
            const validLanguages = ['en', 'hi', 'bn'];
            if (!validLanguages.includes(preferences.language)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid language selected'
                });
            }
        }
        if (preferences.privacyLevel) {
            const validLevels = ['public', 'private', 'friends-only'];
            if (!validLevels.includes(preferences.privacyLevel)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid privacy level'
                });
            }
        }
        const result = await db
            .collection('customers')
            .findOneAndUpdate({ userId: new mongodb_2.ObjectId(userId) }, {
            $set: {
                'preferences.language': preferences.language || 'en',
                'preferences.notifications.email': preferences.notifications?.email !== false,
                'preferences.notifications.sms': preferences.notifications?.sms !== false,
                'preferences.notifications.push': preferences.notifications?.push !== false,
                'preferences.privacyLevel': preferences.privacyLevel || 'public',
                'preferences.marketingEmails': preferences.marketingEmails !== false
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value.preferences,
            message: 'Preferences updated successfully'
        });
    }
    catch (error) {
        console.error('Update customer preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
});
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const userObjectId = new mongodb_2.ObjectId(userId);
        const [reviewCount, favoriteCount, bookingCount, listingCount] = await Promise.all([
            db.collection('reviews').countDocuments({ 'customer.userId': userObjectId }),
            db.collection('favorites').countDocuments({ userId: userObjectId }),
            db.collection('bookings').countDocuments({ customerId: userObjectId }),
            db.collection('listings').countDocuments({ userId: userObjectId })
        ]);
        res.status(200).json({
            success: true,
            data: {
                reviewCount,
                favoriteCount,
                bookingCount,
                listingCount
            }
        });
    }
    catch (error) {
        console.error('Get customer stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer statistics'
        });
    }
});
router.get('/activity-log', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { limit = 20, skip = 0 } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const userObjectId = new mongodb_2.ObjectId(userId);
        const activities = await db
            .collection('activitylogs')
            .find({ userId: userObjectId })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip))
            .toArray();
        const totalCount = await db
            .collection('activitylogs')
            .countDocuments({ userId: userObjectId });
        res.status(200).json({
            success: true,
            data: activities,
            pagination: {
                total: totalCount,
                limit: Number(limit),
                skip: Number(skip)
            }
        });
    }
    catch (error) {
        console.error('Get activity log error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity log'
        });
    }
});
router.delete('/account', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { password } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required for account deletion'
            });
        }
        const result = await db
            .collection('customers')
            .findOneAndUpdate({ userId: new mongodb_2.ObjectId(userId) }, {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
                'preferences.marketingEmails': false
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
});
exports.default = router;
//# sourceMappingURL=customer.js.map