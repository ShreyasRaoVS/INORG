import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import { connectRedis, redisPublisher, redisSubscriber, disconnectRedis, checkRedisConnection } from './config/redis';
import { checkDatabaseConnection } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import teamRoutes from './routes/team.routes';
import departmentRoutes from './routes/department.routes';
import onboardingRoutes from './routes/onboarding.routes';
import offboardingRoutes from './routes/offboarding.routes';
import analyticsRoutes from './routes/analytics.routes';
import documentRoutes from './routes/document.routes';
import activityRoutes from './routes/activity.routes';
import notificationRoutes from './routes/notification.routes';
import gitRoutes from './routes/git.routes';
import tiranRoutes from './routes/tiran.routes';
import chatRoutes from './routes/chat.routes';
import bannerRoutes from './routes/banner.routes';
import monitoringRoutes from './routes/monitoring.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { errorLoggerMiddleware } from './middleware/errorLogger';
import { analyticsMiddleware } from './middleware/analyticsLogger';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// Socket.IO with Redis adapter for multi-instance support
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
  },
  // Connection state recovery for reliability
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
  // Performance optimizations
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const PORT = process.env.PORT || 5000;
const INSTANCE_ID = process.env.INSTANCE_ID || `instance-${PORT}`;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Analytics and error logging (before routes)
app.use(analyticsMiddleware);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check with detailed status
app.get('/api/health', async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseConnection();
  const redisHealthy = await checkRedisConnection();
  
  const health = {
    status: dbHealthy && redisHealthy ? 'OK' : 'DEGRADED',
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      redis: redisHealthy ? 'healthy' : 'unhealthy',
      socketio: io.engine.clientsCount > 0 || true ? 'healthy' : 'idle',
    },
    connections: {
      websockets: io.engine.clientsCount,
      activeUsers: activeUsers.size,
    },
  };
  
  res.status(health.status === 'OK' ? 200 : 503).json(health);
});

// Readiness probe (for load balancers)
app.get('/api/ready', async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseConnection();
  const redisHealthy = await checkRedisConnection();
  
  if (dbHealthy && redisHealthy) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/offboarding', offboardingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/git', gitRoutes);
app.use('/api/tiran', tiranRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Error handling
app.use(notFound);
app.use(errorLoggerMiddleware); // Log errors before handling
app.use(errorHandler);

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    socket.data.userId = decoded.id;
    socket.data.userEmail = decoded.email;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection Handler
const activeUsers = new Map<string, string>(); // userId -> socketId (local to this instance)

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`✅ [${INSTANCE_ID}] User connected: ${userId} (${socket.id})`);
  
  // Store user's socket ID (local to this instance)
  activeUsers.set(userId, socket.id);
  
  // Notify ALL instances that user is online (via Redis pub/sub)
  io.emit('user:online', { userId, instance: INSTANCE_ID });

  // Join user to their personal room (works across instances with Redis adapter)
  socket.join(`user:${userId}`);

  // Handle joining chat rooms
  socket.on('chat:join', (roomId: string) => {
    socket.join(`room:${roomId}`);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Handle leaving chat rooms
  socket.on('chat:leave', (roomId: string) => {
    socket.leave(`room:${roomId}`);
  });

  // Handle sending messages
  socket.on('chat:message', async (data: { roomId: string; message: string }) => {
    try {
      // Save message to database via chat routes
      // Then broadcast to room
      io.to(`room:${data.roomId}`).emit('chat:newMessage', {
        roomId: data.roomId,
        message: data.message,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('chat:typing', (data: { roomId: string; isTyping: boolean }) => {
    socket.to(`room:${data.roomId}`).emit('chat:userTyping', {
      userId,
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ [${INSTANCE_ID}] User disconnected: ${userId} (${socket.id})`);
    activeUsers.delete(userId);
    io.emit('user:offline', { userId, instance: INSTANCE_ID });
  });
});

// Make io available to routes
app.set('io', io);

// Initialize connections and start server
async function startServer() {
  try {
    // Connect to Redis first (required for Socket.IO adapter)
    await connectRedis();
    
    // Configure Socket.IO Redis adapter for multi-instance communication
    io.adapter(createAdapter(redisPublisher, redisSubscriber));
    console.log('✅ Socket.IO Redis adapter configured');
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`🚀 INORG ERP Server [${INSTANCE_ID}]`);
      console.log(`📡 Port: ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`💬 WebSocket: Enabled with Redis adapter (multi-instance ready)`);
      console.log(`🗄️  Database: PostgreSQL with connection pooling`);
      console.log(`⚡ Redis: Connected for caching & pub/sub`);
      console.log(`🔥 Ready to handle concurrent connections!`);
      console.log('═══════════════════════════════════════════════════════════');
    });
    
    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      
      // Stop accepting new connections
      httpServer.close(async () => {
        console.log('✅ HTTP server closed');
        
        // Close Socket.IO
        io.close(() => {
          console.log('✅ Socket.IO closed');
        });
        
        // Disconnect Redis
        await disconnectRedis();
        
        console.log('✅ Shutdown complete');
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
