require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./database/connection');
const { logger } = require('./utils/logger');
const config = require('./config');

// Function to start the server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info(`Database connection established successfully (${sequelize.getDialect()})`);

    // Sync database models (without force in production)
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }

    // Start the server
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Server running on ${config.server.host}:${config.server.port} in ${config.env} mode`);
      logger.info(`📱 API Documentation: http://${config.server.host}:${config.server.port}/api`);
      logger.info(`🏥 Health Check: http://${config.server.host}:${config.server.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await sequelize.close();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during database shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle process signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
