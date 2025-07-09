-- Dummy Assets Data Script
-- This script creates 10 dummy assets with mix of single and bulk assets
-- Run this in your PostgreSQL database

-- First, let's get some category and location IDs (adjust these based on your actual data)
-- You can check your actual IDs by running:
-- SELECT id, name FROM asset_categories LIMIT 5;
-- SELECT id, name FROM locations LIMIT 5;

-- Insert Single Assets (7 assets)
INSERT INTO assets (
    id, kode, nama, spesifikasi, quantity, satuan, tanggal_perolehan, 
    harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan, 
    akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan, 
    category_id, lokasi_id, status, bulk_id, bulk_sequence, 
    is_bulk_parent, bulk_total_count, created_at, updated_at
) VALUES 
-- Asset 1: Proyektor
(
    gen_random_uuid(), 'PROJ001', 'Proyektor Epson EB-X41', 
    'Proyektor LCD 3600 lumens, resolusi XGA', 1, 'unit', 
    '2023-04-01', 7500000, 6, 0, 1875000, 750000, 
    'Proyektor untuk presentasi ruang rapat', 'Ruang Rapat', 'Tender', 
    (SELECT id FROM asset_categories LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 2: Scanner
(
    gen_random_uuid(), 'SCAN001', 'Scanner Canon CanoScan', 
    'Scanner dokumen A4 dengan resolusi 4800x4800 dpi', 1, 'unit', 
    '2022-06-15', 2500000, 5, 0, 1250000, 250000, 
    'Scanner untuk digitalisasi dokumen', 'Ruang Administrasi', 'Pembelian', 
    (SELECT id FROM asset_categories LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 3: Brankas
(
    gen_random_uuid(), 'SAFE001', 'Brankas Besi Tahan Api', 
    'Brankas ukuran 60x45x40cm dengan kunci kombinasi', 1, 'unit', 
    '2021-01-01', 8000000, 15, 0, 1866667, 800000, 
    'Brankas untuk menyimpan dokumen penting', 'Ruang Direktur', 'Pembelian', 
    (SELECT id FROM asset_categories LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 4: Access Point
(
    gen_random_uuid(), 'WIFI001', 'Access Point TP-Link', 
    'TP-Link EAP245 AC1750 Wireless Gigabit', 1, 'unit', 
    '2023-11-01', 1200000, 4, 0, 200000, 120000, 
    'Access point untuk koneksi wireless', 'Ruang IT', 'Tender', 
    (SELECT id FROM asset_categories LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 5: Dispenser
(
    gen_random_uuid(), 'DISP001', 'Dispenser Air Minum', 
    'Dispenser dengan fitur panas dan dingin', 1, 'unit', 
    '2022-11-01', 1500000, 8, 0, 468750, 150000, 
    'Dispenser untuk ruang tamu', 'Ruang Tamu', 'Pembelian', 
    (SELECT id FROM asset_categories LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 6: Whiteboard
(
    gen_random_uuid(), 'WHIT001', 'Whiteboard Magnetic', 
    'Whiteboard ukuran 120x80cm dengan frame aluminium', 1, 'unit', 
    '2024-01-01', 750000, 10, 0, 37500, 75000, 
    'Whiteboard untuk ruang rapat', 'Ruang Rapat', 'Pembelian', 
    (SELECT id FROM asset_categories LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 7: UPS
(
    gen_random_uuid(), 'UPS001', 'UPS APC Smart-UPS', 
    'APC Smart-UPS 1500VA dengan battery backup', 1, 'unit', 
    '2023-05-01', 3500000, 6, 0, 680556, 350000, 
    'UPS untuk backup power server', 'Ruang Server', 'Tender', 
    (SELECT id FROM asset_categories LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
);

-- Insert Bulk Assets (3 assets in one bulk set)
DO $$
DECLARE
    bulk_uuid UUID := gen_random_uuid();
    category_uuid UUID;
    location_uuid UUID;
BEGIN
    -- Get a category and location ID
    SELECT id INTO category_uuid FROM asset_categories LIMIT 1;
    SELECT id INTO location_uuid FROM locations LIMIT 1;
    
    -- Insert bulk assets for IP Phones
    INSERT INTO assets (
        id, kode, nama, spesifikasi, quantity, satuan, tanggal_perolehan, 
        harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan, 
        akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan, 
        category_id, lokasi_id, status, bulk_id, bulk_sequence, 
        is_bulk_parent, bulk_total_count, created_at, updated_at
    ) VALUES 
    -- Phone 1 (Bulk Parent)
    (
        gen_random_uuid(), 'PHONE001', 'Telepon IP Yealink', 
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit', 
        '2023-09-01', 1800000, 5, 0, 300000, 180000, 
        'Telepon IP untuk komunikasi kantor', 'Ruang Direktur', 'Tender', 
        category_uuid, location_uuid, 'baik', bulk_uuid, 1, true, 3, NOW(), NOW()
    ),
    
    -- Phone 2 (Bulk Child)
    (
        gen_random_uuid(), 'PHONE002', 'Telepon IP Yealink', 
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit', 
        '2023-09-01', 1800000, 5, 0, 300000, 180000, 
        'Telepon IP untuk komunikasi kantor', 'Ruang Administrasi', 'Tender', 
        category_uuid, location_uuid, 'baik', bulk_uuid, 2, false, 3, NOW(), NOW()
    ),
    
    -- Phone 3 (Bulk Child)
    (
        gen_random_uuid(), 'PHONE003', 'Telepon IP Yealink', 
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit', 
        '2023-09-01', 1800000, 5, 0, 300000, 180000, 
        'Telepon IP untuk komunikasi kantor', 'Ruang IT', 'Tender', 
        category_uuid, location_uuid, 'rusak', bulk_uuid, 3, false, 3, NOW(), NOW()
    );
END $$;

-- Verify the inserted data
SELECT 
    kode, 
    nama, 
    harga_perolehan, 
    nilai_sisa, 
    status, 
    is_bulk_parent, 
    bulk_total_count,
    CASE 
        WHEN is_bulk_parent = true THEN 'Bulk Parent'
        WHEN bulk_id IS NOT NULL THEN 'Bulk Child'
        ELSE 'Single Asset'
    END AS asset_type
FROM assets 
WHERE kode IN ('PROJ001', 'SCAN001', 'SAFE001', 'WIFI001', 'DISP001', 'WHIT001', 'UPS001', 'PHONE001', 'PHONE002', 'PHONE003')
ORDER BY kode;
