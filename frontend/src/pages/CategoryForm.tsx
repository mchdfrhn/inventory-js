import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../services/api';
import type { Category } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { ArrowLeftIcon, PencilIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Define the required fields for category creation/update
type CategoryFormData = {
  name: string;
  description: string;
};

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const { addNotification } = useNotification();

  // Form state with correct typing
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch category data if in edit mode
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getById(id as string),
    enabled: isEditMode,
  });

  // Update form data when category data is loaded
  useEffect(() => {
    if (categoryData?.data) {
      const { name, description } = categoryData.data;
      setFormData({
        name,
        description,
      });
    }
  }, [categoryData]);
  // Handle errors from fetching category
  useEffect(() => {
    if (isEditMode && !isLoading && !categoryData) {
      setError('Gagal memuat data kategori');
    }
  }, [isEditMode, isLoading, categoryData]);

  // Create/Update mutation with proper type casting
  const mutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      if (isEditMode) {
        return categoryApi.update(id as string, data as Omit<Category, 'id' | 'created_at' | 'updated_at'>);
      } else {
        return categoryApi.create(data as Omit<Category, 'id' | 'created_at' | 'updated_at'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addNotification(
        'success',
        isEditMode ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil ditambahkan!'
      );
      navigate('/categories');
    },
    onError: (err: Error) => {
      const errorMessage = `Gagal menyimpan kategori: ${err.message}`;
      setError(errorMessage);
      addNotification('error', errorMessage);
      console.error(err);
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Let browser handle required field validation
    // The form won't submit if required fields are empty
    
    setError(null);
    setIsSubmitting(true);
    
    // Submit form - browser validation ensures required fields are filled
    mutation.mutate(formData);
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <span className="sr-only">Memuat...</span>
      </div>
    );
  }
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <Link to="/categories" className="text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode 
                ? 'Perbarui informasi kategori dalam sistem inventaris' 
                : 'Tambahkan kategori baru untuk mengatur aset Anda'}
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
        <form onSubmit={handleSubmit} className="space-y-6">        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Kategori</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">Nama kategori harus unik</p>
            </div>          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.description || ''}
              onChange={handleChange}
            ></textarea>
          </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">          <Link
            to="/categories"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Link><button
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
          </button>        </div>
      </form>
      </div>
    </div>
  );
}
