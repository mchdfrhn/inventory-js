require('dotenv').config();

// Better error handling at startup
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🚀 Starting server...');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

try {
  const app = require('./app');
  const config = require('./config');
  console.log('✅ App and config loaded');
  console.log('Server config:', {
    host: config.server.host,
    port: config.server.port,
  });

  // Create required directories
  const fs = require('fs');
  const path = require('path');
  ['logs', 'uploads', 'temp'].forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  // Start server
  const server = app.listen(config.server.port, config.server.host, () => {
    console.log(`✅ Server running on ${config.server.host}:${config.server.port}`);
    console.log(`🏥 Health check: http://${config.server.host}:${config.server.port}/health`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });

  // Test database connection after server starts
  setTimeout(async () => {
    try {
      console.log('🔍 Testing database connection...');
      const { sequelize } = require('./database/connection');
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('⚠️ Database connection failed:', error.message);
      console.log('📊 Database config:', {
        host: process.env.PGHOST || 'not set',
        port: process.env.PGPORT || 'not set',
        database: process.env.PGDATABASE || 'not set',
        user: process.env.PGUSER || 'not set',
        hasPassword: !!process.env.PGPASSWORD,
      });
    }
  }, 3000);

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

