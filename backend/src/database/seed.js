#!/usr/bin/env node

const { Asset, AssetCategory, Location } = require('../models');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const logger = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Get existing categories and locations
    const categories = await AssetCategory.findAll();
    const locations = await Location.findAll();

    if (categories.length === 0 || locations.length === 0) {
      logger.error('❌ No categories or locations found. Please run migrations first.');
      process.exit(1);
    }

    // Sample assets data
    const sampleAssets = [
      {
        kode: 'DESK001',
        nama: 'Meja Kerja Direktur',
        spesifikasi: 'Meja kayu jati ukuran 150x80cm dengan laci',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(2, 'years').toDate(),
        harga_perolehan: 5000000,
        umur_ekonomis_tahun: 10,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1000000,
        nilai_sisa: 500000,
        keterangan: 'Meja kerja untuk ruang direktur',
        lokasi: 'Ruang Direktur',
        asal_pengadaan: 'Pembelian langsung',
        status: 'baik',
      },
      {
        kode: 'COMP001',
        nama: 'Komputer Desktop Dell',
        spesifikasi: 'Dell OptiPlex 7090, Intel i7, RAM 16GB, SSD 512GB',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(1, 'year').toDate(),
        harga_perolehan: 15000000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 3000000,
        nilai_sisa: 1500000,
        keterangan: 'Komputer untuk administrasi',
        lokasi: 'Ruang Administrasi',
        asal_pengadaan: 'Tender',
        status: 'baik',
      },
      {
        kode: 'CHAIR001',
        nama: 'Kursi Kantor Ergonomis',
        spesifikasi: 'Kursi putar dengan sandaran tinggi dan armrest',
        quantity: 5,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(6, 'months').toDate(),
        harga_perolehan: 1500000,
        umur_ekonomis_tahun: 7,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 100000,
        nilai_sisa: 150000,
        keterangan: 'Kursi untuk ruang rapat',
        lokasi: 'Ruang Rapat',
        asal_pengadaan: 'Pembelian langsung',
        status: 'baik',
      },
      {
        kode: 'PRINT001',
        nama: 'Printer HP LaserJet',
        spesifikasi: 'HP LaserJet Pro MFP M428fdw',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(8, 'months').toDate(),
        harga_perolehan: 4500000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 600000,
        nilai_sisa: 450000,
        keterangan: 'Printer multifungsi untuk kantor',
        lokasi: 'Ruang Administrasi',
        asal_pengadaan: 'Pembelian langsung',
        status: 'baik',
      },
      {
        kode: 'AC001',
        nama: 'AC Split 1.5 PK',
        spesifikasi: 'Daikin Split 1.5 PK R32',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(3, 'years').toDate(),
        harga_perolehan: 4000000,
        umur_ekonomis_tahun: 10,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1200000,
        nilai_sisa: 400000,
        keterangan: 'AC untuk ruang direktur',
        lokasi: 'Ruang Direktur',
        asal_pengadaan: 'Tender',
        status: 'baik',
      },
    ];

    // Create assets with proper category and location assignments
    const createdAssets = [];
    for (const assetData of sampleAssets) {
      // Find appropriate category
      let categoryId;
      if (assetData.kode.startsWith('DESK') || assetData.kode.startsWith('CHAIR')) {
        categoryId = categories.find(c => c.code === 'FURNITUR')?.id;
      } else if (assetData.kode.startsWith('COMP') || assetData.kode.startsWith('PRINT') || assetData.kode.startsWith('AC')) {
        categoryId = categories.find(c => c.code === 'ELEKTRONIK')?.id;
      } else {
        categoryId = categories[0].id; // Default to first category
      }

      // Find appropriate location
      let lokasiId;
      if (assetData.lokasi === 'Ruang Direktur') {
        lokasiId = locations.find(l => l.code === 'RD001')?.id;
      } else if (assetData.lokasi === 'Ruang Administrasi') {
        lokasiId = locations.find(l => l.code === 'RA001')?.id;
      } else if (assetData.lokasi === 'Ruang Rapat') {
        lokasiId = locations.find(l => l.code === 'RR001')?.id;
      } else {
        lokasiId = locations[0].id; // Default to first location
      }

      const asset = await Asset.create({
        ...assetData,
        id: uuidv4(),
        category_id: categoryId,
        lokasi_id: lokasiId,
      });

      createdAssets.push(asset);
      logger.info(`📦 Created asset: ${asset.nama} (${asset.kode})`);
    }

    // Create a bulk asset example
    const bulkId = uuidv4();
    const bulkAssets = [];
    for (let i = 1; i <= 3; i++) {
      const bulkAsset = await Asset.create({
        id: uuidv4(),
        kode: `LAPTOP${String(i).padStart(3, '0')}`,
        nama: 'Laptop Lenovo ThinkPad',
        spesifikasi: 'Lenovo ThinkPad E14, Intel i5, RAM 8GB, SSD 256GB',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(4, 'months').toDate(),
        harga_perolehan: 12000000,
        umur_ekonomis_tahun: 4,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1000000,
        nilai_sisa: 1200000,
        keterangan: 'Laptop untuk karyawan IT',
        lokasi: 'Ruang IT',
        asal_pengadaan: 'Tender',
        category_id: categories.find(c => c.code === 'ELEKTRONIK')?.id || categories[0].id,
        lokasi_id: locations.find(l => l.code === 'RIT001')?.id || locations[0].id,
        status: 'baik',
        bulk_id: bulkId,
        bulk_sequence: i,
        is_bulk_parent: i === 1,
        bulk_total_count: 3,
      });

      bulkAssets.push(bulkAsset);
      logger.info(`💻 Created bulk asset: ${bulkAsset.nama} (${bulkAsset.kode})`);
    }

    logger.info('✅ Database seeding completed successfully!');
    logger.info(`📊 Created ${createdAssets.length} individual assets`);
    logger.info(`📦 Created ${bulkAssets.length} bulk assets`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
