import { useState, useEffect, Fragment } from 'react';
import { Cog6ToothIcon, PlusIcon, TrashIcon, EyeIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import ReportPreview from '../components/ReportPreview';
import { templateService, columnOptions, defaultTemplates, type ReportTemplate } from '../services/templateService';
import { useNotification } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';

// Sample assets for preview
const sampleAssets = [
  {
    id: '1',
    kode: 'AST001',
    nama: 'Laptop Dell Inspiron',
    spesifikasi: 'Intel i5, 8GB RAM, 256GB SSD',
    quantity: 1,
    satuan: 'unit',
    tanggal_perolehan: '2023-01-15',
    harga_perolehan: 15000000,
    umur_ekonomis_tahun: 5,
    umur_ekonomis_bulan: 60,
    akumulasi_penyusutan: 3000000,
    nilai_sisa: 12000000,
    keterangan: 'Laptop untuk divisi IT',
    category_id: '1',
    status: 'baik' as const,
    category: { id: '1', name: 'Elektronik', description: 'Peralatan elektronik' },
    lokasi: 'Ruang IT',
    location_info: { id: 1, name: 'Lab Komputer', code: 'LAB001', building: 'Gedung A', floor: '2', room: 'A201', description: 'Laboratorium komputer utama', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
    asal_pengadaan: 'Hibah',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z'
  },
  {
    id: '2',
    kode: 'AST002',
    nama: 'Meja Kantor',
    spesifikasi: 'Kayu jati, ukuran 120x60 cm',
    quantity: 5,
    satuan: 'unit',
    tanggal_perolehan: '2022-08-20',
    harga_perolehan: 2500000,
    umur_ekonomis_tahun: 10,
    umur_ekonomis_bulan: 120,
    akumulasi_penyusutan: 500000,
    nilai_sisa: 2000000,
    keterangan: 'Meja kerja ruang dosen',
    category_id: '2',
    status: 'baik' as const,
    category: { id: '2', name: 'Furniture', description: 'Perabotan kantor' },
    lokasi: 'Ruang Dosen',
    location_info: { id: 2, name: 'Ruang Dosen', code: 'RDS001', building: 'Gedung B', floor: '1', room: 'B101', description: 'Ruang kerja dosen', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
    asal_pengadaan: 'Pembelian',
    created_at: '2022-08-20T00:00:00Z',
    updated_at: '2022-08-20T00:00:00Z'
  }
];

export default function TemplateManagementPage() {
  const { addNotification } = useNotification();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ReportTemplate | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [templateToReset, setTemplateToReset] = useState<ReportTemplate | null>(null);
  const [mounted, setMounted] = useState(false);

  // Mounting animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load templates from service
  useEffect(() => {
    loadTemplates();
    
    // Subscribe to template changes
    const unsubscribe = templateService.subscribe(loadTemplates);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadTemplates = () => {
    try {
      const allTemplates = templateService.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(defaultTemplates);
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate = templateService.createNewTemplate();
    setEditingTemplate(newTemplate);
    setShowCreateModal(true);
  };

  const handleSaveTemplate = (template: ReportTemplate) => {
    try {
      const success = templateService.saveTemplate(template);
      
      if (success) {
        setShowCreateModal(false);
        setEditingTemplate(null);
        loadTemplates(); // Reload templates
        
        const isEdit = templates.find(t => t.id === template.id);
        addNotification('success', isEdit ? 'Template berhasil diperbarui!' : 'Template berhasil disimpan!');
      } else {
        addNotification('error', 'Terjadi kesalahan saat menyimpan template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      addNotification('error', 'Terjadi kesalahan saat menyimpan template');
    }
  };

  const handleDeleteTemplate = (template: ReportTemplate) => {
    if (defaultTemplates.find(t => t.id === template.id)) {
      addNotification('error', 'Template default tidak dapat dihapus');
      return;
    }

    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (!templateToDelete) return;

    try {
      const success = templateService.deleteTemplate(templateToDelete.id);
      
      if (success) {
        loadTemplates(); // Reload templates
        setDeleteModalOpen(false);
        setTemplateToDelete(null);
        addNotification('success', 'Template berhasil dihapus!');
      } else {
        addNotification('error', 'Template tidak dapat dihapus');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      addNotification('error', 'Terjadi kesalahan saat menghapus template');
    }
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setEditingTemplate({ ...template });
    setShowCreateModal(true);
  };

  const handleResetTemplate = (template: ReportTemplate) => {
    setTemplateToReset(template);
    setResetModalOpen(true);
  };

  const confirmResetTemplate = () => {
    if (!templateToReset) return;
    
    try {
      const success = templateService.resetToDefault(templateToReset.id);
      
      if (success) {
        loadTemplates(); // Reload templates
        setResetModalOpen(false);
        setTemplateToReset(null);
        addNotification('success', `Template "${templateToReset.name}" berhasil dikembalikan ke pengaturan default!`);
      } else {
        addNotification('error', 'Template tidak dapat direset ke default');
      }
    } catch (error) {
      console.error('Error resetting template:', error);
      addNotification('error', 'Terjadi kesalahan saat mereset template');
    }
  };

  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard hover={false} className="overflow-hidden">
        {/* Controls */}
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30 flex items-center justify-end">
          <button
            onClick={handleCreateTemplate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-300"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>Buat Template</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border flex flex-col h-full min-h-[180px]"
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3 flex-grow">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {defaultTemplates.find(t => t.id === template.id) && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Default
                      </span>
                    )}
                    {defaultTemplates.find(t => t.id === template.id) && templateService.isDefaultTemplateModified(template.id) && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        Modified
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                    {template.orientation === 'portrait' ? '📄 Portrait' : '📑 Landscape'}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                    📊 {template.columns.length} kolom
                  </span>
                  {template.includeStats && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">📈 Statistik</span>
                  )}
                  {template.includeChart && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">📊 Grafik</span>
                  )}
                </div>

                <div className="flex items-stretch gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}
                    className={`${!defaultTemplates.find(t => t.id === template.id) 
                      ? 'w-10 h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center' 
                      : 'flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium min-w-0'
                    }`}
                    title="Preview Template"
                  >
                    <EyeIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    {defaultTemplates.find(t => t.id === template.id) && (
                      <span className="truncate">Preview</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-2 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium min-w-0"
                  >
                    <Cog6ToothIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">Edit</span>
                  </button>
                  
                  {/* Reset button for modified default templates */}
                  {defaultTemplates.find(t => t.id === template.id) && templateService.isDefaultTemplateModified(template.id) && (
                    <button
                      onClick={() => handleResetTemplate(template)}
                      className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 px-2 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium min-w-0"
                      title="Reset ke Default"
                    >
                      <ArrowPathIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">Reset</span>
                    </button>
                  )}
                  
                  {/* Delete button for custom templates only */}
                  {!defaultTemplates.find(t => t.id === template.id) && (
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-2 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-medium min-w-0"
                      title="Hapus Template"
                    >
                      <TrashIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Template Modal */}
        <Transition.Root show={showCreateModal && !!editingTemplate} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowCreateModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-2 sm:p-3">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative w-full max-w-3xl">
                    <GlassCard className="overflow-hidden shadow-xl border border-white/20" hover={false}>
                      {/* Enhanced Header with Glass Morphism */}
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 bg-blue-500/20 rounded-lg">
                              <Cog6ToothIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <Dialog.Title as="h3" className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {editingTemplate?.id.startsWith('custom_') ? 'Buat Template Baru' : 'Edit Template'}
                              </Dialog.Title>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/20 p-1 transition-all duration-200 hover:scale-105"
                            onClick={() => setShowCreateModal(false)}
                          >
                            <span className="sr-only">Tutup</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Content with optimized scroll */}
                      <div className="max-h-[calc(80vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <div className="p-4 space-y-4">
                          {editingTemplate && (
                            <>
                              {/* Basic Settings */}
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="font-medium text-gray-900 mb-2">Pengaturan Dasar</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Nama Template
                                    </label>
                                    <input
                                      type="text"
                                      value={editingTemplate.name}
                                      onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      placeholder="Masukkan nama template"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Orientasi Halaman
                                    </label>
                                    <select
                                      value={editingTemplate.orientation}
                                      onChange={(e) => setEditingTemplate(prev => prev ? { 
                                        ...prev, 
                                        orientation: e.target.value as 'portrait' | 'landscape' 
                                      } : null)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                      <option value="portrait">📄 Portrait (Tegak)</option>
                                      <option value="landscape">📑 Landscape (Mendatar)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Ukuran Font
                                    </label>
                                    <select
                                      value={editingTemplate.fontSize}
                                      onChange={(e) => setEditingTemplate(prev => prev ? { 
                                        ...prev, 
                                        fontSize: parseInt(e.target.value) 
                                      } : null)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                      <option value={10}>10pt (Kecil)</option>
                                      <option value={11}>11pt (Sedang)</option>
                                      <option value={12}>12pt (Normal)</option>
                                      <option value={14}>14pt (Besar)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Warna Header
                                    </label>
                                    
                                    {/* Preset Color Palette */}
                                    <div className="mb-2">
                                      <p className="text-xs text-gray-500 mb-1">Warna yang direkomendasikan:</p>
                                      <div className="grid grid-cols-4 gap-1">
                                        {[
                                          { name: 'Biru Utama', value: '#2563eb' },
                                          { name: 'Biru Gelap', value: '#1e40af' },
                                          { name: 'Indigo', value: '#4f46e5' },
                                          { name: 'Hijau', value: '#059669' },
                                          { name: 'Emerald', value: '#10b981' },
                                          { name: 'Teal', value: '#0d9488' },
                                          { name: 'Abu-abu', value: '#374151' },
                                          { name: 'Slate', value: '#475569' }
                                        ].map((color) => (
                                          <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setEditingTemplate(prev => prev ? { 
                                              ...prev, 
                                              headerColor: color.value 
                                            } : null)}
                                            className={`w-full h-6 rounded border transition-all duration-200 hover:scale-105 ${
                                              editingTemplate.headerColor === color.value 
                                                ? 'border-2 border-gray-800 shadow-md' 
                                                : 'border border-gray-300 hover:border-gray-400'
                                            }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                          />
                                        ))}
                                      </div>
                                    </div>

                                    {/* Custom Color Input */}
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">
                                        Atau masukkan kode warna hex:
                                      </label>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="text"
                                          value={editingTemplate.headerColor}
                                          onChange={(e) => {
                                            let value = e.target.value;
                                            // Auto-add # if not present
                                            if (value && !value.startsWith('#')) {
                                              value = '#' + value;
                                            }
                                            setEditingTemplate(prev => prev ? { 
                                              ...prev, 
                                              headerColor: value 
                                            } : null);
                                          }}
                                          placeholder="#2563eb"
                                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                                          maxLength={7}
                                        />
                                        <div 
                                          className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                                          style={{ backgroundColor: editingTemplate.headerColor }}
                                          title="Preview warna"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi
                                  </label>
                                  <textarea
                                    value={editingTemplate.description}
                                    onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={2}
                                    placeholder="Deskripsi template"
                                  />
                                </div>
                              </div>

                              {/* Report Options */}
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="font-medium text-gray-900 mb-2">Opsi Laporan</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {[
                                    { key: 'includeHeader', label: 'Header & Logo', icon: '📋' },
                                    { key: 'includeFooter', label: 'Footer & Info', icon: '📄' },
                                    { key: 'includeStats', label: 'Statistik', icon: '📈' },
                                    { key: 'includeChart', label: 'Grafik', icon: '📊' },
                                    { key: 'includeQRCode', label: 'QR Code', icon: '📱' },
                                    { key: 'includeFilters', label: 'Info Filter', icon: '🔍' }
                                  ].map(({ key, label, icon }) => (
                                    <label key={key} className="flex items-center p-2 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editingTemplate[key as keyof ReportTemplate] as boolean}
                                        onChange={(e) => setEditingTemplate(prev => prev ? { 
                                          ...prev, 
                                          [key]: e.target.checked 
                                        } : null)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                      />
                                      <span className="mr-2 text-sm">{icon}</span>
                                      <span className="text-xs font-medium text-gray-700">{label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* Column Selection */}
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="font-medium text-gray-900 mb-2">Kolom yang Ditampilkan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                  {columnOptions.map((option) => (
                                    <label key={option.id} className="flex items-center p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editingTemplate.columns.includes(option.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditingTemplate(prev => prev ? {
                                              ...prev,
                                              columns: [...prev.columns, option.id]
                                            } : null);
                                          } else {
                                            setEditingTemplate(prev => prev ? {
                                              ...prev,
                                              columns: prev.columns.filter(col => col !== option.id)
                                            } : null);
                                          }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                      />
                                      <span className="text-xs text-gray-700">{option.label}</span>
                                    </label>
                                  ))}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                  Dipilih: {editingTemplate.columns.length} dari {columnOptions.length} kolom
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Footer */}
                      <div className="px-4 py-3 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-md border-t border-white/20">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setShowCreateModal(false)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white/80 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => editingTemplate && handleSaveTemplate(editingTemplate)}
                            disabled={!editingTemplate?.name.trim() || !editingTemplate?.columns.length}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {editingTemplate?.id.startsWith('custom_') && !templates.find(t => t.id === editingTemplate.id) ? 'Simpan Template' : 'Perbarui Template'}
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Preview: {selectedTemplate.name}
                  </h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <ReportPreview 
                  assets={sampleAssets as any} 
                  template={selectedTemplate}
                />
              </div>
            </div>
          </div>
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
                        Hapus Template
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Apakah Anda yakin ingin menghapus template{' '}
                          <span className="font-semibold">"{templateToDelete?.name}"</span>?{' '}
                          Tindakan ini tidak dapat dibatalkan.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <GradientButton
                      variant="danger"
                      className="w-full sm:ml-3 sm:w-auto"
                      onClick={confirmDeleteTemplate}
                    >
                      Hapus Template
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

      {/* Reset Template Confirmation Modal */}
      <Transition.Root show={resetModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setResetModalOpen}>
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

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ArrowPathIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Reset Template ke Default
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin mengembalikan template{' '}
                        <span className="font-semibold">"{templateToReset?.name}"</span>{' '}
                        ke pengaturan default?
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Semua perubahan yang telah dibuat akan hilang dan tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <GradientButton
                    variant="danger"
                    className="w-full sm:ml-3 sm:w-auto"
                    onClick={confirmResetTemplate}
                  >
                    Ya, Reset ke Default
                  </GradientButton>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 hover:-translate-y-0.5"
                    onClick={() => setResetModalOpen(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Template Preview Modal */}
      <Transition.Root show={showPreview && !!selectedTemplate} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowPreview(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-3">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-7xl">
                  <GlassCard className="overflow-hidden shadow-xl border border-white/20" hover={false}>
                    {/* Enhanced Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-blue-500/20 rounded-lg">
                            <EyeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <Dialog.Title as="h3" className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                              Preview Template: {selectedTemplate?.name}
                            </Dialog.Title>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {selectedTemplate?.description}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/20 p-1 transition-all duration-200 hover:scale-105"
                          onClick={() => setShowPreview(false)}
                        >
                          <span className="sr-only">Tutup</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="h-[calc(90vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {selectedTemplate && (
                        <ReportPreview 
                          template={selectedTemplate}
                          assets={sampleAssets}
                        />
                      )}
                    </div>

                    {/* Enhanced Footer */}
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-md border-t border-white/20">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setShowPreview(false)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white/80 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm"
                        >
                          Tutup Preview
                        </button>
                        <button
                          onClick={() => {
                            setShowPreview(false);
                            if (selectedTemplate) {
                              handleEditTemplate(selectedTemplate);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm gap-2"
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                          Edit Template
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
