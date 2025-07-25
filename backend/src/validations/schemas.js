const Joi = require('joi');

const createAssetCategorySchema = Joi.object({
  code: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Category code is required',
    'string.max': 'Category code must be 50 characters or less',
    'any.required': 'Category code is required',
  }),
  name: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Category name is required',
    'string.max': 'Category name must be 255 characters or less',
    'any.required': 'Category name is required',
  }),
  description: Joi.string().trim().allow('').optional(),
});

const updateAssetCategorySchema = Joi.object({
  code: Joi.string().trim().min(1).max(50).optional().messages({
    'string.empty': 'Category code cannot be empty',
    'string.max': 'Category code must be 50 characters or less',
  }),
  name: Joi.string().trim().min(1).max(255).optional().messages({
    'string.empty': 'Category name cannot be empty',
    'string.max': 'Category name must be 255 characters or less',
  }),
  description: Joi.string().trim().allow('').optional(),
});

const createLocationSchema = Joi.object({
  code: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Kode lokasi harus diisi',
    'string.min': 'Kode lokasi minimal 1 karakter',
    'string.max': 'Kode lokasi maksimal 50 karakter',
    'any.required': 'Kode lokasi harus diisi',
  }),
  name: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Nama lokasi harus diisi',
    'string.min': 'Nama lokasi minimal 1 karakter',
    'string.max': 'Nama lokasi maksimal 255 karakter',
    'any.required': 'Nama lokasi harus diisi',
  }),
  description: Joi.string().trim().allow('').optional().messages({
    'string.max': 'Deskripsi terlalu panjang',
  }),
  building: Joi.string().trim().max(255).allow('').optional().messages({
    'string.max': 'Nama gedung maksimal 255 karakter',
  }),
  floor: Joi.string().trim().max(50).allow('').optional().messages({
    'string.max': 'Lantai maksimal 50 karakter',
  }),
  room: Joi.string().trim().max(100).allow('').optional().messages({
    'string.max': 'Ruangan maksimal 100 karakter',
  }),
});

const updateLocationSchema = Joi.object({
  code: Joi.string().trim().min(1).max(50).optional().messages({
    'string.empty': 'Kode lokasi tidak boleh kosong',
    'string.min': 'Kode lokasi minimal 1 karakter',
    'string.max': 'Kode lokasi maksimal 50 karakter',
  }),
  name: Joi.string().trim().min(1).max(255).optional().messages({
    'string.empty': 'Nama lokasi tidak boleh kosong',
    'string.min': 'Nama lokasi minimal 1 karakter',
    'string.max': 'Nama lokasi maksimal 255 karakter',
  }),
  description: Joi.string().trim().allow('').optional().messages({
    'string.max': 'Deskripsi terlalu panjang',
  }),
  building: Joi.string().trim().max(255).allow('').optional().messages({
    'string.max': 'Nama gedung maksimal 255 karakter',
  }),
  floor: Joi.string().trim().max(50).allow('').optional().messages({
    'string.max': 'Lantai maksimal 50 karakter',
  }),
  room: Joi.string().trim().max(100).allow('').optional().messages({
    'string.max': 'Ruangan maksimal 100 karakter',
  }),
});

const createAssetSchema = Joi.object({
  kode: Joi.string().trim().min(1).max(50).optional().messages({
    'string.empty': 'Asset code is required',
    'string.max': 'Asset code must be 50 characters or less',
  }),
  nama: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Asset name is required',
    'string.max': 'Asset name must be 255 characters or less',
    'any.required': 'Asset name is required',
  }),
  spesifikasi: Joi.string().trim().allow('').optional(),
  quantity: Joi.number().integer().min(0).default(1),
  satuan: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Unit is required',
    'string.max': 'Unit must be 50 characters or less',
    'any.required': 'Unit is required',
  }),
  tanggal_perolehan: Joi.date().required().messages({
    'date.base': 'Acquisition date must be a valid date',
    'any.required': 'Acquisition date is required',
  }),
  harga_perolehan: Joi.number().min(0).required().messages({
    'number.min': 'Acquisition price must be greater than or equal to 0',
    'any.required': 'Acquisition price is required',
  }),
  umur_ekonomis_tahun: Joi.number().integer().min(0).default(0),
  umur_ekonomis_bulan: Joi.number().integer().min(0).max(600).default(0), // Allow total months (0-600 = 0-50 years)
  akumulasi_penyusutan: Joi.number().min(0).default(0),
  nilai_sisa: Joi.number().min(0).default(0),
  keterangan: Joi.string().trim().allow('').optional(),
  lokasi: Joi.string().trim().max(255).allow('').optional(),
  lokasi_id: Joi.number().integer().positive().required().messages({
    'number.positive': 'Location ID must be a positive number',
    'any.required': 'Location ID is required',
  }),
  asal_pengadaan: Joi.string().trim().max(255).required().messages({
    'string.empty': 'Asal pengadaan is required',
    'any.required': 'Asal pengadaan is required',
  }),
  category_id: Joi.string().uuid().required().messages({
    'string.guid': 'Category ID must be a valid UUID',
    'any.required': 'Category ID is required',
  }),
  status: Joi.string().valid('baik', 'rusak', 'tidak_memadai').default('baik'),
});

const updateAssetSchema = Joi.object({
  // All fields are optional for update, except for basic validation rules
  kode: Joi.string().trim().min(1).max(50).optional().messages({
    'string.empty': 'Asset code cannot be empty',
    'string.max': 'Asset code must be 50 characters or less',
  }),
  nama: Joi.string().trim().min(1).max(255).optional().messages({
    'string.empty': 'Asset name cannot be empty',
    'string.max': 'Asset name must be 255 characters or less',
  }),
  spesifikasi: Joi.string().trim().allow('').optional(),
  quantity: Joi.number().integer().min(0).optional(),
  satuan: Joi.string().trim().min(1).max(50).optional().messages({
    'string.empty': 'Unit cannot be empty',
    'string.max': 'Unit must be 50 characters or less',
  }),
  tanggal_perolehan: Joi.date().optional().messages({
    'date.base': 'Acquisition date must be a valid date',
  }),
  harga_perolehan: Joi.number().min(0).optional().messages({
    'number.min': 'Acquisition price must be greater than or equal to 0',
  }),
  umur_ekonomis_tahun: Joi.number().integer().min(0).optional(),
  umur_ekonomis_bulan: Joi.number().integer().min(0).max(600).optional(), // Allow total months
  akumulasi_penyusutan: Joi.number().min(0).optional(),
  nilai_sisa: Joi.number().min(0).optional(),
  keterangan: Joi.string().trim().allow('').optional(),
  lokasi: Joi.string().trim().max(255).allow('').optional(),
  lokasi_id: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Location ID must be a positive number',
  }),
  asal_pengadaan: Joi.string().trim().max(255).optional().messages({
    'string.empty': 'Asal pengadaan cannot be empty',
  }),
  category_id: Joi.string().uuid().optional().messages({
    'string.guid': 'Category ID must be a valid UUID',
  }),
  status: Joi.string().valid('baik', 'rusak', 'tidak_memadai').optional(),
});

const createBulkAssetSchema = createAssetSchema.keys({
  quantity: Joi.number().integer().min(1).max(1000).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 1000',
    'any.required': 'Quantity is required',
  }),
});

const bulkUpdateAssetSchema = Joi.object({
  nama: Joi.string().trim().min(1).max(255).optional(),
  spesifikasi: Joi.string().trim().allow('').optional(),
  satuan: Joi.string().trim().min(1).max(50).optional(),
  tanggal_perolehan: Joi.date().max('now').optional(),
  harga_perolehan: Joi.number().min(0).optional(),
  umur_ekonomis_tahun: Joi.number().integer().min(0).optional(),
  umur_ekonomis_bulan: Joi.number().integer().min(0).max(600).optional(), // Allow total months
  akumulasi_penyusutan: Joi.number().min(0).optional(),
  nilai_sisa: Joi.number().min(0).optional(),
  keterangan: Joi.string().trim().allow('').optional(),
  lokasi: Joi.string().trim().max(255).allow('').optional(),
  lokasi_id: Joi.number().integer().positive().optional(),
  asal_pengadaan: Joi.string().trim().max(255).allow('').optional(),
  category_id: Joi.string().uuid().optional(),
  status: Joi.string().valid('baik', 'rusak', 'tidak_memadai').optional(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').optional(),
});

const searchLocationSchema = Joi.object({
  query: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Search query is required',
    'any.required': 'Search query is required',
  }),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});

const assetFilterSchema = paginationSchema.keys({
  category_id: Joi.string().uuid().optional(),
  lokasi_id: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('baik', 'rusak', 'tidak_memadai').optional(),
  from_date: Joi.date().optional(),
  to_date: Joi.date().min(Joi.ref('from_date')).optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(Joi.ref('min_price')).optional(),
  bulk_id: Joi.string().uuid().optional(),
  is_bulk_parent: Joi.boolean().optional(),
});

const auditLogFilterSchema = paginationSchema.keys({
  entity_type: Joi.string().valid('asset', 'category', 'location').optional(),
  entity_id: Joi.string().uuid().optional(),
  action: Joi.string().valid('create', 'update', 'delete').optional(),
  user_id: Joi.string().optional(),
  from_date: Joi.date().optional(),
  to_date: Joi.date().min(Joi.ref('from_date')).optional(),
});

module.exports = {
  createAssetCategorySchema,
  updateAssetCategorySchema,
  createLocationSchema,
  updateLocationSchema,
  createAssetSchema,
  updateAssetSchema,
  createBulkAssetSchema,
  bulkUpdateAssetSchema,
  paginationSchema,
  searchLocationSchema,
  assetFilterSchema,
  auditLogFilterSchema,
};
