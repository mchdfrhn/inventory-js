const AuditLogRepository = require('../repositories/AuditLogRepository');
const logger = require('../utils/logger');

class AuditLogUseCase {
  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  async logActivity(entityType, entityId, action, oldValues = null, newValues = null, description = '', metadata = {}) {
    try {
      // Calculate changes
      let changes = null;
      if (oldValues && newValues) {
        changes = this.calculateChanges(oldValues, newValues);
      }

      const auditData = {
        entity_type: entityType,
        entity_id: entityId.toString(), // Convert to string
        action,
        changes,
        old_values: oldValues,
        new_values: newValues,
        user_id: metadata.user_id || null,
        ip_address: metadata.ip_address || null,
        user_agent: metadata.user_agent || null,
        description,
      };

      const auditLog = await this.auditLogRepository.create(auditData);
      return auditLog;
    } catch (error) {
      logger.error('Error logging activity:', error);
      // Don't throw error to prevent breaking main operations
      return null;
    }
  }

  async getActivityHistory(entityType, entityId) {
    try {
      const auditLogs = await this.auditLogRepository.getByEntityId(entityType, entityId);
      return auditLogs;
    } catch (error) {
      logger.error('Error getting activity history:', error);
      throw error;
    }
  }

  async getActivityLogs(filter = {}, page = 1, pageSize = 10) {
    try {
      const result = await this.auditLogRepository.listPaginated(filter, page, pageSize);
      return result;
    } catch (error) {
      logger.error('Error getting activity logs:', error);
      throw error;
    }
  }

  async cleanupOldLogs(retentionDays = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedCount = await this.auditLogRepository.deleteOldLogs(cutoffDate);
      logger.info(`Cleaned up ${deletedCount} audit logs older than ${retentionDays} days`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old logs:', error);
      throw error;
    }
  }

  calculateChanges(oldValues, newValues) {
    const changes = {};

    // Compare all keys from both objects
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      // Skip timestamps and IDs that shouldn't be tracked
      if (['created_at', 'updated_at', 'id'].includes(key)) {
        continue;
      }

      if (oldValue !== newValue) {
        changes[key] = {
          from: oldValue,
          to: newValue,
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  // Helper methods for common audit actions
  async logAssetCreated(asset, metadata = {}) {
    return this.logActivity(
      'asset',
      asset.id,
      'create',
      null,
      asset,
      `Asset created: ${asset.nama} (${asset.kode})`,
      metadata,
    );
  }

  async logAssetUpdated(oldAsset, newAsset, metadata = {}) {
    return this.logActivity(
      'asset',
      newAsset.id,
      'update',
      oldAsset,
      newAsset,
      `Asset updated: ${newAsset.nama} (${newAsset.kode})`,
      metadata,
    );
  }

  async logAssetDeleted(asset, metadata = {}) {
    return this.logActivity(
      'asset',
      asset.id,
      'delete',
      asset,
      null,
      `Asset deleted: ${asset.nama} (${asset.kode})`,
      metadata,
    );
  }

  async logCategoryCreated(category, metadata = {}) {
    return this.logActivity(
      'category',
      category.id,
      'create',
      null,
      category,
      `Category created: ${category.name} (${category.code})`,
      metadata,
    );
  }

  async logCategoryUpdated(oldCategory, newCategory, metadata = {}) {
    return this.logActivity(
      'category',
      newCategory.id,
      'update',
      oldCategory,
      newCategory,
      `Category updated: ${newCategory.name} (${newCategory.code})`,
      metadata,
    );
  }

  async logCategoryDeleted(category, metadata = {}) {
    return this.logActivity(
      'category',
      category.id,
      'delete',
      category,
      null,
      `Category deleted: ${category.name} (${category.code})`,
      metadata,
    );
  }

  async logLocationCreated(location, metadata = {}) {
    return this.logActivity(
      'location',
      location.id,
      'create',
      null,
      location,
      `Location created: ${location.name} (${location.code})`,
      metadata,
    );
  }

  async logLocationUpdated(oldLocation, newLocation, metadata = {}) {
    return this.logActivity(
      'location',
      newLocation.id,
      'update',
      oldLocation,
      newLocation,
      `Location updated: ${newLocation.name} (${newLocation.code})`,
      metadata,
    );
  }

  async logLocationDeleted(location, metadata = {}) {
    return this.logActivity(
      'location',
      location.id,
      'delete',
      location,
      null,
      `Location deleted: ${location.name} (${location.code})`,
      metadata,
    );
  }

  async logBulkAssetCreated(assets, metadata = {}) {
    if (assets.length === 0) {return null;}

    const bulkId = assets[0].bulk_id;
    return this.logActivity(
      'asset',
      bulkId,
      'create',
      null,
      { bulk_count: assets.length, assets },
      `Bulk assets created: ${assets.length} items`,
      metadata,
    );
  }

  async logBulkAssetUpdated(bulkId, oldAssets, newAssets, metadata = {}) {
    return this.logActivity(
      'asset',
      bulkId,
      'update',
      { assets: oldAssets },
      { assets: newAssets },
      `Bulk assets updated: ${newAssets.length} items`,
      metadata,
    );
  }

  async logBulkAssetDeleted(bulkId, assets, metadata = {}) {
    return this.logActivity(
      'asset',
      bulkId,
      'delete',
      { assets },
      null,
      `Bulk assets deleted: ${assets.length} items`,
      metadata,
    );
  }
}

module.exports = AuditLogUseCase;
