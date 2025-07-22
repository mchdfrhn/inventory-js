const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const config = require('../config');
const logger = require('../utils/logger');

// Security middleware
const security = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
});

// CORS middleware
const corsOptions = {
  origin: config.cors.origin === '*' ? true : config.cors.origin,
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200,
};

// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Morgan logging middleware
const loggingMiddleware = morgan('combined', {
  stream: logger.stream,
  skip: (req, _res) => {
    // Skip logging for health checks and other non-essential endpoints
    return req.url === '/health' || req.url === '/favicon.ico';
  },
});

// Error handling middleware
const errorHandler = (err, req, res, _next) => {
  logger.error('Unhandled error:', err);

  // Don't leak error details in production
  const isDevelopment = config.env === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
};

// 404 middleware
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

// Request metadata middleware
const requestMetadata = (req, res, next) => {
  req.metadata = {
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent') || '',
    timestamp: new Date(),
  };
  next();
};

module.exports = {
  security,
  cors: cors(corsOptions),
  rateLimiter,
  compression: compressionMiddleware,
  logging: loggingMiddleware,
  errorHandler,
  notFound,
  requestMetadata,
};
