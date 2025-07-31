import { useState } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import InlineLoader from './InlineLoader';

interface ExportButtonProps {
  assets: unknown[];
  filename?: string;
}

export default function ExportButton({ assets, filename = 'assets' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const exportToCSV = async () => {
    setIsExporting(true);
    
    try {
      // Use backend export endpoint
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/v1/assets/export`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const date = new Date().toISOString().split('T')[0];
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={isExporting || assets.length === 0}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs
        ${isExporting || assets.length === 0 
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:-translate-y-0.5'}
        transition-all duration-300
      `}
    >
      {isExporting ? (
        <>
          <InlineLoader size="xs" variant="primary" />
          <span>Mengekspor...</span>
        </>
      ) : (
        <>
          <DocumentArrowDownIcon className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </>
      )}
      {assets.length > 0 && (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-800">
          {assets.length}
        </span>
      )}
    </button>
  );
}
