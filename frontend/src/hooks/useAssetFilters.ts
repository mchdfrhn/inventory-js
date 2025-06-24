import { useState, useMemo } from 'react';

interface FilterOptions {
  // Text filters
  searchText: string;
  kode: string;
  nama: string;
  spesifikasi: string;
  
  // Category filters
  categories: string[];
  
  // Location filters
  locations: string[];
  buildings: string[];
  floors: string[];
  
  // Status filters
  statuses: string[];
  
  // Date filters
  dateFrom: string;
  dateTo: string;
  
  // Financial filters
  priceMin: number | null;
  priceMax: number | null;
  valueMin: number | null;
  valueMax: number | null;
  
  // Condition filters
  conditions: string[];
  
  // Source filters
  sources: string[];
  
  // Age filters
  ageMin: number | null;
  ageMax: number | null;
}

interface Asset {
  id: number;
  kode: string;
  nama: string;
  spesifikasi?: string;
  category?: { name: string };
  lokasi?: string;
  location_info?: {
    name?: string;
    building?: string;
    floor?: string;
    room?: string;
  };
  status: string;
  harga_perolehan: number;
  nilai_sisa: number;
  akumulasi_penyusutan?: number;
  tanggal_perolehan?: string;
  asal_pengadaan?: string;
  umur_ekonomis_tahun?: number;
}

const initialFilters: FilterOptions = {
  searchText: '',
  kode: '',
  nama: '',
  spesifikasi: '',
  categories: [],
  locations: [],
  buildings: [],
  floors: [],
  statuses: [],
  dateFrom: '',
  dateTo: '',
  priceMin: null,
  priceMax: null,
  valueMin: null,
  valueMax: null,
  conditions: [],
  sources: [],
  ageMin: null,
  ageMax: null,
};

export const useAssetFilters = (assets: Asset[]) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(assets.map(asset => asset.category?.name).filter(Boolean))] as string[];
    const locations = [...new Set(assets.map(asset => asset.lokasi).filter(Boolean))] as string[];
    const buildings = [...new Set(assets.map(asset => asset.location_info?.building).filter(Boolean))] as string[];
    const floors = [...new Set(assets.map(asset => asset.location_info?.floor).filter(Boolean))] as string[];
    const statuses = [...new Set(assets.map(asset => asset.status).filter(Boolean))] as string[];
    const sources = [...new Set(assets.map(asset => asset.asal_pengadaan).filter(Boolean))] as string[];

    return {
      categories: categories.sort(),
      locations: locations.sort(),
      buildings: buildings.sort(),
      floors: floors.sort(),
      statuses: statuses.sort(),
      sources: sources.sort(),
    };
  }, [assets]);

  // Calculate asset age
  const calculateAge = (dateString?: string): number => {
    if (!dateString) return 0;
    const acquisitionDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - acquisitionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 365);
  };

  // Filter assets based on current filters
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Text search filter (global search)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const searchMatch = 
          asset.kode.toLowerCase().includes(searchLower) ||
          asset.nama.toLowerCase().includes(searchLower) ||
          (asset.spesifikasi && asset.spesifikasi.toLowerCase().includes(searchLower)) ||
          (asset.category?.name && asset.category.name.toLowerCase().includes(searchLower)) ||
          (asset.lokasi && asset.lokasi.toLowerCase().includes(searchLower));
        
        if (!searchMatch) return false;
      }

      // Specific text filters
      if (filters.kode && !asset.kode.toLowerCase().includes(filters.kode.toLowerCase())) {
        return false;
      }

      if (filters.nama && !asset.nama.toLowerCase().includes(filters.nama.toLowerCase())) {
        return false;
      }

      if (filters.spesifikasi && asset.spesifikasi && 
          !asset.spesifikasi.toLowerCase().includes(filters.spesifikasi.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && asset.category?.name && 
          !filters.categories.includes(asset.category.name)) {
        return false;
      }

      // Location filters
      if (filters.locations.length > 0 && asset.lokasi && 
          !filters.locations.includes(asset.lokasi)) {
        return false;
      }

      if (filters.buildings.length > 0 && asset.location_info?.building && 
          !filters.buildings.includes(asset.location_info.building)) {
        return false;
      }

      if (filters.floors.length > 0 && asset.location_info?.floor && 
          !filters.floors.includes(asset.location_info.floor)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(asset.status)) {
        return false;
      }

      // Source filter
      if (filters.sources.length > 0 && asset.asal_pengadaan && 
          !filters.sources.includes(asset.asal_pengadaan)) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && asset.tanggal_perolehan) {
        const assetDate = new Date(asset.tanggal_perolehan);
        const fromDate = new Date(filters.dateFrom);
        if (assetDate < fromDate) return false;
      }

      if (filters.dateTo && asset.tanggal_perolehan) {
        const assetDate = new Date(asset.tanggal_perolehan);
        const toDate = new Date(filters.dateTo);
        if (assetDate > toDate) return false;
      }

      // Price range filter
      if (filters.priceMin !== null && asset.harga_perolehan < filters.priceMin) {
        return false;
      }

      if (filters.priceMax !== null && asset.harga_perolehan > filters.priceMax) {
        return false;
      }

      // Value range filter
      if (filters.valueMin !== null && asset.nilai_sisa < filters.valueMin) {
        return false;
      }

      if (filters.valueMax !== null && asset.nilai_sisa > filters.valueMax) {
        return false;
      }

      // Age range filter
      if (filters.ageMin !== null || filters.ageMax !== null) {
        const age = calculateAge(asset.tanggal_perolehan);
        
        if (filters.ageMin !== null && age < filters.ageMin) {
          return false;
        }

        if (filters.ageMax !== null && age > filters.ageMax) {
          return false;
        }
      }

      return true;
    });
  }, [assets, filters]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = (): boolean => {
    return Boolean(
      filters.searchText ||
      filters.kode ||
      filters.nama ||
      filters.spesifikasi ||
      filters.categories.length > 0 ||
      filters.locations.length > 0 ||
      filters.buildings.length > 0 ||
      filters.floors.length > 0 ||
      filters.statuses.length > 0 ||
      filters.conditions.length > 0 ||
      filters.sources.length > 0 ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.priceMin !== null ||
      filters.priceMax !== null ||
      filters.valueMin !== null ||
      filters.valueMax !== null ||
      filters.ageMin !== null ||
      filters.ageMax !== null
    );
  };

  // Create filter summary for display in reports
  const getFilterSummary = () => {
    const summary: string[] = [];

    if (filters.searchText) {
      summary.push(`Pencarian: "${filters.searchText}"`);
    }

    if (filters.categories.length > 0) {
      summary.push(`Kategori: ${filters.categories.join(', ')}`);
    }

    if (filters.locations.length > 0) {
      summary.push(`Lokasi: ${filters.locations.join(', ')}`);
    }

    if (filters.statuses.length > 0) {
      summary.push(`Status: ${filters.statuses.join(', ')}`);
    }

    if (filters.dateFrom || filters.dateTo) {
      const fromStr = filters.dateFrom || 'Awal';
      const toStr = filters.dateTo || 'Akhir';
      summary.push(`Tanggal: ${fromStr} - ${toStr}`);
    }

    if (filters.priceMin !== null || filters.priceMax !== null) {
      const minStr = filters.priceMin !== null ? `Rp ${filters.priceMin.toLocaleString()}` : '0';
      const maxStr = filters.priceMax !== null ? `Rp ${filters.priceMax.toLocaleString()}` : '∞';
      summary.push(`Harga: ${minStr} - ${maxStr}`);
    }

    if (filters.ageMin !== null || filters.ageMax !== null) {
      const minStr = filters.ageMin !== null ? `${filters.ageMin}` : '0';
      const maxStr = filters.ageMax !== null ? `${filters.ageMax}` : '∞';
      summary.push(`Umur: ${minStr} - ${maxStr} tahun`);
    }

    return summary;
  };

  return {
    filters,
    filteredAssets,
    filterOptions,
    clearFilters,
    updateFilters,
    hasActiveFilters,
    getFilterSummary,
    totalAssets: assets.length,
    filteredCount: filteredAssets.length,
  };
};

export type { FilterOptions, Asset };
