const LocationUseCase = require('../usecases/LocationUseCase');
const csv = require('csv-parser');
const fs = require('fs');
const logger = require('../utils/logger');

class LocationController {
  constructor() {
    this.locationUseCase = new LocationUseCase();
  }

  async createLocation(req, res) {
    try {
      const locationData = req.body;
      const metadata = req.metadata;

      const location = await this.locationUseCase.create(locationData, metadata);

      res.status(201).json({
        success: true,
        message: 'Lokasi berhasil dibuat',
        data: location,
      });
    } catch (error) {
      logger.error('Error in createLocation controller:', error);

      // Handle specific error cases
      let statusCode = 400;
      let errorMessage = error.message;

      if (error.message.includes('already exists')) {
        statusCode = 409; // Conflict
        errorMessage = error.message;
      } else if (error.message.includes('Validation error') || error.message.includes('required')) {
        statusCode = 400; // Bad Request
        errorMessage = `Data tidak valid: ${error.message}`;
      } else if (error.name === 'SequelizeValidationError') {
        statusCode = 400;
        errorMessage = `Validasi database gagal: ${error.errors?.map(e => e.message).join(', ') || error.message}`;
      } else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        errorMessage = 'Kode atau nama lokasi sudah digunakan';
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const locationData = req.body;
      const metadata = req.metadata;

      const location = await this.locationUseCase.update(parseInt(id), locationData, metadata);

      res.status(200).json({
        success: true,
        message: 'Lokasi berhasil diperbarui',
        data: location,
      });
    } catch (error) {
      logger.error('Error in updateLocation controller:', error);

      // Handle specific error cases
      let statusCode = 400;
      let errorMessage = error.message;

      if (error.message === 'Location not found') {
        statusCode = 404;
        errorMessage = 'Lokasi tidak ditemukan';
      } else if (error.message.includes('already exists')) {
        statusCode = 409;
        errorMessage = error.message;
      } else if (error.message.includes('Validation error') || error.message.includes('required')) {
        statusCode = 400;
        errorMessage = `Data tidak valid: ${error.message}`;
      } else if (error.name === 'SequelizeValidationError') {
        statusCode = 400;
        errorMessage = `Validasi database gagal: ${error.errors?.map(e => e.message).join(', ') || error.message}`;
      } else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        errorMessage = 'Kode atau nama lokasi sudah digunakan';
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async deleteLocation(req, res) {
    try {
      const { id } = req.params;
      const metadata = req.metadata;

      await this.locationUseCase.delete(parseInt(id), metadata);

      res.status(200).json({
        success: true,
        message: 'Lokasi berhasil dihapus',
      });
    } catch (error) {
      logger.error('Error in deleteLocation controller:', error);

      let status = 400;
      let errorMessage = error.message;

      if (error.message === 'Location not found') {
        status = 404;
        errorMessage = 'Lokasi tidak ditemukan';
      } else if (error.message.includes('Tidak dapat menghapus lokasi')) {
        status = 409; // Conflict - cannot delete due to dependencies
        errorMessage = error.message;
      }

      res.status(status).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async getLocation(req, res) {
    try {
      const { id } = req.params;

      const location = await this.locationUseCase.getById(parseInt(id));

      res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      logger.error('Error in getLocation controller:', error);
      const status = error.message === 'Location not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLocationByCode(req, res) {
    try {
      const { code } = req.params;

      const location = await this.locationUseCase.getByCode(code);

      res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      logger.error('Error in getLocationByCode controller:', error);
      const status = error.message === 'Location not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async listLocations(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;

      const result = await this.locationUseCase.list(parseInt(page), parseInt(pageSize));

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
    } catch (error) {
      logger.error('Error in listLocations controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchLocations(req, res) {
    try {
      const { query, page = 1, pageSize = 10 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      // Validate and parse pagination parameters
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedPageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

      const result = await this.locationUseCase.search(query, parsedPage, parsedPageSize);

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
    } catch (error) {
      logger.error('Error in searchLocations controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async importLocations(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is required',
        });
      }

      const filePath = req.file.path;
      const locations = [];
      const errors = [];
      let processedCount = 0;

      // eslint-disable-next-line no-console
      console.log('Starting enhanced CSV parsing for locations...');

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

      // eslint-disable-next-line no-console
      console.log(`Detected delimiter: "${detectedDelimiter}"`);

      // Create temporary file with cleaned content
      const path = require('path');
      const tempFile = path.join(__dirname, '../temp/locations_import.csv');

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
      fs.createReadStream(tempFile, { encoding: 'utf8' })
        .pipe(csv({
          separator: detectedDelimiter,
          skipEmptyLines: true,
          skipLinesWithError: false,
          strip_bom: true,
          trim: true,
        }))
        .on('data', (row) => {
          try {
            processedCount++;
            // eslint-disable-next-line no-console
            console.log(`Processing row ${processedCount}:`, row);

            // Enhanced field mapping - support multiple column name variations
            // Kode akan dibuat otomatis, jadi tidak perlu dari CSV
            const locationData = {
              name: getFieldValue(row, ['name', 'nama', 'Nama', 'Nama*', 'NAME', 'Name', 'location', 'lokasi']),
              description: getFieldValue(row, ['description', 'deskripsi', 'Deskripsi', 'DESCRIPTION', 'Description', 'desc']) || '',
              building: getFieldValue(row, ['building', 'gedung', 'Gedung', 'BUILDING', 'Building', 'bangunan']) || '',
              floor: getFieldValue(row, ['floor', 'lantai', 'Lantai', 'FLOOR', 'Floor', 'tingkat']) || '',
              room: getFieldValue(row, ['room', 'ruangan', 'Ruangan', 'ROOM', 'Room', 'ruang']) || '',
            };

            // eslint-disable-next-line no-console
            console.log('Mapped location data (before auto-code):', locationData);

            // Enhanced validation - hanya nama yang wajib
            if (!locationData.name) {
              throw new Error(`Name is required. Got name: "${locationData.name}"`);
            }

            if (locationData.name.length > 255) {
              throw new Error('Name must be 255 characters or less');
            }

            if (locationData.building && locationData.building.length > 255) {
              throw new Error('Building must be 255 characters or less');
            }

            if (locationData.floor && locationData.floor.length > 50) {
              throw new Error('Floor must be 50 characters or less');
            }

            if (locationData.room && locationData.room.length > 100) {
              throw new Error('Room must be 100 characters or less');
            }

            // Check for duplicates within the CSV (by name only since code will be auto-generated)
            const isDuplicate = locations.some(loc =>
              loc.name.toLowerCase() === locationData.name.toLowerCase(),
            );

            if (isDuplicate) {
              throw new Error('Duplicate name found in CSV');
            }

            locations.push(locationData);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error processing row ${processedCount}:`, error.message);
            errors.push(`Row ${processedCount}: ${error.message}`);
          }
        })
        .on('error', (error) => {
          // eslint-disable-next-line no-console
          console.error('CSV parsing error:', error);
          errors.push(`CSV parsing error: ${error.message}`);
        })
        .on('end', async () => {
          try {
            // eslint-disable-next-line no-console
            console.log(`Parsed ${locations.length} locations with ${errors.length} errors`);

            // Clean up files
            fs.unlinkSync(filePath);
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }

            if (errors.length > 0) {
              // eslint-disable-next-line no-console
              console.log('Errors found:', errors);
              return res.status(400).json({
                success: false,
                message: 'CSV parsing errors',
                errors,
                processed_rows: processedCount,
                valid_rows: locations.length,
              });
            }

            // Import locations with enhanced error handling
            const importedLocations = [];
            const importErrors = [];

            for (let i = 0; i < locations.length; i++) {
              try {
                const location = await this.locationUseCase.create(locations[i], req.metadata);
                importedLocations.push(location);
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
              message: `Import completed. ${importedLocations.length} locations imported successfully`,
              imported_count: importedLocations.length,
              total_rows: locations.length,
              processed_rows: processedCount,
              data: {
                imported: importedLocations.length,
                errors: importErrors,
                summary: {
                  total_processed: processedCount,
                  valid_data: locations.length,
                  successfully_imported: importedLocations.length,
                  failed_imports: importErrors.length,
                },
              },
            });
          } catch (error) {
            logger.error('Error in location import:', error);
            res.status(500).json({
              success: false,
              message: error.message,
            });
          }
        });
    } catch (error) {
      logger.error('Error in importLocations controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = LocationController;
