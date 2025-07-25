const { AssetCategory } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AssetCategoryRepository {
  async create(categoryData) {
    try {
      const category = await AssetCategory.create(categoryData);
      logger.info(`Asset category created: ${category.name} (${category.code})`);
      return category;
    } catch (error) {
      logger.error('Error creating asset category:', error);
      throw error;
    }
  }

  async update(id, categoryData) {
    try {
      const [updatedRowsCount] = await AssetCategory.update(categoryData, {
        where: { id },
        returning: true,
      });

      if (updatedRowsCount === 0) {
        throw new Error('Asset category not found');
      }

      const updatedCategory = await this.getById(id);
      logger.info(`Asset category updated: ${updatedCategory.name} (${updatedCategory.code})`);
      return updatedCategory;
    } catch (error) {
      logger.error('Error updating asset category:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const category = await this.getById(id);
      if (!category) {
        throw new Error('Asset category not found');
      }

      const deletedRowsCount = await AssetCategory.destroy({
        where: { id },
      });

      if (deletedRowsCount === 0) {
        throw new Error('Asset category not found');
      }

      logger.info(`Asset category deleted: ${category.name} (${category.code})`);
      return true;
    } catch (error) {
      logger.error('Error deleting asset category:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const category = await AssetCategory.findByPk(id, {
        include: [
          {
            association: 'assets',
            attributes: ['id', 'kode', 'nama'],
          },
        ],
      });
      return category;
    } catch (error) {
      logger.error('Error getting asset category by ID:', error);
      throw error;
    }
  }

  async getByCode(code) {
    try {
      const category = await AssetCategory.findOne({
        where: { code },
        include: [
          {
            association: 'assets',
            attributes: ['id', 'kode', 'nama'],
          },
        ],
      });
      return category;
    } catch (error) {
      logger.error('Error getting asset category by code:', error);
      throw error;
    }
  }

  async list() {
    try {
      const categories = await AssetCategory.findAll({
        order: [['code', 'ASC']],
        include: [
          {
            association: 'assets',
            attributes: ['id'],
          },
        ],
      });
      return categories;
    } catch (error) {
      logger.error('Error listing asset categories:', error);
      throw error;
    }
  }

  async listPaginated(page = 1, pageSize = 10, search = '') {
    try {
      const offset = (page - 1) * pageSize;
      const whereClause = search ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      } : {};

      const { count, rows } = await AssetCategory.findAndCountAll({
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
      logger.error('Error listing asset categories with pagination:', error);
      throw error;
    }
  }

  async checkCodeExists(code, excludeId = null) {
    try {
      const whereClause = { code };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const category = await AssetCategory.findOne({
        where: whereClause,
      });

      return !!category;
    } catch (error) {
      logger.error('Error checking if category code exists:', error);
      throw error;
    }
  }

  async checkNameExists(name, excludeId = null) {
    try {
      const whereClause = { name };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const category = await AssetCategory.findOne({
        where: whereClause,
      });

      return !!category;
    } catch (error) {
      logger.error('Error checking if category name exists:', error);
      throw error;
    }
  }

  async getAllCodes() {
    try {
      const categories = await AssetCategory.findAll({
        attributes: ['code'],
        order: [['code', 'ASC']],
      });
      return categories;
    } catch (error) {
      logger.error('Error getting all category codes:', error);
      throw error;
    }
  }
}

module.exports = AssetCategoryRepository;
