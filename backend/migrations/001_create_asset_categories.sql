-- Migration: 001_create_asset_categories.sql
-- Up migration

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create asset_categories table
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_asset_categories_code ON asset_categories(code);
CREATE INDEX IF NOT EXISTS idx_asset_categories_name ON asset_categories(name);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_asset_categories_updated_at') THEN
        CREATE TRIGGER update_asset_categories_updated_at 
            BEFORE UPDATE ON asset_categories 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Insert default categories
INSERT INTO asset_categories (code, name, description) VALUES
  ('10', 'Furniture', 'Perabotan kantor dan ruangan'),
  ('20', 'Elektronik', 'Perangkat elektronik dan komputer'),
  ('30', 'Kendaraan', 'Kendaraan dinas dan operasional'),
  ('40', 'Alat Tulis', 'Perlengkapan tulis menulis'),
  ('50', 'Alat Kebun', 'Aset berupa alat kebun')
ON CONFLICT (code) DO NOTHING;
