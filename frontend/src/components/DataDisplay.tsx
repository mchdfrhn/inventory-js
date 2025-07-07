import React from 'react';

interface DataDisplayProps {
  label: string;
  value: React.ReactNode;
  type?: 'default' | 'currency' | 'percentage' | 'date' | 'status';
  className?: string;
}

const statusGradients: Record<string, string> = {
  baik: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
  rusak: 'from-rose-50 to-rose-100 border-rose-200 text-rose-800',
  tidak_memadai: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
  available: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
  in_use: 'from-blue-50 to-blue-100 border-blue-200 text-blue-800',
  maintenance: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
  disposed: 'from-rose-50 to-rose-100 border-rose-200 text-rose-800',
};

const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'baik': return 'Baik';
    case 'rusak': return 'Rusak';
    case 'tidak_memadai': return 'Tidak Memadai';
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
      const statusClass = statusGradients[value] || 'from-gray-50 to-gray-100 border-gray-200 text-gray-800';
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${statusClass} whitespace-nowrap shadow-sm transition-all duration-300 hover:scale-105`}>
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
