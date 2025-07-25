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
      console.log('Creating category with data:', categoryData);

      // Validate required fields first (except code)
      if (!categoryData.name || !categoryData.name.trim()) {
        throw new Error('Nama kategori harus diisi');
      }

      // Generate automatic code if not provided
      if (!categoryData.code) {
        categoryData.code = await this.generateNextCategoryCode();
        console.log('Generated automatic code:', categoryData.code);
      }

      // Now validate all fields including generated code
      this.validateCategoryData(categoryData);

      // Check if code already exists
      const codeExists = await this.categoryRepository.checkCodeExists(categoryData.code);
      if (codeExists) {
        throw new Error(`Kode kategori '${categoryData.code}' sudah digunakan`);
      }

      // Check if name already exists
      const nameExists = await this.categoryRepository.checkNameExists(categoryData.name);
      if (nameExists) {
        throw new Error(`Nama kategori '${categoryData.name}' sudah digunakan`);
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
        throw new Error('Kategori tidak ditemukan');
      }

      // Validate required fields for update (only validate what is being changed)
      this.validateCategoryDataForUpdate(categoryData);

      // Check if code already exists (excluding current category)
      if (categoryData.code !== undefined && categoryData.code !== existingCategory.code) {
        const codeExists = await this.categoryRepository.checkCodeExists(categoryData.code, id);
        if (codeExists) {
          throw new Error(`Kode kategori '${categoryData.code}' sudah digunakan`);
        }
      }

      // Check if name already exists (excluding current category)
      if (categoryData.name !== undefined && categoryData.name !== existingCategory.name) {
        const nameExists = await this.categoryRepository.checkNameExists(categoryData.name, id);
        if (nameExists) {
          throw new Error(`Nama kategori '${categoryData.name}' sudah digunakan`);
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
        throw new Error('Kategori tidak ditemukan');
      }

      // Check if category has associated assets
      if (existingCategory.assets && existingCategory.assets.length > 0) {
        throw new Error(`Tidak dapat menghapus kategori '${existingCategory.name}' karena masih terdapat ${existingCategory.assets.length} aset yang menggunakan kategori ini. Silakan pindahkan atau hapus aset terlebih dahulu.`);
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
        throw new Error('Kategori tidak ditemukan');
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
        throw new Error('Kategori tidak ditemukan');
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
    // Validasi nama (selalu wajib)
    if (!categoryData.name || !categoryData.name.trim()) {
      throw new Error('Nama kategori harus diisi');
    }

    if (categoryData.name.length > 255) {
      throw new Error('Nama kategori maksimal 255 karakter');
    }

    // Validasi kode hanya jika sudah ada (setelah generate atau user input)
    if (categoryData.code) {
      if (!categoryData.code.trim()) {
        throw new Error('Kode kategori tidak boleh kosong');
      }
      if (categoryData.code.length > 50) {
        throw new Error('Kode kategori maksimal 50 karakter');
      }
    }

    // Clean up data
    categoryData.name = categoryData.name.trim();
    if (categoryData.code) {
      categoryData.code = categoryData.code.trim();
    }
    if (categoryData.description) {
      categoryData.description = categoryData.description.trim();
    }
  }

  validateCategoryDataForUpdate(categoryData) {
    // For updates, only validate fields that are provided
    if (categoryData.code !== undefined) {
      if (!categoryData.code || !categoryData.code.trim()) {
        throw new Error('Kode kategori tidak boleh kosong');
      }
      if (categoryData.code.length > 50) {
        throw new Error('Kode kategori maksimal 50 karakter');
      }
      categoryData.code = categoryData.code.trim();
    }

    if (categoryData.name !== undefined) {
      if (!categoryData.name || !categoryData.name.trim()) {
        throw new Error('Nama kategori tidak boleh kosong');
      }
      if (categoryData.name.length > 255) {
        throw new Error('Nama kategori maksimal 255 karakter');
      }
      categoryData.name = categoryData.name.trim();
    }

    if (categoryData.description !== undefined && categoryData.description) {
      categoryData.description = categoryData.description.trim();
    }
  }

  async generateNextCategoryCode() {
    try {
      // Get all existing categories to find the highest code
      const existingCategories = await this.categoryRepository.getAllCodes();

      if (!existingCategories || existingCategories.length === 0) {
        return '10';
      }

      // Extract numeric codes and find the highest
      const numericCodes = existingCategories
        .map(category => {
          const match = category.code.match(/^(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(code => !isNaN(code) && code > 0);

      const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
      const nextCode = maxCode + 10;

      return nextCode.toString();
    } catch (error) {
      logger.error('Error generating next category code:', error);
      // Fallback to timestamp-based code if generation fails
      return `C${Date.now().toString().slice(-6)}`;
    }
  }
}

module.exports = AssetCategoryUseCase;
