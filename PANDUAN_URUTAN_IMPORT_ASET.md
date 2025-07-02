# 📋 PANDUAN URUTAN IMPORT ASET

## 🎯 Perubahan yang Dilakukan

Sistem import asset telah diperbaiki untuk memproses data **sesuai urutan di CSV**, bukan lagi memproses bulk asset terlebih dahulu kemudian single asset.

### ✅ Sebelum Perbaikan:
- Semua **bulk asset** (jumlah > 1) diproses terlebih dahulu
- Baru kemudian **single asset** (jumlah = 1) diproses
- Urutan di CSV **tidak dipertahankan**

### ✅ Setelah Perbaikan:
- Asset diproses **satu per satu sesuai urutan baris di CSV**
- Bulk asset dan single asset diproses sesuai posisinya di file
- Urutan input di CSV **100% dipertahankan**

## 📊 Contoh Urutan Import

### File CSV:
```csv
Nama Aset*,Kode Kategori*,Spesifikasi,Tanggal Perolehan*,Jumlah*,Satuan,Harga Perolehan*,Umur Ekonomis,Kode Lokasi*,ID Asal Pengadaan*,Status
Single Asset 1,10,Laptop Dell pertama,2024-01-15,1,Unit,8500000,5,001,Pembelian,Baik
Bulk Kursi Kantor,30,Kursi kantor ergonomis dengan sandaran,2024-01-16,10,Unit,750000,8,002,Pembelian,Baik
Single Asset 2,20,Printer HP LaserJet,2024-01-17,1,Unit,3200000,7,003,Bantuan,Baik
Bulk Laptop Dell,20,Laptop Dell Inspiron 15 Core i5,2024-01-18,10,Unit,8500000,5,001,Pembelian,Baik
Single Asset 3,40,Proyektor Epson,2024-01-19,1,Unit,4800000,8,003,Hibah,Baik
```

### Urutan Eksekusi dan Kode Asset:
1. **Single Asset 1** → Kode: `001.10.1.24.001` (sequence: 001)
2. **Bulk Kursi Kantor (10 unit)** → Kode: `002.30.1.24.002` s/d `002.30.1.24.011` (sequence: 002-011)
3. **Single Asset 2** → Kode: `003.20.2.24.012` (sequence: 012)
4. **Bulk Laptop Dell (10 unit)** → Kode: `001.20.1.24.013` s/d `001.20.1.24.022` (sequence: 013-022)
5. **Single Asset 3** → Kode: `003.40.3.24.023` (sequence: 023)

### Total Asset yang Dibuat: 23 asset dengan sequence berurutan 001-023

## 🔧 Perubahan Teknis

### File yang Dimodifikasi:
1. `backend/internal/delivery/http/asset_handler.go` (fungsi `Import`)
2. `backend/internal/domain/asset.go` (interface `AssetUsecase`)

### Logika Sequence Baru:
```go
// 1. Hitung total asset yang akan dibuat
totalAssetCount := 0
for _, asset := range assets {
    if asset.Quantity > 1 && isEligible {
        totalAssetCount += asset.Quantity // Bulk: quantity sebagai jumlah asset
    } else {
        totalAssetCount += 1 // Single: selalu 1 asset
    }
}

// 2. Reserve sequence range untuk seluruh batch
startSequence, err := h.assetUsecase.GetNextAvailableSequenceRange(totalAssetCount)

// 3. Process assets dengan sequential sequence tracking
currentSequence := startSequence
for _, asset := range assets {
    if bulk {
        CreateBulkAssetWithSequence(&asset, asset.Quantity, currentSequence)
        currentSequence += asset.Quantity // Advance by quantity
    } else {
        CreateAssetWithSequence(&asset, currentSequence)
        currentSequence++ // Advance by 1
    }
}
```

### Method Baru:
- `CreateBulkAssetWithSequence(asset, quantity, startSequence)` - Membuat bulk asset dengan sequence awal yang ditentukan

## ✅ Benefit Perbaikan:

1. **Urutan Konsisten**: Asset dibuat sesuai urutan input di CSV
2. **Predictable**: Hasil import dapat diprediksi sesuai urutan file
3. **User-Friendly**: Urutan yang diinginkan user di CSV akan dipertahankan
4. **Backward Compatible**: Tidak mengubah format CSV atau API response

## 🧪 Testing

Gunakan file `test_import_order.csv` untuk menguji bahwa urutan import sudah benar:
1. Import file tersebut
2. Periksa urutan asset yang dibuat di database
3. Verifikasi bahwa urutan sesuai dengan urutan di CSV

## 📝 Catatan

- Kode asset tetap dibuat otomatis dengan sequence yang tepat
- Bulk asset tetap menggunakan bulk_id yang sama untuk mengelompokkan asset
- Single asset tetap dibuat sebagai asset individual
- Error handling tetap sama seperti sebelumnya
