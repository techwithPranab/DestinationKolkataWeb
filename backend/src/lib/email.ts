import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email not configured - skipping email send');
      return false;
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Destination Kolkata'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Booking Confirmation Email Template
 */
export function getBookingConfirmationTemplate(data: {
  customerName: string;
  bookingId: string;
  itemName: string;
  itemType: string;
  checkInDate?: string;
  checkOutDate?: string;
  eventDate?: string;
  numberOfGuests: number;
  totalAmount: number;
  confirmationNumber: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .detail-row { margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-label { font-weight: bold; color: #1a365d; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
          .button { background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <p>Your booking has been confirmed!</p>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            
            <p>Thank you for booking with Destination Kolkata! Your booking has been confirmed. Here are your booking details:</p>
            
            <div class="detail-row">
              <span class="detail-label">Confirmation Number:</span> ${data.confirmationNumber}
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Item:</span> ${data.itemName}
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Type:</span> ${data.itemType}
            </div>
            
            ${data.checkInDate ? `
            <div class="detail-row">
              <span class="detail-label">Check-in Date:</span> ${data.checkInDate}
            </div>
            ` : ''}
            
            ${data.checkOutDate ? `
            <div class="detail-row">
              <span class="detail-label">Check-out Date:</span> ${data.checkOutDate}
            </div>
            ` : ''}
            
            ${data.eventDate ? `
            <div class="detail-row">
              <span class="detail-label">Event Date:</span> ${data.eventDate}
            </div>
            ` : ''}
            
            <div class="detail-row">
              <span class="detail-label">Number of Guests:</span> ${data.numberOfGuests}
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span> ₹${data.totalAmount.toFixed(2)}
            </div>
            
            <p>You can manage your booking by clicking the button below:</p>
            <a href="${process.env.FRONTEND_URL}/bookings/${data.bookingId}" class="button">View Booking</a>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2025 Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Booking Status Update Email Template
 */
export function getBookingStatusUpdateTemplate(data: {
  customerName: string;
  bookingId: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  itemName: string;
  message?: string;
}): string {
  const statusMessages = {
    confirmed: 'Your booking has been confirmed',
    cancelled: 'Your booking has been cancelled',
    completed: 'Your booking is now complete',
    'no-show': 'Your booking status has been marked as no-show'
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .status-badge { display: inline-block; padding: 10px 20px; border-radius: 4px; font-weight: bold; margin: 10px 0; }
          .status-confirmed { background-color: #d1fae5; color: #065f46; }
          .status-cancelled { background-color: #fee2e2; color: #991b1b; }
          .status-completed { background-color: #dbeafe; color: #0c4a6e; }
          .status-no-show { background-color: #fef3c7; color: #92400e; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
          .button { background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Status Update</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            
            <p>We wanted to update you about your booking:</p>
            
            <div class="status-badge status-${data.status}">
              ${statusMessages[data.status]}
            </div>
            
            <p><strong>Booking Details:</strong></p>
            <p>Item: ${data.itemName}</p>
            
            ${data.message ? `<p>${data.message}</p>` : ''}
            
            <p>You can view your booking details below:</p>
            <a href="${process.env.FRONTEND_URL}/bookings/${data.bookingId}" class="button">View Booking</a>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2025 Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Admin Notification Email Template
 */
export function getAdminNotificationTemplate(data: {
  subject: string;
  message: string;
  details?: Record<string, any>;
}): string {
  const detailsHtml = data.details
    ? Object.entries(data.details)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join('')
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .details { background-color: #fff; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admin Notification</h1>
            <p>${data.subject}</p>
          </div>
          <div class="content">
            <p>${data.message}</p>
            
            ${detailsHtml ? `
            <div class="details">
              <strong>Details:</strong>
              ${detailsHtml}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2025 Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Welcome Email Template
 */
export function getWelcomeTemplate(data: {
  customerName: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .features { margin: 20px 0; }
          .feature { margin: 10px 0; padding: 10px; background-color: #fff; border-left: 4px solid #3b82f6; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
          .button { background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Destination Kolkata!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            
            <p>Welcome to Destination Kolkata! We're thrilled to have you join our community of travelers and explorers.</p>
            
            <div class="features">
              <h3>Get Started:</h3>
              <div class="feature">✓ Browse and book hotels, restaurants, and attractions</div>
              <div class="feature">✓ Share your travel experiences with reviews</div>
              <div class="feature">✓ Save your favorite places</div>
              <div class="feature">✓ Get personalized recommendations</div>
            </div>
            
            <p>Ready to explore? Start browsing our collection of amazing places in Kolkata:</p>
            <a href="${process.env.FRONTEND_URL}/explore" class="button">Start Exploring</a>
            
            <p>If you have any questions, don't hesitate to reach out to our support team.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2025 Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default {
  sendEmail,
  getBookingConfirmationTemplate,
  getBookingStatusUpdateTemplate,
  getAdminNotificationTemplate,
  getWelcomeTemplate
};
