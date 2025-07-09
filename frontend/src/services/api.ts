import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1'; // Use relative URL for proxy

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for handling token injection, etc.
api.interceptors.request.use(
  (config) => {
    // You can add token logic here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for common error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[API Error]', error);
    
    // Handle common error scenarios
    const errorResponse = {
      message: 'Terjadi kesalahan yang tidak terduga',
      status: 'error',
      code: 500,
    };
    
    if (error.response) {
      errorResponse.message = error.response.data.message || error.response.statusText;
      errorResponse.code = error.response.status;
    } else if (error.request) {
      errorResponse.message = 'Server tidak merespons';
      errorResponse.code = 0;
    }
    
    return Promise.reject(errorResponse);
  }
);

// Type definitions
export interface Asset {
  id: string;
  // New fields based on backend model
  kode: string;
  nama: string;
  spesifikasi: string;
  quantity: number;
  satuan: string;
  tanggal_perolehan: string;
  harga_perolehan: number;
  umur_ekonomis_tahun: number;
  umur_ekonomis_bulan: number;
  akumulasi_penyusutan: number;
  nilai_sisa: number;
  keterangan: string;
  lokasi: string;                  // Text description of location (legacy)
  asal_pengadaan: string;          // New: procurement source
  lokasi_id?: number;              // New: reference to Location model
  location_info?: Location;        // New: linked location object
  category_id: string;  // Only valid status values now
  status: 'baik' | 'rusak' | 'tidak_memadai';
  // Bulk asset fields
  bulk_id?: string;
  bulk_sequence?: number;
  is_bulk_parent?: boolean;
  bulk_total_count?: number;
  category?: {
    id: string;
    name: string;
    description: string;
  };
  
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  code: string;        // New field for category code
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  asset_count?: number; // New field for tracking asset count
}

export interface Location {
  id: number;
  name: string;
  code: string;
  description: string;
  building: string;
  floor: string;
  room: string;
  created_at: string;
  updated_at: string;
  asset_count?: number; // New field for tracking asset count
}

// New: AuditLog interface
export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changes?: any;
  old_values?: any;
  new_values?: any;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  description: string;
  created_at: string;
}

// Single resource response interface
export interface SingleResourceResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const assetApi = {
  list: async (page = 1, pageSize = 10) => {
    const response = await api.get<PaginatedResponse<Asset>>(`/assets?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<SingleResourceResponse<Asset>>(`/assets/${id}`);
    return response.data;
  },

  create: async (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<SingleResourceResponse<Asset>>('/assets', asset);
    return response.data;
  },

  update: async (id: string, asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put<SingleResourceResponse<Asset>>(`/assets/${id}`, asset);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<SingleResourceResponse<null>>(`/assets/${id}`);
    return response.data;
  },  // New: Delete bulk assets - menghapus semua asset dalam bulk
  deleteBulk: async (bulkId: string) => {
    if (!bulkId) {
      throw new Error('Bulk ID is required for bulk deletion');
    }
    const response = await api.delete<SingleResourceResponse<null>>(`/assets/bulk/${bulkId}`);
    return response.data;
  },

  getByCategory: async (categoryId: string) => {
    const response = await api.get<PaginatedResponse<Asset>>(`/assets?category_id=${categoryId}`);
    return response.data;
  },

  // New: Create bulk asset
  createBulk: async (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>, quantity: number) => {
    const response = await api.post<SingleResourceResponse<Asset[]>>('/assets/bulk', {
      ...asset,
      quantity
    });
    return response.data;
  },

  // New: Get bulk assets
  getBulkAssets: async (bulkId: string) => {
    const response = await api.get<SingleResourceResponse<Asset[]>>(`/assets/bulk/${bulkId}`);
    return response.data;
  },

  // New: List assets with bulk grouping
  listWithBulk: async (page = 1, pageSize = 25, categoryId?: string) => {
    let url = `/assets/with-bulk?page=${page}&page_size=${pageSize}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }
    const response = await api.get<PaginatedResponse<Asset>>(url);
    return response.data;
  },
};

export const categoryApi = {
  list: async (page = 1, pageSize = 10) => {
    const response = await api.get<PaginatedResponse<Category>>(`/categories?page=${page}&page_size=${pageSize}`);
    return response.data;
  },
  search: async (query: string, page = 1, pageSize = 10) => {
    // Server-side search with pagination
    const response = await api.get<PaginatedResponse<Category>>(
      `/categories?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<SingleResourceResponse<Category>>(`/categories/${id}`);
    return response.data;
  },
  
  create: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<SingleResourceResponse<Category>>('/categories', category);
    return response.data;
  },

  update: async (id: string, category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put<SingleResourceResponse<Category>>(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<SingleResourceResponse<null>>(`/categories/${id}`);
    return response.data;
  },
    // New function to get categories with asset counts and proper pagination
  listWithAssetCounts: async (page = 1, pageSize = 10) => {
    try {
      // Get categories with server-side pagination
      const categoriesResponse = await api.get<PaginatedResponse<Category>>(`/categories?page=${page}&page_size=${pageSize}`);
      const categories = categoriesResponse.data.data;
      
      // For each category, get the assets count
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          try {
            // Get assets for this category
            const assetsResponse = await api.get<PaginatedResponse<Asset>>(`/assets?category_id=${category.id}`);
            // Add the count to the category
            return {
              ...category,
              asset_count: assetsResponse.data.pagination.total
            };
          } catch (error) {
            console.error(`Error fetching assets for category ${category.id}:`, error);
            return {
              ...category,
              asset_count: 0
            };
          }
        })
      );
      
      // Return the updated response with counts
      return {
        ...categoriesResponse.data,
        data: categoriesWithCounts
      };
    } catch (error) {
      console.error('Error fetching categories with asset counts:', error);
      throw error;
    }
  },
};

export const locationApi = {
  list: async (page = 1, pageSize = 10) => {
    const response = await api.get<PaginatedResponse<Location>>(`/locations?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<SingleResourceResponse<Location>>(`/locations/${id}`);
    return response.data;
  },

  create: async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<SingleResourceResponse<Location>>('/locations', location);
    return response.data;
  },

  update: async (id: number, location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put<SingleResourceResponse<Location>>(`/locations/${id}`, location);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<SingleResourceResponse<null>>(`/locations/${id}`);
    return response.data;
  },
  search: async (query: string, page = 1, pageSize = 10) => {
    // Server-side search with pagination
    const response = await api.get<PaginatedResponse<Location>>(
      `/locations/search?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  },

  // New method to get location data for display in assets
  getLocationForAsset: async (lokasiId: number | undefined) => {
    if (!lokasiId) {
      return null;
    }
    
    try {
      const response = await api.get<SingleResourceResponse<Location>>(`/locations/${lokasiId}`);
      return response.data.data;    } catch (error) {
      console.error("Error fetching location for asset:", error);
      return null;    }
  },
  
  // Function to get locations with asset counts
  listWithAssetCounts: async (page = 1, pageSize = 10) => {
    try {
      // Get locations with pagination
      const locationsResponse = await api.get<PaginatedResponse<Location>>(`/locations?page=${page}&page_size=${pageSize}`);
      const locations = locationsResponse.data.data;
      
      // The backend already supports pagination, so let's get just the locations from this page
      // Get count of assets first to determine how many to fetch
      const countResponse = await api.get<PaginatedResponse<Asset>>(`/assets?page=1&page_size=1`);
      const totalItems = countResponse.data.pagination.total;
      
      // Get assets for asset counts
      const assetsResponse = await api.get<PaginatedResponse<Asset>>(`/assets?page=1&page_size=${totalItems > 0 ? totalItems : 10}`);
      const allAssets = assetsResponse.data.data;
      
      console.log(`Total assets: ${totalItems}, fetched: ${allAssets.length}`);
      
      // Initialize a counter for each location
      const locationCounts = new Map<number, number>();
      locations.forEach(loc => {
        locationCounts.set(loc.id, 0);
      });
      
      // Count assets per location
      allAssets.forEach(asset => {
        if (asset.lokasi_id) {
          // Debug logging for BAAK and BAUK assets
          const locationName = locations.find(loc => loc.id === asset.lokasi_id)?.name;
          if (locationName && (locationName.includes('BAAK') || locationName.includes('BAUK'))) {
            console.log(`Asset ${asset.kode} (${asset.nama}) is assigned to location: ${locationName} (ID: ${asset.lokasi_id})`);
          }
          
          // Increment the count for this location
          const currentCount = locationCounts.get(asset.lokasi_id) || 0;
          locationCounts.set(asset.lokasi_id, currentCount + 1);
        }
      });
      
      // Add counts to locations
      const locationsWithCounts = locations.map(location => {
        const count = locationCounts.get(location.id) || 0;
        
        // Debug logging for BAAK and BAUK locations
        if (location.name.includes('BAAK') || location.name.includes('BAUK')) {
          console.log(`Location ${location.name} (D: ${location.id}) has ${count} assets`);
        }
        
        return {
          ...location,
          asset_count: count
        };
      });
      
      // Return the updated response with counts
      return {
        ...locationsResponse.data,
        data: locationsWithCounts
      };
    } catch (error) {
      console.error('Error fetching locations with asset counts:', error);
      throw error;
    }
  },
}

// Audit Log API
export const auditLogApi = {
  list: async (params?: {
    entity_type?: string;
    entity_id?: string;
    action?: string;
    user_id?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    page_size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.entity_type) queryParams.append('entity_type', params.entity_type);
      if (params.entity_id) queryParams.append('entity_id', params.entity_id);
      if (params.action) queryParams.append('action', params.action);
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.from_date) queryParams.append('from_date', params.from_date);
      if (params.to_date) queryParams.append('to_date', params.to_date);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    }
    
    const response = await api.get<PaginatedResponse<AuditLog>>(`/audit-logs?${queryParams.toString()}`);
    return response.data;
  },

  getEntityHistory: async (entityType: string, entityId: string) => {
    const response = await api.get<SingleResourceResponse<AuditLog[]>>(`/audit-logs/history/${entityType}/${entityId}`);
    return response.data;
  },
}
