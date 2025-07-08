const AssetUseCase = require('../usecases/AssetUseCase');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class AssetController {
  constructor() {
    this.assetUseCase = new AssetUseCase();
  }

  async createAsset(req, res) {
    try {
      const assetData = req.body;
      const metadata = req.metadata;

      const asset = await this.assetUseCase.createAsset(assetData, metadata);

      res.status(201).json({
        success: true,
        message: 'Asset created successfully',
        data: asset,
      });
    } catch (error) {
      logger.error('Error in createAsset controller:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createBulkAsset(req, res) {
    try {
      const { quantity, ...assetData } = req.body;
      const metadata = req.metadata;

      const assets = await this.assetUseCase.createBulkAsset(assetData, quantity, metadata);

      res.status(201).json({
        success: true,
        message: `${assets.length} bulk assets created successfully`,
        data: assets,
      });
    } catch (error) {
      logger.error('Error in createBulkAsset controller:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateAsset(req, res) {
    try {
      const { id } = req.params;
      const assetData = { ...req.body, id };
      const metadata = req.metadata;

      const asset = await this.assetUseCase.updateAsset(assetData, metadata);

      res.status(200).json({
        success: true,
        message: 'Asset updated successfully',
        data: asset,
      });
    } catch (error) {
      logger.error('Error in updateAsset controller:', error);
      const status = error.message === 'Asset not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateBulkAssets(req, res) {
    try {
      const { bulk_id } = req.params;
      const assetData = req.body;
      const metadata = req.metadata;

      const assets = await this.assetUseCase.updateBulkAssets(bulk_id, assetData, metadata);

      res.status(200).json({
        success: true,
        message: `${assets.length} bulk assets updated successfully`,
        data: assets,
      });
    } catch (error) {
      logger.error('Error in updateBulkAssets controller:', error);
      const status = error.message === 'Bulk assets not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteAsset(req, res) {
    try {
      const { id } = req.params;
      const metadata = req.metadata;

      await this.assetUseCase.deleteAsset(id, metadata);

      res.status(200).json({
        success: true,
        message: 'Asset deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteAsset controller:', error);
      const status = error.message === 'Asset not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteBulkAssets(req, res) {
    try {
      const { bulk_id } = req.params;
      const metadata = req.metadata;

      await this.assetUseCase.deleteBulkAssets(bulk_id, metadata);

      res.status(200).json({
        success: true,
        message: 'Bulk assets deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteBulkAssets controller:', error);
      const status = error.message === 'Bulk assets not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAsset(req, res) {
    try {
      const { id } = req.params;

      const asset = await this.assetUseCase.getAsset(id);

      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      logger.error('Error in getAsset controller:', error);
      const status = error.message === 'Asset not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getBulkAssets(req, res) {
    try {
      const { bulk_id } = req.params;

      const assets = await this.assetUseCase.getBulkAssets(bulk_id);

      res.status(200).json({
        success: true,
        data: assets,
      });
    } catch (error) {
      logger.error('Error in getBulkAssets controller:', error);
      const status = error.message === 'Bulk assets not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async listAssets(req, res) {
    try {
      const {
        page,
        pageSize,
        search,
        category_id,
        lokasi_id,
        status,
        from_date,
        to_date,
        min_price,
        max_price,
        bulk_id,
        is_bulk_parent,
      } = req.query;

      const filter = {};
      if (search) filter.search = search;
      if (category_id) filter.category_id = category_id;
      if (lokasi_id) filter.lokasi_id = parseInt(lokasi_id);
      if (status) filter.status = status;
      if (from_date) filter.from_date = new Date(from_date);
      if (to_date) filter.to_date = new Date(to_date);
      if (min_price) filter.min_price = parseFloat(min_price);
      if (max_price) filter.max_price = parseFloat(max_price);
      if (bulk_id) filter.bulk_id = bulk_id;
      if (is_bulk_parent !== undefined) filter.is_bulk_parent = is_bulk_parent === 'true';

      if (page && pageSize) {
        const result = await this.assetUseCase.listAssetsPaginated(
          filter,
          parseInt(page),
          parseInt(pageSize)
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
      } else {
        const assets = await this.assetUseCase.listAssets(filter);

        res.status(200).json({
          success: true,
          data: assets,
        });
      }
    } catch (error) {
      logger.error('Error in listAssets controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async listAssetsWithBulk(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        category_id,
        lokasi_id,
        status,
        from_date,
        to_date,
        min_price,
        max_price,
      } = req.query;

      const filter = {};
      if (search) filter.search = search;
      if (category_id) filter.category_id = category_id;
      if (lokasi_id) filter.lokasi_id = parseInt(lokasi_id);
      if (status) filter.status = status;
      if (from_date) filter.from_date = new Date(from_date);
      if (to_date) filter.to_date = new Date(to_date);
      if (min_price) filter.min_price = parseFloat(min_price);
      if (max_price) filter.max_price = parseFloat(max_price);

      const result = await this.assetUseCase.listAssetsWithBulk(
        filter,
        parseInt(page),
        parseInt(pageSize)
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
      logger.error('Error in listAssetsWithBulk controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async importAssets(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is required',
        });
      }

      const filePath = req.file.path;
      const assets = [];
      const errors = [];

      // Parse CSV file
      const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Map CSV columns to asset fields
            const assetData = {
              kode: row.kode || row.code,
              nama: row.nama || row.name,
              spesifikasi: row.spesifikasi || row.specification,
              quantity: parseInt(row.quantity) || 1,
              satuan: row.satuan || row.unit,
              tanggal_perolehan: new Date(row.tanggal_perolehan || row.acquisition_date),
              harga_perolehan: parseFloat(row.harga_perolehan || row.acquisition_price),
              umur_ekonomis_tahun: parseInt(row.umur_ekonomis_tahun || row.economic_life_years) || 0,
              umur_ekonomis_bulan: parseInt(row.umur_ekonomis_bulan || row.economic_life_months) || 0,
              akumulasi_penyusutan: parseFloat(row.akumulasi_penyusutan || row.accumulated_depreciation) || 0,
              nilai_sisa: parseFloat(row.nilai_sisa || row.residual_value) || 0,
              keterangan: row.keterangan || row.description,
              lokasi: row.lokasi || row.location,
              asal_pengadaan: row.asal_pengadaan || row.procurement_source,
              category_id: row.category_id,
              status: row.status || 'baik',
            };

            assets.push(assetData);
          } catch (error) {
            errors.push(`Row ${assets.length + 1}: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            // Clean up uploaded file
            fs.unlinkSync(filePath);

            if (errors.length > 0) {
              return res.status(400).json({
                success: false,
                message: 'CSV parsing errors',
                errors,
              });
            }

            // Import assets
            const importedAssets = [];
            const importErrors = [];

            for (let i = 0; i < assets.length; i++) {
              try {
                const asset = await this.assetUseCase.createAsset(assets[i], req.metadata);
                importedAssets.push(asset);
              } catch (error) {
                importErrors.push(`Row ${i + 1}: ${error.message}`);
              }
            }

            res.status(200).json({
              success: true,
              message: `Import completed. ${importedAssets.length} assets imported successfully`,
              data: {
                imported: importedAssets.length,
                errors: importErrors,
              },
            });
          } catch (error) {
            logger.error('Error in asset import:', error);
            res.status(500).json({
              success: false,
              message: error.message,
            });
          }
        });
    } catch (error) {
      logger.error('Error in importAssets controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async exportAssets(req, res) {
    try {
      const assets = await this.assetUseCase.getAllAssets();

      const fileName = `assets_export_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = path.join(process.cwd(), 'temp', fileName);

      // Ensure temp directory exists
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const csvWriter = createCsvWriter({
        path: filePath,
        header: [
          { id: 'kode', title: 'Kode' },
          { id: 'nama', title: 'Nama' },
          { id: 'spesifikasi', title: 'Spesifikasi' },
          { id: 'quantity', title: 'Quantity' },
          { id: 'satuan', title: 'Satuan' },
          { id: 'tanggal_perolehan', title: 'Tanggal Perolehan' },
          { id: 'harga_perolehan', title: 'Harga Perolehan' },
          { id: 'umur_ekonomis_tahun', title: 'Umur Ekonomis (Tahun)' },
          { id: 'umur_ekonomis_bulan', title: 'Umur Ekonomis (Bulan)' },
          { id: 'akumulasi_penyusutan', title: 'Akumulasi Penyusutan' },
          { id: 'nilai_sisa', title: 'Nilai Sisa' },
          { id: 'keterangan', title: 'Keterangan' },
          { id: 'lokasi', title: 'Lokasi' },
          { id: 'asal_pengadaan', title: 'Asal Pengadaan' },
          { id: 'category_name', title: 'Kategori' },
          { id: 'status', title: 'Status' },
        ],
      });

      const csvData = assets.map(asset => ({
        kode: asset.kode,
        nama: asset.nama,
        spesifikasi: asset.spesifikasi,
        quantity: asset.quantity,
        satuan: asset.satuan,
        tanggal_perolehan: asset.tanggal_perolehan,
        harga_perolehan: asset.harga_perolehan,
        umur_ekonomis_tahun: asset.umur_ekonomis_tahun,
        umur_ekonomis_bulan: asset.umur_ekonomis_bulan,
        akumulasi_penyusutan: asset.akumulasi_penyusutan,
        nilai_sisa: asset.nilai_sisa,
        keterangan: asset.keterangan,
        lokasi: asset.lokasi,
        asal_pengadaan: asset.asal_pengadaan,
        category_name: asset.category ? asset.category.name : '',
        status: asset.status,
      }));

      await csvWriter.writeRecords(csvData);

      res.download(filePath, fileName, (err) => {
        if (err) {
          logger.error('Error downloading file:', err);
        }
        // Clean up file after download
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      logger.error('Error in exportAssets controller:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AssetController;
