# Perbaikan Status "Tidak Memadai" pada Asset List

## Overview
Memastikan bahwa status "Tidak Memadai" ditampilkan dengan konsisten di seluruh aplikasi, mengganti label yang sebelumnya "Kurang Baik".

## File yang Diperbaiki

### Frontend Components yang Diupdate:

1. **DataDisplay.tsx**
   - `formatStatusLabel`: Mengubah "Kurang Baik" menjadi "Tidak Memadai"

2. **BulkTableRow.tsx**
   - `formatStatusLabel`: Mengubah "Kurang Baik" menjadi "Tidak Memadai"

3. **AssetPreview.tsx**
   - `formatStatusLabel`: Mengubah "Kurang Baik" menjadi "Tidak Memadai"

4. **AssetDetailView.tsx**
   - `formatStatusLabel`: Mengubah "Kurang Baik" menjadi "Tidak Memadai"

5. **AssetCard.tsx**
   - `formatStatusLabel`: Mengubah "Kurang Baik" menjadi "Tidak Memadai"

6. **ReportsPage.tsx**
   - Menghapus import `FunnelIcon` yang tidak digunakan untuk memperbaiki TypeScript error

## Komponen yang Sudah Benar

### Komponen yang sudah menggunakan "Tidak Memadai":

1. **BulkAssetCard.tsx** ✅
   - Sudah menggunakan "Tidak Memadai" dengan benar

2. **AssetsPage.tsx** ✅
   - Sudah menggunakan "Tidak Memadai" dengan benar

3. **ReportsPage.tsx** ✅
   - Sudah menggunakan "Tidak Memadai" dengan benar

4. **DashboardPage.tsx** ✅
   - Sudah menggunakan "Tidak Memadai" dengan benar

## Status Mapping

Semua komponen sekarang menggunakan mapping yang konsisten:

```typescript
const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'baik': return 'Baik';
    case 'rusak': return 'Rusak';
    case 'tidak_memadai': return 'Tidak Memadai';
    default: return 'Baik';
  }
};
```

## Verifikasi

- ✅ Frontend berhasil dikompilasi tanpa error TypeScript
- ✅ Semua referensi "Kurang Baik" telah diganti dengan "Tidak Memadai"
- ✅ Konsistensi status di seluruh aplikasi
- ✅ Bulk asset dan individual asset menggunakan format yang sama

## Dampak Perubahan

1. **User Experience**: Label status sekarang konsisten di seluruh aplikasi
2. **Data Integrity**: Tidak ada perubahan pada data backend, hanya display label
3. **Consistency**: Semua komponen menggunakan terminologi yang sama
4. **Maintenance**: Lebih mudah maintain karena konsistensi kode

## Testing

Pastikan untuk menguji:
- [ ] Asset list menampilkan "Tidak Memadai" bukan "Kurang Baik"
- [ ] Bulk asset list menampilkan status dengan benar
- [ ] Asset detail view menampilkan status dengan benar
- [ ] Asset card view menampilkan status dengan benar
- [ ] Filter berdasarkan status "tidak_memadai" berfungsi dengan benar
