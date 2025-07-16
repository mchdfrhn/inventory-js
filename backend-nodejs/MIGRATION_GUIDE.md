# Database Migration dengan Node-PG-Migrate

Dokumentasi untuk sistem migrasi database menggunakan node-pg-migrate pada proyek STTPU Inventory Management System.

## Fitur Utama

✅ **Migrasi Terstruktur** - Menggunakan node-pg-migrate untuk manajemen skema database yang terorganisir
✅ **Rollback Support** - Mendukung rollback migrasi jika diperlukan
✅ **Migration Tracking** - Melacak migrasi yang sudah dijalankan
✅ **Cross-platform Scripts** - Mendukung Windows (.bat) dan Linux/Mac (.sh)
✅ **Error Handling** - Penanganan error yang komprehensif
✅ **Logging** - Logging yang detail untuk monitoring

## Struktur Migrasi

```
backend-nodejs/
├── migrations/                           # Folder migrasi SQL
│   ├── 001_create_asset_categories.sql  # Membuat tabel kategori aset
│   ├── 002_create_locations.sql         # Membuat tabel lokasi
│   ├── 003_create_assets.sql            # Membuat tabel aset utama
│   ├── 004_create_audit_logs.sql        # Membuat tabel audit log
│   └── 005_update_status_constraint.sql # Update constraint status
├── src/database/
│   ├── PgMigrationManager.js            # Manager migrasi utama
│   ├── migrate-cli.js                   # CLI untuk migrasi
│   └── migrate.js                       # Wrapper untuk compatibility
├── .pgmigraterc.js                      # Konfigurasi node-pg-migrate
├── migrate.sh                           # Script untuk Linux/Mac
└── migrate.bat                          # Script untuk Windows
```

## Cara Penggunaan

### 1. Install Dependencies

```bash
cd backend-nodejs
npm install
```

### 2. Setup Environment

Pastikan file `.env` sudah dikonfigurasi dengan benar:

```bash
# Database Configuration
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=inventaris
DB_SSL=false

# Migration URL (for node-pg-migrate)
DATABASE_URL=postgres://postgres:123@localhost:5432/inventaris
```

### 3. Jalankan Migrasi

#### Menggunakan NPM Scripts:

```bash
# Jalankan semua migrasi yang pending
npm run migrate

# Lihat status migrasi
npm run migrate:status

# Buat migrasi baru
npm run migrate:create nama_migrasi

# Jalankan migrasi menggunakan node-pg-migrate langsung
npm run migrate:pg

# Rollback migrasi terakhir
npm run migrate:pg:down
```

#### Menggunakan Script Helper:

**Linux/Mac:**
```bash
# Beri permission executable
chmod +x migrate.sh

# Jalankan migrasi
./migrate.sh up

# Lihat status
./migrate.sh status

# Setup lengkap (migrasi + seed)
./migrate.sh setup
```

**Windows:**
```bash
# Jalankan migrasi
migrate.bat up

# Lihat status
migrate.bat status

# Setup lengkap
migrate.bat setup
```

### 4. Seed Database (Opsional)

```bash
npm run seed
```

## Struktur Database

### 1. Asset Categories (`asset_categories`)
- **id**: UUID primary key
- **code**: Kode kategori (unique)
- **name**: Nama kategori (unique)
- **description**: Deskripsi kategori
- **created_at/updated_at**: Timestamp

**Data Default:**
- FURNITUR - Furniture
- ELEKTRONIK - Elektronik
- KENDARAAN - Kendaraan
- ALAT_TULIS - Alat Tulis
- BANGUNAN - Bangunan

### 2. Locations (`locations`)
- **id**: Serial primary key
- **name**: Nama lokasi (unique)
- **code**: Kode lokasi (unique)
- **description**: Deskripsi lokasi
- **building**: Nama gedung
- **floor**: Lantai
- **room**: Ruangan
- **created_at/updated_at**: Timestamp

**Data Default:**
- Ruang Direktur (RD001)
- Ruang Administrasi (RA001)
- Ruang IT (RIT001)
- Ruang Rapat (RR001)
- Ruang Finance (RF001)
- Gudang (GD001)

### 3. Assets (`assets`)
- **id**: UUID primary key
- **kode**: Kode aset (unique)
- **nama**: Nama aset
- **spesifikasi**: Spesifikasi detail
- **quantity**: Jumlah barang
- **satuan**: Satuan ukuran
- **tanggal_perolehan**: Tanggal perolehan
- **harga_perolehan**: Harga saat perolehan
- **umur_ekonomis_tahun/bulan**: Umur ekonomis
- **akumulasi_penyusutan**: Akumulasi penyusutan
- **nilai_sisa**: Nilai sisa
- **keterangan**: Keterangan tambahan
- **lokasi**: Lokasi (string)
- **lokasi_id**: Referensi ke tabel locations
- **asal_pengadaan**: Asal pengadaan
- **category_id**: Referensi ke tabel asset_categories
- **status**: Status aset (baik, rusak, tidak_memadai, maintenance, retired, missing)
- **bulk_id**: ID untuk bulk assets
- **bulk_sequence**: Urutan dalam bulk
- **is_bulk_parent**: Apakah parent dari bulk
- **bulk_total_count**: Total item dalam bulk
- **created_at/updated_at**: Timestamp

### 4. Audit Logs (`audit_logs`)
- **id**: UUID primary key
- **entity_type**: Jenis entitas (asset, category, location)
- **entity_id**: ID entitas yang di-audit
- **action**: Aksi yang dilakukan (create, update, delete)
- **changes**: Perubahan yang terjadi
- **old_values**: Nilai lama
- **new_values**: Nilai baru
- **user_id**: ID user yang melakukan aksi
- **ip_address**: IP address
- **user_agent**: User agent
- **description**: Deskripsi
- **created_at**: Timestamp

## Advanced Usage

### 1. Membuat Migrasi Baru

```bash
# Menggunakan node-pg-migrate
npm run migrate:create add_new_column_to_assets

# File akan dibuat di: migrations/[timestamp]_add_new_column_to_assets.sql
```

### 2. Rollback Migrasi

```bash
# Rollback 1 migrasi terakhir
npm run migrate:pg:down

# Rollback ke migrasi tertentu
npx node-pg-migrate down 20230716000001
```

### 3. Custom Migration Manager

Anda juga bisa menggunakan PgMigrationManager secara langsung:

```javascript
const PgMigrationManager = require('./src/database/PgMigrationManager');

async function customMigration() {
  const manager = new PgMigrationManager();
  
  // Jalankan migrasi pending
  await manager.runPendingMigrations();
  
  // Lihat status
  const status = await manager.getMigrationStatus();
  console.log(status);
}
```

## Troubleshooting

### 1. Connection Issues
- Pastikan PostgreSQL berjalan
- Verifikasi konfigurasi database di `.env`
- Periksa firewall dan network settings

### 2. Migration Conflicts
- Jika ada konflik, periksa log error
- Gunakan `npm run migrate:status` untuk melihat status
- Manual cleanup jika diperlukan

### 3. Permission Issues
```bash
# Linux/Mac
chmod +x migrate.sh

# Windows
# Jalankan sebagai Administrator jika diperlukan
```

## Best Practices

1. **Backup Database** - Selalu backup sebelum menjalankan migrasi di production
2. **Test Migrations** - Test migrasi di development/staging environment dulu
3. **Naming Convention** - Gunakan nama migrasi yang descriptive
4. **Incremental Changes** - Buat perubahan kecil dan incremental
5. **Rollback Plan** - Selalu siapkan plan untuk rollback jika terjadi masalah

## Monitoring

Gunakan logging untuk monitoring:

```bash
# Lihat log aplikasi
tail -f logs/app.log

# Lihat error log
tail -f logs/error.log
```

## Changelog

- **v1.0.0** - Initial setup dengan node-pg-migrate
- Migration tracking dengan pgmigrations table
- Support untuk Windows dan Linux/Mac
- Comprehensive error handling dan logging
