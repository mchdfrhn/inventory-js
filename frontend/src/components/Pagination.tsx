import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import PageSizeSelector from './PageSizeSelector';

interface PaginationData {
  total_items: number;
  total_pages: number;
  current_page?: number;
  has_previous?: boolean;
  has_next?: boolean;
}

interface PaginationProps {
  pagination: PaginationData;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemName: string; // e.g., "aset", "lokasi", "kategori", "aktivitas"
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 25, 50, 100],
  className = ''
}) => {
  const startItem = pagination.total_items > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, pagination.total_items);

  return (
    <div className={`bg-white/50 px-3 py-2.5 flex items-center justify-between border-t border-gray-200/50 sm:px-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="hidden sm:block">
          <p className="text-xs text-gray-700">
            Menampilkan <span className="font-medium text-blue-600">{startItem}</span> sampai{' '}
            <span className="font-medium text-blue-600">{endItem}</span>{' '}
            dari <span className="font-medium text-gray-900">{pagination.total_items}</span> {itemName}
          </p>
        </div>
        {showPageSizeSelector && (
          <PageSizeSelector 
            pageSize={pageSize} 
            onPageSizeChange={(newSize) => {
              onPageSizeChange(newSize);
              onPageChange(1); // Reset to first page when changing page size
            }}
            options={pageSizeOptions}
            className="border-l border-gray-200 pl-3"
          />
        )}
      </div>
      
      <div className="flex-1 flex justify-between sm:justify-end space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${currentPage === 1 
              ? 'text-gray-300 cursor-not-allowed bg-gray-50/50 border border-gray-200' 
              : 'text-gray-700 bg-white/80 shadow-sm border border-gray-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5'}`}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Sebelumnya</span>
          <span className="sm:hidden">Prev</span>
        </button>
        
        {/* Show current page info */}
        <div className="flex items-center px-3 py-1.5 text-xs text-gray-600 bg-blue-50/70 rounded-md border border-blue-200">
          <span className="font-medium">{currentPage}</span>
          <span className="mx-1">/</span>
          <span>{pagination.total_pages}</span>
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pagination.total_pages}
          className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${currentPage === pagination.total_pages 
              ? 'text-gray-300 cursor-not-allowed bg-gray-50/50 border border-gray-200' 
              : 'text-gray-700 bg-white/80 shadow-sm border border-gray-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5'}`}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <span className="sm:hidden">Next</span>
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
