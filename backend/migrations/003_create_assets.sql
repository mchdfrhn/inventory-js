-- Migration: 003_create_assets.sql
-- Up migration

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode VARCHAR(50) NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  spesifikasi TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  satuan VARCHAR(50) NOT NULL,
  tanggal_perolehan DATE NOT NULL,
  harga_perolehan DECIMAL(15,2) NOT NULL CHECK (harga_perolehan >= 0),
  umur_ekonomis_tahun INTEGER NOT NULL DEFAULT 0 CHECK (umur_ekonomis_tahun >= 0),
  umur_ekonomis_bulan INTEGER NOT NULL DEFAULT 0 CHECK (umur_ekonomis_bulan >= 0 AND umur_ekonomis_bulan <= 600),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_kode ON assets(kode);
CREATE INDEX IF NOT EXISTS idx_assets_nama ON assets(nama);
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_lokasi_id ON assets(lokasi_id);
CREATE INDEX IF NOT EXISTS idx_assets_bulk_id ON assets(bulk_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_tanggal_perolehan ON assets(tanggal_perolehan);

-- Create GIN indexes for text search (if pg_trgm extension is available)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_assets_nama_gin ON assets USING gin(nama gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_assets_kode_gin ON assets USING gin(kode gin_trgm_ops);

-- Create trigger for updated_at (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_updated_at') THEN
        CREATE TRIGGER update_assets_updated_at 
            BEFORE UPDATE ON assets 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;
