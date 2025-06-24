/**
 * Template Management Service
 * Handles CRUD operations for report templates with localStorage persistence
 */

export interface ReportTemplate {
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
  isDefault?: boolean;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const defaultTemplates: ReportTemplate[] = [
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
    includeFilters: true,
    isDefault: true
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

export const columnOptions = [
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

const STORAGE_KEYS = {
  TEMPLATES: 'pdf_report_templates',
  DEFAULT_TEMPLATE: 'defaultPdfTemplate'
};

class TemplateService {
  // Event listeners for storage changes
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  private handleStorageChange(e: StorageEvent) {
    if (e.key === STORAGE_KEYS.TEMPLATES || e.key === STORAGE_KEYS.DEFAULT_TEMPLATE) {
      this.notifyListeners();
    }
  }

  // Subscribe to template changes
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // Get all templates (default + custom)
  getAllTemplates(): ReportTemplate[] {
    try {
      const customTemplates = this.getCustomTemplates();
      const defaultTemplateId = this.getDefaultTemplateId();
      
      const allTemplates = [...defaultTemplates, ...customTemplates];
      
      // Mark default template
      return allTemplates.map(template => ({
        ...template,
        isDefault: template.id === defaultTemplateId
      }));
    } catch (error) {
      console.error('Error loading templates:', error);
      return defaultTemplates;
    }
  }

  // Get custom templates only
  getCustomTemplates(): ReportTemplate[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading custom templates:', error);
      return [];
    }
  }

  // Save template (create or update)
  saveTemplate(template: ReportTemplate): boolean {
    try {
      const customTemplates = this.getCustomTemplates();
      const now = new Date().toISOString();
      
      // Prepare template with metadata
      const templateToSave: ReportTemplate = {
        ...template,
        isCustom: true,
        updatedAt: now,
        createdAt: template.createdAt || now
      };

      const existingIndex = customTemplates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        // Update existing
        customTemplates[existingIndex] = templateToSave;
      } else {
        // Create new
        if (!template.id.startsWith('custom_')) {
          templateToSave.id = `custom_${Date.now()}`;
        }
        customTemplates.push(templateToSave);
      }

      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(customTemplates));
      this.dispatchStorageEvent(STORAGE_KEYS.TEMPLATES, customTemplates);
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      return false;
    }
  }

  // Delete template
  deleteTemplate(templateId: string): boolean {
    try {
      // Prevent deleting default templates
      if (defaultTemplates.find(t => t.id === templateId)) {
        console.warn('Cannot delete default template');
        return false;
      }

      const customTemplates = this.getCustomTemplates();
      const filteredTemplates = customTemplates.filter(t => t.id !== templateId);
      
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filteredTemplates));
      this.dispatchStorageEvent(STORAGE_KEYS.TEMPLATES, filteredTemplates);
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  // Set default template
  setDefaultTemplate(templateId: string): boolean {
    try {
      const allTemplates = this.getAllTemplates();
      const template = allTemplates.find(t => t.id === templateId);
      
      if (!template) {
        console.error('Template not found:', templateId);
        return false;
      }

      localStorage.setItem(STORAGE_KEYS.DEFAULT_TEMPLATE, JSON.stringify(template));
      this.dispatchStorageEvent(STORAGE_KEYS.DEFAULT_TEMPLATE, template);
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Error setting default template:', error);
      return false;
    }
  }

  // Get default template ID
  getDefaultTemplateId(): string | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEFAULT_TEMPLATE);
      if (saved) {
        const template = JSON.parse(saved);
        return template.id;
      }
      return defaultTemplates[0]?.id || null;
    } catch (error) {
      console.error('Error getting default template:', error);
      return defaultTemplates[0]?.id || null;
    }
  }

  // Get default template object
  getDefaultTemplate(): ReportTemplate | null {
    try {
      const defaultId = this.getDefaultTemplateId();
      const allTemplates = this.getAllTemplates();
      return allTemplates.find(t => t.id === defaultId) || allTemplates[0] || null;
    } catch (error) {
      console.error('Error getting default template:', error);
      return defaultTemplates[0] || null;
    }
  }

  // Dispatch custom storage event for same-window communication
  private dispatchStorageEvent(key: string, value: any) {
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(value)
    }));
  }

  // Validate template
  validateTemplate(template: Partial<ReportTemplate>): string[] {
    const errors: string[] = [];

    if (!template.name?.trim()) {
      errors.push('Nama template wajib diisi');
    }

    if (!template.columns || template.columns.length === 0) {
      errors.push('Minimal satu kolom harus dipilih');
    }

    if (template.fontSize && (template.fontSize < 8 || template.fontSize > 16)) {
      errors.push('Ukuran font harus antara 8-16px');
    }

    if (template.headerColor && !/^#[0-9A-F]{6}$/i.test(template.headerColor)) {
      errors.push('Warna header harus dalam format hex yang valid');
    }

    return errors;
  }

  // Create new template with default values
  createNewTemplate(): ReportTemplate {
    return {
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
      includeFilters: true,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const templateService = new TemplateService();
export default templateService;
