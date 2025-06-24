# 🧪 TESTING FILTER LAPORAN - PANDUAN CEPAT

## 🚀 Quick Start Testing

### 1. **Akses Aplikasi**
```
URL: http://localhost:5174/
Halaman: Reports/Laporan
```

### 2. **Test Filter Steps**

#### Step 1: Buka Filter Panel
- Klik tombol **"Filter"** di halaman laporan
- Panel samping akan slide masuk dari kanan
- Pastikan animasi smooth dan backdrop gelap

#### Step 2: Test Search Filter (🔵)
```
✅ Ketik "Laptop" di search global
✅ Ketik "AST001" di field kode
✅ Ketik "Intel" di field spesifikasi
```

#### Step 3: Test Category Filter (🟢)
```
✅ Centang "Elektronik"
✅ Centang "Furniture" 
✅ Centang "Kendaraan"
→ Badge counter harus update
```

#### Step 4: Test Status Filter (🟡)
```
✅ Centang "Aktif"
✅ Centang "Rusak"
✅ Centang "Diperbaiki"
```

#### Step 5: Test Location Filter (🔴)
```
✅ Pilih "Ruang Server"
✅ Pilih "Lab IT"
✅ Pilih "Gedung A"
```

#### Step 6: Test Financial Filter (🟣)
```
✅ Set Min Price: 1000000 (1 juta)
✅ Set Max Price: 10000000 (10 juta)
✅ Set Min Value: 500000
✅ Set Max Value: 5000000
```

#### Step 7: Test Advanced Filter (🟠)
```
✅ Set Date From: 2023-01-01
✅ Set Date To: 2024-12-31
✅ Set Age Min: 1 tahun
✅ Set Age Max: 3 tahun
✅ Centang "Pembelian"
```

### 3. **Test Filter Actions**

#### Apply Filter
```
✅ Klik "Terapkan Filter"
✅ Panel harus tutup
✅ Badge counter di button harus update
✅ Tabel hasil harus menampilkan data terfilter
```

#### Clear Filter
```
✅ Buka panel filter lagi
✅ Klik "Hapus Semua Filter"
✅ Semua field harus kosong
✅ Counter kembali ke total aset
```

### 4. **Test PDF Generation**

#### Generate Filtered Report
```
✅ Set beberapa filter (contoh: kategori "Elektronik")
✅ Apply filter
✅ Klik tombol "Generate PDF Report"
✅ PDF harus berisi hanya data terfilter
✅ Header PDF menunjukkan filter aktif
```

## 🔍 Expected Results

### Visual Checks
- ✅ Side panel slide animation smooth
- ✅ Backdrop overlay gelap
- ✅ Color-coded indicators untuk setiap kategori
- ✅ Hover effects pada checkbox dan input
- ✅ Badge counter update real-time
- ✅ Loading spinner saat apply filter

### Functional Checks
- ✅ Multi-select categories working
- ✅ Range inputs (price, age, date) working
- ✅ Search fields filtering correctly
- ✅ Filter combination working
- ✅ Reset filter clearing all
- ✅ PDF contains only filtered data

### Mobile Responsive
- ✅ Panel width responsive
- ✅ Touch interactions working
- ✅ Scrollable content on small screens

## 🐛 Potential Issues to Check

### Common Issues
1. **Import Error**: Jika ada error ReportFilters, cek export default
2. **Transition glitch**: Cek Headless UI version compatibility
3. **Badge not updating**: Cek useEffect dependencies
4. **PDF empty**: Cek data filtering logic

### Debug Commands
```bash
# Check console for errors
F12 → Console

# Network tab untuk API calls
F12 → Network

# Component inspector
React DevTools
```

## 📱 Test Scenarios

### Scenario 1: Basic Filtering
```
1. Filter by category "Elektronik"
2. Apply filter
3. Verify results
4. Generate PDF
```

### Scenario 2: Complex Filtering
```
1. Set multiple categories
2. Add price range
3. Add location filter
4. Apply and verify
```

### Scenario 3: Edge Cases
```
1. Very narrow price range
2. Future date ranges
3. Non-existent search terms
4. Clear and re-apply
```

## 🎯 Success Criteria

✅ **Filter panel opens/closes smoothly**
✅ **All filter types working correctly**  
✅ **Badge counter accurate**
✅ **PDF generation with filtered data**
✅ **Mobile responsive**
✅ **No console errors**

---

### 🔥 Ready to Test!
Filter laporan siap diuji dengan UX modern yang konsisten dengan halaman asset!
