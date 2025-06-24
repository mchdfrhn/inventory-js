import React, { useState, useEffect } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Asset {
  id: number;
  kode: string;
  nama: string;
  spesifikasi?: string;
  kategori_id: number;
  quantity: number;
  satuan: string;
  lokasi?: string;
  lokasi_id?: number;
  status: 'baik' | 'rusak' | 'tidak_memadai';
  harga_perolehan: number;
  nilai_sisa: number;
  akumulasi_penyusutan: number;
  umur_ekonomis_tahun: number;
  tanggal_perolehan: string;
  asal_pengadaan?: string;
  category?: { id: number; name: string };
  location_info?: {
    name: string;
    building: string;
    floor?: string;
    room?: string;
  };
}

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

interface PDFReportGeneratorProps {
  assets: Asset[];
  filename?: string;
}

// Default templates
const defaultTemplates: ReportTemplate[] = [
  {
    id: 'comprehensive',
    name: 'Laporan Lengkap',
    description: 'Laporan lengkap dengan semua informasi aset',
    orientation: 'landscape',
    fontSize: 10,
    headerColor: '#1e40af',
    columns: ['kode', 'nama', 'kategori', 'lokasi', 'status', 'harga_perolehan', 'nilai_sisa'],
    includeHeader: true,
    includeFooter: true,
    includeStats: true,
    includeChart: false,
    includeQRCode: true,
    includeFilters: true,
    isDefault: true
  },
  {
    id: 'simple',
    name: 'Laporan Sederhana',
    description: 'Laporan sederhana untuk ringkasan aset',
    orientation: 'portrait',
    fontSize: 11,
    headerColor: '#059669',
    columns: ['kode', 'nama', 'kategori', 'status'],
    includeHeader: true,
    includeFooter: false,
    includeStats: false,
    includeChart: false,
    includeQRCode: false,
    includeFilters: false
  },
  {
    id: 'financial',
    name: 'Laporan Keuangan',
    description: 'Laporan fokus pada nilai aset',
    orientation: 'portrait',
    fontSize: 10,
    headerColor: '#dc2626',
    columns: ['kode', 'nama', 'harga_perolehan', 'akumulasi_penyusutan', 'nilai_sisa'],
    includeHeader: true,
    includeFooter: true,
    includeStats: true,
    includeChart: false,
    includeQRCode: false,
    includeFilters: true
  }
];

const columnOptions = [
  { id: 'kode', label: 'Kode Aset' },
  { id: 'nama', label: 'Nama Aset' },
  { id: 'spesifikasi', label: 'Spesifikasi' },
  { id: 'kategori', label: 'Kategori' },
  { id: 'quantity', label: 'Jumlah' },
  { id: 'lokasi', label: 'Lokasi' },
  { id: 'status', label: 'Status' },
  { id: 'harga_perolehan', label: 'Harga Perolehan' },
  { id: 'nilai_sisa', label: 'Nilai Sisa' },
  { id: 'akumulasi_penyusutan', label: 'Akumulasi Penyusutan' },
  { id: 'umur_ekonomis', label: 'Umur Ekonomis' },
  { id: 'tanggal_perolehan', label: 'Tanggal Perolehan' },
  { id: 'asal_pengadaan', label: 'Asal Pengadaan' }
];

const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({ 
  assets, 
  filename = 'laporan_aset' 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<ReportTemplate[]>([]);

  useEffect(() => {
    // Load custom templates from localStorage
    const savedTemplates = localStorage.getItem('pdf_report_templates');
    let customTemplates: ReportTemplate[] = [];
    
    if (savedTemplates) {
      try {
        customTemplates = JSON.parse(savedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }

    const allTemplates = [...defaultTemplates, ...customTemplates];
    setAvailableTemplates(allTemplates);

    // Set default template
    const defaultTemplate = allTemplates.find(t => t.isDefault) || allTemplates[0];
    setSelectedTemplate(defaultTemplate);
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateStats = () => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.harga_perolehan, 0);
    const totalDepreciation = assets.reduce((sum, asset) => sum + asset.akumulasi_penyusutan, 0);
    const currentValue = assets.reduce((sum, asset) => sum + asset.nilai_sisa, 0);
    
    const statusCounts = assets.reduce((counts, asset) => {
      const status = asset.status || 'baik';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalAssets,
      totalValue,
      totalDepreciation,
      currentValue,
      statusCounts
    };
  };

  const getColumnValue = (asset: Asset, columnId: string): string => {
    switch (columnId) {
      case 'kode':
        return asset.kode;
      case 'nama':
        return asset.nama;
      case 'spesifikasi':
        return asset.spesifikasi || '';
      case 'kategori':
        return asset.category?.name || 'Tidak Terkategori';
      case 'quantity':
        return `${asset.quantity} ${asset.satuan}`;
      case 'lokasi':
        return asset.lokasi_id && asset.location_info 
          ? `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})`
          : asset.lokasi || '';
      case 'status':
        const status = asset.status === 'baik' ? 'Baik' :
                      asset.status === 'rusak' ? 'Rusak' :
                      asset.status === 'tidak_memadai' ? 'Tidak Memadai' : 'Baik';
        return status;
      case 'harga_perolehan':
        return formatCurrency(asset.harga_perolehan);
      case 'nilai_sisa':
        return formatCurrency(asset.nilai_sisa);
      case 'akumulasi_penyusutan':
        return formatCurrency(asset.akumulasi_penyusutan);
      case 'umur_ekonomis':
        return `${asset.umur_ekonomis_tahun} tahun`;
      case 'tanggal_perolehan':
        return formatDate(asset.tanggal_perolehan);
      case 'asal_pengadaan':
        return asset.asal_pengadaan || '';
      default:
        return '';
    }
  };

  const generatePDF = async (template: ReportTemplate) => {
    if (!template) return;
    
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: template.orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      let yPosition = margin;

      // Header
      if (template.includeHeader) {
        // Logo area (placeholder)
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition, 30, 20, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('LOGO', margin + 15, yPosition + 12, { align: 'center' });
        
        // Title
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN ASET INVENTARIS', margin + 40, yPosition + 8);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('SEKOLAH TINGGI TEKNIK PLN UNIKA JAKARTA', margin + 40, yPosition + 15);
        
        yPosition += 30;
        
        // Report info
        doc.setFontSize(10);
        doc.setTextColor(60);
        doc.text(`Template: ${template.name}`, margin, yPosition);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, pageWidth - margin - 50, yPosition);
        yPosition += 10;
        
        if (template.includeFilters) {
          doc.text(`Total Aset: ${assets.length}`, margin, yPosition);
          yPosition += 8;
        }
        
        yPosition += 10;
      }

      // Statistics
      if (template.includeStats) {
        const stats = calculateStats();
        
        // Convert hex color to RGB
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
          ] : [30, 64, 175];
        };
        
        const [r, g, b] = hexToRgb(template.headerColor);
        doc.setFillColor(r, g, b);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(255);
        doc.setFont('helvetica', 'bold');
        doc.text('RINGKASAN STATISTIK', margin + 5, yPosition + 6);
        
        yPosition += 15;
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        
        const statsData = [
          ['Total Aset', stats.totalAssets.toString()],
          ['Total Nilai Perolehan', formatCurrency(stats.totalValue)],
          ['Total Penyusutan', formatCurrency(stats.totalDepreciation)],
          ['Nilai Saat Ini', formatCurrency(stats.currentValue)],
          ['Status Baik', (stats.statusCounts.baik || 0).toString()],
          ['Status Rusak', (stats.statusCounts.rusak || 0).toString()],
          ['Status Tidak Memadai', (stats.statusCounts.tidak_memadai || 0).toString()]
        ];
        
        (doc as any).autoTable({
          startY: yPosition,
          head: [['Kategori', 'Nilai']],
          body: statsData,
          theme: 'grid',
          headStyles: { 
            fillColor: [r, g, b],
            fontSize: template.fontSize,
            fontStyle: 'bold'
          },
          bodyStyles: { 
            fontSize: template.fontSize - 1 
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30 }
          },
          margin: { left: margin }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Assets table
      const headers = template.columns.map(colId => 
        columnOptions.find(opt => opt.id === colId)?.label || colId
      );
      
      const tableData = assets.map(asset => 
        template.columns.map(colId => getColumnValue(asset, colId))
      );

      const [r, g, b] = template.headerColor.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [30, 64, 175];
      doc.setFillColor(r, g, b);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.text('DAFTAR ASET', margin + 5, yPosition + 1);
      
      yPosition += 10;

      (doc as any).autoTable({
        startY: yPosition,
        head: [headers],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [r, g, b],
          fontSize: template.fontSize,
          fontStyle: 'bold',
          textColor: 255
        },
        bodyStyles: { 
          fontSize: template.fontSize - 1,
          textColor: 60
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto',
        columnStyles: template.columns.reduce((styles, colId, index) => {
          if (['harga_perolehan', 'nilai_sisa', 'akumulasi_penyusutan'].includes(colId)) {
            styles[index] = { halign: 'right' };
          }
          return styles;
        }, {} as any)
      });

      // Footer
      if (template.includeFooter) {
        const finalY = (doc as any).lastAutoTable.finalY;
        const footerY = Math.max(finalY + 20, pageHeight - 30);
        
        doc.setDrawColor(200);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, margin, footerY);
        doc.text('Sistem Inventaris STTPU', pageWidth - margin - 40, footerY);
        
        if (template.includeQRCode) {
          // QR Code placeholder
          doc.setFillColor(240, 240, 240);
          doc.rect(pageWidth - margin - 20, footerY - 20, 15, 15, 'F');
          doc.setFontSize(6);
          doc.text('QR', pageWidth - margin - 12.5, footerY - 10, { align: 'center' });
        }
      }

      // Save the PDF
      const date = new Date().toISOString().split('T')[0];
      doc.save(`${filename}_${template.name.replace(/\s+/g, '_')}_${date}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat laporan PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = () => {
    if (selectedTemplate) {
      generatePDF(selectedTemplate);
    } else if (availableTemplates.length === 1) {
      generatePDF(availableTemplates[0]);
    } else if (availableTemplates.length > 1) {
      setShowTemplateDropdown(!showTemplateDropdown);
    }
  };

  const handleTemplateChange = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDropdown(false);
    // Auto generate when template is selected
    generatePDF(template);
  };

  const handleChangeTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateDropdown(true);
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={handleGeneratePDF}
        disabled={isGenerating || assets.length === 0}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm text-sm font-medium
          ${isGenerating || assets.length === 0
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:-translate-y-0.5'}
          transition-all duration-300
        `}
      >
        <DocumentTextIcon className="h-4 w-4" />
        <span>{isGenerating ? 'Membuat PDF...' : 'Laporan PDF'}</span>
        {assets.length > 0 && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-800">
            {assets.length}
          </span>
        )}
        {availableTemplates.length > 1 && !selectedTemplate && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Template Dropdown */}
      {showTemplateDropdown && availableTemplates.length > 1 && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm z-20">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 px-2 py-1 mb-2">Pilih Template:</div>
            {availableTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateChange(template)}
                className="w-full text-left px-2 py-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500">{template.description}</div>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs px-1 py-0.5 bg-gray-100 rounded">
                    {template.orientation === 'portrait' ? '📄' : '📑'}
                  </span>
                  <span className="text-xs px-1 py-0.5 bg-gray-100 rounded">
                    {template.columns.length} kolom
                  </span>
                  {template.isDefault && (
                    <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                      Default
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64 z-10">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium text-gray-900">{selectedTemplate.name}</div>
              {selectedTemplate.isDefault && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  Default
                </span>
              )}
            </div>
            <div className="text-gray-600 text-xs mb-2">{selectedTemplate.description}</div>
            <div className="flex flex-wrap gap-1 text-xs mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {selectedTemplate.orientation === 'portrait' ? '📄 Portrait' : '📑 Landscape'}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                📊 {selectedTemplate.columns.length} kolom
              </span>
              {selectedTemplate.includeStats && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  📈 Statistik
                </span>
              )}
            </div>
            <div className="pt-2 border-t">
              <button
                onClick={handleChangeTemplate}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                🔄 Pilih template lain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFReportGenerator;
