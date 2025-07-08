const LocationUseCase = require('../usecases/LocationUseCase');
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
}

module.exports = LocationController;
