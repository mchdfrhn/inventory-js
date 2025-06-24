import { useState } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Asset } from '../services/api';

interface AdvancedReportAnalyticsProps {
  assets: Asset[];
}

export default function AdvancedReportAnalytics({ assets }: AdvancedReportAnalyticsProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateAdvancedAnalytics = () => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.harga_perolehan, 0);
    const totalDepreciation = assets.reduce((sum, asset) => sum + asset.akumulasi_penyusutan, 0);
    const currentValue = assets.reduce((sum, asset) => sum + asset.nilai_sisa, 0);

    // Depreciation analysis
    const depreciationRanges = {
      low: assets.filter(a => (a.akumulasi_penyusutan / a.harga_perolehan) * 100 <= 25).length,
      medium: assets.filter(a => {
        const pct = (a.akumulasi_penyusutan / a.harga_perolehan) * 100;
        return pct > 25 && pct <= 75;
      }).length,
      high: assets.filter(a => (a.akumulasi_penyusutan / a.harga_perolehan) * 100 > 75).length
    };

    // Age analysis
    const currentYear = new Date().getFullYear();
    const ageAnalysis = {
      new: assets.filter(a => currentYear - new Date(a.tanggal_perolehan).getFullYear() <= 2).length,
      moderate: assets.filter(a => {
        const age = currentYear - new Date(a.tanggal_perolehan).getFullYear();
        return age > 2 && age <= 5;
      }).length,
      old: assets.filter(a => currentYear - new Date(a.tanggal_perolehan).getFullYear() > 5).length
    };

    // Value concentration analysis
    const highValueAssets = assets.filter(a => a.harga_perolehan > totalValue / totalAssets * 3).length;
    const mediumValueAssets = assets.filter(a => {
      const avgValue = totalValue / totalAssets;
      return a.harga_perolehan >= avgValue && a.harga_perolehan <= avgValue * 3;
    }).length;
    const lowValueAssets = assets.filter(a => a.harga_perolehan < totalValue / totalAssets).length;

    // Status distribution
    const statusDistribution = assets.reduce((counts, asset) => {
      const status = asset.status || 'baik';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Category analysis
    const categoryDistribution = assets.reduce((counts, asset) => {
      const category = asset.category?.name || 'Tidak Terkategori';
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Location analysis
    const locationDistribution = assets.reduce((counts, asset) => {
      const location = asset.location_info?.name || asset.lokasi || 'Tidak Diketahui';
      counts[location] = (counts[location] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Acquisition source analysis
    const acquisitionSourceDistribution = assets.reduce((counts, asset) => {
      const source = asset.asal_pengadaan || 'Tidak Diketahui';
      counts[source] = (counts[source] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Risk assessment
    const highRiskAssets = assets.filter(a => {
      const depreciationPct = (a.akumulasi_penyusutan / a.harga_perolehan) * 100;
      const age = currentYear - new Date(a.tanggal_perolehan).getFullYear();
      return depreciationPct > 75 || age > 8 || a.status === 'rusak';
    }).length;

    // Financial insights
    const avgAssetValue = totalValue / totalAssets;
    const depreciationRate = (totalDepreciation / totalValue) * 100;
    const valueRetention = (currentValue / totalValue) * 100;

    return {
      totalAssets,
      totalValue,
      totalDepreciation,
      currentValue,
      depreciationRanges,
      ageAnalysis,
      highValueAssets,
      mediumValueAssets,
      lowValueAssets,
      statusDistribution,
      categoryDistribution,
      locationDistribution,
      acquisitionSourceDistribution,
      highRiskAssets,
      avgAssetValue,
      depreciationRate,
      valueRetention
    };
  };

  const analytics = calculateAdvancedAnalytics();
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <>
      <button
        onClick={() => setShowAnalytics(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-800 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
      >
        <ChartBarIcon className="h-4 w-4" />
        Analytics
      </button>

      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ChartBarIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Analytics Laporan Aset
                </h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Aset</p>
                      <p className="text-2xl font-bold">{analytics.totalAssets}</p>
                    </div>
                    <div className="text-blue-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Nilai Total</p>
                      <p className="text-xl font-bold">{formatCurrency(analytics.totalValue)}</p>
                    </div>
                    <ArrowTrendingUpIcon className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Penyusutan</p>
                      <p className="text-xl font-bold">{analytics.depreciationRate.toFixed(1)}%</p>
                    </div>
                    <ArrowTrendingDownIcon className="w-8 h-8 text-red-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Risiko Tinggi</p>
                      <p className="text-2xl font-bold">{analytics.highRiskAssets}</p>
                    </div>
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>
              </div>

              {/* Analysis Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Depreciation Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Penyusutan</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rendah (0-25%)</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${getPercentage(analytics.depreciationRanges.low, analytics.totalAssets)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.depreciationRanges.low}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sedang (26-75%)</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${getPercentage(analytics.depreciationRanges.medium, analytics.totalAssets)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.depreciationRanges.medium}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tinggi ({'>'}75%)</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${getPercentage(analytics.depreciationRanges.high, analytics.totalAssets)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.depreciationRanges.high}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Age Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Umur Aset</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Baru (≤2 tahun)</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${getPercentage(analytics.ageAnalysis.new, analytics.totalAssets)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.ageAnalysis.new}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sedang (3-5 tahun)</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${getPercentage(analytics.ageAnalysis.moderate, analytics.totalAssets)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.ageAnalysis.moderate}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lama ({'>'}5 tahun)</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${getPercentage(analytics.ageAnalysis.old, analytics.totalAssets)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.ageAnalysis.old}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Kategori</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(analytics.categoryDistribution).map(([category, count], index) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">{category}</span>
                        <div className="flex items-center ml-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'][index % 5]}`}
                              style={{ width: `${getPercentage(count, analytics.totalAssets)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                      const percentage = parseFloat(getPercentage(count, analytics.totalAssets));
                      const statusLabel = status === 'baik' ? 'Baik' : 
                                        status === 'rusak' ? 'Rusak' : 
                                        status === 'tidak_memadai' ? 'Tidak Memadai' : status;
                      const statusColor = status === 'baik' ? 'bg-green-500' : 
                                        status === 'rusak' ? 'bg-red-500' : 'bg-yellow-500';
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{statusLabel}</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`${statusColor} h-2 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count} ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Financial Insights */}
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Keuangan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Rata-rata Nilai Aset</p>
                    <p className="text-lg font-bold text-indigo-600">{formatCurrency(analytics.avgAssetValue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tingkat Penyusutan</p>
                    <p className="text-lg font-bold text-red-600">{analytics.depreciationRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Retensi Nilai</p>
                    <p className="text-lg font-bold text-green-600">{analytics.valueRetention.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekomendasi</h3>
                <div className="space-y-2">
                  {analytics.highRiskAssets > 0 && (
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                      <p className="text-sm text-gray-700">
                        Terdapat <strong>{analytics.highRiskAssets}</strong> aset berisiko tinggi yang memerlukan perhatian khusus.
                      </p>
                    </div>
                  )}
                  {analytics.depreciationRanges.high > analytics.totalAssets * 0.3 && (
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                      <p className="text-sm text-gray-700">
                        Lebih dari 30% aset memiliki penyusutan tinggi. Pertimbangkan untuk melakukan pembaruan atau penggantian.
                      </p>
                    </div>
                  )}
                  {analytics.ageAnalysis.old > analytics.totalAssets * 0.4 && (
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                      <p className="text-sm text-gray-700">
                        Sebagian besar aset sudah berumur lebih dari 5 tahun. Rencanakan program modernisasi peralatan.
                      </p>
                    </div>
                  )}
                  {analytics.statusDistribution.rusak && analytics.statusDistribution.rusak > 0 && (
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                      <p className="text-sm text-gray-700">
                        Terdapat <strong>{analytics.statusDistribution.rusak}</strong> aset dalam kondisi rusak yang perlu diperbaiki atau diganti.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAnalytics(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Tutup Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
