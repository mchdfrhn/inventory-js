# Panduan Loading dan Error States yang Konsisten

Dokumen ini menjelaskan pola konsisten untuk animasi loading dan error handling di seluruh aplikasi, berdasarkan implementasi yang ada di page riwayat aktivitas (AuditLogPage).

## Komponen Standar

### 1. LoadingState
Digunakan untuk loading halaman penuh:

```tsx
import LoadingState from '../components/LoadingState';

// Penggunaan
if (isLoading) {
  return <LoadingState message="Memuat data..." size="lg" />;
}
```

**Props:**
- `message?: string` - Pesan loading (default: "Memuat data...")
- `size?: 'sm' | 'md' | 'lg'` - Ukuran loader (default: 'md')
- `className?: string` - CSS class tambahan

### 2. ErrorState
Digunakan untuk error halaman penuh:

```tsx
import ErrorState from '../components/ErrorState';

// Penggunaan
if (error) {
  return (
    <ErrorState
      title="Terjadi Kesalahan"
      error={error}
      onRetry={() => window.location.reload()}
      retryLabel="Coba Lagi"
    />
  );
}
```

**Props:**
- `title?: string` - Judul error (default: "Terjadi Kesalahan")
- `message?: string` - Pesan error custom
- `error?: Error | unknown` - Object error untuk extract message
- `onRetry?: () => void` - Handler untuk tombol retry
- `retryLabel?: string` - Label tombol retry (default: "Coba Lagi")
- `className?: string` - CSS class tambahan

### 3. InlineLoadingState & InlineErrorState
Digunakan untuk loading/error dalam komponen kecil (seperti dropdown, filter):

```tsx
import { InlineLoadingState, InlineErrorState } from '../components/InlineStates';

// Loading inline
{isLoading ? (
  <InlineLoadingState message="Memuat kategori..." />
) : error ? (
  <InlineErrorState message="Gagal memuat data kategori" />
) : (
  // Content normal
)}
```

## Pola Implementasi

### 1. Halaman Utama (Full Page)
```tsx
export default function MyPage() {
  const { data, isLoading, error } = useQuery(/* ... */);

  if (isLoading) {
    return <LoadingState message="Memuat data..." size="lg" />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Konten halaman */}
    </div>
  );
}
```

### 2. Komponen Kecil/Inline
```tsx
export default function FilterComponent() {
  const { data, isLoading, error } = useQuery(/* ... */);

  return (
    <div className="filter-section">
      <h3>Filter Kategori</h3>
      {isLoading ? (
        <InlineLoadingState message="Memuat kategori..." />
      ) : error ? (
        <InlineErrorState message="Gagal memuat data kategori" />
      ) : (
        <select>
          {data?.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
```

### 3. Komponen Khusus (seperti AssetHistory)
Untuk komponen dengan layout khusus, tetap gunakan pola loading inline yang sesuai dengan design komponen:

```tsx
if (isLoading) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-2">
        <div className="flex items-center space-x-1.5 mb-1.5">
          <ClockIcon className="h-3 w-3 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900">Riwayat Aktivitas</h3>
        </div>
        <div className="flex items-center justify-center h-8">
          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-500 border-r-2 border-b-2 border-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
```

## Pesan Error yang Konsisten

### Bahasa Indonesia
- "Memuat data..." / "Memuat [nama data]..."
- "Terjadi Kesalahan"
- "Gagal memuat [nama data]"
- "Coba Lagi"

### Format Error
- Gunakan format: "Gagal memuat [konten]" untuk pesan error umum
- Tampilkan error.message jika tersedia
- Berikan aksi yang jelas (tombol retry)

## Animasi dan Styling

### Loading Animation
- Menggunakan `animate-spin` untuk spinner
- Warna: `border-blue-500` untuk bagian aktif, `border-gray-200` untuk track
- Ukuran: sm (3x3), md (8x8), lg (12x12)

### Transition
- Fade in effect: `transition-opacity duration-500`
- Mounted state: `${mounted ? 'opacity-100' : 'opacity-0'}`

### Error Styling
- Icon: `ExclamationCircleIcon` dengan warna `text-red-500`
- Background: Gunakan `GlassCard` untuk konsistensi
- Button: `GradientButton` dengan variant "primary"

## Checklist Implementasi

Saat mengimplementasi loading/error state baru:

- [ ] Import komponen yang sesuai (`LoadingState`, `ErrorState`, `InlineStates`)
- [ ] Gunakan pesan dalam Bahasa Indonesia yang konsisten  
- [ ] Sediakan handler retry jika memungkinkan
- [ ] Pastikan animasi fade-in untuk konten yang dimuat
- [ ] Test loading dan error state secara manual
- [ ] Pastikan responsive di berbagai ukuran layar

## Halaman yang Sudah Diupdate

✅ **AuditLogPage** - Template/referensi utama
✅ **DashboardPage** - Menggunakan LoadingState & ErrorState
✅ **AssetsPage** - LoadingState, ErrorState, dan InlineStates untuk filter
✅ **CategoriesPage** - LoadingState & ErrorState
✅ **LocationsPage** - LoadingState & ErrorState  
✅ **ReportsPage** - LoadingState & ErrorState
✅ **AssetDetailsPage** - LoadingState
✅ **AssetForm** - LoadingState
🔄 **AssetHistory** - Tetap menggunakan pola khusus (sesuai)

## Catatan Penting

1. **Jangan ubah AssetHistory** - komponen ini sudah optimal dengan loading state khusus yang sesuai dengan layout kompaknya.

2. **Konsistensi pesan** - Selalu gunakan "Memuat [nama data]..." dan "Gagal memuat [nama data]" 

3. **Responsif** - Pastikan loading dan error state terlihat baik di mobile dan desktop

4. **Accessibility** - LoadingState sudah include screen reader support

5. **Performance** - Komponen loading/error ringan dan tidak memblok UI thread
