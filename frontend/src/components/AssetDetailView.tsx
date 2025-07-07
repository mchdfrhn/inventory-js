import type { Asset } from '../services/api';
import GlassCard from './GlassCard';
import { 
  TagIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Status styling with gradient backgrounds
const statusGradients = {
  baik: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
  rusak: 'from-rose-50 to-rose-100 border-rose-200 text-rose-800',
  tidak_memadai: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
};

interface AssetDetailViewProps {
  asset: Asset;
}

export default function AssetDetailView({ asset }: AssetDetailViewProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Normalize status to ensure valid values
  const normalizeStatus = (status: string): 'baik' | 'rusak' | 'tidak_memadai' => {
    if (status === 'baik' || status === 'rusak' || status === 'tidak_memadai') {
      return status as 'baik' | 'rusak' | 'tidak_memadai';
    }
    // Map old statuses to new ones as a fallback
    if (status === 'available' || status === 'in_use') {
      return 'baik';
    } else if (status === 'maintenance') {
      return 'tidak_memadai';
    } else if (status === 'disposed') {
      return 'rusak';
    }
    return 'baik'; // Default case
  };
  
  // Format status for display
  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case 'baik': return 'Baik';
      case 'rusak': return 'Rusak';
      case 'tidak_memadai': return 'Kurang Baik';
      default: return 'Baik';
    }
  };

  const normalizedStatus = normalizeStatus(asset.status);

  // Calculate bulk asset total values
  const getTotalHargaPerolehan = (asset: Asset): number => {
    if (asset.bulk_total_count && asset.bulk_total_count > 1) {
      return asset.harga_perolehan * asset.bulk_total_count;
    }
    return asset.harga_perolehan;
  };

  return (
    <div className="p-3 space-y-3">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-lg"></div>
        <GlassCard className="relative bg-white/60 backdrop-blur-sm border border-white/20" hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-blue-500/10 rounded-lg">
                  <TagIcon className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-xs font-medium px-2 py-0.5 bg-blue-50/80 rounded-full border border-blue-200/50">
                  {asset.kode}
                </span>
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                {asset.nama}
              </h2>
              {asset.spesifikasi && (
                <p className="text-gray-600 text-xs leading-relaxed">{asset.spesifikasi}</p>
              )}
              {asset.is_bulk_parent && asset.bulk_total_count && (
                <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full">
                  <span className="text-xs font-medium text-purple-800">
                    🔢 Bulk Asset - {asset.bulk_total_count} Unit
                  </span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${statusGradients[normalizedStatus] || 'from-gray-50 to-gray-100 border-gray-200'} border shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></div>
                {formatStatusLabel(normalizedStatus)}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content - Single Column for better height management */}
      <div className="space-y-3">
        {/* Combined Information Card - Compact Layout */}
        <GlassCard className="bg-white/80 backdrop-blur-sm border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Basic Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-blue-500/10 rounded-lg">
                  <InformationCircleIcon className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Informasi Umum</h3>
              </div>
              
              <div className="space-y-2">
                {/* Category */}
                <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-100/50">
                  <TagIcon className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs text-gray-500">Kategori</dt>
                    <dd className="text-xs font-medium text-gray-900 truncate">
                      {asset.category?.name || 'Tidak Terkategori'}
                    </dd>
                  </div>
                </div>
                
                {/* Quantity */}
                <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-100/50">
                  <ChartBarIcon className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs text-gray-500">Jumlah</dt>
                    <dd className="text-xs font-medium text-gray-900">
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {asset.quantity} {asset.satuan || 'unit'}
                      </span>
                    </dd>
                  </div>
                </div>

                {/* Location - Compact */}
                <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-100/50">
                  <MapPinIcon className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs text-gray-500">Lokasi</dt>
                    <dd className="text-xs text-gray-900">
                      {asset.lokasi_id && asset.location_info ? (
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600 text-xs">
                            {asset.location_info.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              {asset.location_info.code}
                            </span>
                            {asset.location_info.building && (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                {asset.location_info.building}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : asset.lokasi ? (
                        <div className="text-xs">{asset.lokasi}</div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Belum ditentukan</span>
                      )}
                    </dd>
                  </div>
                </div>

                {/* Description - if exists */}
                {asset.keterangan && (
                  <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-100/50">
                    <DocumentTextIcon className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs text-gray-500">Keterangan</dt>
                      <dd className="text-xs text-gray-900 leading-relaxed line-clamp-2">{asset.keterangan}</dd>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-blue-500/10 rounded-lg">
                  <CurrencyDollarIcon className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Informasi Keuangan</h3>
              </div>

              <div className="space-y-2">
                {/* Acquisition Info */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                    <div className="text-xs text-gray-500 mb-1">Tanggal Perolehan</div>
                    <div className="text-xs font-medium text-gray-900">{formatDate(asset.tanggal_perolehan)}</div>
                  </div>
                  <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                    <div className="text-xs text-gray-500 mb-1">Asal</div>
                    <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                      {asset.asal_pengadaan || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Financial Values - Compact */}
                <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                  <div className="text-xs text-gray-500 mb-1">
                    Harga Perolehan {asset.is_bulk_parent ? '(Per Unit)' : ''}
                  </div>
                  <div className="text-sm font-bold text-green-600">{formatCurrency(asset.harga_perolehan)}</div>
                  {asset.is_bulk_parent && asset.bulk_total_count && (
                    <div className="mt-1 text-xs text-green-700">
                      Total: {formatCurrency(getTotalHargaPerolehan(asset))}
                    </div>
                  )}
                </div>

                <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                  <div className="text-xs text-gray-500 mb-1">Nilai Buku Saat Ini</div>
                  <div className="text-sm font-bold text-orange-600">{formatCurrency(asset.nilai_sisa)}</div>
                </div>

                {/* Depreciation - Compact */}
                <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                  <div className="text-xs text-gray-500 mb-1">Penyusutan</div>
                  <div className="text-xs font-bold text-red-600 mb-1">{formatCurrency(asset.akumulasi_penyusutan)}</div>
                  
                  {(() => {
                    const depreciationPercentage = asset.harga_perolehan > 0
                      ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
                      : 0;
                    
                    let barColor = "bg-green-500";
                    if (depreciationPercentage > 75) barColor = "bg-red-500";
                    else if (depreciationPercentage > 50) barColor = "bg-yellow-500";
                    else if (depreciationPercentage > 25) barColor = "bg-blue-500";
                    
                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">{depreciationPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`${barColor} h-1.5 rounded-full transition-all duration-500`} 
                            style={{ width: `${depreciationPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Economic Life - Compact */}
                <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                  <div className="text-xs text-gray-500 mb-1">Umur Ekonomis</div>
                  <div className="text-xs font-medium text-gray-900">
                    {asset.umur_ekonomis_tahun} tahun
                  </div>
                  
                  {/* Remaining Life - Very Compact */}
                  {(() => {
                    const acquisitionDate = new Date(asset.tanggal_perolehan);
                    const currentDate = new Date();
                    const monthsPassed = (currentDate.getFullYear() - acquisitionDate.getFullYear()) * 12 + (currentDate.getMonth() - acquisitionDate.getMonth());
                    const remainingMonths = Math.max(0, asset.umur_ekonomis_bulan - monthsPassed);
                    const remainingYears = Math.floor(remainingMonths / 12);
                    const extraMonths = remainingMonths % 12;
                    const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingMonths / asset.umur_ekonomis_bulan) * 100)));
                    
                    let barColor = "bg-red-500";
                    if (percentRemaining > 75) barColor = "bg-green-500";
                    else if (percentRemaining > 50) barColor = "bg-blue-500";
                    else if (percentRemaining > 25) barColor = "bg-yellow-500";
                    
                    const remainingText = remainingMonths <= 0 ? "Habis" : `${remainingYears}th ${extraMonths}bl`;
                    
                    return (
                      <div className="mt-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Sisa: {remainingText}</span>
                          <span className="text-xs">{percentRemaining}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className={`${barColor} h-1 rounded-full transition-all duration-500`} 
                            style={{ width: `${percentRemaining}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
