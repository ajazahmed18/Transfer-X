import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db.js';
import { Room } from './models/Room.js';
import transferRoutes from './routes/transferRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ROOM_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],
  })
);
app.use(express.json());

// API Routes
app.use('/api', roomRoutes);
app.use('/api/transfers', transferRoutes);

// In-memory quick lookup for socket connections and rooms
const rooms = new Map();
const socketToRoomMap = new Map();

// Helper: Generate a unique 6-digit code
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

// Cleanup expired in-memory rooms periodically
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

// Setup Socket.IO for WebRTC Signaling
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e6,
});

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Sender: Create Room
  socket.on('create-room', async (data, callback) => {
    try {
      const code = generateUniqueCode();
      const now = Date.now();
      const expiresAt = now + ROOM_EXPIRY_MS;

      const roomData = {
        code,
        senderSocketId: socket.id,
        fileMeta: data?.fileMeta,
        createdAt: now,
        expiresAt,
      };

      // Save in memory
      rooms.set(code, roomData);
      socketToRoomMap.set(socket.id, { code, role: 'sender' });
      socket.join(`room-${code}`);

      // Save to MongoDB asynchronously (non-blocking)
      try {
        await Room.create({
          code,
          senderSocketId: socket.id,
          fileMeta: data?.fileMeta,
          createdAt: new Date(now),
          expiresAt: new Date(expiresAt),
        });
      } catch (dbErr) {
        // Non-fatal if DB is offline; in-memory signaling continues
        console.warn('[Room DB Sync Warning]:', dbErr.message);
      }

      console.log(`[Room Created] Code: ${code}, Sender: ${socket.id}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          code,
          expiresAt,
        });
      }
    } catch (err) {
      console.error('[Create Room Error]:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Failed to create room' });
      }
    }
  });

  // Receiver: Validate 6-digit Code
  socket.on('validate-code', (data, callback) => {
    const code = data?.code?.trim();
    if (!/^\d{6}$/.test(code || '')) {
      return callback?.({ valid: false, error: 'Please enter a valid 6-digit code.' });
    }

    const room = rooms.get(code);
    if (!room || Date.now() > room.expiresAt) {
      return callback?.({
        valid: false,
        error: 'Transfer code does not exist or has expired.',
      });
    }

    if (room.receiverSocketId && room.receiverSocketId !== socket.id) {
      return callback?.({
        valid: false,
        error: 'This transfer session is already in progress with another receiver.',
      });
    }

    callback?.({
      valid: true,
      fileMeta: room.fileMeta,
      expiresIn: Math.max(0, Math.floor((room.expiresAt - Date.now()) / 1000)),
    });
  });

  // Receiver: Join Room
  socket.on('join-room', async (data, callback) => {
    try {
      const code = data?.code?.trim();
      if (!/^\d{6}$/.test(code || '')) {
        return callback?.({ success: false, error: 'Invalid 6-digit code.' });
      }

      const room = rooms.get(code);
      if (!room || Date.now() > room.expiresAt) {
        return callback?.({
          success: false,
          error: 'Invalid or expired 6-digit transfer code.',
        });
      }

      if (room.receiverSocketId && room.receiverSocketId !== socket.id) {
        return callback?.({
          success: false,
          error: 'Another receiver is already connected to this transfer.',
        });
      }

      room.receiverSocketId = socket.id;
      socketToRoomMap.set(socket.id, { code, role: 'receiver' });
      socket.join(`room-${code}`);

      // Update in MongoDB
      try {
        await Room.updateOne({ code }, { receiverSocketId: socket.id });
      } catch (dbErr) {
        console.warn('[Room DB Update Warning]:', dbErr.message);
      }

      console.log(`[Receiver Joined] Code: ${code}, Receiver: ${socket.id}`);

      // Notify sender that receiver has arrived
      socket.to(`room-${code}`).emit('receiver-joined', {
        receiverId: socket.id,
      });

      callback?.({
        success: true,
        code,
        fileMeta: room.fileMeta,
      });
    } catch (err) {
      console.error('[Join Room Error]:', err);
      callback?.({ success: false, error: err.message || 'Failed to join room' });
    }
  });

  // WebRTC Signaling: Offer (Sender -> Receiver)
  socket.on('offer', (data) => {
    const code = data?.code;
    const room = rooms.get(code);
    if (!room || room.senderSocketId !== socket.id || !data?.offer) return;
    socket.to(`room-${code}`).emit('offer', { offer: data.offer, senderId: socket.id });
  });

  // WebRTC Signaling: Answer (Receiver -> Sender)
  socket.on('answer', (data) => {
    const code = data?.code;
    const room = rooms.get(code);
    if (!room || room.receiverSocketId !== socket.id || !data?.answer) return;
    socket.to(`room-${code}`).emit('answer', { answer: data.answer, receiverId: socket.id });
  });

  // WebRTC Signaling: ICE Candidate (Bidirectional)
  socket.on('ice-candidate', (data) => {
    const code = data?.code;
    const room = rooms.get(code);
    if (!room || !data?.candidate) return;
    socket.to(`room-${code}`).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
  });

  // Cancel Transfer
  socket.on('cancel-transfer', async (data) => {
    const code = data?.code;
    const room = rooms.get(code);
    if (!room) return;

    socket.to(`room-${code}`).emit('peer-cancelled', {
      reason: data?.reason || 'Transfer cancelled by peer',
    });

    // Cleanup room
    socketToRoomMap.delete(room.senderSocketId);
    if (room.receiverSocketId) socketToRoomMap.delete(room.receiverSocketId);
    rooms.delete(code);

    try {
      await Room.deleteOne({ code });
    } catch (e) {}
  });

  // Transfer Completed
  socket.on('transfer-done', async (data) => {
    const code = data?.code;
    const room = rooms.get(code);
    if (!room) return;

    socketToRoomMap.delete(room.senderSocketId);
    if (room.receiverSocketId) socketToRoomMap.delete(room.receiverSocketId);
    rooms.delete(code);

    try {
      await Room.deleteOne({ code });
    } catch (e) {}
  });

  // Disconnect handler
  socket.on('disconnect', (reason) => {
    console.log(`[Socket Disconnected] ID: ${socket.id}, Reason: ${reason}`);
    const mapping = socketToRoomMap.get(socket.id);
    if (mapping) {
      const { code, role } = mapping;
      const room = rooms.get(code);
      if (room) {
        socket.to(`room-${code}`).emit('peer-disconnected', {
          role,
          message: `${role === 'sender' ? 'Sender' : 'Receiver'} disconnected.`,
        });
        if (role === 'sender') {
          rooms.delete(code);
          if (room.receiverSocketId) socketToRoomMap.delete(room.receiverSocketId);
        } else if (role === 'receiver') {
          room.receiverSocketId = null;
        }
      }
      socketToRoomMap.delete(socket.id);
    }
  });
});

// Start Express + Socket.IO Server
server.listen(PORT, () => {
  console.log(`🚀 [Server] TransferX Backend running on port ${PORT}`);
  console.log(`📡 [Server] API Health check: http://localhost:${PORT}/api/health`);
});
