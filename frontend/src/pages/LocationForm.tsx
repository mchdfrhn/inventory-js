import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../services/api';
import type { Location } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function LocationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const { addNotification } = useNotification();

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch location data if in edit mode
  const { data: locationData, isLoading: isLoadingLocation } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationApi.getById(Number(id)),
    enabled: isEditMode,
  });

  // Update form data when location data is loaded
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

  // Handle errors from fetching location
  useEffect(() => {
    if (isEditMode && !isLoadingLocation && !locationData) {
      setError('Gagal memuat data lokasi');
    }
  }, [isEditMode, isLoadingLocation, locationData]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
      if (isEditMode && id) {
        return locationApi.update(Number(id), data);
      } else {
        return locationApi.create(data);
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 border-r-2 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {isEditMode ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? 'Perbarui informasi lokasi dalam sistem inventaris'
            : 'Tambahkan lokasi baru ke sistem inventaris'}
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
            <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Kode Lokasi <span className="text-red-500">*</span>
              </label>              <input
                type="text"
                name="code"
                id="code"
                placeholder="001"
                required
                value={formData.code}
                onChange={handleChange}
                className={`block w-full rounded-md ${
                  touched.code && fieldErrors.code
                    ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {touched.code && fieldErrors.code && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.code}</p>
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
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {touched.name && fieldErrors.name && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>
            
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
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Description field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link
              to="/locations"
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
    </div>
  );
}
