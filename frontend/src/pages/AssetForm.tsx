import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi, categoryApi, locationApi } from '../services/api';
import type { Asset } from '../services/api';

import {   XCircleIcon, 
  ArrowLeftIcon,
  PencilIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../context/NotificationContext';
import BulkConfirmationModal from '../components/BulkConfirmationModal';
import BulkUpdateConfirmationModal from '../components/BulkUpdateConfirmationModal';

// Add CSS animation for fade-in effect
import './animations.css';
// import { formatPlainNumber } from '../utils/currencyFormatter';

// Define the required fields for asset creation/update
type AssetFormData = {
  kode: string;
  nama: string;
  spesifikasi: string;
  quantity: number | string; // Allow string for empty state
  satuan: string;
  tanggal_perolehan: string;
  harga_perolehan: number | string; // Allow string for empty state
  umur_ekonomis_tahun: number | string; // Allow string for empty state
  keterangan: string;
  lokasi_id: number | string | undefined; // Can be string for empty value or form handling
  asal_pengadaan: string; 
  category_id: string;
  status: 'baik' | 'rusak' | 'tidak_memadai';
};

export default function AssetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);  // Modal states - currently not implemented
  // const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  // const [showNewLocationModal, setShowNewLocationModal] = useState(false);
  
  // New state for bulk asset confirmation
  const [showBulkConfirmation, setShowBulkConfirmation] = useState(false);
  const [showBulkUpdateConfirmation, setShowBulkUpdateConfirmation] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(1);
  
  const { addNotification } = useNotification();
    // State for form handling and validation
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
    // Form state with correct typing
  const [formData, setFormData] = useState<AssetFormData>({
    kode: '',
    nama: '',
    spesifikasi: '',
    quantity: 1, // Default value 1
    satuan: 'unit',
    tanggal_perolehan: new Date().toISOString().split('T')[0],
    harga_perolehan: '', // Start with empty string for better UX
    umur_ekonomis_tahun: 5, // Default value 5
    keterangan: '',
    lokasi_id: '',
    asal_pengadaan: '', // Empty so the validation works the same
    category_id: '',
    status: 'baik',
  });

  // New state for formatted display of harga_perolehan
  const [displayHarga, setDisplayHarga] = useState<string>('');

  // Initialize displayHarga when component mounts
  useEffect(() => {
    if (!isEditMode) {
      setDisplayHarga('');
    }
  }, [isEditMode]);
  // Helper function to format number with thousand separators
  const formatCurrency = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? value.replace(/\./g, '') : value.toString();
    if (!/^\d+$/.test(numValue)) return numValue;
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Fetch asset data if in edit mode
  const { data: assetData, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getById(id as string),
    enabled: isEditMode,
  });

  // Fetch categories for the dropdown
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
  });

  // Fetch location data for the dropdown
  const { data: locationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationApi.list(1, 100),
  });
  // Fetch all assets for code generation (unused, commented out)
  // const { data: allAssetsData, isLoading: isLoadingAssets } = useQuery({
  //   queryKey: ['assets-all'],
  //   queryFn: () => assetApi.list(1, 100),
  //   enabled: !isEditMode,
  // });
  // Fetch all categories for code generation in popup (unused, commented out)
  // const { data: allCategoriesData } = useQuery({
  //   queryKey: ['categories-all'],
  //   queryFn: () => categoryApi.list(1, 100),
  //   enabled: showNewCategoryModal,
  // });

  // Fetch all locations for code generation in popup (unused, commented out)
  // const { data: allLocationsDataForPopup } = useQuery({
  //   queryKey: ['locations-all-popup'],
  //   queryFn: () => locationApi.list(1, 1000),
  //   enabled: showNewLocationModal,
  // });

  // Create bulk asset mutation
  const createBulkMutation = useMutation({
    mutationFn: (data: { asset: AssetFormData; quantity: number }) => {
      return assetApi.createBulk(data.asset as unknown as Omit<Asset, 'id' | 'created_at' | 'updated_at'>, data.quantity);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      // Add success notification
      addNotification(
        'success',
        `${response.data.length} aset berhasil dibuat secara bulk!`
      );
      navigate('/assets');
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal membuat bulk aset: ${err.message}`;
      setError(errorMessage);
      addNotification('error', errorMessage);
      console.error(err);
      setIsSubmitting(false);
    },
  });

  // Create asset mutation (single)
  const createMutation = useMutation({
    mutationFn: (data: AssetFormData) => {
      return assetApi.create(data as unknown as Omit<Asset, 'id' | 'created_at' | 'updated_at'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      addNotification('success', 'Aset baru berhasil ditambahkan!');
      navigate('/assets');
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal menyimpan aset: ${err.message}`;
      setError(errorMessage);
      addNotification('error', errorMessage);
      console.error(err);
      setIsSubmitting(false);
    },
  });

  // Update asset mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; asset: AssetFormData }) => {
      return assetApi.update(data.id, data.asset as unknown as Omit<Asset, 'id' | 'created_at' | 'updated_at'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      // Differentiate success message for bulk vs single asset
      const isBulkAsset = assetData?.data?.is_bulk_parent;
      const bulkCount = assetData?.data?.bulk_total_count || 1;
      const message = isBulkAsset 
        ? `Bulk aset berhasil diperbarui! ${bulkCount} unit telah diupdate.`
        : 'Aset berhasil diperbarui!';
      addNotification('success', message);
      navigate('/assets');
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal menyimpan aset: ${err.message}`;
      setError(errorMessage);
      addNotification('error', errorMessage);
      console.error(err);
      setIsSubmitting(false);    },
  });

  // Create category and location mutations are currently disabled
  // TODO: Implement modal dialogs for creating new categories and locations

  // Update form data when asset data is loaded
  useEffect(() => {
    if (assetData?.data) {      
      const { 
        kode, 
        nama, 
        spesifikasi, 
        quantity,        satuan, 
        tanggal_perolehan, 
        harga_perolehan,
        umur_ekonomis_tahun, 
        keterangan, 
        lokasi_id,
        asal_pengadaan,
        category_id, 
        status
      } = assetData.data as any;
      
      // Use the status directly - we only accept baik, rusak, or tidak_memadai now
      let mappedStatus: 'baik' | 'rusak' | 'tidak_memadai' = 'baik';
      
      if (status === 'rusak') {
        mappedStatus = 'rusak';
      } else if (status === 'tidak_memadai') {
        mappedStatus = 'tidak_memadai';
      } else if (status === 'baik') {
        mappedStatus = 'baik';
      } else {
        // Fallback for any unexpected status values
        mappedStatus = 'baik';
      }
      
      // Ensure lokasi_id is a number or undefined, not a string
      let parsedLokasiId = lokasi_id;
      if (lokasi_id !== null && lokasi_id !== undefined) {
        parsedLokasiId = Number(lokasi_id);
        if (isNaN(parsedLokasiId)) {
          parsedLokasiId = undefined;
        }
      }
        
      // Set form data with values from API
      const updatedFormData = {
        kode: kode || '',
        nama: nama || '',
        spesifikasi: spesifikasi || '',        quantity: quantity || 1,
        satuan: satuan || 'unit',
        tanggal_perolehan: tanggal_perolehan ? new Date(tanggal_perolehan).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        harga_perolehan: harga_perolehan || 0,
        umur_ekonomis_tahun: umur_ekonomis_tahun || 5, // Default to 5 years if not set
        keterangan: keterangan || '',
        lokasi_id: parsedLokasiId,
        asal_pengadaan: asal_pengadaan || '',
        category_id: category_id || '',
        status: mappedStatus,
      };        
      setFormData(updatedFormData);
      setDisplayHarga(formatCurrency(harga_perolehan || 0));
    }
  }, [assetData]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setIsSubmitting(true);
    
    // Mark all fields as touched for styling purposes
    const allFields = ['nama', 'category_id', 'lokasi_id', 'quantity', 'harga_perolehan', 'umur_ekonomis_tahun', 'asal_pengadaan'];
    const touchedFields = allFields.reduce((acc, field) => ({...acc, [field]: true}), {});
    setTouched(touchedFields);
      
    // Only validate number fields since HTML5 validation handles empty/required fields
    if (Number(formData.quantity) <= 0) {
      setFieldErrors(prev => ({ ...prev, quantity: 'Jumlah wajib lebih dari 0' }));
      setIsSubmitting(false);
      return;
    }
    
    if (Number(formData.harga_perolehan) <= 0) {
      setFieldErrors(prev => ({ ...prev, harga_perolehan: 'Harga perolehan wajib lebih dari 0' }));
      setIsSubmitting(false);
      return;
    }
    
    if (Number(formData.umur_ekonomis_tahun) < 1) {
      setFieldErrors(prev => ({ ...prev, umur_ekonomis_tahun: 'Umur ekonomis wajib minimal 1 tahun' }));
      setIsSubmitting(false);
      return;
    }

    // Check if quantity > 1 and show bulk confirmation for new assets
    // Only create bulk assets for discrete units (unit, pcs, set, buah)
    // Not for continuous/measurement units (meter, kg, liter)
    const quantity = Number(formData.quantity);
    const bulkEligibleUnits = ['unit', 'pcs', 'set', 'buah'];
    const shouldCreateBulk = !isEditMode && quantity > 1 && bulkEligibleUnits.includes(formData.satuan);
    
    if (shouldCreateBulk) {
      setBulkQuantity(quantity);
      setShowBulkConfirmation(true);
      setIsSubmitting(false);
      return;
    }

    // Check if this is bulk asset edit and show confirmation
    if (isEditMode && assetData?.data?.is_bulk_parent) {
      setShowBulkUpdateConfirmation(true);
      setIsSubmitting(false);
      return;
    }

    // Proceed with normal submission
    submitAsset(quantity);
  };

  const submitAsset = (quantity: number) => {
    setIsSubmitting(true);
    
    // Ensure numeric fields have valid values before submitting
    const dataToSubmit = { ...formData };
    
    // Clean and validate all numeric fields - convert string to number
    const quantityNum = typeof dataToSubmit.quantity === 'string' ? Number(dataToSubmit.quantity) : dataToSubmit.quantity;
    if (isNaN(quantityNum) || quantityNum < 1) {
      dataToSubmit.quantity = 1; // Default to 1
    } else {
      dataToSubmit.quantity = quantityNum;
    }
    
    const hargaNum = typeof dataToSubmit.harga_perolehan === 'string' ? Number(dataToSubmit.harga_perolehan) : dataToSubmit.harga_perolehan;
    if (isNaN(hargaNum) || hargaNum < 0) {
      dataToSubmit.harga_perolehan = 0;
    } else {
      dataToSubmit.harga_perolehan = hargaNum;
    }
    
    const umurNum = typeof dataToSubmit.umur_ekonomis_tahun === 'string' ? Number(dataToSubmit.umur_ekonomis_tahun) : dataToSubmit.umur_ekonomis_tahun;
    if (isNaN(umurNum) || umurNum < 1) {
      dataToSubmit.umur_ekonomis_tahun = 1;
    } else {
      dataToSubmit.umur_ekonomis_tahun = umurNum;
    }
      // Convert lokasi_id to number or null
    const lokasiIdNum = dataToSubmit.lokasi_id ? Number(dataToSubmit.lokasi_id) : undefined;
    if (lokasiIdNum && !isNaN(lokasiIdNum)) {
      dataToSubmit.lokasi_id = lokasiIdNum;
    } else {
      dataToSubmit.lokasi_id = undefined;
    }

    // Prepare final data to submit
    let finalDataToSubmit: any;
    if (!isEditMode) {
      // Remove kode field for create mode (akan di-generate di backend)
      const { kode, ...dataWithoutKode } = dataToSubmit;
      finalDataToSubmit = dataWithoutKode;
    } else {
      finalDataToSubmit = dataToSubmit;
    }

    if (isEditMode) {
      updateMutation.mutate({ id: id as string, asset: finalDataToSubmit });
    } else {
      // Only create bulk for eligible units
      const bulkEligibleUnits = ['unit', 'pcs', 'set', 'buah'];
      const shouldCreateBulk = quantity > 1 && bulkEligibleUnits.includes(finalDataToSubmit.satuan);
      
      if (shouldCreateBulk) {
        createBulkMutation.mutate({ asset: finalDataToSubmit, quantity });
      } else {
        createMutation.mutate(finalDataToSubmit);
      }
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Update form data
    let newValue: string | number | undefined = value;
      // Convert numeric values - only convert to number if value is not empty
    // Skip harga_perolehan as it has its own handler
    if (['quantity', 'umur_ekonomis_tahun'].includes(name)) {
      if (value === '') {
        newValue = ''; // Keep as empty string when field is cleared
      } else {
        newValue = Number(value);
      }
    }

    // Handle select fields consistently
    if (name === 'lokasi_id') {
      if (value === '') {
        newValue = '';  // Keep as empty string for validation
      } else {
        newValue = Number(value);
      }
    }
      // Update form data
    setFormData(prev => ({ ...prev, [name]: newValue as any }));
    
    // Validate the field
    const errorMessage = validateField(name, newValue);
    setFieldErrors(prev => ({ 
      ...prev, 
      [name]: errorMessage 
    }));
  };
  // Special handler for harga_perolehan with currency formatting
  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Remove all non-digit characters
    const numberValue = value.replace(/\D/g, '');
    
    // Limit to reasonable amount (max 15 digits to prevent overflow)
    if (numberValue.length > 15) return;
    
    // Update display with formatted value
    setDisplayHarga(formatCurrency(numberValue));
    
    // Update form data with actual number
    const numericValue = numberValue ? parseInt(numberValue, 10) : '';
    setFormData(prev => ({ ...prev, harga_perolehan: numericValue }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, harga_perolehan: true }));
    
    // Clear any existing error when user starts typing
    if (fieldErrors.harga_perolehan) {
      setFieldErrors(prev => ({ 
        ...prev, 
        harga_perolehan: '' 
      }));
    }
  };

  // Validate a single field
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'quantity':
        return value > 0 ? '' : 'Jumlah wajib lebih dari 0';
      case 'harga_perolehan':
        return value > 0 ? '' : 'Harga perolehan wajib lebih dari 0';      
      case 'umur_ekonomis_tahun':
        return value >= 1 ? '' : 'Umur ekonomis wajib minimal 1 tahun';
      default:
        return '';    }
  };

  if (isLoadingAsset || isLoadingCategories || isLoadingLocations) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 border-r-2 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <Link to="/assets" className="text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEditMode ? 'Edit Aset' : 'Tambah Aset Baru'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode ? 'Perbarui informasi aset dalam sistem inventaris' : 'Tambahkan aset baru ke sistem inventaris'}
            </p>
          </div>
          {isEditMode && (
            <div className="ml-auto text-sm text-gray-600">
              <span className="flex items-center">
                <PencilIcon className="h-4 w-4 mr-1" />
                ID: {id}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
            <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Info untuk create mode */}          {!isEditMode && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
              <div>
                <span className="font-medium">Kode Asset akan dibuat otomatis</span>
              </div>
            </div>
          )}

          {/* Info untuk bulk asset edit mode */}
          {isEditMode && assetData?.data?.is_bulk_parent && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" />
              <div>
                <span className="font-medium">📦 Bulk Asset: Perubahan akan diterapkan ke semua {assetData.data.bulk_total_count || 1} unit dalam bulk ini</span>
                <p className="text-sm text-amber-700 mt-1">
                  Saat Anda menyimpan perubahan, semua asset dalam grup bulk ini akan diperbarui dengan data yang sama.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-medium rounded-full mr-2">1</span>
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">              {/* Field kode asset hanya ditampilkan saat edit mode dan readonly */}
              {isEditMode && (
                <div>
                  <label htmlFor="kode" className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Aset <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="kode"
                      id="kode"
                      required
                      readOnly
                      className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm cursor-not-allowed"
                      value={formData.kode}
                      placeholder="Kode asset"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    🔒 Kode asset tidak dapat diubah untuk menjaga konsistensi urutan
                  </p>
                </div>
              )}

              <div className={isEditMode ? "" : "md:col-span-2"}>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Aset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  id="nama"
                  required
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    touched.nama && fieldErrors.nama ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.nama}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, nama: true }))}
                  placeholder="Contoh: Laptop Dell Inspiron 15"
                />
                {touched.nama && fieldErrors.nama && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.nama}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="spesifikasi" className="block text-sm font-medium text-gray-700 mb-2">
                  Spesifikasi
                </label>
                <textarea
                  name="spesifikasi"
                  id="spesifikasi"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.spesifikasi}
                  onChange={handleChange}
                  placeholder="Deskripsikan spesifikasi aset secara detail (opsional)"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Categorization & Location */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-medium rounded-full mr-2">2</span>
              Kategorisasi & Lokasi
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  id="category_id"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.category_id}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, category_id: true }))}
                >                  <option value="">Pilih Kategori</option>
                  {categoriesData?.data
                    .sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''))
                    .map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.code} - {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="lokasi_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <select
                  name="lokasi_id"
                  id="lokasi_id"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.lokasi_id || ''}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, lokasi_id: true }))}
                >                  <option value="">Pilih Lokasi</option>
                  {locationsData?.data
                    .sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''))
                    .map((location: any) => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Quantity & Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-500 text-white text-sm font-medium rounded-full mr-2">3</span>
              Kuantitas & Status
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      required
                      readOnly
                      min="1"
                      className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm cursor-not-allowed"
                      value={formData.quantity}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      🔒 Jumlah asset tidak dapat diubah untuk menjaga konsistensi sequence kode
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      required
                      min="1"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                    {Number(formData.quantity) > 1 && ['unit', 'pcs', 'set', 'buah'].includes(formData.satuan) && (
                      <p className="mt-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        ⚠️ Jumlah lebih dari 1 akan membuat bulk asset dengan kode unik untuk setiap unit
                      </p>
                    )}
                    {Number(formData.quantity) > 1 && ['meter', 'kg', 'liter'].includes(formData.satuan) && (
                      <p className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        ℹ️ Untuk satuan {formData.satuan}, tidak akan dibuat bulk asset terpisah
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label htmlFor="satuan" className="block text-sm font-medium text-gray-700 mb-2">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <select
                  name="satuan"
                  id="satuan"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.satuan}
                  onChange={handleChange}
                >
                  <option value="unit">Unit</option>
                  <option value="pcs">Pcs</option>
                  <option value="set">Set</option>
                  <option value="buah">Buah</option>
                  <option value="meter">Meter</option>
                  <option value="kg">Kilogram</option>
                  <option value="liter">Liter</option>
                </select>
              </div>

              <div>
                <label htmlFor="asal_pengadaan" className="block text-sm font-medium text-gray-700 mb-2">
                  Asal Pengadaan <span className="text-red-500">*</span>
                </label>
                <select
                  name="asal_pengadaan"
                  id="asal_pengadaan"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.asal_pengadaan}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, asal_pengadaan: true }))}
                >
                  <option value="">Pilih Asal Pengadaan</option>
                  <option value="pembelian">Pembelian</option>
                  <option value="bantuan">Bantuan</option>
                  <option value="hibah">Hibah</option>
                  <option value="sumbangan">Sumbangan</option>
                  <option value="produksi_sendiri">Produksi Sendiri</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  id="status"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="baik">Baik</option>
                  <option value="rusak">Rusak</option>
                  <option value="tidak_memadai">Tidak Memadai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Financial Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-sm font-medium rounded-full mr-2">4</span>
              Informasi Keuangan
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="tanggal_perolehan" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Perolehan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_perolehan"
                  id="tanggal_perolehan"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.tanggal_perolehan}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="harga_perolehan" className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Perolehan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>                  <input
                    type="text"
                    name="harga_perolehan"
                    id="harga_perolehan"
                    required
                    className="block w-full pl-12 pr-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={displayHarga}
                    onChange={handleHargaChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="umur_ekonomis_tahun" className="block text-sm font-medium text-gray-700 mb-2">
                  Umur Ekonomis (Tahun) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="umur_ekonomis_tahun"
                  id="umur_ekonomis_tahun"
                  required
                  min="1"
                  max="50"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.umur_ekonomis_tahun}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Additional Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-500 text-white text-sm font-medium rounded-full mr-2">5</span>
              Informasi Tambahan
            </h3>
            <div>
              <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan
              </label>
              <textarea
                name="keterangan"
                id="keterangan"
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.keterangan}
                onChange={handleChange}
                placeholder="Catatan tambahan tentang aset (opsional)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Berikan informasi tambahan yang diperlukan seperti nomor seri, kondisi khusus, atau catatan lainnya.
              </p>
            </div>
          </div>          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              to="/assets"
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : isEditMode ? (
                <>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Perbarui Aset
                </>
              ) : (
                'Simpan Aset'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Confirmation Modal */}
      <BulkConfirmationModal
        isOpen={showBulkConfirmation}
        onClose={() => {
          setShowBulkConfirmation(false);
          setIsSubmitting(false);
        }}
        onConfirm={() => {
          setShowBulkConfirmation(false);
          submitAsset(bulkQuantity);
        }}
        quantity={bulkQuantity}
        assetName={formData.nama}
        isLoading={isSubmitting}
      />

      {/* Bulk Update Confirmation Modal */}
      <BulkUpdateConfirmationModal
        isOpen={showBulkUpdateConfirmation}
        onClose={() => {
          setShowBulkUpdateConfirmation(false);
          setIsSubmitting(false);
        }}
        onConfirm={() => {
          setShowBulkUpdateConfirmation(false);
          const quantity = Number(formData.quantity);
          submitAsset(quantity);
        }}
        assetName={formData.nama}
        bulkCount={assetData?.data?.bulk_total_count || 1}
        isLoading={isSubmitting}
      />
    </div>
  );
}
