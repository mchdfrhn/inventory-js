import type { Asset } from '../services/api';

interface AssetDetailViewProps {
  asset: Asset;
}

export default function AssetDetailView({ asset }: AssetDetailViewProps) {const formatDate = (dateStr: string) => {
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
      case 'tidak_memadai': return 'Tidak Memadai';
      default: return 'Baik';
    }
  };

  const normalizedStatus = normalizeStatus(asset.status);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="mr-2">{asset.nama}</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {asset.kode}
          </span>
        </h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 border-b pb-2">Informasi Umum</h3>
            <dl className="grid grid-cols-1 gap-y-3">
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.category?.name || 'Tidak Terkategori'}</dd>
              </div>
                <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Spesifikasi</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.spesifikasi || ''}</dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Jumlah</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.quantity} {asset.satuan}</dd>
              </div>
                <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Lokasi</dt>                <dd className="text-sm text-gray-900 col-span-2">
                  {asset.lokasi_id && asset.location_info ? 
                    `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
                    : asset.lokasi || ''}
                </dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${normalizedStatus === 'baik' ? 'bg-green-100 text-green-800' : 
                      normalizedStatus === 'rusak' ? 'bg-red-100 text-red-800' :
                      normalizedStatus === 'tidak_memadai' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {formatStatusLabel(normalizedStatus)}
                  </span>
                </dd>
              </div>
                <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Keterangan</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.keterangan || ''}</dd>
              </div>
            </dl>
          </div>
          
          {/* Financial Info */}
          <div className="bg-blue-50 p-5 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 border-b pb-2">Informasi Keuangan</h3>
            <dl className="grid grid-cols-1 gap-y-3">
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Tanggal Perolehan</dt>
                <dd className="text-sm text-gray-900 col-span-2">{formatDate(asset.tanggal_perolehan)}</dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Harga Perolehan</dt>
                <dd className="text-sm text-gray-900 col-span-2 font-semibold">{formatCurrency(asset.harga_perolehan)}</dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Umur Ekonomis</dt>
                <dd className="text-sm text-gray-900 col-span-2">{asset.umur_ekonomis_tahun} tahun ({asset.umur_ekonomis_bulan} bulan)</dd>
              </div>
              
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Akumulasi Penyusutan</dt>
                <dd className="text-sm text-gray-900 col-span-2">{formatCurrency(asset.akumulasi_penyusutan)}</dd>
              </div>
                <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Nilai Buku Saat Ini</dt>
                <dd className="text-sm text-gray-900 col-span-2 font-bold">{formatCurrency(asset.nilai_sisa)}</dd>
              </div>
              
              {/* Calculate remaining useful life */}
              {(() => {
                const acquisitionDate = new Date(asset.tanggal_perolehan);
                const currentDate = new Date();
                
                // Calculate months passed
                const monthsPassed = 
                  (currentDate.getFullYear() - acquisitionDate.getFullYear()) * 12 + 
                  (currentDate.getMonth() - acquisitionDate.getMonth());
                
                const remainingMonths = Math.max(0, asset.umur_ekonomis_bulan - monthsPassed);
                const remainingYears = Math.floor(remainingMonths / 12);
                const extraMonths = remainingMonths % 12;
                
                // Calculate percentage remaining
                const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingMonths / asset.umur_ekonomis_bulan) * 100)));
                
                // Determine color based on remaining percentage
                let barColor = "bg-red-500";
                if (percentRemaining > 75) barColor = "bg-green-500";
                else if (percentRemaining > 50) barColor = "bg-blue-500";
                else if (percentRemaining > 25) barColor = "bg-yellow-500";
                
                const remainingText = remainingMonths <= 0 
                  ? "Habis masa pakai" 
                  : `${remainingYears} tahun ${extraMonths} bulan`;
                
                return (
                  <div className="grid grid-cols-3 mt-2">
                    <dt className="text-sm font-medium text-gray-500">Sisa Masa Manfaat</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span>{remainingText}</span>
                          <span className="text-xs">{percentRemaining}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percentRemaining}%` }}></div>
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
  );
}
