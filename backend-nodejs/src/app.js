const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const logger = require('./utils/logger');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, requestMetadata } = require('./middlewares');

// Create Express application
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.cors?.origin || process.env.CORS_ORIGIN || '*',
  credentials: config.cors?.credentials || false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit?.max || 1000, // 1000 requests per windowMs for development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((config.rateLimit?.windowMs || 15 * 60 * 1000) / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request logging
if (config.env !== 'test' && config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request metadata middleware
app.use(requestMetadata);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env || config.nodeEnv,
  });
});

app.get('/health/detailed', async (req, res) => {
  try {
    const { sequelize } = require('./database/connection');
    
    // Test database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env || config.nodeEnv,
      database: {
        status: 'connected',
        dialect: sequelize.getDialect(),
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message,
      },
    });
  }
});

// API routes
app.use('/api', routes);

// Handle 404 for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
