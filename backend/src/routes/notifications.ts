import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';
import {
  sendEmail,
  getBookingConfirmationTemplate,
  getBookingStatusUpdateTemplate,
  getAdminNotificationTemplate,
  getWelcomeTemplate
} from '../lib/email';

const router = Router();

/**
 * POST /api/notifications/booking-confirmation
 * Send booking confirmation email
 */
router.post('/booking-confirmation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { bookingId } = req.body;

    if (!user || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required'
      });
    }

    if (!ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const { db } = await connectToDatabase();
    const bookingObjectId = ObjectId.createFromHexString(bookingId);

    // Get booking details
    const booking = await db.collection('bookings').findOne({
      _id: bookingObjectId,
      userId: ObjectId.createFromHexString(user.userId)
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get user details
    const userDoc = await db.collection('users').findOne({
      _id: ObjectId.createFromHexString(user.userId)
    });

    if (!userDoc || !userDoc.email) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    // Prepare email
    const emailHtml = getBookingConfirmationTemplate({
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

    // Send email
    const sent = await sendEmail({
      to: userDoc.email,
      subject: `Booking Confirmation - ${booking.itemName}`,
      html: emailHtml
    });

    if (sent) {
      // Mark email as sent in booking document
      await db.collection('bookings').updateOne(
        { _id: bookingObjectId },
        { $set: { confirmationSent: true, confirmationSentAt: new Date() } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Confirmation email sent',
      data: { sent }
    });
  } catch (error) {
    console.error('Send booking confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/booking-status-update
 * Send booking status update email
 */
router.post('/booking-status-update', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { bookingId, newStatus, message } = req.body;

    if (!user || !bookingId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and newStatus are required'
      });
    }

    if (!ObjectId.isValid(bookingId)) {
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

    const { db } = await connectToDatabase();
    const bookingObjectId = ObjectId.createFromHexString(bookingId);

    // Get booking details
    const booking = await db.collection('bookings').findOne({
      _id: bookingObjectId,
      userId: ObjectId.createFromHexString(user.userId)
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get user details
    const userDoc = await db.collection('users').findOne({
      _id: ObjectId.createFromHexString(user.userId)
    });

    if (!userDoc || !userDoc.email) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    // Prepare email
    const emailHtml = getBookingStatusUpdateTemplate({
      customerName: userDoc.name || 'Traveler',
      bookingId: booking._id.toString(),
      status: newStatus,
      itemName: booking.itemName,
      message
    });

    // Send email
    const sent = await sendEmail({
      to: userDoc.email,
      subject: `Booking Status Updated - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'Status update email sent',
      data: { sent }
    });
  } catch (error) {
    console.error('Send booking status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/admin-alert
 * Send admin notification
 * Admin only
 */
router.post('/admin-alert', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

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

    const { db } = await connectToDatabase();

    // Get admin emails
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

    // Prepare email
    const emailHtml = getAdminNotificationTemplate({
      subject,
      message,
      details
    });

    // Send to all admins
    const sendPromises = admins.map(admin =>
      sendEmail({
        to: admin.email,
        subject: `[ADMIN] ${subject}`,
        html: emailHtml
      })
    );

    await Promise.all(sendPromises);

    res.status(200).json({
      success: true,
      message: 'Admin alert sent',
      data: {
        recipientCount: admins.length
      }
    });
  } catch (error) {
    console.error('Send admin alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/welcome
 * Send welcome email to new user
 */
router.post('/welcome', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    const { db } = await connectToDatabase();

    // Get user details
    const userDoc = await db.collection('users').findOne({
      _id: ObjectId.createFromHexString(user.userId)
    });

    if (!userDoc || !userDoc.email) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    // Prepare email
    const emailHtml = getWelcomeTemplate({
      customerName: userDoc.name || 'Traveler'
    });

    // Send email
    const sent = await sendEmail({
      to: userDoc.email,
      subject: 'Welcome to Destination Kolkata!',
      html: emailHtml
    });

    if (sent) {
      // Mark welcome email as sent
      await db.collection('users').updateOne(
        { _id: ObjectId.createFromHexString(user.userId) },
        { $set: { welcomeEmailSent: true, welcomeEmailSentAt: new Date() } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Welcome email sent',
      data: { sent }
    });
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/notifications/email-status/:bookingId
 * Check if confirmation email was sent
 */
router.get('/email-status/:bookingId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { bookingId } = req.params;

    if (!ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const { db } = await connectToDatabase();
    const bookingObjectId = ObjectId.createFromHexString(bookingId);

    // Get booking
    const booking = await db.collection('bookings').findOne({
      _id: bookingObjectId,
      userId: ObjectId.createFromHexString(user.userId)
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
  } catch (error) {
    console.error('Get email status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
