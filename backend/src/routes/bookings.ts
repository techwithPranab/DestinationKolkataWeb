import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface Booking {
  _id?: ObjectId;
  customerId: ObjectId;
  itemType: 'hotel' | 'restaurant' | 'event' | 'attraction' | 'sports';
  itemId: ObjectId;
  itemName: string;
  itemLocation?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingDate: Date;
  checkInDate: Date;
  checkOutDate?: Date;
  eventDate?: Date;
  numberOfGuests: number;
  numberOfRooms?: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  specialRequests?: string;
  notes?: string;
  cancellationReason?: string;
  cancellationDate?: Date;
  refundAmount?: number;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmationSent: boolean;
}

// GET - Get all bookings for authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { status, itemType, limit = 20, skip = 0, sortBy = 'createdAt' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const filter: any = { customerId: new ObjectId(userId) };

    if (status) {
      filter.bookingStatus = status;
    }

    if (itemType) {
      filter.itemType = itemType;
    }

    const sortOptions: any = {};
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
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// GET - Get single booking
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await db
      .collection('bookings')
      .findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.customerId.toString() !== userId && (req as any).user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// POST - Create new booking
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const customerId = (req as any).user?.userId;
    const {
      itemType,
      itemId,
      itemName,
      itemLocation,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      eventDate,
      numberOfGuests,
      numberOfRooms,
      totalAmount,
      specialRequests
    } = req.body;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validation
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

    // Validate dates
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

    const newBooking: Booking = {
      customerId: new ObjectId(customerId),
      itemType,
      itemId: new ObjectId(itemId),
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
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// PUT - Update booking
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await db
      .collection('bookings')
      .findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.customerId.toString() !== userId && (req as any).user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this booking'
      });
    }

    // Don't allow updating certain fields
    delete updates.customerId;
    delete updates.itemType;
    delete updates.itemId;
    delete updates.createdAt;
    delete updates.bookingDate;

    const result = await db
      .collection('bookings')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

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
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
});

// PUT - Cancel booking
router.put('/:id/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { reason, refundAmount } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await db
      .collection('bookings')
      .findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.customerId.toString() !== userId && (req as any).user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking'
      });
    }

    // Check if already cancelled
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    const result = await db
      .collection('bookings')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            bookingStatus: 'cancelled',
            paymentStatus: refundAmount ? 'refunded' : 'failed',
            cancellationReason: reason || '',
            cancellationDate: new Date(),
            refundAmount: refundAmount || 0,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

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
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// GET - Get booking statistics for admin
router.get('/stats/overview', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { db } = await connectToDatabase();
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue
    ] = await Promise.all([
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
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics'
    });
  }
});

export default router;
