import React, { useState } from 'react';
import type { Asset } from '../services/api';

interface AssetQRCodeProps {
  asset: Asset;
  className?: string;
}

const AssetQRCode: React.FC<AssetQRCodeProps> = ({ asset, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate QR code URL using the free QR code API
  // This uses the asset ID and name as content for the QR code  // Build location display string
  const locationDisplay = asset.location_info ? 
    `${asset.location_info.name} (${asset.location_info.building}${asset.location_info.floor ? ` Lt. ${asset.location_info.floor}` : ''}${asset.location_info.room ? ` ${asset.location_info.room}` : ''})` 
    : asset.lokasi || 'Tidak ditentukan';
    
  const qrCodeContent = JSON.stringify({
    id: asset.id,
    kode: asset.kode,
    nama: asset.nama,
    lokasi: locationDisplay
  });
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeContent)}`;
  
  return (
    <div 
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Kode QR Aset</h3>
        <div className="relative mb-3">
          <div className={`transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}>
            <img 
              src={qrCodeUrl}
              alt={`QR Code untuk ${asset.nama}`}
              className="mx-auto rounded-md"
              width="120"
              height="120"
            />
            <div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-10 rounded-md transition-opacity duration-300"></div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-2">Pindai untuk detail aset</div>
        <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700 truncate">
          {asset.kode}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button 
          className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
          onClick={() => {
            // Create printable version in a new window
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>QR Code Aset - ${asset.kode}</title>
                    <style>
                      body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                      .qr-container { margin: 20px auto; max-width: 350px; }
                      .asset-info { margin-top: 10px; font-size: 14px; }
                      .asset-code { font-weight: bold; font-family: monospace; margin-bottom: 5px; }
                    </style>
                  </head>
                  <body>
                    <div class="qr-container">
                      <img src="${qrCodeUrl}" alt="QR Code" style="width: 100%; max-width: 300px;">
                      <div class="asset-info">                        <div class="asset-code">${asset.kode}</div>
                        <div>${asset.nama}</div>
                        <div>Lokasi: ${locationDisplay}</div>
                      </div>
                    </div>
                    <p>Pindai QR code untuk informasi aset lengkap</p>
                    <button onclick="window.print()">Cetak QR Code</button>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }
          }}
        >
          Cetak QR Code
        </button>
      </div>
    </div>
  );
};

export default AssetQRCode;
