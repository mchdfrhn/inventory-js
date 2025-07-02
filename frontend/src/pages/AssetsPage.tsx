import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { assetApi, categoryApi, locationApi } from '../services/api';
import type { Asset, Category, Location } from '../services/api';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  MapPinIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';
import ExportButton from '../components/ExportButton';
import BulkTableRow from '../components/BulkTableRow';
import AssetDetailPopup from '../components/AssetDetailPopup';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PageSizeSelector from '../components/PageSizeSelector';
import { useNotification } from '../context/NotificationContext';

// Status styling with gradient backgrounds for a more modern look
const statusGradients: Record<string, string> = {
  // Current valid status values
  baik: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
  rusak: 'from-rose-50 to-rose-100 border-rose-200 text-rose-800',
  tidak_memadai: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
};

// Helper function to format status display text
const formatStatus = (status: string): string => {
  // Map status to display text
  if (status === 'baik') {
    return 'Baik';
  } else if (status === 'rusak') {
    return 'Rusak';
  } else if (status === 'tidak_memadai') {
    return 'Kurang Baik';
  }
  return 'Baik'; // Default fallback
};

// Helper function to calculate total acquisition price for bulk assets
const getTotalHargaPerolehan = (asset: Asset): number => {
  // For bulk assets, multiply harga_perolehan by bulk_total_count
  if (asset.bulk_total_count && asset.bulk_total_count > 1) {
    return asset.harga_perolehan * asset.bulk_total_count;
  }
  // For regular assets, return harga_perolehan as is
  return asset.harga_perolehan;
};

// Helper function to calculate total nilai sisa for bulk assets
const getTotalNilaiSisa = (asset: Asset): number => {
  // For bulk assets, multiply nilai_sisa by bulk_total_count
  if (asset.bulk_total_count && asset.bulk_total_count > 1) {
    return asset.nilai_sisa * asset.bulk_total_count;
  }
  // For regular assets, return nilai_sisa as is
  return asset.nilai_sisa;
};



export default function AssetsPage() {  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    // Try to get pageSize from localStorage, default to 10 if not found
    const savedPageSize = localStorage.getItem('assetPageSize');
    return savedPageSize ? parseInt(savedPageSize, 10) : 10;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [depreciationFilter, setDepreciationFilter] = useState<string>('all');
  const [acquisitionYearFilter, setAcquisitionYearFilter] = useState<string | null>(null);
  const [acquisitionSourceFilter, setAcquisitionSourceFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  // Temporary filter states that will only be applied when clicking "Terapkan Filter"
  const [tempFilter, setTempFilter] = useState<string | null>(null);
  const [tempDepreciationFilter, setTempDepreciationFilter] = useState<string>('all');
  const [tempAcquisitionYearFilter, setTempAcquisitionYearFilter] = useState<string | null>(null);
  const [tempAcquisitionSourceFilter, setTempAcquisitionSourceFilter] = useState<string | null>(null);
  const [tempCategoryFilter, setTempCategoryFilter] = useState<string | null>(null);
  const [tempLocationFilter, setTempLocationFilter] = useState<string | null>(null);
  // Loading state for filter button
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);  
  
  // Detail popup state
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [assetToView, setAssetToView] = useState<Asset | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('kode');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [mounted, setMounted] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // Add notification hook
  const { addNotification } = useNotification();

  // Import states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // File validation function
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/csv' // .csv
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setImportError('File harus berformat .csv');
        setImportFile(null);
        event.target.value = '';
        return;
      }
      
      // Clear any previous errors
      setImportError(null);
      setImportSuccess(null);
      setImportFile(file);
    }
  };

  // Save pageSize to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('assetPageSize', pageSize.toString());
  }, [pageSize]);
    const queryClient = useQueryClient();  
  
  // Effect for page load animation
  useEffect(() => {
    setMounted(true);
  }, []);
  // Handle URL parameters on page load
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const locationParam = searchParams.get('location');
    
    if (categoryParam) {
      setCategoryFilter(categoryParam);
      setTempCategoryFilter(categoryParam);
    }
    
    if (locationParam) {
      setLocationFilter(locationParam);
      setTempLocationFilter(locationParam);
    }
  }, [searchParams]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['assets', page, pageSize],
    queryFn: () => assetApi.listWithBulk(page, pageSize),
  });
    // Fetch categories for filter
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories_for_filter'],
    queryFn: () => categoryApi.list(),
  });
  
  // Fetch locations for filter
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations_for_filter'],
    queryFn: () => locationApi.list(1, 100), // Get up to 100 locations
  });  // Delete mutation - supports both single asset and bulk asset deletion
  const deleteMutation = useMutation({
    mutationFn: async (asset: Asset) => {
      // Jika asset adalah bulk parent, hapus semua asset dalam bulk
      if (asset.is_bulk_parent && asset.bulk_id) {
        return assetApi.deleteBulk(asset.bulk_id);
      }
      // Jika asset biasa, hapus hanya asset tersebut
      return assetApi.delete(asset.id);
    },
    onSuccess: (_, asset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setDeleteModalOpen(false);
      setAssetToDelete(null);
      
      // Tampilkan notifikasi sesuai jenis penghapusan
      if (asset.is_bulk_parent) {
        addNotification('success', `Bulk asset berhasil dihapus (${asset.bulk_total_count || 1} unit)`);
      } else {
        addNotification('success', 'Aset berhasil dihapus');
      }
    },
    onError: (err) => {
      addNotification('error', 'Gagal menghapus aset. Silakan coba lagi.');
      console.error('Delete error:', err);
    }
  });

  // Open delete confirmation modal
  const openDeleteModal = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteModalOpen(true);
  };
  
  // Open detail popup
  const openDetailPopup = (asset: Asset) => {
    setAssetToView(asset);
    setDetailPopupOpen(true);
  };
  
  // Close detail popup
  const closeDetailPopup = () => {
    setDetailPopupOpen(false);
    setAssetToView(null);
  };
  
  // Handle delete confirmation
  const confirmDelete = () => {
    if (assetToDelete) {
      deleteMutation.mutate(assetToDelete);
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
    setImportSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);      console.log('Sending import request to http://localhost:8080/api/v1/assets/import');
      const response = await fetch('http://localhost:8080/api/v1/assets/import', {
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

      setImportSuccess(`Berhasil mengimport ${result.imported_count || 0} aset dari ${result.total_rows || 0} baris`);
      
      // Show additional info if there were partial errors
      if (result.errors && result.errors.length > 0) {
        console.warn('Import warnings:', result.errors);
        setImportSuccess(`Berhasil mengimport ${result.imported_count || 0} aset dari ${result.total_rows || 0} baris. ${result.errors.length} baris tidak dapat diimport.`);
      }
      
      // Refresh the assets list
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      
      // Reset form after success
      setTimeout(() => {
        setImportModalOpen(false);
        setImportFile(null);
        setImportSuccess(null);
        addNotification('success', `Berhasil mengimport ${result.imported_count || 0} aset`);
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengimport data';
      setImportError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setImportLoading(false);
    }
  };  // Download template CSV file for assets
  const downloadTemplate = () => {    // Template data dengan format baru sesuai spesifikasi
    // Tanda * menunjukkan kolom yang wajib diisi (required)
    // Format: Nama Aset*, Kode Kategori*, Spesifikasi, Tanggal Perolehan*, Jumlah*, Satuan, Harga Perolehan*, Umur Ekonomis, Kode Lokasi*, ID Asal Pengadaan*, Status
    // Kode Kategori: 10=Peralatan Komputer, 20=Furniture Kantor, 30=Kendaraan, 40=Audio Visual, 50=Laboratorium
    // Kode Lokasi: 001-999 (gunakan kode yang sesuai dengan lokasi di sistem)
    // ID Asal Pengadaan: 1=Pembelian, 2=Bantuan, 3=Hibah, 4=Sumbangan, 5=Produksi Sendiri
    const templateData = [
      ['Nama Aset*', 'Kode Kategori*', 'Spesifikasi', 'Tanggal Perolehan*', 'Jumlah*', 'Satuan', 'Harga Perolehan*', 'Umur Ekonomis', 'Kode Lokasi*', 'ID Asal Pengadaan*', 'Status'],
      ['Laptop Dell Inspiron 15', '10', 'Core i5 Gen 12 RAM 8GB SSD 256GB', '2024-01-15', '1', 'unit', '8500000', '5', '001', 'Pembelian', 'Baik'],
      ['Kursi Kantor Ergonomis', '20', 'Kursi putar dengan sandaran tinggi bahan mesh', '2024-01-25', '10', 'unit', '750000', '8', '002', 'Pembelian', 'Baik'],
      ['Printer HP LaserJet Pro', '10', 'Printer laser monochrome A4 duplex network', '2024-03-05', '2', 'unit', '3200000', '7', '001', 'Bantuan', 'Baik'],
      ['Proyektor Epson EB-X41', '40', 'Proyektor XGA 3600 lumens HDMI VGA', '2023-12-20', '3', 'unit', '4800000', '8', '003', 'Hibah', 'Baik'],
      ['Meja Kantor Kayu Jati', '20', 'Meja kerja kayu jati ukuran 120x60x75 cm dengan laci', '2024-02-10', '5', 'unit', '1200000', '10', '002', 'Pembelian', 'Baik'],
      ['Mikroskop Digital', '50', 'Mikroskop digital 1000x dengan kamera USB', '2023-11-15', '1', 'unit', '12000000', '10', '004', 'Bantuan', 'Baik']
    ];

    // Create CSV content with proper escaping
    const csvContent = templateData.map(row => 
      row.map(field => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_aset.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addNotification('success', 'Template berhasil didownload');
  };
  // Filter and search functionality
  const filteredAssets = data?.data?.filter((asset: Asset) => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      asset.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.spesifikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.keterangan && asset.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Status filter with compatibility for old values
    let matchesFilter = !filter; // If no filter, everything matches
    if (filter) {
      if (filter === 'baik') {
        matchesFilter = formatStatus(asset.status).toLowerCase() === 'baik';
      } else if (filter === 'rusak') {
        matchesFilter = formatStatus(asset.status).toLowerCase() === 'rusak';
      } else if (filter === 'tidak_memadai') {
        matchesFilter = formatStatus(asset.status).toLowerCase().replace(' ', '_') === 'tidak_memadai';
      }
    }
    
    // Depreciation percentage filter
    const depreciationPercentage = asset.harga_perolehan > 0
      ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
      : 0;
    
    let matchesDepreciationFilter = true;
    if (depreciationFilter !== 'all') {
      // Extract range values
      const [min, max] = depreciationFilter.split('-').map(Number);
      matchesDepreciationFilter = depreciationPercentage >= min && depreciationPercentage <= max;
    }
    
    // Acquisition year filter
    let matchesAcquisitionYearFilter = true;
    if (acquisitionYearFilter) {
      const assetYear = asset.tanggal_perolehan ? new Date(asset.tanggal_perolehan).getFullYear().toString() : '';
      matchesAcquisitionYearFilter = assetYear === acquisitionYearFilter;
    }
      // Acquisition source filter
    let matchesAcquisitionSourceFilter = true;
    if (acquisitionSourceFilter) {
      matchesAcquisitionSourceFilter = asset.asal_pengadaan === acquisitionSourceFilter;
    }
    
    // Category filter
    let matchesCategoryFilter = true;
    if (categoryFilter) {
      matchesCategoryFilter = asset.category_id === categoryFilter;
    }
    
    // Location filter
    let matchesLocationFilter = true;
    if (locationFilter) {
      matchesLocationFilter = asset.lokasi_id?.toString() === locationFilter;
    }
      return matchesSearch && 
           matchesFilter && 
           matchesDepreciationFilter && 
           matchesAcquisitionYearFilter && 
           matchesAcquisitionSourceFilter &&
           matchesCategoryFilter &&
           matchesLocationFilter;
  });

  // Sorting functionality
  const filteredAndSortedAssets = filteredAssets?.sort((a: Asset, b: Asset) => {
    let aValue: any, bValue: any;
      switch (sortField) {      case 'kode':
        // Extract the 3-digit sequence number from the end of the code
        // Format: "048.30.1.25.001" or bulk "048.30.1.25.001-002"
        const extractSequenceNumber = (kode: string): number => {
          // For bulk assets, remove the suffix (-XXX) first
          let codeToProcess = kode;
          if (kode.includes('-')) {
            const parts = kode.split('-');
            codeToProcess = parts[0]; // Get the parent code part
          }
          
          // Extract the last 3 digits after the last dot
          const match = codeToProcess.match(/\.(\d{3})$/);
          return match ? parseInt(match[1], 10) : 0;
        };
        
        aValue = extractSequenceNumber(a.kode);
        bValue = extractSequenceNumber(b.kode);
        
        // If both have no sequence numbers (both return 0), fallback to string comparison
        if (aValue === 0 && bValue === 0) {
          aValue = a.kode;
          bValue = b.kode;
        }
        break;
      case 'nama':
        aValue = a.nama;
        bValue = b.nama;
        break;
      case 'kategori':
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;      case 'harga_perolehan':
        aValue = getTotalHargaPerolehan(a);
        bValue = getTotalHargaPerolehan(b);
        break;      case 'nilai_sisa':
        aValue = getTotalNilaiSisa(a);
        bValue = getTotalNilaiSisa(b);
        break;
      case 'penyusutan':
        aValue = a.harga_perolehan > 0 ? (a.akumulasi_penyusutan / a.harga_perolehan) * 100 : 0;
        bValue = b.harga_perolehan > 0 ? (b.akumulasi_penyusutan / b.harga_perolehan) * 100 : 0;
        break;
      case 'lokasi':
        aValue = a.location_info?.name || '';
        bValue = b.location_info?.name || '';
        break;
      case 'status':
        aValue = formatStatus(a.status);
        bValue = formatStatus(b.status);
        break;
      default:
        aValue = a.nama;
        bValue = b.nama;
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
    
    // Fallback to string comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    const comparison = aStr.localeCompare(bStr);
    return sortDirection === 'asc' ? comparison : -comparison;
  }) || [];

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

  // Handle Enter key press for delete confirmation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (deleteModalOpen && event.key === 'Enter' && !deleteMutation.isPending) {
        confirmDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteModalOpen, deleteMutation.isPending]);  
  // Initialize temporary filter states with current filter values when panel opens
  useEffect(() => {
    if (filterPanelOpen) {
      console.log('Filter panel opened, setting temporary filters:', { 
        filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter, categoryFilter, locationFilter
      });
      setTempFilter(filter);
      setTempDepreciationFilter(depreciationFilter);
      setTempAcquisitionYearFilter(acquisitionYearFilter);
      setTempAcquisitionSourceFilter(acquisitionSourceFilter);
      setTempCategoryFilter(categoryFilter);
      setTempLocationFilter(locationFilter);
    }
  }, [filterPanelOpen, filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter, categoryFilter, locationFilter]);
  // Watch for changes in the actual filter values for debugging
  useEffect(() => {
    console.log('Filter value changed:', { 
      filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter 
    });
  }, [filter, depreciationFilter, acquisitionYearFilter, acquisitionSourceFilter]);

  // Function to apply filters
  const applyFilters = () => {    console.log('Applying filters:', { 
      tempFilter, 
      tempDepreciationFilter,
      tempAcquisitionYearFilter,
      tempAcquisitionSourceFilter,
      tempCategoryFilter,
      tempLocationFilter
    });
    
    // Show loading state
    setIsApplyingFilter(true);
    
    // Apply the temporary filters to the actual filter state
    setTimeout(() => {
      setFilter(tempFilter);
      setDepreciationFilter(tempDepreciationFilter);
      setAcquisitionYearFilter(tempAcquisitionYearFilter);
      setAcquisitionSourceFilter(tempAcquisitionSourceFilter);
      setCategoryFilter(tempCategoryFilter);
      setLocationFilter(tempLocationFilter);
      
      // Reset to page 1 when applying filters
      setPage(1);
      
      // Hide loading state
      setIsApplyingFilter(false);
      
      // Close the filter panel after applying
      setFilterPanelOpen(false);
    }, 300); // Short delay for visual feedback
  };
  // Initialize temporary filter state helper function
  const resetTempFiltersToDefaults = () => {
    setTempFilter(null);
    setTempDepreciationFilter('all');
    setTempAcquisitionYearFilter(null);
    setTempAcquisitionSourceFilter(null);
    setTempCategoryFilter(null);
    setTempLocationFilter(null);
    console.log('Temporary filters reset to defaults');
  };

  // Reset all filters function
  const resetAllFilters = () => {
    setSearchTerm('');
    setFilter(null);
    setDepreciationFilter('all');
    setAcquisitionYearFilter(null);
    setAcquisitionSourceFilter(null);
    setCategoryFilter(null);
    setLocationFilter(null);
    resetTempFiltersToDefaults();
    setPage(1);
    console.log('All filters have been cleared');
  };

  // Function to get location data for assets
  const fetchLocationDataForAssets = async (assets: Asset[]) => {
    const assetsWithLocations = await Promise.all(
      assets.map(async (asset) => {
        if (asset.lokasi_id && !asset.location_info) {
          try {
            const locationData = await locationApi.getLocationForAsset(asset.lokasi_id);
            return {
              ...asset,
              location_info: locationData
            };
          } catch (error) {
            console.error(`Error fetching location for asset ${asset.id}:`, error);
            return asset;
          }
        }
        return asset;
      })
    );
    return assetsWithLocations;
  };
  // When data loads, enrich assets with location data
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      const assetsWithLokasiId = data.data.filter(asset => asset.lokasi_id && !asset.location_info);
      if (assetsWithLokasiId.length > 0) {
        fetchLocationDataForAssets(data.data).then(enrichedAssets => {
          // Update the data with enriched assets
          queryClient.setQueryData(['assets', page, pageSize], {
            ...data,
            data: enrichedAssets
          });
        });
      }
    }
  }, [data, queryClient, page, pageSize]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-10 text-center">
          <Loader size="lg" message="Memuat aset..." />
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
            <h3 className="text-lg font-medium text-red-800">Error memuat aset</h3>
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
  }  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard className="overflow-hidden">        {/* Header section */}
        <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Aset</h2>
            <p className="mt-1 text-sm text-gray-500">
              Kelola semua aset inventaris STTPU dengan mudah dan efisien
            </p>
          </div>          <div className="flex space-x-3">
            <GradientButton 
              variant="secondary" 
              onClick={() => setImportModalOpen(true)}
              className="flex items-center"
            >
              <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Import
            </GradientButton>
            <Link to="/assets/new">
              <GradientButton variant="primary" className="flex items-center">
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Tambah Aset
              </GradientButton>
            </Link>
          </div>
        </div>

        {/* Category Filter Notification */}
        {categoryFilter && categoriesData?.data && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Menampilkan aset dalam kategori: 
                  <span className="font-semibold ml-1">
                    {categoriesData.data.find((c: Category) => c.id === categoryFilter)?.name || 'Kategori Dipilih'}
                  </span>
                </span>
              </div>
              <button
                onClick={() => {
                  setCategoryFilter(null);
                  setTempCategoryFilter(null);
                  setSearchParams(params => {
                    params.delete('category');
                    return params;
                  });
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >                Hapus Filter              </button>
            </div>
          </div>
        )}

        {/* Location Filter Notification */}
        {locationFilter && locationsData?.data && (
          <div className="px-6 py-3 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Menampilkan aset dalam lokasi: 
                  <span className="font-semibold ml-1">
                    {locationsData.data.find((l: Location) => l.id.toString() === locationFilter)?.name || 'Lokasi Dipilih'}
                  </span>
                </span>
              </div>
              <button
                onClick={() => {
                  setLocationFilter(null);
                  setTempLocationFilter(null);
                  setSearchParams(params => {
                    params.delete('location');
                    return params;
                  });
                }}
                className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
              >
                Hapus Filter
              </button>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30 flex flex-wrap justify-between items-center gap-4">
          {/* Search input */}
          <div className="relative rounded-md shadow-sm max-w-md flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="search"
              id="search-assets"
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm transition-all duration-300"
              placeholder="Cari aset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>          {/* Filter toggles and export - moved to right */}          <div className="flex items-center gap-3 flex-wrap ml-auto">
            <ExportButton assets={filteredAndSortedAssets || []} filename="daftar_aset_sttpu" />
            <button
              type="button"
              onClick={() => setFilterPanelOpen(true)}              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm text-sm
                ${filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter || categoryFilter || locationFilter
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-50'}
                transition-all duration-300
              `}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />              <span>{filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter || categoryFilter || locationFilter ? 'Filter Aktif' : 'Filter'}</span>
              {(filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter || categoryFilter || locationFilter) && (                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
                  {(filter ? 1 : 0) + 
                   (depreciationFilter !== 'all' ? 1 : 0) + 
                   (acquisitionYearFilter ? 1 : 0) + 
                   (acquisitionSourceFilter ? 1 : 0) +
                   (categoryFilter ? 1 : 0) +
                   (locationFilter ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
          {/* Filter Side Panel */}
        <Transition.Root show={filterPanelOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-y-0 right-0 z-50 overflow-y-auto" onClose={setFilterPanelOpen}>
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
              >                <div className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white pt-5 pb-4 shadow-xl">
                  <div className="px-6 flex items-center justify-between border-b border-gray-200 pb-4">
                    <Dialog.Title className="text-lg font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Filter Aset</Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-colors"
                      onClick={() => setFilterPanelOpen(false)}
                    >
                      <span className="sr-only">Tutup Panel</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex flex-col px-6 space-y-5 overflow-y-auto">                    {/* Status Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Status Aset
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                            name="status" 
                            value="" 
                            checked={tempFilter === null}
                            onChange={() => {
                              setTempFilter(null);
                            }} 
                          />
                          <span className="ml-2 text-sm">Semua Status</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" 
                            name="status" 
                            value="baik"
                            checked={tempFilter === 'baik'} 
                            onChange={() => {
                              setTempFilter('baik');
                            }}
                          />
                          <span className="ml-2 text-sm text-green-700">Baik</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                            name="status" 
                            value="rusak"
                            checked={tempFilter === 'rusak'} 
                            onChange={() => {
                              setTempFilter('rusak');
                            }}
                          />
                          <span className="ml-2 text-sm text-red-700">Rusak</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                            name="status" 
                            value="tidak_memadai"
                            checked={tempFilter === 'tidak_memadai'} 
                            onChange={() => {
                              setTempFilter('tidak_memadai');
                            }}
                          />
                          <span className="ml-2 text-sm text-yellow-700">Kurang Baik</span>
                        </label>
                      </div>
                    </div>                      {/* Depreciation Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                        Nilai Penyusutan
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                            name="depreciation" 
                            value="all" 
                            checked={tempDepreciationFilter === 'all'}
                            onChange={() => {
                              setTempDepreciationFilter('all');
                            }} 
                          />
                          <span className="ml-2 text-sm">Semua Nilai</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" 
                              name="depreciation" 
                              value="0-25"
                              checked={tempDepreciationFilter === '0-25'} 
                              onChange={() => {
                                setTempDepreciationFilter('0-25');
                              }}
                            />
                            <span className="ml-2 text-sm text-green-700">0-25%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                              name="depreciation" 
                              value="26-50"
                              checked={tempDepreciationFilter === '26-50'} 
                              onChange={() => {
                                setTempDepreciationFilter('26-50');
                              }}
                            />
                            <span className="ml-2 text-sm text-blue-700">26-50%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                              name="depreciation" 
                              value="51-75"
                              checked={tempDepreciationFilter === '51-75'} 
                              onChange={() => {
                                setTempDepreciationFilter('51-75');
                              }}
                            />
                            <span className="ml-2 text-sm text-yellow-700">51-75%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                              name="depreciation" 
                              value="76-100"
                              checked={tempDepreciationFilter === '76-100'} 
                              onChange={() => {
                                setTempDepreciationFilter('76-100');
                              }}
                            />
                            <span className="ml-2 text-sm text-red-700">76-100%</span>
                          </label>
                        </div>
                      </div>
                    </div>
                      {/* Acquisition Year Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                        Tahun Perolehan
                      </h3>
                      <div className="relative">
                        <select 
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none bg-white pl-3 pr-10 py-2.5"
                          value={tempAcquisitionYearFilter || ''}
                          onChange={(e) => {
                            setTempAcquisitionYearFilter(e.target.value || null);
                          }}
                        >
                          <option value="">Semua Tahun</option>
                          {/* Generate options for the last 10 years */}
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <option key={year} value={year.toString()}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                      {/* Acquisition Source Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                        Asal Pengadaan
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            name="acquisitionSource"
                            value=""
                            checked={tempAcquisitionSourceFilter === null}
                            onChange={() => {
                              setTempAcquisitionSourceFilter(null);
                            }}
                          />
                          <span className="ml-2 text-sm">Semua</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {["Pembelian", "Bantuan", "Hibah", "STTST"].map((source) => (
                            <label key={source} className="inline-flex items-center bg-white rounded-md px-3 py-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                              <input
                                type="radio"
                                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                name="acquisitionSource"
                                value={source}
                                checked={tempAcquisitionSourceFilter === source}
                                onChange={() => {
                                  setTempAcquisitionSourceFilter(source);
                                }}
                              />
                              <span className="ml-2 text-sm">{source}</span>
                            </label>
                          ))}
                        </div>
                      </div>                    </div>
                      {/* Category Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Kategori
                      </h3>
                      {categoriesLoading ? (
                        <div className="text-center py-2">
                          <div className="inline-block animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Memuat kategori...</span>
                        </div>
                      ) : categoriesError ? (
                        <div className="text-center py-2 text-sm text-red-600">
                          <ExclamationCircleIcon className="h-4 w-4 inline mr-1" />
                          Gagal memuat data kategori
                        </div>
                      ) : (
                        <div className="relative">
                          <select 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none bg-white pl-3 pr-10 py-2.5"
                            value={tempCategoryFilter || ''}
                            onChange={(e) => {
                              setTempCategoryFilter(e.target.value || null);
                            }}
                          >
                            <option value="">Semua Kategori</option>
                            {categoriesData?.data?.map((category: Category) => (
                              <option key={category.id} value={category.id}>
                                {category.code ? `${category.code} - ` : ''}{category.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                      {/* Location Filter */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <span className="inline-block w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
                        Lokasi
                      </h3>
                      {locationsLoading ? (
                        <div className="text-center py-2">
                          <div className="inline-block animate-spin h-4 w-4 border-2 border-pink-500 border-t-transparent rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Memuat lokasi...</span>
                        </div>
                      ) : locationsError ? (
                        <div className="text-center py-2 text-sm text-red-600">
                          <ExclamationCircleIcon className="h-4 w-4 inline mr-1" />
                          Gagal memuat data lokasi
                        </div>
                      ) : (
                        <div className="relative">
                          <select 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none bg-white pl-3 pr-10 py-2.5"
                            value={tempLocationFilter || ''}
                            onChange={(e) => {
                              setTempLocationFilter(e.target.value || null);
                            }}
                          >
                            <option value="">Semua Lokasi</option>
                            {locationsData?.data?.map((location: Location) => (
                              <option key={location.id} value={location.id.toString()}>
                                {location.building} - {location.room} ({location.name})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Active Filters - Show badge for active filters */}
                    {(tempFilter || tempDepreciationFilter !== 'all' || tempAcquisitionYearFilter || tempAcquisitionSourceFilter || tempCategoryFilter || tempLocationFilter) && (
                      <div className="mt-4 mb-2 flex flex-wrap gap-2">
                        <h3 className="w-full text-xs font-medium text-gray-500 mb-1">Filter Aktif:</h3>
                        
                        {tempCategoryFilter && categoriesData?.data && (
                          <div className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <span>Kategori: </span>
                            <span className="ml-1 font-semibold">
                              {(categoriesData.data.find((c: Category) => c.id === tempCategoryFilter)?.name) || 'Dipilih'}
                            </span>
                            <button
                              type="button"
                              className="ml-1 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-green-600 hover:bg-green-200 hover:text-green-800 focus:outline-none"
                              onClick={() => setTempCategoryFilter(null)}
                            >
                              <span className="sr-only">Hapus filter kategori</span>
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        
                        {tempLocationFilter && locationsData?.data && (
                          <div className="inline-flex items-center rounded-full bg-pink-50 border border-pink-200 px-2.5 py-0.5 text-xs font-medium text-pink-800">
                            <span>Lokasi: </span>
                            <span className="ml-1 font-semibold">
                              {(locationsData.data.find((l: Location) => l.id.toString() === tempLocationFilter)?.name) || 'Dipilih'}
                            </span>
                            <button
                              type="button"
                              className="ml-1 inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-pink-600 hover:bg-pink-200 hover:text-pink-800 focus:outline-none"
                              onClick={() => setTempLocationFilter(null)}
                            >
                              <span className="sr-only">Hapus filter lokasi</span>
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Filter Actions */}
                    <div className="mt-6 px-1">
                      <div className="flex flex-col space-y-3">
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                          onClick={applyFilters}
                          disabled={isApplyingFilter}
                        >
                          {isApplyingFilter ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Menerapkan Filter...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Terapkan Filter
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          onClick={resetTempFiltersToDefaults}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset Filter
                        </button>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-center text-gray-500">
                        Klik di luar panel untuk menutup
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Assets Display - Table or Grid View */}
        <div className="overflow-hidden">
          {error ? (
            <div className="p-4 bg-red-50/80 border-l-4 border-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>              
                <div className="ml-3">
                  <p className="text-sm text-red-700">Error memuat aset. Silakan coba lagi.</p>
                </div>
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">              <thead className="bg-gray-50/70">                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('kode')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Kode
                      {renderSortIcon('kode')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('nama')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Nama Aset
                      {renderSortIcon('nama')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('kategori')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Kategori
                      {renderSortIcon('kategori')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('harga_perolehan')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Harga Perolehan
                      {renderSortIcon('harga_perolehan')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('nilai_sisa')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Nilai Sisa
                      {renderSortIcon('nilai_sisa')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('penyusutan')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Penyusutan
                      {renderSortIcon('penyusutan')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('lokasi')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Lokasi
                      {renderSortIcon('lokasi')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Status
                      {renderSortIcon('status')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>              <tbody className="divide-y divide-gray-300/50">
                {filteredAndSortedAssets?.length ? (
                  filteredAndSortedAssets.map((asset: Asset) => (
                    asset.is_bulk_parent ? (
                      <BulkTableRow
                        key={asset.id}
                        asset={asset}
                        onDelete={openDeleteModal}
                        onDetailClick={openDetailPopup}
                        formatStatus={formatStatus}
                        getTotalHargaPerolehan={getTotalHargaPerolehan}
                        getTotalNilaiSisa={getTotalNilaiSisa}
                      />
                    ) : (
                      <tr key={asset.id} className="table-row-hover hover:bg-blue-50/30 transition-all">
                        <td className="whitespace-nowrap py-4 pl-6 pr-3">
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{asset.kode}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <div className="flex items-center">
                            <div>
                              <button 
                                onClick={() => openDetailPopup(asset)}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 text-left"
                              >
                                {asset.nama}
                              </button>
                              <div className="text-sm text-gray-500">{asset.spesifikasi}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <div className="text-sm text-gray-900">{asset.category?.name || 'Tidak Terkategori'}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <div className="text-sm text-gray-900">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(getTotalHargaPerolehan(asset))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <div className="text-sm text-gray-900">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(getTotalNilaiSisa(asset))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          {(() => {
                            const depreciationPercentage = asset.harga_perolehan > 0
                              ? Math.round((asset.akumulasi_penyusutan / asset.harga_perolehan) * 100)
                              : 0;
                            
                            // Color based on percentage
                            let barColor = "bg-green-500";
                            if (depreciationPercentage > 75) barColor = "bg-red-500";
                            else if (depreciationPercentage > 50) barColor = "bg-yellow-500";
                            else if (depreciationPercentage > 25) barColor = "bg-blue-500";
                            
                            return (
                              <div className="flex flex-col">
                                <div className="text-xs text-gray-900 mb-1">{depreciationPercentage}%</div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${depreciationPercentage}%` }}></div>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <div className="text-sm text-gray-900">
                            {asset.lokasi_id && asset.location_info ? 
                              `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
                              : asset.lokasi || ''}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4">
                          <span className={`status-badge inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium bg-gradient-to-r ${statusGradients[asset.status] || 'from-gray-50 to-gray-100 border-gray-200'} shadow-sm transition-all duration-300 hover:scale-105 border`}>
                            {formatStatus(asset.status)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <Link 
                              to={`/assets/edit/${asset.id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                            >
                              <svg className="h-4 w-4 mr-1.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                              <span className="leading-none">Ubah</span>
                            </Link>
                            <button
                              onClick={() => openDeleteModal(asset)}
                              className="text-red-600 hover:text-red-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-2"
                            >
                              <svg className="h-4 w-4 mr-1.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                              <span className="leading-none">Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100/80 p-4">
                          <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
                        </div>                        <p className="mt-4 text-lg font-medium text-gray-500">
                          {searchTerm || filter || depreciationFilter !== 'all' 
                            ? 'Tidak ada aset yang cocok dengan kriteria pencarian Anda' 
                            : 'Tidak ada aset ditemukan'}
                        </p>
                        <p className="mt-1 text-sm text-gray-400 max-w-md text-center">
                          {searchTerm || filter || depreciationFilter !== 'all' 
                            ? 'Coba ubah filter atau kriteria pencarian Anda' 
                            : 'Mulai tambahkan aset inventaris Anda untuk mengelola dengan lebih baik'}
                        </p>
                        {!searchTerm && !filter && depreciationFilter === 'all' && (
                          <Link to="/assets/new" className="mt-6">
                            <GradientButton size="md" variant="primary" className="animate-pulse">
                              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                              Tambah Aset Pertama
                            </GradientButton>
                          </Link>
                        )}                        {(searchTerm || filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter) && (                          
                          <button 
                            onClick={resetAllFilters}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Hapus semua filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}          {/* Pagination */}
        {data?.pagination && filteredAndSortedAssets && (
          <div className="bg-white/50 px-4 py-3 flex items-center justify-between border-t border-gray-200/50 sm:px-6">
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{data.pagination.total_items > 0 ? (page - 1) * pageSize + 1 : 0}</span> sampai{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, data.pagination.total_items)}
                  </span>{' '}
                  dari <span className="font-medium">{data.pagination.total_items}</span> data
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
            </div>            <div className="flex-1 flex justify-between sm:justify-end space-x-3">              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${page === 1 
                    ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                    : 'text-gray-700 bg-white/70 shadow-sm'}`}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Sebelumnya
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.total_pages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${page === data.pagination.total_pages 
                    ? 'text-gray-300 cursor-not-allowed bg-white/50' 
                    : 'text-gray-700 bg-white/70 shadow-sm'}`}
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
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        assetName={assetToDelete?.nama || ''}
        isBulkAsset={assetToDelete?.is_bulk_parent || false}
        bulkCount={assetToDelete?.bulk_total_count || 1}
        isLoading={deleteMutation.isPending}
      />

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
            </span>            <Transition.Child
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
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Import Aset
                    </Dialog.Title>                    <div className="mt-2">                      <p className="text-sm text-gray-500 mb-4">
                        Upload file CSV untuk mengimport data aset secara bulk. Kolom dengan tanda (*) wajib diisi.
                        <br />
                        <strong>Format tanggal yang didukung:</strong> YYYY-MM-DD, DD/MM/YYYY, atau DD-MM-YYYY
                        <br />
                        <strong>Kode Kategori:</strong> Gunakan kode kategori yang sudah ada (contoh: 10, 20, 30, 40, 50)
                        <br />
                        <strong>Kode Lokasi:</strong> Gunakan kode lokasi yang sudah ada (contoh: 001, 002, 003)
                        <br />
                        <strong>Asal Pengadaan:</strong> Pembelian, Bantuan, Hibah, Sumbangan, atau Produksi Sendiri
                        <br />
                        <strong>Kode Aset:</strong> Akan dibuat otomatis berdasarkan lokasi, kategori, dan urutan
                        <br />
                        <strong>Bulk Asset:</strong> Jika jumlah &gt; 1 dan satuan adalah "unit", "pcs", "set", atau "buah", sistem akan membuat bulk asset secara otomatis
                      </p>
                      
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700">
                          💡 <strong>Tips:</strong> Pastikan kode kategori dan lokasi sudah ada di sistem. 
                          Lihat daftar di halaman <a href="/categories" className="underline">Kategori</a> dan <a href="/locations" className="underline">Lokasi</a>.
                          <br />
                          🔢 <strong>Bulk Asset:</strong> Untuk aset dengan jumlah &gt; 1 dan satuan "unit", "pcs", "set", atau "buah", sistem akan otomatis membuat bulk asset dengan kode unik untuk setiap unit.
                        </p>
                      </div>
                      
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
                          accept=".csv"
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
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                      importLoading || !importFile
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                    onClick={handleImportSubmit}
                    disabled={importLoading || !importFile}
                  >
                    {importLoading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {importLoading ? 'Mengimpor...' : 'Import'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setImportModalOpen(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Asset Detail Popup */}
      <AssetDetailPopup
        isOpen={detailPopupOpen}
        onClose={closeDetailPopup}
        asset={assetToView}
      />
    </div>
  );
}