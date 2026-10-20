import mongoose from 'mongoose';

/**
 * Mongoose Schema for Transfer Rooms
 * Automatically expires when expiresAt is reached using MongoDB TTL index.
 */
const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    senderSocketId: {
      type: String,
      required: true,
    },
    receiverSocketId: {
      type: String,
      default: null,
    },
    fileMeta: {
      name: String,
      size: Number,
      type: { type: String },
      fileCount: Number,
      files: [
        {
          name: String,
          size: Number,
          type: { type: String },
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatically cleans up expired rooms!
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model('Room', roomSchema);
