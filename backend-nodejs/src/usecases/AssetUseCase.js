const AssetRepository = require('../repositories/AssetRepository');
const AssetCategoryRepository = require('../repositories/AssetCategoryRepository');
const LocationRepository = require('../repositories/LocationRepository');
const AuditLogUseCase = require('./AuditLogUseCase');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const logger = require('../utils/logger');

class AssetUseCase {
  constructor() {
    this.assetRepository = new AssetRepository();
    this.categoryRepository = new AssetCategoryRepository();
    this.locationRepository = new LocationRepository();
    this.auditLogUseCase = new AuditLogUseCase();
  }

  async createAsset(assetData, metadata = {}) {
    try {
      // Generate kode if not provided using enhanced algorithm
      if (!assetData.kode) {
        // Get next available sequence like Go implementation
        const sequence = await this.getNextAvailableSequenceRange(1);
        assetData.kode = await this.generateAssetCodeWithSequence(assetData.category_id, assetData, sequence);
      }

      // Validate required fields
      await this.validateAssetData(assetData);

      // Check if kode already exists
      const kodeExists = await this.assetRepository.checkKodeExists(assetData.kode);
      if (kodeExists) {
        throw new Error(`Asset with code '${assetData.kode}' already exists`);
      }

      // Set default values
      assetData.bulk_sequence = assetData.bulk_sequence || 1;
      assetData.is_bulk_parent = false;
      assetData.bulk_total_count = 1;

      // Calculate depreciation values
      assetData = await this.calculateDepreciationValues(assetData);

      // Create asset
      const asset = await this.assetRepository.create(assetData);

      // Log audit
      await this.auditLogUseCase.logAssetCreated(asset, metadata);

      return asset;
    } catch (error) {
      logger.error('Error in createAsset usecase:', error);
      throw error;
    }
  }

  async createAssetWithSequence(assetData, sequence, metadata = {}) {
    try {
      // Generate kode using provided sequence
      assetData.kode = await this.generateAssetCodeWithSequence(assetData.category_id, assetData, sequence);

      // Validate required fields
      await this.validateAssetData(assetData);

      // Check if kode already exists
      const kodeExists = await this.assetRepository.checkKodeExists(assetData.kode);
      if (kodeExists) {
        throw new Error(`Asset with code '${assetData.kode}' already exists`);
      }

      // Set default values
      assetData.bulk_sequence = sequence;
      assetData.is_bulk_parent = false;
      assetData.bulk_total_count = 1;

      // Calculate depreciation values
      assetData = await this.calculateDepreciationValues(assetData);

      // Create asset
      const asset = await this.assetRepository.create(assetData);

      // Log audit
      await this.auditLogUseCase.logAssetCreated(asset, metadata);

      return asset;
    } catch (error) {
      logger.error('Error in createAssetWithSequence usecase:', error);
      throw error;
    }
  }

  async createBulkAssetWithSequence(assetData, quantity, startSequence, metadata = {}) {
    try {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Validate base asset data
      await this.validateAssetData(assetData);

      // Generate bulk ID
      const bulkId = uuidv4();

      // Prepare bulk assets
      const assetsToCreate = [];

      for (let i = 0; i < quantity; i++) {
        const sequence = startSequence + i;
        const assetKode = await this.generateAssetCodeWithSequence(assetData.category_id, assetData, sequence);

        // Check if this specific kode exists
        const kodeExists = await this.assetRepository.checkKodeExists(assetKode);
        if (kodeExists) {
          throw new Error(`Asset with code '${assetKode}' already exists`);
        }

        const assetItem = {
          ...assetData,
          id: uuidv4(),
          kode: assetKode,
          bulk_id: bulkId,
          bulk_sequence: i + 1, // Bulk sequence within the group (1, 2, 3...)
          is_bulk_parent: i === 0,
          bulk_total_count: quantity,
          quantity: 1, // Each bulk asset has quantity 1
        };

        // Calculate depreciation values for each asset
        const calculatedAssetItem = await this.calculateDepreciationValues(assetItem);
        assetsToCreate.push(calculatedAssetItem);
      }

      // Create all assets
      const createdAssets = await this.assetRepository.createBulk(assetsToCreate);

      // Log audit
      await this.auditLogUseCase.logBulkAssetCreated(createdAssets, metadata);

      return createdAssets;
    } catch (error) {
      logger.error('Error in createBulkAssetWithSequence usecase:', error);
      throw error;
    }
  }

  async createBulkAsset(assetData, quantity, metadata = {}) {
    try {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      if (quantity === 1) {
        return [await this.createAsset(assetData, metadata)];
      }

      // Generate kode if not provided using enhanced algorithm
      if (!assetData.kode) {
        assetData.kode = await this.generateAssetCode(assetData.category_id, assetData);
      }

      // Validate base asset data
      await this.validateAssetData(assetData);

      // Generate bulk ID
      const bulkId = uuidv4();

      // Get next available sequence range like Go implementation
      const startSequence = await this.getNextAvailableSequenceRange(quantity);

      // Prepare bulk assets
      const assetsToCreate = [];

      for (let i = 0; i < quantity; i++) {
        const sequence = startSequence + i;
        const assetKode = await this.generateAssetCodeWithSequence(assetData.category_id, assetData, sequence);

        // Check if this specific kode exists
        const kodeExists = await this.assetRepository.checkKodeExists(assetKode);
        if (kodeExists) {
          throw new Error(`Asset with code '${assetKode}' already exists`);
        }

        const assetItem = {
          ...assetData,
          id: uuidv4(),
          kode: assetKode,
          bulk_id: bulkId,
          bulk_sequence: i + 1, // Bulk sequence within the group (1, 2, 3...)
          is_bulk_parent: i === 0, // First item is parent
          bulk_total_count: quantity,
          quantity: 1, // Each bulk asset has quantity 1
        };

        // Calculate depreciation values for each asset
        const calculatedAssetItem = await this.calculateDepreciationValues(assetItem);
        assetsToCreate.push(calculatedAssetItem);
      }

      // Create all assets
      const createdAssets = await this.assetRepository.createBulk(assetsToCreate);

      // Log audit
      await this.auditLogUseCase.logBulkAssetCreated(createdAssets, metadata);

      return createdAssets;
    } catch (error) {
      logger.error('Error in createBulkAsset usecase:', error);
      throw error;
    }
  }


  async getNextAvailableSequenceRange(count) {
    try {
      const result = await this.assetRepository.getNextAvailableSequenceRange(count);
      return result.start; // Return start sequence like Go implementation
    } catch (error) {
      logger.error('Error in getNextAvailableSequenceRange usecase:', error);
      throw error;
    }
  }

  async updateAsset(assetData, metadata = {}) {
    try {
      // Get existing asset
      const existingAsset = await this.assetRepository.getById(assetData.id);
      if (!existingAsset) {
        throw new Error('Asset not found');
      }

      // Validate asset data
      await this.validateAssetData(assetData, assetData.id);

      // Check if kode already exists (excluding current asset)
      if (assetData.kode !== existingAsset.kode) {
        const kodeExists = await this.assetRepository.checkKodeExists(assetData.kode, assetData.id);
        if (kodeExists) {
          throw new Error(`Asset with code '${assetData.kode}' already exists`);
        }
      }

      // Calculate depreciation values
      assetData = await this.calculateDepreciationValues(assetData);

      // Update asset
      const updatedAsset = await this.assetRepository.update(assetData);

      // Log audit
      await this.auditLogUseCase.logAssetUpdated(existingAsset, updatedAsset, metadata);

      return updatedAsset;
    } catch (error) {
      logger.error('Error in updateAsset usecase:', error);
      throw error;
    }
  }

  async updateBulkAssets(bulkId, assetData, metadata = {}) {
    try {
      // Get existing bulk assets
      const existingAssets = await this.assetRepository.getBulkAssets(bulkId);
      if (!existingAssets || existingAssets.length === 0) {
        throw new Error('Bulk assets not found');
      }

      // Validate common asset data (excluding kode as it's unique per asset)
      const dataToValidate = { ...assetData };
      delete dataToValidate.kode; // Don't validate kode for bulk update
      await this.validateAssetData(dataToValidate, null, true);

      // Calculate depreciation values
      const calculatedAssetData = await this.calculateDepreciationValues(assetData);

      // Update bulk assets
      const updatedAssets = await this.assetRepository.updateBulkAssets(bulkId, calculatedAssetData);

      // Log audit
      await this.auditLogUseCase.logBulkAssetUpdated(bulkId, existingAssets, updatedAssets, metadata);

      return updatedAssets;
    } catch (error) {
      logger.error('Error in updateBulkAssets usecase:', error);
      throw error;
    }
  }

  async deleteAsset(id, metadata = {}) {
    try {
      // Get existing asset
      const existingAsset = await this.assetRepository.getById(id);
      if (!existingAsset) {
        throw new Error('Asset not found');
      }

      // Delete asset
      await this.assetRepository.delete(id);

      // Log audit
      await this.auditLogUseCase.logAssetDeleted(existingAsset, metadata);

      return true;
    } catch (error) {
      logger.error('Error in deleteAsset usecase:', error);
      throw error;
    }
  }

  async deleteBulkAssets(bulkId, metadata = {}) {
    try {
      // Get existing bulk assets
      const existingAssets = await this.assetRepository.getBulkAssets(bulkId);
      if (!existingAssets || existingAssets.length === 0) {
        throw new Error('Bulk assets not found');
      }

      // Delete bulk assets
      await this.assetRepository.deleteBulkAssets(bulkId);

      // Log audit
      await this.auditLogUseCase.logBulkAssetDeleted(bulkId, existingAssets, metadata);

      return true;
    } catch (error) {
      logger.error('Error in deleteBulkAssets usecase:', error);
      throw error;
    }
  }

  async getAsset(id) {
    try {
      const asset = await this.assetRepository.getById(id);
      if (!asset) {
        throw new Error('Asset not found');
      }
      return asset;
    } catch (error) {
      logger.error('Error in getAsset usecase:', error);
      throw error;
    }
  }

  async getAssetById(id) {
    try {
      const asset = await this.assetRepository.getById(id);
      if (!asset) {
        throw new Error('Asset not found');
      }
      return asset;
    } catch (error) {
      logger.error('Error in getAssetById usecase:', error);
      throw error;
    }
  }

  async getBulkAssets(bulkId) {
    try {
      const assets = await this.assetRepository.getBulkAssets(bulkId);
      if (!assets || assets.length === 0) {
        throw new Error('Bulk assets not found');
      }
      return assets;
    } catch (error) {
      logger.error('Error in getBulkAssets usecase:', error);
      throw error;
    }
  }

  async listAssets(filter = {}) {
    try {
      const assets = await this.assetRepository.list(filter);
      return assets;
    } catch (error) {
      logger.error('Error in listAssets usecase:', error);
      throw error;
    }
  }

  async listAssetsPaginated(filter = {}, page = 1, pageSize = 10) {
    try {
      const result = await this.assetRepository.listPaginated(filter, page, pageSize);
      return result;
    } catch (error) {
      logger.error('Error in listAssetsPaginated usecase:', error);
      throw error;
    }
  }

  async listAssetsWithBulk(filter = {}, page = 1, pageSize = 10) {
    try {
      const result = await this.assetRepository.listPaginatedWithBulk(filter, page, pageSize);
      return result;
    } catch (error) {
      logger.error('Error in listAssetsWithBulk usecase:', error);
      throw error;
    }
  }

  async getAllAssets() {
    try {
      const assets = await this.assetRepository.list({});
      return assets;
    } catch (error) {
      logger.error('Error in getAllAssets usecase:', error);
      throw error;
    }
  }

  async getLocationById(id) {
    try {
      const location = await this.locationRepository.getById(id);
      return location;
    } catch (error) {
      logger.error('Error in getLocationById usecase:', error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      const category = await this.categoryRepository.getById(id);
      return category;
    } catch (error) {
      logger.error('Error in getCategoryById usecase:', error);
      throw error;
    }
  }

  async getLocationByCode(code) {
    try {
      const location = await this.locationRepository.getByCode(code);
      return location;
    } catch (error) {
      logger.error('Error in getLocationByCode usecase:', error);
      throw error;
    }
  }

  async getCategoryByCode(code) {
    try {
      const category = await this.categoryRepository.getByCode(code);
      return category;
    } catch (error) {
      logger.error('Error in getCategoryByCode usecase:', error);
      throw error;
    }
  }

  async validateAssetData(assetData, excludeId = null, isBulkUpdate = false) {
    // Required field validation
    // kode is not required for creation as it will be auto-generated
    if (!isBulkUpdate && excludeId && (!assetData.kode || !assetData.kode.trim())) {
      throw new Error('Asset code (kode) is required');
    }

    if (!assetData.nama || !assetData.nama.trim()) {
      throw new Error('Asset name (nama) is required');
    }

    if (!assetData.satuan || !assetData.satuan.trim()) {
      throw new Error('Unit (satuan) is required');
    }

    if (!assetData.tanggal_perolehan) {
      throw new Error('Acquisition date (tanggal_perolehan) is required');
    }

    if (assetData.harga_perolehan === undefined || assetData.harga_perolehan === null) {
      throw new Error('Acquisition price (harga_perolehan) is required');
    }

    if (!assetData.category_id) {
      throw new Error('Category ID is required');
    }

    // Validation rules
    if (!isBulkUpdate && assetData.kode.length > 50) {
      throw new Error('Asset code must be 50 characters or less');
    }

    if (assetData.nama.length > 255) {
      throw new Error('Asset name must be 255 characters or less');
    }

    if (assetData.satuan.length > 50) {
      throw new Error('Unit must be 50 characters or less');
    }

    if (assetData.quantity !== undefined && assetData.quantity < 0) {
      throw new Error('Quantity must be greater than or equal to 0');
    }

    if (assetData.harga_perolehan < 0) {
      throw new Error('Acquisition price must be greater than or equal to 0');
    }

    if (assetData.umur_ekonomis_tahun !== undefined && assetData.umur_ekonomis_tahun < 0) {
      throw new Error('Economic life (years) must be greater than or equal to 0');
    }

    if (assetData.umur_ekonomis_bulan !== undefined && (assetData.umur_ekonomis_bulan < 0 || assetData.umur_ekonomis_bulan > 11)) {
      throw new Error('Economic life (months) must be between 0 and 11');
    }

    if (assetData.akumulasi_penyusutan !== undefined && assetData.akumulasi_penyusutan < 0) {
      throw new Error('Accumulated depreciation must be greater than or equal to 0');
    }

    if (assetData.nilai_sisa !== undefined && assetData.nilai_sisa < 0) {
      throw new Error('Residual value must be greater than or equal to 0');
    }

    // Date validation
    const tanggalPerolehan = moment(assetData.tanggal_perolehan);
    if (!tanggalPerolehan.isValid()) {
      throw new Error('Invalid acquisition date format');
    }

    if (tanggalPerolehan.isAfter(moment())) {
      throw new Error('Acquisition date cannot be in the future');
    }

    // Status validation
    const validStatuses = ['baik', 'rusak', 'dalam_perbaikan', 'tidak_aktif'];
    if (assetData.status && !validStatuses.includes(assetData.status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Foreign key validation
    const category = await this.categoryRepository.getById(assetData.category_id);
    if (!category) {
      throw new Error('Category not found');
    }

    if (assetData.lokasi_id) {
      const location = await this.locationRepository.getById(assetData.lokasi_id);
      if (!location) {
        throw new Error('Location not found');
      }
    }

    // Clean up data
    if (!isBulkUpdate && assetData.kode) {
      assetData.kode = assetData.kode.trim();
    }
    assetData.nama = assetData.nama.trim();
    assetData.satuan = assetData.satuan.trim();

    if (assetData.spesifikasi) {
      assetData.spesifikasi = assetData.spesifikasi.trim();
    }
    if (assetData.keterangan) {
      assetData.keterangan = assetData.keterangan.trim();
    }
    if (assetData.lokasi) {
      assetData.lokasi = assetData.lokasi.trim();
    }
    if (assetData.asal_pengadaan) {
      assetData.asal_pengadaan = assetData.asal_pengadaan.trim();
    }

    // Set defaults
    if (assetData.quantity === undefined) {
      assetData.quantity = 1;
    }
    if (assetData.umur_ekonomis_tahun === undefined) {
      assetData.umur_ekonomis_tahun = 0;
    }
    if (assetData.umur_ekonomis_bulan === undefined) {
      assetData.umur_ekonomis_bulan = 0;
    }
    if (assetData.akumulasi_penyusutan === undefined) {
      assetData.akumulasi_penyusutan = 0;
    }
    if (assetData.nilai_sisa === undefined) {
      assetData.nilai_sisa = 0;
    }
    if (!assetData.status) {
      assetData.status = 'baik';
    }
  }

  async generateAssetCode(categoryId, assetData = {}) {
    try {
      // Get category info to construct the code
      const category = await this.categoryRepository.getById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Get location code (default to '001' if not provided)
      let locationCode = '001';
      if (assetData.lokasi_id) {
        const location = await this.locationRepository.getById(assetData.lokasi_id);
        if (location && location.code) {
          locationCode = location.code.padStart(3, '0');
        }
      }

      // Get category code (default to '10' if not provided)
      const categoryCode = category.code ? category.code.padStart(2, '0') : '10';

      // Map procurement source to code
      const procurementMap = {
        'pembelian': '1',
        'bantuan': '2',
        'hibah': '3',
        'sumbangan': '4',
        'produksi_sendiri': '5',
      };
      const procurementCode = procurementMap[assetData.asal_pengadaan] || '1';

      // Get year from tanggal_perolehan
      const year = assetData.tanggal_perolehan
        ? new Date(assetData.tanggal_perolehan).getFullYear()
        : new Date().getFullYear();
      const yearCode = String(year).slice(-2).padStart(2, '0');

      // Get next available sequence
      const sequence = await this.getNextAvailableSequence();
      const sequenceCode = String(sequence).padStart(3, '0');

      // Generate the new code with format: 001.10.1.24.001
      const newCode = `${locationCode}.${categoryCode}.${procurementCode}.${yearCode}.${sequenceCode}`;

      return newCode;
    } catch (error) {
      logger.error('Error generating asset code:', error);
      // Fallback to UUID-based code if generation fails
      return `AST-${uuidv4().substring(0, 8).toUpperCase()}`;
    }
  }

  async generateAssetCodeWithSequence(categoryId, assetData = {}, sequence) {
    try {
      // Get category info to construct the code
      const category = await this.categoryRepository.getById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Get location code (default to '001' if not provided)
      let locationCode = '001';
      if (assetData.lokasi_id) {
        const location = await this.locationRepository.getById(assetData.lokasi_id);
        if (location && location.code) {
          locationCode = location.code.padStart(3, '0');
        }
      }

      // Get category code (default to '10' if not provided)
      const categoryCode = category.code ? category.code.padStart(2, '0') : '10';

      // Map procurement source to code
      const procurementMap = {
        'pembelian': '1',
        'bantuan': '2',
        'hibah': '3',
        'sumbangan': '4',
        'produksi_sendiri': '5',
      };
      const procurementCode = procurementMap[assetData.asal_pengadaan] || '1';

      // Get year from tanggal_perolehan
      const year = assetData.tanggal_perolehan
        ? new Date(assetData.tanggal_perolehan).getFullYear()
        : new Date().getFullYear();
      const yearCode = String(year).slice(-2).padStart(2, '0');

      // Use provided sequence
      const sequenceCode = String(sequence).padStart(3, '0');

      // Generate the new code with format: 001.10.1.24.001
      const newCode = `${locationCode}.${categoryCode}.${procurementCode}.${yearCode}.${sequenceCode}`;

      return newCode;
    } catch (error) {
      logger.error('Error generating asset code with sequence:', error);
      // Fallback to UUID-based code if generation fails
      return `AST-${uuidv4().substring(0, 8).toUpperCase()}`;
    }
  }

  async calculateDepreciationValues(assetData) {
    try {
      // Convert economic life from years to months
      const umurEkonomisTahun = assetData.umur_ekonomis_tahun || 0;
      const umurEkonomisBulan = umurEkonomisTahun * 12;

      // Calculate months in use
      const now = new Date();
      const tanggalPerolehan = new Date(assetData.tanggal_perolehan);

      const yearsDiff = now.getFullYear() - tanggalPerolehan.getFullYear();
      const monthsDiff = now.getMonth() - tanggalPerolehan.getMonth();
      let totalBulanPemakaian = yearsDiff * 12 + monthsDiff;

      // Ensure non-negative value
      if (totalBulanPemakaian < 0) {
        totalBulanPemakaian = 0;
      }

      // Cap depreciation at asset's economic life
      if (totalBulanPemakaian > umurEkonomisBulan) {
        totalBulanPemakaian = umurEkonomisBulan;
      }

      // Calculate depreciation and remaining value
      let akumulasiPenyusutan = 0;
      let nilaiSisa = assetData.harga_perolehan;

      if (umurEkonomisBulan > 0) {
        const penyusutanPerBulan = assetData.harga_perolehan / umurEkonomisBulan;
        akumulasiPenyusutan = penyusutanPerBulan * totalBulanPemakaian;
        // Round to 2 decimal places
        akumulasiPenyusutan = Math.round(akumulasiPenyusutan * 100) / 100;

        nilaiSisa = assetData.harga_perolehan - akumulasiPenyusutan;
        if (nilaiSisa < 0) {
          nilaiSisa = 0;
        }
        // Round to 2 decimal places
        nilaiSisa = Math.round(nilaiSisa * 100) / 100;
      }

      return {
        ...assetData,
        umur_ekonomis_bulan: umurEkonomisBulan,
        akumulasi_penyusutan: akumulasiPenyusutan,
        nilai_sisa: nilaiSisa,
      };
    } catch (error) {
      logger.error('Error calculating depreciation values:', error);
      return assetData;
    }
  }

  async getNextAvailableSequence() {
    try {
      const allAssets = await this.assetRepository.list({});

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
}

module.exports = AssetUseCase;
