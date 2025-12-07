"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("../lib/mongodb");
const mongodb_2 = require("mongodb");
const auth_1 = require("../middleware/auth");
const email_1 = require("../lib/email");
const router = (0, express_1.Router)();
router.post('/booking-confirmation', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { bookingId } = req.body;
        if (!user || !bookingId) {
            return res.status(400).json({
                success: false,
                message: 'bookingId is required'
            });
        }
        if (!mongodb_2.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const bookingObjectId = mongodb_2.ObjectId.createFromHexString(bookingId);
        const booking = await db.collection('bookings').findOne({
            _id: bookingObjectId,
            userId: mongodb_2.ObjectId.createFromHexString(user.userId)
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        const userDoc = await db.collection('users').findOne({
            _id: mongodb_2.ObjectId.createFromHexString(user.userId)
        });
        if (!userDoc || !userDoc.email) {
            return res.status(400).json({
                success: false,
                message: 'User email not found'
            });
        }
        const emailHtml = (0, email_1.getBookingConfirmationTemplate)({
            customerName: userDoc.name || 'Traveler',
            bookingId: booking._id.toString(),
            itemName: booking.itemName,
            itemType: booking.itemType,
            checkInDate: booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : undefined,
            checkOutDate: booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : undefined,
            eventDate: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : undefined,
            numberOfGuests: booking.numberOfGuests,
            totalAmount: booking.totalAmount,
            confirmationNumber: booking._id.toString().slice(-8).toUpperCase()
        });
        const sent = await (0, email_1.sendEmail)({
            to: userDoc.email,
            subject: `Booking Confirmation - ${booking.itemName}`,
            html: emailHtml
        });
        if (sent) {
            await db.collection('bookings').updateOne({ _id: bookingObjectId }, { $set: { confirmationSent: true, confirmationSentAt: new Date() } });
        }
        res.status(200).json({
            success: true,
            message: 'Confirmation email sent',
            data: { sent }
        });
    }
    catch (error) {
        console.error('Send booking confirmation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/booking-status-update', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { bookingId, newStatus, message } = req.body;
        if (!user || !bookingId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: 'bookingId and newStatus are required'
            });
        }
        if (!mongodb_2.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        const validStatuses = ['confirmed', 'cancelled', 'completed', 'no-show'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const bookingObjectId = mongodb_2.ObjectId.createFromHexString(bookingId);
        const booking = await db.collection('bookings').findOne({
            _id: bookingObjectId,
            userId: mongodb_2.ObjectId.createFromHexString(user.userId)
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        const userDoc = await db.collection('users').findOne({
            _id: mongodb_2.ObjectId.createFromHexString(user.userId)
        });
        if (!userDoc || !userDoc.email) {
            return res.status(400).json({
                success: false,
                message: 'User email not found'
            });
        }
        const emailHtml = (0, email_1.getBookingStatusUpdateTemplate)({
            customerName: userDoc.name || 'Traveler',
            bookingId: booking._id.toString(),
            status: newStatus,
            itemName: booking.itemName,
            message
        });
        const sent = await (0, email_1.sendEmail)({
            to: userDoc.email,
            subject: `Booking Status Updated - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            html: emailHtml
        });
        res.status(200).json({
            success: true,
            message: 'Status update email sent',
            data: { sent }
        });
    }
    catch (error) {
        console.error('Send booking status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/admin-alert', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin only'
            });
        }
        const { subject, message, details, recipientRole = 'admin' } = req.body;
        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'subject and message are required'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const admins = await db.collection('users').find({
            role: recipientRole,
            email: { $exists: true, $ne: null }
        }).toArray();
        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No admin emails found'
            });
        }
        const emailHtml = (0, email_1.getAdminNotificationTemplate)({
            subject,
            message,
            details
        });
        const sendPromises = admins.map(admin => (0, email_1.sendEmail)({
            to: admin.email,
            subject: `[ADMIN] ${subject}`,
            html: emailHtml
        }));
        await Promise.all(sendPromises);
        res.status(200).json({
            success: true,
            message: 'Admin alert sent',
            data: {
                recipientCount: admins.length
            }
        });
    }
    catch (error) {
        console.error('Send admin alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/welcome', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userDoc = await db.collection('users').findOne({
            _id: mongodb_2.ObjectId.createFromHexString(user.userId)
        });
        if (!userDoc || !userDoc.email) {
            return res.status(400).json({
                success: false,
                message: 'User email not found'
            });
        }
        const emailHtml = (0, email_1.getWelcomeTemplate)({
            customerName: userDoc.name || 'Traveler'
        });
        const sent = await (0, email_1.sendEmail)({
            to: userDoc.email,
            subject: 'Welcome to Destination Kolkata!',
            html: emailHtml
        });
        if (sent) {
            await db.collection('users').updateOne({ _id: mongodb_2.ObjectId.createFromHexString(user.userId) }, { $set: { welcomeEmailSent: true, welcomeEmailSentAt: new Date() } });
        }
        res.status(200).json({
            success: true,
            message: 'Welcome email sent',
            data: { sent }
        });
    }
    catch (error) {
        console.error('Send welcome email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/email-status/:bookingId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { bookingId } = req.params;
        if (!mongodb_2.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const bookingObjectId = mongodb_2.ObjectId.createFromHexString(bookingId);
        const booking = await db.collection('bookings').findOne({
            _id: bookingObjectId,
            userId: mongodb_2.ObjectId.createFromHexString(user.userId)
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {
                bookingId,
                confirmationSent: booking.confirmationSent || false,
                confirmationSentAt: booking.confirmationSentAt || null
            }
        });
    }
    catch (error) {
        console.error('Get email status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map