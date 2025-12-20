import nodemailer from 'nodemailer';
import { ObjectId } from 'mongodb';
import { EmailTemplate, IEmailTemplate } from '../models/EmailTemplate';
import { EmailHistory, IEmailHistory } from '../models/EmailHistory';

/**
 * Email Service Module
 * Comprehensive email management system for all applica        </style>
      </head>
      <body style="margin: 0; padding: 0; width: 100%;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0; margin: 0;">
              <div class="container">
                <div class="header">
                  <h1>� Join Destination Kolkata</h1>
                  <p>Grow Your Business with Kolkata's Premier Tourism Platform</p>
                </div>
                
                <div class="content">lows
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EmailLog {
  _id?: ObjectId;
  recipient: string;
  subject: string;
  templateType: string;
  status: 'sent' | 'failed' | 'queued';
  sentAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  nextRetry?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

export type TemplateType =
  | 'listing_invitation'
  | 'registration_admin_notification'
  | 'registration_welcome'
  | 'resource_assignment'
  | 'submission_admin_notification'
  | 'submission_approval'
  | 'submission_rejection'
  | 'verification_test';

export interface TemplateData {
  listing_invitation: {
    businessName: string;
    businessEmail: string;
    listingType: string;
    listingName: string;
    registrationLink: string;
    message?: string;
  };
  registration_admin_notification: {
    userName: string;
    userEmail: string;
    registrationDate: string;
    adminDashboardLink: string;
  };
  registration_welcome: {
    userName: string;
    userEmail: string;
    loginLink: string;
  };
  resource_assignment: {
    userName: string;
    userEmail: string;
    resourceType: string;
    resourceName: string;
    resourceDetails: string;
    completionLink: string;
  };
  submission_admin_notification: {
    submissionType: string;
    submissionTitle: string;
    submitterName: string;
    submitterEmail: string;
    submissionDate: string;
    submissionDetails: string;
    adminReviewLink: string;
  };
  submission_approval: {
    userName: string;
    userEmail: string;
    submissionTitle: string;
    approvalMessage?: string;
    viewListingLink: string;
  };
  submission_rejection: {
    userName: string;
    userEmail: string;
    submissionTitle: string;
    rejectionReason: string;
    resubmitLink: string;
  };
  verification_test: {
    testTime: string;
    configName: string;
  };
}

// ============================================================================
// EMAIL TRANSPORTER SETUP
// ============================================================================

let transporter: nodemailer.Transporter | null = null;

function initializeTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send email with error handling and retry logic
 */
export async function sendEmail(
  options: EmailOptions,
  templateType: TemplateType = 'verification_test'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email not configured - skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    const trans = initializeTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Destination Kolkata'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      cc: options.cc?.join(', '),
      bcc: options.bcc?.join(', '),
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html
    };
    console.log('Sending email with options:', mailOptions);
    const info = await trans.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to}:`, info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send email and log to database using EmailHistory model
 */
export async function sendEmailWithLogging(
  options: EmailOptions,
  templateType: TemplateType,
  db: any,
  metadata?: Record<string, any>
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    // Get template information first
    const templateInfo = await getEmailTemplate(templateType, {} as any);

    const result = await sendEmail({
      ...options,
      subject: templateInfo.subject || options.subject,
      html: templateInfo.html || options.html
    }, templateType);

    // Create EmailHistory record
    const historyEntry = new EmailHistory({
      recipient: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: templateInfo.subject || options.subject,
      workflowType: templateType,
      status: result.success ? 'sent' : 'failed',
      sentAt: result.success ? new Date() : undefined,
      failureReason: result.error,
      templateId: templateInfo.templateId ? new ObjectId(templateInfo.templateId) : undefined,
      templateVersion: templateInfo.templateVersion,
      templateSnapshot: templateInfo.templateId ? {
        subject: templateInfo.subject,
        htmlContent: templateInfo.html,
        version: templateInfo.templateVersion
      } : undefined,
      sentBy: metadata?.sentBy ? new ObjectId(metadata.sentBy) : undefined,
      metadata,
      retryCount: 0
    });

    await historyEntry.save();

    return {
      success: result.success,
      logId: historyEntry._id.toString(),
      error: result.error
    };
  } catch (error) {
    console.error('Error in sendEmailWithLogging:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// EMAIL TEMPLATE GENERATORS
// ============================================================================

/**
 * Generate listing invitation email template
 */
export function getListingInvitationTemplate(
  data: TemplateData['listing_invitation']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          .container { width: 100% !important; max-width: 100% !important; margin: 0 auto; padding: 0; background: #f7f9fc; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; width: 100%; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.95; }
          .content { background-color: white; padding: 30px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; }
          .section { margin: 25px 0; }
          .intro { background: #f0f4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
          .intro p { margin: 8px 0; color: #1e293b; }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white !important; 
            padding: 16px 36px; 
            border-radius: 8px; 
            text-decoration: none; 
            margin: 25px 0; 
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
          }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5); }
          .benefits { background: #f9fafb; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #e2e8f0; }
          .benefits h3 { color: #1e293b; margin-top: 0; font-size: 20px; }
          .benefits ul { margin: 15px 0; padding-left: 0; list-style: none; }
          .benefits li { margin: 12px 0; padding-left: 28px; position: relative; color: #475569; }
          .benefits li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 18px; }
          .process { background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #e2e8f0; }
          .process h3 { color: #1e293b; margin-top: 0; font-size: 20px; }
          .step { background: #f8fafc; padding: 15px; margin: 12px 0; border-radius: 6px; border-left: 3px solid #667eea; }
          .step-number { display: inline-block; background: #667eea; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px; }
          .step-title { font-weight: 600; color: #1e293b; }
          .step-desc { color: #64748b; font-size: 14px; margin: 5px 0 0 38px; }
          .highlight { background-color: #fef3c7; padding: 18px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .highlight strong { color: #92400e; }
          .support-box { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981; }
          .support-box h4 { margin-top: 0; color: #065f46; }
          .support-box p { margin: 8px 0; color: #064e3b; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; }
          .contact-item { flex: 1; min-width: 200px; background: white; padding: 12px; border-radius: 6px; }
          .contact-label { font-weight: 600; color: #065f46; font-size: 13px; }
          .contact-value { color: #047857; font-size: 15px; }
          .footer { margin-top: 30px; padding-top: 25px; border-top: 2px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center; }
          .footer p { margin: 8px 0; }
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; min-width: 100% !important; padding: 0 !important; }
            .header { padding: 30px 15px !important; }
            .content { padding: 25px 15px !important; }
            .header h1 { font-size: 24px !important; }
            .benefits, .process, .support-box { padding: 20px 15px !important; }
          }
          @media only screen and (max-width: 480px) {
            .header { padding: 25px 10px !important; }
            .content { padding: 20px 10px !important; }
            .header h1 { font-size: 22px !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>� Join Destination Kolkata</h1>
            <p>Grow Your Business with Kolkata's Premier Tourism Platform</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p style="font-size: 16px;">Dear <strong>${data.businessName}</strong>,</p>
              <p>Greetings from <strong>Destination Kolkata</strong>!</p>
            </div>

            <div class="intro">
              <p><strong>📍 About Destination Kolkata</strong></p>
              <p>Destination Kolkata is the city's leading online tourism platform, connecting thousands of travelers with authentic local experiences. We showcase the best hotels, restaurants, attractions, and services that make Kolkata special.</p>
              <p style="margin-top: 12px;">We've identified your <strong>${data.listingName}</strong> as a valuable addition to our platform and would like to invite you to join our growing community of businesses.</p>
            </div>

            <div class="highlight">
              <strong>🎁 100% FREE ONBOARDING - LIMITED TIME OFFER!</strong>
              <p style="margin: 8px 0 0;">List your business on our platform at absolutely no cost. No hidden fees, no subscription charges - just pure visibility to reach thousands of potential customers!</p>
            </div>

            <div class="benefits">
              <h3>🚀 Why Partner with Destination Kolkata?</h3>
              <ul>
                <li><strong>Maximum Visibility:</strong> Reach thousands of tourists and locals searching for ${data.listingType}s in Kolkata</li>
                <li><strong>Free Forever:</strong> No listing fees, no commissions - 100% free to join and maintain your profile</li>
                <li><strong>Build Credibility:</strong> Collect and showcase customer reviews and ratings</li>
                <li><strong>Complete Control:</strong> Manage your business information, photos, and offerings anytime</li>
                <li><strong>Direct Contact:</strong> Customers can reach you directly via phone, email, or website</li>
                <li><strong>SEO Benefits:</strong> Improve your online presence with our high-ranking platform</li>
                <li><strong>Analytics Dashboard:</strong> Track visitor views and engagement with your listing</li>
                <li><strong>Mobile Optimized:</strong> Your listing looks great on all devices</li>
              </ul>
            </div>

            <div class="process">
              <h3>� Simple 3-Step Registration Process</h3>
              
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-title">Sign Up with Your Email</span>
                <p class="step-desc">Click the registration button below and create your account using the same email address (<strong>${data.businessEmail}</strong>). It only takes 2 minutes!</p>
              </div>

              <div class="step">
                <span class="step-number">2</span>
                <span class="step-title">Admin Tags Your Property</span>
                <p class="step-desc">Our admin team will assign <strong>${data.listingName}</strong> to your account within 24 hours (usually same day). You'll receive an email notification once the assignment is complete.</p>
              </div>

              <div class="step">
                <span class="step-number">3</span>
                <span class="step-title">Complete Your Listing</span>
                <p class="step-desc">Fill in your business details, upload high-quality photos, add amenities/menu items, set operating hours, and provide contact information. The more complete your profile, the better!</p>
              </div>

              <div class="step">
                <span class="step-number">✓</span>
                <span class="step-title">Go Live After Approval</span>
                <p class="step-desc">Submit your completed listing for review. Our admin team will verify the information and approve it within 1-2 business days. Once approved, your listing goes live instantly!</p>
              </div>
            </div>

            <div class="section" style="text-align: center; margin: 35px 0;">
              <p style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Ready to Boost Your Business?</p>
              <a href="${data.registrationLink}" class="cta-button">� Register Now - It's FREE!</a>
              <p style="font-size: 14px; color: #64748b; margin-top: 15px;">Complete registration in under 5 minutes</p>
            </div>

            ${data.message ? `<div class="highlight">${data.message}</div>` : ''}

            <div class="support-box">
              <h4>💬 Need Help? We're Here for You!</h4>
              <p>Our support team is ready to assist you with the registration process or answer any questions you may have.</p>
              <div class="contact-info">
                <div class="contact-item">
                  <div class="contact-label">📧 Email Support</div>
                  <div class="contact-value">support@destinationkolkata.com</div>
                </div>
                <div class="contact-item">
                  <div class="contact-label">📞 Phone Support</div>
                  <div class="contact-value">+91-9876543210</div>
                </div>
              </div>
              <p style="margin-top: 15px; font-size: 14px;"><strong>Support Hours:</strong> Monday - Saturday, 10:00 AM - 6:00 PM IST</p>
            </div>

            <div class="section">
              <p>Don't miss this opportunity to showcase your business to Kolkata's vibrant tourism community!</p>
              <p style="margin-top: 20px;">Best regards,<br><strong>The Destination Kolkata Team</strong></p>
            </div>

            <div class="footer">
              <p><strong>Destination Kolkata</strong> - Discover the Heart of Bengal</p>
              <p>This invitation is exclusively for ${data.businessName}. For support, contact us at support@destinationkolkata.com</p>
              <p>&copy; ${new Date().getFullYear()} Destination Kolkata. All rights reserved.</p>
            </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Generate registration admin notification template
 */
export function getRegistrationAdminNotificationTemplate(
  data: TemplateData['registration_admin_notification']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; border-radius: 4px; }
          .label { font-weight: 600; color: #1a365d; }
          .action-link { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 10px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🆕 New User Registration</h2>
          </div>
          
          <div class="content">
            <p>A new user has registered on the Destination Kolkata platform.</p>

            <div class="info-box">
              <p><span class="label">👤 User Name:</span> ${data.userName}</p>
              <p><span class="label">📧 Email:</span> ${data.userEmail}</p>
              <p><span class="label">📅 Registration Date:</span> ${data.registrationDate}</p>
            </div>

            <p><strong>Recommended Next Action:</strong></p>
            <p>Review the user profile and consider assigning them to pending listings that match their interests.</p>
            
            <center>
              <a href="${data.adminDashboardLink}" class="action-link">📊 View in Admin Dashboard</a>
            </center>

            <div class="footer">
              <p>This is an automated system notification.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate registration welcome email template
 */
export function getRegistrationWelcomeTemplate(
  data: TemplateData['registration_welcome']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 15px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Destination Kolkata! 🎉</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Thank you for registering with <strong>Destination Kolkata</strong>! We're thrilled to have you join our community of explorers and travel enthusiasts.</p>

            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Complete your user profile</li>
              <li>Explore listings in your area of interest</li>
              <li>Leave reviews and ratings</li>
              <li>Save your favorite places</li>
              <li>Participate in our community</li>
            </ul>

            <p>
              <a href="${data.loginLink}" class="cta-button">🚀 Get Started</a>
            </p>

            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy exploring!<br><strong>The Destination Kolkata Team</strong></p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate resource assignment notification template
 */
export function getResourceAssignmentTemplate(
  data: TemplateData['resource_assignment']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .resource-box { background: white; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px; margin: 20px 0; }
          .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 15px 0; }
          .details { background: #f0f4ff; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 New Assignment for You!</h2>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Great news! We've assigned a new <strong>${data.resourceType}</strong> for you to complete on Destination Kolkata.</p>

            <div class="resource-box">
              <h3>📌 ${data.resourceName}</h3>
              <p>${data.resourceDetails}</p>
            </div>

            <div class="details">
              <strong>📝 What You Need to Do:</strong>
              <p>Complete the listing information including photos, description, pricing, amenities, and contact details.</p>
            </div>

            <p><strong>⏰ Take Action Now:</strong></p>
            <center>
              <a href="${data.completionLink}" class="cta-button">✏️ Complete Your Assignment</a>
            </center>

            <p>Thank you for helping us keep Destination Kolkata up-to-date and valuable for our users!</p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate submission admin notification template
 */
export function getSubmissionAdminNotificationTemplate(
  data: TemplateData['submission_admin_notification']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .submission-box { background: white; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 15px 0; }
          .label { font-weight: 600; color: #1a365d; }
          .action-link { background: #1a365d; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 10px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✨ New Submission for Review</h2>
          </div>
          
          <div class="content">
            <p><strong>A new listing submission has been received and is pending your review.</strong></p>

            <div class="submission-box">
              <p><span class="label">📝 Type:</span> ${data.submissionType}</p>
              <p><span class="label">📌 Title:</span> ${data.submissionTitle}</p>
              <p><span class="label">👤 Submitter:</span> ${data.submitterName}</p>
              <p><span class="label">📧 Email:</span> ${data.submitterEmail}</p>
              <p><span class="label">📅 Submission Date:</span> ${data.submissionDate}</p>
            </div>

            <div class="submission-box">
              <strong>📋 Submission Details:</strong>
              <p>${data.submissionDetails}</p>
            </div>

            <p><strong>⚡ Action Required:</strong></p>
            <p>Review the submission and approve or reject it. The user will be notified of your decision.</p>
            
            <center>
              <a href="${data.adminReviewLink}" class="action-link">🔍 Review Submission</a>
            </center>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate submission approval email template
 */
export function getSubmissionApprovalTemplate(
  data: TemplateData['submission_approval']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; }
          .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .success-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .cta-button { background: #10b981; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 15px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Your Submission Has Been Approved!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <div class="success-box">
              <h3>🎉 Congratulations!</h3>
              <p>Your submission for <strong>"${data.submissionTitle}"</strong> has been <strong>approved</strong> and is now live on Destination Kolkata!</p>
            </div>

            ${data.approvalMessage ? `<p><strong>📝 Admin Message:</strong><br>${data.approvalMessage}</p>` : ''}

            <p>Your listing is now visible to thousands of travelers exploring Kolkata. You can:</p>
            <ul>
              <li>✏️ Edit your listing anytime</li>
              <li>📸 Add or update photos</li>
              <li>⭐ Monitor reviews and ratings</li>
              <li>📊 View visitor analytics</li>
            </ul>

            <center>
              <a href="${data.viewListingLink}" class="cta-button">👁️ View Your Listing</a>
            </center>

            <p>Thank you for contributing to the Destination Kolkata community!</p>
            <p>Best regards,<br><strong>The Destination Kolkata Team</strong></p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate submission rejection email template
 */
export function getSubmissionRejectionTemplate(
  data: TemplateData['submission_rejection']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
          .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .cta-button { background: #667eea; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 15px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Submission Under Review</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Thank you for your submission for <strong>"${data.submissionTitle}"</strong> to Destination Kolkata.</p>

            <div class="reason-box">
              <h3>⚠️ Reason for Rejection:</h3>
              <p>${data.rejectionReason}</p>
            </div>

            <p><strong>💡 What You Can Do:</strong></p>
            <ul>
              <li>Review the feedback provided above</li>
              <li>Make the necessary corrections or improvements</li>
              <li>Resubmit your listing</li>
            </ul>

            <p>We appreciate your understanding and would love to see an improved version of your submission!</p>

            <center>
              <a href="${data.resubmitLink}" class="cta-button">🔄 Resubmit Listing</a>
            </center>

            <p>If you have any questions about this decision, please reply to this email or contact our support team.</p>
            <p>Best regards,<br><strong>The Destination Kolkata Team</strong></p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate email verification test template
 */
export function getVerificationTestTemplate(
  data: TemplateData['verification_test']
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .success { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Configuration Test</h1>
          </div>
          
          <div class="content">
            <div class="success">
              <h2>Email Service is Working! 🎉</h2>
              <p>Your email configuration has been verified and is functioning correctly.</p>
            </div>

            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>✓ SMTP Connection: Active</li>
              <li>✓ Configuration Name: ${data.configName}</li>
              <li>✓ Test Time: ${data.testTime}</li>
            </ul>

            <p>You can now use the email service for all application notifications including:</p>
            <ul>
              <li>User registrations</li>
              <li>Listing invitations</li>
              <li>Resource assignments</li>
              <li>Submission notifications</li>
              <li>Approval/Rejection notices</li>
            </ul>

            <p>This is an automated test email. No action is required.</p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Destination Kolkata. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Master template selection function
 */
/**
 * Generate email template - first tries database, falls back to hardcoded templates
 */
export async function getEmailTemplate<T extends TemplateType>(
  templateType: T,
  data: TemplateData[T]
): Promise<{ html: string; subject: string; templateId?: string; templateVersion?: number }> {
  try {
    // First, try to get template from database
    const dbTemplate = await EmailTemplate.findOne({
      workflowType: templateType,
      isActive: true
    }).lean();

    if (dbTemplate) {
      // Use database template
      const template = dbTemplate as any as IEmailTemplate;
      let htmlContent = template.htmlContent;

      // Replace variables in the template
      if (template.variables && template.variables.length > 0) {
        for (const variable of template.variables) {
          const key = variable.replace(/\{\{|\}\}/g, ''); // Remove {{ }}
          if (data && key in data) {
            const value = (data as any)[key];
            const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
            htmlContent = htmlContent.replace(regex, value || '');
          }
        }
      }

      return {
        html: htmlContent,
        subject: template.subject,
        templateId: template._id.toString(),
        templateVersion: template.version
      };
    }
  } catch (dbError) {
    console.warn('Database template fetch failed, falling back to hardcoded templates:', dbError);
  }

  // Fallback to hardcoded templates
  const templateMap = {
    listing_invitation: getListingInvitationTemplate,
    registration_admin_notification: getRegistrationAdminNotificationTemplate,
    registration_welcome: getRegistrationWelcomeTemplate,
    resource_assignment: getResourceAssignmentTemplate,
    submission_admin_notification: getSubmissionAdminNotificationTemplate,
    submission_approval: getSubmissionApprovalTemplate,
    submission_rejection: getSubmissionRejectionTemplate,
    verification_test: getVerificationTestTemplate
  };

  const template = templateMap[templateType];
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }

  // Get hardcoded template content
  const htmlContent = template(data as any);

  // Extract subject from hardcoded template (this is a simplified approach)
  // In a real implementation, you'd want to separate subject from content
  let subject = `Destination Kolkata - ${templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;

  // Try to extract subject from the first heading in the HTML
  const headingMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (headingMatch) {
    subject = headingMatch[1].trim();
  }

  return {
    html: htmlContent,
    subject,
    templateId: undefined,
    templateVersion: undefined
  };
}

/**
 * Verify email configuration (test connection)
 */
export async function verifyEmailConfiguration(): Promise<{
  success: boolean;
  message: string;
  config?: {
    host: string;
    port: number;
    user: string;
  };
}> {
  try {
    const trans = initializeTransporter();
    await trans.verify();

    return {
      success: true,
      message: 'Email configuration is valid and SMTP connection is working',
      config: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        user: process.env.EMAIL_USER || 'not-configured'
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Email configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
