package database

import (
	"en-inventory/internal/domain"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// MigrationManager handles database migrations for different database types
type MigrationManager struct {
	db      *gorm.DB
	dialect string
	logger  *zap.Logger
}

// NewMigrationManager creates a new migration manager
func NewMigrationManager(db *gorm.DB, dialect string, logger *zap.Logger) *MigrationManager {
	return &MigrationManager{
		db:      db,
		dialect: dialect,
		logger:  logger,
	}
}

// RunMigrations executes database migrations for all models
func (m *MigrationManager) RunMigrations() error {
	m.logger.Info("Running database migrations", zap.String("dialect", m.dialect))

	// Try to use the SQL migration files first
	if m.dialect == "postgres" {
		return m.runSQLMigrations()
	}

	// Fallback to GORM AutoMigrate for other databases
	models := []interface{}{
		&domain.Asset{},
		&domain.AssetCategory{},
		&domain.Location{},
		&domain.AuditLog{},
	}

	// Run auto migrations
	if err := m.db.AutoMigrate(models...); err != nil {
		m.logger.Error("Failed to run migrations", zap.Error(err))
		return err
	}

	m.logger.Info("Database migrations completed successfully")
	return nil
}

// CreateIndexes creates database-specific indexes for better performance
func (m *MigrationManager) CreateIndexes() error {
	m.logger.Info("Creating database indexes")

	switch m.dialect {
	case "postgres":
		return m.createPostgreSQLIndexes()
	case "mysql":
		return m.createMySQLIndexes()
	case "sqlite":
		return m.createSQLiteIndexes()
	default:
		m.logger.Warn("No specific indexes defined for dialect", zap.String("dialect", m.dialect))
	}

	return nil
}

// createPostgreSQLIndexes creates PostgreSQL-specific indexes
func (m *MigrationManager) createPostgreSQLIndexes() error {
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_assets_name_gin ON assets USING gin(to_tsvector('indonesian', name))",
		"CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number)",
		"CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id)",
		"CREATE INDEX IF NOT EXISTS idx_assets_location_id ON assets(location_id)",
		"CREATE INDEX IF NOT EXISTS idx_audit_logs_asset_id ON audit_logs(asset_id)",
		"CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_locations_building_floor_room ON locations(building, floor, room)",
	}

	for _, index := range indexes {
		if err := m.db.Exec(index).Error; err != nil {
			m.logger.Warn("Failed to create PostgreSQL index", zap.String("index", index), zap.Error(err))
		}
	}

	return nil
}

// createMySQLIndexes creates MySQL-specific indexes
func (m *MigrationManager) createMySQLIndexes() error {
	indexes := []string{
		"CREATE INDEX idx_assets_name_fulltext ON assets(name) USING FULLTEXT",
		"CREATE INDEX idx_assets_serial_number ON assets(serial_number)",
		"CREATE INDEX idx_assets_category_id ON assets(category_id)",
		"CREATE INDEX idx_assets_location_id ON assets(location_id)",
		"CREATE INDEX idx_audit_logs_asset_id ON audit_logs(asset_id)",
		"CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at)",
		"CREATE INDEX idx_locations_building_floor_room ON locations(building, floor, room)",
	}

	for _, index := range indexes {
		if err := m.db.Exec(index).Error; err != nil {
			m.logger.Warn("Failed to create MySQL index", zap.String("index", index), zap.Error(err))
		}
	}

	return nil
}

// createSQLiteIndexes creates SQLite-specific indexes
func (m *MigrationManager) createSQLiteIndexes() error {
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(name)",
		"CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number)",
		"CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id)",
		"CREATE INDEX IF NOT EXISTS idx_assets_location_id ON assets(location_id)",
		"CREATE INDEX IF NOT EXISTS idx_audit_logs_asset_id ON audit_logs(asset_id)",
		"CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_locations_building_floor_room ON locations(building, floor, room)",
	}

	for _, index := range indexes {
		if err := m.db.Exec(index).Error; err != nil {
			m.logger.Warn("Failed to create SQLite index", zap.String("index", index), zap.Error(err))
		}
	}

	return nil
}

// runSQLMigrations executes SQL migration files for PostgreSQL
func (m *MigrationManager) runSQLMigrations() error {
	m.logger.Info("Running SQL migrations for PostgreSQL")

	// Always use GORM AutoMigrate as it's more flexible with existing tables
	m.logger.Warn("Using GORM AutoMigrate instead of SQL migration for better compatibility")
	return m.runGormMigrations()
}

// runGormMigrations uses GORM AutoMigrate as fallback
func (m *MigrationManager) runGormMigrations() error {
	models := []interface{}{
		&domain.Asset{},
		&domain.AssetCategory{},
		&domain.Location{},
		&domain.AuditLog{},
	}

	// Run auto migrations
	if err := m.db.AutoMigrate(models...); err != nil {
		m.logger.Error("Failed to run GORM migrations", zap.Error(err))
		return err
	}

	m.logger.Info("GORM migrations completed successfully")
	return nil
}
