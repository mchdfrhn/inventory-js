# Fitur Update Asset Bulk

## Overview
Fitur ini memastikan bahwa ketika melakukan update pada asset yang merupakan bagian dari bulk, seluruh asset dalam bulk tersebut akan diupdate dengan data yang sama.

## Implementasi

### 1. Domain Layer
- Menambahkan method `UpdateBulkAssets(bulkID uuid.UUID, assetData *Asset) error` di interface `AssetUsecase` dan `AssetRepository`

### 2. Repository Layer
- Implementasi `UpdateBulkAssets` di `asset_repository.go`
- Method ini akan mengupdate semua asset dengan `bulk_id` yang sama
- Mempertahankan field unik seperti `kode`, `bulk_sequence`, dan `id`
- Mengupdate field yang dapat diubah seperti nama, spesifikasi, harga, dll.

### 3. Usecase Layer  
- Implementasi `UpdateBulkAssets` di `asset_usecase.go`
- Menambahkan audit logging untuk setiap asset yang diupdate dalam bulk
- Menyimpan metadata khusus untuk bulk update

### 4. Handler Layer
- Modifikasi `UpdateAsset` untuk mendeteksi jika asset adalah bagian dari bulk
- Jika asset memiliki `BulkID`, maka akan mengupdate seluruh bulk
- Menambahkan endpoint baru `PUT /api/v1/assets/bulk/:bulk_id` untuk update bulk langsung
- Response memberikan informasi berapa banyak asset yang diupdate

## API Endpoints

### Update Asset Individual/Bulk (Existing)
```
PUT /api/v1/assets/:id
```
- Jika asset dengan ID tersebut adalah bagian dari bulk, maka seluruh bulk akan diupdate
- Response akan menunjukkan berapa banyak asset yang diupdate

### Update Bulk Assets (New)
```
PUT /api/v1/assets/bulk/:bulk_id
```
- Langsung mengupdate semua asset dalam bulk berdasarkan bulk_id
- Lebih eksplisit untuk frontend yang ingin melakukan bulk update

## Request Body
```json
{
  "nama": "Nama Asset Baru",
  "spesifikasi": "Spesifikasi baru",
  "quantity": 1,
  "satuan": "unit",
  "tanggal_perolehan": "2024-01-01",
  "harga_perolehan": 1000000,
  "umur_ekonomis_tahun": 5,
  "keterangan": "Keterangan baru",
  "lokasi_id": 1,
  "asal_pengadaan": "Pengadaan Baru",
  "category_id": "uuid-category",
  "status": "baik"
}
```

## Response
```json
{
  "status": "success",
  "message": "Bulk asset berhasil diperbarui! 5 unit telah diupdate.",
  "data": {
    "asset": { /* asset data */ },
    "is_bulk": true,
    "update_count": 5
  }
}
```

## Audit Log
- Setiap asset dalam bulk yang diupdate akan memiliki audit log sendiri
- Metadata audit log menyertakan informasi bulk:
  - `bulk_id`: ID bulk
  - `bulk_sequence`: Urutan dalam bulk  
  - `is_bulk_parent`: Apakah asset ini parent bulk
  - `update_type`: "bulk_update"

## Keuntungan
1. **Konsistensi Data**: Semua asset dalam bulk memiliki data yang sama
2. **Efisiensi**: Update banyak asset dalam sekali aksi
3. **Audit Trail**: Setiap perubahan tercatat dengan jelas
4. **Fleksibilitas**: Mendukung update individual dan bulk
5. **User Experience**: Frontend dapat memberikan feedback yang tepat

## Catatan Penting
- Field yang tetap unik per asset: `id`, `kode`, `bulk_sequence`
- Field yang diupdate untuk semua: nama, spesifikasi, harga, kategori, lokasi, dll.
- Quantity selalu diset ke 1 untuk setiap asset dalam bulk
- Perhitungan penyusutan dan nilai sisa dihitung ulang untuk setiap asset
