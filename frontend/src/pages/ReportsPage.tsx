import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  XMarkIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { templateService, type ReportTemplate, defaultTemplates, columnOptions } from '../services/templateService';
import { useNotification } from '../context/NotificationContext';
import { useAssetFilters, type Asset } from '../hooks/useAssetFilters';
import { assetApi } from '../services/api';
import FilterSummary from '../components/FilterSummary';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // Initialize asset filters
  const {
    filters,
    filteredAssets,
    filterOptions,
    clearFilters,
    updateFilters,
    hasActiveFilters,
    getFilterSummary,
    totalAssets,
    filteredCount,
  } = useAssetFilters(assets);

  // Debug logging for asset filtering
  useEffect(() => {
    if (assets.length > 0) {
      console.log(`[ReportsPage] 📊 Assets state: ${assets.length} total aset`);
      console.log(`[ReportsPage] 🔍 Filtered assets: ${filteredAssets.length} aset (${hasActiveFilters() ? 'dengan filter' : 'tanpa filter'})`);
      
      if (hasActiveFilters()) {
        console.log(`[ReportsPage] 🎯 Filter aktif:`, filters);
        console.log(`[ReportsPage] 📈 Filter summary: ${getFilterSummary()}`);
        
        // Log filter reduction
        const reduction = ((assets.length - filteredAssets.length) / assets.length * 100).toFixed(1);
        console.log(`[ReportsPage] 📉 Filter mengurangi data sebesar ${reduction}% (${assets.length - filteredAssets.length} aset disaring)`);
      }
      
      // Log sample filtered data
      if (filteredAssets.length > 0) {
        console.log(`[ReportsPage] 🔬 Sample filtered asset:`, {
          id: filteredAssets[0]?.id,
          nama: filteredAssets[0]?.nama,
          kategori: filteredAssets[0]?.category?.name,
          lokasi: filteredAssets[0]?.lokasi,
          status: filteredAssets[0]?.status
        });
      }
    }
  }, [assets, filteredAssets, filters, hasActiveFilters, getFilterSummary]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);
  
  // Pastikan ada template yang terpilih ketika data templates berubah
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const defaultTemplate = templates.find(t => t.isDefault) || templates[0];
      setSelectedTemplate(defaultTemplate.id);
      console.log(`[ReportsPage] 🎯 Auto-select template: ${defaultTemplate.name}`);
    }
  }, [templates, selectedTemplate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[ReportsPage] 🔄 Memuat data aset...');
      
      // Use the same API service as AssetsPage
      console.log('[ReportsPage] 🔄 Memuat data aset menggunakan assetApi...');
      
      // Fetch all assets with pagination
      let allAssets: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      
      do {
        const response = await assetApi.listWithBulk(currentPage, 100);
        
        if (response.data && response.data.length > 0) {
          allAssets = [...allAssets, ...response.data];
          console.log(`[ReportsPage] ✅ Halaman ${currentPage}: +${response.data.length} aset`);
          
          // Update pagination info
          if (response.pagination) {
            totalPages = response.pagination.totalPages;
          }
        }
        
        currentPage++;
      } while (currentPage <= totalPages);
      
      console.log(`[ReportsPage] 📊 Total data dimuat: ${allAssets.length} aset`);
      
      // Transform API data to match our Asset interface
      const transformedAssets: Asset[] = allAssets.map((asset: unknown) => {
        const a = asset as any; // Type assertion for API data
        return {
          id: a.id,
          kode: a.kode,
          nama: a.nama,
          spesifikasi: a.spesifikasi || '',
          category: { 
            name: a.category?.name || 'Tidak Berkategori' 
          },
          lokasi: a.location_info?.name || a.lokasi || 'Tidak Diketahui',
          location_info: {
            name: a.location_info?.name || a.lokasi || '',
            building: a.location_info?.building || '',
            floor: a.location_info?.floor || '',
            room: a.location_info?.room || ''
          },
          status: a.status || 'baik',
          harga_perolehan: Number(a.harga_perolehan || 0),
          nilai_sisa: Number(a.nilai_sisa || 0),
          akumulasi_penyusutan: Number(a.akumulasi_penyusutan || 0),
          tanggal_perolehan: a.tanggal_perolehan || '',
          asal_pengadaan: a.asal_pengadaan || 'Tidak Diketahui',
          umur_ekonomis_tahun: Number(a.umur_ekonomis_tahun || 0),
          
          // Additional fields from API
          quantity: a.quantity || 1,
          satuan: a.satuan || 'unit',
          keterangan: a.keterangan || '',
          category_id: a.category_id || '',
          lokasi_id: a.lokasi_id,
          created_at: a.created_at || '',
          updated_at: a.updated_at || '',
          umur_ekonomis_bulan: a.umur_ekonomis_bulan || 0,
          bulk_id: a.bulk_id,
          bulk_sequence: a.bulk_sequence,
          is_bulk_parent: a.is_bulk_parent,
          bulk_total_count: a.bulk_total_count
        };
      });
      
      console.log(`[ReportsPage] 🔄 Data setelah transform (${transformedAssets.length} aset):`, transformedAssets.slice(0, 2));
      
      // Validasi data
      if (transformedAssets.length > 0) {
        console.log(`[ReportsPage] ✅ Data berhasil dimuat: ${transformedAssets.length} aset`);
        console.log(`[ReportsPage] 🏷️ Sample aset pertama:`, {
          id: transformedAssets[0].id,
          kode: transformedAssets[0].kode,
          nama: transformedAssets[0].nama,
          lokasi: transformedAssets[0].lokasi,
          harga_perolehan: transformedAssets[0].harga_perolehan
        });
      }
      
      const templatesData = [...defaultTemplates, ...templateService.getCustomTemplates()];
      
      // Urutkan template agar default template berada di posisi pertama
      const sortedTemplates = templatesData.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      
      setAssets(transformedAssets);
      setTemplates(sortedTemplates);
      
      // Set default template atau template pertama jika belum ada yang dipilih
      if (!selectedTemplate && sortedTemplates.length > 0) {
        const defaultTemplate = sortedTemplates.find(t => t.isDefault) || sortedTemplates[0];
        setSelectedTemplate(defaultTemplate.id);
        console.log(`[ReportsPage] 🎯 Template default dipilih: ${defaultTemplate.name}`);
      }
      
      console.log(`[ReportsPage] ✅ State berhasil diupdate: ${transformedAssets.length} aset, ${sortedTemplates.length} template`);
      
    } catch (error) {
      console.error('[ReportsPage] ❌ Error loading data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error memuat aset: ${errorMsg}`);
      addNotification('error', 'Gagal memuat data aset. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateStats = (assetsData: Asset[] = assets) => {
    if (!assetsData.length) return {
      totalValue: 0,
      currentValue: 0,
      totalDepreciation: 0,
      statusCounts: { baik: 0, rusak: 0, hilang: 0 }
    };

    const totalValue = assetsData.reduce((sum: number, asset: Asset) => 
      sum + (asset.harga_perolehan || 0), 0
    );
    
    const currentValue = assetsData.reduce((sum: number, asset: Asset) => 
      sum + (asset.nilai_sisa || 0), 0
    );
    
    const totalDepreciation = assetsData.reduce((sum: number, asset: Asset) => 
      sum + (asset.akumulasi_penyusutan || 0), 0
    );

    const statusCounts = assetsData.reduce((counts: Record<string, number>, asset: Asset) => {
      const status = asset.status || 'baik';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, { baik: 0, rusak: 0, hilang: 0 });

    return { totalValue, currentValue, totalDepreciation, statusCounts };
  };

  const stats = calculateStats(filteredAssets);
  const availableTemplates = templates;

  const generatePDF = async (template: ReportTemplate) => {
    try {
      setIsGenerating(true);
      console.log(`[ReportsPage] 📄 Memulai pembuatan laporan PDF: "${template.name}"`);
      addNotification('info', 'Sedang menyiapkan laporan PDF...');
      
      // Ensure we're using real data from database
      const assetsToExport = filteredAssets;
      
      console.log(`[ReportsPage] 🔢 Data untuk export: ${assetsToExport.length} aset`);
      console.log(`[ReportsPage] 🎯 Filter status: ${hasActiveFilters() ? 'AKTIF' : 'TIDAK AKTIF'}`);
      console.log(`[ReportsPage] 📊 Sample data:`, assetsToExport.slice(0, 2));
      
      if (assetsToExport.length === 0) {
        console.log(`[ReportsPage] ⚠️ Tidak ada data untuk dicetak`);
        addNotification('warning', 'Tidak ada data yang sesuai dengan filter untuk dicetak');
        return;
      }
      
      // Validasi data
      const validDataCount = assetsToExport.filter(asset => asset.id && asset.kode).length;
      console.log(`[ReportsPage] ✅ Data valid: ${validDataCount}/${assetsToExport.length} aset`);
      
      // Calculate stats based on data
      const filteredStats = calculateStats(assetsToExport);
      console.log(`[ReportsPage] 📊 Statistik:`, filteredStats);
      
      // Create HTML content for the report
      const reportContent = generateReportHTML(template, assetsToExport, filteredStats);
      console.log(`[ReportsPage] 📝 HTML report content generated (${reportContent.length} characters)`);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        console.log(`[ReportsPage] ❌ Popup diblokir oleh browser`);
        addNotification('error', 'Popup diblokir. Harap izinkan popup untuk mencetak laporan.');
        return;
      }
      
      console.log(`[ReportsPage] 🖨️ Print window berhasil dibuka`);
      
      // Write content to the new window
      printWindow.document.write(reportContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          const filterInfo = hasActiveFilters() 
            ? ` dengan filter aktif (${filteredCount} dari ${totalAssets} aset)` 
            : ` (${totalAssets} aset)`;
          console.log(`[ReportsPage] ✅ Print dialog triggered: ${filterInfo}`);
          addNotification('success', `Laporan "${template.name}" berhasil dibuat${filterInfo}`);
        }, 500);
      };
      
    } catch (error) {
      console.error('[ReportsPage] ❌ Error generating PDF:', error);
      addNotification('error', 'Gagal membuat laporan PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const setAsDefault = (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        addNotification('error', 'Template tidak ditemukan');
        return;
      }

      // Update templates - hapus isDefault dari semua template
      const templatesWithoutDefault = templates.map(t => ({
        ...t,
        isDefault: false
      }));
      
      // Buat template yang dipilih menjadi default
      const newDefaultTemplate = {
        ...template,
        isDefault: true
      };
      
      // Hapus template yang dipilih dari array dan letakkan di awal
      const otherTemplates = templatesWithoutDefault.filter(t => t.id !== templateId);
      const reorderedTemplates = [newDefaultTemplate, ...otherTemplates];
      
      setTemplates(reorderedTemplates);
      
      // Juga pilih template yang dijadikan default
      setSelectedTemplate(templateId);
      
      console.log(`[ReportsPage] 🔄 Template "${template.name}" dipindahkan ke posisi pertama dan dijadikan default`);
      addNotification('success', `Template "${template.name}" berhasil dijadikan default dan dipindahkan ke posisi pertama!`);
    } catch (error) {
      console.error('Error setting default template:', error);
      addNotification('error', 'Gagal mengatur template default');
    }
  };

  const generateReportHTML = (template: ReportTemplate, assets: Asset[], stats: { totalValue: number; currentValue: number; totalDepreciation: number; statusCounts: Record<string, number> }) => {
    const now = new Date();
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    // Generate filter information for the report
    const filterInfo = hasActiveFilters() ? getFilterSummary() : [];
    const filterSection = filterInfo.length > 0 ? `
      <div class="filter-info">
        <h3>Filter yang Diterapkan:</h3>
        <ul>
          ${filterInfo.map(filter => `<li>${filter}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    // Generate table headers based on template columns
    const tableHeaders = template.columns.map(col => {
      const columnConfig = columnOptions.find(opt => opt.id === col);
      return columnConfig ? columnConfig.label : col;
    }).join('</th><th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">');

    // Generate table rows
    const tableRows = assets.map((asset, index) => {
      const row = template.columns.map(col => {
        switch (col) {
          case 'kode': return asset.kode || '-';
          case 'nama': return asset.nama || '-';
          case 'spesifikasi': return asset.spesifikasi || '-';
          case 'quantity': return asset.quantity || 1;
          case 'satuan': return asset.satuan || 'unit';
          case 'kategori': return asset.category?.name || 'Tidak Berkategori';
          case 'lokasi': return asset.lokasi || asset.location_info?.name || 'Tidak Diketahui';
          case 'status': return asset.status || 'baik';
          case 'harga_perolehan': return formatCurrency(asset.harga_perolehan || 0);
          case 'nilai_sisa': return formatCurrency(asset.nilai_sisa || 0);
          case 'akumulasi_penyusutan': return formatCurrency(asset.akumulasi_penyusutan || 0);
          case 'umur_ekonomis_tahun': return asset.umur_ekonomis_tahun || 0;
          case 'tanggal_perolehan': return asset.tanggal_perolehan ? 
            new Date(asset.tanggal_perolehan).toLocaleDateString('id-ID') : '-';
          case 'asal_pengadaan': return asset.asal_pengadaan || 'Tidak Diketahui';
          case 'keterangan': return asset.keterangan || '-';
          default: return '-';
        }
      }).join('</td><td style="border: 1px solid #ddd; padding: 8px;">');
      
      return `<tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}"><td style="border: 1px solid #ddd; padding: 8px;">${row}</td></tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${template.name}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #2563eb;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-item .label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
            font-weight: 500;
          }
          .summary-item .value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 12px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: right;
            font-size: 12px;
            color: #666;
          }
          .report-info {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #1976d2;
            text-align: center;
          }
          .filter-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .filter-info h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #495057;
          }
          .filter-info ul {
            margin: 0;
            padding-left: 20px;
            font-size: 12px;
            color: #6c757d;
          }
          .filter-info li {
            margin-bottom: 4px;
          }
          .watermark {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #999;
            opacity: 0.7;
            font-style: italic;
          }
          .watermark .developer {
            font-weight: 600;
            color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${template.name}</h1>
          <p><strong>Sistem Inventaris Aset</strong></p>
          <p>Tanggal Cetak: ${formatDate(now)}</p>
        </div>

        ${filterSection}

        <div class="summary">
          <div class="summary-item">
            <div class="label">Total Aset</div>
            <div class="value">${assets.length}</div>
          </div>
          <div class="summary-item">
            <div class="label">Total Nilai Perolehan</div>
            <div class="value">${formatCurrency(stats.totalValue)}</div>
          </div>
          <div class="summary-item">
            <div class="label">Nilai Saat Ini</div>
            <div class="value">${formatCurrency(stats.currentValue)}</div>
          </div>
          <div class="summary-item">
            <div class="label">Total Penyusutan</div>
            <div class="value">${formatCurrency(stats.totalDepreciation)}</div>
          </div>
          <div class="summary-item">
            <div class="label">Status Baik</div>
            <div class="value">${stats.statusCounts.baik || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Status Rusak</div>
            <div class="value">${stats.statusCounts.rusak || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Status Hilang</div>
            <div class="value">${stats.statusCounts.hilang || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Tidak Memadai</div>
            <div class="value">${stats.statusCounts.tidak_memadai || 0}</div>
          </div>
        </div>

        <div class="report-info">
          📅 <strong>Waktu Generate:</strong> ${now.toLocaleString('id-ID')} | 
          📋 <strong>Template:</strong> ${template.name}
          ${hasActiveFilters() ? ` | 🔍 <strong>Filter Aktif</strong>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">${tableHeaders}</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Total Aset:</strong> ${assets.length}</p>
          <p>Dicetak pada: ${now.toLocaleString('id-ID')}</p>
          <p>Sistem Inventaris Aset - ${template.name}</p>
          <div class="watermark">
            🔧 Developed by <span class="developer">Mochammad Farhan Ali</span>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return <LoadingState message="Loading inventory data..." size="lg" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Backend Server Tidak Dapat Diakses"
        message={error}
        onRetry={loadData}
        retryLabel="Coba Lagi"
      />
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard hover={false} className="overflow-hidden">
        {/* Filter Controls */}
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30 flex flex-wrap justify-end items-center gap-3">
          {/* Right side - Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/template-management')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:-translate-y-0.5 transition-all duration-300"
            >
              <DocumentTextIcon className="h-3.5 w-3.5" />
              <span>Kelola Template</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
            <button
              type="button"
              onClick={() => setFilterPanelOpen(true)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium
                ${hasActiveFilters()
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-600 hover:from-gray-100 hover:to-gray-200'}
                hover:-translate-y-0.5 transition-all duration-300
              `}
            >
              <AdjustmentsHorizontalIcon className="h-3.5 w-3.5" />
              <span>{hasActiveFilters() ? 'Filter Aktif' : 'Filter'}</span>
              {hasActiveFilters() && (
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
                  {Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters() && (
          <div className="px-4 py-2.5">
            <FilterSummary
              filterSummary={getFilterSummary()}
              hasActiveFilters={hasActiveFilters()}
              filteredCount={filteredCount}
              totalAssets={totalAssets}
              onClearFilters={() => {
                clearFilters();
                addNotification('info', 'Filter dihapus. Menampilkan semua aset');
              }}
            />
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-2.5 bg-white/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50">
              <div className="text-xs text-gray-500">Total Nilai Perolehan</div>
              <div className="text-sm font-semibold text-green-600">
                {formatCurrency(stats.totalValue)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50">
              <div className="text-xs text-gray-500">Nilai Saat Ini</div>
              <div className="text-sm font-semibold text-blue-600">
                {formatCurrency(stats.currentValue)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50">
              <div className="text-xs text-gray-500">Total Penyusutan</div>
              <div className="text-sm font-semibold text-orange-600">
                {formatCurrency(stats.totalDepreciation)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50">
              <div className="text-xs text-gray-500">Aset Baik</div>
              <div className="text-sm font-semibold text-blue-600">
                {stats.statusCounts.baik || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel Dialog */}
        <Transition.Root show={filterPanelOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-y-0 right-0 z-50 overflow-y-auto" onClose={setFilterPanelOpen}>
            <div className="flex h-full">
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>
              
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto bg-white pt-5 pb-4 shadow-xl">
                  <div className="px-4 flex items-center justify-between border-b border-gray-200 pb-3">
                    <Dialog.Title className="text-base font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                      Filter Laporan
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-colors"
                      onClick={() => setFilterPanelOpen(false)}
                    >
                      <span className="sr-only">Tutup Panel</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="mt-3 px-4 flex-1 overflow-y-auto">
                    <div className="mt-3 flex flex-col space-y-4">
                      {/* Status Filter */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                          <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                          Status Aset
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500" 
                              name="status" 
                              value="" 
                              checked={filters.statuses.length === 0}
                              onChange={() => updateFilters({ ...filters, statuses: [] })} 
                            />
                            <span className="ml-2 text-xs">Semua Status</span>
                          </label>
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-green-600 border-gray-300 focus:ring-green-500" 
                              name="status" 
                              value="baik"
                              checked={filters.statuses.includes('baik') && filters.statuses.length === 1} 
                              onChange={() => updateFilters({ ...filters, statuses: ['baik'] })}
                            />
                            <span className="ml-2 text-xs text-green-700">Baik</span>
                          </label>
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-red-600 border-gray-300 focus:ring-red-500" 
                              name="status" 
                              value="rusak"
                              checked={filters.statuses.includes('rusak') && filters.statuses.length === 1} 
                              onChange={() => updateFilters({ ...filters, statuses: ['rusak'] })}
                            />
                            <span className="ml-2 text-xs text-red-700">Rusak</span>
                          </label>
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                              name="status" 
                              value="tidak_memadai"
                              checked={filters.statuses.includes('tidak_memadai') && filters.statuses.length === 1} 
                              onChange={() => updateFilters({ ...filters, statuses: ['tidak_memadai'] })}
                            />
                            <span className="ml-2 text-xs text-yellow-700">Tidak Memadai</span>
                          </label>
                        </div>
                      </div>

                      {/* Depreciation Filter */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                          <span className="inline-block w-2.5 h-2.5 bg-purple-500 rounded-full mr-2"></span>
                          Nilai Penyusutan
                        </h3>
                        <div className="space-y-2">
                          <label className="flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500" 
                              name="depreciation" 
                              value="all" 
                              checked={!filters.priceMin && !filters.priceMax}
                              onChange={() => updateFilters({ ...filters, priceMin: null, priceMax: null })} 
                            />
                            <span className="ml-2 text-xs">Semua Nilai</span>
                          </label>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                              <input 
                                type="radio" 
                                className="form-radio h-3.5 w-3.5 text-green-600 border-gray-300 focus:ring-green-500" 
                                name="depreciation" 
                                value="0-25"
                                checked={filters.priceMin === 0 && filters.priceMax === 25} 
                                onChange={() => updateFilters({ ...filters, priceMin: 0, priceMax: 25 })}
                              />
                              <span className="ml-2 text-xs text-green-700">0-25%</span>
                            </label>
                            
                            <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                              <input 
                                type="radio" 
                                className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500" 
                                name="depreciation" 
                                value="26-50"
                                checked={filters.priceMin === 26 && filters.priceMax === 50} 
                                onChange={() => updateFilters({ ...filters, priceMin: 26, priceMax: 50 })}
                              />
                              <span className="ml-2 text-xs text-blue-700">26-50%</span>
                            </label>
                            
                            <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                              <input 
                                type="radio" 
                                className="form-radio h-3.5 w-3.5 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                                name="depreciation" 
                                value="51-75"
                                checked={filters.priceMin === 51 && filters.priceMax === 75} 
                                onChange={() => updateFilters({ ...filters, priceMin: 51, priceMax: 75 })}
                              />
                              <span className="ml-2 text-xs text-yellow-700">51-75%</span>
                            </label>
                            
                            <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                              <input 
                                type="radio" 
                                className="form-radio h-3.5 w-3.5 text-red-600 border-gray-300 focus:ring-red-500" 
                                name="depreciation" 
                                value="76-100"
                                checked={filters.priceMin === 76 && filters.priceMax === 100} 
                                onChange={() => updateFilters({ ...filters, priceMin: 76, priceMax: 100 })}
                              />
                              <span className="ml-2 text-xs text-red-700">76-100%</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Acquisition Year Filter */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                          <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full mr-2"></span>
                          Tahun Perolehan
                        </h3>
                        <div className="relative">
                          <select 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs appearance-none bg-white pl-2.5 pr-8 py-2"
                            value={filters.dateFrom || ''}
                            onChange={(e) => updateFilters({ ...filters, dateFrom: e.target.value })}
                          >
                            <option value="">Semua Tahun</option>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() - i;
                              return (
                                <option key={year} value={year.toString()}>
                                  {year}
                                </option>
                              );
                            })}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Acquisition Source Filter */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                          <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>
                          Asal Pengadaan
                        </h3>
                        <div className="space-y-2">
                          <label className="flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                              name="acquisitionSource"
                              value=""
                              checked={filters.sources.length === 0}
                              onChange={() => updateFilters({ ...filters, sources: [] })}
                            />
                            <span className="ml-2 text-xs">Semua</span>
                          </label>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {["Pembelian", "Bantuan", "Hibah", "STTST"].map((source) => (
                              <label key={source} className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                                <input
                                  type="radio"
                                  className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  name="acquisitionSource"
                                  value={source}
                                  checked={filters.sources.includes(source) && filters.sources.length === 1}
                                  onChange={() => updateFilters({ ...filters, sources: [source] })}
                                />
                                <span className="ml-2 text-xs">{source}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                          <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
                          Kategori
                        </h3>
                        <div className="relative">
                          <select 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs appearance-none bg-white pl-2.5 pr-8 py-2"
                            value={filters.categories.length > 0 ? filters.categories[0] : ''}
                            onChange={(e) => updateFilters({ ...filters, categories: e.target.value ? [e.target.value] : [] })}
                          >
                            <option value="">Semua Kategori</option>
                            {filterOptions.categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Location Filter */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                          <span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-full mr-2"></span>
                          Lokasi
                        </h3>
                        <div className="relative">
                          <select 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs appearance-none bg-white pl-2.5 pr-8 py-2"
                            value={filters.locations.length > 0 ? filters.locations[0] : ''}
                            onChange={(e) => updateFilters({ ...filters, locations: e.target.value ? [e.target.value] : [] })}
                          >
                            <option value="">Semua Lokasi</option>
                            {filterOptions.locations.map((location) => (
                              <option key={location} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Active Filters - Show badge for active filters */}
                      {hasActiveFilters() && (
                        <div className="mt-4 mb-2 flex flex-wrap gap-2">
                          <h3 className="w-full text-xs font-medium text-gray-500 mb-1">Filter Aktif:</h3>
                          
                          {filters.categories.length > 0 && (
                            <div className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              <span>Kategori: </span>
                              <span className="ml-1 font-semibold">{filters.categories[0]}</span>
                              <button
                                type="button"
                                className="ml-1 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-green-600 hover:bg-green-200 hover:text-green-800 focus:outline-none"
                                onClick={() => updateFilters({ ...filters, categories: [] })}
                              >
                                <span className="sr-only">Hapus filter kategori</span>
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                          
                          {filters.locations.length > 0 && (
                            <div className="inline-flex items-center rounded-full bg-pink-50 border border-pink-200 px-2.5 py-0.5 text-xs font-medium text-pink-800">
                              <span>Lokasi: </span>
                              <span className="ml-1 font-semibold">{filters.locations[0]}</span>
                              <button
                                type="button"
                                className="ml-1 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-pink-600 hover:bg-pink-200 hover:text-pink-800 focus:outline-none"
                                onClick={() => updateFilters({ ...filters, locations: [] })}
                              >
                                <span className="sr-only">Hapus filter lokasi</span>
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Filter Actions */}
                      <div className="mt-4 px-1">
                        <div className="flex flex-col space-y-2">
                          <button
                            type="button"
                            className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                            onClick={() => {
                              setFilterPanelOpen(false);
                              addNotification('success', `Filter diterapkan. Menampilkan ${filteredCount} dari ${totalAssets} aset`);
                            }}
                          >
                            <CheckCircleIcon className="h-3.5 w-3.5 mr-2" />
                            Terapkan Filter
                          </button>
                          
                          <button
                            type="button"
                            className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            onClick={() => {
                              clearFilters();
                              setFilterPanelOpen(false);
                              addNotification('info', 'Filter dihapus. Menampilkan semua aset');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset Filter
                          </button>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-center text-gray-500">
                          Klik di luar panel untuk menutup
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Content */}
        <div className="p-3">
          {/* Available Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Template Tersedia</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Klik pada template untuk memilihnya, lalu gunakan tombol "Cetak Laporan"
                </p>
              </div>
                {selectedTemplate && (
                  <div className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                    <span className="font-medium">Template dipilih:</span> {templates.find(t => t.id === selectedTemplate)?.name}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 flex flex-col min-h-[160px] cursor-pointer ${
                      selectedTemplate === template.id 
                        ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/30' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3 flex-grow">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-base font-medium text-gray-900">
                              {template.name}
                            </h4>
                            {selectedTemplate === template.id && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Dipilih
                              </span>
                            )}
                            {template.isDefault && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {template.description}
                          </p>
                          <div className="text-xs text-gray-400">
                            {template.columns.length} kolom
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex space-x-1.5">
                          {selectedTemplate === template.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                generatePDF(template);
                              }}
                              disabled={isGenerating}
                              className="flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                              title="Cetak laporan PDF"
                            >
                              {isGenerating ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 border-b-2 border-transparent mr-1.5"></div>
                                  Membuat PDF...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                  </svg>
                                  Cetak Laporan
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {!template.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAsDefault(template.id);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 px-1.5 py-0.5 hover:bg-gray-100 rounded transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  };

  export default ReportsPage;
