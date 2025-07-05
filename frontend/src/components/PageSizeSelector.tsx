import React from 'react';

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (newPageSize: number) => void;
  options?: number[];
  className?: string;
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({ 
  pageSize, 
  onPageSizeChange, 
  options = [10, 25, 50, 100], 
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="page-size" className="text-xs text-gray-600 whitespace-nowrap">
        Tampilkan:
      </label>
      <select
        id="page-size"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1 px-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-600 whitespace-nowrap">data</span>
    </div>
  );
};

export default PageSizeSelector;
