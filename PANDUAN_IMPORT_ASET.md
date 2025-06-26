# 📥 PANDUAN IMPORT ASET - SISTEM INVENTARIS STTPU

## 🎯 Tujuan
Panduan ini menjelaskan cara mengimport data aset secara bulk ke dalam sistem inventaris STTPU menggunakan file CSV.

## 📋 Persyaratan File
- **Format File**: CSV (.csv) 
- **Encoding**: UTF-8
- **Separator**: Koma (,) atau titik koma (;) - deteksi otomatis
- **Format Tanggal**: YYYY-MM-DD, DD/MM/YYYY, atau DD-MM-YYYY

## 📊 Format Template CSV

### Kolom yang Diperlukan
```csv
Nama Aset*,Kode Kategori*,Spesifikasi,Tanggal Perolehan*,Jumlah*,Satuan,Harga Perolehan*,Umur Ekonomis,Kode Lokasi*,ID Asal Pengadaan*,Status
```

### Penjelasan Kolom

| Kolom | Wajib | Tipe | Keterangan |
|-------|-------|------|------------|
| **Nama Aset*** | ✅ | Text | Nama lengkap aset |
| **Kode Kategori*** | ✅ | Number | Kode kategori yang sudah ada (10, 20, 30, etc.) |
| **Spesifikasi** | ❌ | Text | Detail spesifikasi teknis aset |
| **Tanggal Perolehan*** | ✅ | Date | Format: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY |
| **Jumlah*** | ✅ | Number | Jumlah unit aset |
| **Satuan** | ❌ | Text | Unit satuan (Unit, Buah, Set, etc.) |
| **Harga Perolehan*** | ✅ | Number | Harga dalam rupiah (tanpa titik/koma) |
| **Umur Ekonomis** | ❌ | Number | Umur ekonomis dalam tahun |
| **Kode Lokasi*** | ✅ | Text | Kode lokasi yang sudah ada (001, 002, 003, etc.) |
| **ID Asal Pengadaan*** | ✅ | Text | Sumber pengadaan aset |
| **Status** | ❌ | Text | Status kondisi aset |

## 🏷️ Kode Kategori yang Tersedia

| Kode | Nama Kategori | Deskripsi |
|------|---------------|-----------|
| 10 | Peralatan Komputer | Komputer, laptop, printer, scanner, aksesoris IT |
| 20 | Furniture Kantor | Meja, kursi, lemari, filing cabinet |
| 30 | Kendaraan | Mobil dinas, motor operasional, transportasi |
| 40 | Peralatan Audio Visual | Projektor, sound system, microphone |
| 50 | Peralatan Laboratorium | Alat ukur, instrumen penelitian, praktikum |

## 📍 Contoh Kode Lokasi

| Kode | Nama Lokasi | Gedung | Lantai | Ruangan |
|------|-------------|--------|--------|---------|
| 001 | Ruang Kelas 1A | Gedung Utama | 1 | A101 |
| 002 | Laboratorium Komputer | Gedung Teknik | 2 | B201 |
| 003 | Perpustakaan | Gedung Utama | 1 | C101 |
| 004 | Ruang Rapat | Gedung Utama | 3 | D301 |

## 🔄 Asal Pengadaan yang Valid

| ID | Nama | Keterangan |
|----|------|------------|
| Pembelian | Pembelian | Dibeli dengan dana institusi |
| Bantuan | Bantuan | Diterima sebagai bantuan |
| Hibah | Hibah | Diterima sebagai hibah |
| Sumbangan | Sumbangan | Diterima sebagai sumbangan |
| Produksi Sendiri | Produksi Sendiri | Dibuat sendiri oleh institusi |

## 📝 Contoh Data Template

```csv
Nama Aset*,Kode Kategori*,Spesifikasi,Tanggal Perolehan*,Jumlah*,Satuan,Harga Perolehan*,Umur Ekonomis,Kode Lokasi*,ID Asal Pengadaan*,Status
Laptop Dell Inspiron 15,10,"Core i5 Gen 12, RAM 8GB, SSD 256GB",2024-01-15,1,Unit,8500000,5,001,Pembelian,Baik
Meja Kantor Kayu Jati,20,"Meja kerja kayu jati ukuran 120x60x75 cm dengan laci",2024-02-10,5,Unit,1200000,10,002,Pembelian,Baik
Printer HP LaserJet Pro,10,"Printer laser monochrome A4 duplex network",2024-03-05,2,Unit,3200000,7,001,Bantuan,Baik
Proyektor Epson EB-X41,40,"Proyektor XGA 3600 lumens HDMI VGA",2023-12-20,3,Unit,4800000,8,003,Hibah,Baik
```

## 🚀 Langkah-langkah Import

### 1. **Persiapan Data**
- Pastikan semua kode kategori dan lokasi sudah ada di sistem
- Validasi format tanggal
- Pastikan harga perolehan dalam format angka (tanpa titik/koma)
- Gunakan encoding UTF-8 saat menyimpan CSV

### 2. **Download Template**
- Buka halaman Assets
- Klik tombol "Import"
- Klik "Download Template" untuk mendapatkan template kosong
- Edit template dengan data Anda

### 3. **Upload File**
- Pilih file CSV yang sudah disiapkan
- Sistem akan memvalidasi format file
- Klik "Import" untuk memulai proses

### 4. **Verifikasi Hasil**
- Periksa pesan sukses/error yang muncul
- Refresh halaman assets untuk melihat data baru
- Verifikasi kode asset yang dibuat otomatis

## ⚠️ Hal Penting yang Perlu Diperhatikan

### Kode Asset
- **Dibuat otomatis** oleh sistem berdasarkan:
  - Kode lokasi (3 digit)
  - Kode kategori (2 digit) 
  - Kode asal pengadaan (1 digit)
  - Tahun perolehan (2 digit)
  - Nomor urut (3 digit)
- Format: `XXX.XX.X.XX.XXX`
- Contoh: `001.10.1.24.001`

### Validasi Data
- Kategori dan lokasi harus sudah ada di sistem
- Tanggal tidak boleh di masa depan
- Harga perolehan harus angka positif
- Jumlah harus minimal 1

### Error Handling
- File yang tidak valid akan ditolak
- Baris dengan error akan dilewati
- Laporan sukses/error akan ditampilkan

## 🔧 Troubleshooting

### Error "Category with code 'XX' not found"
- **Solusi**: Pastikan kode kategori sudah ada di master kategori
- Buat kategori baru atau gunakan kode yang sudah ada

### Error "Location with code 'XXX' not found"  
- **Solusi**: Pastikan kode lokasi sudah ada di master lokasi
- Buat lokasi baru atau gunakan kode yang sudah ada

### Error "Invalid date format"
- **Solusi**: Gunakan format tanggal yang didukung:
  - YYYY-MM-DD (2024-01-15)
  - DD/MM/YYYY (15/01/2024)
  - DD-MM-YYYY (15-01-2024)

### Error "Invalid price value"
- **Solusi**: Pastikan harga dalam format angka tanpa pemisah ribuan
- Contoh yang benar: `8500000`
- Contoh yang salah: `8.500.000` atau `8,500,000`

## 📈 Tips untuk Import yang Efisien

### 1. **Batch Import**
- Import dalam batch kecil (50-100 aset per file)
- Lebih mudah troubleshooting jika ada error

### 2. **Konsistensi Data**
- Gunakan format yang sama untuk semua baris
- Pastikan konsistensi nama dan spesifikasi

### 3. **Backup Data**
- Simpan backup data sebelum import besar
- Export data existing sebelum import baru

### 4. **Testing**
- Test dengan file kecil terlebih dahulu
- Verifikasi hasil sebelum import data lengkap

## 📞 Bantuan

Jika mengalami kesulitan:
1. Periksa panduan ini kembali
2. Pastikan format file sesuai template
3. Hubungi administrator sistem untuk bantuan lebih lanjut

---

**📅 Terakhir diperbarui**: December 2024  
**👨‍💻 Tim Pengembang**: Sistem Inventaris STTPU
