import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetApi, categoryApi, locationApi } from '../services/api';
import type { Asset } from '../services/api';
import { 
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

// Fungsi helper untuk mendapatkan data 6 bulan terakhir
const getRecentMonthsData = () => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    
    // Set tanggal ke awal bulan untuk mendapatkan timestamp awal bulan
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    // Set tanggal ke akhir bulan untuk mendapatkan timestamp akhir bulan
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); 
      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
    months.push({
      month: monthName,
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      startDate: startDate,
      endDate: endDate,
      count: 0, // Will be populated with actual data
      growthPercentage: 0 // Persentase pertumbuhan dari bulan sebelumnya
    });
  }
  
  return months;
};

// Status styling with gradients (updated to match new status values)
const statusColors = {
  baik: 'from-green-400/80 to-green-500/80 text-green-800',
  rusak: 'from-red-400/80 to-red-500/80 text-red-800',
  tidak_memadai: 'from-yellow-400/80 to-yellow-500/80 text-yellow-800',
};

// Label yang lebih baik untuk status dalam bahasa Indonesia
const statusLabels = {
  baik: 'Baik',
  rusak: 'Rusak', 
  tidak_memadai: 'Tidak Memadai',
};

// Simple animated bar chart component
function BarChart({ data }: { data: Array<{month: string; year: number; count: number}> }) {
  const maxValue = Math.max(...data.map(item => item.count), 1); // Minimal 1 untuk menghindari pembagian dengan nol
  
  return (
    <div className="pt-4">
      <div className="flex items-end h-40 space-x-2">
        {data.map((item, index) => {
          const heightPercent = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
          
          return (
            <div 
              key={`${item.month}-${item.year}`} 
              className="flex-1 flex flex-col items-center group"
            >
              <div className="text-xs font-semibold text-gray-700 mb-1">
                {item.count}
              </div>
              <div className="relative w-full cursor-pointer" title={`${item.month} ${item.year}: ${item.count} aset`}>
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-300"
                  style={{ 
                    height: `${Math.max(heightPercent, 5)}%`, // Minimal height untuk bars dengan nilai 0
                    animation: `growHeight 1.5s ease-out forwards`,
                    animationDelay: `${index * 120}ms`
                  }}
                >
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 overflow-hidden opacity-30 mix-blend-overlay">
                    <div className="absolute inset-0" style={{ 
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
                    }}></div>
                  </div>
                  
                  {/* Tooltip yang muncul saat hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {item.count} aset pada {item.month} {item.year}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-6 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-gray-700">{item.month}</span>
                <span className="text-[10px] text-gray-500">{item.year}</span>
              </div>
            </div>
          );
        })}
      </div>      <style>
        {`
          @keyframes growHeight {
            from { transform: scaleY(0); }
            to { transform: scaleY(1); }
          }
          
          @keyframes growWidth {
            from { transform: scaleX(0); transform-origin: left; }
            to { transform: scaleX(1); transform-origin: left; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

// Animated stat card
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  color = 'blue',
  trend = 'neutral',
  suffix = '',
  formatter
}: { 
  title: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  trend?: 'up' | 'down' | 'neutral';
  suffix?: string;
  formatter?: (value: number) => string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Animate counter on load
  useEffect(() => {
    const duration = 1500; // ms
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentValue = Math.round(value * progress);
      
      setDisplayValue(currentValue);
      
      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
    
    return () => clearInterval(counter);
  }, [value]);

  const colors = {
    blue: 'from-blue-400/20 to-blue-500/20 text-blue-700',
    green: 'from-green-400/20 to-green-500/20 text-green-700',
    yellow: 'from-yellow-400/20 to-yellow-500/20 text-yellow-700',
    red: 'from-red-400/20 to-red-500/20 text-red-700',
  };
  
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };
  
  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : null;

  return (
    <GlassCard hover={true} className="p-5 hover-float">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatter ? formatter(displayValue) : `${displayValue.toLocaleString()}${suffix ? ` ${suffix}` : ''}`}
          </p>
          {change && (              <div className={`mt-1 flex items-center text-xs font-medium ${trendColors[trend]}`}>
              {TrendIcon && <TrendIcon className="mr-1 h-3 w-3" />}
              <span>{change}% dari bulan lalu</span>
            </div>
          )}
        </div>
        
        <div className={`rounded-full p-3 bg-gradient-to-br ${colors[color]} flex-shrink-0`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </GlassCard>
  );
}

// Asset status donut chart
function StatusChart({ statusCounts }: { statusCounts: Record<string, number> }) {
  const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate percentages and prepare segments
  const segments = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / totalCount) * 100)
  }));

  // Sort by count descending
  segments.sort((a, b) => b.count - a.count);
  
  return (
    <div className="h-full flex items-center">
      <div className="flex items-center gap-3 w-full">
        {/* Chart container */}
        <div className="relative flex-shrink-0">
          <svg 
            viewBox="0 0 120 120" 
            width="140" 
            height="140" 
            className="transform -rotate-90"
            style={{ filter: 'drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.1))' }}
          >
            {segments.map((segment, i) => {
              // Calculate stroke-dasharray and stroke-dashoffset for each segment
              const radius = 40; // Slightly smaller than viewBox to fit
              const circumference = 2 * Math.PI * radius;
              const dash = (segment.percentage / 100) * circumference;
              
              // Calculate rotation based on previous segments
              const prevSegmentsPercentage = segments
                .slice(0, i)
                .reduce((acc, s) => acc + s.percentage, 0);
              
              const rotation = (prevSegmentsPercentage / 100) * 360;
              
              return (
                <circle 
                  key={segment.status} 
                  cx="60" 
                  cy="60" 
                  r={radius}
                  fill="transparent"
                  stroke={`url(#${segment.status}Gradient)`}
                  strokeWidth="10" 
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - dash}
                  strokeLinecap="round"
                  style={{ 
                    transformOrigin: 'center',
                    transform: `rotate(${rotation}deg)`,
                    opacity: 0,
                    animation: `fadeIn 0.5s ease-out forwards ${i * 0.2}s`
                  }}
                />
              );
            })}
            
            {/* Center */}
            <circle cx="60" cy="60" r="32" fill="white" />
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="baikGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="rusakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="tidak_memadaiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 font-medium">Total</span>
            <span className="text-lg font-bold text-gray-800">{totalCount}</span>
          </div>
        </div>
        
        {/* Legend - Compact vertical list */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1.5">
            {segments.map((segment, idx) => {
              const statusKey = segment.status as keyof typeof statusColors;
              return (
                <div 
                  key={segment.status} 
                  className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-gray-50/50 transition-colors" 
                  style={{
                    animation: 'fadeIn 0.5s ease-out forwards',
                    animationDelay: `${idx * 0.15 + 0.5}s`,
                    opacity: 0
                  }}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div 
                      className="h-1.5 w-1.5 rounded-full mr-1.5 flex-shrink-0"
                      style={{
                        background: statusKey === 'baik' ? '#10b981' : 
                                   statusKey === 'rusak' ? '#ef4444' : 
                                   statusKey === 'tidak_memadai' ? '#d97706' : '#3b82f6'
                      }}
                    ></div>
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {statusLabels[statusKey] || segment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <span className="font-semibold text-[11px] text-gray-800">{segment.count}</span>
                    <span className="text-[9px] text-gray-500">({segment.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  
  // Effect for page load animation
  useEffect(() => {
    setMounted(true);
  }, []);    // Fetch assets and categories without pagination limit to get all data
  const { data: assetData, isLoading: assetsLoading, error: assetsError } = useQuery({
    queryKey: ['all_assets'],    queryFn: async () => {
      try {
        const result = await assetApi.list(1, 100);
        return result;
      } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
      }
    },
  });
  const { data: categoryData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['all_categories'],    queryFn: async () => {
      try {
        const result = await categoryApi.list(1, 100); // Add pagination parameters
        return result;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
  });
  // Query locations data
  const { data: locationData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['all_locations'],    queryFn: async () => {
      try {
        const result = await locationApi.list(1, 100);
        return result;
      } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }
    },
  });// Calculate summary statistics
  const stats = useMemo(() => {
    if (!assetData || !categoryData || !locationData) return null;

    const assets = assetData.data as Asset[];
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => {
      const price = Number(asset.harga_perolehan) || 0;
      return sum + price;
    }, 0);
    
    // Count assets by status - use new status values
    const statusCounts: Record<string, number> = {
      baik: 0,
      rusak: 0,
      tidak_memadai: 0,
    };
    
    // Calculate assets by acquisition source
    const asalPengadaanCounts: Record<string, number> = {};
    const asalPengadaanValues: Record<string, number> = {};
    
    // Calculate assets by age
    const today = new Date();
    const assetAgeDistribution = {
      lessThan1Year: 0,
      between1And2Years: 0,
      between2And3Years: 0,
      moreThan3Years: 0
    };
      // Calculate current values based on acquisition date and economic life
    let estimatedCurrentValue = 0;
    let assetsWithCalculation = 0;
    let assetsWithoutDate = 0;
    
    assets.forEach(asset => {
      // Ensure price is a valid number
      const price = Number(asset.harga_perolehan) || 0;
      
      // Count by status
      if (statusCounts[asset.status] !== undefined) {
        statusCounts[asset.status]++;
      } else {
        // Fallback for any legacy status values
        statusCounts.baik++;
      }
      
      // Count by acquisition source (asal_pengadaan)
      const asalPengadaan = asset.asal_pengadaan || 'Tidak Diketahui';
      if (!asalPengadaanCounts[asalPengadaan]) {
        asalPengadaanCounts[asalPengadaan] = 0;
        asalPengadaanValues[asalPengadaan] = 0;
      }
      asalPengadaanCounts[asalPengadaan]++;
      asalPengadaanValues[asalPengadaan] += price;
      
      // Calculate age distribution and current value
      if (asset.tanggal_perolehan && price > 0) {
        const acquisitionDate = new Date(asset.tanggal_perolehan);
        
        // Calculate age more accurately using exact date difference
        const ageInMonths = Math.max(0, (today.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
        
        if (ageInMonths < 12) {
          assetAgeDistribution.lessThan1Year++;
        } else if (ageInMonths < 24) {
          assetAgeDistribution.between1And2Years++;
        } else if (ageInMonths < 36) {
          assetAgeDistribution.between2And3Years++;
        } else {
          assetAgeDistribution.moreThan3Years++;
        }
        
        // Calculate estimated current value using straight-line depreciation
        const economicLifeMonths = Math.max(12, (asset.umur_ekonomis_tahun || 5) * 12);
        const depreciationRate = Math.min(1, ageInMonths / economicLifeMonths);
        
        // Minimum residual value is 10% of original (more realistic)
        const residualValue = Math.max(price * 0.1, 0);
        const depreciableValue = price - residualValue;
        const currentValue = Math.max(residualValue, price - (depreciableValue * depreciationRate));
        
        estimatedCurrentValue += currentValue;
        assetsWithCalculation++;
      } else if (price > 0) {
        // For assets without acquisition date but with price, use conservative estimate
        assetsWithoutDate++;
        const conservativeValue = price * 0.75; // 75% of original value
        estimatedCurrentValue += conservativeValue;
      }
    });
    
    // Asset counts by category
    interface CategoryCount {
      id: string;
      name: string;
      code: string;
      count: number;
      value: number;
    }
    
    const assetsByCategory: CategoryCount[] = [];
    categoryData.data.forEach(category => {
      const categoryAssets = assets.filter(asset => asset.category_id === category.id);
      const count = categoryAssets.length;
      const value = categoryAssets.reduce((sum, asset) => {
        const price = Number(asset.harga_perolehan) || 0;
        return sum + price;
      }, 0);
      
      assetsByCategory.push({
        id: category.id,
        name: category.name,
        code: category.code || '',
        count: count,
        value: value
      });
    });

    // Sort categories by count
    assetsByCategory.sort((a, b) => b.count - a.count);
    
    // Asset counts by location
    interface LocationCount {
      id: number;
      name: string;
      code: string;
      building: string;
      room: string;
      count: number;
    }
    
    const assetsByLocation: LocationCount[] = [];
    locationData.data.forEach(location => {      const locationAssets = assets.filter(asset => asset.lokasi_id === location.id);
      const count = locationAssets.length;
      // Nilai tidak digunakan untuk assetsByLocation saat ini
      
      if (count > 0) {
        assetsByLocation.push({
          id: location.id,
          name: location.name,
          code: location.code,
          building: location.building,
          room: location.room,
          count: count
        });
      }
    });
    
    // Sort locations by count
    assetsByLocation.sort((a, b) => b.count - a.count);
    
    // Calculate monthly growth data
    const monthlyGrowth = getRecentMonthsData();
    assets.forEach(asset => {
      if (asset.tanggal_perolehan) {
        const acquisitionDate = new Date(asset.tanggal_perolehan);
        
        // Periksa asset masuk dalam rentang waktu bulan mana
        monthlyGrowth.forEach(month => {
          // Periksa apakah tanggal perolehan berada dalam rentang waktu bulan ini
          if (acquisitionDate >= month.startDate && acquisitionDate <= month.endDate) {
            month.count++;
          }
        });
      }
    });

    // Hitung persentase pertumbuhan bulanan
    for (let i = 1; i < monthlyGrowth.length; i++) {
      const prevMonth = monthlyGrowth[i-1];
      const currMonth = monthlyGrowth[i];
      
      if (prevMonth.count === 0) {
        // Jika bulan sebelumnya tidak ada aset, hitung sebagai pertumbuhan 100% jika ada aset di bulan ini
        currMonth.growthPercentage = currMonth.count > 0 ? 100 : 0;
      } else {
        // Hitung persentase perubahan
        const change = ((currMonth.count - prevMonth.count) / prevMonth.count) * 100;
        currMonth.growthPercentage = Math.round(change);
      }
    }
    
    // Bulan pertama tidak memiliki data pertumbuhan
    monthlyGrowth[0].growthPercentage = 0;
    
    // Top value by category
    const topCategoriesByValue = [...assetsByCategory]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);    // Calculate depreciation percentage
    const depreciationPercentage = totalValue > 0 ? 
      Math.round((estimatedCurrentValue / totalValue) * 100) : 0;
      // Create an array of asset sources data for visualization
    const asalPengadaanData = Object.entries(asalPengadaanCounts).map(([source, count]) => {
      return {
        source,
        count,
        value: asalPengadaanValues[source],
        percentage: Math.round((count / totalAssets) * 100)
      };
    }).sort((a, b) => b.count - a.count);
      return {
      totalAssets,
      totalValue,
      estimatedCurrentValue,
      depreciationPercentage,
      depreciationAmount: totalValue - estimatedCurrentValue,
      categoryCount: categoryData.data.length,
      locationCount: locationData.data.length,
      statusCounts,
      assetsByCategory: assetsByCategory.slice(0, 5), // Top 5 categories
      assetsByLocation: assetsByLocation.slice(0, 5), // Top 5 locations
      topCategoriesByValue,
      baikAssetsPercent: Math.round((statusCounts.baik / totalAssets) * 100) || 0,
      rusakAssetsPercent: Math.round((statusCounts.rusak / totalAssets) * 100) || 0,
      monthlyGrowth,
      assetAgeDistribution,
      asalPengadaanData,
      assetsWithCalculation,
      assetsWithoutDate
    };
  }, [assetData, categoryData, locationData]);  if (assetsLoading || categoriesLoading || locationsLoading) {
    return <LoadingState message="Memuat dashboard..." size="lg" />;
  }

  if (assetsError || categoriesError || locationsError || !stats) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        message="Tidak dapat mengambil data yang diperlukan. Silakan periksa koneksi Anda dan coba lagi."
        error={assetsError || categoriesError || locationsError}
        onRetry={() => window.location.reload()}
        retryLabel="Segarkan halaman"
      />
    );
  }

  return (
    <div className={`space-y-3 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
    
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard
          title="Total Aset"
          value={stats?.totalAssets || 0}
          icon={CircleStackIcon}
          color="blue"
        />        <StatCard
          title="Total Perolehan Aset"
          value={stats?.totalValue || 0}
          icon={ArrowTrendingUpIcon}
          color="blue"
          formatter={(value) => `Rp ${formatToMillion(value)}`}
        />        <StatCard
          title="Estimasi Nilai Saat Ini"
          value={stats?.estimatedCurrentValue || 0}
          icon={ArrowTrendingUpIcon}
          color="green"
          formatter={(value) => `Rp ${formatToMillion(value)}`}
        />
        <StatCard
          title="Aset Kondisi Baik"
          value={stats?.statusCounts?.baik || 0}
          icon={CheckCircleIcon}
          change={stats?.baikAssetsPercent || 0}
          color="green"
          trend={(stats?.baikAssetsPercent || 0) > 50 ? "up" : "down"}
          suffix={`(${stats?.baikAssetsPercent || 0}%)`}
        />      </div>

      {/* Main content grid - Compact layout like reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Top row - Analysis cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Analisis Nominal Aset */}
          <GlassCard hover={true} className="p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Analisis Nominal Aset
              </h2>
              <div className="text-xs text-gray-500">Perolehan vs Saat ini</div>
            </div>
            <div className="bg-white/80 rounded-lg p-2">
              <div className="flex flex-col space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs font-medium text-gray-700">Total Perolehan</div>
                    <div className="font-bold text-gray-800 text-sm">Rp {formatToMillion(stats?.totalValue || 0)}</div>
                  </div>
              <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                <div 
                  className="h-full rounded-full bg-blue-600" 
                  style={{ 
                    width: '100%',
                    animation: 'growWidth 1.5s ease-out forwards',
                  }}
                ></div>
              </div>
            </div>
            
            <div>              <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-medium text-gray-700">Estimasi Saat Ini</div>
                <div className="font-bold text-gray-800">
                  Rp {formatToMillion(stats?.estimatedCurrentValue || 0)}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                <div 
                  className="h-full rounded-full bg-blue-600" 
                  style={{ 
                    width: `${stats?.depreciationPercentage || 0}%`,
                    animation: 'growWidth 1.5s ease-out forwards',
                    animationDelay: '0.3s',
                  }}
                ></div>
              </div>              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span className="text-red-600">Penyusutan {Math.max(0, 100 - (stats?.depreciationPercentage || 0))}%</span>
                <span className="text-blue-600">Nilai tersisa {Math.max(0, stats?.depreciationPercentage || 0)}%</span>
              </div>
            </div>

            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Selisih nilai:</span>
                <span className="text-red-600 font-semibold">
                  - Rp {formatToMillion((stats?.totalValue || 0) - (stats?.estimatedCurrentValue || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
          {/* Status Chart Card */}
          <GlassCard hover={true} className="p-3 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Status Aset
              </h2>
              <div className="text-xs text-gray-500">Distribusi saat ini</div>
            </div>
            
            <div className="flex-1 flex items-center">
              <StatusChart statusCounts={stats?.statusCounts || { baik: 0, rusak: 0, tidak_memadai: 0 }} />
            </div>
          </GlassCard>
        </div>

        {/* Right sidebar - Quick stats */}
        <div className="space-y-3">
          {/* Quick summary */}
          <GlassCard hover={true} className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Ringkasan Cepat</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total Kategori</span>
                <span className="text-xs font-semibold text-gray-900">{stats?.categoryCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total Lokasi</span>
                <span className="text-xs font-semibold text-gray-900">{stats?.locationCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Penyusutan</span>
                <span className="text-xs font-semibold text-red-600">
                  {Math.max(0, 100 - (stats?.depreciationPercentage || 0))}%
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Top categories compact */}
          <GlassCard hover={true} className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Kategori Teratas</h3>
            <div className="space-y-2">
              {(stats?.assetsByCategory || [])
                .filter(category => !category.code.toUpperCase().includes('TEST') && !category.name.toUpperCase().includes('TEST'))
                .slice(0, 4)
                .map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-blue-800">{category.code}</span>
                    </div>
                    <span className="text-xs text-gray-900 truncate">{category.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{category.count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Monthly statistics - Full width */}
      <GlassCard hover={true} className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Statistik Bulanan Aset
          </h2>
          <div className="text-xs text-gray-500">6 bulan terakhir</div>
        </div>
        <div className="bg-white/80 rounded-lg p-2">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-medium">Perolehan aset per bulan</div>
            {stats?.monthlyGrowth && (
              <div className="text-xs bg-blue-100 text-blue-800 font-medium px-1.5 py-0.5 rounded-full">
                Total: {stats.monthlyGrowth.reduce((sum, item) => sum + item.count, 0)} aset
              </div>
            )}
          </div>
          {stats?.monthlyGrowth && stats.monthlyGrowth.some(item => item.count > 0) ? (
            <BarChart data={stats.monthlyGrowth} />
          ) : (
            <div className="h-24 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50 rounded-lg border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xs">Tidak ada perolehan aset dalam 6 bulan terakhir</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// Helper functions for number formatting
const formatRupiah = (amount: number): string => {
  // Handle NaN, undefined, null, or invalid numbers
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(Math.round(amount));
};

const formatToMillion = (amount: number): string => {
  // Handle NaN, undefined, null, or invalid numbers
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }
  
  const millions = amount / 1000000;
  if (millions >= 1000) {
    return `${(millions / 1000).toFixed(1)} milyar`;
  } else if (millions >= 1) {
    return `${millions.toFixed(1)} juta`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)} ribu`;
  } else {
    return formatRupiah(amount);
  }
};