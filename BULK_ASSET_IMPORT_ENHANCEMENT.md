# Bulk Asset Import Enhancement

## Overview
Sistem import aset sekarang mendukung pembuatan bulk asset secara otomatis ketika mengimport data dengan jumlah (quantity) lebih dari 1 dan satuan yang memenuhi syarat.

## Fitur Baru

### Automatic Bulk Asset Creation During Import
- **Trigger**: Quantity > 1 dan satuan adalah salah satu dari: "unit", "pcs", "set", "buah"
- **Behavior**: Sistem otomatis membuat bulk asset dengan kode unik untuk setiap item
- **Fallback**: Jika satuan tidak memenuhi syarat bulk, tetap membuat single asset

### Eligible Units for Bulk Creation
```
- unit
- pcs  
- set
- buah
```

### Import Logic Flow
1. **Parse CSV**: Membaca file CSV dan validasi format
2. **Check Quantity**: Untuk setiap baris, periksa nilai quantity
3. **Evaluate Eligibility**: 
   - Jika quantity > 1 AND satuan eligible → Create bulk asset
   - Jika quantity > 1 BUT satuan not eligible → Create single asset
   - Jika quantity = 1 → Create single asset
4. **Generate Codes**: Buat kode aset unik untuk setiap item dalam bulk

## Template Examples

### Bulk Asset Examples in Template
```csv
Nama Aset*,Kode Kategori*,Spesifikasi,Tanggal Perolehan*,Jumlah*,Satuan,Harga Perolehan*,Umur Ekonomis,Kode Lokasi*,ID Asal Pengadaan*,Status
Kursi Kantor Ergonomis,20,Kursi putar dengan sandaran tinggi bahan mesh,2024-01-25,10,unit,750000,8,002,Pembelian,Baik
Printer HP LaserJet Pro,10,Printer laser monochrome A4 duplex network,2024-03-05,2,unit,3200000,7,001,Bantuan,Baik
Proyektor Epson EB-X41,40,Proyektor XGA 3600 lumens HDMI VGA,2023-12-20,3,unit,4800000,8,003,Hibah,Baik
```

**Result**: 
- Kursi Kantor: 10 bulk assets akan dibuat dengan kode 002.20.1.24.001, 002.20.1.24.002, dst.
- Printer: 2 bulk assets akan dibuat dengan kode 001.10.2.24.001, 001.10.2.24.002
- Proyektor: 3 bulk assets akan dibuat dengan kode 003.40.3.23.001, 003.40.3.23.002, 003.40.3.23.003

## UI Updates

### Import Modal Instructions
- ✅ Added explanation about bulk asset creation
- ✅ Updated template examples to show bulk scenarios
- ✅ Enhanced tips section with bulk asset information

### New Instructions Added
```
Bulk Asset: Jika jumlah > 1 dan satuan adalah "unit", "pcs", "set", atau "buah", sistem akan membuat bulk asset secara otomatis
```

### Enhanced Tips Section
```
🔢 Bulk Asset: Untuk aset dengan jumlah > 1 dan satuan "unit", "pcs", "set", atau "buah", sistem akan otomatis membuat bulk asset dengan kode unik untuk setiap item.
```

## Backend Implementation

### Modified Functions
1. **Import()**: Enhanced to check quantity and satuan eligibility
2. **Asset Creation Logic**: Branched logic for bulk vs single asset creation
3. **Error Handling**: Separate error tracking for bulk vs single assets

### Code Changes
```go
// In Import function
if asset.Quantity > 1 {
    // Check if satuan is eligible for bulk creation
    bulkEligibleUnits := []string{"unit", "pcs", "set", "buah"}
    isEligible := false
    for _, eligible := range bulkEligibleUnits {
        if strings.ToLower(asset.Satuan) == strings.ToLower(eligible) {
            isEligible = true
            break
        }
    }

    if isEligible {
        // Create bulk assets
        bulkAssets, err := h.assetUsecase.CreateBulkAsset(&asset, asset.Quantity)
        if err != nil {
            errors = append(errors, fmt.Sprintf("Failed to import bulk asset '%s': %s", asset.Nama, err.Error()))
        } else {
            successCount += len(bulkAssets)
        }
    } else {
        // Create single asset even if quantity > 1 for non-bulk eligible units
        if err := h.assetUsecase.CreateAsset(&asset); err != nil {
            errors = append(errors, fmt.Sprintf("Failed to import asset '%s': %s", asset.Nama, err.Error()))
        } else {
            successCount++
        }
    }
} else {
    // Create single asset for quantity = 1
    if err := h.assetUsecase.CreateAsset(&asset); err != nil {
        errors = append(errors, fmt.Sprintf("Failed to import asset '%s': %s", asset.Nama, err.Error()))
    } else {
        successCount++
    }
}
```

## Benefits

### 1. Consistency
- Import behavior sekarang konsisten dengan manual bulk asset creation
- Prinsip yang sama diterapkan di seluruh sistem

### 2. Efficiency
- Otomatis membuat bulk asset tanpa perlu input manual tambahan
- Bulk code generation mengikuti logika yang sudah ada

### 3. User Experience
- Template yang lebih representatif dengan contoh bulk scenarios
- Instruksi yang jelas tentang kapan bulk asset akan dibuat
- Feedback yang akurat tentang jumlah aset yang berhasil dibuat

### 4. Data Integrity
- Tetap validasi satuan untuk eligibility
- Fallback ke single asset untuk satuan non-eligible
- Proper error handling untuk setiap scenario

## Usage Examples

### Scenario 1: Bulk Eligible
```csv
Input: Kursi Kantor,20,Standard office chair,2024-01-15,5,unit,500000,8,001,Pembelian,Baik
Result: 5 bulk assets created (001.20.1.24.001 to 001.20.1.24.005)
```

### Scenario 2: Not Bulk Eligible
```csv
Input: Cat Tembok,30,Cat dinding interior,2024-01-15,10,liter,50000,2,001,Pembelian,Baik
Result: 1 single asset created with quantity = 10
```

### Scenario 3: Single Asset
```csv
Input: Server Rack,10,42U server rack,2024-01-15,1,unit,15000000,10,001,Pembelian,Baik
Result: 1 single asset created
```

## Testing Recommendations

1. **Test bulk eligible units**: Import data dengan quantity > 1 dan satuan "unit", "pcs", "set", "buah"
2. **Test non-eligible units**: Import data dengan quantity > 1 dan satuan "kg", "liter", "meter"
3. **Test single quantity**: Import data dengan quantity = 1
4. **Test mixed scenarios**: CSV dengan kombinasi bulk dan single assets
5. **Test error handling**: Invalid data untuk setiap scenario

---

**Date**: $(date)  
**Status**: ✅ IMPLEMENTED  
**Files Modified**: 
- `backend/internal/delivery/http/asset_handler.go`
- `frontend/src/pages/AssetsPage.tsx`
