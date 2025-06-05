// filepath: d:\Project\STTPU\inventory\frontend\src\pages\AssetForm.tsx
import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi, categoryApi } from '../services/api';
import type { Asset } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';

// Define the required fields for asset creation/update
type AssetFormData = {
  kode: string;
  nama: string;
  spesifikasi: string;
  quantity: number;
  satuan: string;
  tanggal_perolehan: string;
  harga_perolehan: number;
  umur_ekonomis_tahun: number;
  keterangan: string;
  lokasi: string;
  category_id: string;
  status: 'baik' | 'rusak' | 'tidak_memadai'; // Only support new status values
};

export default function AssetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Form state with correct typing
  const [formData, setFormData] = useState<AssetFormData>({
    kode: '',
    nama: '',
    spesifikasi: '',
    quantity: 1,
    satuan: 'unit',
    tanggal_perolehan: new Date().toISOString().split('T')[0],
    harga_perolehan: 0,
    umur_ekonomis_tahun: 1,
    keterangan: '',
    lokasi: '',
    category_id: '',
    status: 'baik',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        category_id, 
        status 
      } = assetData.data;
      
      setFormData({
        kode: kode || '',
        nama: nama || '',
        spesifikasi: spesifikasi || '',
        quantity: quantity || 1,
        satuan: satuan || 'unit',
        tanggal_perolehan: tanggal_perolehan ? new Date(tanggal_perolehan).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        harga_perolehan: harga_perolehan || 0,
        umur_ekonomis_tahun: umur_ekonomis_tahun || 1,
        keterangan: keterangan || '',
        lokasi: lokasi || '',
        category_id: category_id || '',
        status: status || 'baik',
      });
    }
  }, [assetData]);
  
  // Handle errors from fetching asset
  useEffect(() => {
    if (isEditMode && !isLoadingAsset && !assetData) {
      setError('Gagal memuat data aset');
    }
  }, [isEditMode, isLoadingAsset, assetData]);

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
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
      navigate('/assets');
    },
    onError: (err: Error) => {
      setError(`Gagal menyimpan aset: ${err.message}`);
      console.error(err);
      setIsSubmitting(false);
    },
  });
  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: { name: string; description: string; code: string }) => {
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
      
      // Reset and close modal
      setShowNewCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      setCategoryError(null);
      setIsCreatingCategory(false);
    },
    onError: (err: Error) => {
      setCategoryError(`Gagal membuat kategori: ${err.message}`);
      setIsCreatingCategory(false);
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Validate form
    if (!formData.kode || !formData.nama || !formData.category_id) {
      setError('Kode, nama, dan kategori wajib diisi');
      setIsSubmitting(false);
      return;
    }

    // Submit form
    mutation.mutate(formData);
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle new category selection
    if (name === 'category_id' && value === 'new_category') {
      // Reset the select to empty so the required validation still works
      setFormData(prev => ({ ...prev, category_id: '' }));
      
      // Show the new category modal
      setNewCategory({ name: '', description: '' });
      setShowNewCategoryModal(true);
      return;
    }
    
    setFormData(prev => {
      const updated = { ...prev };
        if (name === 'quantity' || name === 'umur_ekonomis_tahun') {
        updated[name] = parseInt(value) || 0;
      } else if (name === 'harga_perolehan') {
        updated[name] = parseFloat(value) || 0;
      } else if (name === 'status') {
        updated.status = value as AssetFormData['status'];
      } else {
        (updated as any)[name] = value;
      }
      
      return updated;
    });
  };

  // Handle new category submission
  const handleNewCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    setIsCreatingCategory(true);
    
    // Validate
    if (!newCategory.name.trim()) {
      setCategoryError('Nama kategori wajib diisi');
      setIsCreatingCategory(false);
      return;
    }
      // Create new category
    const categoryCode = `CAT${(Date.now() % 10000).toString().padStart(4, '0')}`;
    createCategoryMutation.mutate({
      name: newCategory.name.trim(),
      description: newCategory.description.trim() || '',
      code: categoryCode,
    });
  };

  // Loading state
  if (isLoadingAsset || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <span className="sr-only">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditMode ? 'Ubah Aset' : 'Buat Aset Baru'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode 
            ? 'Perbarui informasi aset dalam sistem inventaris'
            : 'Tambahkan aset baru ke sistem inventaris'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Kesalahan</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="kode" className="block text-sm font-medium text-gray-700">
              Kode Aset *
            </label>
            <input
              type="text"
              name="kode"
              id="kode"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.kode}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
              Nama Aset *
            </label>
            <input
              type="text"
              name="nama"
              id="nama"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.nama}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Kategori *
            </label>
            <div className="relative">
              <select
                id="category_id"
                name="category_id"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none pl-3 pr-10 py-2"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Pilih kategori</option>
                {categoriesData?.data.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="new_category" className="font-medium text-blue-600">+ Tambah kategori baru</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              {formData.category_id ? (
                <div className="mt-2 flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  <span className="text-xs text-gray-600">
                    {categoriesData?.data.find(c => c.id === formData.category_id)?.name}
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-blue-600">Kategori membantu mengelompokkan aset dengan sifat serupa</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tanggal_perolehan" className="block text-sm font-medium text-gray-700">
              Tanggal Perolehan *
            </label>
            <input
              type="date"
              name="tanggal_perolehan"
              id="tanggal_perolehan"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.tanggal_perolehan}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="harga_perolehan" className="block text-sm font-medium text-gray-700">
              Harga Perolehan (Rp) *
            </label>
            <input
              type="number"
              name="harga_perolehan"
              id="harga_perolehan"
              min="0"
              step="1000"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.harga_perolehan}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="umur_ekonomis_tahun" className="block text-sm font-medium text-gray-700">
              Umur Ekonomis (Tahun) *
            </label>
            <input
              type="number"
              name="umur_ekonomis_tahun"
              id="umur_ekonomis_tahun"
              min="1"
              max="50"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.umur_ekonomis_tahun}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Jumlah *
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="satuan" className="block text-sm font-medium text-gray-700">
              Satuan *
            </label>
            <input
              type="text"
              name="satuan"
              id="satuan"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.satuan}
              onChange={handleChange}
              placeholder="unit, buah, lembar, dll"
            />
          </div>
          
          <div>
            <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">
              Lokasi *
            </label>
            <input
              type="text"
              name="lokasi"
              id="lokasi"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.lokasi}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none pl-3 pr-10 py-2"
                value={formData.status}
                onChange={handleChange}
              >                <option value="baik">Baik</option>
                <option value="rusak">Rusak</option>
                <option value="tidak_memadai">Tidak Memadai</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              
              {/* Status indicator */}
              <div className="mt-2 flex items-center">                <span 
                  className={`inline-block w-3 h-3 rounded-full mr-2 
                    ${formData.status === 'baik' ? 'bg-green-500' : 
                      formData.status === 'rusak' ? 'bg-red-500' : 
                      'bg-yellow-500'}`}
                ></span>
                <span className="text-xs text-gray-600">
                  {formData.status === 'baik' ? 'Aset dalam kondisi baik' : 
                   formData.status === 'rusak' ? 'Aset dalam kondisi rusak' : 
                   'Aset dalam kondisi tidak memadai'}
                </span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="spesifikasi" className="block text-sm font-medium text-gray-700">
              Spesifikasi
            </label>
            <textarea
              id="spesifikasi"
              name="spesifikasi"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.spesifikasi}
              onChange={handleChange}
              placeholder="Merk, tipe, ukuran, dan informasi spesifikasi lainnya"
            ></textarea>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700">
              Keterangan
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Informasi tambahan mengenai aset"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <Link
            to="/assets"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Perbarui Aset' : 'Buat Aset'}
          </button>
        </div>

        {/* New category modal */}
        <Transition.Root show={showNewCategoryModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setShowNewCategoryModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Tambah Kategori Baru
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Buat kategori baru untuk mengelompokkan aset dengan lebih baik.
                          </p>
                        </div>
                      </div>
                    </div>

                    {categoryError && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Kesalahan</h3>
                            <div className="mt-2 text-sm text-red-700">{categoryError}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleNewCategorySubmit} className="mt-5 sm:mt-6">
                      <div>
                        <label htmlFor="new_category_name" className="block text-sm font-medium text-gray-700">
                          Nama Kategori *
                        </label>
                        <input
                          type="text"
                          id="new_category_name"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="new_category_description" className="block text-sm font-medium text-gray-700">
                          Deskripsi Kategori
                        </label>
                        <textarea
                          id="new_category_description"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          placeholder="Opsional: Jelaskan tentang kategori ini"
                        ></textarea>
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={isCreatingCategory}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
                        >
                          {isCreatingCategory ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                          onClick={() => setShowNewCategoryModal(false)}
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </form>
    </div>
  );
}
