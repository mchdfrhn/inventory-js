const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for better structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, version, requestId, userId, action, entity, ...meta }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      service: service || config.app?.name || 'STTPU Inventory',
      version: version || config.app?.version || '1.0.0',
      message,
      ...(requestId && { requestId }),
      ...(userId && { userId }),
      ...(action && { action }),
      ...(entity && { entity }),
      ...meta,
    };

    return JSON.stringify(logEntry);
  }),
);

// Console format for development - more readable
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS',
  }),
  winston.format.printf(({ timestamp, level, message, requestId, action, entity, stack }) => {
    let logMessage = `${timestamp} [${level}]`;

    if (requestId) {
      logMessage += ` [${requestId}]`;
    }

    if (action && entity) {
      logMessage += ` [${action}:${entity}]`;
    }

    logMessage += `: ${stack || message}`;

    return logMessage;
  }),
);

// Create enhanced logger
const logger = winston.createLogger({
  level: config.logging?.level || 'info',
  format: customFormat,
  defaultMeta: {
    service: config.app?.name || 'STTPU Inventory',
    version: config.app?.version || '1.0.0',
    environment: config.env || 'development',
  },
  transports: [
    // All logs
    new winston.transports.File({
      filename: config.logging?.file || path.join(logsDir, 'app.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    }),

    // Error logs only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),

    // Access logs for API requests
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),

    // Audit logs for business operations
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          // Only log entries marked as audit logs
          return info.audit ? info : false;
        })(),
      ),
    }),
  ],
});

// Add console transport for development
if (config.env === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug',
  }));
}

// Enhanced logging methods
const enhancedLogger = {
  // Standard logging methods
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // Business operation logging
  audit: (action, entity, data = {}, userId = null) => {
    logger.info(`${action} ${entity}`, {
      audit: true,
      action,
      entity,
      userId,
      ...data,
    });
  },

  // API request logging
  request: (req, res, duration) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId: req.requestId,
    };

    if (res.statusCode >= 400) {
      logger.error('API Request Failed', logData);
    } else {
      logger.http(`${req.method} ${req.originalUrl}`, logData);
    }
  },

  // Database operation logging
  database: (operation, table, data = {}) => {
    logger.debug(`Database ${operation}`, {
      operation,
      table,
      ...data,
    });
  },

  // Security logging
  security: (event, details = {}) => {
    logger.warn(`Security Event: ${event}`, {
      security: true,
      event,
      ...details,
    });
  },

  // Performance logging
  performance: (operation, duration, details = {}) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger[level](`Performance: ${operation} took ${duration}ms`, {
      performance: true,
      operation,
      duration,
      ...details,
    });
  },

  // System health logging
  health: (component, status, details = {}) => {
    const level = status === 'healthy' ? 'info' : 'error';
    logger[level](`Health Check: ${component} is ${status}`, {
      health: true,
      component,
      status,
      ...details,
    });
  },

  // Stream for Morgan HTTP logging
  stream: {
    write: (message) => {
      logger.http(message.trim());
    },
  },
};

module.exports = enhancedLogger;
