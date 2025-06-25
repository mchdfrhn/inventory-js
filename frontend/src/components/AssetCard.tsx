import React from 'react';
import { Link } from 'react-router-dom';
import type { Asset } from '../services/api';

// Status styling with gradient backgrounds
const statusGradients = {
  baik: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
  rusak: 'from-rose-50 to-rose-100 border-rose-200 text-rose-800',
  tidak_memadai: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
};

interface AssetCardProps {
  asset: Asset;
  onDelete: (asset: Asset) => void;
  onDetailClick: (asset: Asset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onDelete, onDetailClick }) => {
  // Calculate depreciation percentage
  const depreciationPercentage = asset.harga_perolehan > 0
    ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
    : 0;
  
  // Color based on percentage
  let barColor = "bg-green-500";
  if (depreciationPercentage > 75) barColor = "bg-red-500";
  else if (depreciationPercentage > 50) barColor = "bg-yellow-500";
  else if (depreciationPercentage > 25) barColor = "bg-blue-500";
  // Format status label - shorter version for cards
  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case 'baik': return 'Baik';
      case 'rusak': return 'Rusak';
      case 'tidak_memadai': return 'Kurang Baik'; // Shorter label for card view
      default: return 'Baik'; // Default to 'Baik' if invalid status
    }
  };
  // Ensure we always have a valid status
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

  const normalizedStatus = normalizeStatus(asset.status);
  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="p-5">        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{asset.kode}</span>
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
        </div>        <div className="mt-3">
          <p className="text-xs text-gray-500">Lokasi</p>
          <p className="text-sm truncate">            {asset.lokasi_id && asset.location_info ? 
              `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
              : asset.lokasi || ''}
          </p>
        </div>
        
        {asset.keterangan && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">Keterangan</p>
            <p className="text-sm line-clamp-2">{asset.keterangan}</p>
          </div>
        )}</div>      <div className="grid grid-cols-2 gap-1 mt-2">
        <Link 
          to={`/assets/edit/${asset.id}`}
          className="flex items-center justify-center py-2 px-1 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors group"
        >
          <svg className="h-3.5 w-3.5 mr-1 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          <span className="leading-none">Ubah</span>
        </Link>
        <button
          onClick={() => onDelete(asset)}
          className="flex items-center justify-center py-2 px-1 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors group"
        >
          <svg className="h-3.5 w-3.5 mr-1 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          <span className="leading-none">Hapus</span>
        </button>
      </div>
    </div>
  );
};

export default AssetCard;
