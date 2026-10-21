/**
 * TransferX - Pure Node.js + Express Backend Server (No TypeScript / No TSX required!)
 * 
 * You can run this directly with standard Node.js:
 *   node server.js
 */

import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import { Transfer } from './backend/models/Transfer.js';

let PORT = Number(process.env.PORT) || 3000;
const portArgIndex = process.argv.indexOf('--port');
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  const parsedPort = Number(process.argv[portArgIndex + 1]);
  if (!isNaN(parsedPort) && parsedPort > 0) {
    PORT = parsedPort;
  }
}
const ROOM_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes validity

// In-memory rooms and transfer history
const rooms = new Map();
const socketToRoomMap = new Map();
const transferHistory = [];

// Helper: Check if MongoDB is connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Connect to MongoDB if MONGO_URI is set
async function connectMongoDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.trim() === '') {
    console.log('[Database] Running in in-memory mode (No MONGO_URI provided).');
    return;
  }

  try {
    mongoose.set('bufferCommands', false);
    console.log('[Database] Connecting to MongoDB...');
    await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 5000,
      dbName: 'transferx',
    });
    console.log('✅ [Database] MongoDB connected successfully!');
  } catch (err) {
    console.warn(`[Database Warning] Could not connect to MongoDB: ${err.message}`);
    console.log('[Database Info] App is using fast in-memory storage. Everything works normally!');
  }
}

// Generate unique 6-digit code (e.g. 100000 - 999999)
function generateUniqueCode() {
  let attempts = 0;
  while (attempts < 100) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = rooms.get(code);
    if (!existing || Date.now() > existing.expiresAt) {
      return code;
    }
    attempts++;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Cleanup expired rooms periodically
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now > room.expiresAt) {
      rooms.delete(code);
      socketToRoomMap.delete(room.senderSocketId);
      if (room.receiverSocketId) {
        socketToRoomMap.delete(room.receiverSocketId);
      }
    }
  }
}, 60 * 1000);

async function start() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // Connect to MongoDB
  await connectMongoDB();

  // Socket.IO for WebRTC Signaling
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    maxHttpBufferSize: 1e6,
  });

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: isMongoConnected() ? 'mongodb' : 'in-memory',
      activeRooms: rooms.size,
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  app.get('/api/transfers', async (req, res) => {
    try {
      if (isMongoConnected()) {
        const records = await Transfer.find().sort({ createdAt: -1 }).limit(100);
        return res.json(records);
      }
    } catch (err) {
      console.warn('[MongoDB] Fallback to in-memory history:', err.message);
    }
    res.json(transferHistory);
  });

  app.post('/api/transfers', async (req, res) => {
    const data = req.body || {};
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: data.code || '000000',
      fileName: data.fileName || 'Unknown File',
      fileSize: Number(data.fileSize) || 0,
      fileType: data.fileType || 'application/octet-stream',
      fileCount: Number(data.fileCount) || 1,
      direction: data.direction === 'receive' ? 'receive' : 'send',
      status: data.status || 'completed',
      duration: Number(data.duration) || 0,
      createdAt: Date.now(),
    };

    if (isMongoConnected()) {
      try {
        const mongoRecord = await Transfer.create({
          code: record.code,
          fileName: record.fileName,
          fileSize: record.fileSize,
          fileType: record.fileType,
          fileCount: record.fileCount,
          direction: record.direction,
          status: record.status,
          duration: record.duration,
        });
        return res.status(201).json(mongoRecord);
      } catch (err) {
        console.warn('[MongoDB] Save failed, fallback to in-memory:', err.message);
      }
    }

    transferHistory.unshift(record);
    if (transferHistory.length > 100) transferHistory.pop();
    res.status(201).json(record);
  });

  app.delete('/api/transfers', async (req, res) => {
    if (isMongoConnected()) {
      try {
        await Transfer.deleteMany({});
      } catch (err) {
        console.warn('[MongoDB] Clear failed:', err.message);
      }
    }
    transferHistory.length = 0;
    res.json({ message: 'Transfer history cleared successfully' });
  });

  app.get('/api/rooms/:code', (req, res) => {
    const code = req.params.code ? req.params.code.trim() : '';
    const room = rooms.get(code);
    if (!room || Date.now() > room.expiresAt) {
      return res.status(404).json({ exists: false, message: 'Transfer code not found or expired' });
    }
    res.json({
      exists: true,
      code: room.code,
      hasReceiver: Boolean(room.receiverSocketId),
      fileMeta: room.fileMeta,
      expiresIn: Math.max(0, Math.floor((room.expiresAt - Date.now()) / 1000)),
    });
  });

  // WebRTC Signaling with Socket.IO
  io.on('connection', (socket) => {
    // 1. Sender: Create Room
    socket.on('create-room', (data, callback) => {
      try {
        const code = generateUniqueCode();
        const now = Date.now();
        const room = {
          code,
          senderSocketId: socket.id,
          fileMeta: data?.fileMeta,
          createdAt: now,
          expiresAt: now + ROOM_EXPIRY_MS,
        };

        rooms.set(code, room);
        socketToRoomMap.set(socket.id, { code, role: 'sender' });
        socket.join(`room-${code}`);

        if (typeof callback === 'function') {
          callback({ success: true, code, expiresAt: room.expiresAt });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Failed to create room' });
        }
      }
    });

    // 2. Receiver: Validate Code
    socket.on('validate-code', (data, callback) => {
      const code = data?.code?.trim();
      if (!/^\d{6}$/.test(code || '')) {
        return callback?.({ valid: false, error: 'Please enter a valid 6-digit code.' });
      }
      const room = rooms.get(code);
      if (!room || Date.now() > room.expiresAt) {
        return callback?.({ valid: false, error: 'Transfer code does not exist or has expired.' });
      }
      if (room.receiverSocketId && room.receiverSocketId !== socket.id) {
        return callback?.({ valid: false, error: 'This transfer is already connected to another receiver.' });
      }
      callback?.({
        valid: true,
        fileMeta: room.fileMeta,
        expiresIn: Math.max(0, Math.floor((room.expiresAt - Date.now()) / 1000)),
      });
    });

    // 3. Receiver: Join Room
    socket.on('join-room', (data, callback) => {
      const code = data?.code?.trim();
      const room = rooms.get(code);
      if (!room || Date.now() > room.expiresAt) {
        return callback?.({ success: false, error: 'Transfer code expired or invalid.' });
      }
      room.receiverSocketId = socket.id;
      socketToRoomMap.set(socket.id, { code, role: 'receiver' });
      socket.join(`room-${code}`);

      socket.to(`room-${code}`).emit('receiver-joined', { receiverId: socket.id });
      callback?.({ success: true, code, fileMeta: room.fileMeta });
    });

    // WebRTC Signaling Events
    socket.on('offer', (data) => {
      socket.to(`room-${data?.code}`).emit('offer', { offer: data?.offer, senderId: socket.id });
    });

    socket.on('answer', (data) => {
      socket.to(`room-${data?.code}`).emit('answer', { answer: data?.answer, receiverId: socket.id });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(`room-${data?.code}`).emit('ice-candidate', { candidate: data?.candidate, from: socket.id });
    });

    socket.on('cancel-transfer', (data) => {
      socket.to(`room-${data?.code}`).emit('peer-cancelled', { reason: data?.reason || 'Cancelled' });
      rooms.delete(data?.code);
    });

    socket.on('transfer-done', (data) => {
      rooms.delete(data?.code);
    });

    socket.on('disconnect', () => {
      const mapping = socketToRoomMap.get(socket.id);
      if (mapping) {
        socket.to(`room-${mapping.code}`).emit('peer-disconnected', { role: mapping.role });
        rooms.delete(mapping.code);
        socketToRoomMap.delete(socket.id);
      }
    });
  });

  // Serve Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      console.warn('⚠️ [Production Warning] dist/ folder not found. Falling back to dynamic Vite serving...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [TransferX] Pure Node.js Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Startup Error]', err);
  process.exit(1);
});
