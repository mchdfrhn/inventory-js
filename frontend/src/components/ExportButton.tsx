import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Asset } from '../services/api';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
  assets: Asset[];
  filename?: string;
}

export default function ExportButton({ assets, filename = 'assets' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID');
  };
  
  const exportToExcel = () => {
    setIsExporting(true);
    
    try {
      // Define headers
      const headers = [
        'Kode',
        'Nama',
        'Spesifikasi',
        'Jumlah',
        'Satuan',
        'Kategori',
        'Lokasi',
        'Status',
        'Tanggal Perolehan',
        'Harga Perolehan',
        'Umur Ekonomis (Tahun)',
        'Umur Ekonomis (Bulan)',
        'Akumulasi Penyusutan',
        'Nilai Sisa',
        'Persentase Penyusutan (%)',
        'Keterangan',
      ];
      
      // Map assets to rows
      const rows = assets.map(asset => {
        const status = 
          asset.status === 'baik' ? 'Baik' :
          asset.status === 'rusak' ? 'Rusak' :
          asset.status === 'tidak_memadai' ? 'Tidak Memadai' : 'Baik';
        
        // Calculate depreciation percentage
        const depreciationPercentage = asset.harga_perolehan > 0
          ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
          : 0;
          
        return [
          asset.kode,
          asset.nama,
          asset.spesifikasi,
          asset.quantity,          asset.satuan,          asset.category?.name || '',          asset.lokasi_id && asset.location_info ? 
            `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
            : asset.lokasi || '',
          status,
          formatDate(asset.tanggal_perolehan),
          asset.harga_perolehan,
          asset.umur_ekonomis_tahun,
          asset.umur_ekonomis_bulan,
          asset.akumulasi_penyusutan,
          asset.nilai_sisa,
          depreciationPercentage,
          asset.keterangan,
        ];
      });
      
      // Create workbook and worksheet
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      
      // Set column widths
      const columnWidths = [
        { wch: 12 },  // Kode
        { wch: 30 },  // Nama
        { wch: 40 },  // Spesifikasi
        { wch: 8 },   // Jumlah
        { wch: 10 },  // Satuan
        { wch: 20 },  // Kategori
        { wch: 20 },  // Lokasi
        { wch: 15 },  // Status
        { wch: 15 },  // Tanggal Perolehan
        { wch: 15 },  // Harga Perolehan
        { wch: 15 },  // Umur Ekonomis (Tahun)
        { wch: 15 },  // Umur Ekonomis (Bulan)
        { wch: 20 },  // Akumulasi Penyusutan
        { wch: 15 },  // Nilai Sisa
        { wch: 15 },  // Persentase Penyusutan (%)
        { wch: 30 },  // Keterangan
      ];
      ws['!cols'] = columnWidths;
      
      // Add styling for header row
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
      
      // Apply header styling
      for (let i = 0; i < headers.length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = headerStyle;
      }
      
      // Style the currency columns
      for (let rowIndex = 1; rowIndex <= rows.length; rowIndex++) {
        // Columns with currency format (Harga Perolehan, Akumulasi Penyusutan, Nilai Sisa)
        const currencyCols = [9, 12, 13]; 
        
        for (const colIndex of currencyCols) {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].z = '"Rp"#,##0';
        }
        
        // Apply percentage format to depreciation percentage column
        const percentCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 14 });
        if (!ws[percentCellRef]) ws[percentCellRef] = {};
        ws[percentCellRef].z = '0.00"%"';
      }
      
      // Apply alternating row colors
      for (let rowIndex = 1; rowIndex <= rows.length; rowIndex++) {
        if (rowIndex % 2 === 0) {
          for (let colIndex = 0; colIndex < headers.length; colIndex++) {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
            if (!ws[cellRef]) ws[cellRef] = {};
            if (!ws[cellRef].s) ws[cellRef].s = {};
            ws[cellRef].s.fill = { fgColor: { rgb: "F2F2F2" } };
          }
        }
      }
        // Generate the Excel file
      const date = new Date().toISOString().split('T')[0];      XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };    return (
    <button
      onClick={exportToExcel}
      disabled={isExporting || assets.length === 0}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm text-sm
        ${isExporting || assets.length === 0 
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:-translate-y-0.5'}
        transition-all duration-300
      `}
    >
      <DocumentArrowDownIcon className="h-4 w-4" />
      <span>{isExporting ? 'Mengekspor...' : 'Export Excel'}</span>
      {assets.length > 0 && (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-800">
          {assets.length}
        </span>
      )}
    </button>
  );
}
