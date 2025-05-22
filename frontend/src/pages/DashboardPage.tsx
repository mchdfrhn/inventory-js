import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assetApi, categoryApi } from '../services/api';
import type { Asset } from '../services/api';
import { 
  TagIcon,
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

// Improved monthly data for the graph with smoother trend
const monthlyData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 18 },
  { month: 'Mar', count: 24 },
  { month: 'Apr', count: 28 },
  { month: 'May', count: 35 },
  { month: 'Jun', count: 42 },
];

// Status styling with gradients
const statusColors = {
  available: 'from-green-400/80 to-green-500/80 text-green-800',
  in_use: 'from-blue-400/80 to-blue-500/80 text-blue-800',
  maintenance: 'from-yellow-400/80 to-yellow-500/80 text-yellow-800',
  disposed: 'from-red-400/80 to-red-500/80 text-red-800',
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
  trend = 'neutral'
}: { 
  title: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  trend?: 'up' | 'down' | 'neutral';
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
            {displayValue.toLocaleString()}
          </p>
          {change && (
            <div className={`mt-1 flex items-center text-xs font-medium ${trendColors[trend]}`}>
              {TrendIcon && <TrendIcon className="mr-1 h-3 w-3" />}
              <span>{change}% from last month</span>
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
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate percentages and prepare segments
  const segments = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / total) * 100)
  }));

  // Sort by count descending
  segments.sort((a, b) => b.count - a.count);
  
  return (
    <div className="relative mt-4">
      <div className="flex justify-center">
        {/* SVG Donut chart */}
        <div className="relative">          <svg 
            viewBox="0 0 120 120" 
            width="160" 
            height="160" 
            className="transform -rotate-90"
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
                  strokeWidth="13" 
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
            <circle cx="60" cy="60" r="43" fill="white" />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="availableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="in_useGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="disposedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">Total</span>
            <span className="text-2xl font-bold text-gray-800">{total}</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {segments.map((segment) => {
          const statusKey = segment.status as keyof typeof statusColors;
          return (
            <div key={segment.status} className="flex items-center">
              <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${statusColors[statusKey]}`}></div>
              <span className="ml-2 text-xs capitalize">{segment.status.replace('_', ' ')}</span>
              <span className="ml-auto text-xs font-medium">{segment.count}</span>
            </div>
          );
        })}
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

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!assetData || !categoryData) return null;

    const assets = assetData.data as Asset[];
    const totalAssets = assets.length;
    
    // Count assets by status
    const statusCounts: Record<string, number> = {
      available: 0,
      in_use: 0,
      maintenance: 0,
      disposed: 0,
    };
    
    assets.forEach(asset => {
      if (statusCounts[asset.status] !== undefined) {
        statusCounts[asset.status]++;
      }
    });    // Asset value by category
    interface CategoryCount {
      id: string;
      name: string;
      count: number;
    }
    
    const assetsByCategory: CategoryCount[] = [];
    categoryData.data.forEach(category => {
      const count = assets.filter(asset => asset.category?.id === category.id).length;
      assetsByCategory.push({
        id: category.id,
        name: category.name,
        count: count,
      });
    });

    // Sort by count
    assetsByCategory.sort((a, b) => b.count - a.count);

    return {
      totalAssets,
      categoryCount: categoryData.data.length,
      statusCounts,
      assetsByCategory: assetsByCategory.slice(0, 5), // Top 5 categories
      availableAssetsPercent: Math.round((statusCounts.available / totalAssets) * 100) || 0,
      utilizationRate: Math.round((statusCounts.in_use / totalAssets) * 100) || 0
    };
  }, [assetData, categoryData]);

  if (assetsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-10 text-center">
          <Loader size="lg" message="Loading dashboard" />
        </GlassCard>
      </div>
    );
  }

  if (assetsError || categoriesError || !stats) {
    return (
      <GlassCard className="p-6 border-l-4 border-red-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              Unable to fetch required data. Please check your connection and try again.
            </div>
            <div className="mt-4">
              <GradientButton 
                variant="danger"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh page
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
        <p className="mt-1 text-sm text-gray-500">Overview of your inventory system</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          icon={CircleStackIcon}
          change={8.2}
          trend="up"
        />
        
        <StatCard
          title="Available Assets"
          value={stats.statusCounts.available}
          icon={CheckCircleIcon}
          change={stats.availableAssetsPercent}
          color="green"
          trend="up"
        />
        
        <StatCard
          title="Categories"
          value={stats.categoryCount}
          icon={TagIcon}
          color="yellow"
        />
        
        <StatCard
          title="Utilization Rate"
          value={stats.utilizationRate}
          icon={ArrowTrendingUpIcon}
          change={3.4}
          color="blue"
          trend="up"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Inventory Growth
            </h2>
            <div className="text-sm text-gray-500">Last 6 months</div>
          </div>
          
          <BarChart data={monthlyData} />
        </GlassCard>
        
        <GlassCard className="p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Asset Status
            </h2>
            <div className="text-sm text-gray-500">Current distribution</div>
          </div>
          
          <StatusChart statusCounts={stats.statusCounts} />
        </GlassCard>
      </div>

      {/* Assets by category */}
      <GlassCard className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Top Categories
          </h2>
          <Link to="/categories">
            <GradientButton size="sm" variant="secondary" className="flex items-center">
              View All
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </GradientButton>
          </Link>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/70">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assets
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {stats.assetsByCategory.map((category, index) => (
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
                        <TagIcon className="h-4 w-4 text-blue-600" />
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
                    <div className="flex items-center">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                          style={{ width: `${Math.round((category.count / stats.totalAssets) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-600">
                        {Math.round((category.count / stats.totalAssets) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/categories/${category.id}`} 
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
