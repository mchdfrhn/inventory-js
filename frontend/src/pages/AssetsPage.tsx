import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { assetApi, categoryApi, locationApi } from '../services/api';
import type { Asset, Category, Location } from '../services/api';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
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
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { InlineLoadingState, InlineErrorState } from '../components/InlineStates';
import ExportButton from '../components/ExportButton';
import BulkTableRow from '../components/BulkTableRow';
import AssetDetailPopup from '../components/AssetDetailPopup';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Pagination from '../components/Pagination';
import { useNotification } from '../context/NotificationContext';
import InlineLoader from '../components/InlineLoader';

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
    return 'Tidak Memadai';
  }
  return 'Baik'; // Default fallback
};

// Helper function to calculate total acquisition price for bulk assets
const getTotalHargaPerolehan = (asset: Asset): number => {
  const hargaPerolehan = Number(asset.harga_perolehan) || 0;
  
  // For bulk assets, multiply harga_perolehan by bulk_total_count
  if (asset.bulk_total_count && asset.bulk_total_count > 1) {
    return hargaPerolehan * asset.bulk_total_count;
  }
  // For regular assets, return harga_perolehan as is
  return hargaPerolehan;
};

// Helper function to calculate total nilai sisa for bulk assets
const getTotalNilaiSisa = (asset: Asset): number => {
  let nilaiSisa = Number(asset.nilai_sisa) || 0;
  
  // If nilai_sisa is 0 or missing, calculate it from depreciation
  if (nilaiSisa === 0 && asset.harga_perolehan) {
    const hargaPerolehan = Number(asset.harga_perolehan);
    let akumulasiPenyusutan = Number(asset.akumulasi_penyusutan) || 0;
    
    // If akumulasi_penyusutan is also 0, calculate it
    if (akumulasiPenyusutan === 0 && asset.tanggal_perolehan) {
      const acquisitionDate = new Date(asset.tanggal_perolehan);
      const currentDate = new Date();
      const monthsOld = Math.max(0, (currentDate.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      const economicLifeMonths = Math.max(12, (asset.umur_ekonomis_tahun || 5) * 12);
      
      // Simple straight-line depreciation calculation
      const monthlyDepreciation = hargaPerolehan / economicLifeMonths;
      akumulasiPenyusutan = Math.min(hargaPerolehan * 0.9, monthlyDepreciation * monthsOld); // Max 90% depreciation
    }
    
    nilaiSisa = Math.max(0, hargaPerolehan - akumulasiPenyusutan);
  }
  
  // For bulk assets, multiply nilai_sisa by bulk_total_count
  if (asset.bulk_total_count && asset.bulk_total_count > 1) {
    return nilaiSisa * asset.bulk_total_count;
  }
  // For regular assets, return nilai_sisa as is
  return nilaiSisa;
};

// Helper function to calculate total accumulated depreciation for bulk assets
const getTotalAkumulasiPenyusutan = (asset: Asset): number => {
  let akumulasiPenyusutan = Number(asset.akumulasi_penyusutan) || 0;
  
  // If akumulasi_penyusutan is 0 or missing, calculate it
  if (akumulasiPenyusutan === 0 && asset.harga_perolehan && asset.tanggal_perolehan) {
    const hargaPerolehan = Number(asset.harga_perolehan);
    const acquisitionDate = new Date(asset.tanggal_perolehan);
    const currentDate = new Date();
    const monthsOld = Math.max(0, (currentDate.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const economicLifeMonths = Math.max(12, (asset.umur_ekonomis_tahun || 5) * 12);
    
    // Simple straight-line depreciation calculation
    const monthlyDepreciation = hargaPerolehan / economicLifeMonths;
    akumulasiPenyusutan = Math.min(hargaPerolehan * 0.9, monthlyDepreciation * monthsOld); // Max 90% depreciation
  }
  
  // For bulk assets, multiply akumulasi_penyusutan by bulk_total_count
  if (asset.bulk_total_count && asset.bulk_total_count > 1) {
    return akumulasiPenyusutan * asset.bulk_total_count;
  }
  // For regular assets, return akumulasi_penyusutan as is
  return akumulasiPenyusutan;
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
    queryFn: async () => {
      try {
        // Try listWithBulk first, fallback to regular list if it fails
        const result = await assetApi.listWithBulk(page, pageSize);
        console.log('Assets data fetched:', result);
        return result;
      } catch (error) {
        console.error('Error with listWithBulk, trying regular list:', error);
        // Fallback to regular list
        const result = await assetApi.list(page, pageSize);
        console.log('Assets data fetched (fallback):', result);
        return result;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
    // Fetch categories for filter
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories_for_filter'],
    queryFn: async () => {
      try {
        const result = await categoryApi.list(1, 100);
        console.log('Categories data fetched:', result);
        return result;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
    retry: 2,
  });
  
  // Fetch locations for filter
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations_for_filter'],
    queryFn: async () => {
      try {
        const result = await locationApi.list(1, 100);
        console.log('Locations data fetched:', result);
        return result;
      } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }
    },
    retry: 2,
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
      formData.append('file', importFile);      console.log('Sending import request to http://localhost:3001/api/v1/assets/import');
      const response = await fetch('http://localhost:3001/api/v1/assets/import', {
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
  // Debug logging for data
  useEffect(() => {
    if (data) {
      console.log('Assets query data:', data);
      console.log('Assets array:', data.data);
      console.log('Total assets:', data.data?.length);
    }
    if (error) {
      console.error('Assets query error:', error);
    }
  }, [data, error]);

  // Filter and search functionality
  const filteredAssets = data?.data?.filter((asset: Asset) => {
    // Debug log to see what data we're working with
    if (!asset) {
      console.warn('Found null/undefined asset in data');
      return false;
    }
    
    // Text search
    const matchesSearch = searchTerm === '' || 
      asset.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.kode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.spesifikasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const totalHargaPerolehan = getTotalHargaPerolehan(asset);
    const totalAkumulasiPenyusutan = getTotalAkumulasiPenyusutan(asset);
    const depreciationPercentage = totalHargaPerolehan > 0
      ? Math.round((totalAkumulasiPenyusutan / totalHargaPerolehan) * 100)
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
        const aTotalHarga = getTotalHargaPerolehan(a);
        const bTotalHarga = getTotalHargaPerolehan(b);
        const aTotalAkumulasi = getTotalAkumulasiPenyusutan(a);
        const bTotalAkumulasi = getTotalAkumulasiPenyusutan(b);
        
        aValue = aTotalHarga > 0 ? (aTotalAkumulasi / aTotalHarga) * 100 : 0;
        bValue = bTotalHarga > 0 ? (bTotalAkumulasi / bTotalHarga) * 100 : 0;
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

  // Debug logging for filtered data
  useEffect(() => {
    console.log('Raw data:', data);
    console.log('Filtered assets:', filteredAssets);
    console.log('Filtered assets length:', filteredAssets?.length);
    console.log('Filtered and sorted assets:', filteredAndSortedAssets);
    console.log('Filtered and sorted length:', filteredAndSortedAssets?.length);
  }, [data, filteredAssets, filteredAndSortedAssets]);

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
    return <LoadingState message="Memuat aset..." size="lg" />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error memuat aset"
        error={error}
        onRetry={() => window.location.reload()}
        retryLabel="Coba lagi"
      />
    );
  }  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard hover={false} className="overflow-hidden">

        {/* Category Filter Notification */}
        {categoryFilter && categoriesData?.data && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TagIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-xs text-blue-800">
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
                className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
              >                Hapus Filter              </button>
            </div>
          </div>
        )}

        {/* Location Filter Notification */}
        {locationFilter && locationsData?.data && (
          <div className="px-4 py-2 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-xs text-green-800">
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
                className="text-green-600 hover:text-green-800 text-xs font-medium hover:underline"
              >
                Hapus Filter
              </button>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30 flex flex-wrap justify-between items-center gap-3">
          {/* Search input */}
          <div className="relative rounded-md shadow-sm max-w-md flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="search"
              id="search-assets"
              className="block w-full rounded-md border-0 py-1.5 pl-9 text-gray-900 ring-1 ring-inset ring-gray-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xs transition-all duration-300"
              placeholder="Cari aset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>          {/* Filter toggles, export, import, and add buttons */}          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <ExportButton assets={filteredAndSortedAssets || []} filename="daftar_aset_sttpu" />
            <button 
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:-translate-y-0.5 transition-all duration-300"
            >
              <DocumentArrowUpIcon className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>
            <Link to="/assets/new">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:-translate-y-0.5 transition-all duration-300">
                <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Tambah Aset
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setFilterPanelOpen(true)}              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium
                ${filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter || categoryFilter || locationFilter
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-600 hover:from-gray-100 hover:to-gray-200'}
                hover:-translate-y-0.5 transition-all duration-300
              `}
            >
              <AdjustmentsHorizontalIcon className="h-3.5 w-3.5" />              <span>{filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter || categoryFilter || locationFilter ? 'Filter Aktif' : 'Filter'}</span>
              {(filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter || categoryFilter || locationFilter) && (                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
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
                    <Dialog.Title className="text-base font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Filter Aset</Dialog.Title>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-colors"
                      onClick={() => setFilterPanelOpen(false)}
                    >
                      <span className="sr-only">Tutup Panel</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex flex-col px-4 space-y-4 overflow-y-auto">                    {/* Status Filter */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                        Status Aset
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500" 
                            name="status" 
                            value="" 
                            checked={tempFilter === null}
                            onChange={() => {
                              setTempFilter(null);
                            }} 
                          />
                          <span className="ml-2 text-xs">Semua Status</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-3.5 w-3.5 text-green-600 border-gray-300 focus:ring-green-500" 
                            name="status" 
                            value="baik"
                            checked={tempFilter === 'baik'} 
                            onChange={() => {
                              setTempFilter('baik');
                            }}
                          />
                          <span className="ml-2 text-xs text-green-700">Baik</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-3.5 w-3.5 text-red-600 border-gray-300 focus:ring-red-500" 
                            name="status" 
                            value="rusak"
                            checked={tempFilter === 'rusak'} 
                            onChange={() => {
                              setTempFilter('rusak');
                            }}
                          />
                          <span className="ml-2 text-xs text-red-700">Rusak</span>
                        </label>
                        <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-3.5 w-3.5 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                            name="status" 
                            value="tidak_memadai"
                            checked={tempFilter === 'tidak_memadai'} 
                            onChange={() => {
                              setTempFilter('tidak_memadai');
                            }}
                          />
                          <span className="ml-2 text-xs text-yellow-700">Tidak Memadai</span>
                        </label>
                      </div>
                    </div>                      {/* Depreciation Filter */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-purple-500 rounded-full mr-2"></span>
                        Nilai Penyusutan
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input 
                            type="radio" 
                            className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500" 
                            name="depreciation" 
                            value="all" 
                            checked={tempDepreciationFilter === 'all'}
                            onChange={() => {
                              setTempDepreciationFilter('all');
                            }} 
                          />
                          <span className="ml-2 text-xs">Semua Nilai</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-green-600 border-gray-300 focus:ring-green-500" 
                              name="depreciation" 
                              value="0-25"
                              checked={tempDepreciationFilter === '0-25'} 
                              onChange={() => {
                                setTempDepreciationFilter('0-25');
                              }}
                            />
                            <span className="ml-2 text-xs text-green-700">0-25%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500" 
                              name="depreciation" 
                              value="26-50"
                              checked={tempDepreciationFilter === '26-50'} 
                              onChange={() => {
                                setTempDepreciationFilter('26-50');
                              }}
                            />
                            <span className="ml-2 text-xs text-blue-700">26-50%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-yellow-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-yellow-600 border-gray-300 focus:ring-yellow-500" 
                              name="depreciation" 
                              value="51-75"
                              checked={tempDepreciationFilter === '51-75'} 
                              onChange={() => {
                                setTempDepreciationFilter('51-75');
                              }}
                            />
                            <span className="ml-2 text-xs text-yellow-700">51-75%</span>
                          </label>
                          
                          <label className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                            <input 
                              type="radio" 
                              className="form-radio h-3.5 w-3.5 text-red-600 border-gray-300 focus:ring-red-500" 
                              name="depreciation" 
                              value="76-100"
                              checked={tempDepreciationFilter === '76-100'} 
                              onChange={() => {
                                setTempDepreciationFilter('76-100');
                              }}
                            />
                            <span className="ml-2 text-xs text-red-700">76-100%</span>
                          </label>
                        </div>
                      </div>
                    </div>
                      {/* Acquisition Year Filter */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full mr-2"></span>
                        Tahun Perolehan
                      </h3>
                      <div className="relative">
                        <select 
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs appearance-none bg-white pl-2.5 pr-8 py-2"
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
                          <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                      {/* Acquisition Source Filter */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>
                        Asal Pengadaan
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            name="acquisitionSource"
                            value=""
                            checked={tempAcquisitionSourceFilter === null}
                            onChange={() => {
                              setTempAcquisitionSourceFilter(null);
                            }}
                          />
                          <span className="ml-2 text-xs">Semua</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {["Pembelian", "Bantuan", "Hibah", "STTST"].map((source) => (
                            <label key={source} className="inline-flex items-center bg-white rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                              <input
                                type="radio"
                                className="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                name="acquisitionSource"
                                value={source}
                                checked={tempAcquisitionSourceFilter === source}
                                onChange={() => {
                                  setTempAcquisitionSourceFilter(source);
                                }}
                              />
                              <span className="ml-2 text-xs">{source}</span>
                            </label>
                          ))}
                        </div>
                      </div>                    </div>
                      {/* Category Filter */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
                        Kategori
                      </h3>
                      {categoriesLoading ? (
                        <InlineLoadingState message="Memuat kategori..." />
                      ) : categoriesError ? (
                        <InlineErrorState message="Gagal memuat data kategori" />
                      ) : (
                        <div className="relative">
                          <select 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs appearance-none bg-white pl-2.5 pr-8 py-2"
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
                            <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                      {/* Location Filter */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                        <span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-full mr-2"></span>
                        Lokasi
                      </h3>
                      {locationsLoading ? (
                        <InlineLoadingState message="Memuat lokasi..." variant="accent" />
                      ) : locationsError ? (
                        <InlineErrorState message="Gagal memuat data lokasi" />
                      ) : (
                        <div className="relative">
                          <select 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs appearance-none bg-white pl-2.5 pr-8 py-2"
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
                            <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
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
                    <div className="mt-4 px-1">
                      <div className="flex flex-col space-y-2">
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                          onClick={applyFilters}
                          disabled={isApplyingFilter}
                        >
                          {isApplyingFilter ? (
                            <>
                              <InlineLoader size="xs" variant="white" className="mr-2" />
                              Menerapkan Filter...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Terapkan Filter
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          onClick={resetTempFiltersToDefaults}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset Filter
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-center text-gray-500">
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
                  <p className="text-sm text-red-700">Error memuat aset: {error ? String(error) : 'Terjadi kesalahan'}</p>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <Loader size="lg" message="Memuat data aset..." />
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0v2a1 1 0 001 1h1m0-4H6a1 1 0 00-1 1v1h1z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada aset</h3>
                <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan aset pertama Anda.</p>
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto table-responsive">
            <table className="min-w-full divide-y divide-gray-200/50 table-fixed">
              <thead className="bg-gray-50/70">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    <button 
                      onClick={() => handleSort('kode')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Kode
                      {renderSortIcon('kode')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    <button 
                      onClick={() => handleSort('nama')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Nama Aset
                      {renderSortIcon('nama')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    <button 
                      onClick={() => handleSort('kategori')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Kategori
                      {renderSortIcon('kategori')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    <button 
                      onClick={() => handleSort('harga_perolehan')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Harga Perolehan
                      {renderSortIcon('harga_perolehan')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    <button 
                      onClick={() => handleSort('nilai_sisa')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Nilai Sisa
                      {renderSortIcon('nilai_sisa')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <button 
                      onClick={() => handleSort('penyusutan')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Penyusutan
                      {renderSortIcon('penyusutan')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    <button 
                      onClick={() => handleSort('lokasi')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Lokasi
                      {renderSortIcon('lokasi')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                    >
                      Status
                      {renderSortIcon('status')}
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky-action-col">Aksi</th>
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
                        getTotalAkumulasiPenyusutan={getTotalAkumulasiPenyusutan}
                      />
                    ) : (
                      <tr key={asset.id} className="table-row-hover hover:bg-blue-50/30 transition-all">
                        <td className="py-3 pl-4 pr-2 w-20">
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md truncate">{asset.kode}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3 max-w-48">
                          <div className="flex items-center">
                            <div className="min-w-0 flex-1">
                              <button 
                                onClick={() => openDetailPopup(asset)}
                                className="text-xs font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 text-left block truncate"
                              >
                                {asset.nama}
                              </button>
                              <div className="text-xs text-gray-500 line-clamp-2 break-words">{asset.spesifikasi}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 w-28">
                          <div className="text-xs text-gray-900 truncate">{asset.category?.name || 'Tidak Terkategori'}</div>
                        </td>
                        <td className="px-2 py-3 w-28">
                          <div className="text-xs text-gray-900 truncate">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(getTotalHargaPerolehan(asset))}
                          </div>
                        </td>
                        <td className="px-2 py-3 w-28">
                          <div className="text-xs text-gray-900 truncate">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(getTotalNilaiSisa(asset))}
                          </div>
                        </td>
                        <td className="px-2 py-3 w-24">
                          {(() => {
                            const totalHargaPerolehan = getTotalHargaPerolehan(asset);
                            const totalAkumulasiPenyusutan = getTotalAkumulasiPenyusutan(asset);
                            
                            const depreciationPercentage = totalHargaPerolehan > 0
                              ? Math.round((totalAkumulasiPenyusutan / totalHargaPerolehan) * 100)
                              : 0;
                            
                            // Color based on percentage
                            let barColor = "bg-green-500";
                            if (depreciationPercentage > 75) barColor = "bg-red-500";
                            else if (depreciationPercentage > 50) barColor = "bg-yellow-500";
                            else if (depreciationPercentage > 25) barColor = "bg-blue-500";
                            
                            return (
                              <div className="flex flex-col">
                                <div className="text-xs text-gray-900 mb-1">{depreciationPercentage}%</div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div className={`${barColor} h-1 rounded-full`} style={{ width: `${depreciationPercentage}%` }}></div>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-2 py-3 max-w-32">
                          <div className="text-xs text-gray-900 min-w-0">
                            <div className="font-medium truncate">{asset.location_info?.name || asset.lokasi || 'Lokasi tidak tersedia'}</div>
                            {asset.location_info?.building && (
                              <div className="text-gray-500 text-xs truncate">
                                Gedung {asset.location_info.building}
                                {asset.location_info.floor && ` Lt. ${asset.location_info.floor}`}
                                {asset.location_info.room && ` ${asset.location_info.room}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3 w-20">
                          <span className={`status-badge inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${statusGradients[asset.status] || 'from-gray-50 to-gray-100 border-gray-200'} shadow-sm transition-all duration-300 hover:scale-105 border truncate`}>
                            {formatStatus(asset.status)}
                          </span>
                        </td>
                        <td className="py-3 pl-2 pr-4 text-right text-xs font-medium w-24 min-w-24 sticky-action-col">
                          <div className="flex justify-end space-x-1.5">
                            <Link 
                              to={`/assets/edit/${asset.id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1 py-1"
                              title="Ubah asset"
                            >
                              <svg className="h-3.5 w-3.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                              <span className="leading-none ml-1 mobile-hide-text">Ubah</span>
                            </Link>
                            <button
                              onClick={() => openDeleteModal(asset)}
                              className="text-red-600 hover:text-red-900 flex items-center justify-center group transition-all duration-200 hover:-translate-y-0.5 px-1 py-1"
                              title="Hapus asset"
                            >
                              <svg className="h-3.5 w-3.5 group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                              <span className="leading-none ml-1 mobile-hide-text">Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100/80 p-3">
                          <ExclamationCircleIcon className="h-6 w-6 text-gray-400" />
                        </div>                        <p className="mt-3 text-sm font-medium text-gray-500">
                          {searchTerm || filter || depreciationFilter !== 'all' 
                            ? 'Tidak ada aset yang cocok dengan kriteria pencarian Anda' 
                            : 'Tidak ada aset ditemukan'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 max-w-md text-center">
                          {searchTerm || filter || depreciationFilter !== 'all' 
                            ? 'Coba ubah filter atau kriteria pencarian Anda' 
                            : 'Mulai tambahkan aset inventaris Anda untuk mengelola dengan lebih baik'}
                        </p>
                        {!searchTerm && !filter && depreciationFilter === 'all' && (
                          <Link to="/assets/new" className="mt-4">
                            <GradientButton size="sm" variant="primary" className="animate-pulse">
                              <PlusIcon className="-ml-1 mr-1.5 h-4 w-4" />
                              Tambah Aset Pertama
                            </GradientButton>
                          </Link>
                        )}                        {(searchTerm || filter || depreciationFilter !== 'all' || acquisitionYearFilter || acquisitionSourceFilter) && (                          
                          <button 
                            onClick={resetAllFilters}
                            className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline"
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
            itemName="aset"
            showPageSizeSelector={true}
            pageSizeOptions={[10, 25, 50, 100]}
          />
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
                    Import Aset
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
                      <p>Upload file CSV untuk mengimport data aset secara bulk. Kolom dengan tanda (*) wajib diisi.</p>
                      
                      <div className="space-y-1">
                        <p><strong>Format tanggal:</strong> YYYY-MM-DD, DD/MM/YYYY, atau DD-MM-YYYY</p>
                        <p><strong>Kode Kategori:</strong> Gunakan kode yang sudah ada (10, 20, 30, dll)</p>
                        <p><strong>Kode Lokasi:</strong> Gunakan kode yang sudah ada (001, 002, 003, dll)</p>
                        <p><strong>Asal Pengadaan:</strong> Pembelian, Bantuan, Hibah, Sumbangan, atau Produksi Sendiri</p>
                        <p><strong>Kode Aset:</strong> Akan dibuat otomatis berdasarkan lokasi, kategori, dan urutan</p>
                      </div>
                    </div>
                  </div>

                  {/* Tips Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Tips & Bulk Asset
                    </h3>
                    <div className="text-xs text-blue-700 space-y-2">
                      <p>💡 <strong>Tips:</strong> Pastikan kode kategori dan lokasi sudah ada di sistem. 
                      Lihat daftar di halaman <a href="/categories" className="underline font-medium">Kategori</a> dan <a href="/locations" className="underline font-medium">Lokasi</a>.</p>
                      <p>🔢 <strong>Bulk Asset:</strong> Untuk aset dengan jumlah &gt; 1 dan satuan "unit", "pcs", "set", atau "buah", sistem akan otomatis membuat bulk asset dengan kode unik untuk setiap unit.</p>
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
                        accept=".csv"
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
                            <InlineLoader size="xs" variant="white" />
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
                        onClick={() => setImportModalOpen(false)}
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

      {/* Asset Detail Popup */}
      <AssetDetailPopup
        isOpen={detailPopupOpen}
        onClose={closeDetailPopup}
        asset={assetToView}
      />
    </div>
  );
}