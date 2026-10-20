import express from 'express';
import mongoose from 'mongoose';
import { Room } from '../models/Room.js';

const router = express.Router();

/**
 * GET /api/health
 * Check server and database health.
 */
router.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/**
 * GET /api/rooms/:code
 * Check if a room with the given 6-digit code exists and is active.
 */
router.get('/rooms/:code', async (req, res) => {
  try {
    const code = req.params.code?.trim();
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ exists: false, message: 'Invalid 6-digit code format' });
    }

    const room = await Room.findOne({ code });
    if (!room || new Date() > room.expiresAt) {
      return res.status(404).json({ exists: false, message: 'Transfer code not found or expired' });
    }

    res.json({
      exists: true,
      code: room.code,
      hasReceiver: Boolean(room.receiverSocketId),
      fileMeta: room.fileMeta,
      expiresIn: Math.max(0, Math.floor((room.expiresAt.getTime() - Date.now()) / 1000)),
    });
  } catch (error) {
    console.error('[API Error - GET /rooms/:code]:', error.message);
    res.status(500).json({ error: 'Failed to look up room' });
  }
});

export default router;
