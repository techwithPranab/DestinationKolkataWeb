import mongoose, { Schema, Document } from 'mongoose';

export interface IDataIngestionHistory extends Document {
  dataType: string; // 'hotels', 'restaurants', 'attractions', 'events', 'sports', 'promotions', 'travel'
  operation: string; // 'seed', 'ingest', 'update', 'delete'
  status: 'success' | 'partial' | 'failed';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errorList: {
    record?: string;
    error: string;
    timestamp: Date;
  }[];
  metadata: {
    source?: string;
    initiatedBy?: string;
    fileName?: string;
    [key: string]: any;
  };
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  createdAt: Date;
  updatedAt: Date;
}

const DataIngestionHistorySchema = new Schema<IDataIngestionHistory>(
  {
    dataType: {
      type: String,
      required: true,
      enum: ['hotels', 'restaurants', 'attractions', 'events', 'sports', 'promotions', 'travel', 'users', 'reviews', 'bookings', 'other'],
      index: true
    },
    operation: {
      type: String,
      required: true,
      enum: ['seed', 'ingest', 'update', 'delete', 'import', 'export', 'migration'],
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
      index: true
    },
    recordsProcessed: {
      type: Number,
      required: true,
      default: 0
    },
    recordsSuccessful: {
      type: Number,
      required: true,
      default: 0
    },
    recordsFailed: {
      type: Number,
      required: true,
      default: 0
    },
    errorList: [
      {
        record: String,
        error: String,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number // milliseconds
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
DataIngestionHistorySchema.index({ dataType: 1, startTime: -1 });
DataIngestionHistorySchema.index({ status: 1, startTime: -1 });
DataIngestionHistorySchema.index({ operation: 1, startTime: -1 });

const DataIngestionHistory = mongoose.model<IDataIngestionHistory>('DataIngestionHistory', DataIngestionHistorySchema);

export default DataIngestionHistory;
