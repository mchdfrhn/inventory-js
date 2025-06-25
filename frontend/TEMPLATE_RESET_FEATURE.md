# Fitur Reset Template Default

## Deskripsi
Fitur ini memungkinkan pengguna untuk mengembalikan template default yang telah dimodifikasi kembali ke pengaturan awal/standar.

## Bagaimana Cara Kerjanya

### 1. Template Default yang Dimodifikasi
- Ketika template default diedit dan disimpan, versi yang dimodifikasi akan disimpan di localStorage
- Template asli tetap ada di kode sebagai template default
- Template yang dimodifikasi akan menampilkan badge "Modified" di samping badge "Default"

### 2. Tombol Reset
- Tombol "Reset" akan muncul hanya untuk template default yang telah dimodifikasi
- Tombol ini memiliki warna orange untuk membedakannya dari tombol lain
- Ketika diklik, akan muncul modal konfirmasi yang konsisten dengan design system aplikasi

### 3. Proses Reset
1. User mengklik tombol "Reset" pada template default yang telah dimodifikasi
2. Muncul modal dialog konfirmasi dengan:
   - **Icon**: ArrowPathIcon dengan warna orange
   - **Title**: "Reset Template ke Default"
   - **Pesan**: Penjelasan yang jelas tentang konsekuensi reset
   - **Tombol**: "Ya, Reset ke Default" (merah) dan "Batal" (abu-abu)
3. Jika user konfirmasi:
   - Versi modifikasi dihapus dari localStorage
   - Template kembali menggunakan pengaturan default asli
   - User mendapat notifikasi sukses

### 4. Konsistensi Design System
Modal konfirmasi menggunakan pola yang sama dengan modal lain di aplikasi:
- **Headless UI Dialog** dengan Transition animations
- **Backdrop blur** dan opacity untuk focus
- **Icon circle** dengan warna yang sesuai konteks
- **Button layout** dengan primary action di kanan
- **Responsive design** yang bekerja di semua ukuran layar

## UI Components

### Reset Button
```jsx
<button
  onClick={() => handleResetTemplate(template)}
  className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 px-2 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-sm font-medium min-w-0"
  title="Reset ke Default"
>
  <ArrowPathIcon className="h-4 w-4 flex-shrink-0" />
  <span className="truncate">Reset</span>
</button>
```

### Confirmation Modal
```jsx
<Transition.Root show={resetModalOpen} as={Fragment}>
  <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setResetModalOpen}>
    {/* Standard modal structure dengan icon orange dan pesan reset */}
  </Dialog>
</Transition.Root>
```

## Struktur Data

### Template Default Asli
```typescript
// Tersimpan di kode sebagai defaultTemplates
{
  id: 'standard',
  name: 'Laporan Standar',
  description: 'Laporan lengkap dengan semua informasi aset',
  // ... pengaturan default lainnya
}
```

### Template Default yang Dimodifikasi
```typescript
// Tersimpan di localStorage dengan key 'pdf_report_templates'
{
  id: 'standard', // ID sama dengan template default
  name: 'Laporan Standar (Modified)',
  description: 'Laporan yang telah disesuaikan',
  isCustom: true,
  updatedAt: '2024-12-25T10:30:00.000Z',
  // ... pengaturan yang dimodifikasi
}
```

## Fungsi yang Ditambahkan

### TemplateService
1. `resetToDefault(templateId: string)` - Menghapus versi modifikasi dan mengembalikan ke default
2. `isDefaultTemplateModified(templateId: string)` - Mengecek apakah template default telah dimodifikasi

### TemplateManagementPage
1. `handleResetTemplate()` - Handler untuk tombol reset dengan modal konfirmasi
2. `confirmResetTemplate()` - Handler untuk konfirmasi reset dari modal
3. State management untuk modal reset (`resetModalOpen`, `templateToReset`)
4. Visual indicator untuk template yang dimodifikasi
5. Tombol reset kondisional

## Keunggulan

### 1. **Aman & User-friendly**
- User tidak bisa secara tidak sengaja menghapus template default
- Modal konfirmasi dengan pesan yang jelas
- Reversible changes pada template default

### 2. **Konsistensi Design System**
- Menggunakan pola modal yang sama dengan seluruh aplikasi
- Color scheme yang konsisten (orange untuk reset actions)
- Animations dan transitions yang seragam
- Responsive design yang teruji

### 3. **Accessibility**
- Proper focus management
- Keyboard navigation support
- ARIA labels dan semantic HTML
- Screen reader friendly

### 4. **Developer Experience**
- Code yang mudah dipahami dan maintain
- Pattern yang dapat digunakan kembali
- Proper error handling dan logging

## Cara Penggunaan
1. Buka halaman "Kelola Template Laporan"
2. Edit template default (akan muncul badge "Modified" setelah disimpan)
3. Untuk mengembalikan ke default, klik tombol "Reset" berwarna orange
4. Konfirmasi pada modal dialog yang muncul
5. Template akan kembali ke pengaturan default asli dengan notifikasi sukses

## Technical Implementation

### Modal Pattern
Semua modal konfirmasi di aplikasi menggunakan pattern yang sama:
```jsx
// 1. State management
const [modalOpen, setModalOpen] = useState(false);
const [itemToAction, setItemToAction] = useState(null);

// 2. Handler functions
const handleAction = (item) => {
  setItemToAction(item);
  setModalOpen(true);
};

const confirmAction = () => {
  // Perform action
  // Close modal
  // Show notification
};

// 3. Modal component dengan Headless UI
<Transition.Root show={modalOpen} as={Fragment}>
  <Dialog onClose={setModalOpen}>
    {/* Consistent structure */}
  </Dialog>
</Transition.Root>
```

Pattern ini memastikan UX yang konsisten di seluruh aplikasi.
