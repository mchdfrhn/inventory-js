-- Migration: 005_insert_demo_assets.sql
-- Insert demo assets data with proper auto-generated codes

-- Insert demo assets following the automatic code generation pattern
-- Format: {location_code}.{category_code}.{procurement_code}.{year}.{sequence}
-- Procurement codes: 1=Pembelian, 2=Bantuan, 3=Hibah, 4=Sumbangan, 5=Produksi_sendiri

INSERT INTO assets (
  id, kode, nama, spesifikasi, quantity, satuan, tanggal_perolehan, harga_perolehan,
  umur_ekonomis_tahun, umur_ekonomis_bulan, akumulasi_penyusutan, nilai_sisa,
  keterangan, lokasi, lokasi_id, asal_pengadaan, category_id, status
) VALUES
  -- Proyektor - Ruang Rapat (004), Elektronik (20), Pembelian (1), 2023 (23), Seq 001
  (
    uuid_generate_v4(), '004.20.1.23.001', 'Proyektor Epson EB-X41',
    'Proyektor LCD 3600 lumens, resolusi XGA', 1, 'unit',
    '2023-04-21', 7500000, 6, 0, 1875000, 750000,
    'Proyektor untuk presentasi ruang rapat', 'Ruang Rapat',
    (SELECT id FROM locations WHERE code = '004'), 'pembelian',
    (SELECT id FROM asset_categories WHERE code = '20'), 'baik'
  ),
  -- Scanner - Ruang Administrasi (002), Elektronik (20), Bantuan (2), 2022 (22), Seq 002
  (
    uuid_generate_v4(), '002.20.2.22.002', 'Scanner Canon CanoScan',
    'Scanner dokumen A4 dengan resolusi 4800x4800 dpi', 1, 'unit',
    '2022-12-23', 2500000, 5, 0, 1250000, 250000,
    'Scanner untuk digitalisasi dokumen', 'Ruang Administrasi',
    (SELECT id FROM locations WHERE code = '002'), 'bantuan',
    (SELECT id FROM asset_categories WHERE code = '20'), 'rusak'
  ),
  -- Brankas - Ruang Direktur (001), Furniture (10), Hibah (3), 2021 (21), Seq 003
  (
    uuid_generate_v4(), '001.10.3.21.003', 'Brankas Besi Tahan Api',
    'Brankas ukuran 60x45x40cm dengan kunci kombinasi', 1, 'unit',
    '2021-01-24', 8000000, 15, 0, 1866667, 800000,
    'Brankas untuk menyimpan dokumen penting', 'Ruang Direktur',
    (SELECT id FROM locations WHERE code = '001'), 'hibah',
    (SELECT id FROM asset_categories WHERE code = '10'), 'baik'
  ),
  -- Access Point - Ruang IT (003), Elektronik (20), Pembelian (1), 2023 (23), Seq 004
  (
    uuid_generate_v4(), '003.20.1.23.004', 'Access Point TP-Link',
    'TP-Link EAP245 AC1750 Wireless Gigabit', 1, 'unit',
    '2023-11-24', 1200000, 4, 0, 200000, 120000,
    'Access point untuk koneksi wireless', 'Ruang IT',
    (SELECT id FROM locations WHERE code = '003'), 'pembelian',
    (SELECT id FROM asset_categories WHERE code = '20'), 'tidak_memadai'
  ),
  -- Dispenser - Ruang Finance (005), Elektronik (20), Pembelian (1), 2022 (22), Seq 005
  (
    uuid_generate_v4(), '005.20.1.22.005', 'Dispenser Air Minum',
    'Dispenser dengan fitur panas dan dingin', 1, 'unit',
    '2022-07-24', 1500000, 8, 0, 468750, 150000,
    'Dispenser untuk ruang finance', 'Ruang Finance',
    (SELECT id FROM locations WHERE code = '005'), 'pembelian',
    (SELECT id FROM asset_categories WHERE code = '20'), 'baik'
  ),
  -- Whiteboard - Ruang Rapat (004), Alat Tulis (40), Bantuan (2), 2024 (24), Seq 006
  (
    uuid_generate_v4(), '004.40.2.24.006', 'Whiteboard Magnetic',
    'Whiteboard ukuran 120x80cm dengan frame aluminium', 1, 'unit',
    '2024-01-24', 750000, 10, 0, 37500, 75000,
    'Whiteboard untuk ruang rapat', 'Ruang Rapat',
    (SELECT id FROM locations WHERE code = '004'), 'bantuan',
    (SELECT id FROM asset_categories WHERE code = '40'), 'baik'
  ),
  -- UPS - Ruang IT (003), Elektronik (20), Hibah (3), 2023 (23), Seq 007
  (
    uuid_generate_v4(), '003.20.3.23.007', 'UPS APC Smart-UPS',
    'APC Smart-UPS 1500VA dengan battery backup', 1, 'unit',
    '2023-05-24', 3500000, 6, 0, 680556, 350000,
    'UPS untuk backup power server', 'Ruang IT',
    (SELECT id FROM locations WHERE code = '003'), 'hibah',
    (SELECT id FROM asset_categories WHERE code = '20'), 'baik'
  )
ON CONFLICT (kode) DO NOTHING;

-- Insert bulk assets (Phone sets with same bulk_id)
-- Format: Location.Category.Procurement.Year.Sequence
DO $$
DECLARE
    bulk_uuid UUID := uuid_generate_v4();
BEGIN
    INSERT INTO assets (
      id, kode, nama, spesifikasi, quantity, satuan, tanggal_perolehan, harga_perolehan,
      umur_ekonomis_tahun, umur_ekonomis_bulan, akumulasi_penyusutan, nilai_sisa,
      keterangan, lokasi, lokasi_id, asal_pengadaan, category_id, status,
      bulk_id, bulk_sequence, is_bulk_parent, bulk_total_count
    ) VALUES
      -- Phone 1 (Parent) - Ruang Direktur (001), Elektronik (20), Pembelian (1), 2023 (23), Seq 008
      (
        uuid_generate_v4(), '001.20.1.23.008', 'Telepon IP Yealink',
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit',
        '2023-09-24', 1800000, 5, 0, 300000, 180000,
        'Telepon IP untuk komunikasi kantor', 'Ruang Direktur',
        (SELECT id FROM locations WHERE code = '001'), 'pembelian',
        (SELECT id FROM asset_categories WHERE code = '20'), 'baik',
        bulk_uuid, 1, true, 3
      ),
      -- Phone 2 - Ruang Administrasi (002), Elektronik (20), Pembelian (1), 2023 (23), Seq 009
      (
        uuid_generate_v4(), '002.20.1.23.009', 'Telepon IP Yealink',
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit',
        '2023-09-24', 1800000, 5, 0, 300000, 180000,
        'Telepon IP untuk komunikasi kantor', 'Ruang Administrasi',
        (SELECT id FROM locations WHERE code = '002'), 'pembelian',
        (SELECT id FROM asset_categories WHERE code = '20'), 'baik',
        bulk_uuid, 2, false, 3
      ),
      -- Phone 3 - Ruang IT (003), Elektronik (20), Pembelian (1), 2023 (23), Seq 010
      (
        uuid_generate_v4(), '003.20.1.23.010', 'Telepon IP Yealink',
        'Yealink T46G IP Phone dengan LCD display', 1, 'unit',
        '2023-09-24', 1800000, 5, 0, 300000, 180000,
        'Telepon IP untuk komunikasi kantor', 'Ruang IT',
        (SELECT id FROM locations WHERE code = '003'), 'pembelian',
        (SELECT id FROM asset_categories WHERE code = '20'), 'rusak',
        bulk_uuid, 3, false, 3
      )
    ON CONFLICT (kode) DO NOTHING;
END $$;

-- Add comment
COMMENT ON TABLE assets IS 'Assets table with demo data using proper auto-generated codes';
