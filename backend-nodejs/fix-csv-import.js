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
    return new Promise((resolve, reject) => {
      const categories = [];
      const errors = [];
      
      let content = fs.readFileSync(filePath, 'utf8');
      content = this.cleanBOM(content);
      
      const delimiter = this.detectDelimiter(content);
      console.log(`Detected delimiter: "${delimiter}"`);
      
      // Temporary file with correct content
      const tempFile = path.join(__dirname, 'temp_categories.csv');
      fs.writeFileSync(tempFile, content);
      
      const stream = fs.createReadStream(tempFile, { encoding: 'utf8' })
        .pipe(csv({
          separator: delimiter,
          skipEmptyLines: true,
          skipLinesWithError: false,
          trim: true,
          headers: true,
          mapHeaders: ({ header, index }) => {
            // Clean header names
            return header.trim().replace(/\*/g, '').toLowerCase();
          }
        }))
        .on('data', (row) => {
          try {
            console.log('Raw row:', row);
            
            // Map CSV columns to category fields with enhanced mapping
            const categoryData = {
              code: this.getFieldValue(row, ['code', 'kode', 'id']),
              name: this.getFieldValue(row, ['name', 'nama', 'category', 'kategori']),
              description: this.getFieldValue(row, ['description', 'deskripsi', 'desc', 'keterangan']) || '',
            };

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
              cat.name.toLowerCase() === categoryData.name.toLowerCase()
            );
            
            if (isDuplicate) {
              errors.push(`Row ${categories.length + 1}: Duplicate code or name found in CSV`);
              return;
            }

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
    return new Promise((resolve, reject) => {
      const locations = [];
      const errors = [];
      
      let content = fs.readFileSync(filePath, 'utf8');
      content = this.cleanBOM(content);
      
      const delimiter = this.detectDelimiter(content);
      console.log(`Detected delimiter: "${delimiter}"`);
      
      // Temporary file with correct content
      const tempFile = path.join(__dirname, 'temp_locations.csv');
      fs.writeFileSync(tempFile, content);
      
      const stream = fs.createReadStream(tempFile, { encoding: 'utf8' })
        .pipe(csv({
          separator: delimiter,
          skipEmptyLines: true,
          skipLinesWithError: false,
          trim: true,
          headers: true,
          mapHeaders: ({ header, index }) => {
            // Clean header names
            return header.trim().replace(/\*/g, '').toLowerCase();
          }
        }))
        .on('data', (row) => {
          try {
            console.log('Raw row:', row);
            
            // Map CSV columns to location fields with enhanced mapping
            const locationData = {
              code: this.getFieldValue(row, ['code', 'kode', 'id']),
              name: this.getFieldValue(row, ['name', 'nama', 'location', 'lokasi']),
              description: this.getFieldValue(row, ['description', 'deskripsi', 'desc', 'keterangan']) || '',
              building: this.getFieldValue(row, ['building', 'gedung', 'bangunan']) || '',
              floor: this.getFieldValue(row, ['floor', 'lantai', 'tingkat']) || '',
              room: this.getFieldValue(row, ['room', 'ruangan', 'ruang']) || '',
            };

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
              loc.name.toLowerCase() === locationData.name.toLowerCase()
            );
            
            if (isDuplicate) {
              errors.push(`Row ${locations.length + 1}: Duplicate code or name found in CSV`);
              return;
            }

            locations.push(locationData);
          } catch (error) {
            console.error('Error processing row:', error.message);
            errors.push(`Row ${locations.length + 1}: ${error.message}`);
          }
        })
        .on('error', (error) => {
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
      errors
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
      errors
    };
  }

  // Test import categories
  async testImportCategories() {
    console.log('=== Testing Category CSV Import Fix ===');
    
    // Create test data
    const testCategoriesCSV = `Kode*,Nama*,Deskripsi
10,Peralatan Komputer,Kategori untuk komputer desktop laptop printer scanner dan aksesoris IT
20,Furniture Kantor,Kategori untuk meja kursi lemari filing cabinet dan furniture kantor lainnya
30,Kendaraan,Kategori untuk mobil dinas motor operasional dan kendaraan transportasi`;

    const testFile = path.join(__dirname, 'test_import_categories.csv');
    fs.writeFileSync(testFile, testCategoriesCSV);

    try {
      const result = await this.parseCategories(testFile);
      
      console.log(`\nParsed ${result.categories.length} categories:`);
      result.categories.forEach((cat, i) => {
        console.log(`${i + 1}. Code: "${cat.code}", Name: "${cat.name}"`);
      });
      
      if (result.errors.length > 0) {
        console.log(`\nErrors found:`);
        result.errors.forEach(error => console.log(`- ${error}`));
      } else {
        console.log('\n✅ No errors found!');
      }
      
      // Clean up
      fs.unlinkSync(testFile);
      
      return result;
    } catch (error) {
      console.error('Test failed:', error);
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      throw error;
    }
  }

  // Test import locations
  async testImportLocations() {
    console.log('\n=== Testing Location CSV Import Fix ===');
    
    // Create test data
    const testLocationsCSV = `Kode*,Nama*,Gedung,Lantai,Ruangan,Deskripsi
001,Ruang Kelas 1A,Gedung Utama,1,A101,Ruang kelas untuk mata kuliah umum dan teori
002,Laboratorium Komputer,Gedung Teknik,2,B201,Lab untuk praktikum programming dan sistem informasi
003,Perpustakaan,Gedung Utama,1,C101,Ruang baca dan koleksi buku referensi`;

    const testFile = path.join(__dirname, 'test_import_locations.csv');
    fs.writeFileSync(testFile, testLocationsCSV);

    try {
      const result = await this.parseLocations(testFile);
      
      console.log(`\nParsed ${result.locations.length} locations:`);
      result.locations.forEach((loc, i) => {
        console.log(`${i + 1}. Code: "${loc.code}", Name: "${loc.name}"`);
      });
      
      if (result.errors.length > 0) {
        console.log(`\nErrors found:`);
        result.errors.forEach(error => console.log(`- ${error}`));
      } else {
        console.log('\n✅ No errors found!');
      }
      
      // Clean up
      fs.unlinkSync(testFile);
      
      return result;
    } catch (error) {
      console.error('Test failed:', error);
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      throw error;
    }
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
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('\nSolutions implemented:');
      console.log('1. ✅ Enhanced delimiter detection');
      console.log('2. ✅ BOM removal for UTF-8 files');
      console.log('3. ✅ Improved field mapping with multiple field name options');
      console.log('4. ✅ Better validation and error reporting');
      console.log('5. ✅ Duplicate detection within CSV');
      console.log('6. ✅ Clean header processing (removes * and normalizes)');
      
    } catch (error) {
      console.error('Tests failed:', error);
      process.exit(1);
    }
  })();
}
