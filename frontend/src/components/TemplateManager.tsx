import { useState, useEffect } from 'react';
import { BookmarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

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
  isCustom?: boolean;
  createdAt?: string;
}

interface TemplateManagerProps {
  onSelectTemplate: (template: ReportTemplate) => void;
  currentTemplate: ReportTemplate;
}

const STORAGE_KEY = 'sttpu_report_templates';

export default function TemplateManager({ onSelectTemplate, currentTemplate }: TemplateManagerProps) {
  const [savedTemplates, setSavedTemplates] = useState<ReportTemplate[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) return;

    const newTemplate: ReportTemplate = {
      ...currentTemplate,
      id: `custom_${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim(),
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    
    setShowSaveDialog(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  const deleteTemplate = (templateId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
      setSavedTemplates(updatedTemplates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    }
  };

  const updateTemplate = (templateId: string) => {
    const updatedTemplates = savedTemplates.map(t => 
      t.id === templateId 
        ? { ...currentTemplate, id: templateId, name: t.name, description: t.description, isCustom: true }
        : t
    );
    setSavedTemplates(updatedTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <BookmarkIcon className="w-4 h-4 mr-2" />
          Template Tersimpan
        </h4>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Simpan Template
        </button>
      </div>

      {savedTemplates.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Belum ada template tersimpan
        </p>
      ) : (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {savedTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                <p className="text-xs text-gray-500">{template.description}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                    {template.columns.length} kolom
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                    {template.orientation}
                  </span>
                  {template.createdAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(template.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Gunakan template"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => updateTemplate(template.id)}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                  title="Update dengan pengaturan saat ini"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Hapus template"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Simpan Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Masukkan nama template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi (opsional)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Deskripsi template"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={saveTemplate}
                disabled={!templateName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
