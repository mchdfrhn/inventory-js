const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  building: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  floor: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  room: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['code']
    },
    {
      unique: true,
      fields: ['name']
    },
  ],
});

module.exports = Location;
