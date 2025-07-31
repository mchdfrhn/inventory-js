const express = require('express');
const multer = require('multer');
const path = require('path');
const AssetController = require('../controllers/AssetController');
const validate = require('../middlewares/validate');
const {
  createAssetSchema,
  updateAssetSchema,
  createBulkAssetSchema,
  bulkUpdateAssetSchema,
  assetFilterSchema,
} = require('../validations/schemas');

const router = express.Router();
const assetController = new AssetController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create single asset
router.post(
  '/',
  validate(createAssetSchema),
  assetController.createAsset.bind(assetController),
);

// Create bulk assets
router.post(
  '/bulk',
  validate(createBulkAssetSchema),
  assetController.createBulkAsset.bind(assetController),
);

// Update single asset
router.put(
  '/:id',
  validate(updateAssetSchema),
  assetController.updateAsset.bind(assetController),
);

// Update bulk assets
router.put(
  '/bulk/:bulk_id',
  validate(bulkUpdateAssetSchema),
  assetController.updateBulkAssets.bind(assetController),
);

// Delete single asset
router.delete(
  '/:id',
  assetController.deleteAsset.bind(assetController),
);

// Delete bulk assets
router.delete(
  '/bulk/:bulk_id',
  assetController.deleteBulkAssets.bind(assetController),
);

// List assets with bulk view
router.get(
  '/with-bulk',
  validate(assetFilterSchema, 'query'),
  assetController.listAssetsWithBulk.bind(assetController),
);

// Export assets to CSV (must be before /:id route)
router.get(
  '/export',
  assetController.exportAssets.bind(assetController),
);

// Import assets from CSV
router.post(
  '/import',
  upload.single('file'),
  assetController.importAssets.bind(assetController),
);

// Get single asset
router.get(
  '/:id',
  assetController.getAsset.bind(assetController),
);

// Get bulk assets
router.get(
  '/bulk/:bulk_id',
  assetController.getBulkAssets.bind(assetController),
);

// List assets (with filtering and pagination)
router.get(
  '/',
  validate(assetFilterSchema, 'query'),
  assetController.listAssets.bind(assetController),
);

module.exports = router;
