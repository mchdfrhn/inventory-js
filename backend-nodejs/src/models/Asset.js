const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  kode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50],
    },
  },
  nama: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
  spesifikasi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0,
    },
  },
  satuan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50],
    },
  },
  tanggal_perolehan: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  harga_perolehan: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  umur_ekonomis_tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  umur_ekonomis_bulan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 11,
    },
  },
  akumulasi_penyusutan: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  nilai_sisa: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lokasi: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  lokasi_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'locations',
      key: 'id',
    },
  },
  asal_pengadaan: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'asset_categories',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'baik',
    validate: {
      isIn: [['baik', 'rusak', 'tidak_memadai']],
    },
  },
  // Bulk asset fields
  bulk_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  bulk_sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  is_bulk_parent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  bulk_total_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'assets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['kode']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['lokasi_id']
    },
    {
      fields: ['bulk_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['tanggal_perolehan']
    },
  ],
});

module.exports = Asset;
