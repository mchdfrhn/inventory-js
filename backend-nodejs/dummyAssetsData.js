// Simple script to create dummy assets via API calls
// This mimics what the frontend would do

const dummyAssets = [
  // Single Assets
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
    nilai_sisa: 750000,
    keterangan: 'Proyektor untuk presentasi ruang rapat',
    lokasi: 'Ruang Rapat',
    asal_pengadaan: 'Tender',
    status: 'baik',
    category_id: '1', // You'll need to adjust these IDs
    lokasi_id: 1,
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
    nilai_sisa: 250000,
    keterangan: 'Scanner untuk digitalisasi dokumen',
    lokasi: 'Ruang Administrasi',
    asal_pengadaan: 'Pembelian',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    nilai_sisa: 800000,
    keterangan: 'Brankas untuk menyimpan dokumen penting',
    lokasi: 'Ruang Direktur',
    asal_pengadaan: 'Pembelian',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    nilai_sisa: 120000,
    keterangan: 'Access point untuk koneksi wireless',
    lokasi: 'Ruang IT',
    asal_pengadaan: 'Tender',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    nilai_sisa: 150000,
    keterangan: 'Dispenser untuk ruang tamu',
    lokasi: 'Ruang Tamu',
    asal_pengadaan: 'Pembelian',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    nilai_sisa: 75000,
    keterangan: 'Whiteboard untuk ruang rapat',
    lokasi: 'Ruang Rapat',
    asal_pengadaan: 'Pembelian',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    nilai_sisa: 350000,
    keterangan: 'UPS untuk backup power server',
    lokasi: 'Ruang Server',
    asal_pengadaan: 'Tender',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    status: 'baik',
    category_id: '2',
    lokasi_id: 1,
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
    status: 'baik',
    category_id: '2',
    lokasi_id: 1,
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
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
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
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
  },
];

// Bulk assets (Multiple sets)
const bulkAssets = [
  {
    kode: 'PHONE001',
    nama: 'Telepon IP Yealink',
    spesifikasi: 'Yealink T46G IP Phone dengan LCD display',
    quantity: 3, // This indicates it's a bulk asset
    satuan: 'unit',
    tanggal_perolehan: '2023-09-01',
    harga_perolehan: 1800000,
    umur_ekonomis_tahun: 5,
    umur_ekonomis_bulan: 0,
    akumulasi_penyusutan: 300000,
    nilai_sisa: 180000,
    keterangan: 'Telepon IP untuk komunikasi kantor',
    lokasi: 'Ruang Kantor',
    asal_pengadaan: 'Tender',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
    // Bulk asset details
    bulk_total_count: 3,
    is_bulk_parent: true,
  },
  {
    kode: 'MONITOR001',
    nama: 'Monitor LED Samsung',
    spesifikasi: 'Samsung 24 inch LED Monitor Full HD 1920x1080',
    quantity: 5,
    satuan: 'unit',
    tanggal_perolehan: '2024-02-01',
    harga_perolehan: 2200000,
    umur_ekonomis_tahun: 6,
    umur_ekonomis_bulan: 0,
    akumulasi_penyusutan: 183333,
    nilai_sisa: 2016667,
    keterangan: 'Monitor untuk workstation karyawan',
    lokasi: 'Ruang Kantor',
    asal_pengadaan: 'Tender',
    status: 'baik',
    category_id: '1',
    lokasi_id: 1,
    bulk_total_count: 5,
    is_bulk_parent: true,
  },
  {
    kode: 'CHAIR002',
    nama: 'Kursi Kantor Staff',
    spesifikasi: 'Kursi kantor dengan sandaran punggung dan lengan',
    quantity: 8,
    satuan: 'unit',
    tanggal_perolehan: '2023-07-15',
    harga_perolehan: 1200000,
    umur_ekonomis_tahun: 7,
    umur_ekonomis_bulan: 0,
    akumulasi_penyusutan: 171429,
    nilai_sisa: 1028571,
    keterangan: 'Kursi untuk staff administrasi',
    lokasi: 'Ruang Kantor',
    asal_pengadaan: 'Pembelian',
    status: 'baik',
    category_id: '2',
    lokasi_id: 1,
    bulk_total_count: 8,
    is_bulk_parent: true,
  },
];

console.log('=== DUMMY ASSETS DATA ===');
console.log('\n--- Single Assets (7 items) ---');
dummyAssets.forEach((asset, index) => {
  console.log(`${index + 1}. ${asset.kode} - ${asset.nama}`);
  console.log(`   Harga: Rp ${asset.harga_perolehan.toLocaleString('id-ID')}`);
  console.log(`   Nilai Sisa: Rp ${asset.nilai_sisa.toLocaleString('id-ID')}`);
  console.log(`   Status: ${asset.status}`);
  console.log(`   Lokasi: ${asset.lokasi}`);
  console.log('');
});

console.log('\n--- Bulk Assets (1 set with 3 units) ---');
bulkAssets.forEach((asset, index) => {
  console.log(`${index + 1}. ${asset.kode} - ${asset.nama}`);
  console.log(`   Quantity: ${asset.quantity} units`);
  console.log(`   Harga per unit: Rp ${asset.harga_perolehan.toLocaleString('id-ID')}`);
  console.log(`   Total Value: Rp ${(asset.harga_perolehan * asset.quantity).toLocaleString('id-ID')}`);
  console.log(`   Status: ${asset.status}`);
  console.log(`   Lokasi: ${asset.lokasi}`);
  console.log('');
});

console.log('\n=== SUMMARY ===');
console.log(`Total Assets: ${dummyAssets.length + bulkAssets.length} entries`);
console.log(`- Single Assets: ${dummyAssets.length}`);
console.log(`- Bulk Asset Sets: ${bulkAssets.length} (containing ${bulkAssets.reduce((acc, asset) => acc + asset.quantity, 0)} individual units)`);
console.log(`Total Individual Units: ${dummyAssets.length + bulkAssets.reduce((acc, asset) => acc + asset.quantity, 0)}`);

const totalValue = dummyAssets.reduce((sum, asset) => sum + asset.harga_perolehan, 0) + 
                  bulkAssets.reduce((sum, asset) => sum + (asset.harga_perolehan * asset.quantity), 0);
console.log(`Total Value: Rp ${totalValue.toLocaleString('id-ID')}`);

console.log('\n=== INSTRUCTIONS ===');
console.log('1. To use this data, you can either:');
console.log('   - Run the SQL script (dummy_assets.sql) in your PostgreSQL database');
console.log('   - Or use the frontend to manually create these assets one by one');
console.log('   - Or modify the seedDummyAssets.js script to work with your database connection');
console.log('');
console.log('2. Make sure to adjust the category_id and lokasi_id values to match your actual database');
console.log('');
console.log('3. The bulk assets will create individual entries in the database but will be grouped together');
console.log('   with the same bulk_id and proper bulk_sequence numbers');
console.log('');
console.log('4. Updated data includes:');
console.log(`   - ${dummyAssets.length} Single Assets`);
console.log(`   - ${bulkAssets.length} Bulk Asset Sets (${bulkAssets.reduce((acc, asset) => acc + asset.quantity, 0)} total units)`);
console.log(`   - Total ${dummyAssets.length + bulkAssets.reduce((acc, asset) => acc + asset.quantity, 0)} individual assets`);
console.log(`   - Total Value: Rp ${totalValue.toLocaleString('id-ID')}`);

module.exports = { dummyAssets, bulkAssets };
