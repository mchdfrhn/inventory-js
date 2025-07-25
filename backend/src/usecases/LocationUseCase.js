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
      // Generate automatic code if not provided
      if (!locationData.code) {
        locationData.code = await this.generateNextLocationCode();
      }

      // Validate required fields
      this.validateLocationData(locationData);

      // Check if code already exists
      const codeExists = await this.locationRepository.checkCodeExists(locationData.code);
      if (codeExists) {
        throw new Error(`Kode lokasi '${locationData.code}' sudah digunakan`);
      }

      // Check if name already exists
      const nameExists = await this.locationRepository.checkNameExists(locationData.name);
      if (nameExists) {
        throw new Error(`Nama lokasi '${locationData.name}' sudah digunakan`);
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

      // Validate required fields for update (only validate what is being changed)
      this.validateLocationDataForUpdate(locationData);

      // Check if code already exists (excluding current location)
      if (locationData.code !== undefined && locationData.code !== existingLocation.code) {
        const codeExists = await this.locationRepository.checkCodeExists(locationData.code, id);
        if (codeExists) {
          throw new Error(`Kode lokasi '${locationData.code}' sudah digunakan`);
        }
      }

      // Check if name already exists (excluding current location)
      if (locationData.name !== undefined && locationData.name !== existingLocation.name) {
        const nameExists = await this.locationRepository.checkNameExists(locationData.name, id);
        if (nameExists) {
          throw new Error(`Nama lokasi '${locationData.name}' sudah digunakan`);
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
        throw new Error(`Tidak dapat menghapus lokasi '${existingLocation.name}' karena masih terdapat ${existingLocation.assets.length} aset yang menggunakan lokasi ini. Silakan pindahkan atau hapus aset terlebih dahulu.`);
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
      throw new Error('Kode lokasi harus diisi');
    }

    if (!locationData.name || !locationData.name.trim()) {
      throw new Error('Nama lokasi harus diisi');
    }

    if (locationData.code.length > 50) {
      throw new Error('Kode lokasi maksimal 50 karakter');
    }

    if (locationData.name.length > 255) {
      throw new Error('Nama lokasi maksimal 255 karakter');
    }

    if (locationData.building && locationData.building.length > 255) {
      throw new Error('Nama gedung maksimal 255 karakter');
    }

    if (locationData.floor && locationData.floor.length > 50) {
      throw new Error('Lantai maksimal 50 karakter');
    }

    if (locationData.room && locationData.room.length > 100) {
      throw new Error('Ruangan maksimal 100 karakter');
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

  validateLocationDataForUpdate(locationData) {
    // For updates, only validate fields that are provided
    if (locationData.code !== undefined) {
      if (!locationData.code || !locationData.code.trim()) {
        throw new Error('Kode lokasi tidak boleh kosong');
      }
      if (locationData.code.length > 50) {
        throw new Error('Kode lokasi maksimal 50 karakter');
      }
      locationData.code = locationData.code.trim();
    }

    if (locationData.name !== undefined) {
      if (!locationData.name || !locationData.name.trim()) {
        throw new Error('Nama lokasi tidak boleh kosong');
      }
      if (locationData.name.length > 255) {
        throw new Error('Nama lokasi maksimal 255 karakter');
      }
      locationData.name = locationData.name.trim();
    }

    if (locationData.building !== undefined && locationData.building) {
      if (locationData.building.length > 255) {
        throw new Error('Nama gedung maksimal 255 karakter');
      }
      locationData.building = locationData.building.trim();
    }

    if (locationData.floor !== undefined && locationData.floor) {
      if (locationData.floor.length > 50) {
        throw new Error('Lantai maksimal 50 karakter');
      }
      locationData.floor = locationData.floor.trim();
    }

    if (locationData.room !== undefined && locationData.room) {
      if (locationData.room.length > 100) {
        throw new Error('Ruangan maksimal 100 karakter');
      }
      locationData.room = locationData.room.trim();
    }

    if (locationData.description !== undefined && locationData.description) {
      locationData.description = locationData.description.trim();
    }
  }

  async generateNextLocationCode() {
    try {
      // Get all existing locations to find the highest code
      const existingLocations = await this.locationRepository.getAllCodes();

      if (!existingLocations || existingLocations.length === 0) {
        return '001';
      }

      // Extract numeric codes from different patterns and find the highest
      const numericCodes = existingLocations
        .map(location => {
          // Try to extract numbers from different patterns:
          // 1. Pure numeric codes like "001", "002", "052" etc.
          let match = location.code.match(/^(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num;
          }

          // 2. Alphanumeric codes ending with numbers like "RD001", "RA001" etc.
          match = location.code.match(/^[A-Za-z]+(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num;
          }

          // 3. Mixed patterns with numbers at the end
          match = location.code.match(/(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num;
          }

          return 0;
        })
        .filter(code => !isNaN(code) && code > 0);

      const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
      const nextCode = maxCode + 1;

      // Format with leading zeros to maintain 3-digit format
      return nextCode.toString().padStart(3, '0');
    } catch (error) {
      logger.error('Error generating next location code:', error);
      // Fallback to timestamp-based code if generation fails
      return `L${Date.now().toString().slice(-6)}`;
    }
  }
}

module.exports = LocationUseCase;
