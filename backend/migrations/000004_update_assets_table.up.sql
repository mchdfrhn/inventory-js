-- Menambahkan kolom-kolom baru ke tabel assets
ALTER TABLE assets ADD COLUMN kode VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN nama VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN spesifikasi TEXT;
ALTER TABLE assets ADD COLUMN satuan VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN tanggal_perolehan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE assets ADD COLUMN harga_perolehan DECIMAL(15, 2) NOT NULL DEFAULT 0;
ALTER TABLE assets ADD COLUMN umur_ekonomis_tahun INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assets ADD COLUMN umur_ekonomis_bulan INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assets ADD COLUMN akumulasi_penyusutan DECIMAL(15, 2) NOT NULL DEFAULT 0;
ALTER TABLE assets ADD COLUMN nilai_sisa DECIMAL(15, 2) NOT NULL DEFAULT 0;
ALTER TABLE assets ADD COLUMN keterangan TEXT;
ALTER TABLE assets ADD COLUMN lokasi VARCHAR(255) NOT NULL DEFAULT '';

-- Migrasi data dari struktur lama ke struktur baru
UPDATE assets SET
    kode = 'A-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || id::varchar(8), -- Generasi kode sederhana
    nama = name,
    lokasi = location,
    spesifikasi = description,
    satuan = 'unit';  -- Default satuan

-- Hapus kolom-kolom lama yang tidak digunakan lagi
ALTER TABLE assets DROP COLUMN status;
ALTER TABLE assets DROP COLUMN name;
ALTER TABLE assets DROP COLUMN description;
ALTER TABLE assets DROP COLUMN location;

-- Tambahkan constraint unik untuk kode
ALTER TABLE assets ADD CONSTRAINT uq_assets_kode UNIQUE (kode);

-- Buat index baru
CREATE INDEX idx_assets_tanggal_perolehan ON assets(tanggal_perolehan);
CREATE INDEX idx_assets_harga_perolehan ON assets(harga_perolehan);
CREATE INDEX idx_assets_nilai_sisa ON assets(nilai_sisa);
