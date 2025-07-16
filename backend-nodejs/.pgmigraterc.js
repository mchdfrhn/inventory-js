const config = require('./src/config');

module.exports = {
  databaseUrl: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.username,
    password: config.database.password,
    ssl: config.database.ssl,
  },
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
  direction: 'up',
  count: Infinity,
  ignorePattern: '.*\\..*',
  schema: 'public',
  createSchema: true,
  createMigrationsSchema: false,
  noLock: false,
  dryRun: false,
  fake: false,
  singleTransaction: true,
  decamelize: false,
  logger: console,
};
