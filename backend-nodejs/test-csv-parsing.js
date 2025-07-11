const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Test CSV data for categories (simple format)
const categoryCSV = `Kode*,Nama*,Deskripsi
10,Peralatan Komputer,Kategori untuk komputer desktop laptop printer scanner dan aksesoris IT
20,Furniture Kantor,Kategori untuk meja kursi lemari filing cabinet dan furniture kantor lainnya
30,Kendaraan,Kategori untuk mobil dinas motor operasional dan kendaraan transportasi`;

// Test CSV data for locations (simple format)
const locationCSV = `Kode*,Nama*,Gedung,Lantai,Ruangan,Deskripsi
001,Ruang Kelas 1A,Gedung Utama,1,A101,Ruang kelas untuk mata kuliah umum dan teori
002,Laboratorium Komputer,Gedung Teknik,2,B201,Lab untuk praktikum programming dan sistem informasi
003,Perpustakaan,Gedung Utama,1,C101,Ruang baca dan koleksi buku referensi`;

// Write test files
const categoryFile = path.join(__dirname, 'test_categories.csv');
const locationFile = path.join(__dirname, 'test_locations.csv');

fs.writeFileSync(categoryFile, categoryCSV);
fs.writeFileSync(locationFile, locationCSV);

console.log('Testing Category CSV Parsing...');
console.log('================================');

const categories = [];
fs.createReadStream(categoryFile)
  .pipe(csv({
    skipEmptyLines: true,
    trim: true,
  }))
  .on('data', (row) => {
    console.log('Raw row:', row);

    const categoryData = {
      code: row.code || row.kode || row.Kode || row['Kode*'] || row.Kode,
      name: row.name || row.nama || row.Nama || row['Nama*'] || row.Nama,
      description: row.description || row.deskripsi || row.Deskripsi || row.Deskripsi || '',
    };

    console.log('Mapped category:', categoryData);
    categories.push(categoryData);
  })
  .on('end', () => {
    console.log(`\nParsed ${categories.length} categories successfully:`);
    categories.forEach((cat, i) => {
      console.log(`${i + 1}. Code: "${cat.code}", Name: "${cat.name}"`);
    });

    console.log('\n\nTesting Location CSV Parsing...');
    console.log('===============================');

    const locations = [];
    fs.createReadStream(locationFile)
      .pipe(csv({
        skipEmptyLines: true,
        trim: true,
      }))
      .on('data', (row) => {
        console.log('Raw row:', row);

        const locationData = {
          code: row.code || row.kode || row.Kode || row['Kode*'] || row.Kode,
          name: row.name || row.nama || row.Nama || row['Nama*'] || row.Nama,
          description: row.description || row.deskripsi || row.Deskripsi || row.Deskripsi || '',
          building: row.building || row.gedung || row.Gedung || row.Gedung || '',
          floor: row.floor || row.lantai || row.Lantai || row.Lantai || '',
          room: row.room || row.ruangan || row.Ruangan || row.Ruangan || '',
        };

        console.log('Mapped location:', locationData);
        locations.push(locationData);
      })
      .on('end', () => {
        console.log(`\nParsed ${locations.length} locations successfully:`);
        locations.forEach((loc, i) => {
          console.log(`${i + 1}. Code: "${loc.code}", Name: "${loc.name}"`);
        });

        // Clean up test files
        fs.unlinkSync(categoryFile);
        fs.unlinkSync(locationFile);

        console.log('\nTest completed successfully!');
      })
      .on('error', (error) => {
        console.error('Location parsing error:', error);
      });
  })
  .on('error', (error) => {
    console.error('Category parsing error:', error);
  });
