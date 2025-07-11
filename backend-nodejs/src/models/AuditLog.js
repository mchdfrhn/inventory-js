const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [['asset', 'category', 'location']],
    },
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [['create', 'update', 'delete']],
    },
  },
  changes: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('changes');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('changes', value ? JSON.stringify(value) : null);
    },
  },
  old_values: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('old_values');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('old_values', value ? JSON.stringify(value) : null);
    },
  },
  new_values: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('new_values');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('new_values', value ? JSON.stringify(value) : null);
    },
  },
  user_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Only track creation time
  indexes: [
    {
      fields: ['entity_type'],
    },
    {
      fields: ['entity_id'],
    },
    {
      fields: ['action'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['entity_type', 'entity_id'],
    },
  ],
});

module.exports = AuditLog;
