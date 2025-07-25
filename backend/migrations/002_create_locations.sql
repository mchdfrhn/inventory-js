-- Migration: 002_create_locations.sql
-- Up migration

-- Create locations table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_building ON locations(building);

-- Create trigger for updated_at (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_locations_updated_at') THEN
        CREATE TRIGGER update_locations_updated_at 
            BEFORE UPDATE ON locations 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Insert default locations
INSERT INTO locations (name, code, description, building, floor, room) VALUES
  ('Ruang Direktur', '001', 'Ruang kerja direktur utama', 'Gedung Utama', 'Lantai 3', ''),
  ('Ruang Administrasi', '002', 'Ruang administrasi umum', 'Gedung Utama', 'Lantai 1', ''),
  ('Ruang IT', '003', 'Ruang teknologi informasi', 'Gedung Utama', 'Lantai 2', ''),
  ('Ruang Rapat', '004', 'Ruang rapat besar', 'Gedung Utama', 'Lantai 2', ''),
  ('Ruang Finance', '005', 'Ruang keuangan', 'Gedung Utama', 'Lantai 1', ''),
  ('Gudang', '006', 'Gudang penyimpanan', 'Gedung Gudang', 'Lantai 1', '')
ON CONFLICT (code) DO NOTHING;
