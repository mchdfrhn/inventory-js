// Mock data untuk preview template saja
// Tidak boleh digunakan untuk laporan asli!

import { type Asset } from '../hooks/useAssetFilters';

export const getMockDataForPreview = (): Asset[] => {
  return [
    {
      id: 1,
      kode: 'PREVIEW-001',
      nama: 'Sample Laptop (Preview)',
      spesifikasi: 'Intel i5, 8GB RAM, 256GB SSD',
      category: { name: 'Elektronik' },
      lokasi: 'Ruang IT',
      location_info: {
        name: 'Lab Komputer',
        building: 'Gedung A',
        floor: '2',
        room: 'A201'
      },
      status: 'baik',
      harga_perolehan: 15000000,
      nilai_sisa: 12000000,
      akumulasi_penyusutan: 3000000,
      tanggal_perolehan: '2023-01-15',
      asal_pengadaan: 'Hibah',
      umur_ekonomis_tahun: 5
    },
    {
      id: 2,
      kode: 'PREVIEW-002',
      nama: 'Sample Meja (Preview)',
      spesifikasi: 'Kayu jati, ukuran 120x60 cm',
      category: { name: 'Furniture' },
      lokasi: 'Ruang Dosen',
      location_info: {
        name: 'Ruang Dosen',
        building: 'Gedung B',
        floor: '1',
        room: 'B101'
      },
      status: 'baik',
      harga_perolehan: 2500000,
      nilai_sisa: 2000000,
      akumulasi_penyusutan: 500000,
      tanggal_perolehan: '2022-08-20',
      asal_pengadaan: 'Pembelian',
      umur_ekonomis_tahun: 10
    },
    {
      id: 3,
      kode: 'PREVIEW-003',
      nama: 'Sample Proyektor (Preview)',
      spesifikasi: 'LED, Full HD 1080p',
      category: { name: 'Elektronik' },
      lokasi: 'Ruang Kelas',
      location_info: {
        name: 'Ruang Kelas 1',
        building: 'Gedung A',
        floor: '1',
        room: 'A101'
      },
      status: 'rusak',
      harga_perolehan: 8000000,
      nilai_sisa: 4000000,
      akumulasi_penyusutan: 4000000,
      tanggal_perolehan: '2021-05-10',
      asal_pengadaan: 'Hibah',
      umur_ekonomis_tahun: 7
    }
  ];
};

// Utility function untuk generate preview HTML dengan mock data
export const generatePreviewHTML = (templateName: string, columns: string[]) => {
  const mockAssets = getMockDataForPreview();
  const now = new Date();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate table headers
  const columnLabels: { [key: string]: string } = {
    'kode': 'Kode Aset',
    'nama': 'Nama Aset',
    'spesifikasi': 'Spesifikasi',
    'kategori': 'Kategori',
    'lokasi': 'Lokasi',
    'status': 'Status',
    'harga_perolehan': 'Harga Perolehan',
    'nilai_sisa': 'Nilai Sisa',
    'akumulasi_penyusutan': 'Akumulasi Penyusutan',
    'tanggal_perolehan': 'Tanggal Perolehan',
    'asal_pengadaan': 'Asal Pengadaan',
    'umur_ekonomis_tahun': 'Umur Ekonomis (Tahun)'
  };

  const tableHeaders = columns.map(col => columnLabels[col] || col).join('</th><th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">');

  // Generate table rows
  const tableRows = mockAssets.map(asset => {
    const row = columns.map(col => {
      switch (col) {
        case 'kode': return asset.kode || '-';
        case 'nama': return asset.nama || '-';
        case 'spesifikasi': return asset.spesifikasi || '-';
        case 'kategori': return asset.category?.name || '-';
        case 'lokasi': return asset.lokasi || '-';
        case 'status': return asset.status || '-';
        case 'harga_perolehan': return formatCurrency(asset.harga_perolehan || 0);
        case 'nilai_sisa': return formatCurrency(asset.nilai_sisa || 0);
        case 'akumulasi_penyusutan': return formatCurrency(asset.akumulasi_penyusutan || 0);
        case 'umur_ekonomis_tahun': return asset.umur_ekonomis_tahun || '-';
        case 'tanggal_perolehan': return asset.tanggal_perolehan || '-';
        case 'asal_pengadaan': return asset.asal_pengadaan || '-';
        default: return '-';
      }
    }).join('</td><td style="border: 1px solid #ddd; padding: 8px;">');
    
    return `<tr><td style="border: 1px solid #ddd; padding: 8px;">${row}</td></tr>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Preview: ${templateName}</title>
      <style>
        @media print {
          body { margin: 0; }
          .preview-watermark { display: none; }
        }
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
          position: relative;
        }
        .preview-watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(255, 0, 0, 0.1);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #2563eb;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .preview-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: right;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="preview-watermark">PREVIEW TEMPLATE</div>
      
      <div class="header">
        <h1>Preview: ${templateName}</h1>
        <p>Sistem Inventaris Aset</p>
        <p>Tanggal: ${formatDate(now)}</p>
      </div>

      <div class="preview-notice">
        ⚠️ Ini adalah preview template dengan data contoh. Data asli akan digunakan saat mencetak laporan.
      </div>

      <table>
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">${tableHeaders}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <p>Preview dicetak pada: ${now.toLocaleString('id-ID')}</p>
        <p>Sistem Inventaris Aset - Template Preview</p>
      </div>
    </body>
    </html>
  `;
};
