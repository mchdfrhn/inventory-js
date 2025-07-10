import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assetApi } from '../services/api';
import AssetDetailView from '../components/AssetDetailView';
import DepreciationChart from '../components/DepreciationChart';
import AssetHistory from '../components/AssetHistory';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function AssetDetailsPage() {
  const { id } = useParams();
  const [showDepreciationChart, setShowDepreciationChart] = useState(false);

  // Fetch asset data
  const { data, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getById(id as string),
  });

  if (isLoading) {
    return <LoadingState message="Memuat detail aset..." size="lg" />;
  }

  if (error || !data?.data) {
    return (
      <ErrorState 
        title="Aset Tidak Ditemukan"
        message="Gagal memuat data aset. Aset tidak ditemukan atau terjadi kesalahan."
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const asset = data.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            to="/assets"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            ← Kembali ke Daftar Aset
          </Link>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/assets/edit/${asset.id}`}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Edit Aset
          </Link>
        </div>
      </div>

      <AssetDetailView asset={asset} />      <div className="mt-6 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => setShowDepreciationChart(!showDepreciationChart)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
        >
          {showDepreciationChart ? 'Sembunyikan' : 'Tampilkan'} Grafik Penyusutan
        </button>
          {showDepreciationChart && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 italic mb-4">
              Grafik penyusutan menunjukkan bagaimana nilai aset berkurang seiring waktu berdasarkan metode garis lurus.
            </p>
            <DepreciationChart asset={asset} className="mt-4" />
          </div>
        )}
      </div>

      {/* Asset History Section */}
      <div className="mt-6">
        <AssetHistory assetId={asset.id} />
      </div>
    </div>
  );
}
