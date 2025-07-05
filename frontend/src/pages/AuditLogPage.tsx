import { useState, useEffect, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogApi, type AuditLog } from '../services/api';
import Pagination from '../components/Pagination';
import { 
  ClockIcon,
  UserIcon, 
  ComputerDesktopIcon,
  XMarkIcon,
  EyeIcon,
  ExclamationCircleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';

interface AuditLogFilters {
  entity_type: string;
  entity_id: string;
  action: string;
  from_date: string;
  to_date: string;
}

export default function AuditLogPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    // Try to get pageSize from localStorage, default to 20 if not found
    const savedPageSize = localStorage.getItem('auditLogPageSize');
    return savedPageSize ? parseInt(savedPageSize, 10) : 20;
  });
  const [filters, setFilters] = useState<AuditLogFilters>({
    entity_type: '',
    entity_id: '',
    action: '',
    from_date: '',
    to_date: ''
  });
  const [tempFilters, setTempFilters] = useState<AuditLogFilters>({
    entity_type: '',
    entity_id: '',
    action: '',
    from_date: '',
    to_date: ''
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    // Sync tempFilters with current filters on mount
    setTempFilters(filters);
  }, [filters]);

  // Save pageSize to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('auditLogPageSize', pageSize.toString());
  }, [pageSize]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', page, pageSize, filters],
    queryFn: () => auditLogApi.list({
      ...filters,
      page,
      page_size: pageSize
    }),
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    setIsApplyingFilter(true);
    try {
      setFilters(tempFilters);
      setPage(1); // Reset to first page when filters change
      setFilterPanelOpen(false);
    } finally {
      setIsApplyingFilter(false);
    }
  };

  const resetTempFiltersToDefaults = () => {
    setTempFilters({
      entity_type: '',
      entity_id: '',
      action: '',
      from_date: '',
      to_date: ''
    });
  };

  const clearFilters = () => {
    setFilters({
      entity_type: '',
      entity_id: '',
      action: '',
      from_date: '',
      to_date: ''
    });
    setTempFilters({
      entity_type: '',
      entity_id: '',
      action: '',
      from_date: '',
      to_date: ''
    });
    setPage(1);
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'update':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'delete':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'bulk_delete':
        return <div className="w-2 h-2 bg-red-600 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Dibuat';
      case 'update':
        return 'Diperbarui';
      case 'delete':
        return 'Dihapus';
      case 'bulk_delete':
        return 'Hapus Bulk';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'update':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'delete':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'bulk_delete':
        return 'text-red-800 bg-red-100 border-red-300';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderChanges = (log: AuditLog) => {
    if (!log.changes) return null;

    try {
      const changes = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
      
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-[11px] font-medium text-gray-900 mb-2">Perubahan:</h4>
          <div className="space-y-2">
            {Object.entries(changes).map(([field, change]: [string, any]) => (
              <div key={field} className="text-[10px]">
                <span className="font-medium text-gray-700">{field}:</span>
                <div className="ml-2 text-gray-600">
                  {change.from !== null && (
                    <div>Dari: <span className="text-red-600">{JSON.stringify(change.from)}</span></div>
                  )}
                  {change.to !== null && (
                    <div>Ke: <span className="text-green-600">{JSON.stringify(change.to)}</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-[10px] text-gray-500">Data perubahan tidak dapat ditampilkan</p>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <GlassCard hover={false} className="max-w-md w-full text-center">
          <div className="p-8">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-sm text-gray-500 mb-4">
              {error instanceof Error ? error.message : 'Gagal memuat riwayat aktivitas'}
            </p>
            <GradientButton variant="primary" onClick={() => window.location.reload()}>
              Coba Lagi
            </GradientButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard hover={false} className="overflow-hidden">
        {/* Filter controls */}
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterPanelOpen(true)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs
                  ${filters.entity_type || filters.entity_id || filters.action || filters.from_date || filters.to_date
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-50'}
                  transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
                `}
              >
                <AdjustmentsHorizontalIcon className="h-3.5 w-3.5" />
                <span>{filters.entity_type || filters.entity_id || filters.action || filters.from_date || filters.to_date ? 'Filter Aktif' : 'Filter'}</span>
                {(filters.entity_type || filters.entity_id || filters.action || filters.from_date || filters.to_date) && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
                    {(filters.entity_type ? 1 : 0) + 
                     (filters.entity_id ? 1 : 0) + 
                     (filters.action ? 1 : 0) + 
                     (filters.from_date ? 1 : 0) +
                     (filters.to_date ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
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
              >
                <div className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white pt-2.5 pb-2 shadow-xl">
                  <div className="px-4 flex items-center justify-between border-b border-gray-200 pb-2">
                    <Dialog.Title className="text-sm font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Filter Log Aktivitas</Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-colors"
                      onClick={() => setFilterPanelOpen(false)}
                    >
                      <span className="sr-only">Tutup Panel</span>
                      <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="mt-2 flex flex-col px-4 space-y-2.5 overflow-y-auto">
                    {/* Entity Type Filter */}
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <h3 className="text-xs font-medium text-gray-900 mb-1.5 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full mr-1.5"></span>
                        Jenis Entitas
                      </h3>
                      <div className="space-y-1">
                        <label className="flex items-center bg-white rounded-md px-2 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            name="entity_type"
                            value=""
                            checked={tempFilters.entity_type === ''}
                            onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                          />
                          <span className="ml-1.5 text-xs">Semua</span>
                        </label>
                        
                        <div className="grid grid-cols-1 gap-1">
                          {["asset", "category", "location"].map((type) => (
                            <label key={type} className="flex items-center bg-white rounded-md px-2 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                              <input
                                type="radio"
                                className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                name="entity_type"
                                value={type}
                                checked={tempFilters.entity_type === type}
                                onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                              />
                              <span className="ml-1.5 text-xs capitalize">{type === 'asset' ? 'Asset' : type === 'category' ? 'Kategori' : 'Lokasi'}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Filter */}
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <h3 className="text-xs font-medium text-gray-900 mb-1.5 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-purple-500 rounded-full mr-1.5"></span>
                        Aksi
                      </h3>
                      <div className="space-y-1">
                        <label className="flex items-center bg-white rounded-md px-2 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            name="action"
                            value=""
                            checked={tempFilters.action === ''}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                          />
                          <span className="ml-1.5 text-xs">Semua</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { value: "create", label: "Dibuat" },
                            { value: "update", label: "Diperbarui" },
                            { value: "delete", label: "Dihapus" },
                            { value: "bulk_delete", label: "Hapus Bulk" }
                          ].map((action) => (
                            <label key={action.value} className="flex items-center bg-white rounded-md px-2 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                              <input
                                type="radio"
                                className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                name="action"
                                value={action.value}
                                checked={tempFilters.action === action.value}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                              />
                              <span className="ml-1.5 text-xs">{action.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <h3 className="text-xs font-medium text-gray-900 mb-1.5 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5"></span>
                        Rentang Tanggal
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Dari Tanggal
                          </label>
                          <input
                            type="date"
                            value={tempFilters.from_date}
                            onChange={(e) => handleFilterChange('from_date', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Sampai Tanggal
                          </label>
                          <input
                            type="date"
                            value={tempFilters.to_date}
                            onChange={(e) => handleFilterChange('to_date', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Entity ID Filter */}
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <h3 className="text-xs font-medium text-gray-900 mb-1.5 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-orange-500 rounded-full mr-1.5"></span>
                        ID Entitas
                      </h3>
                      <input
                        type="text"
                        value={tempFilters.entity_id}
                        onChange={(e) => handleFilterChange('entity_id', e.target.value)}
                        placeholder="UUID entitas"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1.5"
                      />
                    </div>

                    {/* Active Filters */}
                    {(tempFilters.entity_type || tempFilters.entity_id || tempFilters.action || tempFilters.from_date || tempFilters.to_date) && (
                      <div className="mt-2.5 mb-1 flex flex-wrap gap-1">
                        <h3 className="w-full text-xs font-medium text-gray-500 mb-0.5">Filter Aktif:</h3>
                        
                        {tempFilters.entity_type && (
                          <div className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                            <span>Entitas: </span>
                            <span className="ml-1 font-semibold capitalize">
                              {tempFilters.entity_type === 'asset' ? 'Asset' : tempFilters.entity_type === 'category' ? 'Kategori' : 'Lokasi'}
                            </span>
                            <button
                              type="button"
                              className="ml-1 inline-flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none"
                              onClick={() => handleFilterChange('entity_type', '')}
                            >
                              <span className="sr-only">Hapus filter entitas</span>
                              <XMarkIcon className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                        
                        {tempFilters.action && (
                          <div className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-1.5 py-0.5 text-xs font-medium text-purple-800">
                            <span>Aksi: </span>
                            <span className="ml-1 font-semibold">
                              {tempFilters.action === 'create' ? 'Dibuat' : 
                               tempFilters.action === 'update' ? 'Diperbarui' : 
                               tempFilters.action === 'delete' ? 'Dihapus' : 
                               tempFilters.action === 'bulk_delete' ? 'Hapus Bulk' : tempFilters.action}
                            </span>
                            <button
                              type="button"
                              className="ml-1 inline-flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-800 focus:outline-none"
                              onClick={() => handleFilterChange('action', '')}
                            >
                              <span className="sr-only">Hapus filter aksi</span>
                              <XMarkIcon className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Filter Actions */}
                    <div className="mt-4 px-1">
                      <div className="flex flex-col space-y-2">
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                          onClick={applyFilters}
                          disabled={isApplyingFilter}
                        >
                          {isApplyingFilter ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Menerapkan Filter...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Terapkan Filter
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          onClick={resetTempFiltersToDefaults}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset Filter
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-2.5 border-t border-gray-200 text-xs text-center text-gray-500">
                        Klik di luar panel untuk menutup
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Content */}
        <div className="p-3">
          {/* Active Filters Display */}
          <Transition
            show={!!(filters.entity_type || filters.entity_id || filters.action || filters.from_date || filters.to_date)}
            enter="transition-all duration-300 ease-out"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all duration-300 ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-2"
          >
            <div className="mb-3 bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-gray-200/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-xs font-medium text-gray-700 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"/>
                    </svg>
                    Filter aktif:
                  </span>
                  
                  {filters.entity_type && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-800 transition-all duration-200 hover:bg-blue-100">
                      Entitas: {filters.entity_type === 'asset' ? 'Asset' : filters.entity_type === 'category' ? 'Kategori' : 'Lokasi'}
                    </span>
                  )}
                  
                  {filters.action && (
                    <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-medium text-purple-800 transition-all duration-200 hover:bg-purple-100">
                      Aksi: {filters.action === 'create' ? 'Dibuat' : 
                             filters.action === 'update' ? 'Diperbarui' : 
                             filters.action === 'delete' ? 'Dihapus' : 
                             filters.action === 'bulk_delete' ? 'Hapus Bulk' : filters.action}
                    </span>
                  )}
                  
                  {filters.from_date && (
                    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-800 transition-all duration-200 hover:bg-green-100">
                      Dari: {filters.from_date}
                    </span>
                  )}
                  
                  {filters.to_date && (
                    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-800 transition-all duration-200 hover:bg-green-100">
                      Sampai: {filters.to_date}
                    </span>
                  )}
                  
                  {filters.entity_id && (
                    <span className="inline-flex items-center rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-xs font-medium text-orange-800 transition-all duration-200 hover:bg-orange-100">
                      ID: {filters.entity_id.substring(0, 8)}...
                    </span>
                  )}
                </div>
                
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 px-1.5 py-0.5 rounded-md"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                  Bersihkan
                </button>
              </div>
            </div>
          </Transition>

          {/* Audit Logs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50">
            {data?.data && data.data.length > 0 ? (
              <div className="divide-y divide-gray-200/50">
                {data.data.map((log: AuditLog) => (
                <div key={log.id} className="p-3">
                  <div className="flex items-start space-x-3">
                    {/* Action indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </span>
                          <span className="text-[10px] font-medium text-gray-900 uppercase">
                            {log.entity_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1.5 text-[11px] text-gray-700">{log.description}</p>

                      {/* Metadata */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ComputerDesktopIcon className="h-2.5 w-2.5" />
                          <span>ID: {log.entity_id.substring(0, 8)}...</span>
                        </div>
                        {log.ip_address && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            <span>IP: {log.ip_address}</span>
                          </div>
                        )}
                        {log.user_id && (
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-2.5 w-2.5" />
                            <span>User: {log.user_id}</span>
                          </div>
                        )}
                      </div>

                      {/* Changes section (collapsible) */}
                      {log.changes && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="flex items-center space-x-1 text-[10px] text-indigo-600 hover:text-indigo-800"
                          >
                            <EyeIcon className="h-2.5 w-2.5" />
                            <span>
                              {expandedLogs.has(log.id) ? 'Sembunyikan' : 'Lihat'} Perubahan
                            </span>
                          </button>
                          
                          {expandedLogs.has(log.id) && renderChanges(log)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            ) : (
            <div className="p-6 text-center">
              <ClockIcon className="mx-auto h-6 w-6 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada riwayat</h3>
              <p className="mt-1 text-xs text-gray-500">Belum ada aktivitas yang tercatat.</p>
            </div>
            )}
          </div>
          
          {/* Pagination */}
          {data?.pagination && (
            <Pagination
              pagination={data.pagination}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemName="aktivitas"
              showPageSizeSelector={true}
              pageSizeOptions={[10, 20, 50, 100]}
              className="mt-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50"
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
