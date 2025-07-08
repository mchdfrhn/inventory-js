const AssetCategoryUseCase = require('../usecases/AssetCategoryUseCase');
const logger = require('../utils/logger');

class AssetCategoryController {
  constructor() {
    this.categoryUseCase = new AssetCategoryUseCase();
  }

  async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const metadata = req.metadata;

      const category = await this.categoryUseCase.createCategory(categoryData, metadata);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      logger.error('Error in createCategory controller:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const metadata = req.metadata;

      const category = await this.categoryUseCase.updateCategory(id, categoryData, metadata);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      logger.error('Error in updateCategory controller:', error);
      const status = error.message === 'Category not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const metadata = req.metadata;

      await this.categoryUseCase.deleteCategory(id, metadata);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteCategory controller:', error);
      const status = error.message === 'Category not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await this.categoryUseCase.getCategory(id);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error in getCategory controller:', error);
      const status = error.message === 'Category not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCategoryByCode(req, res) {
    try {
      const { code } = req.params;

      const category = await this.categoryUseCase.getCategoryByCode(code);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Error in getCategoryByCode controller:', error);
      const status = error.message === 'Category not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async listCategories(req, res) {
    try {
      const { page, pageSize, search } = req.query;

      if (page && pageSize) {
        const result = await this.categoryUseCase.listCategoriesPaginated(
          parseInt(page),
          parseInt(pageSize),
          search || ''
        );

        res.status(200).json({
          success: true,
          data: result.data,
          pagination: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          },
        });
      } else {
        const categories = await this.categoryUseCase.listCategories();

        res.status(200).json({
          success: true,
          data: categories,
        });
      }
    } catch (error) {
      logger.error('Error in listCategories controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AssetCategoryController;
