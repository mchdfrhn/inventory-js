import React from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onDelete }) => {
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
        
        <Link to={`/assets/${asset.id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 truncate">
            {asset.nama}
          </h3>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{asset.spesifikasi}</p>
        </Link>
        
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
        )}</div>      <div className="grid grid-cols-3 gap-1 mt-2">
        <Link 
          to={`/assets/${asset.id}`}
          className="flex items-center justify-center py-2 px-1 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 mr-1 group-hover:scale-110">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
          </svg>
          <span>Detail</span>
        </Link>
        <Link 
          to={`/assets/edit/${asset.id}`}
          className="flex items-center justify-center py-2 px-1 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors group"
        >
          <PencilIcon className="h-3.5 w-3.5 mr-1 group-hover:scale-110" />
          <span>Ubah</span>
        </Link>
        <button
          onClick={() => onDelete(asset)}
          className="flex items-center justify-center py-2 px-1 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors group"
        >
          <TrashIcon className="h-3.5 w-3.5 mr-1 group-hover:scale-110" />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );
};

export default AssetCard;
