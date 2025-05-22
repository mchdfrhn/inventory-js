-- Mengembalikan kolom lama
ALTER TABLE assets ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN description TEXT;
ALTER TABLE assets ADD COLUMN location VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE assets ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'available';

-- Migrasi data dari struktur baru ke struktur lama
UPDATE assets SET
    name = nama,
    description = spesifikasi,
    location = lokasi;

-- Hapus kolom-kolom baru
ALTER TABLE assets DROP CONSTRAINT IF EXISTS uq_assets_kode;
DROP INDEX IF EXISTS idx_assets_tanggal_perolehan;
DROP INDEX IF EXISTS idx_assets_harga_perolehan;
DROP INDEX IF EXISTS idx_assets_nilai_sisa;

ALTER TABLE assets DROP COLUMN IF EXISTS kode;
ALTER TABLE assets DROP COLUMN IF EXISTS nama;
ALTER TABLE assets DROP COLUMN IF EXISTS spesifikasi;
ALTER TABLE assets DROP COLUMN IF EXISTS satuan;
ALTER TABLE assets DROP COLUMN IF EXISTS tanggal_perolehan;
ALTER TABLE assets DROP COLUMN IF EXISTS harga_perolehan;
ALTER TABLE assets DROP COLUMN IF EXISTS umur_ekonomis_tahun;
ALTER TABLE assets DROP COLUMN IF EXISTS umur_ekonomis_bulan;
ALTER TABLE assets DROP COLUMN IF EXISTS akumulasi_penyusutan;
ALTER TABLE assets DROP COLUMN IF EXISTS nilai_sisa;
ALTER TABLE assets DROP COLUMN IF EXISTS keterangan;
ALTER TABLE assets DROP COLUMN IF EXISTS lokasi;
