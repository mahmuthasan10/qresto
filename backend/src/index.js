const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const categoryRoutes = require('./routes/category.routes');
const menuItemRoutes = require('./routes/menuItem.routes');
const tableRoutes = require('./routes/table.routes');
const orderRoutes = require('./routes/order.routes');
const sessionRoutes = require('./routes/session.routes');
const publicRoutes = require('./routes/public.routes');
const treatRoutes = require('./routes/treat.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();
const httpServer = createServer(app);

// CORS origin ayarı
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
if (corsOrigin === '*' && process.env.NODE_ENV === 'production') {
  logger.warn('CORS_ORIGIN is set to * in production — consider restricting to specific domains');
}
const corsConfig = {
  origin: corsOrigin === '*' ? true : corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
};

// Socket.io setup — Redis adapter'ı asenkron bağla, başarısız olursa in-memory kullan
const io = new Server(httpServer, {
  cors: corsConfig
});

// Redis adapter'ı asenkron olarak bağla (sunucu başlamasını engellemez)
async function setupRedisAdapter() {
  try {
    if (!process.env.REDIS_URL) {
      logger.info('REDIS_URL not set, using in-memory adapter');
      return;
    }
    const { createAdapter } = require('@socket.io/redis-adapter');
    const { createRedisClient } = require('./config/redis');

    const pubClient = createRedisClient();
    const subClient = pubClient.duplicate();

    // Redis bağlantısını bekle (max 5 saniye)
    await Promise.race([
      Promise.all([
        new Promise((resolve, reject) => {
          pubClient.on('ready', resolve);
          pubClient.on('error', reject);
        }),
        new Promise((resolve, reject) => {
          subClient.on('ready', resolve);
          subClient.on('error', reject);
        })
      ]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
    ]);

    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.io Redis adapter connected');
  } catch (err) {
    logger.warn(`Redis adapter failed, using in-memory: ${err.message}`);
  }
}

// Make io accessible to routes
app.set('io', io);

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsConfig));

// Rate limiting - genel
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.' }
});
app.use('/api', limiter);

// Rate limiting - auth endpoints (login/register/forgot-password: 5 deneme / 15 dakika)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});


// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurant', restaurantRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/menu-items', menuItemRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/treats', treatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error handler
app.use(errorHandler);

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join restaurant room
  socket.on('join_restaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    logger.info(`Socket ${socket.id} joined restaurant_${restaurantId}`);
  });

  // Leave restaurant room
  socket.on('leave_restaurant', (restaurantId) => {
    socket.leave(`restaurant_${restaurantId}`);
    logger.info(`Socket ${socket.id} left restaurant_${restaurantId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  // Redis adapter'ı asenkron bağla, sonra sunucuyu başlat
  setupRedisAdapter().then(() => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 QResto API Server running on port ${PORT}`);
      logger.info(`📡 WebSocket server ready`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}

module.exports = { app, io };

