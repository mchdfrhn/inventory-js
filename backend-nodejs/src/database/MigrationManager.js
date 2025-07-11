const { sequelize } = require('./connection');
const logger = require('../utils/logger');

class MigrationManager {
  constructor() {
    this.sequelize = sequelize;
  }

  async runMigrations() {
    try {
      logger.info('🔄 Starting database migrations...');

      // Create tables
      await this.createTables();

      // Insert default data
      await this.insertDefaultData();

      logger.info('✅ Database migrations completed successfully');
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async createTables() {
    const transaction = await this.sequelize.transaction();

    try {
      // Create asset_categories table
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS asset_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(50) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `, { transaction });

      // Create locations table
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS locations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          code VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          building VARCHAR(255),
          floor VARCHAR(50),
          room VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `, { transaction });

      // Create assets table
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS assets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          kode VARCHAR(50) NOT NULL UNIQUE,
          nama VARCHAR(255) NOT NULL,
          spesifikasi TEXT,
          quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
          satuan VARCHAR(50) NOT NULL,
          tanggal_perolehan DATE NOT NULL,
          harga_perolehan DECIMAL(15,2) NOT NULL CHECK (harga_perolehan >= 0),
          umur_ekonomis_tahun INTEGER NOT NULL DEFAULT 0 CHECK (umur_ekonomis_tahun >= 0),
          umur_ekonomis_bulan INTEGER NOT NULL DEFAULT 0 CHECK (umur_ekonomis_bulan >= 0 AND umur_ekonomis_bulan <= 11),
          akumulasi_penyusutan DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (akumulasi_penyusutan >= 0),
          nilai_sisa DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (nilai_sisa >= 0),
          keterangan TEXT,
          lokasi VARCHAR(255),
          lokasi_id INTEGER REFERENCES locations(id),
          asal_pengadaan VARCHAR(255),
          category_id UUID NOT NULL REFERENCES asset_categories(id),
          status VARCHAR(20) NOT NULL DEFAULT 'baik' CHECK (status IN ('baik', 'rusak', 'tidak_memadai')),
          bulk_id UUID,
          bulk_sequence INTEGER NOT NULL DEFAULT 1,
          is_bulk_parent BOOLEAN NOT NULL DEFAULT false,
          bulk_total_count INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `, { transaction });

      // Create audit_logs table
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          entity_type VARCHAR(100) NOT NULL CHECK (entity_type IN ('asset', 'category', 'location')),
          entity_id UUID NOT NULL,
          action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
          changes TEXT,
          old_values TEXT,
          new_values TEXT,
          user_id VARCHAR(100),
          ip_address VARCHAR(45),
          user_agent TEXT,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `, { transaction });

      await transaction.commit();
      logger.info('📊 Database tables created successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async createIndexes() {
    try {
      const indexes = [
        // Asset indexes
        'CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id);',
        'CREATE INDEX IF NOT EXISTS idx_assets_lokasi_id ON assets(lokasi_id);',
        'CREATE INDEX IF NOT EXISTS idx_assets_bulk_id ON assets(bulk_id);',
        'CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);',
        'CREATE INDEX IF NOT EXISTS idx_assets_tanggal_perolehan ON assets(tanggal_perolehan);',
        'CREATE INDEX IF NOT EXISTS idx_assets_nama ON assets USING gin(nama gin_trgm_ops);',
        'CREATE INDEX IF NOT EXISTS idx_assets_kode ON assets USING gin(kode gin_trgm_ops);',

        // Audit log indexes
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_entity_id ON audit_logs(entity_type, entity_id);',

        // Location indexes
        'CREATE INDEX IF NOT EXISTS idx_locations_name ON locations USING gin(name gin_trgm_ops);',
        'CREATE INDEX IF NOT EXISTS idx_locations_code ON locations USING gin(code gin_trgm_ops);',

        // Category indexes
        'CREATE INDEX IF NOT EXISTS idx_categories_name ON asset_categories USING gin(name gin_trgm_ops);',
        'CREATE INDEX IF NOT EXISTS idx_categories_code ON asset_categories USING gin(code gin_trgm_ops);',
      ];

      for (const indexQuery of indexes) {
        try {
          await this.sequelize.query(indexQuery);
        } catch (error) {
          // Ignore errors for indexes that already exist or trigram extension not available
          logger.warn(`Index creation warning: ${error.message}`);
        }
      }

      logger.info('📈 Database indexes created successfully');
    } catch (error) {
      logger.error('❌ Error creating indexes:', error);
      // Don't throw error as indexes are not critical for basic functionality
    }
  }

  async insertDefaultData() {
    const transaction = await this.sequelize.transaction();

    try {
      // Insert default categories
      await this.sequelize.query(`
        INSERT INTO asset_categories (id, code, name, description) VALUES
          (gen_random_uuid(), 'FURNITUR', 'Furniture', 'Perabotan kantor dan ruangan'),
          (gen_random_uuid(), 'ELEKTRONIK', 'Elektronik', 'Perangkat elektronik dan komputer'),
          (gen_random_uuid(), 'KENDARAAN', 'Kendaraan', 'Kendaraan dinas dan operasional'),
          (gen_random_uuid(), 'ALAT_TULIS', 'Alat Tulis', 'Perlengkapan tulis menulis'),
          (gen_random_uuid(), 'BANGUNAN', 'Bangunan', 'Aset berupa bangunan dan infrastruktur')
        ON CONFLICT (code) DO NOTHING;
      `, { transaction });

      // Insert default locations
      await this.sequelize.query(`
        INSERT INTO locations (name, code, description, building, floor, room) VALUES
          ('Ruang Direktur', 'RD001', 'Ruang kerja direktur utama', 'Gedung Utama', 'Lantai 3', 'R301'),
          ('Ruang Administrasi', 'RA001', 'Ruang administrasi umum', 'Gedung Utama', 'Lantai 1', 'R101'),
          ('Ruang IT', 'RIT001', 'Ruang teknologi informasi', 'Gedung Utama', 'Lantai 2', 'R201'),
          ('Ruang Rapat', 'RR001', 'Ruang rapat besar', 'Gedung Utama', 'Lantai 2', 'R202'),
          ('Gudang', 'GD001', 'Gudang penyimpanan', 'Gedung Gudang', 'Lantai 1', 'G101')
        ON CONFLICT (code) DO NOTHING;
      `, { transaction });

      await transaction.commit();
      logger.info('📋 Default data inserted successfully');
    } catch (error) {
      await transaction.rollback();
      logger.error('❌ Error inserting default data:', error);
      // Don't throw error as default data is not critical
    }
  }
}

module.exports = MigrationManager;
