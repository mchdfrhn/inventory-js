import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogApi, type AuditLog } from '../services/api';
import { 
  ClockIcon,
  UserIcon, 
  ComputerDesktopIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface AssetHistoryProps {
  assetId: string;
}

export default function AssetHistory({ assetId }: AssetHistoryProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['asset-history', assetId],
    queryFn: () => auditLogApi.getEntityHistory('asset', assetId),
  });

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
    } catch {
      return dateString;
    }
  };

  const renderChanges = (log: AuditLog) => {
    if (!log.changes) return null;

    try {
      const changes = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
      
      return (
        <div className="mt-1 p-1.5 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-medium text-gray-900 mb-0.5">Perubahan:</h4>
          <div className="space-y-0.5">
            {Object.entries(changes).map(([field, change]) => {
              const changeObj = change as { from: unknown; to: unknown };
              return (
                <div key={field} className="text-xs">
                  <span className="font-medium text-gray-700">{field}:</span>
                  <div className="ml-1 text-gray-600">
                    {changeObj.from !== null && (
                      <div>Dari: <span className="text-red-600">{JSON.stringify(changeObj.from)}</span></div>
                    )}
                    {changeObj.to !== null && (
                      <div>Ke: <span className="text-green-600">{JSON.stringify(changeObj.to)}</span></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch {
      return (
        <div className="mt-1 p-1.5 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Data perubahan tidak dapat ditampilkan</p>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-2">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <ClockIcon className="h-3 w-3 text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Riwayat Aktivitas</h3>
          </div>
          <div className="flex items-center justify-center h-8">
            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-500 border-r-2 border-b-2 border-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-2">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <ClockIcon className="h-3 w-3 text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Riwayat Aktivitas</h3>
          </div>
          <div className="text-center text-red-600">
            <p className="text-xs">Error loading history: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  const logs = data?.data || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            <ClockIcon className="h-3 w-3 text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Riwayat Aktivitas</h3>
            <span className="text-xs text-gray-500">({logs.length} aktivitas)</span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-0.5 text-xs text-gray-600 hover:text-gray-800"
            >
              <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
              {isCollapsed ? (
                <ChevronDownIcon className="h-2.5 w-2.5" />
              ) : (
                <ChevronUpIcon className="h-2.5 w-2.5" />
              )}
            </button>
          )}
        </div>

        {!isCollapsed && (
          <>
            {logs.length > 0 ? (
              <div className="space-y-1.5">
                {logs.map((log: AuditLog) => (
                  <div key={log.id} className="border-l-2 border-gray-200 pl-1.5 relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-1 top-0.5">
                      {getActionIcon(log.action)}
                    </div>

                    <div className="pb-1.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center space-x-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-0.5 text-xs text-gray-500">
                          <ClockIcon className="h-2.5 w-2.5" />
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 mb-0.5">{log.description}</p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mb-0.5">
                        {log.ip_address && (
                          <div className="flex items-center space-x-0.5">
                            <ComputerDesktopIcon className="h-2.5 w-2.5" />
                            <span>IP: {log.ip_address}</span>
                          </div>
                        )}
                        {log.user_id && (
                          <div className="flex items-center space-x-0.5">
                            <UserIcon className="h-2.5 w-2.5" />
                            <span>User: {log.user_id}</span>
                          </div>
                        )}
                      </div>

                      {/* Changes section (collapsible) */}
                      {log.changes && (
                        <>
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="flex items-center space-x-0.5 text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            <EyeIcon className="h-2.5 w-2.5" />
                            <span>
                              {expandedLogs.has(log.id) ? 'Sembunyikan' : 'Lihat'} Perubahan
                            </span>
                          </button>
                          
                          {expandedLogs.has(log.id) && renderChanges(log)}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2">
                <ClockIcon className="mx-auto h-4 w-4 text-gray-400 mb-0.5" />
                <p className="text-xs text-gray-500">Belum ada riwayat aktivitas untuk aset ini.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
