const AssetCategoryUseCase = require('../usecases/AssetCategoryUseCase');
const csv = require('csv-parser');
const fs = require('fs');
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

  async importCategories(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is required',
        });
      }

      const filePath = req.file.path;
      const categories = [];
      const errors = [];

      console.log('Starting CSV parsing for categories...');

      // Parse CSV file
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' })
        .pipe(csv({
          skipEmptyLines: true,
          skipLinesWithError: false,
          trim: true,
          strip_bom: true  // Remove BOM if present
        }))
        .on('data', (row) => {
          try {
            console.log('Processing row:', row);
            
            // Map CSV columns to category fields - support multiple formats
            const categoryData = {
              code: row.code || row.kode || row.Kode || row['Kode*'] || row['Kode'],
              name: row.name || row.nama || row.Nama || row['Nama*'] || row['Nama'],
              description: row.description || row.deskripsi || row.Deskripsi || row['Deskripsi'] || '',
            };

            console.log('Mapped category data:', categoryData);

            // Basic validation
            if (!categoryData.code || !categoryData.name) {
              throw new Error(`Code and name are required. Got code: "${categoryData.code}", name: "${categoryData.name}"`);
            }

            // Trim whitespace
            categoryData.code = categoryData.code.toString().trim();
            categoryData.name = categoryData.name.toString().trim();
            categoryData.description = categoryData.description ? categoryData.description.toString().trim() : '';

            categories.push(categoryData);
          } catch (error) {
            console.error('Error processing row:', error.message);
            errors.push(`Row ${categories.length + 1}: ${error.message}`);
          }
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          errors.push(`CSV parsing error: ${error.message}`);
        })
        .on('end', async () => {
          try {
            console.log(`Parsed ${categories.length} categories with ${errors.length} errors`);
            
            // Clean up uploaded file
            fs.unlinkSync(filePath);

            if (errors.length > 0) {
              console.log('Errors found:', errors);
              return res.status(400).json({
                success: false,
                message: 'CSV parsing errors',
                errors,
              });
            }

            // Import categories
            const importedCategories = [];
            const importErrors = [];

            for (let i = 0; i < categories.length; i++) {
              try {
                const category = await this.categoryUseCase.createCategory(categories[i], req.metadata);
                importedCategories.push(category);
              } catch (error) {
                importErrors.push(`Row ${i + 1}: ${error.message}`);
              }
            }

            res.status(200).json({
              success: true,
              message: `Import completed. ${importedCategories.length} categories imported successfully`,
              imported_count: importedCategories.length,
              total_rows: categories.length,
              data: {
                imported: importedCategories.length,
                errors: importErrors,
              },
            });
          } catch (error) {
            logger.error('Error in category import:', error);
            res.status(500).json({
              success: false,
              message: error.message,
            });
          }
        });
    } catch (error) {
      logger.error('Error in importCategories controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AssetCategoryController;
