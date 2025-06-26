# 🔧 PERBAIKAN SORTING ASSET CODES - EXPORT EXCEL

## 📝 Masalah yang Diperbaiki

**Masalah**: Urutan asset codes dalam ekspor Excel tidak benar. Asset dengan kode `005.20.4.25.001` muncul setelah `009.20.4.25.002-007` padahal seharusnya muncul pertama.

### ❌ Urutan Salah (Sebelum):
```
009.20.4.25.002
009.20.4.25.003
009.20.4.25.004
009.20.4.25.005
009.20.4.25.006
009.20.4.25.007
005.20.4.25.001
```

### ✅ Urutan Benar (Setelah):
```
005.20.4.25.001
009.20.4.25.002
009.20.4.25.003
009.20.4.25.004
009.20.4.25.005
009.20.4.25.006
009.20.4.25.007
```

## 🛠️ Root Cause

**Masalah Lama**: Fungsi `extractSequenceFromCode()` hanya mempertimbangkan 3 digit terakhir setelah titik terakhir untuk sorting, sehingga:
- `005.20.4.25.001` → sequence = 1
- `009.20.4.25.002` → sequence = 2  
- Hasil: 2 > 1, sehingga 009 muncul setelah 005 (salah!)

**Solusi**: Menggunakan natural string comparison yang mempertimbangkan seluruh kode asset.

## 🔧 Solusi yang Diterapkan

### 1. **Mengganti Helper Function**

#### ❌ Fungsi Lama:
```typescript
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

#### ✅ Fungsi Baru:
```typescript
const createSortableKey = (kode: string): string => {
  // For bulk assets with suffix (e.g., "009.20.4.25.002-003")
  if (kode.includes('-')) {
    const [mainCode, suffix] = kode.split('-');
    return `${mainCode}-${suffix.padStart(3, '0')}`;
  }
  
  // For regular assets, return the code as is
  return kode;
};
```

### 2. **Mengganti Logic Sorting**

#### ❌ Sorting Lama:
```typescript
const sortedBulkAssets = bulkResponse.data.sort((a, b) => {
  const seqA = a.bulk_sequence || extractSequenceFromCode(a.kode);
  const seqB = b.bulk_sequence || extractSequenceFromCode(b.kode);
  return seqA - seqB;
});
```

#### ✅ Sorting Baru:
```typescript
const sortedBulkAssets = bulkResponse.data.sort((a, b) => {
  const keyA = createSortableKey(a.kode);
  const keyB = createSortableKey(b.kode);
  return keyA.localeCompare(keyB, undefined, { numeric: true });
});
```

## 🧪 Testing Results

### ✅ Test 1: Basic Asset Codes
**Input**: `["009.20.4.25.002", "005.20.4.25.001", "009.20.4.25.003"]`
**Expected**: `["005.20.4.25.001", "009.20.4.25.002", "009.20.4.25.003"]`
**Result**: ✅ PASS

### ✅ Test 2: Bulk Asset Codes with Suffix
**Input**: `["009.20.4.25.002-003", "005.20.4.25.001-001", "009.20.4.25.002-001"]`
**Expected**: `["005.20.4.25.001-001", "009.20.4.25.002-001", "009.20.4.25.002-003"]`
**Result**: ✅ PASS

### ✅ Test 3: Complete Scenario (User's Case)
**Input**: `["009.20.4.25.002", "009.20.4.25.003", "009.20.4.25.004", "009.20.4.25.005", "009.20.4.25.006", "009.20.4.25.007", "005.20.4.25.001"]`
**Expected**: `["005.20.4.25.001", "009.20.4.25.002", "009.20.4.25.003", "009.20.4.25.004", "009.20.4.25.005", "009.20.4.25.006", "009.20.4.25.007"]`
**Result**: ✅ PASS

## 🎯 Keunggulan Solusi Baru

1. **✅ Natural String Comparison**: Menggunakan `localeCompare()` dengan `numeric: true` untuk sorting yang natural
2. **✅ Complete Code Consideration**: Mempertimbangkan seluruh kode asset, bukan hanya digit terakhir
3. **✅ Bulk Asset Support**: Menangani asset dengan suffix bulk (`-001`, `-002`, dll.)
4. **✅ Consistent Ordering**: Urutan konsisten untuk semua format kode asset
5. **✅ Performance**: Efficient string comparison tanpa complex regex extraction

## 📊 Impact

### Business Benefits:
- **✅ Correct Asset Ordering**: Excel export menampilkan urutan asset yang logis
- **✅ Easy Navigation**: User dapat menemukan asset lebih mudah dalam Excel
- **✅ Audit Compliance**: Urutan yang benar mendukung proses audit
- **✅ Data Consistency**: Konsistensi dengan urutan di aplikasi

### Technical Benefits:
- **✅ Simpler Logic**: Code lebih sederhana dan maintainable
- **✅ Better Performance**: String comparison lebih efisien
- **✅ Future Proof**: Mendukung berbagai format kode asset
- **✅ No Breaking Changes**: Tidak mengubah struktur data existing

## 📁 Files Modified

1. **✅ frontend/src/components/ExportButton.tsx**
   - Mengganti `extractSequenceFromCode()` dengan `createSortableKey()`
   - Mengganti numeric sorting dengan natural string comparison
   - Menambahkan dukungan untuk bulk asset suffix

2. **✅ test_sorting_fix.js** (New)
   - Test verification untuk memastikan sorting berfungsi dengan benar

## 🎉 Result

**✅ FIXED**: Urutan asset codes dalam ekspor Excel sekarang benar, dengan `005.20.4.25.001` muncul sebelum series `009.20.4.25.xxx` sesuai urutan numerik yang natural.

**User Experience**:
- ✅ Excel export menampilkan asset dalam urutan yang logis dan mudah dibaca
- ✅ Asset dengan prefix kode yang lebih kecil muncul di atas
- ✅ Urutan sequential dalam satu grup tetap terjaga
- ✅ Bulk assets diurutkan dengan benar berdasarkan suffix
