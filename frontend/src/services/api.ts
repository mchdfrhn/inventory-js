import axios from 'axios';

// Temporarily adjust for local testing
const API_URL = 'http://localhost:8080/api/v1';

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
  (error) => {    // Handle common error scenarios
    const errorResponse = {
      message: 'Terjadi kesalahan yang tidak terduga',
      status: 'error',
      code: 500,
    };
    
    if (error.response) {
      errorResponse.message = error.response.data.message || error.response.statusText;
      errorResponse.code = error.response.status;
    } else if (error.request) {
      errorResponse.message = 'Server tidak merespons',
      errorResponse.code = 0;
    }
      // Log error for debugging (remove in production)
    console.error('Kesalahan API:', errorResponse);
    
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
  category_id: string;
  // Only valid status values now
  status: 'baik' | 'rusak' | 'tidak_memadai';
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

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
  };
}

export const assetApi = {
  list: async (page = 1, pageSize = 10) => {
    const response = await api.get<PaginatedResponse<Asset>>(`/assets?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ status: string; message: string; data: Asset }>(`/assets/${id}`);
    return response.data;
  },

  create: async (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<{ status: string; message: string; data: Asset }>('/assets', asset);
    return response.data;
  },

  update: async (id: string, asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put<{ status: string; message: string; data: Asset }>(`/assets/${id}`, asset);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ status: string; message: string }>(`/assets/${id}`);
    return response.data;
  },

  getByCategory: async (categoryId: string) => {
    const response = await api.get<PaginatedResponse<Asset>>(`/assets?category_id=${categoryId}`);
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
    const response = await api.get<{ status: string; message: string; data: Category }>(`/categories/${id}`);
    return response.data;
  },
  
  create: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<{ status: string; message: string; data: Category }>('/categories', category);
    return response.data;
  },

  update: async (id: string, category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put<{ status: string; message: string; data: Category }>(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ status: string; message: string }>(`/categories/${id}`);
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
              asset_count: assetsResponse.data.pagination.total_items
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
    const response = await api.get<{ status: string; message: string; data: Location }>(`/locations/${id}`);
    return response.data;
  },

  create: async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<{ status: string; message: string; data: Location }>('/locations', location);
    return response.data;
  },

  update: async (id: number, location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put<{ status: string; message: string; data: Location }>(`/locations/${id}`, location);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ status: string; message: string }>(`/locations/${id}`);
    return response.data;
  },
  search: async (query: string, page = 1, pageSize = 10) => {
    // Server-side search with pagination
    const response = await api.get<PaginatedResponse<Location>>(
      `/locations?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // New method to get location data for display in assets
  getLocationForAsset: async (lokasiId: number | undefined) => {
    if (!lokasiId) {
      return null;
    }
    
    try {
      const response = await api.get<{ status: string; message: string; data: Location }>(`/locations/${lokasiId}`);
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
      const totalItems = countResponse.data.pagination.total_items;
      
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
          console.log(`Location ${location.name} (ID: ${location.id}) has ${count} assets`);
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
