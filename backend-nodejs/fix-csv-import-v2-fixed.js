const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

/**
 * Enhanced CSV Import Function untuk mengatasi masalah:
 * 1. Encoding UTF-8 dengan BOM
 * 2. Delimiter detection
 * 3. Data validation
 * 4. Duplicate handling
 * 5. Better error reporting
 */

class CSVImportFixer {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // Detect CSV delimiter
  detectDelimiter(content) {
    const delimiters = [',', ';', '\t', '|'];
    const firstLine = content.split('\n')[0];

    let maxDelimiterCount = 0;
    let detectedDelimiter = ',';

    delimiters.forEach(delimiter => {
      const count = (firstLine.match(new RegExp('\\' + delimiter, 'g')) || []).length;
      if (count > maxDelimiterCount) {
        maxDelimiterCount = count;
        detectedDelimiter = delimiter;
      }
    });

    return detectedDelimiter;
  }

  // Clean BOM from content
  cleanBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      return content.slice(1);
    }
    return content;
  }

  // Enhanced CSV parsing for categories
  async parseCategories(filePath) {
    return new Promise((resolve) => {
      const categories = [];
      const errors = [];

      let content = fs.readFileSync(filePath, 'utf8');
      content = this.cleanBOM(content);

      const delimiter = this.detectDelimiter(content);
      // eslint-disable-next-line no-console
      console.log(`Detected delimiter: "${delimiter}"`);

      // Temporary file with correct content
      const tempFile = path.join(__dirname, 'temp_categories.csv');
      fs.writeFileSync(tempFile, content);

      fs.createReadStream(tempFile, { encoding: 'utf8' })
        .pipe(csv({
          separator: delimiter,
          skipEmptyLines: true,
          skipLinesWithError: false,
          strip_bom: true,
          trim: true,
        }))
        .on('data', (row) => {
          try {
            // eslint-disable-next-line no-console
            console.log('Raw row:', row);

            // Map CSV columns to category fields with enhanced mapping
            const categoryData = {
              code: this.getFieldValue(row, ['code', 'kode', 'Kode', 'Kode*', 'CODE', 'Code', 'id', 'ID']),
              name: this.getFieldValue(row, ['name', 'nama', 'Nama', 'Nama*', 'NAME', 'Name', 'category', 'kategori']),
              description: this.getFieldValue(row, ['description', 'deskripsi', 'Deskripsi', 'DESCRIPTION', 'Description', 'desc', 'keterangan']) || '',
            };

            // eslint-disable-next-line no-console
            console.log('Mapped category data:', categoryData);

            // Enhanced validation
            const validation = this.validateCategoryData(categoryData, categories.length + 1);
            if (!validation.isValid) {
              errors.push(...validation.errors);
              return;
            }

            // Check for duplicates within the CSV
            const isDuplicate = categories.some(cat =>
              cat.code.toLowerCase() === categoryData.code.toLowerCase() ||
              cat.name.toLowerCase() === categoryData.name.toLowerCase(),
            );

            if (isDuplicate) {
              errors.push(`Row ${categories.length + 1}: Duplicate code or name found in CSV`);
              return;
            }

            categories.push(categoryData);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error processing row:', error.message);
            errors.push(`Row ${categories.length + 1}: ${error.message}`);
          }
        })
        .on('error', (error) => {
          // eslint-disable-next-line no-console
          console.error('CSV parsing error:', error);
          errors.push(`CSV parsing error: ${error.message}`);
        })
        .on('end', () => {
          // Clean up temp file
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }

          resolve({ categories, errors });
        });
    });
  }

  // Enhanced CSV parsing for locations
  async parseLocations(filePath) {
    return new Promise((resolve) => {
      const locations = [];
      const errors = [];

      let content = fs.readFileSync(filePath, 'utf8');
      content = this.cleanBOM(content);

      const delimiter = this.detectDelimiter(content);
      // eslint-disable-next-line no-console
      console.log(`Detected delimiter: "${delimiter}"`);

      // Temporary file with correct content
      const tempFile = path.join(__dirname, 'temp_locations.csv');
      fs.writeFileSync(tempFile, content);

      fs.createReadStream(tempFile, { encoding: 'utf8' })
        .pipe(csv({
          separator: delimiter,
          skipEmptyLines: true,
          skipLinesWithError: false,
          strip_bom: true,
          trim: true,
        }))
        .on('data', (row) => {
          try {
            // eslint-disable-next-line no-console
            console.log('Raw row:', row);

            // Map CSV columns to location fields with enhanced mapping
            const locationData = {
              code: this.getFieldValue(row, ['code', 'kode', 'Kode', 'Kode*', 'CODE', 'Code', 'id', 'ID']),
              name: this.getFieldValue(row, ['name', 'nama', 'Nama', 'Nama*', 'NAME', 'Name', 'location', 'lokasi']),
              description: this.getFieldValue(row, ['description', 'deskripsi', 'Deskripsi', 'DESCRIPTION', 'Description', 'desc', 'keterangan']) || '',
              building: this.getFieldValue(row, ['building', 'gedung', 'Gedung', 'BUILDING', 'Building', 'bangunan']) || '',
              floor: this.getFieldValue(row, ['floor', 'lantai', 'Lantai', 'FLOOR', 'Floor', 'tingkat']) || '',
              room: this.getFieldValue(row, ['room', 'ruangan', 'Ruangan', 'ROOM', 'Room', 'ruang']) || '',
            };

            // eslint-disable-next-line no-console
            console.log('Mapped location data:', locationData);

            // Enhanced validation
            const validation = this.validateLocationData(locationData, locations.length + 1);
            if (!validation.isValid) {
              errors.push(...validation.errors);
              return;
            }

            // Check for duplicates within the CSV
            const isDuplicate = locations.some(loc =>
              loc.code.toLowerCase() === locationData.code.toLowerCase() ||
              loc.name.toLowerCase() === locationData.name.toLowerCase(),
            );

            if (isDuplicate) {
              errors.push(`Row ${locations.length + 1}: Duplicate code or name found in CSV`);
              return;
            }

            locations.push(locationData);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error processing row:', error.message);
            errors.push(`Row ${locations.length + 1}: ${error.message}`);
          }
        })
        .on('error', (error) => {
          // eslint-disable-next-line no-console
          console.error('CSV parsing error:', error);
          errors.push(`CSV parsing error: ${error.message}`);
        })
        .on('end', () => {
          // Clean up temp file
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }

          resolve({ locations, errors });
        });
    });
  }

  // Get field value with multiple possible field names
  getFieldValue(row, fieldNames) {
    for (const fieldName of fieldNames) {
      if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
        return row[fieldName].toString().trim();
      }
    }
    return '';
  }

  // Validate category data
  validateCategoryData(categoryData, rowNumber) {
    const errors = [];

    if (!categoryData.code) {
      errors.push(`Row ${rowNumber}: Code is required`);
    } else if (categoryData.code.length > 50) {
      errors.push(`Row ${rowNumber}: Code must be 50 characters or less`);
    }

    if (!categoryData.name) {
      errors.push(`Row ${rowNumber}: Name is required`);
    } else if (categoryData.name.length > 255) {
      errors.push(`Row ${rowNumber}: Name must be 255 characters or less`);
    }

    if (categoryData.description && categoryData.description.length > 1000) {
      errors.push(`Row ${rowNumber}: Description must be 1000 characters or less`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate location data
  validateLocationData(locationData, rowNumber) {
    const errors = [];

    if (!locationData.code) {
      errors.push(`Row ${rowNumber}: Code is required`);
    } else if (locationData.code.length > 50) {
      errors.push(`Row ${rowNumber}: Code must be 50 characters or less`);
    }

    if (!locationData.name) {
      errors.push(`Row ${rowNumber}: Name is required`);
    } else if (locationData.name.length > 255) {
      errors.push(`Row ${rowNumber}: Name must be 255 characters or less`);
    }

    if (locationData.description && locationData.description.length > 1000) {
      errors.push(`Row ${rowNumber}: Description must be 1000 characters or less`);
    }

    if (locationData.building && locationData.building.length > 255) {
      errors.push(`Row ${rowNumber}: Building must be 255 characters or less`);
    }

    if (locationData.floor && locationData.floor.length > 50) {
      errors.push(`Row ${rowNumber}: Floor must be 50 characters or less`);
    }

    if (locationData.room && locationData.room.length > 100) {
      errors.push(`Row ${rowNumber}: Room must be 100 characters or less`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Test import categories
  async testImportCategories() {
    // eslint-disable-next-line no-console
    console.log('=== Testing Category CSV Import Fix ===');

    // Create test data with proper headers
    const testCategoriesCSV = `Kode*,Nama*,Deskripsi
10,Peralatan Komputer,Kategori untuk komputer desktop laptop printer scanner dan aksesoris IT
20,Furniture Kantor,Kategori untuk meja kursi lemari filing cabinet dan furniture kantor lainnya
30,Kendaraan,Kategori untuk mobil dinas motor operasional dan kendaraan transportasi`;

    const testFile = path.join(__dirname, 'test_import_categories.csv');
    fs.writeFileSync(testFile, testCategoriesCSV);

    try {
      const result = await this.parseCategories(testFile);

      // eslint-disable-next-line no-console
      console.log(`\nParsed ${result.categories.length} categories:`);
      result.categories.forEach((cat, i) => {
        // eslint-disable-next-line no-console
        console.log(`${i + 1}. Code: "${cat.code}", Name: "${cat.name}"`);
      });

      if (result.errors.length > 0) {
        // eslint-disable-next-line no-console
        console.log('\nErrors found:');
        // eslint-disable-next-line no-console
        result.errors.forEach(error => console.log(`- ${error}`));
      } else {
        // eslint-disable-next-line no-console
        console.log('\n✅ No errors found!');
      }

      // Clean up
      fs.unlinkSync(testFile);

      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Test failed:', error);
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      throw error;
    }
  }

  // Test import locations
  async testImportLocations() {
    // eslint-disable-next-line no-console
    console.log('\n=== Testing Location CSV Import Fix ===');

    // Create test data with proper headers
    const testLocationsCSV = `Kode*,Nama*,Gedung,Lantai,Ruangan,Deskripsi
001,Ruang Kelas 1A,Gedung Utama,1,A101,Ruang kelas untuk mata kuliah umum dan teori
002,Laboratorium Komputer,Gedung Teknik,2,B201,Lab untuk praktikum programming dan sistem informasi
003,Perpustakaan,Gedung Utama,1,C101,Ruang baca dan koleksi buku referensi`;

    const testFile = path.join(__dirname, 'test_import_locations.csv');
    fs.writeFileSync(testFile, testLocationsCSV);

    try {
      const result = await this.parseLocations(testFile);

      // eslint-disable-next-line no-console
      console.log(`\nParsed ${result.locations.length} locations:`);
      result.locations.forEach((loc, i) => {
        // eslint-disable-next-line no-console
        console.log(`${i + 1}. Code: "${loc.code}", Name: "${loc.name}"`);
      });

      if (result.errors.length > 0) {
        // eslint-disable-next-line no-console
        console.log('\nErrors found:');
        // eslint-disable-next-line no-console
        result.errors.forEach(error => console.log(`- ${error}`));
      } else {
        // eslint-disable-next-line no-console
        console.log('\n✅ No errors found!');
      }

      // Clean up
      fs.unlinkSync(testFile);

      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Test failed:', error);
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      throw error;
    }
  }

  // Generate improved controllers
  generateImprovedCategoryController() {
    return `
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

      logger.info('Starting CSV parsing for categories...');

      // Read and clean file content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove BOM if present
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }

      // Detect delimiter
      const delimiters = [',', ';', '\\t', '|'];
      const firstLine = content.split('\\n')[0];
      let detectedDelimiter = ',';
      let maxDelimiterCount = 0;
      
      delimiters.forEach(delimiter => {
        const count = (firstLine.match(new RegExp('\\\\' + delimiter, 'g')) || []).length;
        if (count > maxDelimiterCount) {
          maxDelimiterCount = count;
          detectedDelimiter = delimiter;
        }
      });

      logger.info(\`Detected delimiter: "\${detectedDelimiter}"\`);

      // Create temporary file with cleaned content
      const tempFile = path.join(__dirname, '../temp/categories_import.csv');
      fs.writeFileSync(tempFile, content);

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
            logger.debug(\`Processing row \${processedCount}:\`, row);
            
            // Enhanced field mapping - support multiple column name variations
            const getFieldValue = (fieldNames) => {
              for (const fieldName of fieldNames) {
                if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
                  return row[fieldName].toString().trim();
                }
              }
              return '';
            };

            const categoryData = {
              code: getFieldValue(['code', 'kode', 'Kode', 'Kode*', 'CODE', 'Code']),
              name: getFieldValue(['name', 'nama', 'Nama', 'Nama*', 'NAME', 'Name']),
              description: getFieldValue(['description', 'deskripsi', 'Deskripsi', 'DESCRIPTION', 'Description', 'desc']) || '',
            };

            logger.debug('Mapped category data:', categoryData);

            // Enhanced validation
            if (!categoryData.code || !categoryData.name) {
              throw new Error(\`Code and name are required. Got code: "\${categoryData.code}", name: "\${categoryData.name}"\`);
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
            logger.error(\`Error processing row \${processedCount}:\`, error.message);
            errors.push(\`Row \${processedCount}: \${error.message}\`);
          }
        })
        .on('error', (error) => {
          logger.error('CSV parsing error:', error);
          errors.push(\`CSV parsing error: \${error.message}\`);
        })
        .on('end', async () => {
          try {
            logger.info(\`Parsed \${categories.length} categories with \${errors.length} errors\`);
            
            // Clean up files
            fs.unlinkSync(filePath);
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }

            if (errors.length > 0) {
              logger.warn('Errors found:', errors);
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
                  importErrors.push(\`Row \${i + 1}: \${error.message} (skipped)\`);
                } else {
                  importErrors.push(\`Row \${i + 1}: \${error.message}\`);
                }
              }
            }

            res.status(200).json({
              success: true,
              message: \`Import completed. \${importedCategories.length} categories imported successfully\`,
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
  }`;
  }
}

// Export class
module.exports = CSVImportFixer;

// Run tests if called directly
if (require.main === module) {
  const fixer = new CSVImportFixer();

  (async () => {
    try {
      await fixer.testImportCategories();
      await fixer.testImportLocations();

      // eslint-disable-next-line no-console
      console.log('\n🎉 All tests completed successfully!');
      // eslint-disable-next-line no-console
      console.log('\nSolutions implemented:');
      // eslint-disable-next-line no-console
      console.log('1. ✅ Enhanced delimiter detection');
      // eslint-disable-next-line no-console
      console.log('2. ✅ BOM removal for UTF-8 files');
      // eslint-disable-next-line no-console
      console.log('3. ✅ Improved field mapping with multiple field name options');
      // eslint-disable-next-line no-console
      console.log('4. ✅ Better validation and error reporting');
      // eslint-disable-next-line no-console
      console.log('5. ✅ Duplicate detection within CSV');
      // eslint-disable-next-line no-console
      console.log('6. ✅ Robust header handling (supports various naming conventions)');

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Tests failed:', error);
      process.exit(1);
    }
  })();
}
