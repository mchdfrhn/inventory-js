import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import type { Asset } from '../services/api';

interface AssetValueTrendProps {
  asset: Asset;
  showDetails?: boolean;
  className?: string;
}

const AssetValueTrend: React.FC<AssetValueTrendProps> = ({ 
  asset, 
  showDetails = true,
  className = ''
}) => {
  // Calculate depreciation percentage
  const depreciationPercentage = asset.harga_perolehan > 0
    ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
    : 0;
    
  // Calculate remaining value (100% - depreciation%)
  const remainingValuePercentage = 100 - depreciationPercentage;
  
  // Format as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  // Color based on percentage
  let barColor = "bg-green-500";
  let textColor = "text-green-600";
  let bgColor = "bg-green-100";
  
  if (depreciationPercentage > 75) {
    barColor = "bg-red-500";
    textColor = "text-red-600";
    bgColor = "bg-red-100";
  } else if (depreciationPercentage > 50) {
    barColor = "bg-yellow-500";
    textColor = "text-yellow-600";
    bgColor = "bg-yellow-100";
  } else if (depreciationPercentage > 25) {
    barColor = "bg-blue-500";
    textColor = "text-blue-600";
    bgColor = "bg-blue-100";
  }
  
  return (
    <div className={`rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">Nilai Aset</h3>
      
      <div className="flex items-center mb-4">
        <div className={`rounded-full p-2 ${bgColor} mr-3`}>
          {depreciationPercentage > 50 
            ? <ArrowTrendingDownIcon className={`h-5 w-5 ${textColor}`} />
            : <ArrowTrendingUpIcon className={`h-5 w-5 ${textColor}`} />
          }
        </div>
        <div>
          <div className="text-xl font-semibold">{formatCurrency(asset.nilai_sisa)}</div>
          <div className="text-sm text-gray-500">Nilai sisa saat ini</div>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div 
            className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`} 
            style={{ width: `${remainingValuePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Tersusut {depreciationPercentage}%</span>
          <span>Tersisa {remainingValuePercentage}%</span>
        </div>
      </div>
      
      {showDetails && (
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <div className="text-gray-500">Harga Perolehan</div>
            <div className="font-medium">{formatCurrency(asset.harga_perolehan)}</div>
          </div>
          <div>
            <div className="text-gray-500">Akumulasi Penyusutan</div>
            <div className="font-medium">{formatCurrency(asset.akumulasi_penyusutan)}</div>
          </div>
          <div>
            <div className="text-gray-500">Umur Ekonomis</div>
            <div className="font-medium">{asset.umur_ekonomis_tahun} tahun</div>
          </div>
          <div>
            <div className="text-gray-500">Tanggal Perolehan</div>
            <div className="font-medium">
              {new Date(asset.tanggal_perolehan).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetValueTrend;
