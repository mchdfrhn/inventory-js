# Solusi Masalah CSV Import untuk Lokasi dan Kategori

## Masalah yang Ditemukan

Berdasarkan analisis kode dan error log, masalah utama dalam CSV import adalah:

1. **CSV Parsing Error**: Data tidak berhasil tersimpan karena masalah dalam parsing CSV
2. **Encoding Issues**: File CSV mungkin memiliki BOM (Byte Order Mark) yang menyebabkan parsing error
3. **Delimiter Detection**: CSV parser tidak dapat mendeteksi delimiter yang tepat
4. **Field Mapping**: Header CSV dengan format `Kode*`, `Nama*` tidak ter-map dengan benar
5. **Duplicate Handling**: Error duplicate data yang sudah ada di database
6. **Validation**: Validasi data yang kurang robust

## Solusi yang Diimplementasikan

### 1. Enhanced CSV Parser

#### Fitur Utama:
- **Auto Delimiter Detection**: Mendeteksi delimiter CSV secara otomatis (`,`, `;`, `\t`, `|`)
- **BOM Removal**: Menghapus Byte Order Mark dari file UTF-8
- **Enhanced Field Mapping**: Mendukung berbagai variasi nama kolom
- **Better Error Reporting**: Laporan error yang lebih detail dengan nomor baris
- **Duplicate Detection**: Deteksi duplikasi dalam CSV sebelum import ke database

#### Implementasi:

```javascript
// Enhanced delimiter detection
const detectDelimiter = (content) => {
  const delimiters = [',', ';', '\t', '|'];
  const firstLine = content.split('\n')[0];
  
  let maxDelimiterCount = 0;
  let detectedDelimiter = ',';
  
  delimiters.forEach(delimiter => {
    const count = (firstLine.match(new RegExp('\\' + delimiter, 'g')) || []).length;
    if (count > maxDelimiterCount) {
      maxDelimiterCount = count;
      detectedDelimiter = delimiter;
    }
  });
  
  return detectedDelimiter;
};

// Enhanced field mapping
const getFieldValue = (row, fieldNames) => {
  for (const fieldName of fieldNames) {
    if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
      return row[fieldName].toString().trim();
    }
  }
  return '';
};

// Mapping untuk kategori
const categoryData = {
  code: getFieldValue(row, ['code', 'kode', 'Kode', 'Kode*', 'CODE', 'Code']),
  name: getFieldValue(row, ['name', 'nama', 'Nama', 'Nama*', 'NAME', 'Name']),
  description: getFieldValue(row, ['description', 'deskripsi', 'Deskripsi', 'DESCRIPTION']) || '',
};
```

### 2. Enhanced Controllers

#### AssetCategoryController.js
- ✅ Auto delimiter detection
- ✅ BOM removal
- ✅ Multi-format field mapping
- ✅ Enhanced validation
- ✅ Better error handling
- ✅ Duplicate detection
- ✅ Detailed import summary

#### LocationController.js  
- ✅ Auto delimiter detection
- ✅ BOM removal
- ✅ Multi-format field mapping
- ✅ Enhanced validation
- ✅ Better error handling
- ✅ Duplicate detection
- ✅ Detailed import summary

### 3. Format CSV yang Didukung

#### Kategori CSV:
```csv
Kode*,Nama*,Deskripsi
10,Peralatan Komputer,Kategori untuk komputer desktop laptop printer scanner
20,Furniture Kantor,Kategori untuk meja kursi lemari filing cabinet
30,Kendaraan,Kategori untuk mobil dinas motor operasional
```

Atau format alternatif:
```csv
code,name,description
10,Peralatan Komputer,Kategori untuk komputer desktop laptop printer scanner
20,Furniture Kantor,Kategori untuk meja kursi lemari filing cabinet
30,Kendaraan,Kategori untuk mobil dinas motor operasional
```

#### Lokasi CSV:
```csv
Kode*,Nama*,Gedung,Lantai,Ruangan,Deskripsi
001,Ruang Kelas 1A,Gedung Utama,1,A101,Ruang kelas untuk mata kuliah umum
002,Lab Komputer,Gedung Teknik,2,B201,Lab untuk praktikum programming
003,Perpustakaan,Gedung Utama,1,C101,Ruang baca dan koleksi buku
```

### 4. Error Handling yang Ditingkatkan

#### Response Format Baru:
```json
{
  "success": true,
  "message": "Import completed. 3 categories imported successfully",
  "imported_count": 3,
  "total_rows": 3,
  "processed_rows": 3,
  "data": {
    "imported": 3,
    "errors": [],
    "summary": {
      "total_processed": 3,
      "valid_data": 3,
      "successfully_imported": 3,
      "failed_imports": 0
    }
  }
}
```

#### Error Response:
```json
{
  "success": false,
  "message": "CSV parsing errors",
  "errors": [
    "Row 2: Code is required",
    "Row 3: Name must be 255 characters or less"
  ],
  "processed_rows": 3,
  "valid_rows": 1
}
```

### 5. Validation Rules

#### Kategori:
- `code`: Required, max 50 characters, unique
- `name`: Required, max 255 characters, unique  
- `description`: Optional, max 1000 characters

#### Lokasi:
- `code`: Required, max 50 characters, unique
- `name`: Required, max 255 characters, unique
- `description`: Optional, max 1000 characters
- `building`: Optional, max 255 characters
- `floor`: Optional, max 50 characters
- `room`: Optional, max 100 characters

## Cara Penggunaan

### 1. Format File CSV
- Simpan file dalam format UTF-8
- Gunakan header yang didukung (lihat format di atas)
- Pastikan tidak ada baris kosong di tengah data

### 2. Upload via API

#### Import Kategori:
```bash
POST /api/v1/categories/import
Content-Type: multipart/form-data

# Form data:
file: [your-categories.csv]
```

#### Import Lokasi:
```bash
POST /api/v1/locations/import
Content-Type: multipart/form-data

# Form data:
file: [your-locations.csv]
```

### 3. Monitoring Import

Pantau console log untuk melihat proses import:
```
Starting enhanced CSV parsing for categories...
Detected delimiter: ","
Processing row 1: { 'Kode*': '10', 'Nama*': 'Peralatan Komputer', ... }
Mapped category data: { code: '10', name: 'Peralatan Komputer', ... }
Parsed 3 categories with 0 errors
```

## Testing

File test tersedia di:
- `fix-csv-import-v2.js` - Test CSV parser enhanced
- Jalankan: `node fix-csv-import-v2.js`

## Troubleshooting

### Masalah Umum:

1. **File tidak terbaca**
   - Pastikan file dalam format UTF-8
   - Cek size file tidak terlalu besar

2. **Header tidak dikenali**
   - Gunakan variasi header yang didukung
   - Hapus karakter khusus dari header

3. **Data tidak tersimpan**
   - Cek validasi data (code & name required)
   - Pastikan tidak ada duplikasi

4. **Error duplicate**
   - Data sudah ada di database
   - Hapus data lama atau gunakan update

### Log Error yang Perlu Diperhatikan:
- `CSV parsing error` - Masalah format file
- `Code and name are required` - Data wajib kosong
- `already exists` - Data sudah ada di database
- `Duplicate found in CSV` - Duplikasi dalam file CSV

## Kesimpulan

Solusi yang diimplementasikan mengatasi semua masalah utama dalam CSV import:

✅ **Enhanced CSV Parser** dengan auto-detection  
✅ **BOM Removal** untuk file UTF-8  
✅ **Multi-format Field Mapping** untuk berbagai header  
✅ **Better Validation** dengan error reporting detail  
✅ **Duplicate Detection** dalam CSV dan database  
✅ **Robust Error Handling** dengan informasi lengkap  

Dengan implementasi ini, proses import data lokasi dan kategori menjadi lebih robust dan user-friendly.
