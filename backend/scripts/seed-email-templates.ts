/**
 * Email Templates Seed Data
 * 
 * This script seeds the database with default email templates for all email workflows
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { EmailTemplate } from '../src/models/EmailTemplate';
import { connectToDatabase } from '../src/lib/mongodb';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const emailTemplates = [
  {
    workflowType: 'listing_invitation',
    name: 'Business Listing Invitation',
    subject: 'Join Destination Kolkata - Grow Your Business!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Destination Kolkata!</h1>
            </div>
            <div class="content">
              <p>Dear {{businessName}} Team,</p>
              <p>We're excited to invite you to join <strong>Destination Kolkata</strong>, the premier platform for discovering and promoting businesses in Kolkata!</p>
              <p>As a {{businessType}}, you can:</p>
              <ul>
                <li>Reach thousands of potential customers</li>
                <li>Showcase your unique offerings</li>
                <li>Receive reviews and build your reputation</li>
                <li>Access powerful analytics and insights</li>
              </ul>
              <p>Getting started is easy! Click the button below to claim your listing:</p>
              <div style="text-align: center;">
                <a href="{{claimUrl}}" class="button">Claim Your Listing</a>
              </div>
              <p>If you have any questions, please don't hesitate to contact us at support@destinationkolkata.com</p>
              <p>Best regards,<br>The Destination Kolkata Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Destination Kolkata. All rights reserved.</p>
              <p>Kolkata, West Bengal, India</p>
            </div>
          </div>
        </body>
      </html>
    `,
    plainTextContent: `Dear {{businessName}} Team,

We're excited to invite you to join Destination Kolkata, the premier platform for discovering and promoting businesses in Kolkata!

As a {{businessType}}, you can:
- Reach thousands of potential customers
- Showcase your unique offerings
- Receive reviews and build your reputation
- Access powerful analytics and insights

Getting started is easy! Visit this link to claim your listing:
{{claimUrl}}

If you have any questions, please contact us at support@destinationkolkata.com

Best regards,
The Destination Kolkata Team`,
    variables: ['businessName', 'businessType', 'claimUrl', 'contactEmail'],
    isActive: true,
    version: 1
  },
  {
    workflowType: 'registration_welcome',
    name: 'User Registration Welcome',
    subject: 'Welcome to Destination Kolkata!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome Aboard!</h1>
            </div>
            <div class="content">
              <p>Hi {{firstName}},</p>
              <p>Welcome to Destination Kolkata! We're thrilled to have you join our community.</p>
              <p>Your account has been successfully created. You can now:</p>
              <ul>
                <li>Discover amazing places in Kolkata</li>
                <li>Create and manage your own listings</li>
                <li>Leave reviews and ratings</li>
                <li>Save your favorite places</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
              </div>
              <p>Happy exploring!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    plainTextContent: `Hi {{firstName}},

Welcome to Destination Kolkata! We're thrilled to have you join our community.

Your account has been successfully created. You can now discover amazing places, create listings, leave reviews, and much more!

Visit your dashboard: {{dashboardUrl}}

Happy exploring!
The Destination Kolkata Team`,
    variables: ['firstName', 'lastName', 'email', 'dashboardUrl'],
    isActive: true,
    version: 1
  },
  {
    workflowType: 'submission_approval',
    name: 'Submission Approved',
    subject: 'Your Submission Has Been Approved!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1>Congratulations!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px;">
              <p>Dear {{submitterName}},</p>
              <p>Great news! Your {{submissionType}} submission "<strong>{{submissionTitle}}</strong>" has been approved and is now live on Destination Kolkata!</p>
              <p>You can view your listing here:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="{{viewUrl}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Listing</a>
              </div>
              <p>Thank you for contributing to Destination Kolkata!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    plainTextContent: `Dear {{submitterName}},

Great news! Your {{submissionType}} submission "{{submissionTitle}}" has been approved and is now live on Destination Kolkata!

View your listing: {{viewUrl}}

Thank you for contributing to Destination Kolkata!`,
    variables: ['submitterName', 'submissionType', 'submissionTitle', 'viewUrl'],
    isActive: true,
    version: 1
  },
  {
    workflowType: 'submission_rejection',
    name: 'Submission Rejected',
    subject: 'Update on Your Submission',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #ef4444; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1>Submission Update</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px;">
              <p>Dear {{submitterName}},</p>
              <p>Thank you for your {{submissionType}} submission "<strong>{{submissionTitle}}</strong>".</p>
              <p>After careful review, we're unable to approve your submission at this time for the following reason:</p>
              <div style="background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
                <p>{{rejectionReason}}</p>
              </div>
              <p>You're welcome to revise and resubmit. If you have any questions, please contact us at support@destinationkolkata.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
    plainTextContent: `Dear {{submitterName}},

Thank you for your {{submissionType}} submission "{{submissionTitle}}".

After careful review, we're unable to approve your submission at this time.

Reason: {{rejectionReason}}

You're welcome to revise and resubmit. Contact us at support@destinationkolkata.com with any questions.`,
    variables: ['submitterName', 'submissionType', 'submissionTitle', 'rejectionReason'],
    isActive: true,
    version: 1
  },
  {
    workflowType: 'resource_assignment',
    name: 'Resource Assignment Notification',
    subject: 'A Resource Has Been Assigned to You',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1>New Resource Assignment</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px;">
              <p>Hi {{customerName}},</p>
              <p>A {{resourceType}} resource has been assigned to you:</p>
              <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>{{resourceTitle}}</h3>
                <p>{{resourceDescription}}</p>
              </div>
              <p>Please review and claim this resource to manage it:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="{{claimUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Resource</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    plainTextContent: `Hi {{customerName}},

A {{resourceType}} resource has been assigned to you:

{{resourceTitle}}
{{resourceDescription}}

Please review and claim this resource to manage it:
{{claimUrl}}`,
    variables: ['customerName', 'resourceType', 'resourceTitle', 'resourceDescription', 'claimUrl'],
    isActive: true,
    version: 1
  },
  {
    workflowType: 'verification_test',
    name: 'Email Verification Test',
    subject: 'Test Email from Destination Kolkata',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
            <h2>Email Configuration Test</h2>
            <p>This is a test email from Destination Kolkata.</p>
            <p>If you receive this email, your email configuration is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent at: {{timestamp}}</li>
              <li>Environment: {{environment}}</li>
            </ul>
          </div>
        </body>
      </html>
    `,
    plainTextContent: `Email Configuration Test

This is a test email from Destination Kolkata.

If you receive this email, your email configuration is working correctly!

Test Details:
- Sent at: {{timestamp}}
- Environment: {{environment}}`,
    variables: ['timestamp', 'environment'],
    isActive: true,
    version: 1
  }
];

async function seedEmailTemplates() {
  try {
    console.log('🌱 Seeding email templates...');

    // Connect to database
    const { db } = await connectToDatabase();
    console.log('✅ Connected to database');

    // Get admin user for createdBy and updatedBy
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please create an admin user first.');
    }

    const userInfo = {
      _id: adminUser._id,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      email: adminUser.email
    };

    // Clear existing templates (optional - comment out if you want to keep existing templates)
    // await EmailTemplate.deleteMany({});
    // console.log('🗑️  Cleared existing email templates');

    // Insert templates
    let created = 0;
    let updated = 0;
    
    for (const template of emailTemplates) {
      const existingTemplate = await EmailTemplate.findOne({ 
        workflowType: template.workflowType 
      });

      if (existingTemplate) {
        // Update existing template
        await EmailTemplate.findByIdAndUpdate(existingTemplate._id, {
          ...template,
          updatedBy: userInfo,
          version: existingTemplate.version + 1
        });
        updated++;
        console.log(`📝 Updated template: ${template.name}`);
      } else {
        // Create new template
        await EmailTemplate.create({
          ...template,
          createdBy: userInfo,
          updatedBy: userInfo
        });
        created++;
        console.log(`✨ Created template: ${template.name}`);
      }
    }

    console.log(`\n✅ Email templates seeding completed!`);
    console.log(`   Created: ${created} templates`);
    console.log(`   Updated: ${updated} templates`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
    process.exit(1);
  }
}

// Run the seed function
seedEmailTemplates();
