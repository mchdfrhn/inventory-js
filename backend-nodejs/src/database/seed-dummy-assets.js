#!/usr/bin/env node

const { Asset, AssetCategory, Location } = require('../models');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

async function seedDummyAssets() {
  try {
    console.log('🌱 Starting dummy assets seeding...');

    // Get existing categories and locations
    const categories = await AssetCategory.findAll();
    const locations = await Location.findAll();

    if (categories.length === 0 || locations.length === 0) {
      console.error('❌ No categories or locations found. Please create some first.');
      process.exit(1);
    }

    console.log(`Found ${categories.length} categories and ${locations.length} locations`);

    // Helper function to get random category
    const getRandomCategory = () => categories[Math.floor(Math.random() * categories.length)];
    
    // Helper function to get random location
    const getRandomLocation = () => locations[Math.floor(Math.random() * locations.length)];

    // Helper function to get random status
    const getRandomStatus = () => {
      const statuses = ['baik', 'rusak', 'tidak_memadai'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    };

    // Helper function to get random acquisition source
    const getRandomAcquisitionSource = () => {
      const sources = ['Pembelian', 'Bantuan', 'Hibah', 'STTST'];
      return sources[Math.floor(Math.random() * sources.length)];
    };

    // Single Assets (7 assets)
    const singleAssets = [
      {
        kode: 'PROJ001',
        nama: 'Proyektor Epson EB-X41',
        spesifikasi: 'Proyektor LCD 3600 lumens, resolusi XGA',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(1, 'year').subtract(3, 'months').toDate(),
        harga_perolehan: 7500000,
        umur_ekonomis_tahun: 6,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1875000,
        nilai_sisa: 5625000,
        keterangan: 'Proyektor untuk presentasi ruang rapat',
        lokasi: 'Ruang Rapat',
        asal_pengadaan: getRandomAcquisitionSource(),
        status: getRandomStatus(),
      },
      {
        kode: 'SCAN001',
        nama: 'Scanner Canon CanoScan',
        spesifikasi: 'Scanner dokumen A4 dengan resolusi 4800x4800 dpi',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(2, 'years').subtract(1, 'month').toDate(),
        harga_perolehan: 2500000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1250000,
        nilai_sisa: 1250000,
        keterangan: 'Scanner untuk digitalisasi dokumen',
        lokasi: 'Ruang Administrasi',
        asal_pengadaan: getRandomAcquisitionSource(),
        status: getRandomStatus(),
      },
      {
        kode: 'SAFE001',
        nama: 'Brankas Besi Tahan Api',
        spesifikasi: 'Brankas ukuran 60x45x40cm dengan kunci kombinasi',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(3, 'years').subtract(6, 'months').toDate(),
        harga_perolehan: 8000000,
        umur_ekonomis_tahun: 15,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1866667,
        nilai_sisa: 6133333,
        keterangan: 'Brankas untuk menyimpan dokumen penting',
        lokasi: 'Ruang Direktur',
        asal_pengadaan: getRandomAcquisitionSource(),
        status: 'baik',
      },
      {
        kode: 'WIFI001',
        nama: 'Access Point TP-Link',
        spesifikasi: 'TP-Link EAP245 AC1750 Wireless Gigabit',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(8, 'months').toDate(),
        harga_perolehan: 1200000,
        umur_ekonomis_tahun: 4,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 200000,
        nilai_sisa: 1000000,
        keterangan: 'Access point untuk koneksi wireless',
        lokasi: 'Ruang IT',
        asal_pengadaan: getRandomAcquisitionSource(),
        status: getRandomStatus(),
      },
      {
        kode: 'DISP001',
        nama: 'Dispenser Air Minum',
        spesifikasi: 'Dispenser dengan fitur panas dan dingin',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(1, 'year').subtract(8, 'months').toDate(),
        harga_perolehan: 1500000,
        umur_ekonomis_tahun: 8,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 468750,
        nilai_sisa: 1031250,
        keterangan: 'Dispenser untuk ruang tamu',
        lokasi: 'Ruang Tamu',
        asal_pengadaan: getRandomAcquisitionSource(),
        status: getRandomStatus(),
      },
      {
        kode: 'WHIT001',
        nama: 'Whiteboard Magnetic',
        spesifikasi: 'Whiteboard ukuran 120x80cm dengan frame aluminium',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(6, 'months').toDate(),
        harga_perolehan: 750000,
        umur_ekonomis_tahun: 10,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 37500,
        nilai_sisa: 712500,
        keterangan: 'Whiteboard untuk ruang rapat',
        lokasi: 'Ruang Rapat',
        asal_pengadaan: getRandomAcquisitionSource(),
        status: 'baik',
      },
      {
        kode: 'UPS001',
        nama: 'UPS APC Smart-UPS',
        spesifikasi: 'APC Smart-UPS 1500VA dengan battery backup',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(1, 'year').subtract(2, 'months').toDate(),
        harga_perolehan: 3500000,
        umur_ekonomis_tahun: 6,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 680556,
        nilai_sisa: 2819444,
        keterangan: 'UPS untuk backup power server',
        lokasi: 'Ruang Server',
        asal_pengadaan: getRandomAcquisitionSource(),
        status: 'baik',
      },
    ];

    // Create single assets
    const createdSingleAssets = [];
    for (const assetData of singleAssets) {
      // Check if asset already exists
      const existingAsset = await Asset.findOne({ where: { kode: assetData.kode } });
      if (existingAsset) {
        console.log(`⚠️  Asset ${assetData.kode} already exists, skipping...`);
        continue;
      }

      const asset = await Asset.create({
        ...assetData,
        id: uuidv4(),
        category_id: getRandomCategory().id,
        lokasi_id: getRandomLocation().id,
      });
      createdSingleAssets.push(asset);
      console.log(`📦 Created single asset: ${asset.nama} (${asset.kode})`);
    }

    // Bulk Assets Set 1: Office Phones (3 units)
    const bulkId1 = uuidv4();
    const phoneAssets = [];
    
    for (let i = 1; i <= 3; i++) {
      const phoneCode = `PHONE${String(i).padStart(3, '0')}`;
      
      // Check if asset already exists
      const existingAsset = await Asset.findOne({ where: { kode: phoneCode } });
      if (existingAsset) {
        console.log(`⚠️  Asset ${phoneCode} already exists, skipping...`);
        continue;
      }

      const phoneAsset = await Asset.create({
        id: uuidv4(),
        kode: phoneCode,
        nama: 'Telepon IP Yealink',
        spesifikasi: 'Yealink T46G IP Phone dengan LCD display',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: moment().subtract(10, 'months').toDate(),
        harga_perolehan: 1800000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 300000,
        nilai_sisa: 1500000,
        keterangan: 'Telepon IP untuk komunikasi kantor',
        lokasi: i === 1 ? 'Ruang Direktur' : i === 2 ? 'Ruang Administrasi' : 'Ruang IT',
        asal_pengadaan: 'Tender',
        category_id: getRandomCategory().id,
        lokasi_id: getRandomLocation().id,
        status: i === 3 ? 'rusak' : 'baik',
        bulk_id: bulkId1,
        bulk_sequence: i,
        is_bulk_parent: i === 1,
        bulk_total_count: 3,
      });
      phoneAssets.push(phoneAsset);
      console.log(`📞 Created bulk phone asset: ${phoneAsset.nama} (${phoneAsset.kode})`);
    }

    const totalAssets = createdSingleAssets.length + phoneAssets.length;

    console.log(`\n✅ Dummy assets seeding completed successfully!`);
    console.log(`📊 Created ${totalAssets} total assets:`);
    console.log(`   - ${createdSingleAssets.length} individual assets`);
    console.log(`   - ${phoneAssets.length} bulk assets (1 set)`);
    console.log(`\n🔍 You can now view these assets in the frontend application.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Dummy assets seeding failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDummyAssets();
}

module.exports = seedDummyAssets;