import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { categoryApi } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import type { Category } from '../services/api';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';
import PageSizeSelector from '../components/PageSizeSelector';
import { useNotification } from '../context/NotificationContext';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { addNotification } = useNotification();
  
  const queryClient = useQueryClient();
  
  // Effect for page load animation
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Save pageSize to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('categoryPageSize', pageSize.toString());
  }, [pageSize]);
    // Updated to use new API function that includes asset counts with server pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['categoriesWithCounts', currentPage, pageSize],
    queryFn: () => categoryApi.listWithAssetCounts(currentPage, pageSize),
  });
  // Delete mutation
  const [deleteError, setDeleteError] = useState<string | null>(null);  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      // Invalidate both query keys to ensure both regular categories and categories with counts are refreshed
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categoriesWithCounts'] });
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      setDeleteError(null);
      addNotification('success', 'Kategori berhasil dihapus');
    },
    onError: (err) => {
      const errorMessage = 'Gagal menghapus kategori. Silakan coba lagi.';
      setDeleteError(errorMessage);
      addNotification('error', errorMessage);
      console.error('Delete error:', err);
    }
  });  // Filter categories based on search term
  // In the future, we should move search to the server side
  const filteredCategories = data?.data.filter((category: Category) => {
    return searchTerm === '' || 
      category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

    // Open delete confirmation modal
  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-10 text-center">
          <Loader size="lg" message="Memuat kategori..." />
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
            <h3 className="text-lg font-medium text-red-800">Error memuat kategori</h3>
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
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard className="overflow-hidden">
        {/* Header section */}
        <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/50 flex items-center justify-between">          <div>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Kategori</h2>
            <p className="mt-1 text-sm text-gray-500">
              Kelola kategori aset untuk organisasi yang lebih baik
            </p>
          </div>
          <Link to="/categories/new">
            <GradientButton variant="primary" className="flex items-center">
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Tambah Kategori
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
              id="search-categories"
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all duration-300"              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Categories table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300/50">
              <thead className="bg-gray-50/70">                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              <tbody className="divide-y divide-gray-200/50">                {filteredCategories && filteredCategories.length > 0 ? (
                  filteredCategories.map((category: Category) => (
                    <tr key={category.id} className="table-row-hover hover:bg-blue-50/30 transition-all">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-mono text-gray-700">
                        {category.code}
                      </td>                      <td className="whitespace-nowrap py-4 pl-3 pr-3">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100/80 mr-3">
                            <TagIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{category.name}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {category.description}
                      </td><td className="whitespace-nowrap px-3 py-4 text-sm">                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200 shadow-sm transition-all duration-300 hover:scale-105">                          {category.asset_count || 0} aset
                        </span>
                      </td>                      <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-5">
                          <Link
                            to={`/categories/edit/${category.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                          >
                            <PencilIcon className="h-4 w-4 mr-1.5 group-hover:scale-110" />
                            <span>Ubah</span>
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 flex items-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                            onClick={() => openDeleteModal(category)}
                          >
                            <TrashIcon className="h-4 w-4 mr-1.5 group-hover:scale-110" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>                    <td colSpan={5} className="py-10 text-center">                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100/80 p-4">
                          <TagIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="mt-4 text-lg font-medium text-gray-500">{searchTerm ? 'Tidak ada kategori yang cocok dengan pencarian Anda' : 'Tidak ada kategori ditemukan'}</p>
                        <p className="mt-1 text-sm text-gray-400 max-w-md text-center">
                          {searchTerm ? 'Coba ubah kriteria pencarian Anda' : 'Mulai tambahkan kategori untuk mengelola aset dengan lebih baik'}
                        </p>
                        {!searchTerm && (
                          <Link to="/categories/new" className="mt-6">
                            <GradientButton size="md" variant="primary" className="animate-pulse">
                              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                              Tambah Kategori Pertama
                            </GradientButton>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        {filteredCategories && filteredCategories.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200/50">            <div className="flex-1 flex items-center">
              <span className="text-sm text-gray-500">
                Menampilkan{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                {' - '}
                <span className="font-medium">{Math.min(currentPage * pageSize, filteredCategories.length)}</span>
                {' dari '}
                <span className="font-medium">{filteredCategories.length}</span>
                {' kategori'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <PageSizeSelector 
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                options={[10, 25, 50, 100]}
              />
              
              {Math.ceil(filteredCategories.length / pageSize) > 1 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                      ${currentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                        : 'text-gray-700 hover:-translate-x-1 bg-white/70 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow'}`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(curr => Math.min(Math.ceil(filteredCategories.length / pageSize), curr + 1))}
                    disabled={currentPage >= Math.ceil(filteredCategories.length / pageSize)}
                    className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                      ${currentPage >= Math.ceil(filteredCategories.length / pageSize)
                        ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                        : 'text-gray-700 hover:translate-x-1 bg-white/70 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow'}`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Delete Category Modal */}
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
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Kategori
                    </Dialog.Title>                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus <span className="font-semibold">{categoryToDelete?.name}</span>? 
                        Ini mungkin memengaruhi aset yang ditetapkan ke kategori ini.
                      </p>                      {deleteError && (
                        <p className="mt-2 text-sm text-red-600">{deleteError === 'Failed to delete category. Please try again.' ? 'Gagal menghapus kategori. Silakan coba lagi.' : deleteError}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">                  <GradientButton
                    variant="danger"
                    className="w-full sm:ml-3 sm:w-auto"
                    onClick={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
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
