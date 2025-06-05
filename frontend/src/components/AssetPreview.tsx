import React from 'react';
import type { Asset } from '../services/api';

interface AssetPreviewProps {
  asset: Partial<Asset>;
  className?: string;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ asset, className = '' }) => {
  // Format as currency
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Map status to badge styling
  const getStatusBadgeClass = (status?: string): string => {
    switch(status) {
      case 'baik': 
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rusak': 
      case 'disposed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'tidak_memadai':
      case 'maintenance': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_use':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
    // Format status label
  const formatStatusLabel = (status?: string): string => {
    if (!status) return '-';
    switch (status) {
      case 'baik': return 'Baik';
      case 'rusak': return 'Rusak';
      case 'tidak_memadai': return 'Kurang Baik'; // Shorter label
      case 'available': return 'Tersedia';
      case 'in_use': return 'Digunakan';
      case 'maintenance': return 'Pemeliharaan';
      case 'disposed': return 'Dibuang';
      default: return String(status).replace(/_/g, ' ');
    }
  };
  
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-5 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pratinjau Aset</h3>
      
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-medium">
              {asset.nama ? asset.nama.substring(0, 2).toUpperCase() : 'AS'}
            </span>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-900">{asset.nama || 'Nama Aset'}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono">
              {asset.kode || 'AS-XXX'}
            </span>            {asset.status && (
              <span className={`inline-flex text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${getStatusBadgeClass(asset.status)}`}>
                {formatStatusLabel(asset.status)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500">Kategori</p>
          <p className="text-sm font-medium">{asset.category?.name || 'Tidak Terkategori'}</p>
        </div>        <div className="bg-gray-50 p-3 rounded">          <p className="text-xs text-gray-500">Lokasi</p>          <p className="text-sm font-medium">
            {asset.lokasi_id && asset.location_info ? 
              `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
              : asset.lokasi || ''}
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 pb-2">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Informasi Aset</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-xs text-gray-500">Spesifikasi</p>
            <p className="text-sm">{asset.spesifikasi || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Jumlah</p>
            <p className="text-sm">{asset.quantity || 0} {asset.satuan || 'unit'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tanggal Perolehan</p>
            <p className="text-sm">{formatDate(asset.tanggal_perolehan)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Umur Ekonomis</p>
            <p className="text-sm">{asset.umur_ekonomis_tahun || 0} tahun</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-2">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Informasi Keuangan</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-xs text-gray-500">Harga Perolehan</p>
            <p className="text-sm font-medium">{formatCurrency(asset.harga_perolehan)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nilai Sisa</p>
            <p className="text-sm font-medium">{formatCurrency(asset.nilai_sisa)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Penyusutan</p>
            <p className="text-sm font-medium">{formatCurrency(asset.akumulasi_penyusutan)}</p>
          </div>
        </div>
      </div>
      
      {asset.keterangan && (
        <div className="border-t border-gray-200 pt-4 mt-2">
          <p className="text-xs text-gray-500">Keterangan</p>
          <p className="text-sm mt-1">{asset.keterangan}</p>
        </div>
      )}
    </div>
  );
};

export default AssetPreview;
