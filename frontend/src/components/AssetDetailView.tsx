import type { Asset } from '../services/api';

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
    if (!dateStr) return '';
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
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Enhanced Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{asset.nama}</h2>
            <p className="text-blue-100 mt-1">{asset.spesifikasi}</p>
          </div>
          <div className="text-right">
            <span className="bg-white bg-opacity-20 text-white text-sm font-medium px-3 py-1 rounded-full">
              {asset.kode}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 border-b pb-2">Informasi Umum</h3>            <dl className="grid grid-cols-1 gap-y-4">
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.category?.name || 'Tidak Terkategori'}</dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Spesifikasi</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.spesifikasi || '-'}</dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Jumlah</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {asset.quantity} {asset.satuan}
                  </span>
                </dd>
              </div>
                <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Lokasi</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {asset.lokasi_id && asset.location_info ? (
                    <div className="space-y-2">
                      <div className="font-medium text-blue-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {asset.location_info.name}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {asset.location_info.code}
                        </span>
                        {asset.location_info.building && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {asset.location_info.building}
                          </span>
                        )}
                        {asset.location_info.floor && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0" />
                            </svg>
                            Lt. {asset.location_info.floor}
                          </span>
                        )}
                        {asset.location_info.room && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            {asset.location_info.room}
                          </span>
                        )}
                      </div>
                      {asset.location_info.description && (
                        <div className="text-xs text-gray-500 mt-2 italic bg-gray-50 p-2 rounded border-l-2 border-blue-300">
                          <span className="font-medium text-gray-600">Deskripsi: </span>
                          {asset.location_info.description}
                        </div>
                      )}
                    </div>
                  ) : asset.lokasi ? (
                    <div className="space-y-2">
                      <div className="flex items-center font-medium">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {asset.lokasi}
                      </div>
                      <div className="text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Data Legacy - Belum menggunakan sistem lokasi baru
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400 italic">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Lokasi belum ditentukan</span>
                    </div>
                  )}
                </dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium bg-gradient-to-r ${statusGradients[normalizedStatus] || 'from-gray-50 to-gray-100 border-gray-200'} shadow-sm transition-all duration-300 hover:scale-105 border`}>
                    {formatStatusLabel(normalizedStatus)}
                  </span>
                </dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Keterangan</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.keterangan || '-'}</dd>
              </div>
            </dl>
          </div>          {/* Financial Info - Enhanced */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Informasi Keuangan & Penyusutan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acquisition Information */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-3 text-sm uppercase tracking-wide">Data Perolehan</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal Perolehan</dt>
                    <dd className="text-sm text-gray-900 font-medium mt-1">{formatDate(asset.tanggal_perolehan)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asal Perolehan</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {asset.asal_pengadaan || 'Tidak Diketahui'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Harga Perolehan</dt>
                    <dd className="text-lg text-gray-900 font-bold mt-1 text-green-600">{formatCurrency(asset.harga_perolehan)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Umur Ekonomis</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                        {asset.umur_ekonomis_tahun} tahun ({asset.umur_ekonomis_bulan} bulan)
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Current Value Information */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-3 text-sm uppercase tracking-wide">Nilai Saat Ini</h4>
                <dl className="space-y-3">
                  {/* Estimasi Nilai Saat Ini (dashboard logic) */}
                  {(() => {
                    // Dashboard logic: straight-line depreciation, min 20% residual value
                    const acquisitionDate = new Date(asset.tanggal_perolehan);
                    const currentDate = new Date();
                    const ageInMonths = (currentDate.getFullYear() - acquisitionDate.getFullYear()) * 12 + (currentDate.getMonth() - acquisitionDate.getMonth());
                    const economicLifeMonths = (asset.umur_ekonomis_tahun || 1) * 12;
                    const depreciation = economicLifeMonths > 0 ? Math.min(1, ageInMonths / economicLifeMonths) : 1;
                    const residualValue = 0.2 * asset.harga_perolehan;
                    const depreciatableValue = asset.harga_perolehan - residualValue;
                    const currentValue = asset.harga_perolehan - (depreciatableValue * depreciation);
                    const penyusutanPersen = Math.round(100 - ((currentValue / asset.harga_perolehan) * 100));
                    return (
                      <>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimasi Nilai Saat Ini</dt>
                          <dd className="text-lg text-gray-900 font-bold mt-1 text-blue-600">{formatCurrency(Math.round(currentValue))}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Penyusutan</dt>
                          <dd className="text-sm text-gray-900 mt-1">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                              {penyusutanPersen}%
                            </span>
                          </dd>
                        </div>
                      </>
                    );
                  })()}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Akumulasi Penyusutan</dt>
                    <dd className="text-sm text-gray-900 font-medium mt-1">{formatCurrency(asset.akumulasi_penyusutan)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nilai Buku Saat Ini</dt>
                    <dd className="text-lg text-gray-900 font-bold mt-1 text-orange-600">{formatCurrency(asset.nilai_sisa)}</dd>
                  </div>
                  {/* Sisa masa manfaat */}
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
                    const remainingText = remainingMonths <= 0 ? "Habis masa pakai" : `${remainingYears} tahun ${extraMonths} bulan`;
                    return (
                      <div className="mt-2">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sisa Masa Manfaat</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          <div className="flex flex-col">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{remainingText}</span>
                              <span className="text-xs font-medium">{percentRemaining}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`${barColor} h-2 rounded-full transition-all duration-300`} style={{ width: `${percentRemaining}%` }}></div>
                            </div>
                          </div>
                        </dd>
                      </div>
                    );
                  })()}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
