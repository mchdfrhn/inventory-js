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
      let processedCount = 0;

      console.log('Starting enhanced CSV parsing for categories...');

      // Read and clean file content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove BOM if present
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }

      // Detect delimiter
      const delimiters = [',', ';', '\t', '|'];
      const firstLine = content.split('\n')[0];
      let detectedDelimiter = ',';
      let maxDelimiterCount = 0;
      
      delimiters.forEach(delimiter => {
        const count = (firstLine.match(new RegExp('\\' + delimiter, 'g')) || []).length;
        if (count > maxDelimiterCount) {
          maxDelimiterCount = count;
          detectedDelimiter = delimiter;
        }
      });

      console.log(`Detected delimiter: "${detectedDelimiter}"`);

      // Create temporary file with cleaned content
      const path = require('path');
      const tempFile = path.join(__dirname, '../temp/categories_import.csv');
      
      // Ensure temp directory exists
      const tempDir = path.dirname(tempFile);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(tempFile, content);

      // Enhanced field mapping function
      const getFieldValue = (row, fieldNames) => {
        for (const fieldName of fieldNames) {
          if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
            return row[fieldName].toString().trim();
          }
        }
        return '';
      };

      // Parse CSV file
      const stream = fs.createReadStream(tempFile, { encoding: 'utf8' })
        .pipe(csv({
          separator: detectedDelimiter,
          skipEmptyLines: true,
          skipLinesWithError: false,
          strip_bom: true,
          trim: true
        }))
        .on('data', (row) => {
          try {
            processedCount++;
            console.log(`Processing row ${processedCount}:`, row);
            
            // Enhanced field mapping - support multiple column name variations
            const categoryData = {
              code: getFieldValue(row, ['code', 'kode', 'Kode', 'Kode*', 'CODE', 'Code']),
              name: getFieldValue(row, ['name', 'nama', 'Nama', 'Nama*', 'NAME', 'Name']),
              description: getFieldValue(row, ['description', 'deskripsi', 'Deskripsi', 'DESCRIPTION', 'Description', 'desc']) || '',
            };

            console.log('Mapped category data:', categoryData);

            // Enhanced validation
            if (!categoryData.code || !categoryData.name) {
              throw new Error(`Code and name are required. Got code: "${categoryData.code}", name: "${categoryData.name}"`);
            }

            if (categoryData.code.length > 50) {
              throw new Error('Code must be 50 characters or less');
            }

            if (categoryData.name.length > 255) {
              throw new Error('Name must be 255 characters or less');
            }

            // Check for duplicates within the CSV
            const isDuplicate = categories.some(cat => 
              cat.code.toLowerCase() === categoryData.code.toLowerCase() || 
              cat.name.toLowerCase() === categoryData.name.toLowerCase()
            );
            
            if (isDuplicate) {
              throw new Error('Duplicate code or name found in CSV');
            }

            categories.push(categoryData);
          } catch (error) {
            console.error(`Error processing row ${processedCount}:`, error.message);
            errors.push(`Row ${processedCount}: ${error.message}`);
          }
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          errors.push(`CSV parsing error: ${error.message}`);
        })
        .on('end', async () => {
          try {
            console.log(`Parsed ${categories.length} categories with ${errors.length} errors`);
            
            // Clean up files
            fs.unlinkSync(filePath);
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }

            if (errors.length > 0) {
              console.log('Errors found:', errors);
              return res.status(400).json({
                success: false,
                message: 'CSV parsing errors',
                errors,
                processed_rows: processedCount,
                valid_rows: categories.length
              });
            }

            // Import categories with enhanced error handling
            const importedCategories = [];
            const importErrors = [];

            for (let i = 0; i < categories.length; i++) {
              try {
                const category = await this.categoryUseCase.createCategory(categories[i], req.metadata);
                importedCategories.push(category);
              } catch (error) {
                // Handle specific error types
                if (error.message.includes('already exists')) {
                  importErrors.push(`Row ${i + 1}: ${error.message} (skipped)`);
                } else {
                  importErrors.push(`Row ${i + 1}: ${error.message}`);
                }
              }
            }

            res.status(200).json({
              success: true,
              message: `Import completed. ${importedCategories.length} categories imported successfully`,
              imported_count: importedCategories.length,
              total_rows: categories.length,
              processed_rows: processedCount,
              data: {
                imported: importedCategories.length,
                errors: importErrors,
                summary: {
                  total_processed: processedCount,
                  valid_data: categories.length,
                  successfully_imported: importedCategories.length,
                  failed_imports: importErrors.length
                }
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
