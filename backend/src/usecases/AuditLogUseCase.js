const AuditLogRepository = require('../repositories/AuditLogRepository');
const logger = require('../utils/logger');

class AuditLogUseCase {
  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  async logActivity(entityType, entityId, action, oldValues = null, newValues = null, description = '', metadata = {}) {
    try {
      // Clean dan extract data penting saja
      const cleanOldValues = oldValues ? this.extractImportantData(oldValues) : null;
      const cleanNewValues = newValues ? this.extractImportantData(newValues) : null;

      // Calculate changes
      let changes = null;
      if (cleanOldValues && cleanNewValues) {
        changes = this.calculateChanges(cleanOldValues, cleanNewValues);
      }

      const auditData = {
        entity_type: entityType,
        entity_id: entityId.toString(), // Convert to string
        action,
        changes,
        old_values: cleanOldValues,
        new_values: cleanNewValues,
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

    // Field yang penting untuk ditampilkan di audit log
    const importantFields = [
      'nama', 'kode', 'spesifikasi', 'status',
      'harga_perolehan', 'tanggal_perolehan', 'quantity', 'satuan',
      'umur_ekonomis_tahun', 'umur_ekonomis_bulan',
      'akumulasi_penyusutan', 'nilai_sisa', 'keterangan',
      'category_code', 'category_name', 'lokasi_code', 'lokasi_name', 'asal_pengadaan',
    ];

    // Hanya bandingkan field yang penting
    for (const key of importantFields) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      // Skip jika tidak ada perubahan
      if (oldValue === newValue) {
        continue;
      }

      // Skip jika kedua nilai null/undefined
      if (!oldValue && !newValue) {
        continue;
      }

      changes[key] = {
        from: this.formatValueForDisplay(oldValue, key),
        to: this.formatValueForDisplay(newValue, key),
      };
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  // Extract data penting saja dari Sequelize object
  extractImportantData(data) {
    if (!data) {
      return null;
    }

    // Jika data adalah Sequelize instance, ambil dataValues
    let cleanData = {};

    if (data.dataValues) {
      // Sequelize instance
      cleanData = { ...data.dataValues };
    } else {
      // Plain object
      cleanData = { ...data };
    }

    // Hanya ambil field yang penting
    const importantFields = [
      'id', 'nama', 'kode', 'spesifikasi', 'status',
      'harga_perolehan', 'tanggal_perolehan', 'quantity', 'satuan',
      'umur_ekonomis_tahun', 'umur_ekonomis_bulan',
      'akumulasi_penyusutan', 'nilai_sisa', 'keterangan',
      'category_id', 'lokasi_id', 'asal_pengadaan',
    ];

    const result = {};
    for (const field of importantFields) {
      if (field in cleanData) {
        result[field] = cleanData[field];
      }
    }

    // Tambahkan kode dan nama kategori dan lokasi jika ada
    if (data.category) {
      if (data.category.code) {
        result.category_code = data.category.code;
      }
      if (data.category.name) {
        result.category_name = data.category.name;
      }
    }

    if (data.location_info) {
      if (data.location_info.code) {
        result.lokasi_code = data.location_info.code;
      }
      if (data.location_info.name) {
        result.lokasi_name = data.location_info.name;
      }
    }

    return result;
  }

  // Format nilai agar mudah dibaca
  formatValueForDisplay(value, fieldName = '') {
    // Handle null/undefined
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    // Handle tanggal
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return value;
      }
    }

    // Handle harga/mata uang
    if (typeof value === 'number' && ['harga_perolehan', 'akumulasi_penyusutan', 'nilai_sisa'].includes(fieldName)) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }

    // Handle angka biasa
    if (typeof value === 'number') {
      return value.toString();
    }

    // Handle string panjang
    if (typeof value === 'string' && value.length > 30) {
      return value.substring(0, 30) + '...';
    }

    // Handle boolean
    if (typeof value === 'boolean') {
      return value ? 'Ya' : 'Tidak';
    }

    // Return string biasa
    return String(value);
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
