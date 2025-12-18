import mongoose, { Schema, Document } from 'mongoose';

/**
 * Email History Interface
 * Tracks every email sent through the system
 */
export interface IEmailHistory extends Document {
  recipient: string;                         // Email address
  subject: string;                           // Email subject
  templateId?: mongoose.Schema.Types.ObjectId;  // Reference to template used
  
  templateSnapshot: {                        // Snapshot at send time
    workflowType: string;
    htmlContent: string;
    plainTextContent?: string;
    version: number;
  };
  
  workflowType: 'listing_invitation' 
    | 'registration_welcome' 
    | 'registration_admin_notification' 
    | 'submission_admin_notification' 
    | 'submission_approval' 
    | 'submission_rejection' 
    | 'resource_assignment' 
    | 'verification_test';
  
  status: 'sent' | 'failed' | 'pending' | 'bounced' | 'complained';
  sentAt?: Date;
  
  userId?: mongoose.Schema.Types.ObjectId;  // User who received it
  metadata?: Record<string, any>;            // Custom data
  
  failureReason?: string;                    // Why it failed
  retryCount: number;                        // Number of retries
  maxRetries: number;                        // Max retries allowed
  nextRetryAt?: Date;                        // Next retry scheduled for
  
  relatedRecordId?: mongoose.Schema.Types.ObjectId;  // e.g., submission ID
  relatedRecordType?: string;                // e.g., 'submission'
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Email History
 */
const emailHistorySchema = new Schema<IEmailHistory>(
  {
    // Recipient
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    subject: {
      type: String,
      required: true
    },

    // Template reference
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailTemplate'
    },

    // Snapshot of template at time of send
    templateSnapshot: {
      workflowType: String,
      htmlContent: String,
      plainTextContent: String,
      version: Number
    },

    // Workflow metadata
    workflowType: {
      type: String,
      enum: [
        'listing_invitation',
        'registration_welcome',
        'registration_admin_notification',
        'submission_admin_notification',
        'submission_approval',
        'submission_rejection',
        'resource_assignment',
        'verification_test'
      ]
    },

    // Status tracking
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending', 'bounced', 'complained'],
      default: 'pending'
    },

    sentAt: {
      type: Date
    },

    // Related user
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },

    // Custom data
    metadata: {
      type: Schema.Types.Mixed
    },

    // Failure tracking
    failureReason: {
      type: String
    },

    // Retry logic
    retryCount: {
      type: Number,
      default: 0
    },

    maxRetries: {
      type: Number,
      default: 3
    },

    nextRetryAt: {
      type: Date
    },

    // Related records (e.g., submission, listing)
    relatedRecordId: {
      type: Schema.Types.ObjectId
    },

    relatedRecordType: {
      type: String
    }
  },
  {
    timestamps: true,  // Automatically add createdAt and updatedAt
    collection: 'emailHistory'  // Collection name
  }
);

/**
 * Indexes for common queries and filtering
 */
// Find emails for a specific recipient
emailHistorySchema.index({ recipient: 1 });

// Filter by status (e.g., find all failed emails)
emailHistorySchema.index({ status: 1 });

// Filter by workflow type
emailHistorySchema.index({ workflowType: 1 });

// Sort by sent date (most recent)
emailHistorySchema.index({ sentAt: -1 });

// Sort by created date
emailHistorySchema.index({ createdAt: -1 });

// Find emails for a specific user
emailHistorySchema.index({ userId: 1 });

// Find failed emails that need retry
emailHistorySchema.index({ status: 1, retryCount: 1 });

// Compound indexes for common filter combinations
emailHistorySchema.index({ status: 1, createdAt: -1 });
emailHistorySchema.index({ workflowType: 1, sentAt: -1 });
emailHistorySchema.index({ recipient: 1, status: 1 });

/**
 * Export EmailHistory Model
 */
export const EmailHistory = 
  mongoose.models.EmailHistory || 
  mongoose.model<IEmailHistory>('EmailHistory', emailHistorySchema);
