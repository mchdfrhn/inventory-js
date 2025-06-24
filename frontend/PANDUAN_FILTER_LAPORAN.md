# 📖 Panduan Penggunaan Filter Laporan

## 🎯 **OVERVIEW**
Sistem filter laporan memungkinkan Anda untuk menyaring data aset sebelum mencetak laporan, sehingga laporan yang dihasilkan lebih spesifik dan sesuai kebutuhan.

---

## 🚀 **CARA MENGAKSES FILTER**

### **Langkah 1: Buka Halaman Laporan**
1. Login ke sistem inventaris
2. Pilih menu **"Laporan"** di sidebar
3. Halaman laporan akan terbuka dengan daftar template yang tersedia

### **Langkah 2: Aktifkan Filter**
1. Cari komponen filter di bagian atas halaman
2. Klik ikon **🔍 filter** untuk membuka panel filter
3. Panel filter akan expand dan menampilkan berbagai opsi

---

## 🎛 **MENGGUNAKAN FILTER**

### **📱 Tab Navigation**
Filter dibagi menjadi 4 kategori untuk kemudahan penggunaan:

#### **🔍 Tab DASAR**
**Fitur:**
- **Pencarian Global**: Cari di semua field sekaligus
- **Kode Aset**: Filter berdasarkan kode spesifik
- **Nama Aset**: Filter berdasarkan nama aset
- **Spesifikasi**: Filter berdasarkan detail spesifikasi
- **Kategori**: Pilih kategori aset (Elektronik, Furniture, dll)
- **Status**: Pilih status aset (baik, rusak, hilang)

**Contoh Penggunaan:**
```
✅ Pencarian Global: "laptop"
✅ Kategori: Elektronik
✅ Status: baik
→ Hasil: Semua laptop elektronik dalam kondisi baik
```

#### **📍 Tab LOKASI**
**Fitur:**
- **Lokasi**: Filter berdasarkan ruangan/area
- **Gedung**: Filter berdasarkan gedung
- **Lantai**: Filter berdasarkan lantai

**Contoh Penggunaan:**
```
✅ Gedung: Gedung A
✅ Lantai: 2
→ Hasil: Semua aset di lantai 2 Gedung A
```

#### **💰 Tab KEUANGAN**
**Fitur:**
- **Harga Perolehan**: Range minimum - maksimum
- **Nilai Sisa**: Range nilai sisa aset

**Contoh Penggunaan:**
```
✅ Harga Perolehan: Rp 5.000.000 - Rp 20.000.000
✅ Nilai Sisa: Rp 3.000.000 - ∞
→ Hasil: Aset dengan harga perolehan 5-20 juta dan nilai sisa minimal 3 juta
```

#### **⚙️ Tab LANJUTAN**
**Fitur:**
- **Tanggal Perolehan**: Range tanggal
- **Umur Aset**: Range umur dalam tahun
- **Asal Pengadaan**: Sumber pengadaan (Hibah, Pembelian, dll)

**Contoh Penggunaan:**
```
✅ Tanggal Perolehan: 01/01/2023 - 31/12/2023
✅ Asal Pengadaan: Hibah
→ Hasil: Semua aset hibah yang diperoleh tahun 2023
```

---

## 📊 **MELIHAT HASIL FILTER**

### **Real-time Counter**
- Setiap perubahan filter akan langsung menampilkan jumlah aset yang sesuai
- Contoh: **"Menampilkan 5 dari 25 aset"**

### **Filter Summary Card**
Ketika filter aktif, akan muncul card biru yang menampilkan:
- 🔍 **Filter yang diterapkan**
- 📊 **Jumlah hasil vs total**
- ❌ **Tombol hapus filter**

**Contoh Summary:**
```
🔍 Filter Aktif - Menampilkan 5 dari 25 aset
• Kategori: Elektronik
• Status: baik, rusak
• Harga: Rp 1.000.000 - Rp 10.000.000
• Gedung: Gedung A
```

---

## 🖨 **MENCETAK LAPORAN DENGAN FILTER**

### **Langkah 1: Set Filter**
1. Buka panel filter
2. Atur filter sesuai kebutuhan
3. Pastikan jumlah hasil sesuai harapan

### **Langkah 2: Pilih Template**
1. Pilih template laporan yang diinginkan
2. Template akan menampilkan informasi jumlah aset yang akan dicetak

### **Langkah 3: Generate Laporan**
1. Klik **"Cetak Laporan"** pada template yang dipilih
2. Sistem akan memproses data yang sudah difilter
3. PDF akan terbuka dengan data sesuai filter

### **Informasi dalam Laporan**
Laporan PDF akan menampilkan:
- ✅ **Data aset yang sudah difilter**
- ✅ **Statistik berdasarkan data yang difilter**
- ✅ **Informasi filter yang diterapkan**
- ✅ **Jumlah data vs total aset**

---

## 💡 **TIPS & TRIK PENGGUNAAN**

### **🎯 Filter Efektif**
1. **Mulai dari filter umum ke spesifik**
   ```
   Kategori → Status → Lokasi → Harga
   ```

2. **Gunakan pencarian global untuk find cepat**
   ```
   Ketik "Dell" untuk semua produk Dell
   ```

3. **Kombinasi multiple filter**
   ```
   Kategori: Elektronik + Status: rusak + Gedung: A
   = Elektronik rusak di Gedung A
   ```

### **⚡ Shortcut Filter**
- **Pencarian Global**: Untuk pencarian cepat
- **Single Category**: Untuk laporan per kategori
- **Date Range**: Untuk laporan periode tertentu
- **Location Filter**: Untuk audit per lokasi

### **📋 Template Use Cases**

#### **Laporan Audit Bulanan**
```
Filter:
✅ Tanggal Perolehan: Bulan tertentu
✅ Status: Semua status
Template: Laporan Lengkap
```

#### **Laporan Aset Rusak**
```
Filter:
✅ Status: rusak
✅ Lokasi: Semua lokasi
Template: Laporan Sederhana
```

#### **Laporan Keuangan Per Gedung**
```
Filter:
✅ Gedung: Gedung A
✅ Harga: > Rp 5.000.000
Template: Laporan Keuangan
```

#### **Laporan Inventaris Lab**
```
Filter:
✅ Lokasi: Lab Komputer
✅ Kategori: Elektronik
Template: Laporan Inventaris
```

---

## 🔧 **TROUBLESHOOTING**

### **❓ Filter Tidak Berfungsi**
**Solusi:**
1. Refresh halaman browser
2. Pastikan ada data yang sesuai dengan kriteria filter
3. Coba kombinasi filter yang lebih luas

### **❓ Tidak Ada Hasil Filter**
**Solusi:**
1. Periksa kriteria filter - mungkin terlalu spesifik
2. Gunakan range yang lebih luas untuk filter numerik
3. Coba hapus beberapa filter dan coba lagi

### **❓ Laporan Kosong**
**Solusi:**
1. Pastikan ada aset yang sesuai dengan filter
2. Cek filter summary untuk melihat kriteria yang aktif
3. Gunakan "Reset Filter" dan coba lagi

### **❓ Filter Summary Tidak Muncul**
**Solusi:**
1. Pastikan ada filter yang aktif
2. Tunggu beberapa detik untuk loading
3. Refresh halaman jika perlu

---

## 🎊 **BEST PRACTICES**

### **📈 Efisiensi Maksimal**
1. **Gunakan filter yang paling membatasi terlebih dahulu**
   - Status > Kategori > Lokasi > Harga

2. **Manfaatkan pencarian global untuk preview cepat**
   - Ketik keyword umum dulu

3. **Simpan kombinasi filter yang sering digunakan**
   - Screenshot filter summary untuk referensi

### **📊 Akurasi Laporan**
1. **Selalu cek filter summary sebelum print**
2. **Verifikasi jumlah hasil sesuai ekspektasi**
3. **Gunakan template yang sesuai dengan tujuan laporan**

### **⚡ Performance Tips**
1. **Hindari filter yang terlalu kompleks**
2. **Gunakan range filter dengan bijak**
3. **Clear filter secara berkala untuk reset**

---

## 📞 **DUKUNGAN TEKNIS**

Jika mengalami kendala dalam penggunaan filter:

1. **📧 Email**: support@inventaris.ac.id
2. **📞 Telepon**: (021) 1234-5678 ext. 123
3. **💬 Live Chat**: Tersedia di aplikasi (jam kerja)

**Informasi yang dibutuhkan saat menghubungi support:**
- Screenshot error atau masalah
- Browser yang digunakan
- Langkah-langkah yang sudah dicoba
- Filter yang sedang digunakan

---

## 🎯 **KESIMPULAN**

Filter laporan memberikan fleksibilitas maksimal untuk:
- ✅ **Membuat laporan yang spesifik dan targeted**
- ✅ **Menghemat waktu dalam pencarian data**
- ✅ **Meningkatkan akurasi dan relevansi laporan**
- ✅ **Memudahkan audit dan analisis data aset**

**Manfaatkan filter secara optimal untuk efisiensi maksimal dalam manajemen inventaris aset!** 🚀
