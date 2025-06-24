import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, ChartBarIcon, EyeIcon, PlusIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assetApi } from '../services/api';
import type { Asset } from '../services/api';
import { templateService, columnOptions, defaultTemplates, type ReportTemplate } from '../services/templateService';
import { useNotification } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';
import jsPDF from 'jspdf';
// Import autoTable as a function
import autoTable from 'jspdf-autotable';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<ReportTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mounting animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to fetch all assets with pagination
  const fetchAllAssets = async (): Promise<Asset[]> => {
    let allAssets: Asset[] = [];
    let currentPage = 1;
    let hasMore = true;
    const pageSize = 100; // Backend max limit

    while (hasMore) {
      try {
        const response = await assetApi.list(currentPage, pageSize);
        allAssets = [...allAssets, ...response.data];
        
        // Check if there are more pages
        hasMore = response.pagination.has_next;
        currentPage++;
      } catch (error) {
        console.error('Error fetching assets page:', currentPage, error);
        break;
      }
    }

    return allAssets;
  };

  // Fetch assets
  const { data: allAssets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets-all'],
    queryFn: fetchAllAssets,
  });

  const assets: Asset[] = allAssets || [];

  useEffect(() => {
    loadTemplates();
    
    // Subscribe to template changes
    const unsubscribe = templateService.subscribe(loadTemplates);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadTemplates = () => {
    try {
      const allTemplates = templateService.getAllTemplates();
      setAvailableTemplates(allTemplates);

      // Set selected template to default
      const selected = templateService.getDefaultTemplate() || allTemplates[0];
      setSelectedTemplate(selected);
    } catch (error) {
      console.error('Error loading templates:', error);
      setAvailableTemplates(defaultTemplates);
      setSelectedTemplate(defaultTemplates[0]);
    }
  };

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
      case 'status': {
        const status = asset.status === 'baik' ? 'Baik' :
                      asset.status === 'rusak' ? 'Rusak' :
                      asset.status === 'tidak_memadai' ? 'Tidak Memadai' : 'Baik';
        return status;
      }
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
    console.log('GeneratePDF called with template:', template);
    console.log('Assets data:', assets);
    
    if (!template) {
      addNotification('error', 'Template tidak ditemukan');
      return;
    }
    
    if (!assets || assets.length === 0) {
      addNotification('error', 'Tidak ada data aset untuk dicetak');
      return;
    }

    if (!template.columns || template.columns.length === 0) {
      addNotification('error', 'Template tidak memiliki kolom yang dipilih');
      return;
    }
    
    setIsGenerating(true);
    addNotification('info', 'Memproses laporan PDF...', 3000);
    console.log('Starting PDF generation...');
    
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
        const hexToRgb = (hex: string): [number, number, number] => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
          ] : [30, 64, 175]; // default blue color
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
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        autoTable(doc, {
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
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Assets table
      const headers = template.columns.map(colId => 
        columnOptions.find(opt => opt.id === colId)?.label || colId
      );
      
      const tableData = assets.map(asset => 
        template.columns.map(colId => getColumnValue(asset, colId))
      );

      // Convert hex color to RGB helper function
      const hexToRgb = (hex: string): [number, number, number] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : [30, 64, 175]; // default blue color
      };

      const [r, g, b] = hexToRgb(template.headerColor);
      doc.setFillColor(r, g, b);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.text('DAFTAR ASET', margin + 5, yPosition + 1);
      
      yPosition += 10;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autoTable(doc, {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as any)
      });

      // Footer
      if (template.includeFooter) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Open PDF in print preview instead of download
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open in new window with print preview
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          // Auto-trigger print dialog after PDF loads
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        // Fallback: if popup blocked, download the file
        const date = new Date().toISOString().split('T')[0];
        const filename = `laporan_aset_${template.name.replace(/\s+/g, '_')}_${date}.pdf`;
        doc.save(filename);
      }
      
      console.log('PDF opened in print preview');
      addNotification('success', 'Laporan PDF berhasil dibuat dan dibuka');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show more specific error message using notification
      if (error instanceof Error) {
        addNotification('error', `Terjadi kesalahan saat membuat laporan PDF: ${error.message}`);
      } else {
        addNotification('error', 'Terjadi kesalahan saat membuat laporan PDF');
      }
    } finally {
      console.log('PDF generation completed, setting isGenerating to false');
      setIsGenerating(false);
    }
  };

  const setAsDefault = (templateId: string) => {
    try {
      const success = templateService.setDefaultTemplate(templateId);
      
      if (success) {
        loadTemplates(); // Reload templates to update isDefault flags
        
        const newDefault = availableTemplates.find(t => t.id === templateId);
        if (newDefault) {
          setSelectedTemplate(newDefault);
        }
        addNotification('success', 'Template default berhasil ditetapkan');
      } else {
        addNotification('error', 'Terjadi kesalahan saat menetapkan template default');
      }
    } catch (error) {
      console.error('Error setting default template:', error);
      addNotification('error', 'Terjadi kesalahan saat menetapkan template default');
    }
  };

  const stats = calculateStats();

  // Handle loading state
  if (isLoadingAssets) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-10 text-center">
          <Loader size="lg" message="Memuat data aset..." />
        </GlassCard>
      </div>
    );
  }

  // Handle error state
  if (!assets || assets.length === 0) {
    return (
      <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <GlassCard className="p-6 border-l-4 border-yellow-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">Tidak ada data aset</h3>
              <div className="mt-2 text-sm text-yellow-700">
                Tidak ada data aset yang tersedia untuk membuat laporan.
              </div>
              <div className="mt-4">
                <GradientButton 
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/assets')}
                >
                  Lihat Halaman Aset
                </GradientButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard className="overflow-hidden">
        {/* Header section */}
        <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Laporan Aset</h2>
            <p className="mt-1 text-sm text-gray-500">
              Generate laporan PDF dengan template yang dapat disesuaikan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Aset</div>
              <div className="text-2xl font-bold text-gray-900">{assets.length}</div>
            </div>
            <GradientButton 
              variant="secondary" 
              onClick={() => navigate('/template-management')}
              className="flex items-center"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Kelola Template
            </GradientButton>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Total Nilai</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(stats.totalValue)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Nilai Saat Ini</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(stats.currentValue)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Total Penyusutan</div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(stats.totalDepreciation)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Aset Baik</div>
              <div className="text-lg font-semibold text-blue-600">
                {stats.statusCounts.baik || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500">Total Nilai</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.totalValue)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500">Nilai Saat Ini</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(stats.currentValue)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500">Total Penyusutan</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatCurrency(stats.totalDepreciation)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500">Aset Baik</div>
                <div className="text-lg font-semibold text-blue-600">
                  {stats.statusCounts.baik || 0}
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    Template Laporan
                  </h2>
                  <button
                    onClick={() => navigate('/template-management')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Kelola Template
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col h-full min-h-[160px] ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {template.isDefault && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        </div>
                      )}
                      
                      <div className="mb-3 flex-grow">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {template.orientation === 'portrait' ? '📄 Portrait' : '📑 Landscape'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          📊 {template.columns.length} kolom
                        </span>
                        {template.includeStats && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            📈 Statistik
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end mt-auto">
                        {!template.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAsDefault(template.id);
                            }}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                            title="Set sebagai default"
                          >
                            ⭐ Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Selection Guide or Selected Template Info */}
            {!selectedTemplate ? (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  Pilih Template
                </h3>
                <p className="text-blue-700 text-sm">
                  Pilih template laporan dari daftar di sebelah kiri untuk melihat preview dan mulai mencetak laporan.
                </p>
                <div className="mt-3 text-xs text-blue-600">
                  💡 Tip: Klik pada template card untuk memilihnya
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <EyeIcon className="h-5 w-5 text-blue-600" />
                  Template Terpilih
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{selectedTemplate.name}</span>
                      {selectedTemplate.isDefault && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Orientasi:</span>
                      <span className="text-gray-900">
                        {selectedTemplate.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Font Size:</span>
                      <span className="text-gray-900">{selectedTemplate.fontSize}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kolom:</span>
                      <span className="text-gray-900">{selectedTemplate.columns.length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span>{selectedTemplate.includeHeader ? '✅' : '❌'}</span>
                      <span>Header</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{selectedTemplate.includeFooter ? '✅' : '❌'}</span>
                      <span>Footer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{selectedTemplate.includeStats ? '✅' : '❌'}</span>
                      <span>Statistik</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{selectedTemplate.includeQRCode ? '✅' : '❌'}</span>
                      <span>QR Code</span>
                    </div>
                  </div>

                  <button
                    onClick={() => generatePDF(selectedTemplate)}
                    disabled={isGenerating || !selectedTemplate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyiapkan PDF...
                      </>
                    ) : (
                      <>
                        <DocumentTextIcon className="h-5 w-5" />
                        Cetak Laporan PDF
                      </>
                    )}
                  </button>

                  {/* Additional Template Info */}
                  <div className="mt-6 space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Kolom yang Akan Dicetak</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedTemplate.columns.map((colId, index) => {
                          const columnOption = [
                            { id: 'kode', label: 'Kode Aset' },
                            { id: 'nama', label: 'Nama Aset' },
                            { id: 'kategori', label: 'Kategori' },
                            { id: 'lokasi', label: 'Lokasi' },
                            { id: 'status', label: 'Status' },
                            { id: 'harga_perolehan', label: 'Harga Perolehan' },
                            { id: 'nilai_sisa', label: 'Nilai Sisa' },
                            { id: 'akumulasi_penyusutan', label: 'Akumulasi Penyusutan' },
                            { id: 'umur_ekonomis', label: 'Umur Ekonomis' },
                            { id: 'tanggal_perolehan', label: 'Tanggal Perolehan' },
                            { id: 'asal_pengadaan', label: 'Asal Pengadaan' }
                          ].find(opt => opt.id === colId);
                          
                          return (
                            <div key={colId} className="flex items-center text-sm">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                {index + 1}
                              </span>
                              <span className="text-gray-700">
                                {columnOption?.label || colId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Preview Data</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Aset:</span>
                          <span className="font-medium text-gray-900">{assets.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Kolom:</span>
                          <span className="font-medium text-gray-900">{selectedTemplate.columns.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Font Size:</span>
                          <span className="font-medium text-gray-900">{selectedTemplate.fontSize}px</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Informasi Laporan</h4>
                      <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Tanggal Cetak:</span>
                          <span className="font-medium text-blue-900">
                            {new Date().toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Waktu:</span>
                          <span className="font-medium text-blue-900">
                            {new Date().toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          📄 Laporan akan dibuka di print preview browser
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ReportsPage;
