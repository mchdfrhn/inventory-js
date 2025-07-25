import { useState } from 'react';
import ExcelJS from 'exceljs';
import type { Asset } from '../services/api';
import { assetApi } from '../services/api';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import InlineLoader from './InlineLoader';

interface ExportButtonProps {
  assets: Asset[];
  filename?: string;
}

export default function ExportButton({ assets, filename = 'assets' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Format date for display with null handling
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID');
    } catch {
      return '';
    }
  };
  
  const exportToExcel = async () => {
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
      
      // Process assets to expand bulk assets
      const expandedAssets: Asset[] = [];
      
      for (const asset of assets) {
        if (asset.is_bulk_parent && asset.bulk_id) {
          // Fetch all individual assets in the bulk group
          try {
            const bulkResponse = await assetApi.getBulkAssets(asset.bulk_id);
            
            if (bulkResponse.data && bulkResponse.data.length > 0) {
              // Sort bulk assets by sequence number (ascending order)
              const sortedBulkAssets = bulkResponse.data.sort((a, b) => {
                // Sort by bulk_sequence if available, otherwise by sequence in kode
                if (a.bulk_sequence && b.bulk_sequence) {
                  return a.bulk_sequence - b.bulk_sequence;
                }
                
                // Fallback to code-based sequence
                const sequenceA = getSequenceFromCode(a.kode);
                const sequenceB = getSequenceFromCode(b.kode);
                return sequenceA - sequenceB;
              });
              
              expandedAssets.push(...sortedBulkAssets);
            }
          } catch (error) {
            console.error('Error fetching bulk assets for', asset.bulk_id, error);
            // Fallback to using the parent asset if bulk fetch fails
            expandedAssets.push(asset);
          }
        } else {
          // Regular asset, add as-is
          expandedAssets.push(asset);
        }
      }
      
      // Sort all expanded assets by sequence number (3 digit terakhir) as primary key
      expandedAssets.sort((a, b) => {
        // Primary sort: by sequence number (3 digit terakhir)
        const sequenceA = getSequenceFromCode(a.kode);
        const sequenceB = getSequenceFromCode(b.kode);
        
        if (sequenceA !== sequenceB) {
          return sequenceA - sequenceB;
        }
        
        // Secondary sort: if sequences are the same, sort by full code
        return a.kode.localeCompare(b.kode);
      });
      
      // Map assets to rows with proper null handling
      const rows = expandedAssets.map(asset => {
        const status = 
          asset.status === 'baik' ? 'Baik' :
          asset.status === 'rusak' ? 'Rusak' :
          asset.status === 'tidak_memadai' ? 'Tidak Memadai' : 'Baik';
        
        // Safe number conversion with fallbacks
        const hargaPerolehan = Number(asset.harga_perolehan) || 0;
        const akumulasiPenyusutan = Number(asset.akumulasi_penyusutan) || 0;
        const nilaiSisa = Number(asset.nilai_sisa) || 0;
        const umurEkonomisTahun = Number(asset.umur_ekonomis_tahun) || 0;
        const umurEkonomisBulan = Number(asset.umur_ekonomis_bulan) || 0;
        
        // Calculate depreciation percentage safely
        const depreciationPercentage = hargaPerolehan > 0
          ? Math.round((akumulasiPenyusutan / hargaPerolehan) * 100)
          : 0;
          
        return [
          asset.kode || '',
          asset.nama || '',
          asset.spesifikasi || '',
          Number(asset.quantity) || 1,
          asset.satuan || '',
          asset.category?.name || '',
          asset.lokasi_id && asset.location_info ? 
            `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
            : asset.lokasi || '',
          status,
          formatDate(asset.tanggal_perolehan),
          hargaPerolehan,
          umurEkonomisTahun,
          umurEkonomisBulan,
          akumulasiPenyusutan,
          nilaiSisa,
          depreciationPercentage,
          asset.keterangan || '',
        ];
      });
      
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory');
      
      // Add headers
      worksheet.addRow(headers);
      
      // Add data rows
      rows.forEach(row => {
        worksheet.addRow(row);
      });
      
      // Set column widths
      const columnWidths = [12, 30, 40, 8, 10, 20, 20, 15, 15, 15, 15, 15, 20, 15, 15, 30];
      columnWidths.forEach((width, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = width;
      });
      
      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      
      // Style data rows
      for (let rowIndex = 2; rowIndex <= rows.length + 1; rowIndex++) {
        const row = worksheet.getRow(rowIndex);
        
        // Apply alternating row colors
        if (rowIndex % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F2F2' }
            };
          });
        }
        
        // Format currency columns (Harga Perolehan, Akumulasi Penyusutan, Nilai Sisa)
        const currencyCols = [10, 13, 14]; // 1-based indexing
        currencyCols.forEach(colIndex => {
          const cell = row.getCell(colIndex);
          cell.numFmt = '"Rp"#,##0';
        });
        
        // Format percentage column
        const percentCell = row.getCell(15);
        percentCell.numFmt = '0.00"%"';
      }
      
      // Generate the Excel file
      const date = new Date().toISOString().split('T')[0];
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create download link
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${date}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Helper function to extract sequence number (3 digit terakhir)
  const getSequenceFromCode = (kode: string): number => {
    if (kode.includes('-')) {
      const [, suffix] = kode.split('-');
      return parseInt(suffix) || 0;
    }
    
    // For regular assets, try to get last part as sequence
    const parts = kode.split('.');
    const lastPart = parts[parts.length - 1];
    return parseInt(lastPart) || 0;
  };    return (
    <button
      onClick={exportToExcel}
      disabled={isExporting || assets.length === 0}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs
        ${isExporting || assets.length === 0 
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:-translate-y-0.5'}
        transition-all duration-300
      `}
    >
      {isExporting ? (
        <>
          <InlineLoader size="xs" variant="primary" />
          <span>Mengekspor...</span>
        </>
      ) : (
        <>
          <DocumentArrowDownIcon className="h-3.5 w-3.5" />
          <span>Export Excel</span>
        </>
      )}
      {assets.length > 0 && (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-800">
          {assets.length}
        </span>
      )}
    </button>
  );
}
