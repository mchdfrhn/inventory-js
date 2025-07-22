const express = require('express');
const multer = require('multer');
const path = require('path');
const AssetCategoryController = require('../controllers/AssetCategoryController');
const validate = require('../middlewares/validate');
const {
  createAssetCategorySchema,
  updateAssetCategorySchema,
  paginationSchema,
} = require('../validations/schemas');

const router = express.Router();
const categoryController = new AssetCategoryController();

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

// Create category
router.post(
  '/',
  validate(createAssetCategorySchema),
  categoryController.createCategory.bind(categoryController),
);

// Update category
router.put(
  '/:id',
  validate(updateAssetCategorySchema),
  categoryController.updateCategory.bind(categoryController),
);

// Delete category
router.delete(
  '/:id',
  categoryController.deleteCategory.bind(categoryController),
);

// Get category by ID
router.get(
  '/:id',
  categoryController.getCategory.bind(categoryController),
);

// Get category by code
router.get(
  '/code/:code',
  categoryController.getCategoryByCode.bind(categoryController),
);

// List categories (with optional pagination)
router.get(
  '/',
  validate(paginationSchema, 'query'),
  categoryController.listCategories.bind(categoryController),
);

// Import categories from CSV
router.post(
  '/import',
  upload.single('file'),
  categoryController.importCategories.bind(categoryController),
);

module.exports = router;
