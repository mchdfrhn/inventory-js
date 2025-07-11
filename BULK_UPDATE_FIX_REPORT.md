# BULK UPDATE FIX REPORT

## 🔧 Masalah yang Diperbaiki

### **Deskripsi Masalah**
Saat menggunakan tombol "Ubah Semua" pada bulk asset, sistem hanya mengubah asset dengan ID tertentu saja, bukan semua asset dalam bulk tersebut.

### **Penyebab Masalah**
Frontend menggunakan endpoint regular `/assets/:id` (PUT) untuk semua jenis update asset, termasuk bulk assets. Ini menyebabkan hanya satu asset yang diupdate, bukan seluruh bulk.

### **Detail Penyebab Teknis**
1. **Frontend API**: Function `assetApi.update()` mengirim request ke `/assets/:id`
2. **Backend Route**: Endpoint `/assets/:id` hanya mengupdate satu asset berdasarkan ID
3. **Missing Logic**: Tidak ada pengecekan apakah asset yang diupdate adalah bulk asset atau tidak

## 🛠️ Solusi yang Diterapkan

### **1. Menambahkan Function API Baru**
**File**: `frontend/src/services/api.ts`
```typescript
updateBulk: async (bulkId: string, asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put<SingleResourceResponse<Asset[]>>(`/assets/bulk/${bulkId}`, asset);
  return response.data;
},
```

### **2. Menambahkan Mutation Baru untuk Bulk Update**
**File**: `frontend/src/pages/AssetForm.tsx`
```typescript
// Update bulk asset mutation
const updateBulkMutation = useMutation({
  mutationFn: (data: { bulkId: string; asset: AssetFormData }) => {
    return assetApi.updateBulk(data.bulkId, data.asset as unknown as Omit<Asset, 'id' | 'created_at' | 'updated_at'>);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    const bulkCount = assetData?.data?.bulk_total_count || 1;
    const message = `Bulk aset berhasil diperbarui! ${bulkCount} unit telah diupdate.`;
    addNotification('success', message);
    navigate('/assets');
  },
  // ... error handling
});
```

### **3. Mengubah Logika Submit**
**File**: `frontend/src/pages/AssetForm.tsx`
```typescript
if (isEditMode) {
  // Check if this is a bulk asset
  const isBulkAsset = assetData?.data?.is_bulk_parent;
  const bulkId = assetData?.data?.bulk_id;
  
  if (isBulkAsset && bulkId) {
    // Use bulk update for bulk assets
    updateBulkMutation.mutate({ bulkId, asset: finalDataToSubmit as AssetFormData });
  } else {
    // Use regular update for individual assets
    updateMutation.mutate({ id: id as string, asset: finalDataToSubmit as AssetFormData });
  }
}
```

## 🚀 Backend yang Sudah Tersedia

### **Endpoint yang Sudah Ada**
Backend sudah memiliki endpoint yang diperlukan:

1. **Route**: `PUT /assets/bulk/:bulk_id`
2. **Controller**: `AssetController.updateBulkAssets()`
3. **Use Case**: `AssetUseCase.updateBulkAssets()`
4. **Repository**: `AssetRepository.updateBulkAssets()`

### **Logika Backend**
- Mengupdate semua asset dengan `bulk_id` yang sama
- Recalculate depreciation untuk setiap asset
- Audit logging untuk setiap perubahan
- Validation dan error handling

## ✅ Hasil Perbaikan

### **Sebelum**
- Tombol "Ubah Semua" hanya mengupdate 1 asset
- Menggunakan endpoint `/assets/:id` 
- Asset lain dalam bulk tetap tidak berubah

### **Sesudah**
- Tombol "Ubah Semua" mengupdate semua asset dalam bulk
- Menggunakan endpoint `/assets/bulk/:bulk_id`
- Semua asset dalam bulk diupdate secara bersamaan
- Success message menunjukkan jumlah asset yang diupdate

## 🧪 Testing

### **Cara Test**
1. Buka halaman Assets
2. Pilih bulk asset (yang memiliki ikon 📦 dan teks "3 unit")
3. Klik tombol "Ubah Semua" 
4. Ubah data (nama, spesifikasi, harga, lokasi, dll)
5. Simpan perubahan
6. Verifikasi bahwa semua asset dalam bulk telah terupdate

### **Expected Result**
- Success notification: "Bulk aset berhasil diperbarui! X unit telah diupdate."
- Semua asset dalam bulk memiliki data yang sama sesuai perubahan
- Kode asset tetap unik (tidak berubah)
- Audit log tercatat untuk setiap asset

## 🔍 Verifikasi

### **Cek Database**
```sql
-- Lihat semua asset dalam bulk tertentu
SELECT kode, nama, spesifikasi, harga_perolehan, lokasi, bulk_id 
FROM assets 
WHERE bulk_id = 'bulk-id-here'
ORDER BY bulk_sequence;
```

### **Cek Audit Log**
```sql
-- Lihat audit log untuk bulk update
SELECT * FROM audit_logs 
WHERE table_name = 'asset' 
AND action = 'update' 
AND metadata->>'update_type' = 'bulk_update'
ORDER BY created_at DESC;
```

## 📝 Notes

- Perbaikan ini backward compatible
- Asset individual tetap menggunakan endpoint lama
- Bulk asset otomatis menggunakan endpoint baru
- Error handling sudah diimplementasi untuk kedua scenario
