/**
 * Task Manager - Main Server
 * 
 * Professional collaborative task management application
 * with real-time synchronization and modern UX.
 * 
 * @copyright 2025 Digital Dream (www.digitaldream.work)
 * @license MIT
 * @version 1.0.0
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const {
  apiLimiter,
  helmetConfig,
  getCorsOptions,
  sanitizeInput,
  errorHandler,
} = require('./middleware/security');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  // Allow same-origin in production and any origin in development
  // Using 'true' reflects the request origin and avoids hard-coding domains
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmetConfig);
app.use(compression());
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// Rate limiting for API routes (disabled in development)
if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
}

// Prevent search engine indexing for public dashboard and app pages
app.use((req, res, next) => {
  if (req.path.startsWith('/dashboard') || req.path.startsWith('/app')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../public')));

// Serve Outlook Add-in files
app.use('/outlook', express.static(path.join(__dirname, '../../outlook-addin')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api', require('./routes/ical'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user:join', async (userId) => {
    try {
      // Validate user exists to avoid P2025 errors with stale localStorage ids
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        console.warn('user:join ignored - user not found:', userId);
        return;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true }
      });

      // Only track connected user after validation + update
      connectedUsers.set(socket.id, userId);

      const onlineUsers = await prisma.user.findMany({
        where: { isOnline: true },
        select: { id: true, name: true, avatar: true }
      });

      io.emit('users:online', onlineUsers);
    } catch (error) {
      console.error('Error joining user:', error);
    }
  });

  socket.on('disconnect', async () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false }
        });

        connectedUsers.delete(socket.id);

        const onlineUsers = await prisma.user.findMany({
          where: { isOnline: true },
          select: { id: true, name: true, avatar: true }
        });

        io.emit('users:online', onlineUsers);
      } catch (error) {
        console.error('Error disconnecting user:', error);
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start recurring task scheduler
const recurringService = require('./services/recurring');
recurringService.startScheduler();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
});