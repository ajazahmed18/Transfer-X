import mongoose from 'mongoose';

/**
 * Mongoose Schema for Transfer History
 * Stores details of sent and received transfers.
 */
const transferSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      default: 0,
    },
    fileType: {
      type: String,
      default: 'application/octet-stream',
    },
    fileCount: {
      type: Number,
      default: 1,
    },
    direction: {
      type: String,
      enum: ['send', 'receive'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    duration: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Transfer = mongoose.model('Transfer', transferSchema);
