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
  // Debug: log the asset data to console
  console.log('AssetDetailView received asset:', asset);

  // Ensure all numeric fields are properly parsed
  const parsedAsset = {
    ...asset,
    harga_perolehan: typeof asset.harga_perolehan === 'string' ? parseFloat(asset.harga_perolehan) : asset.harga_perolehan || 0,
    akumulasi_penyusutan: typeof asset.akumulasi_penyusutan === 'string' ? parseFloat(asset.akumulasi_penyusutan) : asset.akumulasi_penyusutan || 0,
    nilai_sisa: typeof asset.nilai_sisa === 'string' ? parseFloat(asset.nilai_sisa) : asset.nilai_sisa || 0,
    umur_ekonomis_tahun: typeof asset.umur_ekonomis_tahun === 'string' ? parseInt(asset.umur_ekonomis_tahun) : asset.umur_ekonomis_tahun || 0,
    umur_ekonomis_bulan: typeof asset.umur_ekonomis_bulan === 'string' ? parseInt(asset.umur_ekonomis_bulan) : asset.umur_ekonomis_bulan || 0,
    quantity: typeof asset.quantity === 'string' ? parseInt(asset.quantity) : asset.quantity || 0,
    bulk_total_count: typeof asset.bulk_total_count === 'string' ? parseInt(asset.bulk_total_count) : asset.bulk_total_count || 1,
  };

  // Debug: log the parsed asset data
  console.log('AssetDetailView parsed asset:', parsedAsset);

  // Calculate umur_ekonomis_bulan if it's 0 or missing
  if (parsedAsset.umur_ekonomis_bulan === 0 && parsedAsset.umur_ekonomis_tahun > 0) {
    parsedAsset.umur_ekonomis_bulan = parsedAsset.umur_ekonomis_tahun * 12;
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'Rp 0';
    }
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
      case 'tidak_memadai': return 'Tidak Memadai';
      default: return 'Baik';
    }
  };

  const normalizedStatus = normalizeStatus(parsedAsset.status);

  // Calculate bulk asset total values
  const getTotalHargaPerolehan = (asset: Asset): number => {
    const hargaPerolehan = typeof asset.harga_perolehan === 'string' ? parseFloat(asset.harga_perolehan) : asset.harga_perolehan || 0;
    const bulkCount = typeof asset.bulk_total_count === 'string' ? parseInt(asset.bulk_total_count) : asset.bulk_total_count || 1;
    
    if (asset.bulk_total_count && bulkCount > 1) {
      return hargaPerolehan * bulkCount;
    }
    return hargaPerolehan;
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
                  {parsedAsset.kode}
                </span>
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                {parsedAsset.nama}
              </h2>
              {parsedAsset.spesifikasi && (
                <p className="text-gray-600 text-xs leading-relaxed">{parsedAsset.spesifikasi}</p>
              )}
              {parsedAsset.is_bulk_parent && parsedAsset.bulk_total_count && (
                <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full">
                  <span className="text-xs font-medium text-purple-800">
                    🔢 Bulk Asset - {parsedAsset.bulk_total_count} Unit
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
                      {parsedAsset.category?.name || 'Tidak Terkategori'}
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
                        {parsedAsset.quantity} {parsedAsset.satuan || 'unit'}
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
                      {parsedAsset.lokasi_id && parsedAsset.location_info ? (
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600 text-xs">
                            {parsedAsset.location_info.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              {parsedAsset.location_info.code}
                            </span>
                            {parsedAsset.location_info.building && (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                Gedung {parsedAsset.location_info.building}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : parsedAsset.lokasi ? (
                        <div className="text-xs">{parsedAsset.lokasi}</div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Belum ditentukan</span>
                      )}
                    </dd>
                  </div>
                </div>

                {/* Description - if exists */}
                {parsedAsset.keterangan && (
                  <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-100/50">
                    <DocumentTextIcon className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs text-gray-500">Keterangan</dt>
                      <dd className="text-xs text-gray-900 leading-relaxed line-clamp-2">{parsedAsset.keterangan}</dd>
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
                    <div className="text-xs font-medium text-gray-900">{formatDate(parsedAsset.tanggal_perolehan)}</div>
                  </div>
                  <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                    <div className="text-xs text-gray-500 mb-1">Asal Pengadaan</div>
                    <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                      {parsedAsset.asal_pengadaan || 'Tidak Tersedia'}
                    </span>
                  </div>
                </div>

                {/* Financial Values - Compact */}
                <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                  <div className="text-xs text-gray-500 mb-1">
                    Harga Perolehan {parsedAsset.is_bulk_parent ? '(Per Unit)' : ''}
                  </div>
                  <div className="text-sm font-bold text-green-600">{formatCurrency(parsedAsset.harga_perolehan || 0)}</div>
                  {parsedAsset.is_bulk_parent && parsedAsset.bulk_total_count && (
                    <div className="mt-1 text-xs text-green-700">
                      Total: {formatCurrency(getTotalHargaPerolehan(parsedAsset) || 0)}
                    </div>
                  )}
                </div>

                <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                  <div className="text-xs text-gray-500 mb-1">Nilai Buku Saat Ini</div>
                  <div className="text-sm font-bold text-orange-600">
                    {formatCurrency(parsedAsset.nilai_sisa || 0)}
                  </div>
                  {parsedAsset.is_bulk_parent && parsedAsset.bulk_total_count && (
                    <div className="mt-1 text-xs text-orange-700">
                      Total: {formatCurrency((parsedAsset.nilai_sisa || 0) * (parsedAsset.bulk_total_count || 1))}
                    </div>
                  )}
                </div>

                {/* Depreciation - Compact */}
                <div className="bg-white/60 p-2 rounded-lg border border-white/20">
                  <div className="text-xs text-gray-500 mb-1">Penyusutan</div>
                  <div className="text-xs font-bold text-red-600 mb-1">{formatCurrency(parsedAsset.akumulasi_penyusutan || 0)}</div>
                  
                  {(() => {
                    const hargaPerolehan = parsedAsset.harga_perolehan || 0;
                    const akumulasiPenyusutan = parsedAsset.akumulasi_penyusutan || 0;
                    const depreciationPercentage = hargaPerolehan > 0
                      ? Math.round((akumulasiPenyusutan / hargaPerolehan) * 100)
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
                    {parsedAsset.umur_ekonomis_tahun || 0} tahun ({parsedAsset.umur_ekonomis_bulan || 0} bulan)
                  </div>
                  
                  {/* Remaining Life - Very Compact */}
                  {(() => {
                    const acquisitionDate = new Date(parsedAsset.tanggal_perolehan);
                    const currentDate = new Date();
                    const umurEkonomisBulan = parsedAsset.umur_ekonomis_bulan || 0;
                    
                    if (umurEkonomisBulan === 0) {
                      return (
                        <div className="mt-1 text-xs text-gray-500">
                          Umur ekonomis tidak ditentukan
                        </div>
                      );
                    }
                    
                    const monthsPassed = (currentDate.getFullYear() - acquisitionDate.getFullYear()) * 12 + (currentDate.getMonth() - acquisitionDate.getMonth());
                    const remainingMonths = Math.max(0, umurEkonomisBulan - monthsPassed);
                    const remainingYears = Math.floor(remainingMonths / 12);
                    const extraMonths = remainingMonths % 12;
                    const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingMonths / umurEkonomisBulan) * 100)));
                    
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
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`${barColor} h-1.5 rounded-full transition-all duration-500`} 
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
