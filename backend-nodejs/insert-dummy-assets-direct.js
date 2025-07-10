#!/usr/bin/env node

// Simple direct database insertion script
// This bypasses the Sequelize ORM for direct SQL execution

const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'inventaris',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
};

async function insertDummyAssets() {
  const client = new Client(dbConfig);

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Check if we have categories and locations
    const categoriesResult = await client.query('SELECT id, name FROM asset_categories LIMIT 5');
    const locationsResult = await client.query('SELECT id, name FROM locations LIMIT 5');

    if (categoriesResult.rows.length === 0 || locationsResult.rows.length === 0) {
      console.log('❌ No categories or locations found. Please create some first.');
      process.exit(1);
    }

    console.log(`📋 Found ${categoriesResult.rows.length} categories and ${locationsResult.rows.length} locations`);

    // Get random category and location
    const randomCategory = categoriesResult.rows[Math.floor(Math.random() * categoriesResult.rows.length)];
    const randomLocation = locationsResult.rows[Math.floor(Math.random() * locationsResult.rows.length)];

    console.log('🌱 Inserting dummy assets...');

    // Define dummy assets data
    const dummyAssets = [
      {
        kode: 'PROJ001',
        nama: 'Proyektor Epson EB-X41',
        spesifikasi: 'Proyektor LCD 3600 lumens, resolusi XGA',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2023-04-01',
        harga_perolehan: 7500000,
        umur_ekonomis_tahun: 6,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1875000,
        nilai_sisa: 5625000,
        keterangan: 'Proyektor untuk presentasi ruang rapat',
        lokasi: 'Ruang Rapat',
        asal_pengadaan: 'Tender',
        status: 'baik'
      },
      {
        kode: 'SCAN001',
        nama: 'Scanner Canon CanoScan',
        spesifikasi: 'Scanner dokumen A4 dengan resolusi 4800x4800 dpi',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2022-06-15',
        harga_perolehan: 2500000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1250000,
        nilai_sisa: 1250000,
        keterangan: 'Scanner untuk digitalisasi dokumen',
        lokasi: 'Ruang Administrasi',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'SAFE001',
        nama: 'Brankas Besi Tahan Api',
        spesifikasi: 'Brankas ukuran 60x45x40cm dengan kunci kombinasi',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2021-01-01',
        harga_perolehan: 8000000,
        umur_ekonomis_tahun: 15,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 1866667,
        nilai_sisa: 6133333,
        keterangan: 'Brankas untuk menyimpan dokumen penting',
        lokasi: 'Ruang Direktur',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'WIFI001',
        nama: 'Access Point TP-Link',
        spesifikasi: 'TP-Link EAP245 AC1750 Wireless Gigabit',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2023-11-01',
        harga_perolehan: 1200000,
        umur_ekonomis_tahun: 4,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 200000,
        nilai_sisa: 1000000,
        keterangan: 'Access point untuk koneksi wireless',
        lokasi: 'Ruang IT',
        asal_pengadaan: 'Tender',
        status: 'baik'
      },
      {
        kode: 'DISP001',
        nama: 'Dispenser Air Minum',
        spesifikasi: 'Dispenser dengan fitur panas dan dingin',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2022-11-01',
        harga_perolehan: 1500000,
        umur_ekonomis_tahun: 8,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 468750,
        nilai_sisa: 1031250,
        keterangan: 'Dispenser untuk ruang tamu',
        lokasi: 'Ruang Tamu',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'WHIT001',
        nama: 'Whiteboard Magnetic',
        spesifikasi: 'Whiteboard ukuran 120x80cm dengan frame aluminium',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2024-01-01',
        harga_perolehan: 750000,
        umur_ekonomis_tahun: 10,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 37500,
        nilai_sisa: 712500,
        keterangan: 'Whiteboard untuk ruang rapat',
        lokasi: 'Ruang Rapat',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'UPS001',
        nama: 'UPS APC Smart-UPS',
        spesifikasi: 'APC Smart-UPS 1500VA dengan battery backup',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2023-05-01',
        harga_perolehan: 3500000,
        umur_ekonomis_tahun: 6,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 680556,
        nilai_sisa: 2819444,
        keterangan: 'UPS untuk backup power server',
        lokasi: 'Ruang Server',
        asal_pengadaan: 'Tender',
        status: 'baik'
      },
      {
        kode: 'PRINTER001',
        nama: 'Printer HP LaserJet Pro',
        spesifikasi: 'HP LaserJet Pro MFP M428fdw, Print/Scan/Copy/Fax',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2024-03-15',
        harga_perolehan: 4200000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 280000,
        nilai_sisa: 3920000,
        keterangan: 'Printer multifungsi untuk kantor',
        lokasi: 'Ruang Administrasi',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'AC001',
        nama: 'AC Split Daikin',
        spesifikasi: 'Daikin Inverter 1.5 PK, R32 Refrigerant',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2023-08-20',
        harga_perolehan: 5500000,
        umur_ekonomis_tahun: 8,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 916667,
        nilai_sisa: 4583333,
        keterangan: 'AC untuk ruang direktur',
        lokasi: 'Ruang Direktur',
        asal_pengadaan: 'Tender',
        status: 'baik'
      },
      {
        kode: 'CCTV001',
        nama: 'Kamera CCTV Hikvision',
        spesifikasi: 'Hikvision DS-2CE16D0T-IR, 2MP 1080p',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2024-01-10',
        harga_perolehan: 850000,
        umur_ekonomis_tahun: 6,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 70833,
        nilai_sisa: 779167,
        keterangan: 'Kamera CCTV untuk keamanan pintu masuk',
        lokasi: 'Pintu Masuk',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'DESK001',
        nama: 'Meja Kerja Executive',
        spesifikasi: 'Meja kerja kayu jati ukuran 160x80cm dengan laci',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2022-12-01',
        harga_perolehan: 3200000,
        umur_ekonomis_tahun: 10,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 533333,
        nilai_sisa: 2666667,
        keterangan: 'Meja kerja untuk ruang direktur',
        lokasi: 'Ruang Direktur',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'CHAIR001',
        nama: 'Kursi Executive Ergonomis',
        spesifikasi: 'Kursi direktur dengan bahan kulit sintetis dan roda',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2022-12-01',
        harga_perolehan: 2800000,
        umur_ekonomis_tahun: 8,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 583333,
        nilai_sisa: 2216667,
        keterangan: 'Kursi executive untuk direktur',
        lokasi: 'Ruang Direktur',
        asal_pengadaan: 'Pembelian',
        status: 'baik'
      },
      {
        kode: 'SERVER001',
        nama: 'Server Dell PowerEdge',
        spesifikasi: 'Dell PowerEdge T340, Intel Xeon E-2224, 16GB RAM, 1TB HDD',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2023-02-15',
        harga_perolehan: 25000000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 8333333,
        nilai_sisa: 16666667,
        keterangan: 'Server utama untuk aplikasi inventory',
        lokasi: 'Ruang Server',
        asal_pengadaan: 'Tender',
        status: 'baik'
      },
      {
        kode: 'SWITCH001',
        nama: 'Network Switch TP-Link',
        spesifikasi: 'TP-Link TL-SG1024D 24-Port Gigabit Desktop Switch',
        quantity: 1,
        satuan: 'unit',
        tanggal_perolehan: '2023-02-15',
        harga_perolehan: 1800000,
        umur_ekonomis_tahun: 5,
        umur_ekonomis_bulan: 0,
        akumulasi_penyusutan: 600000,
        nilai_sisa: 1200000,
        keterangan: 'Switch jaringan untuk konektifitas kantor',
        lokasi: 'Ruang IT',
        asal_pengadaan: 'Tender',
        status: 'baik'
      }
    ];

    // Insert single assets
    let insertedCount = 0;
    for (const asset of dummyAssets) {
      try {
        // Check if asset already exists
        const existingAsset = await client.query('SELECT id FROM assets WHERE kode = $1', [asset.kode]);
        if (existingAsset.rows.length > 0) {
          console.log(`⚠️  Asset ${asset.kode} already exists, skipping...`);
          continue;
        }

        const insertQuery = `
          INSERT INTO assets (
            id, kode, nama, spesifikasi, quantity, satuan, 
            tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan,
            akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan,
            category_id, lokasi_id, status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
          )
        `;

        const values = [
          uuidv4(),
          asset.kode,
          asset.nama,
          asset.spesifikasi,
          asset.quantity,
          asset.satuan,
          asset.tanggal_perolehan,
          asset.harga_perolehan,
          asset.umur_ekonomis_tahun,
          asset.umur_ekonomis_bulan,
          asset.akumulasi_penyusutan,
          asset.nilai_sisa,
          asset.keterangan,
          asset.lokasi,
          asset.asal_pengadaan,
          randomCategory.id,
          randomLocation.id,
          asset.status,
          new Date(),
          new Date()
        ];

        await client.query(insertQuery, values);
        console.log(`✅ Created asset: ${asset.nama} (${asset.kode})`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Failed to insert ${asset.kode}:`, error.message);
      }
    }

    // Insert bulk assets (IP Phones)
    const bulkIdPhones = uuidv4();
    const phoneAssets = [
      { kode: 'PHONE001', lokasi: 'Ruang Direktur', status: 'baik', sequence: 1, isParent: true },
      { kode: 'PHONE002', lokasi: 'Ruang Administrasi', status: 'baik', sequence: 2, isParent: false },
      { kode: 'PHONE003', lokasi: 'Ruang IT', status: 'rusak', sequence: 3, isParent: false }
    ];

    for (const phone of phoneAssets) {
      try {
        // Check if asset already exists
        const existingAsset = await client.query('SELECT id FROM assets WHERE kode = $1', [phone.kode]);
        if (existingAsset.rows.length > 0) {
          console.log(`⚠️  Asset ${phone.kode} already exists, skipping...`);
          continue;
        }

        const insertQuery = `
          INSERT INTO assets (
            id, kode, nama, spesifikasi, quantity, satuan, 
            tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan,
            akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan,
            category_id, lokasi_id, status, bulk_id, bulk_sequence, is_bulk_parent, bulk_total_count,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
          )
        `;

        const values = [
          uuidv4(),
          phone.kode,
          'Telepon IP Yealink',
          'Yealink T46G IP Phone dengan LCD display',
          1,
          'unit',
          '2023-09-01',
          1800000,
          5,
          0,
          300000,
          1500000,
          'Telepon IP untuk komunikasi kantor',
          phone.lokasi,
          'Tender',
          randomCategory.id,
          randomLocation.id,
          phone.status,
          bulkIdPhones,
          phone.sequence,
          phone.isParent,
          3,
          new Date(),
          new Date()
        ];

        await client.query(insertQuery, values);
        console.log(`📞 Created bulk asset: ${phone.kode}`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Failed to insert ${phone.kode}:`, error.message);
      }
    }

    // Insert bulk assets (Monitors)
    const bulkIdMonitors = uuidv4();
    const monitorAssets = [
      { kode: 'MONITOR001', lokasi: 'Ruang Administrasi', status: 'baik', sequence: 1, isParent: true },
      { kode: 'MONITOR002', lokasi: 'Ruang Administrasi', status: 'baik', sequence: 2, isParent: false },
      { kode: 'MONITOR003', lokasi: 'Ruang IT', status: 'baik', sequence: 3, isParent: false },
      { kode: 'MONITOR004', lokasi: 'Ruang IT', status: 'baik', sequence: 4, isParent: false },
      { kode: 'MONITOR005', lokasi: 'Ruang Direktur', status: 'tidak_memadai', sequence: 5, isParent: false }
    ];

    for (const monitor of monitorAssets) {
      try {
        // Check if asset already exists
        const existingAsset = await client.query('SELECT id FROM assets WHERE kode = $1', [monitor.kode]);
        if (existingAsset.rows.length > 0) {
          console.log(`⚠️  Asset ${monitor.kode} already exists, skipping...`);
          continue;
        }

        const insertQuery = `
          INSERT INTO assets (
            id, kode, nama, spesifikasi, quantity, satuan, 
            tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan,
            akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan,
            category_id, lokasi_id, status, bulk_id, bulk_sequence, is_bulk_parent, bulk_total_count,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
          )
        `;

        const values = [
          uuidv4(),
          monitor.kode,
          'Monitor LED Samsung',
          'Samsung 24 inch LED Monitor Full HD 1920x1080',
          1,
          'unit',
          '2024-02-01',
          2200000,
          6,
          0,
          183333,
          2016667,
          'Monitor untuk workstation karyawan',
          monitor.lokasi,
          'Tender',
          randomCategory.id,
          randomLocation.id,
          monitor.status,
          bulkIdMonitors,
          monitor.sequence,
          monitor.isParent,
          5,
          new Date(),
          new Date()
        ];

        await client.query(insertQuery, values);
        console.log(`🖥️  Created bulk asset: ${monitor.kode}`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Failed to insert ${monitor.kode}:`, error.message);
      }
    }

    // Insert bulk assets (Office Chairs)
    const bulkIdChairs = uuidv4();
    const chairAssets = [
      { kode: 'CHAIR002', lokasi: 'Ruang Administrasi', status: 'baik', sequence: 1, isParent: true },
      { kode: 'CHAIR003', lokasi: 'Ruang Administrasi', status: 'baik', sequence: 2, isParent: false },
      { kode: 'CHAIR004', lokasi: 'Ruang Administrasi', status: 'baik', sequence: 3, isParent: false },
      { kode: 'CHAIR005', lokasi: 'Ruang Administrasi', status: 'rusak', sequence: 4, isParent: false },
      { kode: 'CHAIR006', lokasi: 'Ruang IT', status: 'baik', sequence: 5, isParent: false },
      { kode: 'CHAIR007', lokasi: 'Ruang IT', status: 'baik', sequence: 6, isParent: false },
      { kode: 'CHAIR008', lokasi: 'Ruang Rapat', status: 'baik', sequence: 7, isParent: false },
      { kode: 'CHAIR009', lokasi: 'Ruang Rapat', status: 'baik', sequence: 8, isParent: false }
    ];

    for (const chair of chairAssets) {
      try {
        // Check if asset already exists
        const existingAsset = await client.query('SELECT id FROM assets WHERE kode = $1', [chair.kode]);
        if (existingAsset.rows.length > 0) {
          console.log(`⚠️  Asset ${chair.kode} already exists, skipping...`);
          continue;
        }

        const insertQuery = `
          INSERT INTO assets (
            id, kode, nama, spesifikasi, quantity, satuan, 
            tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, umur_ekonomis_bulan,
            akumulasi_penyusutan, nilai_sisa, keterangan, lokasi, asal_pengadaan,
            category_id, lokasi_id, status, bulk_id, bulk_sequence, is_bulk_parent, bulk_total_count,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
          )
        `;

        const values = [
          uuidv4(),
          chair.kode,
          'Kursi Kantor Staff',
          'Kursi kantor dengan sandaran punggung dan lengan',
          1,
          'unit',
          '2023-07-15',
          1200000,
          7,
          0,
          171429,
          1028571,
          'Kursi untuk staff administrasi',
          chair.lokasi,
          'Pembelian',
          randomCategory.id,
          randomLocation.id,
          chair.status,
          bulkIdChairs,
          chair.sequence,
          chair.isParent,
          8,
          new Date(),
          new Date()
        ];

        await client.query(insertQuery, values);
        console.log(`🪑 Created bulk asset: ${chair.kode}`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Failed to insert ${chair.kode}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully inserted ${insertedCount} assets!`);
    console.log('\n🔍 Verifying inserted data...');

    // Verify the data
    const verifyQuery = `
      SELECT 
        kode, 
        nama, 
        harga_perolehan, 
        nilai_sisa, 
        status,
        CASE 
          WHEN is_bulk_parent = true THEN 'Bulk Parent'
          WHEN bulk_id IS NOT NULL THEN 'Bulk Child'
          ELSE 'Single Asset'
        END as asset_type
      FROM assets 
      WHERE kode IN (
        'PROJ001', 'SCAN001', 'SAFE001', 'WIFI001', 'DISP001', 'WHIT001', 'UPS001',
        'PRINTER001', 'AC001', 'CCTV001', 'DESK001', 'CHAIR001', 'SERVER001', 'SWITCH001',
        'PHONE001', 'PHONE002', 'PHONE003',
        'MONITOR001', 'MONITOR002', 'MONITOR003', 'MONITOR004', 'MONITOR005',
        'CHAIR002', 'CHAIR003', 'CHAIR004', 'CHAIR005', 'CHAIR006', 'CHAIR007', 'CHAIR008', 'CHAIR009'
      )
      ORDER BY kode
    `;

    const result = await client.query(verifyQuery);
    
    console.log('\n📊 Inserted Assets:');
    console.table(result.rows);

    // Show summary
    const totalValue = result.rows.reduce((sum, row) => sum + parseFloat(row.harga_perolehan), 0);
    const singleAssets = result.rows.filter(row => row.asset_type === 'Single Asset').length;
    const bulkParents = result.rows.filter(row => row.asset_type === 'Bulk Parent').length;
    const bulkChildren = result.rows.filter(row => row.asset_type === 'Bulk Child').length;
    
    console.log('\n📈 Summary:');
    console.log(`Total Assets Inserted: ${result.rows.length}`);
    console.log(`- Single Assets: ${singleAssets}`);
    console.log(`- Bulk Asset Sets: ${bulkParents} (${bulkChildren + bulkParents} total units)`);
    console.log(`Total Value: Rp ${totalValue.toLocaleString('id-ID')}`);
    console.log(`\n✅ All assets inserted successfully!`);

  } catch (error) {
    console.error('❌ Error inserting dummy assets:', error);
    
    if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Please check your database password in the .env file.');
      console.log('   Current password setting: DB_PASSWORD=123');
      console.log('   Make sure PostgreSQL is running and the password is correct.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please make sure PostgreSQL is running on localhost:5432');
    }
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

// Run the insertion
insertDummyAssets();
