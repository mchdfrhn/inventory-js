import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Asset } from '../services/api';
import { assetApi } from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FuturisticLoader from './FuturisticLoader';

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
  getTotalAkumulasiPenyusutan: (asset: Asset) => number;
  onStatusUpdate?: (message: string, type: 'success' | 'error') => void;
}

const BulkTableRow: React.FC<BulkTableRowProps> = ({ 
  asset, 
  onDelete, 
  onDetailClick,
  formatStatus,
  getTotalHargaPerolehan,
  getTotalNilaiSisa,
  getTotalAkumulasiPenyusutan,
  onStatusUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<'baik' | 'rusak' | 'tidak_memadai'>('baik');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch bulk assets if this is a bulk parent
  const { data: bulkAssets, isLoading } = useQuery({
    queryKey: ['bulk-assets', asset.bulk_id],
    queryFn: () => assetApi.getBulkAssets(asset.bulk_id!),
    enabled: Boolean(asset.is_bulk_parent && asset.bulk_id && isExpanded),
  });

  // Mutation for updating individual asset status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ assetId, status }: { assetId: string; status: 'baik' | 'rusak' | 'tidak_memadai' }) => {
      // Get current asset data first
      const currentAsset = bulkAssets?.data?.find(a => a.id === assetId);
      if (!currentAsset) throw new Error('Asset not found');
      
      // Send only the status field for update
      const updateData = { status };
      
      console.log('Updating asset status:', { assetId, updateData });
      
      return assetApi.update(assetId, updateData);
    },
    onSuccess: () => {
      // Invalidate and refetch bulk assets
      queryClient.invalidateQueries({ queryKey: ['bulk-assets', asset.bulk_id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      
      if (onStatusUpdate) {
        onStatusUpdate('Status asset berhasil diubah', 'success');
      }
      
      // Reset states
      setEditingStatus(null);
      setShowConfirmation(false);
      setNewStatus('baik');
    },
    onError: (error: unknown) => {
      console.error('Error updating status:', error);
      
      let errorMessage = 'Gagal mengubah status asset';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const regularError = error as { message: string };
        errorMessage = regularError.message;
      }
      
      if (onStatusUpdate) {
        onStatusUpdate(errorMessage, 'error');
      }
      
      // Reset states
      setEditingStatus(null);
      setShowConfirmation(false);
      setNewStatus('baik');
    },
  });

  // Status options
  const statusOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'tidak_memadai', label: 'Tidak Memadai' },
  ];

  // Confirm status update
  const confirmStatusUpdate = () => {
    if (editingStatus && newStatus) {
      updateStatusMutation.mutate({ assetId: editingStatus, status: newStatus });
    }
  };

  // Cancel status update
  const cancelStatusUpdate = () => {
    setEditingStatus(null);
    setShowConfirmation(false);
    setNewStatus('baik');
  };

  // Format status label
  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case 'baik': return 'Baik';
      case 'rusak': return 'Rusak';
      case 'tidak_memadai': return 'Tidak Memadai';
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

  const depreciationPercentage = (() => {
    const totalHargaPerolehan = getTotalHargaPerolehan(asset);
    const totalAkumulasiPenyusutan = getTotalAkumulasiPenyusutan(asset);
    
    return totalHargaPerolehan > 0
      ? Math.round((totalAkumulasiPenyusutan / totalHargaPerolehan) * 100)
      : 0;
  })();
  
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
        <td className="py-3 pl-4 pr-2 w-20">
          <div className="flex flex-col space-y-1">
            {isBulkAsset ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors text-left flex items-center space-x-1 truncate"
              >
                <span className="truncate">{asset.kode}</span>
                {isExpanded ? (
                  <ChevronDownIcon className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronRightIcon className="h-3 w-3 flex-shrink-0" />
                )}
              </button>
            ) : (
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md truncate">{asset.kode}</span>
            )}
            {isBulkAsset && (
              <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md truncate">
                📦 Bulk ({asset.bulk_total_count} unit)
              </span>
            )}
          </div>
        </td>
        <td className="px-2 py-3 max-w-48">
          <div className="flex items-center">
            <div className="min-w-0 flex-1">
              <button 
                onClick={() => onDetailClick(asset)}
                className="text-xs font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 text-left block truncate"
              >
                {asset.nama}
              </button>
              <div className="text-xs text-gray-500 line-clamp-2 break-words">{asset.spesifikasi}</div>
            </div>
          </div>
        </td>
        <td className="px-2 py-3 w-28">
          <div className="text-xs text-gray-900 truncate">{asset.category?.name || 'Tidak Terkategori'}</div>
        </td>
        <td className="px-2 py-3 w-28">
          <div className="text-xs text-gray-900 truncate">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(getTotalHargaPerolehan(asset))}
          </div>
        </td>
        <td className="px-2 py-3 w-28">
          <div className="text-xs text-gray-900 truncate">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(getTotalNilaiSisa(asset))}
          </div>
        </td>
        <td className="px-2 py-3 w-24">
          <div className="flex flex-col">
            <div className="text-xs text-gray-900 mb-1">{depreciationPercentage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className={`${barColor} h-1 rounded-full`} style={{ width: `${depreciationPercentage}%` }}></div>
            </div>
          </div>
        </td>
        <td className="px-2 py-3 max-w-32">
          <div className="text-xs text-gray-900 min-w-0">
            <div className="font-medium truncate">{asset.location_info?.name || asset.lokasi || 'Lokasi tidak tersedia'}</div>
            {asset.location_info?.building && (
              <div className="text-gray-500 text-xs truncate">
                Gedung {asset.location_info.building}
                {asset.location_info.floor && ` Lt. ${asset.location_info.floor}`}
                {asset.location_info.room && ` ${asset.location_info.room}`}
              </div>
            )}
          </div>
        </td>
        <td className="px-2 py-3 w-20">
          <span className={`status-badge inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${statusGradients[asset.status] || 'from-gray-50 to-gray-100 border-gray-200'} shadow-sm transition-all duration-300 hover:scale-105 border truncate`}>
            {formatStatus(asset.status)}
          </span>
        </td>
        <td className="py-3 pl-2 pr-4 text-right text-xs font-medium w-24 min-w-24 sticky-action-col">
          <div className="flex justify-end space-x-1.5">
            <Link 
              to={`/assets/edit/${asset.id}`}
              className={`${isBulkAsset ? 'text-purple-600 hover:text-purple-900' : 'text-blue-600 hover:text-blue-900'} flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1 py-1`}
              title={isBulkAsset ? 'Ubah bulk asset' : 'Ubah asset'}
            >
              <svg className="h-3.5 w-3.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              <span className="leading-none ml-1 mobile-hide-text">{isBulkAsset ? 'Ubah Semua' : 'Ubah'}</span>
            </Link>
            <button
              onClick={() => onDelete(asset)}
              className="text-red-600 hover:text-red-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1 py-1"
              title="Hapus asset"
            >
              <svg className="h-3.5 w-3.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <span className="leading-none ml-1 mobile-hide-text">Hapus</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded bulk assets rows */}
      {isExpanded && isBulkAsset && (
        <tr>
          <td colSpan={9} className="px-5 py-3 bg-gray-50">
            <div className="space-y-2.5">
              <h4 className="text-xs font-medium text-gray-900 mb-2">Asset dalam Bulk ini:</h4>
              {isLoading ? (
                <div className="text-center py-4">
                  <FuturisticLoader size="sm" variant="primary" text="Memuat data..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto">
                  {bulkAssets?.data?.map((bulkAsset: Asset) => (
                    <div key={bulkAsset.id} className="bg-white rounded-lg border border-gray-200 p-2.5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1.5">
                        <button
                          onClick={() => onDetailClick(bulkAsset)}
                          className="text-xs font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Klik untuk melihat detail asset"
                        >
                          {bulkAsset.kode}
                        </button>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingStatus(bulkAsset.id);
                              setNewStatus(bulkAsset.status as 'baik' | 'rusak' | 'tidak_memadai');
                              setShowConfirmation(true);
                            }}
                            className={`text-xs font-medium rounded-full px-2 py-0.5 border cursor-pointer bg-gradient-to-r ${statusGradients[normalizeStatus(bulkAsset.status)]} focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1`}
                            disabled={updateStatusMutation.isPending}
                            title="Klik untuk mengubah status"
                          >
                            <span>{formatStatusLabel(bulkAsset.status)}</span>
                            <svg className="w-3 h-3 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                          </button>
                        </div>
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
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-colors"
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
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <tr>
          <td colSpan={9} className="p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100 transform transition-all">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    Ubah Status Asset
                  </h3>
                </div>
                
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 border mb-4">
                    <p className="text-xs text-gray-500 mb-1">Asset Code:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {bulkAssets?.data?.find(a => a.id === editingStatus)?.kode}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Pilih Status Baru:
                    </label>
                    <div className="flex space-x-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setNewStatus(option.value as 'baik' | 'rusak' | 'tidak_memadai')}
                          className={`flex-1 p-2 rounded-lg border-2 transition-all relative ${
                            newStatus === option.value
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${statusGradients[normalizeStatus(option.value)]}`}>
                              {option.label}
                            </span>
                          </div>
                          {newStatus === option.value && (
                            <div className="absolute bottom-1 left-1">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelStatusUpdate}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    disabled={updateStatusMutation.isPending}
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center space-x-2"
                    disabled={updateStatusMutation.isPending || newStatus === bulkAssets?.data?.find(a => a.id === editingStatus)?.status}
                  >
                    {updateStatusMutation.isPending && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{updateStatusMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default BulkTableRow;
