import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assetApi } from '../services/api';
import AssetDetailView from '../components/AssetDetailView';
import DepreciationChart from '../components/DepreciationChart';
import AssetHistory from '../components/AssetHistory';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function AssetDetailsPage() {
  const { id } = useParams();
  const [showDepreciationChart, setShowDepreciationChart] = useState(false);

  // Fetch asset data
  const { data, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getById(id as string),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <span className="sr-only">Memuat...</span>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-gray-700">Gagal memuat data aset. Aset tidak ditemukan atau terjadi kesalahan.</p>
          </div>
          <div className="mt-4">
            <Link
              to="/assets"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Kembali ke Daftar Aset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const asset = data.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            to="/assets"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm mb-2"
          >
            ← Kembali ke Daftar Aset
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Aset</h1>
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
