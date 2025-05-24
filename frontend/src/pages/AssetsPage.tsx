import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assetApi, locationApi } from '../services/api';
import type { Asset } from '../services/api';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';
import ExportButton from '../components/ExportButton';
import AssetCard from '../components/AssetCard';
import ViewToggle from '../components/ViewToggle';
import { useNotification } from '../context/NotificationContext';

// Status styling with gradient backgrounds for a more modern look
const statusGradients: Record<string, string> = {
  // Current valid status values
  baik: 'from-green-50 to-green-100 border-green-200',
  rusak: 'from-red-50 to-red-100 border-red-200',
  tidak_memadai: 'from-yellow-50 to-yellow-100 border-yellow-200',
};

// Helper function to format status display text
const formatStatus = (status: string): string => {
  // Map status to display text
  if (status === 'baik') {
    return 'Baik';
  } else if (status === 'rusak') {
    return 'Rusak';
  } else if (status === 'tidak_memadai') {
    return 'Tidak Memadai';
  }
  return 'Baik'; // Default fallback
};



export default function AssetsPage() {  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [depreciationFilter, setDepreciationFilter] = useState<string>('all');
  const [acquisitionYearFilter, setAcquisitionYearFilter] = useState<string | null>(null);
  const [acquisitionSourceFilter, setAcquisitionSourceFilter] = useState<string | null>(null);
  // Temporary filter states that will only be applied when clicking "Terapkan Filter"
  const [tempFilter, setTempFilter] = useState<string | null>(null);
  const [tempDepreciationFilter, setTempDepreciationFilter] = useState<string>('all');
  const [tempAcquisitionYearFilter, setTempAcquisitionYearFilter] = useState<string | null>(null);
  const [tempAcquisitionSourceFilter, setTempAcquisitionSourceFilter] = useState<string | null>(null);
  // Loading state for filter button
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  // View type state (table or grid)
  const [viewType, setViewType] = useState<'table' | 'grid'>(
    localStorage.getItem('assetViewType') as 'table' | 'grid' || 'table'
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // Add notification hook
  const { addNotification } = useNotification();

  // Save view type preference
  useEffect(() => {
    localStorage.setItem('assetViewType', viewType);
  }, [viewType]);
  
  const queryClient = useQueryClient();  // Effect for page load animation
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['assets', page, pageSize],
    queryFn: () => assetApi.list(page, pageSize),
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setDeleteModalOpen(false);
      setAssetToDelete(null);
      addNotification('success', 'Aset berhasil dihapus');
    },
    onError: (err) => {
      setDeleteError('Gagal menghapus aset. Silakan coba lagi.');
      addNotification('error', 'Gagal menghapus aset. Silakan coba lagi.');
      console.error('Delete error:', err);
    }
  });

  // Open delete confirmation modal
  const openDeleteModal = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (assetToDelete) {
      deleteMutation.mutate(assetToDelete.id);
    }
  };  // Filter and search functionality
  const filteredAssets = data?.data.filter((asset: Asset) => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      asset.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.spesifikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.keterangan && asset.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Status filter with compatibility for old values
    let matchesFilter = !filter; // If no filter, everything matches
    if (filter) {
      if (filter === 'baik') {
        matchesFilter = formatStatus(asset.status).toLowerCase() === 'baik';
      } else if (filter === 'rusak') {
        matchesFilter = formatStatus(asset.status).toLowerCase() === 'rusak';
      } else if (filter === 'tidak_memadai') {
        matchesFilter = formatStatus(asset.status).toLowerCase().replace(' ', '_') === 'tidak_memadai';
      }
    }
    
    // Depreciation percentage filter
    const depreciationPercentage = asset.harga_perolehan > 0
      ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
      : 0;
    
    let matchesDepreciationFilter = true;
    if (depreciationFilter !== 'all') {
      // Extract range values
      const [min, max] = depreciationFilter.split('-').map(Number);
      matchesDepreciationFilter = depreciationPercentage >= min && depreciationPercentage <= max;
    }
    
    // Acquisition year filter
    let matchesAcquisitionYearFilter = true;
    if (acquisitionYearFilter) {
      const assetYear = asset.tanggal_perolehan ? new Date(asset.tanggal_perolehan).getFullYear().toString() : '';
      matchesAcquisitionYearFilter = assetYear === acquisitionYearFilter;
    }
    
    // Acquisition source filter
    let matchesAcquisitionSourceFilter = true;
    if (acquisitionSourceFilter) {
      matchesAcquisitionSourceFilter = asset.asal_pengadaan === acquisitionSourceFilter;
    }
    
    return matchesSearch && 
           matchesFilter && 
           matchesDepreciationFilter && 
           matchesAcquisitionYearFilter && 
           matchesAcquisitionSourceFilter;
  });
  // Handle Enter key press for delete confirmation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (deleteModalOpen && event.key === 'Enter' && !deleteMutation.isPending) {
        confirmDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteModalOpen, confirmDelete, deleteMutation.isPending]);  // Initialize temporary filter states with current filter values when panel opens
  useEffect(() => {
    if (filterPanelOpen) {
      console.log('Filter panel opened, setting temporary filters:', { 
        filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter 
      });
      setTempFilter(filter);
      setTempDepreciationFilter(depreciationFilter);
      setTempAcquisitionYearFilter(acquisitionYearFilter);
      setTempAcquisitionSourceFilter(acquisitionSourceFilter);
    }
  }, [filterPanelOpen, filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter]);
  
  // Watch for changes in the actual filter values for debugging
  useEffect(() => {
    console.log('Filter value changed:', { 
      filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter 
    });
  }, [filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter]);// Function to apply filters
  const applyFilters = () => {
    console.log('Applying filters:', { 
      tempFilter, 
      tempDepreciationFilter,
      tempAcquisitionYearFilter,
      tempAcquisitionSourceFilter
    });
    
    // Show loading state
    setIsApplyingFilter(true);
    
    // Apply the temporary filters to the actual filter state
    setTimeout(() => {
      setFilter(tempFilter);
      setDepreciationFilter(tempDepreciationFilter);
      setAcquisitionYearFilter(tempAcquisitionYearFilter);
      setAcquisitionSourceFilter(tempAcquisitionSourceFilter);
      
      // Reset to page 1 when applying filters
      setPage(1);
      
      // Hide loading state
      setIsApplyingFilter(false);
      
      // Close the filter panel after applying
      setFilterPanelOpen(false);
    }, 300); // Short delay for visual feedback
  };  // Initialize temporary filter state helper function
  const resetTempFiltersToDefaults = () => {
    setTempFilter(null);
    setTempDepreciationFilter('all');
    setTempAcquisitionYearFilter(null);
    setTempAcquisitionSourceFilter(null);
    console.log('Temporary filters reset to defaults');
  };

  // Reset all filters function
  const resetAllFilters = () => {
    setSearchTerm('');
    setFilter(null);
    setDepreciationFilter('all');
    setAcquisitionYearFilter(null);
    setAcquisitionSourceFilter(null);
    resetTempFiltersToDefaults();
    setPage(1);
    console.log('All filters have been cleared');
  };

  // Function to get location data for assets
  const fetchLocationDataForAssets = async (assets: Asset[]) => {
    const assetsWithLocations = await Promise.all(
      assets.map(async (asset) => {
        if (asset.lokasi_id && !asset.location_info) {
          try {
            const locationData = await locationApi.getLocationForAsset(asset.lokasi_id);
            return {
              ...asset,
              location_info: locationData
            };
          } catch (error) {
            console.error(`Error fetching location for asset ${asset.id}:`, error);
            return asset;
          }
        }
        return asset;
      })
    );
    return assetsWithLocations;
  };
  // When data loads, enrich assets with location data
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      const assetsWithLokasiId = data.data.filter(asset => asset.lokasi_id && !asset.location_info);
      if (assetsWithLokasiId.length > 0) {
        fetchLocationDataForAssets(data.data).then(enrichedAssets => {
          // Update the data with enriched assets
          queryClient.setQueryData(['assets', page, pageSize], {
            ...data,
            data: enrichedAssets
          });
        });
      }
    }
  }, [data, queryClient, page, pageSize]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-10 text-center">
          <Loader size="lg" message="Memuat aset..." />
        </GlassCard>
      </div>
    );
  }
  if (error) {
    return (
      <GlassCard className="p-6 border-l-4 border-red-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error memuat aset</h3>
            <div className="mt-2 text-sm text-red-700">
              {error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diharapkan'}
            </div>
            <div className="mt-4">
              <GradientButton 
                variant="danger"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Coba lagi
              </GradientButton>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard className="overflow-hidden">
        {/* Header section */}
        <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Aset</h2>
            <p className="mt-1 text-sm text-gray-500">
              Kelola semua aset inventaris STTPU dengan mudah dan efisien
            </p>
          </div>          <div>
            <Link to="/assets/new">
              <GradientButton variant="primary" className="flex items-center">
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Tambah Aset
              </GradientButton>
            </Link>
          </div>
        </div>

        {/* Search and filters */}
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30 flex flex-wrap justify-between items-center gap-4">
          {/* Search input */}
          <div className="relative rounded-md shadow-sm max-w-md flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="search"
              id="search-assets"
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all duration-300"
              placeholder="Cari aset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>          {/* Filter toggles and export */}
          <div className="flex items-center gap-3 flex-wrap">
            <ViewToggle currentView={viewType} onToggle={setViewType} />
            <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
            <ExportButton assets={filteredAssets || []} filename="daftar_aset_sttpu" />
            <div className="hidden sm:block h-6 w-px bg-gray-300"></div>            <button
              type="button"
              onClick={() => setFilterPanelOpen(true)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm text-sm
                ${filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-50'}
                transition-all duration-300
              `}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>{filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter ? 'Filter Aktif' : 'Filter'}</span>
              {(filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter) && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
                  {(filter ? 1 : 0) + 
                   (depreciationFilter !== 'all' ? 1 : 0) + 
                   (acquisitionYearFilter ? 1 : 0) + 
                   (acquisitionSourceFilter ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
          {/* Filter Side Panel */}
        <Transition.Root show={filterPanelOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-y-0 right-0 z-50 overflow-y-auto" onClose={setFilterPanelOpen}>
            <div className="flex h-full">
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>
                <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >                <div className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white pt-5 pb-4 shadow-xl">
                  <div className="px-6 flex items-center justify-between border-b border-gray-200 pb-4">
                    <Dialog.Title className="text-lg font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Filter Aset</Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-colors"
                      onClick={() => setFilterPanelOpen(false)}
                    >
                      <span className="sr-only">Tutup Panel</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex flex-col px-6 space-y-5 overflow-y-auto">                    {/* Status Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Status Aset
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                            name="status" 
                            value="" 
                            checked={tempFilter === null}
                            onChange={() => {
                              setTempFilter(null);
                            }} 
                          />
                          <span className="ml-2 text-sm">Semua Status</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" 
                            name="status" 
                            value="baik"
                            checked={tempFilter === 'baik'} 
                            onChange={() => {
                              setTempFilter('baik');
                            }}
                          />
                          <span className="ml-2 text-sm text-green-700">Baik</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                            name="status" 
                            value="rusak"
                            checked={tempFilter === 'rusak'} 
                            onChange={() => {
                              setTempFilter('rusak');
                            }}
                          />
                          <span className="ml-2 text-sm text-red-700">Rusak</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                            name="status" 
                            value="tidak_memadai"
                            checked={tempFilter === 'tidak_memadai'} 
                            onChange={() => {
                              setTempFilter('tidak_memadai');
                            }}
                          />
                          <span className="ml-2 text-sm text-yellow-700">Tidak Memadai</span>
                        </label>
                      </div>
                    </div>                      {/* Depreciation Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                        Nilai Penyusutan
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                            name="depreciation" 
                            value="all" 
                            checked={tempDepreciationFilter === 'all'}
                            onChange={() => {
                              setTempDepreciationFilter('all');
                            }} 
                          />
                          <span className="ml-2 text-sm">Semua Nilai</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" 
                              name="depreciation" 
                              value="0-25"
                              checked={tempDepreciationFilter === '0-25'} 
                              onChange={() => {
                                setTempDepreciationFilter('0-25');
                              }}
                            />
                            <span className="ml-2 text-sm text-green-700">0-25%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                              name="depreciation" 
                              value="26-50"
                              checked={tempDepreciationFilter === '26-50'} 
                              onChange={() => {
                                setTempDepreciationFilter('26-50');
                              }}
                            />
                            <span className="ml-2 text-sm text-blue-700">26-50%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                              name="depreciation" 
                              value="51-75"
                              checked={tempDepreciationFilter === '51-75'} 
                              onChange={() => {
                                setTempDepreciationFilter('51-75');
                              }}
                            />
                            <span className="ml-2 text-sm text-yellow-700">51-75%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                              name="depreciation" 
                              value="76-100"
                              checked={tempDepreciationFilter === '76-100'} 
                              onChange={() => {
                                setTempDepreciationFilter('76-100');
                              }}
                            />
                            <span className="ml-2 text-sm text-red-700">76-100%</span>
                          </label>
                        </div>
                      </div>
                    </div>
                      {/* Acquisition Year Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                        Tahun Perolehan
                      </h3>
                      <div className="relative">
                        <select 
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none bg-white pl-3 pr-10 py-2.5"
                          value={tempAcquisitionYearFilter || ''}
                          onChange={(e) => {
                            setTempAcquisitionYearFilter(e.target.value || null);
                          }}
                        >
                          <option value="">Semua Tahun</option>
                          {/* Generate options for the last 10 years */}
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <option key={year} value={year.toString()}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                      {/* Acquisition Source Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                        Asal Pengadaan
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            name="acquisitionSource"
                            value=""
                            checked={tempAcquisitionSourceFilter === null}
                            onChange={() => {
                              setTempAcquisitionSourceFilter(null);
                            }}
                          />
                          <span className="ml-2 text-sm">Semua</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {["Pembelian", "Bantuan", "Hibah", "STTST"].map((source) => (
                            <label key={source} className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                              <input
                                type="radio"
                                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                name="acquisitionSource"
                                value={source}
                                checked={tempAcquisitionSourceFilter === source}
                                onChange={() => {
                                  setTempAcquisitionSourceFilter(source);
                                }}
                              />
                              <span className="ml-2 text-sm">{source}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                      {/* Filter Actions */}
                    <div className="mt-6 px-1">
                      <div className="flex flex-col space-y-3">
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                          onClick={applyFilters}
                          disabled={isApplyingFilter}
                        >
                          {isApplyingFilter ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Menerapkan Filter...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Terapkan Filter
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          onClick={resetTempFiltersToDefaults}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset Filter
                        </button>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-center text-gray-500">
                        Klik di luar panel untuk menutup
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Assets Display - Table or Grid View */}
        <div className="overflow-hidden">
          {error ? (
            <div className="p-4 bg-red-50/80 border-l-4 border-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>              
                <div className="ml-3">
                  <p className="text-sm text-red-700">Error memuat aset. Silakan coba lagi.</p>
                </div>
              </div>
            </div>
          ) : viewType === 'grid' ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets?.length ? (
              filteredAssets.map((asset: Asset) => (
                <AssetCard 
                  key={asset.id}
                  asset={asset}
                  onDelete={openDeleteModal}
                />
              ))
            ) : (              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="rounded-full bg-gray-100/80 p-4">
                  <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
                </div>                        <p className="mt-4 text-lg font-medium text-gray-500">
                  {searchTerm || filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter 
                    ? 'Tidak ada aset yang cocok dengan kriteria pencarian Anda' 
                    : 'Tidak ada aset ditemukan'}
                </p>
                <p className="mt-1 text-sm text-gray-400 max-w-md text-center">
                  {searchTerm || filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter 
                    ? 'Coba ubah filter atau kriteria pencarian Anda'
                    : 'Mulai tambahkan aset inventaris Anda untuk mengelola dengan lebih baik'}
                </p>                {!searchTerm && !filter && depreciationFilter === 'all' && !acquisitionYearFilter && !acquisitionSourceFilter && (
                  <Link to="/assets/new" className="mt-6">
                    <GradientButton size="md" variant="primary" className="animate-pulse">
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Tambah Aset Pertama
                    </GradientButton>
                  </Link>
                )}{(searchTerm || filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter) && (
                  <button 
                    onClick={resetAllFilters}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Hapus semua filter
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/70">                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Aset</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Perolehan</th>                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Sisa</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyusutan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>              <tbody className="divide-y divide-gray-300/50">
                {filteredAssets?.length ? (
                  filteredAssets.map((asset: Asset) => (                    <tr key={asset.id} className="table-row-hover hover:bg-blue-50/30 transition-all">                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{asset.kode}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="flex items-center">
                          <div>
                            <Link to={`/assets/${asset.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                              {asset.nama}
                            </Link>
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
                          }).format(asset.harga_perolehan)}
                        </div>
                      </td>                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="text-sm text-gray-900">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(asset.nilai_sisa)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {(() => {
                          const depreciationPercentage = asset.harga_perolehan > 0
                            ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
                            : 0;
                          
                          // Color based on percentage
                          let barColor = "bg-green-500";
                          if (depreciationPercentage > 75) barColor = "bg-red-500";
                          else if (depreciationPercentage > 50) barColor = "bg-yellow-500";
                          else if (depreciationPercentage > 25) barColor = "bg-blue-500";
                          
                          return (
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-900 mb-1">{depreciationPercentage}%</div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${depreciationPercentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })()}                      </td>                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="text-sm text-gray-900">
                          {asset.lokasi_id && asset.location_info ? 
                            `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
                            : asset.lokasi || ''}
                        </div>
                      </td><td className="whitespace-nowrap px-3 py-4">
                        <span className={`status-badge inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium bg-gradient-to-r ${statusGradients[asset.status] || 'from-gray-50 to-gray-100 border-gray-200'} shadow-sm transition-all duration-300 hover:scale-105 border`}>
                          {formatStatus(asset.status)}
                        </span>                      </td>                      <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-5">
                          <Link 
                            to={`/assets/${asset.id}`}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 mr-1.5 group-hover:scale-110">
                              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                              <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                            </svg>
                            <span>Detail</span>
                          </Link>
                          <Link 
                            to={`/assets/edit/${asset.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                          >
                            <PencilIcon className="h-4 w-4 mr-1.5 group-hover:scale-110" />
                            <span>Ubah</span>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(asset)}
                            className="text-red-600 hover:text-red-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                          >
                            <TrashIcon className="h-4 w-4 mr-1.5 group-hover:scale-110" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100/80 p-4">
                          <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
                        </div>                        <p className="mt-4 text-lg font-medium text-gray-500">
                          {searchTerm || filter || depreciationFilter !== 'all' 
                            ? 'Tidak ada aset yang cocok dengan kriteria pencarian Anda' 
                            : 'Tidak ada aset ditemukan'}
                        </p>
                        <p className="mt-1 text-sm text-gray-400 max-w-md text-center">
                          {searchTerm || filter || depreciationFilter !== 'all' 
                            ? 'Coba ubah filter atau kriteria pencarian Anda' 
                            : 'Mulai tambahkan aset inventaris Anda untuk mengelola dengan lebih baik'}
                        </p>
                        {!searchTerm && !filter && depreciationFilter === 'all' && (
                          <Link to="/assets/new" className="mt-6">
                            <GradientButton size="md" variant="primary" className="animate-pulse">
                              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                              Tambah Aset Pertama
                            </GradientButton>
                          </Link>
                        )}                        {(searchTerm || filter || depreciationFilter !== 'all') && (                          
                          <button 
                            onClick={resetAllFilters}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Hapus semua filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="bg-white/50 px-4 py-3 flex items-center justify-between border-t border-gray-200/50 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{(page - 1) * pageSize + 1}</span> sampai{' '}
                <span className="font-medium">
                  {Math.min(page * pageSize, data.pagination.total_items)}
                </span>{' '}
                dari <span className="font-medium">{data.pagination.total_items}</span> data
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end space-x-3">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${page === 1 
                    ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                    : 'text-gray-700 hover:-translate-x-1 bg-white/70 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow'}`}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Sebelumnya
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.total_pages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${page === data.pagination.total_pages 
                    ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                    : 'text-gray-700 hover:translate-x-1 bg-white/70 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow'}`}
              >
                Berikutnya
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>        
        )}
        </div>
      </GlassCard>
      
      {/* Delete Confirmation Modal */}
      <Transition.Root show={deleteModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setDeleteModalOpen}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="glass-card inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Aset
                    </Dialog.Title>
                    <div className="mt-2">                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus{' '}
                        <span className="font-semibold">{assetToDelete?.nama}</span>? Tindakan ini tidak dapat dibatalkan.
                      </p>
                      {deleteError && (
                        <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">                  <GradientButton
                    variant="danger"
                    className="w-full sm:ml-3 sm:w-auto"
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                    autoFocus
                  >
                    {deleteMutation.isPending && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                  </GradientButton>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 hover:-translate-y-0.5"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
