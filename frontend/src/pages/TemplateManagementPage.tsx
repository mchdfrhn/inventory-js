import { useState, useEffect } from 'react';
import { DocumentTextIcon, Cog6ToothIcon, PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import ReportPreview from '../components/ReportPreview';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  includeHeader: boolean;
  includeFooter: boolean;
  includeStats: boolean;
  includeChart: boolean;
  columns: string[];
  headerColor: string;
  orientation: 'portrait' | 'landscape';
  fontSize: number;
  includeQRCode: boolean;
  includeFilters: boolean;
}

const defaultTemplates: ReportTemplate[] = [
  {
    id: 'standard',
    name: 'Laporan Standar',
    description: 'Laporan lengkap dengan semua informasi aset',
    includeHeader: true,
    includeFooter: true,
    includeStats: true,
    includeChart: false,
    columns: ['kode', 'nama', 'kategori', 'lokasi', 'status', 'harga_perolehan', 'nilai_sisa'],
    headerColor: '#2563eb',
    orientation: 'landscape',
    fontSize: 10,
    includeQRCode: false,
    includeFilters: true
  },
  {
    id: 'financial',
    name: 'Laporan Keuangan',
    description: 'Fokus pada aspek keuangan dan penyusutan aset',
    includeHeader: true,
    includeFooter: true,
    includeStats: true,
    includeChart: true,
    columns: ['kode', 'nama', 'harga_perolehan', 'akumulasi_penyusutan', 'nilai_sisa', 'umur_ekonomis'],
    headerColor: '#059669',
    orientation: 'landscape',
    fontSize: 10,
    includeQRCode: false,
    includeFilters: true
  },
  {
    id: 'inventory',
    name: 'Laporan Inventaris',
    description: 'Laporan sederhana untuk inventarisasi',
    includeHeader: true,
    includeFooter: false,
    includeStats: false,
    includeChart: false,
    columns: ['kode', 'nama', 'spesifikasi', 'quantity', 'lokasi', 'status'],
    headerColor: '#7c3aed',
    orientation: 'portrait',
    fontSize: 11,
    includeQRCode: true,
    includeFilters: false
  },
  {
    id: 'executive',
    name: 'Laporan Eksekutif',
    description: 'Ringkasan untuk pimpinan dengan visualisasi',
    includeHeader: true,
    includeFooter: true,
    includeStats: true,
    includeChart: true,
    columns: ['nama', 'kategori', 'nilai_sisa', 'status'],
    headerColor: '#dc2626',
    orientation: 'portrait',
    fontSize: 12,
    includeQRCode: false,
    includeFilters: true
  }
];

const columnOptions = [
  { id: 'kode', label: 'Kode Aset' },
  { id: 'nama', label: 'Nama Aset' },
  { id: 'spesifikasi', label: 'Spesifikasi' },
  { id: 'kategori', label: 'Kategori' },
  { id: 'quantity', label: 'Jumlah' },
  { id: 'lokasi', label: 'Lokasi' },
  { id: 'status', label: 'Status' },
  { id: 'harga_perolehan', label: 'Harga Perolehan' },
  { id: 'nilai_sisa', label: 'Nilai Sisa' },
  { id: 'akumulasi_penyusutan', label: 'Akumulasi Penyusutan' },
  { id: 'umur_ekonomis', label: 'Umur Ekonomis' },
  { id: 'tanggal_perolehan', label: 'Tanggal Perolehan' },
  { id: 'asal_pengadaan', label: 'Asal Pengadaan' }
];

// Sample assets for preview
const sampleAssets = [
  {
    id: 1,
    kode: 'AST001',
    nama: 'Laptop Dell Inspiron',
    spesifikasi: 'Intel i5, 8GB RAM, 256GB SSD',
    quantity: 1,
    satuan: 'unit',
    category: { name: 'Elektronik' },
    lokasi: 'Ruang IT',
    location_info: { name: 'Lab Komputer', building: 'Gedung A', floor: '2', room: 'A201' },
    status: 'baik',
    harga_perolehan: 15000000,
    nilai_sisa: 12000000,
    akumulasi_penyusutan: 3000000,
    umur_ekonomis_tahun: 5,
    tanggal_perolehan: '2023-01-15',
    asal_pengadaan: 'Hibah'
  },
  {
    id: 2,
    kode: 'AST002',
    nama: 'Meja Kantor',
    spesifikasi: 'Kayu jati, ukuran 120x60 cm',
    quantity: 5,
    satuan: 'unit',
    category: { name: 'Furniture' },
    lokasi: 'Ruang Dosen',
    location_info: { name: 'Ruang Dosen', building: 'Gedung B', floor: '1', room: 'B101' },
    status: 'baik',
    harga_perolehan: 2500000,
    nilai_sisa: 2000000,
    akumulasi_penyusutan: 500000,
    umur_ekonomis_tahun: 10,
    tanggal_perolehan: '2022-08-20',
    asal_pengadaan: 'Pembelian'
  }
];

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('pdfTemplates');
    if (savedTemplates) {
      const customTemplates = JSON.parse(savedTemplates);
      setTemplates([...defaultTemplates, ...customTemplates]);
    } else {
      setTemplates(defaultTemplates);
    }
  }, []);

  // Save custom templates to localStorage
  const saveCustomTemplates = (customTemplates: ReportTemplate[]) => {
    localStorage.setItem('pdfTemplates', JSON.stringify(customTemplates));
  };

  const handleCreateTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: `custom_${Date.now()}`,
      name: 'Template Baru',
      description: 'Deskripsi template',
      includeHeader: true,
      includeFooter: true,
      includeStats: true,
      includeChart: false,
      columns: ['kode', 'nama', 'kategori', 'status'],
      headerColor: '#2563eb',
      orientation: 'portrait',
      fontSize: 12,
      includeQRCode: false,
      includeFilters: true
    };
    setEditingTemplate(newTemplate);
    setShowCreateModal(true);
  };

  const handleSaveTemplate = (template: ReportTemplate) => {
    const isCustomTemplate = !defaultTemplates.find(t => t.id === template.id);
    
    if (isCustomTemplate) {
      const customTemplates = templates.filter(t => !defaultTemplates.find(dt => dt.id === t.id));
      const existingIndex = customTemplates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        customTemplates[existingIndex] = template;
      } else {
        customTemplates.push(template);
      }
      
      saveCustomTemplates(customTemplates);
      setTemplates([...defaultTemplates, ...customTemplates]);
    }
    
    setShowCreateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (defaultTemplates.find(t => t.id === templateId)) {
      alert('Template default tidak dapat dihapus');
      return;
    }

    if (confirm('Yakin ingin menghapus template ini?')) {
      const customTemplates = templates.filter(t => !defaultTemplates.find(dt => dt.id === t.id) && t.id !== templateId);
      saveCustomTemplates(customTemplates);
      setTemplates([...defaultTemplates, ...customTemplates]);
    }
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setEditingTemplate({ ...template });
    setShowCreateModal(true);
  };

  const handleSetDefaultTemplate = (template: ReportTemplate) => {
    localStorage.setItem('defaultPdfTemplate', JSON.stringify(template));
    alert(`Template "${template.name}" telah ditetapkan sebagai default`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-600" />
                Manajemen Template Laporan
              </h1>
              <p className="mt-2 text-gray-600">
                Kelola template laporan PDF untuk berbagai kebutuhan pelaporan aset
              </p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Buat Template</span>
            </button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {defaultTemplates.find(t => t.id === template.id) && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {template.orientation === 'portrait' ? '📄 Portrait' : '📑 Landscape'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    📊 {template.columns.length} kolom
                  </span>
                  {template.includeStats && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">📈 Statistik</span>
                  )}
                  {template.includeChart && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">📊 Grafik</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      title="Preview"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="text-gray-500 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                    {!defaultTemplates.find(t => t.id === template.id) && (
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleSetDefaultTemplate(template)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    Set Default
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Template Modal */}
        {showCreateModal && editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      {editingTemplate.id.startsWith('custom_') ? 'Buat Template Baru' : 'Edit Template'}
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                  <div className="p-6 space-y-6">
                    {/* Basic Settings */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Pengaturan Dasar</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Template
                          </label>
                          <input
                            type="text"
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Masukkan nama template"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orientasi Halaman
                          </label>
                          <select
                            value={editingTemplate.orientation}
                            onChange={(e) => setEditingTemplate(prev => prev ? { 
                              ...prev, 
                              orientation: e.target.value as 'portrait' | 'landscape' 
                            } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="portrait">📄 Portrait (Tegak)</option>
                            <option value="landscape">📑 Landscape (Mendatar)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ukuran Font
                          </label>
                          <select
                            value={editingTemplate.fontSize}
                            onChange={(e) => setEditingTemplate(prev => prev ? { 
                              ...prev, 
                              fontSize: parseInt(e.target.value) 
                            } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={10}>10pt (Kecil)</option>
                            <option value={11}>11pt (Sedang)</option>
                            <option value={12}>12pt (Normal)</option>
                            <option value={14}>14pt (Besar)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Warna Header
                          </label>
                          <input
                            type="color"
                            value={editingTemplate.headerColor}
                            onChange={(e) => setEditingTemplate(prev => prev ? { 
                              ...prev, 
                              headerColor: e.target.value 
                            } : null)}
                            className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deskripsi
                        </label>
                        <textarea
                          value={editingTemplate.description}
                          onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, description: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Deskripsi template"
                        />
                      </div>
                    </div>

                    {/* Report Options */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Opsi Laporan</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { key: 'includeHeader', label: 'Header & Logo', icon: '📋' },
                          { key: 'includeFooter', label: 'Footer & Info', icon: '📄' },
                          { key: 'includeStats', label: 'Statistik', icon: '📈' },
                          { key: 'includeChart', label: 'Grafik', icon: '📊' },
                          { key: 'includeQRCode', label: 'QR Code', icon: '📱' },
                          { key: 'includeFilters', label: 'Info Filter', icon: '🔍' }
                        ].map(({ key, label, icon }) => (
                          <label key={key} className="flex items-center p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingTemplate[key as keyof ReportTemplate] as boolean}
                              onChange={(e) => setEditingTemplate(prev => prev ? { 
                                ...prev, 
                                [key]: e.target.checked 
                              } : null)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                            />
                            <span className="mr-2">{icon}</span>
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Column Selection */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Kolom yang Ditampilkan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Dipilih: {editingTemplate.columns.length} dari {columnOptions.length} kolom
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-white border-t px-6 py-4">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleSaveTemplate(editingTemplate)}
                      disabled={!editingTemplate.name || editingTemplate.columns.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Simpan Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      Preview: {selectedTemplate.name}
                    </h2>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <ReportPreview 
                    assets={sampleAssets as any} 
                    template={selectedTemplate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
