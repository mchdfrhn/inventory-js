import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi, categoryApi, locationApi } from '../services/api';
import type { Asset, Location } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XCircleIcon, 
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../context/NotificationContext';

// Add CSS animation for fade-in effect
import './animations.css';
import { formatPlainNumber, numberToIndonesianWords } from '../utils/currencyFormatter';

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
  lokasi: string; 
  lokasi_id: number | string | undefined; // Can be string for empty value or form handling
  asal_pengadaan: string; 
  category_id: string;
  status: 'baik' | 'rusak' | 'tidak_memadai';
};

export default function AssetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ code: '', name: '', description: '' });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  
  // New state for location modal
  const [showNewLocationModal, setShowNewLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ code: '', name: '', description: '', building: '', floor: '', room: '' });
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  
  // State for form handling and validation
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
    // State for currency input handling
  const [currencyDisplayValue, setCurrencyDisplayValue] = useState('');
  const [showCurrencyWords, setShowCurrencyWords] = useState(false);
    // Form state with correct typing
  const [formData, setFormData] = useState<AssetFormData>({
    kode: '',    nama: '',
    spesifikasi: '',
    quantity: 1, // Default value 1
    satuan: 'unit',
    tanggal_perolehan: new Date().toISOString().split('T')[0],
    harga_perolehan: '', // Start with empty string for better UX
    umur_ekonomis_tahun: 5, // Default value 5
    keterangan: '',
    lokasi: '',
    lokasi_id: '',
    asal_pengadaan: '', // Empty so the validation works the same
    category_id: '',
    status: 'baik',
  });

  // Fetch asset data if in edit mode
  const { data: assetData, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getById(id as string),
    enabled: isEditMode,
  });

  // Update form data when asset data is loaded
  useEffect(() => {
    if (assetData?.data) {      
      const { 
        kode, 
        nama, 
        spesifikasi, 
        quantity, 
        satuan, 
        tanggal_perolehan, 
        harga_perolehan,
        umur_ekonomis_tahun, 
        keterangan, 
        lokasi, 
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
        spesifikasi: spesifikasi || '',
        quantity: quantity || 1,
        satuan: satuan || 'unit',
        tanggal_perolehan: tanggal_perolehan ? new Date(tanggal_perolehan).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        harga_perolehan: harga_perolehan || 0,
        umur_ekonomis_tahun: umur_ekonomis_tahun || 5, // Default to 5 years if not set
        keterangan: keterangan || '',
        lokasi: lokasi || '',
        lokasi_id: parsedLokasiId,
        asal_pengadaan: asal_pengadaan || '',
        category_id: category_id || '',
        status: mappedStatus,
      };
        setFormData(updatedFormData);
        
      // Also initialize the currency display value
      if (updatedFormData.harga_perolehan > 0) {
        setCurrencyDisplayValue(formatPlainNumber(updatedFormData.harga_perolehan));
      }
    }
  }, [assetData]);
  // Initialize currency display value when form data changes
  useEffect(() => {
    const hargaNumber = typeof formData.harga_perolehan === 'number' ? formData.harga_perolehan : Number(formData.harga_perolehan);
    if (hargaNumber > 0) {
      setCurrencyDisplayValue(formatPlainNumber(hargaNumber));
    }
  }, [formData.harga_perolehan]);

  // Handle errors from fetching asset
  useEffect(() => {
    if (isEditMode && !isLoadingAsset && !assetData) {
      setError('Gagal memuat data aset');
    }
  }, [isEditMode, isLoadingAsset, assetData]);

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

  // Fetch all assets for code generation
  const { data: allAssetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets-all'],
    queryFn: () => assetApi.list(1, 100), // Get assets for code generation
    enabled: !isEditMode, // Only fetch when creating new asset
  });

  // Create/Update mutation with proper type casting
  const mutation = useMutation({
    mutationFn: (data: AssetFormData) => {
      if (isEditMode) {
        return assetApi.update(id as string, data as unknown as Omit<Asset, 'id' | 'created_at' | 'updated_at'>);
      } else {
        return assetApi.create(data as unknown as Omit<Asset, 'id' | 'created_at' | 'updated_at'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      // Add success notification
      addNotification(
        'success',
        isEditMode ? 'Aset berhasil diperbarui!' : 'Aset baru berhasil ditambahkan!'
      );
      navigate('/assets');
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal menyimpan aset: ${err.message}`;
      setError(errorMessage);
      // Add error notification
      addNotification('error', errorMessage);
      console.error(err);
      setIsSubmitting(false);
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: { code: string; name: string; description: string }) => {
      return categoryApi.create(categoryData);
    },
    onSuccess: (response) => {
      const createdCategory = response.data;
      
      // Add the new category to the categories cache
      queryClient.setQueryData(['categories'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [...oldData.data, createdCategory],
        };
      });
      
      // Update the form data with the new category
      setFormData(prev => ({ ...prev, category_id: createdCategory.id }));
      
      // Show success notification
      addNotification('success', `Kategori '${createdCategory.name}' berhasil dibuat`);

      // Reset and close modal
      setShowNewCategoryModal(false);
      setNewCategory({ code: '', name: '', description: '' });
      setCategoryError(null);
      setIsCreatingCategory(false);
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal membuat kategori: ${err.message}`;
      setCategoryError(errorMessage);
      addNotification('error', errorMessage);
      setIsCreatingCategory(false);
    }
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: (locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
      return locationApi.create(locationData);
    },
    onSuccess: (response) => {
      const createdLocation = response.data;
      
      // Add the new location to the locations cache
      queryClient.setQueryData(['locations'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [...oldData.data, createdLocation],
        };
      });
      
      // Update the form data with the new location
      setFormData(prev => ({ ...prev, lokasi_id: createdLocation.id }));
      
      // Show success notification
      addNotification('success', `Lokasi '${createdLocation.name}' berhasil dibuat`);

      // Reset and close modal
      setShowNewLocationModal(false);
      setNewLocation({ code: '', name: '', description: '', building: '', floor: '', room: '' });
      setLocationError(null);
      setIsCreatingLocation(false);
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal membuat lokasi: ${err.message}`;
      setLocationError(errorMessage);
      addNotification('error', errorMessage);
      setIsCreatingLocation(false);
    }
  });  // Generate asset code based on location, category, procurement source, year, and simple sequence
  const generateAssetCode = (
    locationCode: string,
    categoryCode: string,
    procurementSource: string,
    procurementYear: number,
    existingAssets: Asset[]
  ): string => {
    // A = Location code (3 digits)
    const A = locationCode.padStart(3, '0');
    
    // B = Category code (2 digits)
    const B = categoryCode.padStart(2, '0');
    
    // C = Procurement source code (1 digit)
    const procurementMap: { [key: string]: string } = {
      'Pembelian': '1',
      'Bantuan': '2', 
      'STTST': '3',
      'Hibah': '4'
    };
    const C = procurementMap[procurementSource] || '1';
    
    // D = Procurement year (2 digits)
    const D = procurementYear.toString().slice(-2);
    
    // E = Sequence number (3 digits) - based on highest existing sequence number
    // Find the highest sequence number across all assets
    let maxSequence = 0;
    existingAssets.forEach(asset => {
      if (asset.kode) {
        const parts = asset.kode.split('.');
        if (parts.length === 5) {
          const sequence = parseInt(parts[4]);
          if (!isNaN(sequence) && sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      }
    });
    
    const E = (maxSequence + 1).toString().padStart(3, '0');
    
    return `${A}.${B}.${C}.${D}.${E}`;
  };

  // Auto-generate asset code when dependencies change
  useEffect(() => {
    if (!isEditMode && 
        allAssetsData?.data &&
        formData.lokasi_id && 
        formData.category_id && 
        formData.asal_pengadaan && 
        formData.tanggal_perolehan &&
        !isLoadingAssets) {
      
      // Get location code
      const selectedLocation = locationsData?.data.find(loc => loc.id === Number(formData.lokasi_id));
      const locationCode = selectedLocation?.code || '001';
      
      // Get category code
      const selectedCategory = categoriesData?.data.find(cat => cat.id === formData.category_id);
      const categoryCode = selectedCategory?.code || '10';
      
      // Get procurement year from date
      const procurementDate = new Date(formData.tanggal_perolehan);
      const procurementYear = procurementDate.getFullYear();
      
      // Generate new code
      const newCode = generateAssetCode(
        locationCode,
        categoryCode,
        formData.asal_pengadaan,
        procurementYear,
        allAssetsData.data
      );
      
      // Update form data with generated code
      setFormData(prev => ({
        ...prev,
        kode: newCode
      }));
    }
  }, [
    isEditMode,
    allAssetsData,
    formData.lokasi_id,
    formData.category_id,
    formData.asal_pengadaan,
    formData.tanggal_perolehan,
    isLoadingAssets,
    locationsData,
    categoriesData
  ]);

  // Validate a single field - only check numeric values since HTML5 validation handles required fields
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'quantity':
        return value > 0 ? '' : 'Jumlah wajib lebih dari 0';
      case 'harga_perolehan':
        return value > 0 ? '' : 'Harga perolehan wajib lebih dari 0';      
      case 'umur_ekonomis_tahun':
        return value >= 1 ? '' : 'Umur ekonomis wajib minimal 1 tahun';
      default:
        return '';
    }  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Update form data
    let newValue: string | number | undefined = value;
    
    // Convert numeric values - only convert to number if value is not empty
    if (['quantity', 'harga_perolehan', 'umur_ekonomis_tahun'].includes(name)) {
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
      // No need to handle "new_category" option anymore since we've moved it to a separate button
  };

  // Handle new category form changes
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
    
    // Clear any previous error when typing
    if (categoryError) {
      setCategoryError(null);
    }
  };
  // Handle new category submission
  const handleNewCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Let the browser's native validation handle the required field
    // If the name field is empty, the form won't be submitted
    
    setCategoryError(null);
    setIsCreatingCategory(true);
    createCategoryMutation.mutate(newCategory);  
  };    // Handle new location form changes
  const handleNewLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({ ...prev, [name]: value }));
    
    // Clear any previous error when typing
    if (locationError) {
      setLocationError(null);
    }
  };
  
  // Handle new location submission
  const handleNewLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Let the browser's native validation handle the required fields
    // If required fields are empty, the form won't be submitted
    
    setLocationError(null);
    setIsCreatingLocation(true);
    createLocationMutation.mutate(newLocation);  
  };    // Using the currency utilities imported from utils/currencyFormatter.ts
  
  // All currency handling functions and behavior have been moved directly inline in the JSX  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Let the browser's native validation handle required fields
    // If a required field is empty, the form won't be submitted
    
    setError(null);
    setIsSubmitting(true);
    
    // Mark all fields as touched for styling purposes
    const allFields = ['nama', 'category_id', 'lokasi_id', 'quantity', 'harga_perolehan', 'umur_ekonomis_tahun', 'asal_pengadaan'];
    const touchedFields = allFields.reduce((acc, field) => ({...acc, [field]: true}), {});
    setTouched(touchedFields);
      // Only validate number fields since HTML5 validation handles empty/required fields
    // We only need to validate that numbers are positive
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
    }    // Ensure numeric fields have valid values before submitting
    const dataToSubmit = { ...formData };
    
    // Clean and validate all numeric fields - convert string to number
    const quantityNum = typeof dataToSubmit.quantity === 'string' ? Number(dataToSubmit.quantity) : dataToSubmit.quantity;
    if (isNaN(quantityNum) || quantityNum < 1) {
      dataToSubmit.quantity = 1; // Default to 1
    } else {
      dataToSubmit.quantity = quantityNum;
    }
    
    const umurNum = typeof dataToSubmit.umur_ekonomis_tahun === 'string' ? Number(dataToSubmit.umur_ekonomis_tahun) : dataToSubmit.umur_ekonomis_tahun;
    if (isNaN(umurNum) || umurNum < 1) {
      dataToSubmit.umur_ekonomis_tahun = 5; // Default to 5
    } else if (umurNum > 50) {
      dataToSubmit.umur_ekonomis_tahun = 50;
    } else {
      dataToSubmit.umur_ekonomis_tahun = umurNum;
    }
    
    const hargaNum = typeof dataToSubmit.harga_perolehan === 'string' ? Number(dataToSubmit.harga_perolehan) : dataToSubmit.harga_perolehan;
    if (isNaN(hargaNum) || hargaNum < 0) {
      dataToSubmit.harga_perolehan = 0;
    } else {
      dataToSubmit.harga_perolehan = hargaNum;
    }// Convert lokasi_id to number for API submission
    if (dataToSubmit.lokasi_id) {
      const numVal = Number(dataToSubmit.lokasi_id);
      if (!isNaN(numVal)) {
        dataToSubmit.lokasi_id = numVal;
      }
    }
    
    // All required fields will be validated by the browser's native validation
    // No need for manual validation here

    // Submit form with validated data
    mutation.mutate(dataToSubmit);
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
      </div>      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
            <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">              <div>
                <label htmlFor="kode" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Aset <span className="text-red-500">*</span>
                </label>                <input
                  type="text"
                  name="kode"
                  id="kode"
                  required
                  disabled={true}
                  className="block w-full rounded-md shadow-sm sm:text-sm bg-gray-50 cursor-not-allowed text-gray-600 border-gray-300"
                  value={formData.kode}
                  placeholder={!isEditMode ? "Kode akan dibuat otomatis..." : "Kode tidak dapat diubah"}
                  readOnly
                />                {!isEditMode ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Format: AAA.BB.C.DD.EEE (Lokasi.Kategori.AsalPengadaan.Tahun.UrutTertinggi+1)
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Kode aset tidak dapat diubah untuk menghindari duplikasi
                  </p>
                )}                {/* Error display removed since code field is now read-only */}
              </div>

              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
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
                />
                {touched.nama && fieldErrors.nama && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.nama}</p>
                )}
              </div>              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <select
                    name="category_id"
                    id="category_id"
                    required
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      touched.category_id && fieldErrors.category_id ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    value={formData.category_id}
                    onChange={handleChange}
                    onBlur={() => setTouched(prev => ({ ...prev, category_id: true }))}
                    aria-required="true"
                  >
                    <option value="">Pilih Kategori</option>                    {categoriesData?.data.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name} {category.code ? `(${category.code})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory({ code: '', name: '', description: '' });
                      setShowNewCategoryModal(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Tambah Kategori Baru"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Baru
                  </button>
                </div>
                {touched.category_id && fieldErrors.category_id && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.category_id}</p>
                )}
              </div>
              
              <div className="col-span-full">
                <label htmlFor="spesifikasi" className="block text-sm font-medium text-gray-700 mb-1">
                  Spesifikasi
                </label>
                <textarea
                  name="spesifikasi"
                  id="spesifikasi"
                  rows={2}
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.spesifikasi}
                  onChange={handleChange}
                  placeholder="Deskripsi detail tentang aset (opsional)"
                ></textarea>
              </div>
            </div>
          </div>
            {/* Quantity and Value Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kuantitas dan Nilai</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="tanggal_perolehan" className="block text-sm font-medium text-gray-700 mb-1">
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
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah <span className="text-red-500">*</span>
                </label>                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="1"
                  required
                  placeholder="Default: 1"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    touched.quantity && fieldErrors.quantity ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.quantity}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, quantity: true }))}
                />
                {touched.quantity && fieldErrors.quantity && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.quantity}</p>
                )}
              </div>

              <div>
                <label htmlFor="satuan" className="block text-sm font-medium text-gray-700 mb-1">
                  Satuan
                </label>
                <select
                  name="satuan"
                  id="satuan"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.satuan}
                  onChange={handleChange}
                >
                  <option value="unit">Unit</option>
                  <option value="buah">Buah</option>
                  <option value="set">Set</option>
                  <option value="paket">Paket</option>
                  <option value="lembar">Lembar</option>
                  <option value="meter">Meter</option>
                </select>
              </div>

              <div>                <label htmlFor="harga_perolehan" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Perolehan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="text"
                    name="harga_perolehan"
                    id="harga_perolehan"
                    required
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-12 ${
                      touched.harga_perolehan && fieldErrors.harga_perolehan ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}                    placeholder="0"
                    value={currencyDisplayValue || (Number(formData.harga_perolehan) > 0 ? formatPlainNumber(Number(formData.harga_perolehan)) : '')}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      // Keep only digits
                      const numericValue = value.replace(/\D/g, '');
                      // Format for display
                      const formattedValue = formatPlainNumber(numericValue);
                      setCurrencyDisplayValue(formattedValue);
                      // Update input value
                      e.target.value = formattedValue;
                      // Update form data
                      const parsedValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
                      setFormData(prev => ({ ...prev, [name]: parsedValue }));
                      // Show words if value is valid
                      if (parsedValue > 0) {
                        setShowCurrencyWords(true);
                      }
                      // Validate
                      const errorMessage = validateField(name, parsedValue);
                      setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
                    }}
                    onKeyDown={(e) => {
                      // Add keyboard support for up/down to increment/decrement by 1000
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {                        e.preventDefault();
                        const currentValue = Number(formData.harga_perolehan) || 0;
                        // Increment or decrement by 1000 (a reasonable step for currency)
                        const adjustment = e.key === 'ArrowUp' ? 1000 : -1000;
                        const newValue = Math.max(0, currentValue + adjustment);
                        
                        // Update form data
                        setFormData(prev => ({ ...prev, harga_perolehan: newValue }));
                        setCurrencyDisplayValue(formatPlainNumber(newValue));
                        
                        // Show words display
                        if (newValue > 0) {
                          setShowCurrencyWords(true);
                        }
                        
                        // Validate
                        const errorMessage = validateField('harga_perolehan', newValue);
                        setFieldErrors(prev => ({ ...prev, harga_perolehan: errorMessage }));
                      }
                    }}
                    onFocus={(e) => {
                      // Show the word representation when focused
                      setShowCurrencyWords(true);
                      // If the value is 0, clear for easier entry
                      if (formData.harga_perolehan === 0) {
                        setCurrencyDisplayValue('');
                        e.target.value = '';
                      }
                      // Position cursor at the end
                      const inputElement = e.target;
                      const length = inputElement.value.length;
                      setTimeout(() => {
                        inputElement.selectionStart = length;
                        inputElement.selectionEnd = length;
                      }, 0);
                    }}                    onBlur={() => {
                      // Keep words visible after blur then hide
                      if (Number(formData.harga_perolehan) > 0) {
                        setTimeout(() => setShowCurrencyWords(false), 3000);
                      } else {
                        setShowCurrencyWords(false);
                      }
                      // Ensure formatted value for 0
                      if (!currencyDisplayValue && Number(formData.harga_perolehan) === 0) {
                        setCurrencyDisplayValue('0');
                      }
                      // Mark field as touched for validation
                      setTouched(prev => ({ ...prev, harga_perolehan: true }));
                    }}
                  />                  {Number(formData.harga_perolehan) > 0 && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, harga_perolehan: 0 }));
                        setCurrencyDisplayValue('');
                        setFieldErrors(prev => ({ ...prev, harga_perolehan: '' }));
                        setShowCurrencyWords(false);
                        
                        // Focus the input after clearing
                        const inputElement = document.getElementById('harga_perolehan') as HTMLInputElement;
                        if (inputElement) {
                          inputElement.focus();
                          inputElement.value = '';
                        }
                      }}
                      onKeyDown={(e) => {
                        // Support keyboard usage (Enter or Space)
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setFormData(prev => ({ ...prev, harga_perolehan: 0 }));
                          setCurrencyDisplayValue('');
                          setFieldErrors(prev => ({ ...prev, harga_perolehan: '' }));
                          setShowCurrencyWords(false);
                          
                          const inputElement = document.getElementById('harga_perolehan') as HTMLInputElement;
                          if (inputElement) {
                            inputElement.focus();
                            inputElement.value = '';
                          }
                        }
                      }}
                      tabIndex={0}
                      aria-label="Hapus nilai harga perolehan"
                      title="Hapus nilai"
                    >                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>                <div 
                  className={`mt-1 text-xs text-gray-600 italic bg-gray-50 p-2 rounded-md border border-gray-100 shadow-sm transition-all duration-300 ease-in-out ${
                    showCurrencyWords && Number(formData.harga_perolehan) > 0 ? 'max-h-20 opacity-100 animate-slide-in' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <span className="font-medium">Terbilang:</span> 
                  <span className={Number(formData.harga_perolehan) > 1000000 ? 'animate-pulse font-medium text-blue-600' : ''}>
                    {Number(formData.harga_perolehan) > 0 ? numberToIndonesianWords(Number(formData.harga_perolehan)) : ''}
                  </span>
                </div>
                {touched.harga_perolehan && fieldErrors.harga_perolehan && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.harga_perolehan}</p>
                )}
              </div>

              <div>
                <label htmlFor="umur_ekonomis_tahun" className="block text-sm font-medium text-gray-700 mb-1">
                  Umur Ekonomis (tahun) <span className="text-red-500">*</span>
                </label>                <input
                  type="number"
                  name="umur_ekonomis_tahun"
                  id="umur_ekonomis_tahun"
                  min="1"
                  max="50"
                  required
                  placeholder="Default: 5"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    touched.umur_ekonomis_tahun && fieldErrors.umur_ekonomis_tahun ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.umur_ekonomis_tahun}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, umur_ekonomis_tahun: true }))}
                />
                {touched.umur_ekonomis_tahun && fieldErrors.umur_ekonomis_tahun && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.umur_ekonomis_tahun}</p>
                )}
              </div>              <div>
                <label htmlFor="lokasi_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi <span className="text-red-500">*</span>
                </label>                <div className="flex space-x-2">
                  <select
                    name="lokasi_id"
                    id="lokasi_id"
                    required
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      touched.lokasi_id && fieldErrors.lokasi_id ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    value={formData.lokasi_id === undefined ? '' : formData.lokasi_id}
                    onChange={handleChange}
                    onBlur={() => setTouched(prev => ({ ...prev, lokasi_id: true }))}
                    aria-required="true"
                  >
                    <option value="">Pilih Lokasi</option>                    {locationsData?.data?.map((location: any) => (
                      <option key={location.id} value={location.id}>
                        {location.name} {location.code ? `(${location.code})` : ''} - {location.building} {location.floor ? `Lt. ${location.floor}` : ''} {location.room || ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setNewLocation({ code: '', name: '', description: '', building: '', floor: '', room: '' });
                      setShowNewLocationModal(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Tambah Lokasi Baru"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Baru
                  </button>
                </div>
                {touched.lokasi_id && fieldErrors.lokasi_id && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.lokasi_id}</p>
                )}
              </div><div>
                <label htmlFor="asal_pengadaan" className="block text-sm font-medium text-gray-700 mb-1">
                  Asal Pengadaan <span className="text-red-500">*</span>
                </label>                <select
                  name="asal_pengadaan"
                  id="asal_pengadaan"
                  required
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    touched.asal_pengadaan && fieldErrors.asal_pengadaan ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.asal_pengadaan}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, asal_pengadaan: true }))}
                  aria-required="true"
                >
                  <option value="">Pilih Asal Pengadaan</option>
                  <option value="Pembelian">Pembelian</option>
                  <option value="Bantuan">Bantuan</option>
                  <option value="Hibah">Hibah</option>
                  <option value="STTST">STTST</option>
                </select>
                {touched.asal_pengadaan && fieldErrors.asal_pengadaan && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.asal_pengadaan}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status Aset
                </label>
                <select
                  name="status"
                  id="status"
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

          <div className="flex justify-end space-x-3">
            <Link
              to="/assets"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md border border-transparent text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </div>
              ) : isEditMode ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>

      {/* New Category Modal */}
      <Transition.Root show={showNewCategoryModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setShowNewCategoryModal}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <PlusIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Tambah Kategori Baru
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Silakan isi informasi kategori baru untuk aset Anda
                      </p>
                    </div>
                  </div>
                </div>
                
                {categoryError && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{categoryError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-5 sm:mt-6">
                  <form onSubmit={handleNewCategorySubmit}>
                    <div>
                      <label htmlFor="new-category-code" className="block text-sm font-medium text-gray-700">
                        Kode Kategori <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        id="new-category-code"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newCategory.code}
                        onChange={handleNewCategoryChange}
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700">
                        Nama Kategori <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="new-category-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newCategory.name}
                        onChange={handleNewCategoryChange}
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="new-category-description" className="block text-sm font-medium text-gray-700">
                        Deskripsi
                      </label>
                      <textarea
                        name="description"
                        id="new-category-description"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newCategory.description}
                        onChange={handleNewCategoryChange}
                        rows={3}
                      ></textarea>
                    </div>
                    
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={() => setShowNewCategoryModal(false)}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm ${
                          isCreatingCategory ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                        disabled={isCreatingCategory}
                      >
                        {isCreatingCategory ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* New Location Modal */}
      <Transition.Root show={showNewLocationModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setShowNewLocationModal}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <PlusIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Tambah Lokasi Baru
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Silakan isi informasi lokasi baru untuk aset Anda
                      </p>
                    </div>
                  </div>
                </div>
                
                {locationError && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{locationError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-5 sm:mt-6">
                  <form onSubmit={handleNewLocationSubmit}>
                    <div>
                      <label htmlFor="new-location-name" className="block text-sm font-medium text-gray-700">
                        Nama Lokasi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="new-location-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLocation.name}
                        onChange={handleNewLocationChange}
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="new-location-code" className="block text-sm font-medium text-gray-700">
                        Kode Lokasi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        id="new-location-code"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLocation.code}
                        onChange={handleNewLocationChange}
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="new-location-description" className="block text-sm font-medium text-gray-700">
                        Deskripsi
                      </label>
                      <textarea
                        name="description"
                        id="new-location-description"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLocation.description}
                        onChange={handleNewLocationChange}
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="new-location-building" className="block text-sm font-medium text-gray-700">
                        Gedung
                      </label>
                      <input
                        type="text"
                        name="building"
                        id="new-location-building"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLocation.building}
                        onChange={handleNewLocationChange}
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="new-location-floor" className="block text-sm font-medium text-gray-700">
                        Lantai
                      </label>
                      <input
                        type="text"
                        name="floor"
                        id="new-location-floor"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLocation.floor}
                        onChange={handleNewLocationChange}
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="new-location-room" className="block text-sm font-medium text-gray-700">
                        Ruangan
                      </label>
                      <input
                        type="text"
                        name="room"
                        id="new-location-room"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLocation.room}
                        onChange={handleNewLocationChange}
                      />
                    </div>
                    
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        onClick={() => setShowNewLocationModal(false)}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm ${
                          isCreatingLocation ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                        disabled={isCreatingLocation}
                      >
                        {isCreatingLocation ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
