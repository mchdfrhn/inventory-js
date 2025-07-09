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

      // Read file content to detect separator
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      const firstLine = lines[0];
      
      // Auto-detect separator: prioritize semicolon if found, otherwise use comma
      let delimiter = ',';
      if (firstLine.includes(';')) {
        delimiter = ';';
      }

      // Parse CSV file with detected delimiter
      const stream = fs.createReadStream(filePath)
        .pipe(csv({ separator: delimiter }))
        .on('data', (row) => {
          try {
            // Map CSV columns to asset fields - Support both Indonesian and English headers
            const assetData = {
              nama: row['Nama Aset*'] || row['Asset Name*'] || row.nama || row.name,
              category_code: row['Kode Kategori*'] || row['Category Code*'] || row.category_code,
              spesifikasi: row['Spesifikasi'] || row['Specification'] || row.spesifikasi || row.specification,
              tanggal_perolehan: this.parseFlexibleDate(row['Tanggal Perolehan*'] || row['Acquisition Date*'] || row.tanggal_perolehan || row.acquisition_date),
              quantity: parseInt(row['Jumlah*'] || row['Quantity*'] || row.quantity) || 1,
              satuan: row['Satuan'] || row['Unit'] || row.satuan || row.unit || 'unit',
              harga_perolehan: parseFloat(row['Harga Perolehan*'] || row['Acquisition Price*'] || row.harga_perolehan || row.acquisition_price),
              umur_ekonomis_tahun: parseInt(row['Umur Ekonomis'] || row['Economic Life'] || row.umur_ekonomis_tahun || row.economic_life_years) || 0,
              lokasi_code: row['Kode Lokasi*'] || row['Location Code*'] || row.lokasi_code || row.location_code,
              asal_pengadaan: row['ID Asal Pengadaan*'] || row['Procurement Source*'] || row.asal_pengadaan || row.procurement_source,
              status: row['Status'] || row.status || 'baik',
              keterangan: row['Keterangan'] || row['Description'] || row.keterangan || row.description,
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

            // Process and import assets
            const importedAssets = [];
            const importErrors = [];

            // Get starting sequence for the entire import batch
            let totalAssetCount = 0;
            for (const asset of assets) {
              if (asset.quantity > 1) {
                // Check if satuan is eligible for bulk creation
                const bulkEligibleUnits = ['unit', 'pcs', 'set', 'buah'];
                const isEligible = bulkEligibleUnits.some(unit => 
                  asset.satuan?.toLowerCase() === unit.toLowerCase()
                );
                if (isEligible) {
                  totalAssetCount += asset.quantity; // Bulk assets count as quantity
                } else {
                  totalAssetCount += 1; // Non-bulk eligible, treat as single
                }
              } else {
                totalAssetCount += 1; // Single asset
              }
            }

            // Reserve sequence range for the entire batch
            const startSequence = await this.assetUseCase.getNextAvailableSequence();
            let currentSequence = startSequence;

            // Process assets in CSV order with sequential numbering
            for (let i = 0; i < assets.length; i++) {
              try {
                const asset = assets[i];
                
                // Resolve category and location by code
                const category = await this.assetUseCase.getCategoryByCode(asset.category_code);
                if (!category) {
                  importErrors.push(`Row ${i + 1}: Category with code '${asset.category_code}' not found`);
                  continue;
                }
                asset.category_id = category.id;

                if (asset.lokasi_code) {
                  const location = await this.assetUseCase.getLocationByCode(asset.lokasi_code);
                  if (!location) {
                    importErrors.push(`Row ${i + 1}: Location with code '${asset.lokasi_code}' not found`);
                    continue;
                  }
                  asset.lokasi_id = location.id;
                }

                // Clean up codes that are not needed for asset creation
                delete asset.category_code;
                delete asset.lokasi_code;

                if (asset.quantity > 1) {
                  // Check if satuan is eligible for bulk creation
                  const bulkEligibleUnits = ['unit', 'pcs', 'set', 'buah'];
                  const isEligible = bulkEligibleUnits.some(unit => 
                    asset.satuan?.toLowerCase() === unit.toLowerCase()
                  );

                  if (isEligible) {
                    // Create bulk asset with sequential sequence
                    const bulkResult = await this.assetUseCase.createBulkAssetWithSequence(asset, asset.quantity, currentSequence, req.metadata);
                    importedAssets.push(...bulkResult);
                    currentSequence += asset.quantity; // Move sequence forward by quantity
                  } else {
                    // Treat as single asset even if quantity > 1 for non-bulk eligible units
                    const singleAsset = await this.assetUseCase.createAssetWithSequence(asset, currentSequence, req.metadata);
                    importedAssets.push(singleAsset);
                    currentSequence++; // Move sequence forward by 1
                  }
                } else {
                  // Create single asset with sequential sequence
                  const singleAsset = await this.assetUseCase.createAssetWithSequence(asset, currentSequence, req.metadata);
                  importedAssets.push(singleAsset);
                  currentSequence++; // Move sequence forward by 1
                }
              } catch (error) {
                importErrors.push(`Row ${i + 1}: ${error.message}`);
              }
            }

            res.status(200).json({
              success: true,
              message: `Import completed. ${importedAssets.length} assets imported successfully`,
              data: {
                imported: importedAssets.length,
                total_rows: assets.length,
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

  parseFlexibleDate(dateStr) {
    if (!dateStr) return null;
    
    dateStr = dateStr.trim();

    // Try YYYY-MM-DD format first
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try DD-MM-YYYY format
    const ddmmyyyy2 = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyy2) {
      const [, day, month, year] = ddmmyyyy2;
      date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    throw new Error(`Unsupported date format: ${dateStr} (supported: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)`);
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
