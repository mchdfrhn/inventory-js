// Debug environment variables for Railway
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('HOST:', process.env.HOST);

console.log('=== DATABASE VARIABLES ===');
console.log('PGHOST:', process.env.PGHOST ? '✅ Set' : '❌ Missing');
console.log('PGPORT:', process.env.PGPORT ? '✅ Set' : '❌ Missing'); 
console.log('PGUSER:', process.env.PGUSER ? '✅ Set' : '❌ Missing');
console.log('PGPASSWORD:', process.env.PGPASSWORD ? '✅ Set' : '❌ Missing');
console.log('PGDATABASE:', process.env.PGDATABASE ? '✅ Set' : '❌ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

console.log('=== APPLICATION VARIABLES ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'Default: *');

// Test database connection
const { Sequelize } = require('sequelize');

const config = require('./src/config');
console.log('=== CONFIG RESOLVED ===');
console.log('Database host:', config.database.host);
console.log('Database port:', config.database.port);
console.log('Database name:', config.database.database);
console.log('Database SSL:', config.database.ssl);

async function testConnection() {
  try {
    const sequelize = new Sequelize(
      config.database.database,
      config.database.username,
      config.database.password,
      {
        host: config.database.host,
        port: config.database.port,
        dialect: 'postgres',
        ssl: config.database.ssl,
        dialectOptions: {
          ssl: config.database.ssl ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );

    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    await sequelize.close();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection().then(() => {
  console.log('=== DEBUG COMPLETE ===');
  process.exit(0);
});