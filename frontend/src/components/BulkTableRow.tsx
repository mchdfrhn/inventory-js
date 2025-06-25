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

interface BulkTableRowProps {
  asset: Asset;
  onDelete: (asset: Asset) => void;
  onDetailClick: (asset: Asset) => void;
  formatStatus: (status: string) => string;
  getTotalHargaPerolehan: (asset: Asset) => number;
  getTotalNilaiSisa: (asset: Asset) => number;
}

const BulkTableRow: React.FC<BulkTableRowProps> = ({ 
  asset, 
  onDelete, 
  onDetailClick,
  formatStatus,
  getTotalHargaPerolehan,
  getTotalNilaiSisa 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch bulk assets if this is a bulk parent
  const { data: bulkAssets, isLoading } = useQuery({
    queryKey: ['bulk-assets', asset.bulk_id],
    queryFn: () => assetApi.getBulkAssets(asset.bulk_id!),
    enabled: Boolean(asset.is_bulk_parent && asset.bulk_id && isExpanded),
  });

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

  const depreciationPercentage = asset.harga_perolehan > 0
    ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
    : 0;
  
  // Color based on percentage
  let barColor = "bg-green-500";
  if (depreciationPercentage > 75) barColor = "bg-red-500";
  else if (depreciationPercentage > 50) barColor = "bg-yellow-500";
  else if (depreciationPercentage > 25) barColor = "bg-blue-500";

  const isBulkAsset = asset.is_bulk_parent && asset.bulk_total_count && asset.bulk_total_count > 1;

  return (
    <>
      {/* Main row */}
      <tr className="table-row-hover hover:bg-blue-50/30 transition-all">
        <td className="whitespace-nowrap py-4 pl-6 pr-3">
          <div className="flex flex-col space-y-1">
            {isBulkAsset ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors text-left flex items-center space-x-1"
              >
                <span>{asset.kode}</span>
                {isExpanded ? (
                  <ChevronDownIcon className="h-3 w-3" />
                ) : (
                  <ChevronRightIcon className="h-3 w-3" />
                )}
              </button>
            ) : (
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{asset.kode}</span>
            )}
            {isBulkAsset && (
              <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                📦 Bulk ({asset.bulk_total_count} item)
              </span>
            )}
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <div className="flex items-center">
            <div>
              <button 
                onClick={() => onDetailClick(asset)}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 text-left"
              >
                {asset.nama}
              </button>
              <div className="text-sm text-gray-500">{asset.spesifikasi}</div>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <div className="text-sm text-gray-900">{asset.category?.name || 'Tidak Terkategori'}</div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <div className="text-sm text-gray-900">{asset.quantity} {asset.satuan}</div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <div className="text-sm text-gray-900">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(getTotalHargaPerolehan(asset))}
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <div className="text-sm text-gray-900">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(getTotalNilaiSisa(asset))}
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <div className="flex flex-col">
            <div className="text-xs text-gray-900 mb-1">{depreciationPercentage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${depreciationPercentage}%` }}></div>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <div className="text-sm text-gray-900">
            {asset.lokasi_id && asset.location_info ? 
              `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
              : asset.lokasi || ''}
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
          <span className={`status-badge inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium bg-gradient-to-r ${statusGradients[asset.status] || 'from-gray-50 to-gray-100 border-gray-200'} shadow-sm transition-all duration-300 hover:scale-105 border`}>
            {formatStatus(asset.status)}
          </span>
        </td>
        <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            <Link 
              to={`/assets/edit/${asset.id}`}
              className="text-blue-600 hover:text-blue-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
            >
              <svg className="h-4 w-4 mr-1.5 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Ubah</span>
            </Link>
            <button
              onClick={() => onDelete(asset)}
              className="text-red-600 hover:text-red-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
            >
              <svg className="h-4 w-4 mr-1.5 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Hapus</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded bulk assets rows */}
      {isExpanded && isBulkAsset && (
        <tr>
          <td colSpan={10} className="px-6 py-4 bg-gray-50">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Asset dalam Bulk ini:</h4>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Memuat data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {bulkAssets?.data?.map((bulkAsset: Asset) => (
                    <div key={bulkAsset.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {bulkAsset.kode}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${statusGradients[normalizeStatus(bulkAsset.status)]}`}>
                          {formatStatusLabel(bulkAsset.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">Sequence: {bulkAsset.bulk_sequence}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          <div>Nilai: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(bulkAsset.harga_perolehan)}</div>
                          <div>Sisa: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(bulkAsset.nilai_sisa)}</div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onDetailClick(bulkAsset)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                          >
                            Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default BulkTableRow;
