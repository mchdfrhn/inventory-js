-- Insert default data for the inventory system
-- This migration adds essential default categories and sample locations

-- Insert default asset categories
INSERT INTO asset_categories (id, name, description) VALUES 
    (uuid_generate_v4(), 'Elektronik', 'Perangkat elektronik dan teknologi'),
    (uuid_generate_v4(), 'Furniture', 'Perabotan dan furnitur kantor'),
    (uuid_generate_v4(), 'Kendaraan', 'Kendaraan operasional'),
    (uuid_generate_v4(), 'Peralatan', 'Peralatan kerja dan operasional'),
    (uuid_generate_v4(), 'Bangunan', 'Bangunan dan infrastruktur')
ON CONFLICT (name) DO NOTHING;

-- Insert default locations
INSERT INTO locations (name, code, description, building, floor, room) VALUES 
    ('Gedung Utama - Lantai 1 - Ruang Admin', 'GU-L1-RA', 'Ruang administrasi lantai 1', 'Gedung Utama', '1', 'Admin'),
    ('Gedung Utama - Lantai 1 - Ruang IT', 'GU-L1-RIT', 'Ruang IT dan server lantai 1', 'Gedung Utama', '1', 'IT'),
    ('Gedung Utama - Lantai 2 - Ruang Direktur', 'GU-L2-RD', 'Ruang direktur lantai 2', 'Gedung Utama', '2', 'Direktur'),
    ('Gedung Utama - Lantai 2 - Ruang Meeting', 'GU-L2-RM', 'Ruang meeting lantai 2', 'Gedung Utama', '2', 'Meeting'),
    ('Gudang - Lantai 1 - Storage A', 'GD-L1-SA', 'Area penyimpanan A di gudang', 'Gudang', '1', 'Storage A'),
    ('Gudang - Lantai 1 - Storage B', 'GD-L1-SB', 'Area penyimpanan B di gudang', 'Gudang', '1', 'Storage B'),
    ('Area Parkir', 'AP-EXT', 'Area parkir eksternal', 'Eksternal', '-', 'Parkir')
ON CONFLICT (code) DO NOTHING;