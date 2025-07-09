package database

import (
	"fmt"

	"en-inventory/internal/config"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DatabaseFactory handles the creation of database connections based on the driver type
type DatabaseFactory struct {
	config *config.DatabaseConfig
	logger *zap.Logger
}

// NewDatabaseFactory creates a new database factory
func NewDatabaseFactory(cfg *config.DatabaseConfig, logger *zap.Logger) *DatabaseFactory {
	return &DatabaseFactory{
		config: cfg,
		logger: logger,
	}
}

// CreateConnection creates a database connection based on the configured driver
func (f *DatabaseFactory) CreateConnection() (*gorm.DB, error) {
	var dialector gorm.Dialector

	switch f.config.Driver {
	case "postgres":
		f.logger.Info("Connecting to PostgreSQL database")
		dialector = postgres.Open(f.config.GetDSN())
	case "mysql":
		f.logger.Info("Connecting to MySQL database")
		dialector = mysql.Open(f.config.GetDSN())
	case "sqlite":
		f.logger.Info("Connecting to SQLite database")
		dialector = sqlite.Open(f.config.DBName + ".db")
	default:
		return nil, fmt.Errorf("unsupported database driver: %s", f.config.Driver)
	}

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to %s database: %w", f.config.Driver, err)
	}

	f.logger.Info("Successfully connected to database",
		zap.String("driver", f.config.Driver),
		zap.String("host", f.config.Host),
		zap.String("database", f.config.DBName))

	return db, nil
}

// GetSQLDialect returns the SQL dialect for the configured database
func (f *DatabaseFactory) GetSQLDialect() string {
	return f.config.Driver
}
