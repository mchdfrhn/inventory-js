#!/usr/bin/env node

// Updated dummy data insertion script with complete assets collection
// This script inserts 15 single assets + 3 bulk sets (16 units) = 31 total assets

const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'inventaris',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
};

async function insertAllDummyAssets() {
  const client = new Client(dbConfig);

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Check if we have categories and locations
    const categoriesResult = await client.query('SELECT id, name FROM asset_categories LIMIT 5');
    const locationsResult = await client.query('SELECT id, name FROM locations LIMIT 5');

    if (categoriesResult.rows.length === 0 || locationsResult.rows.length === 0) {
      console.log('❌ No categories or locations found. Please run migrations first.');
      console.log('   Run: npm run migrate:up');
      process.exit(1);
    }

    console.log(`📋 Found ${categoriesResult.rows.length} categories and ${locationsResult.rows.length} locations`);

    // Get category IDs
    const elektronikCategory = categoriesResult.rows.find(cat => cat.name === 'Elektronik');
    const furnitureCategory = categoriesResult.rows.find(cat => cat.name === 'Furniture');
    const peralatanCategory = categoriesResult.rows.find(cat => cat.name === 'Peralatan');

    // Use the first category as fallback
    const defaultCategory = categoriesResult.rows[0];

    // Get location ID
    const defaultLocation = locationsResult.rows[0];

    console.log('🌱 Starting to insert dummy assets...');

    const { dummyAssets, bulkAssets } = require('./dummyAssetsData');

    let insertedCount = 0;

    // Insert single assets
    console.log('\n📦 Inserting Single Assets...');
    for (const asset of dummyAssets) {
      try {
        // Check if asset already exists
        const existingAsset = await client.query('SELECT id FROM assets WHERE kode = $1', [asset.kode]);
        if (existingAsset.rows.length > 0) {
          console.log(`⚠️  Asset ${asset.kode} already exists, skipping...`);
          continue;
        }

        // Determine category based on asset type
        let categoryId = defaultCategory.id;
        if (elektronikCategory && (asset.nama.includes('Proyektor') || asset.nama.includes('Scanner') ||
            asset.nama.includes('Access Point') || asset.nama.includes('UPS') || asset.nama.includes('Printer') ||
            asset.nama.includes('AC') || asset.nama.includes('CCTV') || asset.nama.includes('Server') ||
            asset.nama.includes('Switch'))) {
          categoryId = elektronikCategory.id;
        } else if (furnitureCategory && (asset.nama.includes('Meja') || asset.nama.includes('Kursi'))) {
          categoryId = furnitureCategory.id;
        } else if (peralatanCategory && (asset.nama.includes('Brankas') || asset.nama.includes('Dispenser') ||
            asset.nama.includes('Whiteboard'))) {
          categoryId = peralatanCategory.id;
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
          categoryId,
          defaultLocation.id,
          asset.status,
          new Date(),
          new Date(),
        ];

        await client.query(insertQuery, values);
        console.log(`✅ Created single asset: ${asset.nama} (${asset.kode})`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Failed to insert ${asset.kode}:`, error.message);
      }
    }

    // Insert bulk assets
    console.log('\n📦 Inserting Bulk Assets...');
    for (const bulkSet of bulkAssets) {
      const bulkId = uuidv4();

      // Determine category
      let categoryId = defaultCategory.id;
      if (elektronikCategory && (bulkSet.nama.includes('Telepon') || bulkSet.nama.includes('Monitor'))) {
        categoryId = elektronikCategory.id;
      } else if (furnitureCategory && bulkSet.nama.includes('Kursi')) {
        categoryId = furnitureCategory.id;
      }

      console.log(`\n📋 Creating bulk set: ${bulkSet.nama} (${bulkSet.quantity} units)`);

      for (let i = 0; i < bulkSet.quantity; i++) {
        try {
          let assetKode;
          let lokasi = bulkSet.lokasi;
          let status = bulkSet.status;

          // Generate individual asset codes and set specific locations/status
          if (bulkSet.kode.startsWith('PHONE')) {
            assetKode = `PHONE${String(i + 1).padStart(3, '0')}`;
            if (i === 0) {lokasi = 'Ruang Direktur';} else if (i === 1) {lokasi = 'Ruang Administrasi';} else if (i === 2) { lokasi = 'Ruang IT'; status = 'rusak'; }
          } else if (bulkSet.kode.startsWith('MONITOR')) {
            assetKode = `MONITOR${String(i + 1).padStart(3, '0')}`;
            if (i === 0 || i === 1) {lokasi = 'Ruang Administrasi';} else if (i === 2 || i === 3) {lokasi = 'Ruang IT';} else if (i === 4) { lokasi = 'Ruang Direktur'; status = 'tidak_memadai'; }
          } else if (bulkSet.kode.startsWith('CHAIR')) {
            assetKode = `CHAIR${String(i + 2).padStart(3, '0')}`; // Start from CHAIR002
            if (i < 3) {lokasi = 'Ruang Administrasi';} else if (i === 3) { lokasi = 'Ruang Administrasi'; status = 'rusak'; } else if (i === 4 || i === 5) {lokasi = 'Ruang IT';} else if (i === 6 || i === 7) {lokasi = 'Ruang Rapat';}
          }

          // Check if asset already exists
          const existingAsset = await client.query('SELECT id FROM assets WHERE kode = $1', [assetKode]);
          if (existingAsset.rows.length > 0) {
            console.log(`⚠️  Asset ${assetKode} already exists, skipping...`);
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
            assetKode,
            bulkSet.nama,
            bulkSet.spesifikasi,
            1, // Individual unit quantity
            bulkSet.satuan,
            bulkSet.tanggal_perolehan,
            bulkSet.harga_perolehan,
            bulkSet.umur_ekonomis_tahun,
            bulkSet.umur_ekonomis_bulan,
            bulkSet.akumulasi_penyusutan,
            bulkSet.nilai_sisa,
            bulkSet.keterangan,
            lokasi,
            bulkSet.asal_pengadaan,
            categoryId,
            defaultLocation.id,
            status,
            bulkId,
            i + 1, // sequence
            i === 0, // is_bulk_parent (true for first item)
            bulkSet.quantity, // bulk_total_count
            new Date(),
            new Date(),
          ];

          await client.query(insertQuery, values);
          const icon = bulkSet.nama.includes('Telepon') ? '📞' :
            bulkSet.nama.includes('Monitor') ? '🖥️' : '🪑';
          console.log(`${icon} Created bulk asset: ${assetKode} (${i === 0 ? 'Parent' : 'Child'}) - ${status}`);
          insertedCount++;
        } catch (error) {
          console.error(`❌ Failed to insert bulk asset ${i + 1}:`, error.message);
        }
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
        lokasi,
        CASE 
          WHEN is_bulk_parent = true THEN 'Bulk Parent'
          WHEN bulk_id IS NOT NULL THEN 'Bulk Child'
          ELSE 'Single Asset'
        END as asset_type
      FROM assets 
      WHERE kode SIMILAR TO '(PROJ|SCAN|SAFE|WIFI|DISP|WHIT|UPS|PRINTER|AC|CCTV|DESK|CHAIR|SERVER|SWITCH|PHONE|MONITOR)%'
      ORDER BY 
        CASE 
          WHEN kode LIKE 'PROJ%' THEN 1
          WHEN kode LIKE 'SCAN%' THEN 2
          WHEN kode LIKE 'SAFE%' THEN 3
          WHEN kode LIKE 'WIFI%' THEN 4
          WHEN kode LIKE 'DISP%' THEN 5
          WHEN kode LIKE 'WHIT%' THEN 6
          WHEN kode LIKE 'UPS%' THEN 7
          WHEN kode LIKE 'PRINTER%' THEN 8
          WHEN kode LIKE 'AC%' THEN 9
          WHEN kode LIKE 'CCTV%' THEN 10
          WHEN kode LIKE 'DESK%' THEN 11
          WHEN kode LIKE 'CHAIR001%' THEN 12
          WHEN kode LIKE 'SERVER%' THEN 13
          WHEN kode LIKE 'SWITCH%' THEN 14
          WHEN kode LIKE 'PHONE%' THEN 15
          WHEN kode LIKE 'MONITOR%' THEN 16
          WHEN kode LIKE 'CHAIR%' THEN 17
          ELSE 99
        END,
        kode
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

    // Show bulk asset groups
    console.log('\n📦 Bulk Asset Groups:');
    const phoneGroup = result.rows.filter(row => row.kode.startsWith('PHONE'));
    const monitorGroup = result.rows.filter(row => row.kode.startsWith('MONITOR'));
    const chairGroup = result.rows.filter(row => row.kode.startsWith('CHAIR') && row.kode !== 'CHAIR001');

    if (phoneGroup.length > 0) {
      console.log(`📞 IP Phones: ${phoneGroup.length} units`);
      phoneGroup.forEach(phone => console.log(`   ${phone.kode} - ${phone.lokasi} (${phone.status})`));
    }

    if (monitorGroup.length > 0) {
      console.log(`🖥️  Monitors: ${monitorGroup.length} units`);
      monitorGroup.forEach(monitor => console.log(`   ${monitor.kode} - ${monitor.lokasi} (${monitor.status})`));
    }

    if (chairGroup.length > 0) {
      console.log(`🪑 Office Chairs: ${chairGroup.length} units`);
      chairGroup.forEach(chair => console.log(`   ${chair.kode} - ${chair.lokasi} (${chair.status})`));
    }

    console.log(`\n✅ All ${result.rows.length} assets inserted and verified successfully!`);
    console.log('\n💡 You can now access the inventory system to view these assets.');

  } catch (error) {
    console.error('❌ Error inserting dummy assets:', error);

    if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Please check your database password in the .env file.');
      console.log('   Current password setting: DB_PASSWORD=123');
      console.log('   Make sure PostgreSQL is running and the password is correct.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please make sure PostgreSQL is running on localhost:5432');
    } else if (error.code === '42P01') {
      console.log('\n💡 Table does not exist. Please run migrations first:');
      console.log('   npm run migrate:up');
    }
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

// Run the insertion
console.log('🚀 Starting Dummy Assets Insertion Process...');
console.log('========================================');
insertAllDummyAssets();
