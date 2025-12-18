import mongoose, { Schema, Document } from 'mongoose';

/**
 * Email Template Interface
 * Represents a customizable email template stored in database
 */
export interface IEmailTemplate extends Document {
  workflowType: 'listing_invitation' 
    | 'registration_welcome' 
    | 'registration_admin_notification' 
    | 'submission_admin_notification' 
    | 'submission_approval' 
    | 'submission_rejection' 
    | 'resource_assignment' 
    | 'verification_test';
  
  name: string;                              // Template display name
  subject: string;                           // Email subject line
  htmlContent: string;                       // HTML email body
  plainTextContent?: string;                 // Plain text version
  variables: string[];                       // List of variables used
  isActive: boolean;                         // Is this template active?
  description?: string;                      // Admin notes
  
  createdBy: mongoose.Schema.Types.ObjectId; // Admin who created it
  updatedBy: mongoose.Schema.Types.ObjectId; // Admin who updated it
  
  version: number;                           // Current version
  previousVersions: Array<{                  // Version history
    version: number;
    subject: string;
    htmlContent: string;
    plainTextContent?: string;
    variables: string[];
    updatedBy: mongoose.Schema.Types.ObjectId;
    updatedAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Email Templates
 */
const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    // Workflow type this template belongs to
    workflowType: {
      type: String,
      required: true,
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

    // Template metadata
    name: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    // Email content
    htmlContent: {
      type: String,
      required: true
    },

    plainTextContent: {
      type: String
    },

    // Variables used in this template
    variables: {
      type: [String],
      default: []
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
    },

    description: {
      type: String
    },

    // Admin who manages this template
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Versioning
    version: {
      type: Number,
      default: 1
    },

    previousVersions: [{
      version: Number,
      subject: String,
      htmlContent: String,
      plainTextContent: String,
      variables: [String],
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      updatedAt: Date
    }]
  },
  {
    timestamps: true,  // Automatically add createdAt and updatedAt
    collection: 'emailTemplates'  // Collection name
  }
);

/**
 * Indexes for common queries
 */
// Query by workflow type to find all templates for a specific workflow
emailTemplateSchema.index({ workflowType: 1 });

// Query active templates only
emailTemplateSchema.index({ isActive: 1 });

// Query by date (most recent first)
emailTemplateSchema.index({ createdAt: -1 });

// Compound index for finding active templates of a type
emailTemplateSchema.index({ workflowType: 1, isActive: 1 });

/**
 * Export EmailTemplate Model
 * Handle both development (mongoose.models.EmailTemplate) 
 * and fresh instantiation
 */
export const EmailTemplate = 
  mongoose.models.EmailTemplate || 
  mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
