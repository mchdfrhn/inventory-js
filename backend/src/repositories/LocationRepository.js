const { Location } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class LocationRepository {
  async create(locationData) {
    try {
      const location = await Location.create(locationData);
      logger.info(`Location created: ${location.name} (${location.code})`);
      return location;
    } catch (error) {
      logger.error('Error creating location:', error);
      throw error;
    }
  }

  async update(id, locationData) {
    try {
      const [updatedRowsCount] = await Location.update(locationData, {
        where: { id },
        returning: true,
      });

      if (updatedRowsCount === 0) {
        throw new Error('Location not found');
      }

      const updatedLocation = await this.getById(id);
      logger.info(`Location updated: ${updatedLocation.name} (${updatedLocation.code})`);
      return updatedLocation;
    } catch (error) {
      logger.error('Error updating location:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const location = await this.getById(id);
      if (!location) {
        throw new Error('Location not found');
      }

      const deletedRowsCount = await Location.destroy({
        where: { id },
      });

      if (deletedRowsCount === 0) {
        throw new Error('Location not found');
      }

      logger.info(`Location deleted: ${location.name} (${location.code})`);
      return true;
    } catch (error) {
      logger.error('Error deleting location:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const location = await Location.findByPk(id, {
        include: [
          {
            association: 'assets',
            attributes: ['id', 'kode', 'nama'],
          },
        ],
      });
      return location;
    } catch (error) {
      logger.error('Error getting location by ID:', error);
      throw error;
    }
  }

  async getByCode(code) {
    try {
      const location = await Location.findOne({
        where: { code },
        include: [
          {
            association: 'assets',
            attributes: ['id', 'kode', 'nama'],
          },
        ],
      });
      return location;
    } catch (error) {
      logger.error('Error getting location by code:', error);
      throw error;
    }
  }

  async list(page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Location.findAndCountAll({
        order: [['code', 'ASC']],
        limit: pageSize,
        offset,
        include: [
          {
            association: 'assets',
            attributes: ['id'],
          },
        ],
      });

      return {
        data: rows,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      };
    } catch (error) {
      logger.error('Error listing locations:', error);
      throw error;
    }
  }

  async search(query, page = 1, pageSize = 10) {
    try {
      console.log('LocationRepository.search called with:', { query, page, pageSize });
      const offset = (page - 1) * pageSize;
      console.log('Calculated offset:', offset);
      const whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { code: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { building: { [Op.iLike]: `%${query}%` } },
          { floor: { [Op.iLike]: `%${query}%` } },
          { room: { [Op.iLike]: `%${query}%` } },
        ],
      };

      const { count, rows } = await Location.findAndCountAll({
        where: whereClause,
        order: [['code', 'ASC']],
        limit: pageSize,
        offset,
        include: [
          {
            association: 'assets',
            attributes: ['id'],
          },
        ],
      });

      return {
        data: rows,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      };
    } catch (error) {
      logger.error('Error searching locations:', error);
      throw error;
    }
  }

  async checkCodeExists(code, excludeId = null) {
    try {
      const whereClause = { code };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const location = await Location.findOne({
        where: whereClause,
      });

      return !!location;
    } catch (error) {
      logger.error('Error checking if location code exists:', error);
      throw error;
    }
  }

  async checkNameExists(name, excludeId = null) {
    try {
      const whereClause = { name };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const location = await Location.findOne({
        where: whereClause,
      });

      return !!location;
    } catch (error) {
      logger.error('Error checking if location name exists:', error);
      throw error;
    }
  }

  async getAllCodes() {
    try {
      const locations = await Location.findAll({
        attributes: ['code'],
        order: [['code', 'ASC']],
      });
      return locations;
    } catch (error) {
      logger.error('Error getting all location codes:', error);
      throw error;
    }
  }
}

module.exports = LocationRepository;
