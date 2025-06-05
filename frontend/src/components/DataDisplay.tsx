import React from 'react';

interface DataDisplayProps {
  label: string;
  value: React.ReactNode;
  type?: 'default' | 'currency' | 'percentage' | 'date' | 'status';
  className?: string;
}

const statusColors = {
  baik: 'bg-green-50 text-green-700 border-green-200',
  rusak: 'bg-red-50 text-red-700 border-red-200',
  tidak_memadai: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  available: 'bg-green-50 text-green-700 border-green-200',
  in_use: 'bg-blue-50 text-blue-700 border-blue-200',
  maintenance: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  disposed: 'bg-red-50 text-red-700 border-red-200',
};

const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'baik': return 'Baik';
    case 'rusak': return 'Rusak';
    case 'tidak_memadai': return 'Kurang Baik'; // Shorter label
    case 'available': return 'Tersedia';
    case 'in_use': return 'Digunakan';
    case 'maintenance': return 'Pemeliharaan';
    case 'disposed': return 'Dibuang';
    default: return String(status).replace(/_/g, ' ');
  }
};

const DataDisplay: React.FC<DataDisplayProps> = ({ 
  label, 
  value, 
  type = 'default',
  className = '' 
}) => {
  const formatValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Tidak tersedia</span>;
    }

    if (type === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    }

    if (type === 'percentage' && typeof value === 'number') {
      return `${value}%`;
    }

    if (type === 'date' && (typeof value === 'string' || value instanceof Date)) {
      const date = typeof value === 'string' ? new Date(value) : value;
      return date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }    if (type === 'status' && typeof value === 'string') {
      const statusClass = statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border-gray-200';
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass} whitespace-nowrap`}>
          {formatStatusLabel(value)}
        </span>
      );
    }

    return value;
  };

  return (
    <div className={`${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{formatValue()}</dd>
    </div>
  );
};

export default DataDisplay;
