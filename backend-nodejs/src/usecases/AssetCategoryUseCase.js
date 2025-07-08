const AssetCategoryRepository = require('../repositories/AssetCategoryRepository');
const AuditLogUseCase = require('./AuditLogUseCase');
const logger = require('../utils/logger');

class AssetCategoryUseCase {
  constructor() {
    this.categoryRepository = new AssetCategoryRepository();
    this.auditLogUseCase = new AuditLogUseCase();
  }

  async createCategory(categoryData, metadata = {}) {
    try {
      // Validate required fields
      this.validateCategoryData(categoryData);

      // Check if code already exists
      const codeExists = await this.categoryRepository.checkCodeExists(categoryData.code);
      if (codeExists) {
        throw new Error(`Category with code '${categoryData.code}' already exists`);
      }

      // Check if name already exists
      const nameExists = await this.categoryRepository.checkNameExists(categoryData.name);
      if (nameExists) {
        throw new Error(`Category with name '${categoryData.name}' already exists`);
      }

      // Create category
      const category = await this.categoryRepository.create(categoryData);

      // Log audit
      await this.auditLogUseCase.logCategoryCreated(category, metadata);

      return category;
    } catch (error) {
      logger.error('Error in createCategory usecase:', error);
      throw error;
    }
  }

  async updateCategory(id, categoryData, metadata = {}) {
    try {
      // Get existing category
      const existingCategory = await this.categoryRepository.getById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Validate required fields
      this.validateCategoryData(categoryData);

      // Check if code already exists (excluding current category)
      if (categoryData.code !== existingCategory.code) {
        const codeExists = await this.categoryRepository.checkCodeExists(categoryData.code, id);
        if (codeExists) {
          throw new Error(`Category with code '${categoryData.code}' already exists`);
        }
      }

      // Check if name already exists (excluding current category)
      if (categoryData.name !== existingCategory.name) {
        const nameExists = await this.categoryRepository.checkNameExists(categoryData.name, id);
        if (nameExists) {
          throw new Error(`Category with name '${categoryData.name}' already exists`);
        }
      }

      // Update category
      const updatedCategory = await this.categoryRepository.update(id, categoryData);

      // Log audit
      await this.auditLogUseCase.logCategoryUpdated(existingCategory, updatedCategory, metadata);

      return updatedCategory;
    } catch (error) {
      logger.error('Error in updateCategory usecase:', error);
      throw error;
    }
  }

  async deleteCategory(id, metadata = {}) {
    try {
      // Get existing category
      const existingCategory = await this.categoryRepository.getById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Check if category has associated assets
      if (existingCategory.assets && existingCategory.assets.length > 0) {
        throw new Error(`Cannot delete category '${existingCategory.name}' because it has ${existingCategory.assets.length} associated assets`);
      }

      // Delete category
      await this.categoryRepository.delete(id);

      // Log audit
      await this.auditLogUseCase.logCategoryDeleted(existingCategory, metadata);

      return true;
    } catch (error) {
      logger.error('Error in deleteCategory usecase:', error);
      throw error;
    }
  }

  async getCategory(id) {
    try {
      const category = await this.categoryRepository.getById(id);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      logger.error('Error in getCategory usecase:', error);
      throw error;
    }
  }

  async getCategoryByCode(code) {
    try {
      const category = await this.categoryRepository.getByCode(code);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      logger.error('Error in getCategoryByCode usecase:', error);
      throw error;
    }
  }

  async listCategories() {
    try {
      const categories = await this.categoryRepository.list();
      return categories;
    } catch (error) {
      logger.error('Error in listCategories usecase:', error);
      throw error;
    }
  }

  async listCategoriesPaginated(page = 1, pageSize = 10, search = '') {
    try {
      const result = await this.categoryRepository.listPaginated(page, pageSize, search);
      return result;
    } catch (error) {
      logger.error('Error in listCategoriesPaginated usecase:', error);
      throw error;
    }
  }

  validateCategoryData(categoryData) {
    if (!categoryData.code || !categoryData.code.trim()) {
      throw new Error('Category code is required');
    }

    if (!categoryData.name || !categoryData.name.trim()) {
      throw new Error('Category name is required');
    }

    if (categoryData.code.length > 50) {
      throw new Error('Category code must be 50 characters or less');
    }

    if (categoryData.name.length > 255) {
      throw new Error('Category name must be 255 characters or less');
    }

    // Clean up data
    categoryData.code = categoryData.code.trim();
    categoryData.name = categoryData.name.trim();
    if (categoryData.description) {
      categoryData.description = categoryData.description.trim();
    }
  }
}

module.exports = AssetCategoryUseCase;
