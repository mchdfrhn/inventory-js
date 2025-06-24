import { useState, useEffect } from 'react';
import { DocumentTextIcon, EyeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { templateService, type ReportTemplate, defaultTemplates } from '../services/templateService';
import { useNotification } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';
import ReportPreview from '../components/ReportPreview';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockAssets = [
        {
          id: 1,
          kode: 'AST001',
          nama: 'Laptop Dell Inspiron',
          harga_perolehan: 15000000,
          nilai_sisa: 12000000,
          akumulasi_penyusutan: 3000000,
          status: 'baik'
        },
        {
          id: 2,
          kode: 'AST002',
          nama: 'Meja Kantor',
          harga_perolehan: 2500000,
          nilai_sisa: 2000000,
          akumulasi_penyusutan: 500000,
          status: 'baik'
        }
      ];
      
      const templatesData = [...defaultTemplates, ...templateService.getCustomTemplates()];
      
      setAssets(mockAssets);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Gagal memuat data');
      addNotification('error', 'Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateStats = () => {
    if (!assets.length) return {
      totalValue: 0,
      currentValue: 0,
      totalDepreciation: 0,
      statusCounts: { baik: 0, rusak: 0, hilang: 0 }
    };

    const totalValue = assets.reduce((sum: number, asset: any) => 
      sum + (asset.harga_perolehan || 0), 0
    );
    
    const currentValue = assets.reduce((sum: number, asset: any) => 
      sum + (asset.nilai_sisa || 0), 0
    );
    
    const totalDepreciation = assets.reduce((sum: number, asset: any) => 
      sum + (asset.akumulasi_penyusutan || 0), 0
    );

    const statusCounts = assets.reduce((counts: any, asset: any) => {
      const status = asset.status || 'baik';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, { baik: 0, rusak: 0, hilang: 0 });

    return { totalValue, currentValue, totalDepreciation, statusCounts };
  };

  const stats = calculateStats();
  const availableTemplates = templates;

  const generatePDF = async (template: ReportTemplate) => {
    try {
      setIsGenerating(true);
      addNotification('info', 'Sedang menyiapkan laporan PDF...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the backend
      addNotification('success', `Laporan "${template.name}" berhasil dibuat!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      addNotification('error', 'Gagal membuat laporan PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const setAsDefault = (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        addNotification('error', 'Template tidak ditemukan');
        return;
      }

      // Update templates
      const updatedTemplates = templates.map(t => ({
        ...t,
        isDefault: t.id === templateId
      }));
      
      setTemplates(updatedTemplates);
      addNotification('success', `Template "${template.name}" berhasil dijadikan default!`);
    } catch (error) {
      console.error('Error setting default template:', error);
      addNotification('error', 'Gagal mengatur template default');
    }
  };

  const handlePreview = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <div className="p-8">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <GradientButton variant="primary" onClick={loadData}>
              Coba Lagi
            </GradientButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <GlassCard className="overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Laporan Aset
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Generate laporan PDF dengan template yang dapat disesuaikan
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Aset</div>
              <div className="text-2xl font-bold text-gray-900">{assets.length}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-white/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Total Nilai Perolehan</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(stats.totalValue)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Nilai Saat Ini</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(stats.currentValue)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Total Penyusutan</div>
              <div className="text-lg font-semibold text-orange-600">
                {formatCurrency(stats.totalDepreciation)}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="text-sm text-gray-500">Aset Baik</div>
              <div className="text-lg font-semibold text-blue-600">
                {stats.statusCounts.baik || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Management */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Management</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Kelola template laporan untuk berbagai kebutuhan
                </p>
                <GradientButton
                  variant="secondary"
                  onClick={() => navigate('/template-management')}
                  className="w-full"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Kelola Template
                </GradientButton>
              </div>
            </div>

            {/* Available Templates */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Template Tersedia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border flex flex-col min-h-[200px]"
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4 flex-grow">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {template.name}
                            {template.isDefault && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {template.description}
                          </p>
                          <div className="text-xs text-gray-400">
                            {template.columns.length} kolom
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Preview
                          </button>
                          <button
                            onClick={() => generatePDF(template)}
                            disabled={isGenerating}
                            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                          >
                            Generate PDF
                          </button>
                        </div>
                        
                        {!template.isDefault && (
                          <button
                            onClick={() => setAsDefault(template.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="text-lg font-medium">Preview: {selectedTemplate.name}</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ReportPreview 
                  assets={assets} 
                  template={selectedTemplate}
                />
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ReportsPage;
