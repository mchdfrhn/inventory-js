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

const updateAssetCategorySchema = createAssetCategorySchema;

const createLocationSchema = Joi.object({
  code: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Location code is required',
    'string.max': 'Location code must be 50 characters or less',
    'any.required': 'Location code is required',
  }),
  name: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Location name is required',
    'string.max': 'Location name must be 255 characters or less',
    'any.required': 'Location name is required',
  }),
  description: Joi.string().trim().allow('').optional(),
  building: Joi.string().trim().max(255).allow('').optional(),
  floor: Joi.string().trim().max(50).allow('').optional(),
  room: Joi.string().trim().max(100).allow('').optional(),
});

const updateLocationSchema = createLocationSchema;

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
  umur_ekonomis_bulan: Joi.number().integer().min(0).max(11).default(0),
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

const updateAssetSchema = createAssetSchema.keys({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Asset ID must be a valid UUID',
    'any.required': 'Asset ID is required',
  }),
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
  umur_ekonomis_bulan: Joi.number().integer().min(0).max(11).optional(),
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
  assetFilterSchema,
  auditLogFilterSchema,
};
