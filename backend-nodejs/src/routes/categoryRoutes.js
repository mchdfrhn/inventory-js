const express = require('express');
const AssetCategoryController = require('../controllers/AssetCategoryController');
const validate = require('../middlewares/validate');
const {
  createAssetCategorySchema,
  updateAssetCategorySchema,
  paginationSchema,
} = require('../validations/schemas');

const router = express.Router();
const categoryController = new AssetCategoryController();

// Create category
router.post(
  '/',
  validate(createAssetCategorySchema),
  categoryController.createCategory.bind(categoryController)
);

// Update category
router.put(
  '/:id',
  validate(updateAssetCategorySchema),
  categoryController.updateCategory.bind(categoryController)
);

// Delete category
router.delete(
  '/:id',
  categoryController.deleteCategory.bind(categoryController)
);

// Get category by ID
router.get(
  '/:id',
  categoryController.getCategory.bind(categoryController)
);

// Get category by code
router.get(
  '/code/:code',
  categoryController.getCategoryByCode.bind(categoryController)
);

// List categories (with optional pagination)
router.get(
  '/',
  validate(paginationSchema, 'query'),
  categoryController.listCategories.bind(categoryController)
);

module.exports = router;
