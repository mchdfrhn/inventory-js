# Debug Logging Implementation untuk ReportsPage

## Overview
Dokumentasi ini menjelaskan implementasi debug logging yang komprehensif pada ReportsPage untuk memudahkan troubleshooting masalah integrasi frontend-backend.

## 🔧 Logging yang Ditambahkan

### 1. Backend Data Loading (loadData function)
```typescript
// Log detail proses loading data dari backend
console.log('[ReportsPage] 🔄 Memuat data aset dari backend...');
console.log('[ReportsPage] 🌐 Mencoba endpoint: ${url}');
console.log('[ReportsPage] ✅ Berhasil memuat ${apiAssets.length} aset dari: ${url}');
console.log('[ReportsPage] 📊 Data mentah dari backend (${apiAssets.length} items):');
console.log('[ReportsPage] 🔄 Data setelah transform (${transformedAssets.length} aset):');
console.log('[ReportsPage] 📈 Data source: ${successfulUrl}');
```

**Manfaat:**
- Melacak endpoint mana yang berhasil diakses
- Memonitor proses transformasi data API ke format frontend
- Memverifikasi jumlah data yang berhasil dimuat

### 2. Asset Filtering Debug
```typescript
// Log detail proses filtering aset
console.log('[ReportsPage] 📊 Assets state: ${assets.length} total aset');
console.log('[ReportsPage] 🔍 Filtered assets: ${filteredAssets.length} aset');
console.log('[ReportsPage] 🎯 Filter aktif:', filters);
console.log('[ReportsPage] 📈 Filter summary: ${getFilterSummary()}');
console.log('[ReportsPage] 📉 Filter mengurangi data sebesar ${reduction}%');
```

**Manfaat:**
- Memantau efektivitas filter
- Mendeteksi masalah filter yang tidak bekerja
- Melihat persentase data yang disaring

### 3. PDF Generation Process
```typescript
// Log detail proses pembuatan PDF
console.log('[ReportsPage] 📄 Memulai pembuatan laporan PDF: "${template.name}"');
console.log('[ReportsPage] 🔢 Data untuk export: ${assetsToExport.length} aset');
console.log('[ReportsPage] 🎯 Filter status: ${hasActiveFilters() ? 'AKTIF' : 'TIDAK AKTIF'}');
console.log('[ReportsPage] 📊 Statistik untuk laporan:', filteredStats);
console.log('[ReportsPage] 🖨️ Print window berhasil dibuka');
```

**Manfaat:**
- Memverifikasi data yang masuk ke laporan
- Memastikan filter diterapkan dengan benar pada laporan
- Melacak proses print dialog

## 🎯 Error Handling Improvements

### 1. Backend Connection Errors
- **Pesan error yang jelas**: Menjelaskan bahwa backend tidak dapat diakses
- **Panduan troubleshooting**: Daftar langkah-langkah untuk memperbaiki masalah
- **Retry mechanism**: Tombol "Coba Lagi" dengan penjelasan ports yang dicoba

### 2. API Endpoint Detection
```typescript
if (response.status === 404) {
  console.log('[ReportsPage] ❌ Endpoint tidak ditemukan: ${url} (404)');
} else {
  console.log('[ReportsPage] ❌ Error HTTP dari ${url}: ${response.status} ${response.statusText}');
}
```

### 3. Network Error Handling
- Logging detail error network
- Fallback ke multiple URLs dengan tracking success

## 📊 UI Improvements untuk Debugging

### 1. Enhanced Error Messages
```tsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
  <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Panduan Troubleshooting:</h4>
  <ul className="text-xs text-yellow-700 space-y-1">
    <li>• Pastikan backend Go server berjalan di port 8080</li>
    <li>• Cek apakah endpoint `/api/assets` tersedia</li>
    <li>• Verifikasi database connection</li>
    <li>• Pastikan CORS sudah dikonfigurasi dengan benar</li>
  </ul>
</div>
```

### 2. Success Notifications
- Notifikasi menampilkan sumber data dan jumlah aset
- Informasi port yang berhasil diakses
- Status filter dalam notifikasi laporan

## 🔍 Console Log Categories

### Kategori dengan Emoji untuk Mudah Filtering:
- `🔄` - Loading/Processing
- `🌐` - Network requests
- `✅` - Success operations
- `❌` - Errors
- `📊` - Data statistics
- `🔍` - Filtering operations
- `📄` - PDF generation
- `🎯` - Filter status
- `📈` - Performance metrics
- `🖨️` - Print operations

## 🛠️ Cara Menggunakan Debug Info

### 1. Untuk Developer
```javascript
// Buka Console Browser (F12)
// Filter log dengan prefix: [ReportsPage]
// Atau filter dengan emoji tertentu

// Contoh filtering:
// Cari semua error: ❌
// Cari semua network: 🌐
// Cari semua success: ✅
```

### 2. Untuk QA Testing
- Cek console setelah load page untuk verifikasi data source
- Monitor filter logs saat menguji filtering
- Verifikasi PDF generation logs saat testing laporan

### 3. Untuk Production Monitoring
- Log level bisa disesuaikan dengan environment
- Error tracking untuk monitoring backend availability
- Performance metrics untuk optimisasi

## 📈 Performance Monitoring

### Data Loading Metrics:
- Waktu response dari setiap endpoint
- Jumlah data yang berhasil dimuat
- Success rate dari berbagai endpoints

### Filter Performance:
- Waktu proses filtering
- Persentase data reduction
- Filter effectiveness metrics

### PDF Generation Metrics:
- Waktu generate HTML content
- Ukuran content yang dihasilkan
- Success rate print operations

## 🔧 Configuration

### Environment-based Logging:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('[ReportsPage] Debug info...');
}
```

### Log Level Control:
```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

const currentLogLevel = LogLevel.DEBUG; // Bisa disesuaikan
```

## 🎯 Best Practices

1. **Konsisten dengan prefix**: Selalu gunakan `[ReportsPage]` untuk mudah filtering
2. **Gunakan emoji**: Memudahkan kategorisasi visual di console
3. **Include context**: Selalu sertakan data relevant (jumlah, status, etc.)
4. **Error dengan detail**: Sertakan stack trace dan suggested actions
5. **Performance aware**: Log jangan sampai impact performance production

## 📝 Update History

- **v1.0** - Initial debug logging implementation
- **v1.1** - Enhanced error messages dengan troubleshooting guide
- **v1.2** - Added performance metrics dan emoji categories
- **v1.3** - Improved console filtering dan categorization

## 🔗 Related Files

- `src/pages/ReportsPage.tsx` - Main implementation
- `src/hooks/useAssetFilters.ts` - Filter logging
- `src/utils/mockData.ts` - Mock data untuk debugging template preview
- `LAPORAN_REAL_DATA_FIXED.md` - Dokumentasi perubahan data source

---

**Note**: Semua logging ini dirancang untuk memudahkan debugging tanpa mempengaruhi user experience di production. Console logs bisa di-disable atau di-filter sesuai environment.
