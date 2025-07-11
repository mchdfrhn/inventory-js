const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

// Helper function to safely stringify objects (remove circular references)
function safeJSONStringify(obj) {
  if (!obj) return null;
  
  try {
    return JSON.stringify(obj, (key, value) => {
      // Skip Sequelize instance properties that cause circular references
      if (key === 'parent' || key === 'include' || key === 'sequelize' || key === 'dialect') {
        return undefined;
      }
      
      // Skip functions and undefined values
      if (typeof value === 'function' || value === undefined) {
        return undefined;
      }
      
      // For Sequelize model instances, convert to plain object
      if (value && typeof value.toJSON === 'function') {
        return value.toJSON();
      }
      
      return value;
    });
  } catch (error) {
    console.error('Error stringifying object:', error);
    return JSON.stringify({ error: 'Unable to serialize object' });
  }
}

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
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [['create', 'update', 'delete', 'bulk_create', 'bulk_update', 'bulk_delete']],
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
      this.setDataValue('changes', safeJSONStringify(value));
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
      this.setDataValue('old_values', safeJSONStringify(value));
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
      this.setDataValue('new_values', safeJSONStringify(value));
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
