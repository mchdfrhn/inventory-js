import { useState, useEffect, Fragment, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { locationApi, API_BASE_URL } from '../services/api';
import type { Location } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import Pagination from '../components/Pagination';
import GradientButton from '../components/GradientButton';
import { useNotification } from '../context/NotificationContext';
import InlineLoader from '../components/InlineLoader';
  
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
  
  // Sorting states
  const [sortField, setSortField] = useState<string>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
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
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      // Extract specific error message from backend
      let errorMessage = 'Gagal menghapus lokasi. Silakan coba lagi.';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setDeleteError(errorMessage);
      addNotification('error', errorMessage);
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
  const confirmDelete = useCallback(() => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete.id);
    }
  }, [locationToDelete, deleteMutation]);

  // Handle Enter key press for delete confirmation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (deleteModalOpen && event.key === 'Enter' && !deleteMutation.isPending) {
        confirmDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteModalOpen, deleteMutation.isPending, confirmDelete]);

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
      formData.append('file', importFile);      console.log(`Sending import request to ${API_BASE_URL}/api/v1/locations/import`);
      const response = await fetch(`${API_BASE_URL}/api/v1/locations/import`, {
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
  };

  // Handle table header clicks for sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different field, set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort icon for table headers
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return null;
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  // Download template Excel file
  const downloadTemplate = () => {    // Create template data with Indonesian headers
    // Tanda * menunjukkan kolom yang wajib diisi (required)
    // Kode tidak perlu disertakan karena akan dibuat otomatis
    const templateData = [
      ['Nama*', 'Gedung', 'Lantai', 'Ruangan', 'Deskripsi'],
      ['Ruang Kelas 1A', 'Gedung Utama', '1', 'A101', 'Ruang kelas untuk mata kuliah umum dan teori'],
      ['Laboratorium Komputer', 'Gedung Teknik', '2', 'B201', 'Lab untuk praktikum programming dan sistem informasi'],
      ['Perpustakaan', 'Gedung Utama', '1', 'C101', 'Ruang baca dan koleksi buku referensi'],
      ['Ruang Rapat Besar', 'Gedung Utama', '3', 'D301', 'Ruang rapat untuk acara besar dan seminar'],
      ['Kantor Dekan', 'Gedung Administrasi', '2', 'E201', 'Kantor pimpinan fakultas dan staf administrasi']
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

// Use the data directly from the API, then apply client-side filtering and sorting like AssetsPage
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

  // Sorting functionality for locations
  const filteredAndSortedLocations = filteredLocations?.sort((a: Location, b: Location) => {
    let aValue: string | number, bValue: string | number;
    
    switch (sortField) {
      case 'code':
        aValue = a.code;
        bValue = b.code;
        break;
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'building':
        aValue = a.building || '';
        bValue = b.building || '';
        break;
      case 'floor':
        aValue = a.floor || '';
        bValue = b.floor || '';
        break;
      case 'room':
        aValue = a.room || '';
        bValue = b.room || '';
        break;
      case 'asset_count':
        aValue = a.asset_count || 0;
        bValue = b.asset_count || 0;
        break;
      default:
        aValue = a.code;
        bValue = b.code;
    }
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    // Handle numeric comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Fallback comparison
    const comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return <LoadingState message="Memuat data lokasi..." size="lg" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error memuat lokasi"
        error={error}
        onRetry={() => window.location.reload()}
        retryLabel="Coba lagi"
      />
    );
  }
  
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:-translate-y-0.5 transition-all duration-300"
            >
              <DocumentArrowUpIcon className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>
            <Link to="/locations/new">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:-translate-y-0.5 transition-all duration-300">
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Tambah Lokasi</span>
              </button>
            </Link>
          </div>
        </div>
        
        {/* Locations table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto table-responsive">
            <table className="min-w-full divide-y divide-gray-300/50 table-fixed">
              <thead className="bg-gray-50/70">
                <tr>
                  <th scope="col" className="py-1.5 pl-4 pr-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    <button 
                      onClick={() => handleSort('code')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Kode
                      {renderSortIcon('code')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Nama
                      {renderSortIcon('name')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <button 
                      onClick={() => handleSort('building')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Gedung
                      {renderSortIcon('building')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    <button 
                      onClick={() => handleSort('floor')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Lantai
                      {renderSortIcon('floor')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    <button 
                      onClick={() => handleSort('room')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Ruangan
                      {renderSortIcon('room')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <button 
                      onClick={() => handleSort('asset_count')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Jumlah Aset
                      {renderSortIcon('asset_count')}
                    </button>
                  </th>
                  <th scope="col" className="relative py-1.5 pl-2 pr-4 w-24 sticky-action-col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredAndSortedLocations && filteredAndSortedLocations.length > 0 ? (
                  filteredAndSortedLocations.map((location: Location) => (
                    <tr 
                      key={location.id} 
                      className="table-row-hover hover:bg-blue-50/30 transition-all"
                    >
                      <td className="py-2.5 pl-4 pr-2 text-xs font-mono text-gray-700 w-20 truncate">{location.code}</td>
                      <td className="px-2 py-2.5 w-40">
                        <div className="flex items-center min-w-0">
                          <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-100/80 mr-2 flex-shrink-0">
                            <MapPinIcon className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div className="text-xs font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">{location.name}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-xs text-gray-500 w-24 truncate">{location.building || ''}</td>
                      <td className="px-2 py-2.5 text-xs text-gray-500 w-16 truncate">{location.floor || ''}</td>
                      <td className="px-2 py-2.5 text-xs text-gray-500 w-20 truncate">{location.room || ''}</td>
                      <td className="px-2 py-2.5 text-xs text-gray-500 w-40 truncate">
                        {location.description || ''}
                      </td>
                      <td className="px-2 py-2.5 text-xs w-24">
                        {location.asset_count && location.asset_count > 0 ? (
                          <Link
                            to={`/assets?location=${location.id}`}
                            className="inline-flex items-center rounded-full bg-gradient-to-r from-green-50 to-green-100 px-2 py-0.5 text-xs font-medium text-green-800 border border-green-200 shadow-sm transition-all duration-300 hover:scale-105 hover:from-green-100 hover:to-green-200 hover:border-green-300 cursor-pointer truncate"
                            title={`Lihat ${location.asset_count} aset dalam lokasi ${location.name}`}
                          >
                            {location.asset_count} aset
                          </Link>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-50 to-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 border border-gray-200 truncate">
                            0 aset
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pl-2 pr-4 text-right text-xs font-medium w-24 sticky-action-col">
                        <div className="flex justify-end space-x-1.5">
                          <Link
                            to={`/locations/edit/${location.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1 py-1"
                            title="Ubah lokasi"
                          >
                            <svg className="h-3.5 w-3.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            <span className="leading-none ml-1 mobile-hide-text">Ubah</span>
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1 py-1"
                            onClick={() => openDeleteModal(location)}
                            title="Hapus lokasi"
                          >
                            <svg className="h-3.5 w-3.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            <span className="leading-none ml-1 mobile-hide-text">Hapus</span>
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
          {data?.pagination && filteredAndSortedLocations && (
            <Pagination
              pagination={{
                total_items: data.pagination.total,
                total_pages: data.pagination.totalPages,
                current_page: data.pagination.page,
              }}
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
                        {locationToDelete?.asset_count && locationToDelete.asset_count > 0 && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-800">
                                  <strong>Peringatan:</strong> Lokasi ini memiliki {locationToDelete.asset_count} aset yang terkait. 
                                  Anda perlu memindahkan atau menghapus aset tersebut terlebih dahulu sebelum menghapus lokasi ini.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {deleteError && (
                          <div className="mt-3 p-3 bg-red-50 rounded-md">
                            <p className="text-sm text-red-800">{deleteError}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <GradientButton
                      variant="danger"
                      className="w-full sm:ml-3 sm:w-auto"
                      onClick={confirmDelete}
                      disabled={deleteMutation.isPending || !!(locationToDelete?.asset_count && locationToDelete.asset_count > 0)}
                      autoFocus={!(locationToDelete?.asset_count && locationToDelete.asset_count > 0)}
                    >
                      {deleteMutation.isPending && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {deleteMutation.isPending 
                        ? 'Menghapus...' 
                        : (locationToDelete?.asset_count && locationToDelete.asset_count > 0)
                          ? 'Tidak dapat dihapus'
                          : 'Hapus'
                      }
                    </GradientButton>
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

      {/* Import Side Panel */}
      <Transition.Root show={importModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-y-0 right-0 z-50 overflow-y-auto" onClose={setImportModalOpen}>
          <div className="flex h-full">
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white pt-5 pb-4 shadow-xl">
                {/* Header */}
                <div className="px-6 flex items-center justify-between border-b border-gray-200 pb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800 flex items-center">
                    <DocumentArrowUpIcon className="h-5 w-5 text-purple-600 mr-2" />
                    Import Lokasi
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-colors"
                    onClick={() => setImportModalOpen(false)}
                  >
                    <span className="sr-only">Tutup Panel</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="mt-4 flex flex-col px-6 space-y-5 overflow-y-auto">
                  {/* Instructions Section */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                      Panduan Import
                    </h3>
                    <div className="text-xs text-gray-700 space-y-2">
                      <p>Upload file Excel atau CSV untuk mengimport data lokasi secara bulk. Kolom dengan tanda (*) wajib diisi.</p>
                      
                      <div className="space-y-1">
                        <p><strong>Format file:</strong> Excel (.xlsx, .xls) atau CSV (.csv)</p>
                        <p><strong>Kode Lokasi:</strong> Dibuat otomatis dengan format 3 digit (001, 002, 003, dst)</p>
                        <p><strong>Nama Lokasi:</strong> Nama unik untuk setiap lokasi</p>
                        <p><strong>Gedung & Lantai:</strong> Informasi opsional untuk detail lokasi</p>
                      </div>
                    </div>
                  </div>

                  {/* Tips Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Tips & Panduan
                    </h3>
                    <div className="text-xs text-blue-700 space-y-2">
                      <p>💡 <strong>Tips:</strong> Pastikan nama lokasi unik dan belum ada di sistem untuk menghindari duplikasi data.</p>
                      <p>🏢 <strong>Otomatis:</strong> Kode lokasi akan dibuat otomatis oleh sistem dengan format 3 digit berurutan.</p>
                    </div>
                  </div>
                  
                  {/* Download Template Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Template CSV
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">Download template untuk memastikan format data yang benar.</p>
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="inline-flex items-center px-2.5 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1.5" />
                      Download Template
                    </button>
                  </div>

                  {/* File Upload Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                      Upload File
                    </h3>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 file:transition-colors file:cursor-pointer border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                      {importFile && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-xs text-green-700 flex items-center">
                            <svg className="h-3.5 w-3.5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            File terpilih: {importFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Messages */}
                  {importError && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-start">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                          <p className="text-sm text-red-700">{importError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {importSuccess && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="text-sm font-medium text-green-800 mb-1">Berhasil</h3>
                          <p className="text-sm text-green-700">{importSuccess}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-3">
                      <button
                        type="button"
                        className={`w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                          importLoading || !importFile
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500 hover:-translate-y-0.5 shadow-lg'
                        }`}
                        onClick={handleImportSubmit}
                        disabled={importLoading || !importFile}
                      >
                        {importLoading ? (
                          <>
                            <InlineLoader size="xs" variant="white" className="mr-2" />
                            Mengimpor...
                          </>
                        ) : (
                          <>
                            <DocumentArrowUpIcon className="h-3.5 w-3.5 mr-1.5" />
                            Import Data
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-3 py-2 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                        onClick={() => {
                          setImportModalOpen(false);
                          setImportFile(null);
                          setImportError(null);
                          setImportSuccess(null);
                        }}
                        disabled={importLoading}
                      >
                        <XMarkIcon className="h-3.5 w-3.5 mr-1.5" />
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
