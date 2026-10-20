import express from 'express';
import { Transfer } from '../models/Transfer.js';

const router = express.Router();

/**
 * GET /api/transfers
 * Fetch the latest 50 transfer records from MongoDB.
 */
router.get('/', async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transfers);
  } catch (error) {
    console.error('[API Error - GET /transfers]:', error.message);
    res.status(500).json({ error: 'Failed to fetch transfer history' });
  }
});

/**
 * POST /api/transfers
 * Save a new completed or cancelled transfer record to MongoDB.
 */
router.post('/', async (req, res) => {
  try {
    const { code, fileName, fileSize, fileType, fileCount, direction, status, duration } = req.body;

    const newTransfer = new Transfer({
      code: code || '000000',
      fileName: fileName || 'Unknown File',
      fileSize: fileSize || 0,
      fileType: fileType || 'application/octet-stream',
      fileCount: fileCount || 1,
      direction: direction || 'send',
      status: status || 'completed',
      duration: duration || 0,
    });

    const saved = await newTransfer.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('[API Error - POST /transfers]:', error.message);
    res.status(500).json({ error: 'Failed to save transfer record' });
  }
});

/**
 * DELETE /api/transfers
 * Delete all transfer records from MongoDB.
 */
router.delete('/', async (req, res) => {
  try {
    await Transfer.deleteMany({});
    res.json({ message: 'Transfer history cleared successfully' });
  } catch (error) {
    console.error('[API Error - DELETE /transfers]:', error.message);
    res.status(500).json({ error: 'Failed to clear transfer history' });
  }
});

export default router;
