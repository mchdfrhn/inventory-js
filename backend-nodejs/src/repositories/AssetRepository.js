const { Asset, AssetCategory, Location } = require('../models');
const { Op, fn, col } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Updated asset repository with proper location fields
class AssetRepository {
  async create(assetData) {
    try {
      const asset = await Asset.create(assetData);
      logger.info(`Asset created: ${asset.nama} (${asset.kode})`);
      return await this.getById(asset.id);
    } catch (error) {
      logger.error('Error creating asset:', error);
      throw error;
    }
  }

  async createBulk(assetsData) {
    try {
      const assets = await Asset.bulkCreate(assetsData, { returning: true });
      logger.info(`Bulk assets created: ${assets.length} items`);
      return assets;
    } catch (error) {
      logger.error('Error creating bulk assets:', error);
      throw error;
    }
  }

  async update(assetData) {
    try {
      const [updatedRowsCount] = await Asset.update(assetData, {
        where: { id: assetData.id },
        returning: true,
      });

      if (updatedRowsCount === 0) {
        throw new Error('Asset not found');
      }

      const updatedAsset = await this.getById(assetData.id);
      logger.info(`Asset updated: ${updatedAsset.nama} (${updatedAsset.kode})`);
      return updatedAsset;
    } catch (error) {
      logger.error('Error updating asset:', error);
      throw error;
    }
  }

  async updateBulkAssets(bulkId, assetData) {
    try {
      const [updatedRowsCount] = await Asset.update(assetData, {
        where: { bulk_id: bulkId },
        returning: true,
      });

      if (updatedRowsCount === 0) {
        throw new Error('Bulk assets not found');
      }

      const updatedAssets = await this.getBulkAssets(bulkId);
      logger.info(`Bulk assets updated: ${updatedRowsCount} items with bulk_id ${bulkId}`);
      return updatedAssets;
    } catch (error) {
      logger.error('Error updating bulk assets:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const asset = await this.getById(id);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const deletedRowsCount = await Asset.destroy({
        where: { id },
      });

      if (deletedRowsCount === 0) {
        throw new Error('Asset not found');
      }

      logger.info(`Asset deleted: ${asset.nama} (${asset.kode})`);
      return true;
    } catch (error) {
      logger.error('Error deleting asset:', error);
      throw error;
    }
  }

  async deleteBulkAssets(bulkId) {
    try {
      const assets = await this.getBulkAssets(bulkId);
      if (!assets || assets.length === 0) {
        throw new Error('Bulk assets not found');
      }

      const deletedRowsCount = await Asset.destroy({
        where: { bulk_id: bulkId },
      });

      if (deletedRowsCount === 0) {
        throw new Error('Bulk assets not found');
      }

      logger.info(`Bulk assets deleted: ${deletedRowsCount} items with bulk_id ${bulkId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting bulk assets:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const asset = await Asset.findByPk(id, {
        include: [
          {
            model: AssetCategory,
            as: 'category',
            attributes: ['id', 'code', 'name', 'description'],
          },
          {
            model: Location,
            as: 'location_info',
            attributes: ['id', 'code', 'name', 'building', 'floor', 'room'],
          },
        ],
      });
      return asset;
    } catch (error) {
      logger.error('Error getting asset by ID:', error);
      throw error;
    }
  }

  async getBulkAssets(bulkId) {
    try {
      const assets = await Asset.findAll({
        where: { bulk_id: bulkId },
        order: [['bulk_sequence', 'ASC']],
        include: [
          {
            model: AssetCategory,
            as: 'category',
            attributes: ['id', 'code', 'name', 'description'],
          },
          {
            model: Location,
            as: 'location_info',
            attributes: ['id', 'code', 'name', 'building', 'floor', 'room'],
          },
        ],
      });
      return assets;
    } catch (error) {
      logger.error('Error getting bulk assets:', error);
      throw error;
    }
  }

  async list(filter = {}) {
    try {
      const whereClause = this.buildWhereClause(filter);
      
      const assets = await Asset.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: AssetCategory,
            as: 'category',
            attributes: ['id', 'code', 'name'],
          },
          {
            model: Location,
            as: 'location_info',
            attributes: ['id', 'code', 'name', 'building', 'floor', 'room'],
          },
        ],
      });

      return assets;
    } catch (error) {
      logger.error('Error listing assets:', error);
      throw error;
    }
  }

  async listPaginated(filter = {}, page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClause = this.buildWhereClause(filter);

      const { count, rows } = await Asset.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
        include: [
          {
            model: AssetCategory,
            as: 'category',
            attributes: ['id', 'code', 'name'],
          },
          {
            model: Location,
            as: 'location_info',
            attributes: ['id', 'code', 'name', 'building', 'floor', 'room'],
          },
        ],
        distinct: true, // For accurate count when using includes
      });

      return {
        data: rows,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      };
    } catch (error) {
      logger.error('Error listing assets with pagination:', error);
      throw error;
    }
  }

  async listPaginatedWithBulk(filter = {}, page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClause = this.buildWhereClause(filter);

      // Group by bulk_id for bulk assets, show individual assets normally
      const assets = await Asset.findAll({
        attributes: [
          'id',
          'kode',
          'nama',
          'spesifikasi',
          'quantity',
          'satuan',
          'tanggal_perolehan',
          'harga_perolehan',
          'status',
          'bulk_id',
          'is_bulk_parent',
          'bulk_total_count',
          'lokasi_id',
          'created_at',
          [fn('COUNT', col('bulk_id')), 'bulk_count'],
        ],
        where: whereClause,
        group: ['Asset.id', 'category.id', 'location_info.id'],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
        include: [
          {
            model: AssetCategory,
            as: 'category',
            attributes: ['id', 'code', 'name'],
          },
          {
            model: Location,
            as: 'location_info',
            attributes: ['id', 'code', 'name', 'building', 'floor', 'room'],
          },
        ],
      });

      // Get total count
      const totalCount = await Asset.count({
        where: whereClause,
        distinct: true,
        col: 'id',
      });

      return {
        data: assets,
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      logger.error('Error listing assets with bulk pagination:', error);
      throw error;
    }
  }

  async getNextAvailableSequence() {
    try {
      // Get all assets and parse their codes for sequences
      const allAssets = await Asset.findAll({
        attributes: ['kode'],
        order: [['created_at', 'ASC']]
      });

      const existingSequences = new Set();
      for (const asset of allAssets) {
        const code = asset.kode;
        if (code && code.includes('.')) {
          const parts = code.split('.');
          if (parts.length === 5) {
            // Last part is the sequence number
            const sequence = parseInt(parts[4]);
            if (!isNaN(sequence)) {
              existingSequences.add(sequence);
            }
          }
        }
      }

      // Find the first available sequence starting from 1
      let sequence = 1;
      while (existingSequences.has(sequence)) {
        sequence++;
      }

      return sequence;
    } catch (error) {
      logger.error('Error getting next available sequence:', error);
      return 1;
    }
  }

  async getNextAvailableSequenceRange(count) {
    try {
      // Get all assets and parse their codes for sequences
      const allAssets = await Asset.findAll({
        attributes: ['kode'],
        order: [['created_at', 'ASC']]
      });

      const existingSequences = new Set();
      for (const asset of allAssets) {
        const code = asset.kode;
        if (code && code.includes('.')) {
          const parts = code.split('.');
          if (parts.length === 5) {
            // Last part is the sequence number
            const sequence = parseInt(parts[4]);
            if (!isNaN(sequence)) {
              existingSequences.add(sequence);
            }
          }
        }
      }

      // Find the first available range starting from 1
      let start = 1;
      while (true) {
        let canAllocate = true;
        for (let i = 0; i < count; i++) {
          if (existingSequences.has(start + i)) {
            canAllocate = false;
            break;
          }
        }
        if (canAllocate) {
          return {
            start: start,
            end: start + count - 1,
          };
        }
        start++;
      }
    } catch (error) {
      logger.error('Error getting next available sequence range:', error);
      throw error;
    }
  }

  async checkKodeExists(kode, excludeId = null) {
    try {
      const whereClause = { kode };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const asset = await Asset.findOne({
        where: whereClause,
      });

      return !!asset;
    } catch (error) {
      logger.error('Error checking if asset kode exists:', error);
      throw error;
    }
  }

  buildWhereClause(filter) {
    const whereClause = {};

    if (filter.search) {
      whereClause[Op.or] = [
        { nama: { [Op.iLike]: `%${filter.search}%` } },
        { kode: { [Op.iLike]: `%${filter.search}%` } },
        { spesifikasi: { [Op.iLike]: `%${filter.search}%` } },
        { lokasi: { [Op.iLike]: `%${filter.search}%` } },
        { asal_pengadaan: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    if (filter.category_id) {
      whereClause.category_id = filter.category_id;
    }

    if (filter.lokasi_id) {
      whereClause.lokasi_id = filter.lokasi_id;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    if (filter.bulk_id) {
      whereClause.bulk_id = filter.bulk_id;
    }

    if (filter.is_bulk_parent !== undefined) {
      whereClause.is_bulk_parent = filter.is_bulk_parent;
    }

    if (filter.from_date && filter.to_date) {
      whereClause.tanggal_perolehan = {
        [Op.between]: [filter.from_date, filter.to_date],
      };
    } else if (filter.from_date) {
      whereClause.tanggal_perolehan = {
        [Op.gte]: filter.from_date,
      };
    } else if (filter.to_date) {
      whereClause.tanggal_perolehan = {
        [Op.lte]: filter.to_date,
      };
    }

    if (filter.min_price !== undefined) {
      whereClause.harga_perolehan = {
        ...whereClause.harga_perolehan,
        [Op.gte]: filter.min_price,
      };
    }

    if (filter.max_price !== undefined) {
      whereClause.harga_perolehan = {
        ...whereClause.harga_perolehan,
        [Op.lte]: filter.max_price,
      };
    }

    return whereClause;
  }

  async getLatestAssetByPrefix(prefix) {
    try {
      const asset = await Asset.findOne({
        where: {
          kode: {
            [Op.like]: `${prefix}%`
          }
        },
        order: [['kode', 'DESC']],
        attributes: ['id', 'kode']
      });

      return asset;
    } catch (error) {
      logger.error('Error getting latest asset by prefix:', error);
      throw error;
    }
  }
}

module.exports = AssetRepository;
