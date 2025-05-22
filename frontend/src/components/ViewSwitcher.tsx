import React from 'react';
import { TableCellsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface ViewSwitcherProps {
  currentView: 'table' | 'grid';
  onChange: (view: 'table' | 'grid') => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-md shadow-sm border overflow-hidden">
      <button
        type="button"
        className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          currentView === 'table'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onChange('table')}
      >
        <TableCellsIcon className="h-4 w-4 mr-1.5" />
        Tabel
      </button>
      <button
        type="button"
        className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          currentView === 'grid'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onChange('grid')}
      >
        <Squares2X2Icon className="h-4 w-4 mr-1.5" />
        Grid
      </button>
    </div>
  );
};

export default ViewSwitcher;
