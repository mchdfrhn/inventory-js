# 🔄 PERBAIKAN BULK ASSET UPDATE

## 📝 Masalah yang Diperbaiki
Saat mengubah asset bulk (bulk parent), perubahan hanya diterapkan ke asset parent saja, tidak ke semua asset di dalam bulk tersebut.

## 🔧 Solusi yang Diterapkan

### 1. **Peningkatan Fungsi `updateBulkAssetsCodes`**
**File:** `backend/internal/usecase/asset_usecase.go`

Fungsi ini diperluas untuk mengupdate SEMUA field yang relevan, bukan hanya field struktural (lokasi, kategori, asal pengadaan):

```go
// Update semua field dari template asset
updatedAsset.Nama = templateAsset.Nama
updatedAsset.Spesifikasi = templateAsset.Spesifikasi
updatedAsset.Satuan = templateAsset.Satuan
updatedAsset.TanggalPerolehan = templateAsset.TanggalPerolehan
updatedAsset.HargaPerolehan = templateAsset.HargaPerolehan
updatedAsset.UmurEkonomisTahun = templateAsset.UmurEkonomisTahun
updatedAsset.Keterangan = templateAsset.Keterangan
updatedAsset.Lokasi = templateAsset.Lokasi
updatedAsset.LokasiID = templateAsset.LokasiID
updatedAsset.AsalPengadaan = templateAsset.AsalPengadaan
updatedAsset.CategoryID = templateAsset.CategoryID
updatedAsset.Status = templateAsset.Status
```

### 2. **Fungsi Baru `updateBulkAssetsData`**
**File:** `backend/internal/usecase/asset_usecase.go`

Fungsi baru untuk mengupdate data bulk assets tanpa regenerasi kode (untuk kasus dimana hanya data berubah, bukan struktur):

```go
func (u *assetUsecase) updateBulkAssetsData(bulkID *uuid.UUID, templateAsset *domain.Asset) error {
    // Mengupdate semua asset dalam bulk dengan data baru
    // tanpa mengubah kode asset (preserving existing codes)
}
```

### 3. **Peningkatan Logika Update Asset**
**File:** `backend/internal/usecase/asset_usecase.go`

Menambahkan kondisi untuk mengupdate bulk assets meskipun tidak ada perubahan struktural:

```go
} else {
    // Even if no code regeneration is needed, if this is a bulk parent,
    // we still need to update all bulk assets with the new data
    if existingAsset.BulkID != nil && existingAsset.IsBulkParent {
        err = u.updateBulkAssetsData(existingAsset.BulkID, asset)
        if err != nil {
            return err
        }
    }
}
```

### 4. **Peningkatan User Experience di Frontend**
**File:** `frontend/src/pages/AssetForm.tsx`

#### a) Warning Indicator untuk Bulk Asset:
```tsx
{/* Info untuk bulk asset edit mode */}
{isEditMode && assetData?.data?.is_bulk_parent && (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-center">
    <InformationCircleIcon className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" />
    <div>
      <span className="font-medium">📦 Bulk Asset: Perubahan akan diterapkan ke semua {assetData.data.bulk_total_count || 1} item dalam bulk ini</span>
      <p className="text-sm text-amber-700 mt-1">
        Saat Anda menyimpan perubahan, semua asset dalam grup bulk ini akan diperbarui dengan data yang sama.
      </p>
    </div>
  </div>
)}
```

#### b) Enhanced Success Notification:
```tsx
const message = isBulkAsset 
  ? `Bulk aset berhasil diperbarui! ${bulkCount} item telah diupdate.`
  : 'Aset berhasil diperbarui!';
```
**File:** `backend/internal/usecase/asset_usecase.go`

Menambahkan kondisi untuk mengupdate bulk assets meskipun tidak ada perubahan struktural:

```go
} else {
    // Even if no code regeneration is needed, if this is a bulk parent,
    // we still need to update all bulk assets with the new data
    if existingAsset.BulkID != nil && existingAsset.IsBulkParent {
        err = u.updateBulkAssetsData(existingAsset.BulkID, asset)
        if err != nil {
            return err
        }
    }
}
```

## 🎯 Field yang Akan Diupdate di Semua Asset Bulk

Ketika bulk parent diubah, field berikut akan diterapkan ke SEMUA asset dalam bulk:

✅ **Nama Asset** - Nama akan sama untuk semua item dalam bulk
✅ **Spesifikasi** - Spesifikasi akan sama untuk semua item
✅ **Satuan** - Unit pengukuran yang sama
✅ **Tanggal Perolehan** - Tanggal yang sama untuk seluruh bulk
✅ **Harga Perolehan** - Harga per unit yang sama
✅ **Umur Ekonomis (Tahun)** - Umur ekonomis yang sama
✅ **Keterangan** - Keterangan yang sama
✅ **Lokasi** - Lokasi yang sama untuk semua item
✅ **Lokasi ID** - ID lokasi yang sama
✅ **Asal Pengadaan** - Sumber pengadaan yang sama
✅ **Kategori ID** - Kategori yang sama
✅ **Status** - Status yang sama (baik/rusak/tidak_memadai)

## 🔒 Field yang Dipertahankan

Field berikut akan tetap unik untuk setiap asset dalam bulk:

🔐 **Kode Asset** - Tetap unik dengan sequence number yang berbeda
🔐 **Quantity** - Dipertahankan sesuai asset individu
🔐 **Bulk ID** - Dipertahankan untuk menjaga struktur bulk
🔐 **Bulk Sequence** - Nomor urut dalam bulk dipertahankan
🔐 **Is Bulk Parent** - Status parent/child dipertahankan
🔐 **Bulk Total Count** - Jumlah total dalam bulk dipertahankan

## 📊 Field yang Dihitung Otomatis

Field berikut akan dihitung ulang oleh sistem untuk setiap asset:

⚙️ **Umur Ekonomis (Bulan)** - Dihitung dari tahun × 12
⚙️ **Akumulasi Penyusutan** - Dihitung berdasarkan umur dan tanggal perolehan
⚙️ **Nilai Sisa** - Dihitung dari harga - akumulasi penyusutan

## 🚀 Cara Kerja

### Skenario 1: Perubahan Struktural
Ketika ada perubahan pada lokasi, kategori, asal pengadaan, atau tahun perolehan:
1. Regenerasi kode asset dengan sequence yang dipertahankan
2. Update semua asset dalam bulk dengan `updateBulkAssetsCodes`
3. Semua field data juga ikut terupdate

### Skenario 2: Perubahan Data Saja
Ketika hanya ada perubahan pada nama, spesifikasi, harga, dll:
1. Kode asset tidak berubah
2. Update semua asset dalam bulk dengan `updateBulkAssetsData`
3. Semua field data terupdate ke seluruh bulk

## 🧪 Testing

### Test Case 1: Update Nama Asset Bulk
1. Buka asset bulk parent di form edit
2. Ubah nama asset
3. Simpan perubahan
4. **Verify**: Semua asset dalam bulk memiliki nama yang sama

### Test Case 2: Update Lokasi Asset Bulk
1. Buka asset bulk parent di form edit
2. Ubah lokasi asset
3. Simpan perubahan
4. **Verify**: Semua asset dalam bulk memiliki lokasi yang sama
5. **Verify**: Kode asset berubah mencerminkan lokasi baru

### Test Case 3: Update Harga Perolehan
1. Buka asset bulk parent di form edit
2. Ubah harga perolehan
3. Simpan perubahan
4. **Verify**: Semua asset dalam bulk memiliki harga yang sama
5. **Verify**: Nilai penyusutan dan nilai sisa dihitung ulang

### Test Case 4: UI Feedback untuk Bulk Asset
1. Buka asset bulk parent di form edit
2. **Verify**: Ada warning kuning yang menunjukkan bahwa ini adalah bulk asset
3. **Verify**: Warning menampilkan jumlah item yang akan terpengaruh
4. Lakukan perubahan dan simpan
5. **Verify**: Notifikasi sukses menunjukkan jumlah item yang telah diupdate

### Test Case 5: Regular Asset vs Bulk Asset
1. Edit asset regular (non-bulk)
2. **Verify**: Tidak ada warning bulk asset
3. **Verify**: Notifikasi sukses standar
4. Edit asset bulk parent
5. **Verify**: Warning bulk asset muncul
6. **Verify**: Notifikasi sukses menyebutkan jumlah bulk item
1. Buka asset bulk parent di form edit
2. Ubah harga perolehan
3. Simpan perubahan
4. **Verify**: Semua asset dalam bulk memiliki harga yang sama
5. **Verify**: Nilai penyusutan dan nilai sisa dihitung ulang

## 📁 Files Modified

1. ✅ `backend/internal/usecase/asset_usecase.go`
   - Enhanced `updateBulkAssetsCodes` function
   - Added `updateBulkAssetsData` function  
   - Enhanced `UpdateAsset` logic
   
2. ✅ `frontend/src/pages/AssetForm.tsx`
   - Added bulk asset update warning notification
   - Enhanced success message to differentiate bulk vs single asset update
   - Added visual indicator for bulk asset editing

## 🎉 Result

**✅ FIXED**: Sekarang ketika bulk asset diubah, perubahan akan diterapkan ke SEMUA asset dalam bulk tersebut, bukan hanya parent asset saja!

**User Experience:**
- User hanya perlu edit 1 asset (bulk parent)
- Sistem otomatis menerapkan perubahan ke seluruh bulk
- Konsistensi data terjaga di seluruh bulk
- Proses update lebih efisien dan user-friendly
