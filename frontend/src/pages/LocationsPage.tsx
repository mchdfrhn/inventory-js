import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { locationApi } from '../services/api';
import type { Location } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';
import PageSizeSelector from '../components/PageSizeSelector';
import { useNotification } from '../context/NotificationContext';
  
export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    // Try to get pageSize from localStorage, default to 10 if not found
    const savedPageSize = localStorage.getItem('locationPageSize');
    return savedPageSize ? parseInt(savedPageSize, 10) : 10;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Add notification hook
  const { addNotification } = useNotification();

  const queryClient = useQueryClient();
  
  // Effect for page load animation
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Save pageSize to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('locationPageSize', pageSize.toString());
  }, [pageSize]);  const { data, isLoading, error } = useQuery({
    queryKey: ['locationsWithCounts', page, pageSize, searchTerm],
    queryFn: () => searchTerm ? 
      locationApi.search(searchTerm, page, pageSize) : 
      locationApi.listWithAssetCounts(page, pageSize),
  });
    // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => locationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locationsWithCounts'] });
      setDeleteModalOpen(false);
      setLocationToDelete(null);
      addNotification('success', 'Lokasi berhasil dihapus');
    },
    onError: (err) => {
      setDeleteError('Gagal menghapus lokasi. Silakan coba lagi.');
      addNotification('error', 'Gagal menghapus lokasi. Silakan coba lagi.');
      console.error('Delete error:', err);
    }
  });

  // Open delete confirmation modal
  const openDeleteModal = (location: Location) => {
    setLocationToDelete(location);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete.id);
    }
  };  // Use the data directly from the API, as searching is now done server-side
  // filteredLocations is kept for backward compatibility
  const filteredLocations = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-10 text-center">
          <Loader size="lg" message="Memuat lokasi..." />
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6 border-l-4 border-red-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error memuat lokasi</h3>
            <div className="mt-2 text-sm text-red-700">
              {error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diharapkan'}
            </div>
            <div className="mt-4">
              <GradientButton 
                variant="danger"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Coba lagi
              </GradientButton>
            </div>
          </div>
        </div>
      </GlassCard>
    );  }
  
  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard className="overflow-hidden">
        {/* Header section */}
        <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Lokasi</h2>
            <p className="mt-1 text-sm text-gray-500">
              Kelola lokasi aset untuk organisasi yang lebih baik
            </p>
          </div>
          <Link to="/locations/new">
            <GradientButton variant="primary" className="flex items-center">
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Tambah Lokasi
            </GradientButton>
          </Link>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30">
          <div className="relative rounded-md shadow-sm max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="search"
              id="search-locations"
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all duration-300"
              placeholder="Cari lokasi..."
              value={searchTerm}              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
            />
          </div>
        </div>
        
        {/* Locations table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300/50">
              <thead className="bg-gray-50/70">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gedung
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lantai
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruangan
                  </th>                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Aset
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">                {filteredLocations && filteredLocations.length > 0 ? (
                  filteredLocations.map((location: Location) => (
                    <tr 
                      key={location.id} 
                      className="table-row-hover hover:bg-blue-50/30 transition-all"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-mono text-gray-700">{location.code}</td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100/80 mr-3">
                            <MapPinIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{location.name}</div>
                        </div>
                      </td>                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{location.building || ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{location.floor || ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{location.room || ''}</td>                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {location.description || ''}
                      </td>                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200 shadow-sm transition-all duration-300 hover:scale-105">
                          {location.asset_count || 0} aset
                        </span>
                      </td><td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-5">
                          <Link
                            to={`/locations/edit/${location.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                          >
                            <PencilIcon className="h-4 w-4 mr-1.5 group-hover:scale-110" />
                            <span>Ubah</span>
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                            onClick={() => openDeleteModal(location)}
                          >
                            <TrashIcon className="h-4 w-4 mr-1.5 group-hover:scale-110" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (                  <tr>
                    <td colSpan={8} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100/80 p-4">
                          <MapPinIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="mt-4 text-lg font-medium text-gray-500">
                          {searchTerm ? 'Tidak ada lokasi yang sesuai dengan pencarian Anda' : 'Belum ada data lokasi'}
                        </p>
                        <p className="mt-1 text-sm text-gray-400 max-w-md text-center">
                          {searchTerm ? 'Coba ubah kriteria pencarian Anda' : 'Mulai tambahkan lokasi untuk mengelola aset dengan lebih baik'}
                        </p>
                        {!searchTerm && (
                          <Link to="/locations/new" className="mt-6">
                            <GradientButton size="md" variant="primary" className="animate-pulse">
                              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                              Tambah Lokasi Pertama
                            </GradientButton>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>          </div>
            {/* Pagination controls */}
          {data?.pagination && filteredLocations && (
            <div className="bg-white/50 px-4 py-3 flex items-center justify-between border-t border-gray-200/50 sm:px-6">
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{data.pagination.total_items > 0 ? (page - 1) * pageSize + 1 : 0}</span> sampai{' '}
                    <span className="font-medium">
                      {Math.min(page * pageSize, data.pagination.total_items)}
                    </span>{' '}
                    dari <span className="font-medium">{data.pagination.total_items}</span> lokasi
                  </p>
                </div>
                <PageSizeSelector 
                  pageSize={pageSize} 
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(1); // Reset to first page when changing page size
                  }}
                  options={[10, 25, 50, 100]}
                />
              </div>
              <div className="flex-1 flex justify-between sm:justify-end space-x-3">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${page === 1 
                      ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                      : 'text-gray-700 hover:-translate-x-1 bg-white/70 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow'}`}
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1" />
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.total_pages}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${page === data.pagination.total_pages 
                      ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                      : 'text-gray-700 hover:translate-x-1 bg-white/70 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow'}`}
                >
                  Berikutnya
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <Transition.Root show={deleteModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setDeleteModalOpen}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="glass-card inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Lokasi
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus lokasi <span className="font-semibold">{locationToDelete?.name}</span>? 
                        Tindakan ini tidak dapat dibatalkan.
                      </p>
                      {deleteError && (
                        <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <GradientButton
                    variant="danger"
                    className="w-full sm:ml-3 sm:w-auto"
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                    autoFocus
                  >
                    {deleteMutation.isPending && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                  </GradientButton>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 hover:-translate-y-0.5"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
