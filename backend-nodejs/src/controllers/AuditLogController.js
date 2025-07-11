const AuditLogUseCase = require('../usecases/AuditLogUseCase');
const logger = require('../utils/logger');

class AuditLogController {
  constructor() {
    this.auditLogUseCase = new AuditLogUseCase();
  }

  async getActivityHistory(req, res) {
    try {
      const { entityType, entityId } = req.params;

      const auditLogs = await this.auditLogUseCase.getActivityHistory(entityType, entityId);

      res.status(200).json({
        success: true,
        data: auditLogs,
      });
    } catch (error) {
      logger.error('Error in getActivityHistory controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getActivityLogs(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        entity_type,
        entity_id,
        action,
        user_id,
        from_date,
        to_date,
        search,
      } = req.query;

      const filter = {};
      if (entity_type) {filter.entity_type = entity_type;}
      if (entity_id) {filter.entity_id = entity_id;}
      if (action) {filter.action = action;}
      if (user_id) {filter.user_id = user_id;}
      if (from_date) {filter.from_date = new Date(from_date);}
      if (to_date) {filter.to_date = new Date(to_date);}
      if (search) {filter.search = search;}

      const result = await this.auditLogUseCase.getActivityLogs(
        filter,
        parseInt(page),
        parseInt(pageSize),
      );

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
      logger.error('Error in getActivityLogs controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cleanupOldLogs(req, res) {
    try {
      const { retentionDays = 90 } = req.body;

      const deletedCount = await this.auditLogUseCase.cleanupOldLogs(parseInt(retentionDays));

      res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old audit logs`,
        data: { deletedCount },
      });
    } catch (error) {
      logger.error('Error in cleanupOldLogs controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AuditLogController;
