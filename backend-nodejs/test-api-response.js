const axios = require('axios');

async function testAssetAPI() {
    try {
        console.log('Testing Asset API...\n');
        
        // Test getting all assets
        const response = await axios.get('http://localhost:3000/api/v1/assets');
        
        if (response.data && response.data.data) {
            console.log(`Found ${response.data.data.length} assets\n`);
            
            // Test the first asset to see data format
            const firstAsset = response.data.data[0];
            console.log('First asset data:');
            console.log('================');
            console.log(`ID: ${firstAsset.id}`);
            console.log(`Kode: ${firstAsset.kode}`);
            console.log(`Nama: ${firstAsset.nama}`);
            console.log(`Harga Perolehan: ${firstAsset.harga_perolehan} (type: ${typeof firstAsset.harga_perolehan})`);
            console.log(`Umur Ekonomis Tahun: ${firstAsset.umur_ekonomis_tahun} (type: ${typeof firstAsset.umur_ekonomis_tahun})`);
            console.log(`Umur Ekonomis Bulan: ${firstAsset.umur_ekonomis_bulan} (type: ${typeof firstAsset.umur_ekonomis_bulan})`);
            console.log(`Akumulasi Penyusutan: ${firstAsset.akumulasi_penyusutan} (type: ${typeof firstAsset.akumulasi_penyusutan})`);
            console.log(`Nilai Sisa: ${firstAsset.nilai_sisa} (type: ${typeof firstAsset.nilai_sisa})`);
            console.log(`Lokasi: ${JSON.stringify(firstAsset.Lokasi, null, 2)}`);
            console.log(`Category: ${JSON.stringify(firstAsset.Category, null, 2)}`);
            console.log(`Asal Pengadaan: ${firstAsset.asal_pengadaan}\n`);
            
            // Test specific asset by ID
            console.log('Testing specific asset by ID...');
            const specificResponse = await axios.get(`http://localhost:3000/api/v1/assets/${firstAsset.id}`);
            
            if (specificResponse.data && specificResponse.data.data) {
                const specificAsset = specificResponse.data.data;
                console.log('Specific asset response:');
                console.log('=======================');
                console.log(`ID: ${specificAsset.id}`);
                console.log(`Kode: ${specificAsset.kode}`);
                console.log(`Nama: ${specificAsset.nama}`);
                console.log(`Harga Perolehan: ${specificAsset.harga_perolehan} (type: ${typeof specificAsset.harga_perolehan})`);
                console.log(`Nilai Sisa: ${specificAsset.nilai_sisa} (type: ${typeof specificAsset.nilai_sisa})`);
                console.log(`Akumulasi Penyusutan: ${specificAsset.akumulasi_penyusutan} (type: ${typeof specificAsset.akumulasi_penyusutan})`);
                
                // Calculate current book value
                const hargaPerolehan = parseFloat(specificAsset.harga_perolehan) || 0;
                const akumulasiPenyusutan = parseFloat(specificAsset.akumulasi_penyusutan) || 0;
                const nilaiBukuSaatIni = hargaPerolehan - akumulasiPenyusutan;
                
                console.log(`\nCalculated values:`);
                console.log(`Nilai Buku Saat Ini: ${nilaiBukuSaatIni}`);
                console.log(`Should match Nilai Sisa: ${specificAsset.nilai_sisa}`);
            }
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('Error: Cannot connect to server. Make sure the backend server is running on port 3000');
        } else {
            console.log('Error testing API:', error.message);
        }
    }
}

testAssetAPI();
