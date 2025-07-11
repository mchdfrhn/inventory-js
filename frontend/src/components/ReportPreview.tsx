import type { Asset } from '../services/api';

interface ReportTemplate {
  name: string;
  includeHeader: boolean;
  includeFilters: boolean;
  includeStats: boolean;
  includeChart: boolean;
  includeFooter: boolean;
  includeQRCode: boolean;
  headerColor: string;
  fontSize: number;
  columns: string[];
}

interface ReportPreviewProps {
  assets: Asset[];
  template: ReportTemplate;
}

export default function ReportPreview({ assets, template }: ReportPreviewProps) {
  // Validation
  if (!template) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
        Template tidak valid
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
        Tidak ada data untuk preview
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
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

    const categoryDistribution = assets.reduce((counts, asset) => {
      const category = asset.category?.name || 'Tidak Terkategori';
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalAssets,
      totalValue,
      totalDepreciation,
      currentValue,
      statusCounts,
      categoryDistribution
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
          ? `${asset.location_info.name}`
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
        return new Date(asset.tanggal_perolehan).toLocaleDateString('id-ID');
      case 'asal_pengadaan':
        return asset.asal_pengadaan || '';
      default:
        return '';
    }
  };

  const stats = calculateStats();

  return (
    <div className="w-full space-y-4">
      {/* Report Header Preview */}
      {template.includeHeader && (
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start">
            <div className="w-12 h-10 bg-gray-300 rounded flex items-center justify-center mr-3">
              <span className="text-xs text-gray-600">LOGO</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LAPORAN ASET INVENTARIS</h1>
              <p className="text-sm text-gray-600">SEKOLAH TINGGI TEKNIK PLN UNIKA JAKARTA</p>
              <div className="mt-1 flex gap-4 text-xs text-gray-500">
                <span>Template: {template.name}</span>
                <span>Tanggal: {new Date().toLocaleDateString('id-ID')}</span>
                {template.includeFilters && <span>Total Aset: {assets.length}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Preview */}
      {template.includeStats && (
        <div>
          <div 
            className="text-white px-3 py-2 rounded-t-lg font-semibold text-sm"
            style={{ backgroundColor: template.headerColor }}
          >
            RINGKASAN STATISTIK
          </div>
          <div className="border border-gray-200 rounded-b-lg overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{stats.totalAssets}</div>
                <div className="text-xs text-gray-600">Total Aset</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
                <div className="text-xs text-gray-600">Nilai Perolehan</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{formatCurrency(stats.totalDepreciation)}</div>
                <div className="text-xs text-gray-600">Total Penyusutan</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{formatCurrency(stats.currentValue)}</div>
                <div className="text-xs text-gray-600">Nilai Saat Ini</div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-3">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Distribusi Status</h4>
              <div className="flex gap-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs">Baik: {stats.statusCounts.baik || 0}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-xs">Rusak: {stats.statusCounts.rusak || 0}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                  <span className="text-xs">Tidak Memadai: {stats.statusCounts.tidak_memadai || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Preview */}
      {template.includeChart && (
        <div>
          <div 
            className="text-white px-3 py-2 rounded-t-lg font-semibold text-sm"
            style={{ backgroundColor: template.headerColor }}
          >
            GRAFIK DISTRIBUSI KATEGORI
          </div>
          <div className="border border-gray-200 rounded-b-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Distribusi per Kategori</h4>
                {Object.entries(stats.categoryDistribution).map(([category, count], index) => (
                  <div key={category} className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700">{category}</span>
                    <div className="flex items-center">
                      <div 
                        className="h-3 rounded mr-1"
                        style={{ 
                          width: `${Math.max((count / stats.totalAssets) * 60, 8)}px`,
                          backgroundColor: ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'][index % 5]
                        }}
                      ></div>
                      <span className="text-xs font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Persentase Status</h4>
                <div className="space-y-1">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 capitalize">{status}</span>
                      <span className="text-xs font-medium">
                        {((count / stats.totalAssets) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Preview */}
      <div>
        <div 
          className="text-white px-3 py-2 rounded-t-lg font-semibold text-sm"
          style={{ backgroundColor: template.headerColor }}
        >
          DAFTAR ASET ({assets.length} unit)
        </div>
        <div className="border border-gray-200 rounded-b-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {template.columns.map((columnId: string) => {
                    const columnLabel = {
                      'kode': 'Kode Aset',
                      'nama': 'Nama Aset',
                      'spesifikasi': 'Spesifikasi',
                      'kategori': 'Kategori',
                      'quantity': 'Jumlah',
                      'lokasi': 'Lokasi',
                      'status': 'Status',
                      'harga_perolehan': 'Harga Perolehan',
                      'nilai_sisa': 'Nilai Sisa',
                      'akumulasi_penyusutan': 'Akumulasi Penyusutan',
                      'umur_ekonomis': 'Umur Ekonomis',
                      'tanggal_perolehan': 'Tanggal Perolehan',
                      'asal_pengadaan': 'Asal Pengadaan'
                    }[columnId] || columnId;
                    
                    return (
                      <th
                        key={columnId}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {columnLabel}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.slice(0, 10).map((asset, index) => (
                  <tr key={asset.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {template.columns.map((columnId: string) => (
                      <td
                        key={columnId}
                        className="px-4 py-2 whitespace-nowrap text-xs text-gray-900"
                        style={{ fontSize: `${Math.max(template.fontSize - 2, 8)}px` }}
                      >
                        {getColumnValue(asset, columnId)}
                      </td>
                    ))}
                  </tr>
                ))}
                {assets.length > 10 && (
                  <tr>
                    <td
                      colSpan={template.columns.length}
                      className="px-4 py-2 text-center text-xs text-gray-500 italic"
                    >
                      ... dan {assets.length - 10} data lainnya
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Preview */}
      {template.includeFooter && (
        <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Dicetak pada: {new Date().toLocaleString('id-ID')}</span>
          <div className="flex items-center">
            <span className="mr-2">Sistem Inventaris STTPU</span>
            {template.includeQRCode && (
              <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-xs">QR</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
