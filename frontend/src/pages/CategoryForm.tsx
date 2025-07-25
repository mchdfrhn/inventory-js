import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../services/api';
import type { Category } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { ArrowLeftIcon, PencilIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PageLoader from '../components/PageLoader';
import InlineLoader from '../components/InlineLoader';

// Define the required fields for category creation/update
type CategoryFormData = {
  code: string;
  name: string;
  description: string;
};

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();  const isEditMode = Boolean(id);
  const { addNotification } = useNotification();
    // Form state with correct typing
  const [formData, setFormData] = useState<CategoryFormData>({
    code: '',
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
  });  // Update form data when category data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && categoryData?.data) {
      const { code, name, description } = categoryData.data;
      setFormData({
        code,
        name,
        description,
      });    }
  }, [categoryData, isEditMode]);

  // Handle errors from fetching category
  useEffect(() => {
    if (isEditMode && !isLoading && !categoryData) {
      setError('Gagal memuat data kategori');
    }
  }, [isEditMode, isLoading, categoryData]);  // Create/Update mutation with proper type casting
  const mutation = useMutation({
    mutationFn: (data: CategoryFormData) => {      // Transform data to match backend expected format (lowercase field names)
      const transformedData = {
        name: data.name,
        description: data.description,
        // Only include code if in edit mode, let backend generate for new categories
        ...(isEditMode && { code: data.code })
      };

      if (isEditMode) {
        return categoryApi.update(id as string, transformedData as unknown as Omit<Category, 'id' | 'created_at' | 'updated_at'>);
      } else {
        return categoryApi.create(transformedData as unknown as Omit<Category, 'id' | 'created_at' | 'updated_at'>);
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
  });  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    // Manual validation for name field only
    if (!formData.name || formData.name.trim() === '') {
      setError('Nama kategori wajib diisi');
      setIsSubmitting(false);
      return;
    }
    
    setError(null);
    
    // Submit form
    mutation.mutate(formData);
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Loading state
  if (isLoading) {
    return <PageLoader text="Memuat data kategori..." />;
  }
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center">
          <div className="mr-4">
            <Link to="/categories" className="text-purple-600 hover:text-purple-800 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold leading-6 text-gray-900">
              {isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {isEditMode 
                ? 'Perbarui informasi kategori dalam sistem inventaris' 
                : 'Tambahkan kategori baru untuk mengatur aset Anda'}
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

      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-center">
            <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

          {/* Section 1: Basic Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-500 text-white text-xs font-medium rounded-full mr-2">1</span>
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Kategori
                  <span className="text-xs text-gray-500 ml-2">(Otomatis)</span>
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  placeholder={!isEditMode ? "Akan dibuat otomatis" : "Kode tidak dapat diubah"}
                  readOnly={true}
                  disabled={true}
                  className="block w-full rounded-md shadow-sm sm:text-sm bg-gray-50 cursor-not-allowed text-gray-600 border-gray-300"
                  value={isEditMode ? formData.code : ""}
                />
                {!isEditMode ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Kode kategori akan dibuat secara otomatis dengan kelipatan 10 (10, 20, 30, dst)
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Kode kategori tidak dapat diubah untuk menghindari duplikasi
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Elektronik"
                />
                <p className="mt-1 text-xs text-gray-500">Nama kategori harus unik</p>
              </div>
            </div>
          </div>

          {/* Section 2: Description */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-500 text-white text-xs font-medium rounded-full mr-2">2</span>
              Deskripsi
            </h3>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Kategori
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Deskripsi detail tentang kategori ini (opsional)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Berikan informasi tentang jenis aset yang termasuk dalam kategori ini.
              </p>
            </div>
          </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Batal
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 ${
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
          </button>        </div>
      </form>
      </div>
    </div>
  );
}
