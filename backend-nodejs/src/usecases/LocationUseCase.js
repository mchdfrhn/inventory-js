const LocationRepository = require('../repositories/LocationRepository');
const AuditLogUseCase = require('./AuditLogUseCase');
const logger = require('../utils/logger');

class LocationUseCase {
  constructor() {
    this.locationRepository = new LocationRepository();
    this.auditLogUseCase = new AuditLogUseCase();
  }

  async create(locationData, metadata = {}) {
    try {
      // Validate required fields
      this.validateLocationData(locationData);

      // Check if code already exists
      const codeExists = await this.locationRepository.checkCodeExists(locationData.code);
      if (codeExists) {
        throw new Error(`Location with code '${locationData.code}' already exists`);
      }

      // Check if name already exists
      const nameExists = await this.locationRepository.checkNameExists(locationData.name);
      if (nameExists) {
        throw new Error(`Location with name '${locationData.name}' already exists`);
      }

      // Create location
      const location = await this.locationRepository.create(locationData);

      // Log audit
      await this.auditLogUseCase.logLocationCreated(location, metadata);

      return location;
    } catch (error) {
      logger.error('Error in create location usecase:', error);
      throw error;
    }
  }

  async update(id, locationData, metadata = {}) {
    try {
      // Get existing location
      const existingLocation = await this.locationRepository.getById(id);
      if (!existingLocation) {
        throw new Error('Location not found');
      }

      // Validate required fields
      this.validateLocationData(locationData);

      // Check if code already exists (excluding current location)
      if (locationData.code !== existingLocation.code) {
        const codeExists = await this.locationRepository.checkCodeExists(locationData.code, id);
        if (codeExists) {
          throw new Error(`Location with code '${locationData.code}' already exists`);
        }
      }

      // Check if name already exists (excluding current location)
      if (locationData.name !== existingLocation.name) {
        const nameExists = await this.locationRepository.checkNameExists(locationData.name, id);
        if (nameExists) {
          throw new Error(`Location with name '${locationData.name}' already exists`);
        }
      }

      // Update location
      const updatedLocation = await this.locationRepository.update(id, locationData);

      // Log audit
      await this.auditLogUseCase.logLocationUpdated(existingLocation, updatedLocation, metadata);

      return updatedLocation;
    } catch (error) {
      logger.error('Error in update location usecase:', error);
      throw error;
    }
  }

  async delete(id, metadata = {}) {
    try {
      // Get existing location
      const existingLocation = await this.locationRepository.getById(id);
      if (!existingLocation) {
        throw new Error('Location not found');
      }

      // Check if location has associated assets
      if (existingLocation.assets && existingLocation.assets.length > 0) {
        throw new Error(`Cannot delete location '${existingLocation.name}' because it has ${existingLocation.assets.length} associated assets`);
      }

      // Delete location
      await this.locationRepository.delete(id);

      // Log audit
      await this.auditLogUseCase.logLocationDeleted(existingLocation, metadata);

      return true;
    } catch (error) {
      logger.error('Error in delete location usecase:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const location = await this.locationRepository.getById(id);
      if (!location) {
        throw new Error('Location not found');
      }
      return location;
    } catch (error) {
      logger.error('Error in getById location usecase:', error);
      throw error;
    }
  }

  async getByCode(code) {
    try {
      const location = await this.locationRepository.getByCode(code);
      if (!location) {
        throw new Error('Location not found');
      }
      return location;
    } catch (error) {
      logger.error('Error in getByCode location usecase:', error);
      throw error;
    }
  }

  async list(page = 1, pageSize = 10) {
    try {
      const result = await this.locationRepository.list(page, pageSize);
      return result;
    } catch (error) {
      logger.error('Error in list locations usecase:', error);
      throw error;
    }
  }

  async search(query, page = 1, pageSize = 10) {
    try {
      const result = await this.locationRepository.search(query, page, pageSize);
      return result;
    } catch (error) {
      logger.error('Error in search locations usecase:', error);
      throw error;
    }
  }

  validateLocationData(locationData) {
    if (!locationData.code || !locationData.code.trim()) {
      throw new Error('Location code is required');
    }

    if (!locationData.name || !locationData.name.trim()) {
      throw new Error('Location name is required');
    }

    if (locationData.code.length > 50) {
      throw new Error('Location code must be 50 characters or less');
    }

    if (locationData.name.length > 255) {
      throw new Error('Location name must be 255 characters or less');
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

    // Clean up data
    locationData.code = locationData.code.trim();
    locationData.name = locationData.name.trim();
    if (locationData.description) {
      locationData.description = locationData.description.trim();
    }
    if (locationData.building) {
      locationData.building = locationData.building.trim();
    }
    if (locationData.floor) {
      locationData.floor = locationData.floor.trim();
    }
    if (locationData.room) {
      locationData.room = locationData.room.trim();
    }
  }
}

module.exports = LocationUseCase;
