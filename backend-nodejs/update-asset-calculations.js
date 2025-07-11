require('dotenv').config();
const { Asset } = require('./src/models');

async function updateAssetCalculations() {
  try {
    console.log('Updating asset calculations...');

    // Get all assets
    const assets = await Asset.findAll();

    console.log(`Found ${assets.length} assets to update`);

    for (const asset of assets) {
      // Calculate umur_ekonomis_bulan
      const umurEkonomisTahun = parseInt(asset.umur_ekonomis_tahun) || 0;
      const umurEkonomisBulan = umurEkonomisTahun * 12;

      // Calculate depreciation
      const now = new Date();
      const tanggalPerolehan = new Date(asset.tanggal_perolehan);

      const yearsDiff = now.getFullYear() - tanggalPerolehan.getFullYear();
      const monthsDiff = now.getMonth() - tanggalPerolehan.getMonth();
      let totalBulanPemakaian = yearsDiff * 12 + monthsDiff;

      if (totalBulanPemakaian < 0) {totalBulanPemakaian = 0;}
      if (totalBulanPemakaian > umurEkonomisBulan) {totalBulanPemakaian = umurEkonomisBulan;}

      let akumulasiPenyusutan = 0;
      let nilaiSisa = parseFloat(asset.harga_perolehan);

      if (umurEkonomisBulan > 0) {
        const penyusutanPerBulan = parseFloat(asset.harga_perolehan) / umurEkonomisBulan;
        akumulasiPenyusutan = penyusutanPerBulan * totalBulanPemakaian;
        akumulasiPenyusutan = Math.round(akumulasiPenyusutan * 100) / 100;

        nilaiSisa = parseFloat(asset.harga_perolehan) - akumulasiPenyusutan;
        if (nilaiSisa < 0) {nilaiSisa = 0;}
        nilaiSisa = Math.round(nilaiSisa * 100) / 100;
      }

      // Update asset
      await asset.update({
        umur_ekonomis_bulan: umurEkonomisBulan,
        akumulasi_penyusutan: akumulasiPenyusutan,
        nilai_sisa: nilaiSisa,
      });

      console.log(`Updated asset ${asset.kode}: umur_ekonomis_bulan=${umurEkonomisBulan}, akumulasi_penyusutan=${akumulasiPenyusutan}, nilai_sisa=${nilaiSisa}`);
    }

    console.log('All assets updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating assets:', error);
    process.exit(1);
  }
}

updateAssetCalculations();
