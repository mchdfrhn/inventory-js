import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogApi, type AuditLog } from '../services/api';
import { 
  ClockIcon,
  UserIcon, 
  ComputerDesktopIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
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
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<AuditLogFilters>({
    entity_type: '',
    entity_id: '',
    action: '',
    from_date: '',
    to_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', page, pageSize, filters],
    queryFn: () => auditLogApi.list({
      ...filters,
      page,
      page_size: pageSize
    }),
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
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
          <h4 className="text-sm font-medium text-gray-900 mb-2">Perubahan:</h4>
          <div className="space-y-2">
            {Object.entries(changes).map(([field, change]: [string, any]) => (
              <div key={field} className="text-xs">
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
          <p className="text-xs text-gray-500">Data perubahan tidak dapat ditampilkan</p>
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
        <GlassCard className="max-w-md w-full text-center">
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
      <GlassCard className="overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-blue-600" />
                Riwayat Aktivitas
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Log aktivitas yang mencatat semua perubahan data aset dalam sistem
              </p>
            </div>
            <GradientButton
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
            </GradientButton>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Filters */}
          {showFilters && (
            <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Entitas
                  </label>
                  <select
                    value={filters.entity_type}
                    onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Semua</option>
                    <option value="asset">Asset</option>
                    <option value="category">Kategori</option>
                    <option value="location">Lokasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aksi
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Semua</option>
                    <option value="create">Dibuat</option>
                    <option value="update">Diperbarui</option>
                    <option value="delete">Dihapus</option>
                    <option value="bulk_delete">Hapus Bulk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={filters.from_date}
                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={filters.to_date}
                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Entitas
                  </label>
                  <input
                    type="text"
                    value={filters.entity_id}
                    onChange={(e) => handleFilterChange('entity_id', e.target.value)}
                    placeholder="UUID entitas"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <GradientButton
                  variant="secondary"
                  onClick={clearFilters}
                  className="flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Bersihkan Filter
                </GradientButton>
              </div>
            </div>
          )}
        </div>

          {/* Audit Logs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50">
            {data?.data && data.data.length > 0 ? (
              <div className="divide-y divide-gray-200/50">
              {data.data.map((log: AuditLog) => (
                <div key={log.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Action indicator */}
                    <div className="flex-shrink-0 mt-1.5">
                      {getActionIcon(log.action)}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </span>
                          <span className="text-sm font-medium text-gray-900 uppercase">
                            {log.entity_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-gray-700">{log.description}</p>

                      {/* Metadata */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ComputerDesktopIcon className="h-3 w-3" />
                          <span>ID: {log.entity_id.substring(0, 8)}...</span>
                        </div>
                        {log.ip_address && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span>IP: {log.ip_address}</span>
                          </div>
                        )}
                        {log.user_id && (
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-3 w-3" />
                            <span>User: {log.user_id}</span>
                          </div>
                        )}
                      </div>

                      {/* Changes section (collapsible) */}
                      {log.changes && (
                        <div className="mt-3">
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            <EyeIcon className="h-3 w-3" />
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
            <div className="p-12 text-center">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada riwayat</h3>
              <p className="mt-1 text-sm text-gray-500">Belum ada aktivitas yang tercatat.</p>
            </div>
          )}
          
          {/* Pagination */}
          {data?.pagination && (
            <div className="mt-6 flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-700">
                Menampilkan {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, data.pagination.total_items)} dari {data.pagination.total_items} aktivitas
              </div>
              <div className="flex items-center space-x-2">
                <GradientButton
                  variant="secondary"
                  onClick={() => setPage(page - 1)}
                  disabled={!data.pagination.has_previous}
                  className="text-sm"
                >
                  Sebelumnya
                </GradientButton>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Halaman {page} dari {data.pagination.total_pages}
                </span>
                <GradientButton
                  variant="secondary"
                  onClick={() => setPage(page + 1)}
                  disabled={!data.pagination.has_next}
                  className="text-sm"
                >
                  Selanjutnya
                </GradientButton>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
