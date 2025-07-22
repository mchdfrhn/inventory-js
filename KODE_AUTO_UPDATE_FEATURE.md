# Fitur Auto Update Kode Asset

## Deskripsi

Fitur ini mengimplementasikan auto update kode asset ketika melakukan edit asset (single atau bulk). Ketika user mengubah kategori, lokasi, asal pengadaan, atau tahun perolehan, kode asset akan otomatis berubah sesuai dengan komponen yang diubah, kecuali 3 digit terakhir (nomor urut) yang akan tetap sama.

## Format Kode Asset

Format kode asset: `XXX.YY.Z.AA.BBB`

Dimana:
- `XXX` = Kode lokasi (3 digit)
- `YY` = Kode kategori (2 digit)  
- `Z` = Kode asal pengadaan (1 digit)
- `AA` = Tahun perolehan (2 digit terakhir)
- `BBB` = Nomor urut/sequence (3 digit) - **TIDAK BERUBAH**

## Mapping Asal Pengadaan

- `pembelian` = 1
- `bantuan` = 2
- `hibah` = 3
- `sumbangan` = 4
- `produksi_sendiri` = 5

## Implementasi

### Backend Changes

#### 1. AssetUseCase.js - updateAsset()

```javascript
// Mendeteksi perubahan yang mempengaruhi kode
const categoryChanged = assetData.category_id && assetData.category_id !== existingAsset.category_id;
const locationChanged = assetData.lokasi_id && assetData.lokasi_id !== existingAsset.lokasi_id;
const procurementChanged = assetData.asal_pengadaan && assetData.asal_pengadaan !== existingAsset.asal_pengadaan;
const dateChanged = assetData.tanggal_perolehan &&
  new Date(assetData.tanggal_perolehan).getFullYear() !== new Date(existingAsset.tanggal_perolehan).getFullYear();

if (categoryChanged || locationChanged || procurementChanged || dateChanged) {
  // Regenerate kode asset dengan mempertahankan sequence
  const newKode = await this.regenerateAssetCodePreservingSequence(
    existingAsset,
    {
      category_id: assetData.category_id || existingAsset.category_id,
      lokasi_id: assetData.lokasi_id || existingAsset.lokasi_id,
      asal_pengadaan: assetData.asal_pengadaan || existingAsset.asal_pengadaan,
      tanggal_perolehan: assetData.tanggal_perolehan || existingAsset.tanggal_perolehan,
    },
  );
  assetData.kode = newKode;
}
```

#### 2. AssetUseCase.js - updateBulkAssets()

```javascript
// Untuk bulk assets, setiap asset diregenerasi kodenya secara individual
if (categoryChanged || locationChanged || procurementChanged || dateChanged) {
  const regeneratedAssets = [];
  for (const asset of existingAssets) {
    const newKode = await this.regenerateAssetCodePreservingSequence(
      asset,
      newData
    );
    // Update setiap asset dengan kode baru
    const updatedAsset = await this.assetRepository.update({
      ...calculatedAssetData,
      kode: newKode,
      id: asset.id,
    });
    regeneratedAssets.push(updatedAsset);
  }
  updatedAssets = regeneratedAssets;
}
```

#### 3. AssetUseCase.js - regenerateAssetCodePreservingSequence()

```javascript
async regenerateAssetCodePreservingSequence(existingAsset, newData) {
  // Extract sequence dari kode asset yang ada (3 digit terakhir)
  let sequence = 1;
  if (existingAsset.kode && existingAsset.kode.includes('.')) {
    const parts = existingAsset.kode.split('.');
    if (parts.length === 5) {
      const lastPart = parts[4];
      const parsedSequence = parseInt(lastPart);
      if (!isNaN(parsedSequence)) {
        sequence = parsedSequence;
      }
    }
  }

  // Generate kode baru dengan sequence yang sama
  const newCode = await this.generateAssetCodeWithSequence(
    newData.category_id,
    newData,
    sequence,
  );

  return newCode;
}
```

### Frontend Changes

#### 1. AssetForm.tsx - State Management

```typescript
const [kodeWillChange, setKodeWillChange] = useState(false);
const [originalFormData, setOriginalFormData] = useState<AssetFormData | null>(null);
```

#### 2. AssetForm.tsx - Change Detection

```typescript
// Effect untuk mendeteksi perubahan yang akan mengubah kode
useEffect(() => {
  if (isEditMode && originalFormData) {
    const categoryChanged = formData.category_id !== originalFormData.category_id;
    const locationChanged = formData.lokasi_id !== originalFormData.lokasi_id;
    const procurementChanged = formData.asal_pengadaan !== originalFormData.asal_pengadaan;
    
    // Check if year changed
    const originalYear = originalFormData.tanggal_perolehan ? 
      new Date(originalFormData.tanggal_perolehan).getFullYear() : new Date().getFullYear();
    const currentYear = formData.tanggal_perolehan ? 
      new Date(formData.tanggal_perolehan).getFullYear() : new Date().getFullYear();
    const dateChanged = originalYear !== currentYear;

    setKodeWillChange(categoryChanged || locationChanged || procurementChanged || dateChanged);
  }
}, [formData.category_id, formData.lokasi_id, formData.asal_pengadaan, formData.tanggal_perolehan, originalFormData, isEditMode]);
```

#### 3. AssetForm.tsx - User Notification

```tsx
{/* Info untuk kode akan berubah */}
{isEditMode && kodeWillChange && (
  <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-md p-3 flex items-center">
    <InformationCircleIcon className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
    <div>
      <span className="text-sm font-medium">🔄 Kode Asset akan berubah otomatis</span>
      <p className="text-xs text-orange-700 mt-1">
        Karena Anda mengubah kategori, lokasi, asal pengadaan, atau tahun perolehan, kode asset akan diperbarui secara otomatis. Nomor urut (3 digit terakhir) akan tetap sama.
      </p>
    </div>
  </div>
)}
```

## Contoh Penggunaan

### Scenario 1: Single Asset Update

Misalnya ada asset dengan kode: `001.10.1.24.015`

Jika user mengubah:
- Lokasi dari '001' ke '002'
- Kategori tetap '10'
- Asal pengadaan tetap 'pembelian' (1)
- Tahun tetap 2024

Kode baru akan menjadi: `002.10.1.24.015` (sequence '015' tetap sama)

### Scenario 2: Bulk Asset Update

Jika ada 3 bulk assets:
- `001.10.1.24.015`
- `001.10.1.24.016` 
- `001.10.1.24.017`

Dan user mengubah kategori dari '10' ke '20', maka kode akan menjadi:
- `001.20.1.24.015`
- `001.20.1.24.016`
- `001.20.1.24.017`

## Keuntungan

1. **Konsistensi**: Kode asset selalu mencerminkan kategori, lokasi, dan informasi terkini
2. **Preservasi Urutan**: Nomor urut tetap sama sehingga tidak mengacaukan sistem tracking
3. **User Friendly**: User mendapat notifikasi visual sebelum perubahan terjadi
4. **Otomatis**: Tidak perlu input manual dari user

## Testing

- ✅ Backend tests passed (42/42)
- ✅ Frontend build successful
- ✅ Tidak ada breaking changes pada API existing
- ✅ Kompatibel dengan bulk operations

## Files Modified

### Backend:
- `src/usecases/AssetUseCase.js` - Logika update kode asset

### Frontend:
- `src/pages/AssetForm.tsx` - UI dan deteksi perubahan
