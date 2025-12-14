import { Router, Request, Response } from 'express';
import request from 'supertest';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Unit Tests for Backend Routes
 * 
 * This file contains comprehensive tests for all backend API routes.
 * Run with: npm test
 * 
 * Coverage targets:
 * - Emergency Contacts: 100%
 * - Customer: 100%
 * - Submissions: 95%+
 * - Reports: 95%+
 * - Bookings: 95%+
 * - Helpful Votes: 90%+
 * - Notifications: 85%+
 */

// ============================================================================
// EMERGENCY CONTACTS ROUTE TESTS
// ============================================================================

describe('Emergency Contacts API', () => {
  let app: Router;
  let db: any;

  beforeAll(async () => {
    const connection = await connectToDatabase();
    db = connection.db;
  });

  describe('GET /api/emergency-contacts', () => {
    it('should retrieve all emergency contacts', async () => {
      const response = await request(app)
        .get('/api/emergency-contacts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/emergency-contacts')
        .query({ category: 'hospital' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((contact: any) => contact.category === 'hospital')).toBe(true);
    });

    it('should filter by district', async () => {
      const response = await request(app)
        .get('/api/emergency-contacts')
        .query({ district: 'South Kolkata' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should perform geo-proximity search', async () => {
      const response = await request(app)
        .get('/api/emergency-contacts')
        .query({
          longitude: 88.3639,
          latitude: 22.5726,
          maxDistance: 5000
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/emergency-contacts', () => {
    it('should create emergency contact (admin only)', async () => {
      const contactData = {
        name: 'Test Hospital',
        category: 'hospital',
        phone: '+919876543210',
        location: {
          type: 'Point',
          coordinates: [88.3639, 22.5726]
        },
        district: 'South Kolkata',
        address: 'Test Address'
      };

      const response = await request(app)
        .post('/api/emergency-contacts')
        .set('Authorization', 'Bearer admin_token')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBeDefined();
    });

    it('should reject unauthorized creation', async () => {
      const response = await request(app)
        .post('/api/emergency-contacts')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

// ============================================================================
// CUSTOMER ROUTE TESTS
// ============================================================================

describe('Customer API', () => {
  let app: Router;
  let db: any;
  let testUserId: string;

  beforeAll(async () => {
    const connection = await connectToDatabase();
    db = connection.db;
    testUserId = new ObjectId().toString();
  });

  describe('GET /api/customer/profile', () => {
    it('should retrieve customer profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/customer/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/customer/profile', () => {
    it('should update customer profile', async () => {
      const profileData = {
        phone: '+919876543210',
        bio: 'Travel enthusiast'
      };

      const response = await request(app)
        .put('/api/customer/profile')
        .set('Authorization', 'Bearer valid_token')
        .send(profileData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate phone format', async () => {
      const response = await request(app)
        .put('/api/customer/profile')
        .set('Authorization', 'Bearer valid_token')
        .send({ phone: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/customer/preferences', () => {
    it('should retrieve customer preferences', async () => {
      const response = await request(app)
        .get('/api/customer/preferences')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.language).toBeDefined();
      expect(response.body.data.notifications).toBeDefined();
    });
  });

  describe('PUT /api/customer/preferences', () => {
    it('should update customer preferences', async () => {
      const preferences = {
        language: 'hi',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      };

      const response = await request(app)
        .put('/api/customer/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send(preferences)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate language code', async () => {
      const response = await request(app)
        .put('/api/customer/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({ language: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/customer/stats', () => {
    it('should retrieve customer statistics', async () => {
      const response = await request(app)
        .get('/api/customer/stats')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalReviews).toBeDefined();
      expect(response.body.data.totalFavorites).toBeDefined();
      expect(response.body.data.totalBookings).toBeDefined();
    });
  });

  describe('GET /api/customer/activity-log', () => {
    it('should retrieve activity log with pagination', async () => {
      const response = await request(app)
        .get('/api/customer/activity-log')
        .query({ limit: 10, skip: 0 })
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });
  });
});

// ============================================================================
// SUBMISSIONS ROUTE TESTS
// ============================================================================

describe('Submissions API', () => {
  let app: Router;
  let db: any;
  let submissionId: string;

  describe('POST /api/submissions', () => {
    it('should create user submission', async () => {
      const submissionData = {
        type: 'place',
        title: 'New Restaurant',
        description: 'Great food and ambiance',
        location: 'South Kolkata',
        details: {
          address: '123 Main St',
          phone: '+919876543210'
        }
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer valid_token')
        .send(submissionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBeDefined();
      submissionId = response.body.data._id;
    });

    it('should validate submission type', async () => {
      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer valid_token')
        .send({
          type: 'invalid',
          title: 'Test'
        })

        // Auth endpoint tests
        describe('Auth API', () => {
          it('POST /api/auth/next-auth should upsert user and return token', async () => {
            const response = await request(app)
              .post('/api/auth/next-auth')
              .send({ email: 'nextauthuser@example.com', name: 'NextAuth User', provider: 'nextauth' })
              .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.token).toBeDefined()
            expect(response.body.data.user.email).toBe('nextauthuser@example.com')
          })
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/submissions', () => {
    it('should list user submissions', async () => {
      const response = await request(app)
        .get('/api/submissions')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/submissions')
        .query({ status: 'pending' })
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/submissions/:submissionId/review', () => {
    it('should update submission status (admin only)', async () => {
      const response = await request(app)
        .put(`/api/submissions/${submissionId}/review`)
        .set('Authorization', 'Bearer admin_token')
        .send({
          status: 'approved',
          priority: 'high',
          adminNotes: 'Great submission'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject unauthorized update', async () => {
      const response = await request(app)
        .put(`/api/submissions/${submissionId}/review`)
        .set('Authorization', 'Bearer user_token')
        .send({ status: 'approved' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});

// ============================================================================
// REPORTS ROUTE TESTS
// ============================================================================

describe('Reports API', () => {
  let app: Router;
  let reportId: string;

  describe('POST /api/report', () => {
    it('should create report for inappropriate content', async () => {
      const reportData = {
        itemId: new ObjectId().toString(),
        itemType: 'review',
        reason: 'Offensive language',
        severity: 'high',
        description: 'This review contains offensive language'
      };

      const response = await request(app)
        .post('/api/report')
        .set('Authorization', 'Bearer valid_token')
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      reportId = response.body.data._id;
    });

    it('should prevent duplicate reports', async () => {
      const reportData = {
        itemId: new ObjectId().toString(),
        itemType: 'review'
      };

      // Create first report
      await request(app)
        .post('/api/report')
        .set('Authorization', 'Bearer valid_token')
        .send(reportData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/report')
        .set('Authorization', 'Bearer valid_token')
        .send(reportData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/report', () => {
    it('should retrieve user reports', async () => {
      const response = await request(app)
        .get('/api/report')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/report/:reportId/status', () => {
    it('should update report status (admin only)', async () => {
      const response = await request(app)
        .put(`/api/report/${reportId}/status`)
        .set('Authorization', 'Bearer admin_token')
        .send({
          status: 'resolved',
          actionTaken: 'Review removed'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/report/admin/stats', () => {
    it('should retrieve report statistics (admin only)', async () => {
      const response = await request(app)
        .get('/api/report/admin/stats')
        .set('Authorization', 'Bearer admin_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalReports).toBeDefined();
    });
  });
});

// ============================================================================
// BOOKINGS ROUTE TESTS
// ============================================================================

describe('Bookings API', () => {
  let app: Router;
  let bookingId: string;

  describe('POST /api/bookings', () => {
    it('should create booking', async () => {
      const bookingData = {
        itemType: 'hotel',
        itemId: new ObjectId().toString(),
        itemName: 'Test Hotel',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+919876543210',
        checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        checkOutDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        numberOfGuests: 2,
        totalAmount: 5000,
        currency: 'INR'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      bookingId = response.body.data._id;
    });

    it('should validate dates', async () => {
      const bookingData = {
        itemType: 'hotel',
        itemId: new ObjectId().toString(),
        guestName: 'John Doe',
        checkInDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Past date
        checkOutDate: new Date()
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    it('should retrieve user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .query({ status: 'confirmed' })
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/bookings/:bookingId/cancel', () => {
    it('should cancel booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', 'Bearer valid_token')
        .send({
          reason: 'Changed plans',
          refundPercentage: 100
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

// ============================================================================
// HELPFUL VOTES ROUTE TESTS
// ============================================================================

describe('Helpful Votes API', () => {
  let app: Router;
  let reviewId: string;
  let voteId: string;

  beforeAll(async () => {
    reviewId = new ObjectId().toString();
  });

  describe('POST /api/helpful-votes', () => {
    it('should record helpful vote', async () => {
      const response = await request(app)
        .post('/api/helpful-votes')
        .set('Authorization', 'Bearer valid_token')
        .send({
          reviewId,
          helpful: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      voteId = response.body.data.voteId;
    });

    it('should toggle vote off on same vote', async () => {
      const response = await request(app)
        .post('/api/helpful-votes')
        .set('Authorization', 'Bearer valid_token')
        .send({
          reviewId,
          helpful: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.voted).toBe(false);
    });

    it('should update vote on different vote', async () => {
      const response = await request(app)
        .post('/api/helpful-votes')
        .set('Authorization', 'Bearer valid_token')
        .send({
          reviewId,
          helpful: false
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpful).toBe(false);
    });
  });

  describe('GET /api/helpful-votes/review/:reviewId', () => {
    it('should retrieve vote statistics', async () => {
      const response = await request(app)
        .get(`/api/helpful-votes/review/${reviewId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpfulCount).toBeDefined();
      expect(response.body.data.notHelpfulCount).toBeDefined();
    });
  });

  describe('GET /api/helpful-votes/leaderboard', () => {
    it('should retrieve leaderboard', async () => {
      const response = await request(app)
        .get('/api/helpful-votes/leaderboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

// ============================================================================
// NOTIFICATIONS ROUTE TESTS
// ============================================================================

describe('Notifications API', () => {
  let app: Router;
  let bookingId: string;

  beforeAll(async () => {
    bookingId = new ObjectId().toString();
  });

  describe('POST /api/notifications/booking-confirmation', () => {
    it('should send booking confirmation email', async () => {
      const response = await request(app)
        .post('/api/notifications/booking-confirmation')
        .set('Authorization', 'Bearer valid_token')
        .send({ bookingId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sent).toBeDefined();
    });
  });

  describe('POST /api/notifications/welcome', () => {
    it('should send welcome email', async () => {
      const response = await request(app)
        .post('/api/notifications/welcome')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

export {};
