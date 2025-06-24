# Dokumentasi Refactor Template Laporan PDF

## Ringkasan Perubahan

Telah dilakukan pemisahan pengaturan template laporan PDF ke halaman khusus (Template Management Page), sehingga tombol "Laporan PDF" di halaman daftar aset langsung melakukan print/generate PDF berdasarkan template yang dipilih user.

## Struktur File Baru

### 1. Halaman Template Management
**File:** `src/pages/TemplateManagementPage.tsx`
- Halaman khusus untuk manajemen template laporan PDF
- Fitur CRUD (Create, Read, Update, Delete) template
- Preview template
- Set template default
- Simpan template kustom ke localStorage

### 2. PDFReportGenerator yang Disederhanakan
**File:** `src/components/PDFReportGenerator.tsx` (refactored)
- Hanya melakukan print/generate PDF berdasarkan template yang dipilih
- Menghapus dialog kustomisasi
- Auto-load template dari localStorage
- Dropdown sederhana untuk memilih template jika ada lebih dari 1

### 3. Komponen Pendukung
**File:** `src/components/ReportPreview.tsx`
- Komponen untuk preview template sebelum generate PDF
- Digunakan di halaman Template Management

## Fitur Utama

### Template Management Page (`/template-management`)
1. **Default Templates**: 3 template bawaan
   - Laporan Lengkap (landscape, lengkap dengan statistik)
   - Laporan Sederhana (portrait, ringkas)
   - Laporan Keuangan (portrait, fokus nilai aset)

2. **Custom Templates**: 
   - Buat template baru dengan konfigurasi custom
   - Edit template yang sudah ada
   - Hapus template custom
   - Set template sebagai default

3. **Preview**: 
   - Preview real-time template
   - Lihat bagaimana laporan akan terlihat sebelum digenerate

4. **Import/Export Template**:
   - Export template ke JSON
   - Import template dari JSON

### PDFReportGenerator yang Disederhanakan
1. **Simple Button**: Tombol sederhana "Laporan PDF"
2. **Auto Template Selection**: Otomatis menggunakan template default
3. **Template Dropdown**: Jika ada multiple template, tampilkan dropdown untuk memilih
4. **Template Info**: Tampilkan info template yang dipilih
5. **Quick Generate**: Langsung generate PDF tanpa dialog

## Navigation & Routing

### 1. Sidebar Navigation
Menambahkan menu "Template Laporan" di sidebar navigasi utama.

### 2. Quick Access
Tombol "Kelola Template" di toolbar halaman aset untuk akses cepat ke halaman template management.

### 3. Routing
- Route `/template-management` untuk halaman Template Management
- Integrasi dengan router aplikasi di `App.tsx`

## Cara Penggunaan

### Untuk Admin/User yang Mengatur Template:
1. Akses halaman "Template Laporan" dari sidebar atau tombol "Kelola Template" di halaman aset
2. Pilih template default atau buat template baru
3. Kustomisasi template sesuai kebutuhan (kolom, layout, warna, dll)
4. Set template sebagai default jika diinginkan
5. Preview dan simpan template

### Untuk User yang Generate Laporan:
1. Buka halaman Aset
2. Filter aset sesuai kebutuhan
3. Klik tombol "Laporan PDF"
4. Jika ada multiple template, pilih template dari dropdown
5. PDF akan langsung tergenerate dan terdownload

## Penyimpanan Data

### LocalStorage Keys:
- `pdf_report_templates`: Array template custom yang disimpan user
- Template yang ditandai `isDefault: true` akan menjadi template default

### Template Structure:
```typescript
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  orientation: 'portrait' | 'landscape';
  fontSize: number;
  headerColor: string;
  columns: string[];
  includeHeader: boolean;
  includeFooter: boolean;
  includeStats: boolean;
  includeChart: boolean;
  includeQRCode: boolean;
  includeFilters: boolean;
  isDefault?: boolean;
}
```

## Benefits

1. **Pemisahan Kepentingan**: Template management terpisah dari laporan generation
2. **User Experience**: Generate laporan jadi lebih cepat dan simple
3. **Flexibility**: Admin bisa atur template sesuai kebutuhan organisasi
4. **Consistency**: Template tersimpan dan bisa digunakan berkali-kali
5. **Maintainability**: Kode lebih terorganisir dan mudah dimaintain

## File yang Dimodifikasi

1. `src/components/PDFReportGenerator.tsx` - Disederhanakan
2. `src/pages/AssetsPage.tsx` - Tambah tombol "Kelola Template"
3. `src/components/Layout.tsx` - Tambah menu navigation
4. `src/App.tsx` - Tambah routing
5. `src/pages/TemplateManagementPage.tsx` - File baru (halaman utama)
6. `src/components/ReportPreview.tsx` - File baru (komponen preview)

## Testing

Untuk testing, pastikan:
1. Build aplikasi berhasil (`npm run build`)
2. Navigasi ke halaman Template Management berfungsi
3. Generate PDF dari halaman aset berfungsi dengan template default
4. Buat dan edit template custom berfungsi
5. Set template default berfungsi
6. Export/import template berfungsi

## Catatan Teknis

- Menggunakan localStorage untuk penyimpanan template (bisa diganti ke database jika diperlukan)
- Template default sudah embedded di kode untuk memastikan selalu ada template yang tersedia
- PDF generation menggunakan jsPDF dan jsPDF-autotable
- Preview menggunakan HTML yang di-style menyerupai output PDF
