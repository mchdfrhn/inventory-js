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
        message: 'Location created successfully',
        data: location,
      });
    } catch (error) {
      logger.error('Error in createLocation controller:', error);
      res.status(400).json({
        success: false,
        message: error.message,
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
        message: 'Location updated successfully',
        data: location,
      });
    } catch (error) {
      logger.error('Error in updateLocation controller:', error);
      const status = error.message === 'Location not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
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
        message: 'Location deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteLocation controller:', error);
      const status = error.message === 'Location not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
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

      const result = await this.locationUseCase.search(query, parseInt(page), parseInt(pageSize));

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

      // Parse CSV file
      const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Map CSV columns to location fields
            const locationData = {
              code: row.code || row.kode || row.Kode || row['Kode*'],
              name: row.name || row.nama || row.Nama || row['Nama*'],
              description: row.description || row.deskripsi || row.Deskripsi || row['Deskripsi'],
              building: row.building || row.gedung || row.Gedung || row['Gedung*'],
              floor: row.floor || row.lantai || row.Lantai || row['Lantai'],
              room: row.room || row.ruangan || row.Ruangan || row['Ruangan'],
            };

            // Basic validation
            if (!locationData.code || !locationData.name) {
              throw new Error('Code and name are required');
            }

            locations.push(locationData);
          } catch (error) {
            errors.push(`Row ${locations.length + 1}: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            // Clean up uploaded file
            fs.unlinkSync(filePath);

            if (errors.length > 0) {
              return res.status(400).json({
                success: false,
                message: 'CSV parsing errors',
                errors,
              });
            }

            // Import locations
            const importedLocations = [];
            const importErrors = [];

            for (let i = 0; i < locations.length; i++) {
              try {
                const location = await this.locationUseCase.create(locations[i], req.metadata);
                importedLocations.push(location);
              } catch (error) {
                importErrors.push(`Row ${i + 1}: ${error.message}`);
              }
            }

            res.status(200).json({
              success: true,
              message: `Import completed. ${importedLocations.length} locations imported successfully`,
              imported_count: importedLocations.length,
              total_rows: locations.length,
              data: {
                imported: importedLocations.length,
                errors: importErrors,
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
