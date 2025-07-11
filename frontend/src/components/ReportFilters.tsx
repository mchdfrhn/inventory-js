import React, { useState, Fragment } from 'react';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

interface FilterOptions {
  // Text filters
  searchText: string;
  kode: string;
  nama: string;
  spesifikasi: string;
  
  // Category filters
  categories: string[];
  
  // Location filters
  locations: string[];
  buildings: string[];
  floors: string[];
  
  // Status filters
  statuses: string[];
  
  // Date filters
  dateFrom: string;
  dateTo: string;
  
  // Financial filters
  priceMin: number | null;
  priceMax: number | null;
  valueMin: number | null;
  valueMax: number | null;
  
  // Condition filters
  conditions: string[];
  
  // Source filters
  sources: string[];
  
  // Age filters
  ageMin: number | null;
  ageMax: number | null;
}

interface ReportFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories?: string[];
  availableLocations?: string[];
  availableBuildings?: string[];
  availableFloors?: string[];
  availableStatuses?: string[];
  availableSources?: string[];
  totalAssets: number;
  filteredCount: number;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories = [],
  availableLocations = [],
  availableBuildings = [],
  availableFloors = [],
  availableStatuses = [],
  availableSources = [],
  totalAssets,
  filteredCount,
  onApplyFilters,
  onClearFilters
}) => {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues);
  };

  const hasActiveFilters = (): boolean => {
    return Boolean(
      filters.searchText ||
      filters.kode ||
      filters.nama ||
      filters.spesifikasi ||
      filters.categories.length > 0 ||
      filters.locations.length > 0 ||
      filters.buildings.length > 0 ||
      filters.floors.length > 0 ||
      filters.statuses.length > 0 ||
      filters.conditions.length > 0 ||
      filters.sources.length > 0 ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.priceMin !== null ||
      filters.priceMax !== null ||
      filters.valueMin !== null ||
      filters.valueMax !== null ||
      filters.ageMin !== null ||
      filters.ageMax !== null
    );
  };

  const handleApplyFilters = async () => {
    setIsApplyingFilter(true);
    try {
      await onApplyFilters();
      setFilterPanelOpen(false);
    } finally {
      setIsApplyingFilter(false);
    }
  };

  const handleClearFilters = () => {
    onClearFilters();
    setFilterPanelOpen(false);
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setFilterPanelOpen(true)}
        className={`
          inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium transition-all duration-200
          ${hasActiveFilters() 
            ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
        Filter
        {hasActiveFilters() && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {filteredCount}
          </span>
        )}
      </button>

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
            >
              <div className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto bg-white pt-5 pb-4 shadow-xl">
                <div className="px-6 flex items-center justify-between border-b border-gray-200 pb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                    Filter Laporan
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-colors"
                    onClick={() => setFilterPanelOpen(false)}
                  >
                    <span className="sr-only">Tutup Panel</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col px-6 space-y-5 overflow-y-auto">
                  {/* Search Filter */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Pencarian
                    </h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={filters.searchText}
                          onChange={(e) => updateFilter('searchText', e.target.value)}
                          placeholder="Cari kode, nama, atau spesifikasi..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          value={filters.kode}
                          onChange={(e) => updateFilter('kode', e.target.value)}
                          placeholder="Kode Aset (contoh: AST001)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <input
                          type="text"
                          value={filters.nama}
                          onChange={(e) => updateFilter('nama', e.target.value)}
                          placeholder="Nama Aset"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <input
                          type="text"
                          value={filters.spesifikasi}
                          onChange={(e) => updateFilter('spesifikasi', e.target.value)}
                          placeholder="Spesifikasi"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Filter */}
                  {availableCategories.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Kategori
                      </h3>
                      <div className="space-y-2">
                        {availableCategories.map((category) => (
                          <label
                            key={category}
                            className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category)}
                              onChange={() => toggleArrayFilter('categories', category)}
                              className="form-checkbox h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Filter */}
                  {availableStatuses.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        Status
                      </h3>
                      <div className="space-y-2">
                        {availableStatuses.map((status) => (
                          <label
                            key={status}
                            className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.statuses.includes(status)}
                              onChange={() => toggleArrayFilter('statuses', status)}
                              className="form-checkbox h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Filter */}
                  {(availableLocations.length > 0 || availableBuildings.length > 0 || availableFloors.length > 0) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
                        Lokasi
                      </h3>
                      
                      {availableLocations.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Ruangan</label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {availableLocations.map((location) => (
                              <label
                                key={location}
                                className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.locations.includes(location)}
                                  onChange={() => toggleArrayFilter('locations', location)}
                                  className="form-checkbox h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{location}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableBuildings.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Gedung</label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {availableBuildings.map((building) => (
                              <label
                                key={building}
                                className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.buildings.includes(building)}
                                  onChange={() => toggleArrayFilter('buildings', building)}
                                  className="form-checkbox h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{building}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableFloors.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Lantai</label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {availableFloors.map((floor) => (
                              <label
                                key={floor}
                                className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.floors.includes(floor)}
                                  onChange={() => toggleArrayFilter('floors', floor)}
                                  className="form-checkbox h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{floor}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Filter */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                      Filter Keuangan
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          <CurrencyDollarIcon className="h-3 w-3 inline mr-1" />
                          Harga Perolehan (Rp)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={filters.priceMin || ''}
                            onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Min"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                          <input
                            type="number"
                            value={filters.priceMax || ''}
                            onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Max"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          <CurrencyDollarIcon className="h-3 w-3 inline mr-1" />
                          Nilai Sisa (Rp)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={filters.valueMin || ''}
                            onChange={(e) => updateFilter('valueMin', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Min"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                          <input
                            type="number"
                            value={filters.valueMax || ''}
                            onChange={(e) => updateFilter('valueMax', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Max"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Filter */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                      Filter Lanjutan
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          <CalendarDaysIcon className="h-3 w-3 inline mr-1" />
                          Tanggal Perolehan
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => updateFilter('dateFrom', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                          <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => updateFilter('dateTo', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Umur Aset (Tahun)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={filters.ageMin || ''}
                            onChange={(e) => updateFilter('ageMin', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Min"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                          <input
                            type="number"
                            value={filters.ageMax || ''}
                            onChange={(e) => updateFilter('ageMax', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Max"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          />
                        </div>
                      </div>

                      {availableSources.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Asal Pengadaan
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {availableSources.map((source) => (
                              <label
                                key={source}
                                className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.sources.includes(source)}
                                  onChange={() => toggleArrayFilter('sources', source)}
                                  className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{source}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {hasActiveFilters() && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-2" />
                        Filter Aktif
                      </h3>
                      <div className="text-sm text-blue-800">
                        Menampilkan {filteredCount} dari {totalAssets} aset
                      </div>
                    </div>
                  )}

                  {/* Filter Actions */}
                  <div className="mt-6 px-1">
                    <div className="flex flex-col space-y-3">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        onClick={handleApplyFilters}
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
                            <FunnelIcon className="h-4 w-4 mr-2" />
                            Terapkan Filter
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        onClick={handleClearFilters}
                        disabled={!hasActiveFilters()}
                      >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Hapus Semua Filter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default ReportFilters;
