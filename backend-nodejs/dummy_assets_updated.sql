-- Dummy Assets Data Script - UPDATED VERSION
-- This script creates 31 dummy assets with mix of single and bulk assets
-- Total: 15 single assets + 3 bulk sets (16 individual units) = 31 total units
-- Run this in your PostgreSQL database

-- First, let's get some category and location IDs (adjust these based on your actual data)
-- You can check your actual IDs by running:
-- SELECT id, name FROM asset_categories LIMIT 5;
-- SELECT id, name FROM locations LIMIT 5;

-- Insert Single Assets (15 assets)
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
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Ruang%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 2: Scanner
(
    gen_random_uuid(), 'SCAN001', 'Scanner Canon CanoScan', 
    'Scanner dokumen A4 dengan resolusi 4800x4800 dpi', 1, 'unit', 
    '2022-06-15', 2500000, 5, 0, 1250000, 250000, 
    'Scanner untuk digitalisasi dokumen', 'Ruang Administrasi', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Admin%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 3: Brankas
(
    gen_random_uuid(), 'SAFE001', 'Brankas Besi Tahan Api', 
    'Brankas ukuran 60x45x40cm dengan kunci kombinasi', 1, 'unit', 
    '2021-01-01', 8000000, 15, 0, 1866667, 800000, 
    'Brankas untuk menyimpan dokumen penting', 'Ruang Direktur', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Peralatan' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Direktur%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 4: Access Point
(
    gen_random_uuid(), 'WIFI001', 'Access Point TP-Link', 
    'TP-Link EAP245 AC1750 Wireless Gigabit', 1, 'unit', 
    '2023-11-01', 1200000, 4, 0, 200000, 120000, 
    'Access point untuk koneksi wireless', 'Ruang IT', 'Tender', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%IT%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 5: Dispenser
(
    gen_random_uuid(), 'DISP001', 'Dispenser Air Minum', 
    'Dispenser dengan fitur panas dan dingin', 1, 'unit', 
    '2022-11-01', 1500000, 8, 0, 468750, 150000, 
    'Dispenser untuk ruang tamu', 'Ruang Tamu', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Peralatan' LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 6: Whiteboard
(
    gen_random_uuid(), 'WHIT001', 'Whiteboard Magnetic', 
    'Whiteboard ukuran 120x80cm dengan frame aluminium', 1, 'unit', 
    '2024-01-01', 750000, 10, 0, 37500, 75000, 
    'Whiteboard untuk ruang rapat', 'Ruang Rapat', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Peralatan' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Meeting%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 7: UPS
(
    gen_random_uuid(), 'UPS001', 'UPS APC Smart-UPS', 
    'APC Smart-UPS 1500VA dengan battery backup', 1, 'unit', 
    '2023-05-01', 3500000, 6, 0, 680556, 350000, 
    'UPS untuk backup power server', 'Ruang Server', 'Tender', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%IT%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 8: Printer
(
    gen_random_uuid(), 'PRINTER001', 'Printer HP LaserJet Pro', 
    'HP LaserJet Pro MFP M428fdw, Print/Scan/Copy/Fax', 1, 'unit', 
    '2024-03-15', 4200000, 5, 0, 280000, 3920000, 
    'Printer multifungsi untuk kantor', 'Ruang Administrasi', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Admin%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 9: AC Split
(
    gen_random_uuid(), 'AC001', 'AC Split Daikin', 
    'Daikin Inverter 1.5 PK, R32 Refrigerant', 1, 'unit', 
    '2023-08-20', 5500000, 8, 0, 916667, 4583333, 
    'AC untuk ruang direktur', 'Ruang Direktur', 'Tender', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Direktur%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 10: CCTV
(
    gen_random_uuid(), 'CCTV001', 'Kamera CCTV Hikvision', 
    'Hikvision DS-2CE16D0T-IR, 2MP 1080p', 1, 'unit', 
    '2024-01-10', 850000, 6, 0, 70833, 779167, 
    'Kamera CCTV untuk keamanan pintu masuk', 'Pintu Masuk', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 11: Meja Executive
(
    gen_random_uuid(), 'DESK001', 'Meja Kerja Executive', 
    'Meja kerja kayu jati ukuran 160x80cm dengan laci', 1, 'unit', 
    '2022-12-01', 3200000, 10, 0, 533333, 2666667, 
    'Meja kerja untuk ruang direktur', 'Ruang Direktur', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Furniture' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Direktur%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 12: Kursi Executive
(
    gen_random_uuid(), 'CHAIR001', 'Kursi Executive Ergonomis', 
    'Kursi direktur dengan bahan kulit sintetis dan roda', 1, 'unit', 
    '2022-12-01', 2800000, 8, 0, 583333, 2216667, 
    'Kursi executive untuk direktur', 'Ruang Direktur', 'Pembelian', 
    (SELECT id FROM asset_categories WHERE name = 'Furniture' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%Direktur%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 13: Server
(
    gen_random_uuid(), 'SERVER001', 'Server Dell PowerEdge', 
    'Dell PowerEdge T340, Intel Xeon E-2224, 16GB RAM, 1TB HDD', 1, 'unit', 
    '2023-02-15', 25000000, 5, 0, 8333333, 16666667, 
    'Server utama untuk aplikasi inventory', 'Ruang Server', 'Tender', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%IT%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
),

-- Asset 14: Network Switch
(
    gen_random_uuid(), 'SWITCH001', 'Network Switch TP-Link', 
    'TP-Link TL-SG1024D 24-Port Gigabit Desktop Switch', 1, 'unit', 
    '2023-02-15', 1800000, 5, 0, 600000, 1200000, 
    'Switch jaringan untuk konektifitas kantor', 'Ruang IT', 'Tender', 
    (SELECT id FROM asset_categories WHERE name = 'Elektronik' LIMIT 1), 
    (SELECT id FROM locations WHERE name LIKE '%IT%' LIMIT 1), 
    'baik', null, 1, false, 1, NOW(), NOW()
);

-- Insert Bulk Assets Set 1: IP Phones (3 units)
DO $$
DECLARE
    bulk_uuid_phones UUID := gen_random_uuid();
    category_elektronik UUID;
    location_default UUID;
BEGIN
    -- Get category and location IDs
    SELECT id INTO category_elektronik FROM asset_categories WHERE name = 'Elektronik' LIMIT 1;
    SELECT id INTO location_default FROM locations LIMIT 1;
    
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
        category_elektronik, location_default, 'baik', bulk_uuid_phones, 1, true, 3, NOW(), NOW()
    ),
    
    -- Phone 2 (Bulk Child)
    (
        gen_random_uuid(), 'PHONE002', 'Telepon IP Yealink', 
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit', 
        '2023-09-01', 1800000, 5, 0, 300000, 180000, 
        'Telepon IP untuk komunikasi kantor', 'Ruang Administrasi', 'Tender', 
        category_elektronik, location_default, 'baik', bulk_uuid_phones, 2, false, 3, NOW(), NOW()
    ),
    
    -- Phone 3 (Bulk Child)
    (
        gen_random_uuid(), 'PHONE003', 'Telepon IP Yealink', 
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit', 
        '2023-09-01', 1800000, 5, 0, 300000, 180000, 
        'Telepon IP untuk komunikasi kantor', 'Ruang IT', 'Tender', 
        category_elektronik, location_default, 'rusak', bulk_uuid_phones, 3, false, 3, NOW(), NOW()
    );
END $$;

-- Insert Bulk Assets Set 2: Monitors (5 units)
DO $$
DECLARE
    bulk_uuid_monitors UUID := gen_random_uuid();
    category_elektronik UUID;
    location_default UUID;
BEGIN
    -- Get category and location IDs
    SELECT id INTO category_elektronik FROM asset_categories WHERE name = 'Elektronik' LIMIT 1;
    SELECT id INTO location_default FROM locations LIMIT 1;
    
    -- Insert bulk assets for Monitors
    INSERT INTO assets (
        id, kode, nama, spesifikasi, quantity, satuan, tanggal_perolehan, 
        harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan, 
        akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan, 
        category_id, lokasi_id, status, bulk_id, bulk_sequence, 
        is_bulk_parent, bulk_total_count, created_at, updated_at
    ) VALUES 
    -- Monitor 1 (Bulk Parent)
    (
        gen_random_uuid(), 'MONITOR001', 'Monitor LED Samsung', 
        'Samsung 24 inch LED Monitor Full HD 1920x1080', 1, 'unit', 
        '2024-02-01', 2200000, 6, 0, 183333, 2016667, 
        'Monitor untuk workstation karyawan', 'Ruang Administrasi', 'Tender', 
        category_elektronik, location_default, 'baik', bulk_uuid_monitors, 1, true, 5, NOW(), NOW()
    ),
    
    -- Monitor 2-5 (Bulk Children)
    (
        gen_random_uuid(), 'MONITOR002', 'Monitor LED Samsung', 
        'Samsung 24 inch LED Monitor Full HD 1920x1080', 1, 'unit', 
        '2024-02-01', 2200000, 6, 0, 183333, 2016667, 
        'Monitor untuk workstation karyawan', 'Ruang Administrasi', 'Tender', 
        category_elektronik, location_default, 'baik', bulk_uuid_monitors, 2, false, 5, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'MONITOR003', 'Monitor LED Samsung', 
        'Samsung 24 inch LED Monitor Full HD 1920x1080', 1, 'unit', 
        '2024-02-01', 2200000, 6, 0, 183333, 2016667, 
        'Monitor untuk workstation karyawan', 'Ruang IT', 'Tender', 
        category_elektronik, location_default, 'baik', bulk_uuid_monitors, 3, false, 5, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'MONITOR004', 'Monitor LED Samsung', 
        'Samsung 24 inch LED Monitor Full HD 1920x1080', 1, 'unit', 
        '2024-02-01', 2200000, 6, 0, 183333, 2016667, 
        'Monitor untuk workstation karyawan', 'Ruang IT', 'Tender', 
        category_elektronik, location_default, 'baik', bulk_uuid_monitors, 4, false, 5, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'MONITOR005', 'Monitor LED Samsung', 
        'Samsung 24 inch LED Monitor Full HD 1920x1080', 1, 'unit', 
        '2024-02-01', 2200000, 6, 0, 183333, 2016667, 
        'Monitor untuk workstation karyawan', 'Ruang Direktur', 'Tender', 
        category_elektronik, location_default, 'tidak_memadai', bulk_uuid_monitors, 5, false, 5, NOW(), NOW()
    );
END $$;

-- Insert Bulk Assets Set 3: Office Chairs (8 units)
DO $$
DECLARE
    bulk_uuid_chairs UUID := gen_random_uuid();
    category_furniture UUID;
    location_default UUID;
BEGIN
    -- Get category and location IDs
    SELECT id INTO category_furniture FROM asset_categories WHERE name = 'Furniture' LIMIT 1;
    SELECT id INTO location_default FROM locations LIMIT 1;
    
    -- Insert bulk assets for Office Chairs
    INSERT INTO assets (
        id, kode, nama, spesifikasi, quantity, satuan, tanggal_perolehan, 
        harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan, 
        akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan, 
        category_id, lokasi_id, status, bulk_id, bulk_sequence, 
        is_bulk_parent, bulk_total_count, created_at, updated_at
    ) VALUES 
    -- Chair 1 (Bulk Parent)
    (
        gen_random_uuid(), 'CHAIR002', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang Administrasi', 'Pembelian', 
        category_furniture, location_default, 'baik', bulk_uuid_chairs, 1, true, 8, NOW(), NOW()
    ),
    
    -- Chairs 2-8 (Bulk Children)
    (
        gen_random_uuid(), 'CHAIR003', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang Administrasi', 'Pembelian', 
        category_furniture, location_default, 'baik', bulk_uuid_chairs, 2, false, 8, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'CHAIR004', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang Administrasi', 'Pembelian', 
        category_furniture, location_default, 'baik', bulk_uuid_chairs, 3, false, 8, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'CHAIR005', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang Administrasi', 'Pembelian', 
        category_furniture, location_default, 'rusak', bulk_uuid_chairs, 4, false, 8, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'CHAIR006', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang IT', 'Pembelian', 
        category_furniture, location_default, 'baik', bulk_uuid_chairs, 5, false, 8, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'CHAIR007', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang IT', 'Pembelian', 
        category_furniture, location_default, 'baik', bulk_uuid_chairs, 6, false, 8, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'CHAIR008', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang Rapat', 'Pembelian', 
        category_furniture, location_default, 'baik', bulk_uuid_chairs, 7, false, 8, NOW(), NOW()
    ),
    (
        gen_random_uuid(), 'CHAIR009', 'Kursi Kantor Staff', 
        'Kursi kantor dengan sandaran punggung dan lengan', 1, 'unit', 
        '2023-07-15', 1200000, 7, 0, 171429, 1028571, 
        'Kursi untuk staff administrasi', 'Ruang Rapat', 'Pembelian', 
        category_furniture, location_default, 'baik', bulk_uuid_chairs, 8, false, 8, NOW(), NOW()
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
    bulk_sequence,
    CASE 
        WHEN is_bulk_parent = true THEN 'Bulk Parent'
        WHEN bulk_id IS NOT NULL THEN 'Bulk Child'
        ELSE 'Single Asset'
    END AS asset_type
FROM assets 
WHERE kode IN (
    'PROJ001', 'SCAN001', 'SAFE001', 'WIFI001', 'DISP001', 'WHIT001', 'UPS001',
    'PRINTER001', 'AC001', 'CCTV001', 'DESK001', 'CHAIR001', 'SERVER001', 'SWITCH001',
    'PHONE001', 'PHONE002', 'PHONE003',
    'MONITOR001', 'MONITOR002', 'MONITOR003', 'MONITOR004', 'MONITOR005',
    'CHAIR002', 'CHAIR003', 'CHAIR004', 'CHAIR005', 'CHAIR006', 'CHAIR007', 'CHAIR008', 'CHAIR009'
)
ORDER BY kode;

-- Show summary statistics
SELECT 
    'Total Individual Assets' as metric,
    COUNT(*) as count,
    TO_CHAR(SUM(harga_perolehan), 'FM999,999,999,999') as total_value
FROM assets 
WHERE kode IN (
    'PROJ001', 'SCAN001', 'SAFE001', 'WIFI001', 'DISP001', 'WHIT001', 'UPS001',
    'PRINTER001', 'AC001', 'CCTV001', 'DESK001', 'CHAIR001', 'SERVER001', 'SWITCH001',
    'PHONE001', 'PHONE002', 'PHONE003',
    'MONITOR001', 'MONITOR002', 'MONITOR003', 'MONITOR004', 'MONITOR005',
    'CHAIR002', 'CHAIR003', 'CHAIR004', 'CHAIR005', 'CHAIR006', 'CHAIR007', 'CHAIR008', 'CHAIR009'
)

UNION ALL

SELECT 
    'Single Assets Only' as metric,
    COUNT(*) as count,
    TO_CHAR(SUM(harga_perolehan), 'FM999,999,999,999') as total_value
FROM assets 
WHERE kode IN (
    'PROJ001', 'SCAN001', 'SAFE001', 'WIFI001', 'DISP001', 'WHIT001', 'UPS001',
    'PRINTER001', 'AC001', 'CCTV001', 'DESK001', 'CHAIR001', 'SERVER001', 'SWITCH001'
)

UNION ALL

SELECT 
    'Bulk Assets Only' as metric,
    COUNT(*) as count,
    TO_CHAR(SUM(harga_perolehan), 'FM999,999,999,999') as total_value
FROM assets 
WHERE kode IN (
    'PHONE001', 'PHONE002', 'PHONE003',
    'MONITOR001', 'MONITOR002', 'MONITOR003', 'MONITOR004', 'MONITOR005',
    'CHAIR002', 'CHAIR003', 'CHAIR004', 'CHAIR005', 'CHAIR006', 'CHAIR007', 'CHAIR008', 'CHAIR009'
);

-- Show bulk asset groups
SELECT 
    CASE 
        WHEN kode LIKE 'PHONE%' THEN 'IP Phones'
        WHEN kode LIKE 'MONITOR%' THEN 'LED Monitors'
        WHEN kode LIKE 'CHAIR00[2-9]%' THEN 'Office Chairs'
        ELSE 'Other'
    END as bulk_group,
    COUNT(*) as units_count,
    SUM(harga_perolehan) as total_value,
    MAX(bulk_total_count) as declared_bulk_count
FROM assets 
WHERE bulk_id IS NOT NULL
GROUP BY 
    CASE 
        WHEN kode LIKE 'PHONE%' THEN 'IP Phones'
        WHEN kode LIKE 'MONITOR%' THEN 'LED Monitors'
        WHEN kode LIKE 'CHAIR00[2-9]%' THEN 'Office Chairs'
        ELSE 'Other'
    END
ORDER BY bulk_group;
