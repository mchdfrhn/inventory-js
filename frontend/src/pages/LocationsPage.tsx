import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { locationApi } from '../services/api';
import type { Location } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { useNotification } from '../context/NotificationContext';
  
export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    // Try to get pageSize from localStorage, default to 10 if not found
    const savedPageSize = localStorage.getItem('locationPageSize');
    return savedPageSize ? parseInt(savedPageSize, 10) : 10;
  });
  const [searchTerm, setSearchTerm] = useState('');  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Import states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  
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
  }, [pageSize]);  // Updated to use client-side search like AssetsPage  
  const { data, isLoading, error } = useQuery({
    queryKey: ['locationsWithCounts', page, pageSize],
    queryFn: () => locationApi.listWithAssetCounts(page, pageSize),
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
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (allowedTypes.includes(file.type)) {
        setImportFile(file);
        setImportError(null);
      } else {
        setImportError('Format file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)');
        setImportFile(null);
      }
    }
  };

  // Handle import submission
  const handleImportSubmit = async () => {
    if (!importFile) {
      setImportError('Pilih file untuk diimport');
      return;
    }

    setImportLoading(true);
    setImportError(null);
    setImportSuccess(null);    try {
      const formData = new FormData();
      formData.append('file', importFile);      console.log('Sending import request to http://localhost:8080/api/v1/locations/import');
      const response = await fetch('http://localhost:8080/api/v1/locations/import', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.message || 'Gagal mengimport data');
      }

      let result;
      try {
        result = await response.json();
        console.log('Import result:', result);
      } catch (jsonError) {
        console.error('Failed to parse success response as JSON:', jsonError);
        throw new Error('Server returned invalid response format');
      }

      setImportSuccess(`Berhasil mengimport ${result.imported_count || 0} lokasi`);
      
      // Refresh the locations list
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locationsWithCounts'] });
      
      // Reset form after success
      setTimeout(() => {
        setImportModalOpen(false);
        setImportFile(null);
        setImportSuccess(null);
        addNotification('success', `Berhasil mengimport ${result.imported_count || 0} lokasi`);
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengimport data';
      setImportError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setImportLoading(false);
    }
  };  // Download template Excel file
  const downloadTemplate = () => {    // Create template data with Indonesian headers
    // Tanda * menunjukkan kolom yang wajib diisi (required)
    const templateData = [
      ['Kode*', 'Nama*', 'Gedung', 'Lantai', 'Ruangan', 'Deskripsi'],
      ['L001', 'Ruang Kelas 1A', 'Gedung Utama', '1', 'A101', 'Ruang kelas untuk mata kuliah umum dan teori'],
      ['L002', 'Laboratorium Komputer', 'Gedung Teknik', '2', 'B201', 'Lab untuk praktikum programming dan sistem informasi'],
      ['L003', 'Perpustakaan', 'Gedung Utama', '1', 'C101', 'Ruang baca dan koleksi buku referensi'],
      ['L004', 'Ruang Rapat Besar', 'Gedung Utama', '3', 'D301', 'Ruang rapat untuk acara besar dan seminar'],
      ['L005', 'Kantor Dekan', 'Gedung Administrasi', '2', 'E201', 'Kantor pimpinan fakultas dan staf administrasi']
    ];

    // Create CSV content with proper escaping
    const csvContent = templateData.map(row => 
      row.map(field => {
        // Escape fields that contain commas or quotes
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_lokasi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
      addNotification('success', 'Template berhasil didownload');
  };

// Use the data directly from the API, then apply client-side filtering like AssetsPage
  const filteredLocations = data?.data?.filter((location: Location) => {
    // Text search - check if searchTerm matches any relevant fields
    const matchesSearch = searchTerm === '' || 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (location.building && location.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (location.floor && location.floor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (location.room && location.room.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard hover={false} className="p-10 text-center">
          <Loader size="lg" message="Memuat lokasi..." />
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard hover={false} className="p-6 border-l-4 border-red-500">
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
              <button 
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => window.location.reload()}
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    );  }
  
  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard hover={false} className="overflow-hidden">
        {/* Search and Controls */}
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30 flex flex-wrap justify-between items-center gap-3">
          {/* Search input */}
          <div className="relative rounded-md shadow-sm max-w-md flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="search"
              id="search-locations"
              className="block w-full rounded-md border-0 py-1.5 pl-9 text-gray-900 ring-1 ring-inset ring-gray-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xs transition-all duration-300"
              placeholder="Cari lokasi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
            />
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:-translate-y-0.5 transition-all duration-300"
            >
              <DocumentArrowUpIcon className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>
            <Link to="/locations/new">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-300">
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Tambah Lokasi</span>
              </button>
            </Link>
          </div>
        </div>
        
        {/* Locations table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300/50">
              <thead className="bg-gray-50/70">
                <tr>
                  <th scope="col" className="py-1.5 pl-4 pr-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gedung
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lantai
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruangan
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Aset
                  </th>
                  <th scope="col" className="relative py-1.5 pl-2 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredLocations && filteredLocations.length > 0 ? (
                  filteredLocations.map((location: Location) => (
                    <tr 
                      key={location.id} 
                      className="table-row-hover hover:bg-blue-50/30 transition-all"
                    >
                      <td className="whitespace-nowrap py-2.5 pl-4 pr-2 text-xs font-mono text-gray-700">{location.code}</td>
                      <td className="px-2 py-2.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-100/80 mr-2">
                            <MapPinIcon className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div className="text-xs font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{location.name}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-xs text-gray-500">{location.building || ''}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-xs text-gray-500">{location.floor || ''}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-xs text-gray-500">{location.room || ''}</td>
                      <td className="px-2 py-2.5 text-xs text-gray-500 max-w-xs truncate">
                        {location.description || ''}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2.5 text-xs">
                        <Link
                          to={`/assets?location=${location.id}`}
                          className="inline-flex items-center rounded-full bg-gradient-to-r from-green-50 to-green-100 px-2 py-0.5 text-xs font-medium text-green-800 border border-green-200 shadow-sm transition-all duration-300 hover:scale-105 hover:from-green-100 hover:to-green-200 hover:border-green-300 cursor-pointer"
                          title={`Lihat ${location.asset_count || 0} aset dalam lokasi ${location.name}`}
                        >
                          {location.asset_count || 0} aset
                        </Link>
                      </td>
                      <td className="whitespace-nowrap py-2.5 pl-2 pr-4 text-right text-xs font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            to={`/locations/edit/${location.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1"
                          >
                            <svg className="h-3.5 w-3.5 mr-1 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            <span className="leading-none">Ubah</span>
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1"
                            onClick={() => openDeleteModal(location)}
                          >
                            <svg className="h-3.5 w-3.5 mr-1 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            <span className="leading-none">Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100/80 p-3">
                          <MapPinIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-500">
                          {searchTerm ? 'Tidak ada lokasi yang sesuai dengan pencarian Anda' : 'Belum ada data lokasi'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 max-w-md text-center">
                          {searchTerm ? 'Coba ubah kriteria pencarian Anda' : 'Mulai tambahkan lokasi untuk mengelola aset dengan lebih baik'}
                        </p>
                        {!searchTerm && (
                          <Link to="/locations/new" className="mt-4">
                            <button className="animate-pulse flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-300">
                              <PlusIcon className="h-3.5 w-3.5" />
                              Tambah Lokasi Pertama
                            </button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
            {/* Pagination controls */}
          {data?.pagination && filteredLocations && (
            <Pagination
              pagination={data.pagination}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemName="lokasi"
              showPageSizeSelector={true}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          )}
        </div>
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <Transition appear show={deleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setDeleteModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
                    <button
                      className="w-full sm:ml-3 sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border shadow-sm text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={confirmDelete}
                      disabled={deleteMutation.isPending}
                      autoFocus
                    >
                      {deleteMutation.isPending && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 hover:-translate-y-0.5"
                      onClick={() => setDeleteModalOpen(false)}
                    >
                      Batal
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Import Modal */}
      <Transition.Root show={importModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setImportModalOpen}>
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
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentArrowUpIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Import Lokasi
                    </Dialog.Title>                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Upload file Excel atau CSV untuk mengimport data lokasi secara bulk. Kolom dengan tanda (*) wajib diisi.
                      </p>
                      
                      {/* Download Template Button */}
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={downloadTemplate}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          Download Template
                        </button>
                      </div>

                      {/* File Upload */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pilih File
                        </label>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {importFile && (
                          <p className="mt-2 text-sm text-green-600">
                            File terpilih: {importFile.name}
                          </p>
                        )}
                      </div>

                      {/* Error Message */}
                      {importError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">{importError}</p>
                        </div>
                      )}

                      {/* Success Message */}
                      {importSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-600">{importSuccess}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    className="w-full sm:ml-3 sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border shadow-sm text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleImportSubmit}
                    disabled={importLoading || !importFile}
                  >
                    {importLoading && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {importLoading ? 'Mengimport...' : 'Import'}
                  </button>                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 hover:-translate-y-0.5"
                    onClick={() => {
                      setImportModalOpen(false);
                      setImportFile(null);
                      setImportError(null);
                      setImportSuccess(null);
                    }}
                  >
                    Batal
                  </button>
                </div>              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
