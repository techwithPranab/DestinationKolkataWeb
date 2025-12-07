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
        const { status, itemType, limit = 20, skip = 0, sortBy = 'createdAt' } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const filter = { customerId: new mongodb_2.ObjectId(userId) };
        if (status) {
            filter.bookingStatus = status;
        }
        if (itemType) {
            filter.itemType = itemType;
        }
        const sortOptions = {};
        switch (sortBy) {
            case 'date':
                sortOptions.checkInDate = -1;
                break;
            case 'amount':
                sortOptions.totalAmount = -1;
                break;
            default:
                sortOptions.createdAt = -1;
        }
        const bookings = await db
            .collection('bookings')
            .find(filter)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip(Number(skip))
            .toArray();
        const totalCount = await db
            .collection('bookings')
            .countDocuments(filter);
        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total: totalCount,
                limit: Number(limit),
                skip: Number(skip)
            }
        });
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        const booking = await db
            .collection('bookings')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.customerId.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this booking'
            });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking'
        });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const customerId = req.user?.userId;
        const { itemType, itemId, itemName, itemLocation, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, eventDate, numberOfGuests, numberOfRooms, totalAmount, specialRequests } = req.body;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        if (!itemType || !itemId || !itemName || !guestName || !guestEmail || !guestPhone || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const validItemTypes = ['hotel', 'restaurant', 'event', 'attraction', 'sports'];
        if (!validItemTypes.includes(itemType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item type'
            });
        }
        if (itemType === 'hotel' && !checkInDate) {
            return res.status(400).json({
                success: false,
                message: 'Check-in date is required for hotel bookings'
            });
        }
        if ((itemType === 'event' || itemType === 'sports') && !eventDate) {
            return res.status(400).json({
                success: false,
                message: 'Event date is required for event/sports bookings'
            });
        }
        const newBooking = {
            customerId: new mongodb_2.ObjectId(customerId),
            itemType,
            itemId: new mongodb_2.ObjectId(itemId),
            itemName,
            itemLocation: itemLocation || '',
            guestName,
            guestEmail,
            guestPhone,
            bookingDate: new Date(),
            checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
            checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
            eventDate: eventDate ? new Date(eventDate) : undefined,
            numberOfGuests,
            numberOfRooms: numberOfRooms || 1,
            totalAmount,
            currency: 'INR',
            paymentStatus: 'pending',
            bookingStatus: 'confirmed',
            specialRequests: specialRequests || '',
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmationSent: false
        };
        const result = await db
            .collection('bookings')
            .insertOne(newBooking);
        res.status(201).json({
            success: true,
            data: {
                _id: result.insertedId,
                ...newBooking
            },
            message: 'Booking created successfully'
        });
    }
    catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { id } = req.params;
        const updates = req.body;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        const booking = await db
            .collection('bookings')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.customerId.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this booking'
            });
        }
        delete updates.customerId;
        delete updates.itemType;
        delete updates.itemId;
        delete updates.createdAt;
        delete updates.bookingDate;
        const result = await db
            .collection('bookings')
            .findOneAndUpdate({ _id: new mongodb_2.ObjectId(id) }, {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value,
            message: 'Booking updated successfully'
        });
    }
    catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking'
        });
    }
});
router.put('/:id/cancel', auth_1.authenticateToken, async (req, res) => {
    try {
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const userId = req.user?.userId;
        const { id } = req.params;
        const { reason, refundAmount } = req.body;
        if (!mongodb_2.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }
        const booking = await db
            .collection('bookings')
            .findOne({ _id: new mongodb_2.ObjectId(id) });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.customerId.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to cancel this booking'
            });
        }
        if (booking.bookingStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }
        const result = await db
            .collection('bookings')
            .findOneAndUpdate({ _id: new mongodb_2.ObjectId(id) }, {
            $set: {
                bookingStatus: 'cancelled',
                paymentStatus: refundAmount ? 'refunded' : 'failed',
                cancellationReason: reason || '',
                cancellationDate: new Date(),
                refundAmount: refundAmount || 0,
                updatedAt: new Date()
            }
        }, { returnDocument: 'after' });
        if (!result || !result.value) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: result.value,
            message: 'Booking cancelled successfully'
        });
    }
    catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
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
        const [totalBookings, confirmedBookings, cancelledBookings, completedBookings, totalRevenue] = await Promise.all([
            db.collection('bookings').countDocuments({}),
            db.collection('bookings').countDocuments({ bookingStatus: 'confirmed' }),
            db.collection('bookings').countDocuments({ bookingStatus: 'cancelled' }),
            db.collection('bookings').countDocuments({ bookingStatus: 'completed' }),
            db.collection('bookings').aggregate([
                { $match: { bookingStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).toArray()
        ]);
        const bookingsByType = await db
            .collection('bookings')
            .aggregate([
            { $group: { _id: '$itemType', count: { $sum: 1 } } }
        ])
            .toArray();
        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                confirmedBookings,
                cancelledBookings,
                completedBookings,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                bookingsByType: Object.fromEntries(bookingsByType.map(b => [b._id, b.count]))
            }
        });
    }
    catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=bookings.js.map