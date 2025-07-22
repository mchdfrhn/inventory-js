const { sequelize } = require('../database/connection');
const Asset = require('./Asset');
const AssetCategory = require('./AssetCategory');
const Location = require('./Location');
const AuditLog = require('./AuditLog');

// Define associations
Asset.belongsTo(AssetCategory, {
  foreignKey: 'category_id',
  as: 'category',
});

AssetCategory.hasMany(Asset, {
  foreignKey: 'category_id',
  as: 'assets',
});

Asset.belongsTo(Location, {
  foreignKey: 'lokasi_id',
  as: 'location_info',
});

Location.hasMany(Asset, {
  foreignKey: 'lokasi_id',
  as: 'assets',
});

// Bulk asset self-reference (for grouping bulk assets)
Asset.hasMany(Asset, {
  foreignKey: 'bulk_id',
  as: 'bulk_items',
  sourceKey: 'bulk_id',
});

Asset.belongsTo(Asset, {
  foreignKey: 'bulk_id',
  as: 'bulk_parent',
  targetKey: 'bulk_id',
});

module.exports = {
  sequelize,
  Asset,
  AssetCategory,
  Location,
  AuditLog,
};
