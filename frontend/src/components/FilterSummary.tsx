import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FilterSummaryProps {
  filterSummary: string[];
  hasActiveFilters: boolean;
  filteredCount: number;
  totalAssets: number;
  onClearFilters: () => void;
}

const FilterSummary: React.FC<FilterSummaryProps> = ({
  filterSummary,
  hasActiveFilters,
  filteredCount,
  totalAssets,
  onClearFilters
}) => {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <FunnelIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Filter Aktif - Menampilkan {filteredCount} dari {totalAssets} aset
            </h4>
            <div className="space-y-1">
              {filterSummary.map((filter, index) => (
                <div key={index} className="text-sm text-blue-700">
                  • {filter}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          Hapus Filter
        </button>
      </div>
    </div>
  );
};

export default FilterSummary;
