import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../services/api';
import type { Location } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { XCircleIcon, ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import PageLoader from '../components/PageLoader';
import InlineLoader from '../components/InlineLoader';

export default function LocationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const { addNotification } = useNotification();

  console.log('LocationForm mounted - isEditMode:', isEditMode);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    building: '',
    floor: '',
    room: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});  // Fetch all locations to generate next code
  const { data: allLocationsData, isLoading: isLoadingLocations, error: locationsError } = useQuery({
    queryKey: ['locations-all'],
    queryFn: async () => {
      console.log('Fetching all locations from API...');
      
      // Fetch first page to get total count
      const firstPage = await locationApi.list(1, 100);
      console.log('First page result:', firstPage);
      
      let allLocations = [...firstPage.data];
      const totalPages = Math.ceil(firstPage.pagination.total / 100);
      
      console.log(`Total locations: ${firstPage.pagination.total}, Total pages needed: ${totalPages}`);
      
      // Fetch remaining pages if needed
      for (let page = 2; page <= totalPages; page++) {
        console.log(`Fetching page ${page}...`);
        const pageResult = await locationApi.list(page, 100);
        allLocations = [...allLocations, ...pageResult.data];
      }
      
      console.log(`Fetched all ${allLocations.length} locations`);
      
      return {
        data: allLocations,
        pagination: {
          total: firstPage.pagination.total,
          page: 1,
          pageSize: allLocations.length,
          totalPages: 1
        }
      };
    },
    enabled: !isEditMode, // Only fetch when creating new location
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  // Add debug for query status
  useEffect(() => {
    console.log('Query status:', {
      isEditMode,
      isLoadingLocations,
      hasData: !!allLocationsData,
      error: locationsError,
      dataLength: allLocationsData?.data?.length || 0
    });
  }, [isEditMode, isLoadingLocations, allLocationsData, locationsError]);

  // Fetch location data if in edit mode
  const { data: locationData, isLoading: isLoadingLocation } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationApi.getById(Number(id)),
    enabled: isEditMode,
  });

  // Generate next location code
  const generateNextCode = (existingLocations: Location[]): string => {
    if (!existingLocations || existingLocations.length === 0) {
      console.log('No existing locations, returning 001');
      return '001';
    }

    console.log('Existing locations:', existingLocations.map(loc => ({ id: loc.id, code: loc.code, name: loc.name })));

    // Extract numeric codes from different patterns and find the highest
    const numericCodes = existingLocations
      .map(location => {
        // Try to extract numbers from different patterns:
        // 1. Pure numeric codes like "001", "002", "052" etc.
        let match = location.code.match(/^(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          console.log(`  Pure numeric code "${location.code}" -> ${num}`);
          return num;
        }
        
        // 2. Alphanumeric codes ending with numbers like "RD001", "RA001" etc.
        match = location.code.match(/^[A-Za-z]+(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          console.log(`  Alphanumeric code "${location.code}" -> ${num}`);
          return num;
        }
        
        // 3. Any sequence of digits in the code
        match = location.code.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          console.log(`  Any digits in "${location.code}" -> ${num}`);
          return num;
        }
        
        console.log(`  No digits found in code: ${location.code}`);
        return 0;
      })
      .filter(code => !isNaN(code) && code > 0);

    console.log('All extracted numeric codes:', numericCodes);
    
    const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
    const nextCode = maxCode + 1;
    
    console.log(`Max code: ${maxCode}, next code: ${nextCode}`);

    // Format with leading zeros (3 digits)
    const formattedCode = nextCode.toString().padStart(3, '0');
    console.log(`Final formatted code: ${formattedCode}`);
    
    return formattedCode;
  };
  // Update form data when location data is loaded (edit mode)
  useEffect(() => {
    if (locationData?.data) {
      const { name, code, description, building, floor, room } = locationData.data;
      setFormData({
        name: name || '',
        code: code || '',
        description: description || '',
        building: building || '',
        floor: floor || '',
        room: room || ''
      });
    }
  }, [locationData]);

  // Auto-generate code for new location
  useEffect(() => {
    console.log('Auto-generate effect triggered:', {
      isEditMode,
      hasAllLocationsData: !!allLocationsData,
      dataLength: allLocationsData?.data?.length,
      currentFormCode: formData.code
    });
    
    if (!isEditMode && allLocationsData?.data && allLocationsData.data.length > 0) {
      console.log('All locations data:', allLocationsData);
      console.log('Location codes:', allLocationsData.data.map(loc => loc.code));
      const nextCode = generateNextCode(allLocationsData.data);
      console.log('Generated next code:', nextCode);
      
      setFormData(prev => {
        console.log('Setting form data, previous code:', prev.code, 'new code:', nextCode);
        return {
          ...prev,
          code: nextCode
        };
      });
    } else if (!isEditMode && !isLoadingLocations && (!allLocationsData || !allLocationsData.data)) {
      console.log('No location data available, using default 001');
      
      setFormData(prev => ({
        ...prev,
        code: '001'
      }));
    } else {
      console.log('Not generating code because:', {
        isEditMode,
        hasData: !!allLocationsData?.data,
        dataLength: allLocationsData?.data?.length,
        isLoading: isLoadingLocations
      });
    }
  }, [allLocationsData, isEditMode, isLoadingLocations]);

  // Manual fetch as fallback if React Query fails
  useEffect(() => {
    if (!isEditMode && !allLocationsData && !isLoadingLocations && !locationsError) {
      console.log('Manual fetch triggered as fallback');
      locationApi.list(1, 1000)
        .then(result => {
          console.log('Manual fetch result:', result);
          if (result?.data && result.data.length > 0) {
            const nextCode = generateNextCode(result.data);
            console.log('Manual fetch generated code:', nextCode);
            setFormData(prev => ({
              ...prev,
              code: nextCode
            }));
          }
        })
        .catch(err => {
          console.error('Manual fetch failed:', err);
        });
    }
  }, [isEditMode, allLocationsData, isLoadingLocations, locationsError]);

  // Handle errors from fetching location
  useEffect(() => {
    if (isEditMode && !isLoadingLocation && !locationData) {
      setError('Gagal memuat data lokasi');
    }
  }, [isEditMode, isLoadingLocation, locationData]);  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
      // Transform data to match backend expected format (lowercase field names)
      const transformedData = {
        name: data.name,
        code: data.code,
        description: data.description,
        building: data.building,
        floor: data.floor,
        room: data.room,
      };

      if (isEditMode && id) {
        return locationApi.update(Number(id), transformedData as unknown as Omit<Location, 'id' | 'created_at' | 'updated_at'>);
      } else {
        return locationApi.create(transformedData as unknown as Omit<Location, 'id' | 'created_at' | 'updated_at'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      // Add success notification
      addNotification(
        'success',
        isEditMode ? 'Lokasi berhasil diperbarui!' : 'Lokasi baru berhasil ditambahkan!'
      );
      navigate('/locations');
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal menyimpan lokasi: ${err.message}`;
      setError(errorMessage);
      // Add error notification
      addNotification('error', errorMessage);
      console.error(err);
      setIsSubmitting(false);
    },
  });

  // Validate a single field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value ? '' : 'Nama lokasi wajib diisi';
      case 'code':
        return value ? '' : 'Kode lokasi wajib diisi';
      default:
        return '';
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate the field
    const errorMessage = validateField(name, value);
    setFieldErrors(prev => ({ 
      ...prev, 
      [name]: errorMessage 
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Let browser handle required field validation
    // The form won't submit if required fields are empty
    
    setError(null);
    setIsSubmitting(true);
    
    // Mark all required fields as touched for styling purposes
    const requiredFields = ['name', 'code'];
    const touchedFields = requiredFields.reduce((acc, field) => ({...acc, [field]: true}), {});
    setTouched(touchedFields);
    
    // Submit form - browser validation ensures required fields are filled
    mutation.mutate(formData);
  };

  if (isLoadingLocation) {
    return <PageLoader text="Memuat data lokasi..." />;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center">
          <div className="mr-4">
            <Link to="/locations" className="text-green-600 hover:text-green-800 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold leading-6 text-gray-900">
              {isEditMode ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {isEditMode
                ? 'Perbarui informasi lokasi dalam sistem inventaris'
                : 'Tambahkan lokasi baru ke sistem inventaris'}
            </p>
          </div>
          {isEditMode && (
            <div className="ml-auto text-sm text-gray-600 bg-white px-3 py-1 rounded-md shadow-sm">
              <span className="flex items-center">
                <PencilIcon className="h-4 w-4 mr-1" />
                ID: {id}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 py-6">        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-center">
            <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
            <div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white text-xs font-medium rounded-full mr-2">1</span>
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">            {/* Code field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Kode Lokasi <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Otomatis)</span>
              </label>              <input
                type="text"
                name="code"
                id="code"
                placeholder={!isEditMode ? (isLoadingLocations ? "Membuat kode..." : "001") : "Kode tidak dapat diubah"}
                required
                value={formData.code}
                readOnly={true}
                disabled={true}
                className="block w-full rounded-md bg-gray-50 cursor-not-allowed text-gray-600 border-gray-300 shadow-sm sm:text-sm"              />
              {!isEditMode ? (
                <p className="mt-1 text-xs text-gray-500">
                  Kode lokasi akan dibuat secara otomatis berdasarkan urutan terbaru
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Kode lokasi tidak dapat diubah untuk menghindari duplikasi
                </p>
              )}
            </div>
            
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lokasi <span className="text-red-500">*</span>
              </label>              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`block w-full rounded-md ${
                  touched.name && fieldErrors.name
                    ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                } shadow-sm sm:text-sm`}
                placeholder="Contoh: Ruang Server"
              />
              {touched.name && fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Detail Location */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full mr-2">2</span>
            Detail Lokasi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Building field */}
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">
                Gedung
              </label>
              <input
                type="text"
                name="building"
                id="building"
                value={formData.building}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 shadow-sm sm:text-sm"
                placeholder="Contoh: Gedung A"
              />
            </div>
            
            {/* Floor field */}
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Lantai
              </label>
              <input
                type="text"
                name="floor"
                id="floor"
                value={formData.floor}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 shadow-sm sm:text-sm"
                placeholder="Contoh: Lantai 1"
              />
            </div>
            
            {/* Room field */}
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                Ruangan
              </label>
              <input
                type="text"
                name="room"
                id="room"
                value={formData.room}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 shadow-sm sm:text-sm"
                placeholder="Contoh: R.101"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Description */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-500 text-white text-xs font-medium rounded-full mr-2">3</span>
            Deskripsi
          </h3>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Lokasi
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 shadow-sm sm:text-sm"
              placeholder="Deskripsi detail tentang lokasi ini (opsional)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Berikan informasi tambahan tentang lokasi seperti fungsi ruangan atau karakteristik khusus.
            </p>
          </div>
        </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Link
              to="/locations"
              className="inline-flex items-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <InlineLoader size="sm" variant="white" className="mr-2" />
                  Menyimpan...
                </>
              ) : isEditMode ? (
                <>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Perbarui
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
