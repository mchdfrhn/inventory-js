import React from 'react';
import { TableCellsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface ViewToggleProps {
  currentView: 'table' | 'grid';
  onToggle: (view: 'table' | 'grid') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onToggle }) => {
  return (
    <div className="inline-flex items-center rounded-md shadow-sm" role="group">
      <button
        type="button"
        className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-l-md focus:z-10 focus:outline-none ${
          currentView === 'table'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border transition-all duration-200`}
        onClick={() => onToggle('table')}
      >
        <TableCellsIcon className="h-4 w-4 mr-2" />
        Tabel
      </button>
      <button
        type="button"
        className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-r-md focus:z-10 focus:outline-none ${
          currentView === 'grid'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border transition-all duration-200`}
        onClick={() => onToggle('grid')}
      >
        <Squares2X2Icon className="h-4 w-4 mr-2" />
        Grid
      </button>
    </div>
  );
};

export default ViewToggle;
