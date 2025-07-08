-- Complete Schema Creation for Inventory System
-- This migration creates all tables with optimized structure in one go

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. ASSET CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. LOCATIONS TABLE
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

-- 3. ASSETS TABLE (with complete structure)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    kode VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    spesifikasi TEXT,
    satuan VARCHAR(50) NOT NULL DEFAULT 'unit',
    quantity INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'baik',
    
    -- Financial Information
    tanggal_perolehan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    harga_perolehan DECIMAL(15, 2) NOT NULL DEFAULT 0,
    umur_ekonomis_tahun INTEGER NOT NULL DEFAULT 0,
    umur_ekonomis_bulan INTEGER NOT NULL DEFAULT 0,
    akumulasi_penyusutan DECIMAL(15, 2) NOT NULL DEFAULT 0,
    nilai_sisa DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Location and Category
    lokasi VARCHAR(255) NOT NULL DEFAULT '',
    lokasi_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES asset_categories(id),
    asal_pengadaan VARCHAR(255),
    
    -- Bulk Asset Support
    bulk_id UUID,
    bulk_sequence INTEGER DEFAULT 1,
    is_bulk_parent BOOLEAN DEFAULT FALSE,
    bulk_total_count INTEGER DEFAULT 1,
    
    -- Additional Information
    keterangan TEXT,
    
    -- Timestamps and Soft Delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes TEXT,
    old_values TEXT,
    new_values TEXT,
    user_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for Performance Optimization

-- Asset Categories Indexes
CREATE INDEX idx_asset_categories_name ON asset_categories(name);

-- Locations Indexes
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_building ON locations(building);

-- Assets Indexes (most critical for performance)
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_lokasi_id ON assets(lokasi_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);
CREATE INDEX idx_assets_tanggal_perolehan ON assets(tanggal_perolehan);
CREATE INDEX idx_assets_harga_perolehan ON assets(harga_perolehan);
CREATE INDEX idx_assets_nilai_sisa ON assets(nilai_sisa);
CREATE INDEX idx_assets_bulk_id ON assets(bulk_id);
CREATE INDEX idx_assets_is_bulk_parent ON assets(is_bulk_parent);
CREATE INDEX idx_assets_asal_pengadaan ON assets(asal_pengadaan);
CREATE INDEX idx_assets_kode ON assets(kode);

-- Audit Logs Indexes
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Composite Indexes for common queries
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_entity_type_action ON audit_logs(entity_type, action);
CREATE INDEX idx_assets_status_category ON assets(status, category_id);
CREATE INDEX idx_assets_lokasi_status ON assets(lokasi_id, status);

-- TRIGGERS for automatic updated_at

CREATE TRIGGER update_asset_categories_updated_at
    BEFORE UPDATE ON asset_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- COMMENTS for Documentation

COMMENT ON TABLE asset_categories IS 'Table for storing asset categories';
COMMENT ON COLUMN asset_categories.id IS 'Unique identifier for the category';
COMMENT ON COLUMN asset_categories.name IS 'Name of the category';
COMMENT ON COLUMN asset_categories.description IS 'Description of the category';

COMMENT ON TABLE locations IS 'Table for storing physical locations where assets can be stored';
COMMENT ON COLUMN locations.id IS 'Unique identifier for the location';
COMMENT ON COLUMN locations.name IS 'Human-readable name of the location';
COMMENT ON COLUMN locations.code IS 'Unique code for the location';
COMMENT ON COLUMN locations.building IS 'Building name or identifier';
COMMENT ON COLUMN locations.floor IS 'Floor information';
COMMENT ON COLUMN locations.room IS 'Room information';

COMMENT ON TABLE assets IS 'Table for storing complete asset information';
COMMENT ON COLUMN assets.id IS 'Unique identifier for the asset';
COMMENT ON COLUMN assets.kode IS 'Unique asset code';
COMMENT ON COLUMN assets.nama IS 'Name of the asset';
COMMENT ON COLUMN assets.spesifikasi IS 'Detailed specifications of the asset';
COMMENT ON COLUMN assets.satuan IS 'Unit of measurement';
COMMENT ON COLUMN assets.quantity IS 'Quantity of the asset';
COMMENT ON COLUMN assets.status IS 'Current status: baik, tidak_memadai, rusak';
COMMENT ON COLUMN assets.tanggal_perolehan IS 'Date when asset was acquired';
COMMENT ON COLUMN assets.harga_perolehan IS 'Original acquisition price';
COMMENT ON COLUMN assets.umur_ekonomis_tahun IS 'Economic life in years';
COMMENT ON COLUMN assets.umur_ekonomis_bulan IS 'Economic life in months';
COMMENT ON COLUMN assets.akumulasi_penyusutan IS 'Accumulated depreciation amount';
COMMENT ON COLUMN assets.nilai_sisa IS 'Remaining book value';
COMMENT ON COLUMN assets.lokasi IS 'Physical location description';
COMMENT ON COLUMN assets.lokasi_id IS 'Reference to locations table';
COMMENT ON COLUMN assets.category_id IS 'Reference to asset category';
COMMENT ON COLUMN assets.asal_pengadaan IS 'Source of procurement';
COMMENT ON COLUMN assets.bulk_id IS 'UUID to group bulk assets together';
COMMENT ON COLUMN assets.bulk_sequence IS 'Sequence number within bulk group';
COMMENT ON COLUMN assets.is_bulk_parent IS 'True if this is the parent/main record for bulk display';
COMMENT ON COLUMN assets.bulk_total_count IS 'Total count of assets in this bulk group';
COMMENT ON COLUMN assets.keterangan IS 'Additional notes or remarks';
COMMENT ON COLUMN assets.deleted_at IS 'Soft delete timestamp';

COMMENT ON TABLE audit_logs IS 'Table for tracking all changes to entities';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity being tracked (assets, categories, etc.)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the specific entity';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (CREATE, UPDATE, DELETE)';
COMMENT ON COLUMN audit_logs.changes IS 'JSON of what changed';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before change';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after change';