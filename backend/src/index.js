const dotenv = require('dotenv');
dotenv.config();

// Production env validation — eksik env varsa sunucu başlamaz
const { validateEnv } = require('./config/validateEnv');
validateEnv();

// Sentry: dotenv'den hemen sonra, diğer modüllerden önce başlatılmalı
const { initSentry, Sentry } = require('./config/sentry');
initSentry();

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
const analyticsRoutes = require('./routes/analytics.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const autoExtendSession = require('./middlewares/autoExtendSession');
const prisma = require('./config/database');
const { logger } = require('./utils/logger');

const app = express();
const httpServer = createServer(app);

// CORS origin ayarı
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
if (corsOrigin === '*' && process.env.NODE_ENV === 'production') {
  logger.error('FATAL: CORS_ORIGIN=* is not allowed in production. Set a specific domain.');
  process.exit(1);
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
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Input sanitization (XSS koruması)
const { sanitizeInput } = require('./middleware/sanitize');
app.use(sanitizeInput);

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// ==================== ROUTES ====================

// ─── Health Check ────────────────────────────────────────────────────────────

// Basit liveness probe (Railway healthcheck için)
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Detaylı readiness probe: DB + Redis + bellek durumu
app.get('/api/v1/health', async (_req, res) => {
  const checks = {
    database: { status: 'unknown', latencyMs: null },
    redis: { status: 'unknown', latencyMs: null },
  };
  let overallStatus = 'OK';

  // --- DB ping ---
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'OK', latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = { status: 'ERROR', latencyMs: null };
    overallStatus = 'DEGRADED';
    logger.warn('Health check DB failed:', err.message);
  }

  // --- Redis ping ---
  try {
    const { redisClient } = require('./config/redis');
    const redisStart = Date.now();
    await redisClient.ping();
    checks.redis = { status: 'OK', latencyMs: Date.now() - redisStart };
  } catch (err) {
    checks.redis = { status: 'ERROR', latencyMs: null };
    overallStatus = 'DEGRADED';
    logger.warn('Health check Redis failed:', err.message);
  }

  // --- Bellek kullanımı ---
  const mem = process.memoryUsage();
  const memory = {
    heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
    rssMB: Math.round(mem.rss / 1024 / 1024),
  };

  const httpStatus = overallStatus === 'OK' ? 200 : 503;

  res.status(httpStatus).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.round(process.uptime()),
    checks,
    memory,
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
app.use('/api/v1/public', autoExtendSession, publicRoutes);
app.use('/api/v1/treats', treatRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Sentry error handler — errorHandler'dan ÖNCE olmalı
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handler
app.use(errorHandler);

// ==================== SOCKET.IO ====================

// Socket.io auth middleware: JWT (admin/mutfak) veya session token (müşteri) doğrulama
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const sessionToken = socket.handshake.auth?.sessionToken;

    // Admin/mutfak bağlantısı: JWT doğrulama
    if (token) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: decoded.restaurantId },
        select: { id: true, isActive: true }
      });
      if (!restaurant || !restaurant.isActive) {
        return next(new Error('Geçersiz token veya hesap devre dışı'));
      }
      socket.restaurantId = restaurant.id;
      socket.authType = 'admin';
      return next();
    }

    // Müşteri bağlantısı: session token doğrulama
    if (sessionToken) {
      const { redisClient } = require('./config/redis');
      const cachedStr = await redisClient.get(`session:${sessionToken}`);
      if (cachedStr) {
        const session = JSON.parse(cachedStr);
        socket.restaurantId = session.restaurantId;
        socket.sessionToken = sessionToken;
        socket.authType = 'customer';
        return next();
      }
      // Redis'te yoksa DB'den kontrol et
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        select: { restaurantId: true, isActive: true, expiresAt: true }
      });
      if (session && session.isActive && session.expiresAt > new Date()) {
        socket.restaurantId = session.restaurantId;
        socket.sessionToken = sessionToken;
        socket.authType = 'customer';
        return next();
      }
      return next(new Error('Geçersiz veya süresi dolmuş oturum'));
    }

    return next(new Error('Kimlik doğrulama gerekli (token veya sessionToken)'));
  } catch (err) {
    logger.warn(`Socket auth failed: ${err.message}`);
    return next(new Error('Kimlik doğrulama başarısız'));
  }
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id} (${socket.authType})`);

  // Join restaurant room -- sadece doğrulanmış restaurantId'ye izin ver
  socket.on('join_restaurant', (restaurantId) => {
    if (String(restaurantId) !== String(socket.restaurantId)) {
      logger.warn(`Socket ${socket.id} unauthorized join attempt: restaurant ${restaurantId}`);
      socket.emit('error', { message: 'Bu restoran odasına katılma yetkiniz yok' });
      return;
    }
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

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  httpServer.close(async () => {
    try {
      await prisma.$disconnect();
      const { redisClient } = require('./config/redis');
      await redisClient.quit();
      logger.info('All connections closed. Exiting.');
    } catch (err) {
      logger.error('Error during shutdown:', err.message);
    }
    process.exit(0);
  });
  // Force exit after 10s if graceful fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (require.main === module) {
  // Redis adapter'ı asenkron bağla, sonra sunucuyu başlat
  setupRedisAdapter().then(() => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`QResto API Server running on port ${PORT}`);
      logger.info(`WebSocket server ready`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}

module.exports = { app, io };

