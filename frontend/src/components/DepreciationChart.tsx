import { useState } from 'react';
import type { Asset } from '../services/api';

interface DepreciationChartProps {
  asset: Asset;
  className?: string;
}

export default function DepreciationChart({ asset, className = '' }: DepreciationChartProps) {
  // State for tooltip
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  // Calculate depreciation data points
  const calculateDepreciationData = () => {
    const { harga_perolehan, umur_ekonomis_tahun } = asset;
    const yearlyData = [];
    
    // Calculate yearly depreciation (straight-line method)
    const yearlyDepreciation = harga_perolehan / umur_ekonomis_tahun;
    
    // Generate data points for each year
    for (let i = 0; i <= umur_ekonomis_tahun; i++) {
      const remainingValue = Math.max(0, harga_perolehan - (yearlyDepreciation * i));
      yearlyData.push({
        year: i,
        value: Math.round(remainingValue * 100) / 100,
        percentage: Math.round((remainingValue / harga_perolehan) * 100)
      });
    }
    
    return yearlyData;
  };
  
  const depreciationData = calculateDepreciationData();
  
  // Calculate the max height of the chart
  const maxValue = asset.harga_perolehan;
  
  // Format currency for labels
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };
    // Find where the current year is in the chart
  const acquisitionDate = new Date(asset.tanggal_perolehan);
  const currentDate = new Date();
  
  // Calculate years passed with month precision
  const yearsPassed = currentDate.getFullYear() - acquisitionDate.getFullYear();
  const monthAdjustment = (currentDate.getMonth() - acquisitionDate.getMonth()) / 12;
  const adjustedYearsPassed = Math.floor(yearsPassed + monthAdjustment);
  
  // Ensure we don't go past the asset's economic life
  const currentYearIndex = Math.min(adjustedYearsPassed, asset.umur_ekonomis_tahun);
    return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Grafik Penyusutan Nilai</h3>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mb-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-200 mr-1"></div>
          <span>Nilai Aset per Tahun</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-600 mr-1"></div>
          <span>Tahun Berjalan</span>
        </div>
      </div>
      
      <div className="mt-4 h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
          <div>{formatCurrency(maxValue)}</div>
          <div>{formatCurrency(maxValue * 0.75)}</div>
          <div>{formatCurrency(maxValue * 0.5)}</div>
          <div>{formatCurrency(maxValue * 0.25)}</div>
          <div>{formatCurrency(0)}</div>
        </div>
        
        {/* Chart area */}
        <div className="ml-16 h-full flex items-end border-l border-b border-gray-300 relative">
          {/* Grid lines */}
          <div className="absolute left-0 right-0 top-0 h-1/4 border-b border-dashed border-gray-200"></div>
          <div className="absolute left-0 right-0 top-1/4 h-1/4 border-b border-dashed border-gray-200"></div>
          <div className="absolute left-0 right-0 top-2/4 h-1/4 border-b border-dashed border-gray-200"></div>
          <div className="absolute left-0 right-0 top-3/4 h-1/4 border-b border-dashed border-gray-200"></div>
            {/* Bars */}
          <div className="flex items-end justify-around w-full absolute bottom-0 left-0 right-0">
            {depreciationData.map((point, index) => {
              const heightPercent = (point.value / maxValue) * 100;
              const isCurrentYear = index === currentYearIndex;
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center relative"
                  style={{ width: `${100 / depreciationData.length}%` }}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div 
                    className={`w-4/5 ${isCurrentYear ? 'bg-blue-600' : 'bg-blue-200'} 
                               transition-all duration-200 ease-in-out hover:bg-blue-400`}
                    style={{ 
                      height: `${heightPercent}%`,
                      animation: `grow-up 0.5s ease-out forwards`,
                      animationDelay: `${index * 0.05}s`
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1">{point.year}</div>
                  
                  {/* Tooltip */}
                  {hoveredBar === index && (
                    <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded p-2 z-10 w-36">
                      <div className="font-semibold">Tahun ke-{point.year}</div>
                      <div>Nilai: {formatCurrency(point.value)}</div>
                      <div>Tersisa: {point.percentage}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            {/* Animation keyframes */}
          <style>{`
            @keyframes grow-up {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
          `}</style>
            {/* Current year indicator with improved visibility */}
          {currentYearIndex >= 0 && currentYearIndex < asset.umur_ekonomis_tahun && (
            <div 
              className="absolute z-10 transform -translate-x-1/2"
              style={{ 
                left: `${((currentYearIndex / asset.umur_ekonomis_tahun) * 100)}%`,
                bottom: `${(depreciationData[currentYearIndex].value / maxValue) * 100}%` 
              }}
            >
              <div 
                className="bg-red-500 w-3 h-3 rounded-full border-2 border-white shadow"
              ></div>
              <div className="absolute top-full mt-1 text-xs font-semibold text-red-500 whitespace-nowrap -translate-x-1/2">
                Posisi sekarang
              </div>
            </div>
          )}
        </div>
      </div>
        <div className="mt-4 text-xs text-gray-500 flex justify-between">
        <div>Tahun ke-</div>
        <div>Umur Ekonomis: {asset.umur_ekonomis_tahun} tahun</div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-blue-50">
          <div className="text-sm text-gray-500">Nilai Awal</div>
          <div className="font-semibold text-lg">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(asset.harga_perolehan)}
          </div>
        </div>
        
        <div className="border rounded p-3 bg-blue-50">
          <div className="text-sm text-gray-500">Nilai Saat Ini</div>
          <div className="font-semibold text-lg">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(asset.nilai_sisa)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-gray-50">
          <div className="text-sm text-gray-500">Penyusutan per Tahun</div>
          <div className="font-semibold text-lg">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(asset.harga_perolehan / asset.umur_ekonomis_tahun)}
          </div>
        </div>
        
        <div className="border rounded p-3 bg-gray-50">
          <div className="text-sm text-gray-500">Akumulasi Penyusutan</div>
          <div className="font-semibold text-lg">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(asset.akumulasi_penyusutan)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Metode perhitungan: Garis lurus (straight-line method)</p>
        <p>Dihitung berdasarkan harga perolehan dan umur ekonomis aset</p>
      </div>
    </div>
  );
}
