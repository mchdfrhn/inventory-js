import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assetApi, categoryApi, locationApi } from '../services/api';
import type { Asset } from '../services/api';
import { 
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import GradientButton from '../components/GradientButton';

// Fungsi helper untuk mendapatkan data 6 bulan terakhir
const getRecentMonthsData = () => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
    months.push({
      month: monthName,
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      count: 0 // Will be populated with actual data
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
function BarChart({ data }: { data: Array<{month: string; count: number}> }) {
  const maxValue = Math.max(...data.map(item => item.count));
  
  return (
    <div className="pt-6">
      <div className="flex items-end h-48 space-x-2">
        {data.map((item, index) => {
          const heightPercent = (item.count / maxValue) * 100;
          
          return (
            <div 
              key={item.month} 
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative w-full">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-300"
                  style={{ 
                    height: `${heightPercent}%`,
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
                </div>
              </div>
              <div className="h-8 flex items-center justify-center">
                <span className="text-xs font-medium mt-1 text-gray-600">{item.month}</span>
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
  suffix = ''
}: { 
  title: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  trend?: 'up' | 'down' | 'neutral';
  suffix?: string;
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
    <GlassCard className="p-5 hover-float">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {displayValue.toLocaleString()}{suffix && <span className="text-base ml-1">{suffix}</span>}
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
    <div className="relative mt-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <svg 
            viewBox="0 0 120 120" 
            width="120" 
            height="120" 
            className="transform -rotate-90"
            style={{ filter: 'drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.1))' }}
          >
            {segments.map((segment, i) => {
              // Calculate stroke-dasharray and stroke-dashoffset for each segment
              const radius = 50; // Slightly smaller than viewBox to fit
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
                  strokeWidth="15" 
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
            <circle cx="60" cy="60" r="42" fill="white" />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ width: '120px', height: '120px', top: '0', left: '0' }}>
            <span className="text-xs text-gray-500 font-medium">Total</span>
            <span className="text-lg font-bold text-gray-800">{totalCount}</span>
          </div>
        </div>
        
        {/* Legend - Compact format with 2 columns */}
        <div className="col-span-2 flex flex-col justify-center">
          <div className="space-y-2 bg-white/70 rounded-lg p-2">
            {segments.map((segment, idx) => {
              const statusKey = segment.status as keyof typeof statusColors;
              return (
                <div 
                  key={segment.status} 
                  className="flex items-center p-1 rounded-lg hover:bg-gray-50" 
                  style={{
                    animation: 'fadeIn 0.5s ease-out forwards',
                    animationDelay: `${idx * 0.15 + 0.5}s`,
                    opacity: 0
                  }}
                >
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${statusColors[statusKey]}`}></div>
                  <span className="ml-2 text-sm font-medium">{statusLabels[statusKey] || segment.status.replace('_', ' ')}</span>
                  <div className="ml-auto flex items-center space-x-2">
                    <span className="font-bold text-sm">{segment.count}</span>
                    <span className="text-xs text-gray-500">({segment.percentage}%)</span>
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
  }, []);
  
  // Fetch assets and categories without pagination limit to get all data
  const { data: assetData, isLoading: assetsLoading, error: assetsError } = useQuery({
    queryKey: ['all_assets'],
    queryFn: () => assetApi.list(1, 100), // Assuming 100 is enough to get all assets
  });

  const { data: categoryData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['all_categories'],
    queryFn: () => categoryApi.list(),
  });
  // Query locations data
  const { data: locationData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['all_locations'],
    queryFn: () => locationApi.list(1, 100), // Get up to 100 locations
  });  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!assetData || !categoryData || !locationData) return null;

    const assets = assetData.data as Asset[];
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.harga_perolehan, 0);
    
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
    
    assets.forEach(asset => {
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
      asalPengadaanValues[asalPengadaan] += asset.harga_perolehan;
      
      // Calculate age distribution
      if (asset.tanggal_perolehan) {
        const acquisitionDate = new Date(asset.tanggal_perolehan);
        const ageInMonths = (today.getFullYear() - acquisitionDate.getFullYear()) * 12 + 
                           (today.getMonth() - acquisitionDate.getMonth());
        
        if (ageInMonths < 12) {
          assetAgeDistribution.lessThan1Year++;
        } else if (ageInMonths < 24) {
          assetAgeDistribution.between1And2Years++;
        } else if (ageInMonths < 36) {
          assetAgeDistribution.between2And3Years++;
        } else {
          assetAgeDistribution.moreThan3Years++;
        }
        
        // Calculate estimated current value based on economic life
        // For simplicity using straight-line depreciation
        const economicLifeMonths = (asset.umur_ekonomis_tahun || 1) * 12;
        const depreciation = economicLifeMonths > 0 ? 
          Math.min(1, ageInMonths / economicLifeMonths) : 1;
        
        // Minimum residual value is 20% of original
        const residualValue = 0.2 * asset.harga_perolehan;
        const depreciatableValue = asset.harga_perolehan - residualValue;
        const currentValue = asset.harga_perolehan - (depreciatableValue * depreciation);
        
        estimatedCurrentValue += currentValue;
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
      const value = categoryAssets.reduce((sum, asset) => sum + asset.harga_perolehan, 0);
      
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
    locationData.data.forEach(location => {
      const locationAssets = assets.filter(asset => asset.lokasi_id === location.id);
      const count = locationAssets.length;
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
        const acquisitionMonth = acquisitionDate.getMonth();
        const acquisitionYear = acquisitionDate.getFullYear();
        
        // Find matching month in our data and increment count
        monthlyGrowth.forEach(month => {
          if (month.monthIndex === acquisitionMonth && month.year === acquisitionYear) {
            month.count++;
          }
        });
      }
    });
    
    // Top value by category
    const topCategoriesByValue = [...assetsByCategory]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    
    // Calculate depreciation percentage
    const depreciationPercentage = estimatedCurrentValue > 0 ? 
      Math.round((estimatedCurrentValue / totalValue) * 100) : 80; // Default 80% if no calc
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
      asalPengadaanData
    };
  }, [assetData, categoryData, locationData]);  if (assetsLoading || categoriesLoading || locationsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-10 text-center">
          <Loader size="lg" message="Memuat dashboard" />
        </GlassCard>
      </div>
    );
  }
  if (assetsError || categoriesError || locationsError || !stats) {
    return (
      <GlassCard className="p-6 border-l-4 border-red-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Gagal memuat dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              Tidak dapat mengambil data yang diperlukan. Silakan periksa koneksi Anda dan coba lagi.
            </div>
            <div className="mt-4">
              <GradientButton 
                variant="danger"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Segarkan halaman
              </GradientButton>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Dashboard
        </h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">Gambaran umum sistem inventaris</p>
    
      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Aset"
          value={stats?.totalAssets || 0}
          icon={CircleStackIcon}
          color="blue"
        />
        <StatCard
          title="Total Perolehan Aset (Rp)"
          value={Math.round((stats?.totalValue || 0) / 1000000)}
          icon={ArrowTrendingUpIcon}
          color="blue"
          suffix="juta"
        />
        <StatCard
          title="Estimasi Nilai Aset (Rp)"
          value={Math.round((stats?.estimatedCurrentValue || 0) / 1000000)}
          icon={ArrowTrendingUpIcon}
          color="green"
          change={-1 * (100 - (stats?.depreciationPercentage || 0))}
          trend="down"
          suffix="juta"
        />
        <StatCard
          title="Aset Kondisi Baik"
          value={stats?.statusCounts?.baik || 0}
          icon={CheckCircleIcon}
          change={stats?.baikAssetsPercent || 0}
          color="green"
          trend={(stats?.baikAssetsPercent || 0) > 50 ? "up" : "down"}
          suffix={`(${stats?.baikAssetsPercent || 0}%)`}
        />
      </div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Aset"
          value={stats?.totalAssets || 0}
          icon={CircleStackIcon}
          color="blue"
        />
        <StatCard
          title="Total Perolehan Aset (Rp)"
          value={Math.round((stats?.totalValue || 0) / 1000000)}
          icon={ArrowTrendingUpIcon}
          color="blue"
          suffix="juta"
        />
        <StatCard
          title="Estimasi Nilai Aset (Rp)"
          value={Math.round((stats?.estimatedCurrentValue || 0) / 1000000)}
          icon={ArrowTrendingUpIcon}
          color="green"
          change={-1 * (100 - (stats?.depreciationPercentage || 0))}
          trend="down"
          suffix="juta"
        />
        <StatCard
          title="Aset Kondisi Baik"
          value={stats?.statusCounts?.baik || 0}
          icon={CheckCircleIcon}
          change={stats?.baikAssetsPercent || 0}
          color="green"
          trend={(stats?.baikAssetsPercent || 0) > 50 ? "up" : "down"}
          suffix={`(${stats?.baikAssetsPercent || 0}%)`}
        />
      </div>

      {/* Main content grid - Restructured to 2 columns top, 1 column bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Analisis Nominal Aset - More compact version */}
        <GlassCard className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-900">
              Analisis Nominal Aset
            </h2>
            <div className="text-sm text-gray-500">Perolehan vs Saat ini</div>
          </div>
          <div className="bg-white/80 rounded-lg p-3">
            <div className="flex flex-col space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-medium text-gray-700">Total Perolehan</div>
                  <div className="font-bold text-gray-800">Rp {((stats?.totalValue || 0)/1000000).toLocaleString()} jt</div>
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
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-medium text-gray-700">Estimasi Saat Ini</div>
                  <div className="font-bold text-gray-800">
                    Rp {Math.round((stats?.estimatedCurrentValue || 0)/1000000).toLocaleString()} jt
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
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span className="text-red-600">Penyusutan {100 - (stats?.depreciationPercentage || 0)}%</span>
                  <span className="text-blue-600">Nilai tersisa {stats?.depreciationPercentage || 0}%</span>
                </div>
              </div>

              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Selisih nilai:</span>
                  <span className="text-red-600 font-semibold">
                    - Rp {(((stats?.totalValue || 0) - (stats?.estimatedCurrentValue || 0))/1000000).toLocaleString()} jt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
        
        {/* Status Chart Card */}
        <GlassCard className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-900">
              Status Aset
            </h2>
            <div className="text-sm text-gray-500">Distribusi saat ini</div>
          </div>
          
          <StatusChart statusCounts={stats?.statusCounts || { baik: 0, rusak: 0, tidak_memadai: 0 }} />
        </GlassCard>

        {/* Monthly statistics and Asal Perolehan Aset */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:col-span-2">
          {/* Monthly Asset Statistics */}
          <GlassCard className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-900">
                Statistik Bulanan Aset
              </h2>
              <div className="text-sm text-gray-500">6 bulan terakhir</div>
            </div>
            
            <div className="bg-white/80 rounded-lg p-3">
              <div className="text-sm font-medium mb-2">Perolehan aset per bulan</div>
              <BarChart data={stats?.monthlyGrowth || []} />              <div className="mt-2 grid grid-cols-3 gap-2">
                {(stats?.monthlyGrowth || []).slice(-3).map((item) => (
                  <div key={`${item.month}-${item.year}`} className="bg-gray-50 p-2 rounded-lg">
                    <div className="text-xs text-gray-500">{item.month} {item.year}</div>
                    <div className="font-medium">{item.count} aset</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
          
          {/* Asal Perolehan Aset - More compact visualization without table */}
          <GlassCard className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-900">
                Asal Perolehan Aset
              </h2>
              <div className="text-sm text-gray-500">Berdasarkan sumber perolehan</div>
            </div>
          
            <div className="bg-white/80 rounded-lg p-3">
              {(!stats?.asalPengadaanData || stats.asalPengadaanData.length === 0) ? (
                <div className="text-center text-gray-500 py-4">Tidak ada data asal perolehan</div>
              ) : (
                (() => {
                  // Limit to 6 sources for display, combine others if needed
                  let chartData = [...stats.asalPengadaanData];
                  if (chartData.length > 6) {
                    const topSources = chartData.slice(0, 5);
                    const otherSources = chartData.slice(5);
                    const otherCount = otherSources.reduce((sum, item) => sum + item.count, 0);
                    const otherValue = otherSources.reduce((sum, item) => sum + item.value, 0);
                    
                    chartData = [
                      ...topSources,
                      {
                        source: 'Lainnya',
                        count: otherCount,
                        value: otherValue,
                        percentage: Math.round((otherCount / (stats?.totalAssets || 1)) * 100)
                      }
                    ];
                  }
                  
                  // Define consistent, professional color palette
                  const barColors = [
                    'bg-blue-600',
                    'bg-emerald-600',
                    'bg-violet-600',
                    'bg-amber-600',
                    'bg-rose-600',
                    'bg-slate-600'
                  ];
                  
                  return (
                    <div className="flex flex-col">
                      {/* Bar chart visualization - more compact */}
                      <div className="flex h-32 mb-2">
                        {chartData.map((item, index) => {
                          const maxValue = Math.max(...chartData.map(d => d.count));
                          const heightPercent = maxValue > 0 ? Math.max(5, Math.round((item.count / maxValue) * 100)) : 0;
                          
                          return (
                            <div 
                              key={item.source} 
                              className="flex-1 flex flex-col items-center"
                              style={{
                                animation: 'fadeIn 0.5s ease-out forwards',
                                animationDelay: `${index * 0.1}s`,
                                opacity: 0
                              }}
                            >
                              <div className="text-center mb-1">
                                <span className="font-medium text-xs">{item.count}</span>
                              </div>
                              <div className="w-full flex-1 flex items-end justify-center px-1">
                                <div 
                                  className={`w-5 ${barColors[index % barColors.length]} rounded-sm`}
                                  style={{ 
                                    height: `${heightPercent}%`,
                                    animation: 'growHeight 1.5s ease-out forwards',
                                    animationDelay: `${index * 0.15}s`,
                                  }}
                                ></div>
                              </div>
                              <div className="pt-1 px-1 text-center w-full">
                                <div className="text-xs text-gray-700 truncate" title={item.source}>
                                  {item.source}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Enhanced visual legend - compact grid layout */}
                      <div className="grid grid-cols-3 gap-1">
                        {chartData.map((item, index) => (
                          <div 
                            key={item.source}
                            className="flex items-center p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            style={{
                              animation: 'fadeIn 0.5s ease-out forwards',
                              animationDelay: `${index * 0.05 + 0.3}s`,
                              opacity: 0
                            }}
                          >
                            <div className={`w-2 h-2 rounded-sm ${barColors[index % barColors.length]}`}></div>
                            <div className="ml-1 flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">{item.source}</div>
                              <div className="text-xs text-gray-500 truncate">{(item.value / 1000000).toFixed(1)} jt</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </GlassCard>
        </div>
        
        {/* Assets by category */}
        <GlassCard className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Kategori Teratas
            </h2>
            <Link to="/categories">
              <GradientButton size="sm" variant="secondary" className="flex items-center">
                Lihat Semua
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </GradientButton>
            </Link>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/70">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nominal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persentase
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Lihat</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {(stats?.assetsByCategory || []).map((category, index) => (
                <tr 
                  key={category.id} 
                  className="table-row-hover hover:bg-blue-50/30 transition-all"
                  style={{
                    animation: 'fadeIn 0.5s ease-out forwards',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <div className="text-xs font-medium text-blue-800">{category.code}</div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Rp {(category.value / 1000000).toFixed(1)} jt</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-600"
                          style={{ 
                            width: `${Math.round((category.count / (stats?.totalAssets || 1)) * 100)}%`,
                            animation: 'growWidth 1.5s ease-out forwards',
                            animationDelay: `${index * 0.1}s`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-600">
                        {Math.round((category.count / (stats?.totalAssets || 1)) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/categories/${category.id}`} 
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      </div>
    </div>
  );
}