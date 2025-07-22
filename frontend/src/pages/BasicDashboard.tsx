import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetApi, categoryApi } from '../services/api';
import { 
  CheckCircleIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function BasicDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log('BasicDashboard: Component rendering...');

  // Fetch data with simpler queries
  const { data: assetData, isLoading: assetsLoading, error: assetsError } = useQuery({
    queryKey: ['dashboard_assets'],
    queryFn: async () => {
      console.log('BasicDashboard: Fetching assets...');
      const result = await assetApi.list(1, 100);
      console.log('BasicDashboard: Assets result:', result);
      return result;
    },
  });

  const { data: categoryData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['dashboard_categories'],
    queryFn: async () => {
      console.log('BasicDashboard: Fetching categories...');
      const result = await categoryApi.list(1, 100);
      console.log('BasicDashboard: Categories result:', result);
      return result;
    },
  });

  if (assetsLoading || categoriesLoading) {
    return <LoadingState message="Memuat dashboard..." size="lg" />;
  }

  if (assetsError || categoriesError) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        message="Tidak dapat mengambil data yang diperlukan."
        error={assetsError || categoriesError}
        onRetry={() => window.location.reload()}
        retryLabel="Segarkan halaman"
      />
    );
  }

  const assets = assetData?.data || [];
  const categories = categoryData?.data || [];
  
  // Simple calculations
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + (Number(asset.harga_perolehan) || 0), 0);
  
  // Count by category
  const categoryStats = categories.map(category => {
    const categoryAssets = assets.filter(asset => asset.category_id === category.id);
    return {
      name: category.name,
      code: category.code,
      count: categoryAssets.length
    };
  });

  console.log('BasicDashboard: Stats calculated:', { totalAssets, totalValue, categoryStats });

  return (
    <div className={`space-y-3 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Basic</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">Total Aset</div>
              <div className="mt-1 text-2xl font-bold text-blue-600">{totalAssets}</div>
            </div>
            <CircleStackIcon className="h-8 w-8 text-blue-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">Total Nilai</div>
              <div className="mt-1 text-2xl font-bold text-green-600">
                Rp {(totalValue / 1000000).toFixed(1)}M
              </div>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">Kategori</div>
              <div className="mt-1 text-2xl font-bold text-purple-600">{categories.length}</div>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-600" />
          </div>
        </GlassCard>
      </div>

      {/* Category breakdown */}
      <GlassCard className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Aset per Kategori</h2>
        <div className="space-y-2">
          {categoryStats
            .filter(cat => cat.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((category) => (
              <div key={category.code} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded mr-2">
                    {category.code}
                  </span>
                  <span className="text-sm text-gray-900">{category.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700">{category.count} aset</span>
              </div>
            ))}
        </div>
      </GlassCard>
    </div>
  );
}
