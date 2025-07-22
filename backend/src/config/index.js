const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 8080,
    host: process.env.HOST || 'localhost',
  },

  // Database
  database: {
    driver: process.env.DB_DRIVER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'inventaris',
    ssl: process.env.DB_SSL === 'true',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    timezone: process.env.DB_TIMEZONE || '+07:00',
    // eslint-disable-next-line no-console
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Application Info
  app: {
    name: process.env.APP_NAME || 'STTPU Inventory Management System',
    version: process.env.APP_VERSION || '1.0.0',
    developer: process.env.APP_DEVELOPER || 'Mochammad Farhan Ali',
    organization: process.env.APP_ORGANIZATION || 'STTPU',
  },
};

module.exports = config;
