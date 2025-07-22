const { AuditLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AuditLogRepository {
  async create(auditData) {
    try {
      const auditLog = await AuditLog.create(auditData);
      return auditLog;
    } catch (error) {
      logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  async list(filter = {}) {
    try {
      const whereClause = this.buildWhereClause(filter);

      const auditLogs = await AuditLog.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
      });

      return auditLogs;
    } catch (error) {
      logger.error('Error listing audit logs:', error);
      throw error;
    }
  }

  async listPaginated(filter = {}, page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClause = this.buildWhereClause(filter);

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
      });

      return {
        data: rows,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      };
    } catch (error) {
      logger.error('Error listing audit logs with pagination:', error);
      throw error;
    }
  }

  async getByEntityId(entityType, entityId) {
    try {
      const auditLogs = await AuditLog.findAll({
        where: {
          entity_type: entityType,
          entity_id: entityId,
        },
        order: [['created_at', 'DESC']],
      });

      return auditLogs;
    } catch (error) {
      logger.error('Error getting audit logs by entity ID:', error);
      throw error;
    }
  }

  async deleteOldLogs(beforeDate) {
    try {
      const deletedCount = await AuditLog.destroy({
        where: {
          created_at: {
            [Op.lt]: beforeDate,
          },
        },
      });

      logger.info(`Deleted ${deletedCount} old audit logs before ${beforeDate}`);
      return deletedCount;
    } catch (error) {
      logger.error('Error deleting old audit logs:', error);
      throw error;
    }
  }

  buildWhereClause(filter) {
    const whereClause = {};

    if (filter.entity_type) {
      whereClause.entity_type = filter.entity_type;
    }

    if (filter.entity_id) {
      whereClause.entity_id = filter.entity_id;
    }

    if (filter.action) {
      whereClause.action = filter.action;
    }

    if (filter.user_id) {
      whereClause.user_id = filter.user_id;
    }

    if (filter.from_date && filter.to_date) {
      whereClause.created_at = {
        [Op.between]: [filter.from_date, filter.to_date],
      };
    } else if (filter.from_date) {
      whereClause.created_at = {
        [Op.gte]: filter.from_date,
      };
    } else if (filter.to_date) {
      whereClause.created_at = {
        [Op.lte]: filter.to_date,
      };
    }

    if (filter.search) {
      whereClause[Op.or] = [
        { description: { [Op.iLike]: `%${filter.search}%` } },
        { entity_type: { [Op.iLike]: `%${filter.search}%` } },
        { action: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    return whereClause;
  }
}

module.exports = AuditLogRepository;
