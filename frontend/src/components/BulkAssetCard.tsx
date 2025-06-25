import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Asset } from '../services/api';
import { assetApi } from '../services/api';
import { useQuery } from '@tanstack/react-query';

// Status styling with gradient backgrounds
const statusGradients = {
  baik: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
  rusak: 'from-rose-50 to-rose-100 border-rose-200 text-rose-800',
  tidak_memadai: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
};

interface BulkAssetCardProps {
  asset: Asset;
  onDelete: (asset: Asset) => void;
  onDetailClick: (asset: Asset) => void;
}

const BulkAssetCard: React.FC<BulkAssetCardProps> = ({ asset, onDelete, onDetailClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Fetch bulk assets if this is a bulk parent
  const { data: bulkAssets, isLoading } = useQuery({
    queryKey: ['bulk-assets', asset.bulk_id],
    queryFn: () => assetApi.getBulkAssets(asset.bulk_id!),
    enabled: Boolean(asset.is_bulk_parent && asset.bulk_id && isExpanded),
  });

  // Calculate depreciation percentage
  const depreciationPercentage = asset.harga_perolehan > 0
    ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
    : 0;
  
  // Color based on percentage
  let barColor = "bg-green-500";
  if (depreciationPercentage > 75) barColor = "bg-red-500";
  else if (depreciationPercentage > 50) barColor = "bg-yellow-500";
  else if (depreciationPercentage > 25) barColor = "bg-blue-500";

  // Format status label
  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case 'baik': return 'Baik';
      case 'rusak': return 'Rusak';
      case 'tidak_memadai': return 'Kurang Baik';
      default: return 'Baik';
    }
  };

  // Ensure we always have a valid status
  const normalizeStatus = (status: string): 'baik' | 'rusak' | 'tidak_memadai' => {
    if (status === 'baik' || status === 'rusak' || status === 'tidak_memadai') {
      return status as 'baik' | 'rusak' | 'tidak_memadai';
    }
    return 'baik';
  };

  const normalizedStatus = normalizeStatus(asset.status);

  const isBulkAsset = asset.is_bulk_parent && asset.bulk_total_count && asset.bulk_total_count > 1;

  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{asset.kode}</span>
            {isBulkAsset && (
              <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                Bulk ({asset.bulk_total_count})
              </span>
            )}
          </div>
          <span className={`status-badge inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium bg-gradient-to-r ${statusGradients[normalizedStatus] || 'from-gray-50 to-gray-100 border-gray-200'} border shadow-sm whitespace-nowrap`}>
            {formatStatusLabel(normalizedStatus)}
          </span>
        </div>
        
        <div className="block">
          <button 
            onClick={() => onDetailClick(asset)}
            className="text-left w-full"
          >
            <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 truncate cursor-pointer">
              {asset.nama}
            </h3>
          </button>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{asset.spesifikasi}</p>
        </div>
        
        <div className="mt-3">
          <p className="text-xs text-gray-500">Kategori</p>
          <p className="text-sm font-medium">{asset.category?.name || 'Tidak Terkategori'}</p>
        </div>
        
        <div className="mt-2">
          <p className="text-xs text-gray-500">Nilai Perolehan</p>
          <p className="text-sm font-medium">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(asset.harga_perolehan)}
          </p>
        </div>
        
        <div className="mt-2">
          <p className="text-xs text-gray-500">Penyusutan ({depreciationPercentage}%)</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${depreciationPercentage}%` }}></div>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-gray-500">Lokasi</p>
          <p className="text-sm truncate">
            {asset.lokasi_id && asset.location_info ? 
              `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
              : asset.lokasi || ''}
          </p>
        </div>

        {asset.keterangan && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">Keterangan</p>
            <p className="text-sm line-clamp-2">{asset.keterangan}</p>
          </div>
        )}

        {/* Bulk expansion button */}
        {isBulkAsset && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-full py-2 px-3 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Sembunyikan Detail ({asset.bulk_total_count} item)
                </>
              ) : (
                <>
                  <ChevronRightIcon className="h-4 w-4 mr-1" />
                  Lihat Detail ({asset.bulk_total_count} item)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Expanded bulk assets */}
      {isExpanded && isBulkAsset && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Asset dalam Bulk ini:</h4>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-xs text-gray-500 mt-2">Memuat data...</p>
              </div>
            ) : (              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bulkAssets?.data?.map((bulkAsset: Asset) => (
                  <div key={bulkAsset.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{bulkAsset.kode}</p>
                      <p className="text-xs text-gray-500">Sequence: {bulkAsset.bulk_sequence}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${statusGradients[normalizeStatus(bulkAsset.status)]}`}>
                        {formatStatusLabel(bulkAsset.status)}
                      </span>
                      <button
                        onClick={() => onDetailClick(bulkAsset)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-1 mt-2">
        <Link 
          to={`/assets/edit/${asset.id}`}
          className="flex items-center justify-center py-2 px-1 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 mr-1 group-hover:scale-110">
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
          </svg>
          <span>Ubah</span>
        </Link>
        <button
          onClick={() => onDelete(asset)}
          className="flex items-center justify-center py-2 px-1 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 mr-1 group-hover:scale-110">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
          </svg>
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );
};

export default BulkAssetCard;
