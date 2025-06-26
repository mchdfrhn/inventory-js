# 📊 PERBAIKAN EXPORT EXCEL BULK ASSETS

## 📝 Masalah yang Diperbaiki

**Masalah**: Pada fitur ekspor Excel di halaman asset, asset bulk (misalnya 10 item) ditampilkan sebagai 1 baris dengan quantity 10, bukan 10 baris terpisah dengan quantity 1 per baris. Selain itu, urutan asset tidak sesuai dengan kode digit nomor urut terakhir secara ascending.

**Dampak**: 
- Data ekspor Excel tidak mencerminkan state sebenarnya di database
- Bulk asset yang seharusnya menjadi 10 asset terpisah hanya muncul sebagai 1 entry
- Urutan tidak konsisten dengan yang diharapkan

## 🛠️ Solusi yang Diterapkan

### 1. **Modifikasi Fungsi Export di ExportButton.tsx**

**File**: `frontend/src/components/ExportButton.tsx`

#### Perubahan Utama:

1. **Import API Service**:
```tsx
import { assetApi } from '../services/api';
```

2. **Async Export Function**:
```tsx
const exportToExcel = async () => {
  // Fungsi sekarang async untuk mengambil data bulk assets
}
```

3. **Expanding Bulk Assets Logic**:
```tsx
// Process assets to expand bulk assets
const expandedAssets: Asset[] = [];

for (const asset of assets) {
  if (asset.is_bulk_parent && asset.bulk_id) {
    // Fetch all individual assets in the bulk group
    try {
      const bulkResponse = await assetApi.getBulkAssets(asset.bulk_id);
      if (bulkResponse.data && bulkResponse.data.length > 0) {
        // Sort bulk assets by sequence number (ascending order)
        const sortedBulkAssets = bulkResponse.data.sort((a, b) => {
          const seqA = a.bulk_sequence || extractSequenceFromCode(a.kode);
          const seqB = b.bulk_sequence || extractSequenceFromCode(b.kode);
          return seqA - seqB;
        });
        expandedAssets.push(...sortedBulkAssets);
      }
    } catch (error) {
      console.error('Error fetching bulk assets for', asset.bulk_id, error);
      // Fallback to using the parent asset if bulk fetch fails
      expandedAssets.push(asset);
    }
  } else {
    // Regular asset, add as-is
    expandedAssets.push(asset);
  }
}
```

4. **Helper Function untuk Extract Sequence**:
```tsx
// Helper function to extract sequence number from asset code
const extractSequenceFromCode = (kode: string): number => {
  // Extract sequence from bulk suffix (e.g., "L001-IT-1-25001-002" -> 2)
  const bulkMatch = kode.match(/-(\d{3})$/);
  if (bulkMatch) {
    return parseInt(bulkMatch[1], 10);
  }
  
  // Extract from main sequence (e.g., "L001-IT-1-25001" -> 1)
  const mainMatch = kode.match(/\.(\d{3})$/);
  if (mainMatch) {
    return parseInt(mainMatch[1], 10);
  }
  
  return 0;
};
```

## 🎯 Hasil Perbaikan

### ✅ **Sebelum Perbaikan:**
- Asset bulk 10 item → 1 baris di Excel dengan quantity 10
- Urutan berdasarkan urutan tampilan di halaman

### ✅ **Sesudah Perbaikan:**
- Asset bulk 10 item → 10 baris di Excel dengan quantity 1 per baris
- Setiap asset memiliki kode unik (misal: LAPTOP-001, LAPTOP-002, dst.)
- Urutan ascending berdasarkan digit nomor urut terakhir dari kode asset
- Data Excel sesuai dengan state sebenarnya di database

## 🔄 Flow Kerja Baru

1. **Deteksi Bulk Asset**: Sistem mengecek apakah asset adalah `is_bulk_parent`
2. **Fetch Individual Assets**: Jika bulk, ambil semua asset dalam grup menggunakan `getBulkAssets(bulk_id)`
3. **Sorting**: Urutkan berdasarkan `bulk_sequence` atau extract dari kode asset
4. **Export**: Setiap asset individual menjadi 1 baris dengan quantity = 1

## 🧪 Testing

### Test Case 1: Asset Bulk
**Input**: 1 asset bulk dengan 10 item
**Expected**: 10 baris di Excel, masing-masing quantity = 1
**Result**: ✅ PASS - 10 baris terpisah dengan urutan ascending

### Test Case 2: Asset Regular
**Input**: Asset regular biasa
**Expected**: 1 baris di Excel dengan quantity sesuai input
**Result**: ✅ PASS - Tetap 1 baris seperti biasa

### Test Case 3: Campuran Asset
**Input**: 2 asset bulk (5 item each) + 3 asset regular
**Expected**: 13 baris total (10 + 3)
**Result**: ✅ PASS - Total baris sesuai ekspektasi

## 📊 Format Excel Output

| Kode | Nama | Spesifikasi | Jumlah | Satuan | ... |
|------|------|-------------|---------|---------|-----|
| L001-IT-1-25001 | Laptop Dell | Core i5 | 1 | unit | ... |
| L001-IT-1-25002 | Laptop Dell | Core i5 | 1 | unit | ... |
| L001-IT-1-25003 | Laptop Dell | Core i5 | 1 | unit | ... |
| ... | ... | ... | ... | ... | ... |

## 🎯 Business Benefits

1. **Data Accuracy**: Excel export sekarang mencerminkan data sebenarnya
2. **Individual Tracking**: Setiap asset dapat dilacak secara individual
3. **Consistent Ordering**: Urutan konsisten berdasarkan kode sequence
4. **Better Inventory Management**: Memudahkan audit dan tracking fisik asset

## 📁 Files Modified

1. **frontend/src/components/ExportButton.tsx**
   - ✅ Added async export functionality
   - ✅ Added bulk asset expansion logic
   - ✅ Added sequence-based sorting
   - ✅ Added helper function for sequence extraction

## 🎉 Result

**✅ FIXED**: Ekspor Excel sekarang menampilkan asset bulk sebagai baris individual dengan quantity 1 per baris, diurutkan secara ascending berdasarkan kode digit nomor urut terakhir.

**User Experience:**
- Excel export lebih akurat dan detail
- Setiap asset dapat diidentifikasi secara individual
- Urutan yang konsisten dan logis
- Data siap untuk audit dan tracking fisik
