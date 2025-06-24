import React from 'react';
import { MapPinIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface LocationQRCodeProps {
  locationName: string;
  locationDescription?: string;
  className?: string;
}

const LocationQRCode: React.FC<LocationQRCodeProps> = ({ 
  locationName, 
  locationDescription,
  className = '' 
}) => {
  // Generate a unique ID for the location based on its name
  const locationId = encodeURIComponent(locationName.toLowerCase().replace(/\s+/g, '-'));
  
  // Generate QR code URL using the free QR code API
  // This encodes location information for scanning
  const locationData = {
    name: locationName,
    id: locationId,
    description: locationDescription || ''
  };
  
  const qrCodeContent = JSON.stringify(locationData);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeContent)}`;
  
  return (
    <div className={`bg-white rounded-lg p-5 shadow-md ${className}`}>
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
          <MapPinIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <h3 className="font-medium text-lg text-gray-900">{locationName}</h3>
          {locationDescription && (
            <p className="text-gray-500 text-sm mt-1">{locationDescription}</p>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4 flex justify-center">
        <div className="text-center">
          <div className="inline-block bg-gray-100 p-3 rounded-lg mb-2">
            <img 
              src={qrCodeUrl} 
              alt={`QR Code untuk lokasi ${locationName}`} 
              width="120" 
              height="120"
              className="rounded"
            />
          </div>
          <p className="text-xs text-gray-500 mb-4">Pindai QR code untuk melihat aset di lokasi ini</p>
          
          <button
            onClick={() => {
              // Create a printable version in a new window
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>QR Code Lokasi - ${locationName}</title>
                      <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                        .qr-container { margin: 20px auto; max-width: 350px; border: 1px solid #eee; padding: 20px; border-radius: 10px; }
                        .location-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                        .location-description { color: #666; margin-bottom: 15px; }
                      </style>
                    </head>
                    <body>
                      <div class="qr-container">
                        <div class="location-name">${locationName}</div>
                        ${locationDescription ? `<div class="location-description">${locationDescription}</div>` : ''}
                        <img src="${qrCodeUrl}" alt="QR Code" style="width: 100%; max-width: 200px;">
                        <p>Pindai QR code untuk melihat daftar aset di lokasi ini</p>
                      </div>
                      <button onclick="window.print()">Cetak QR Code</button>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PrinterIcon className="h-4 w-4 mr-1.5" />
            Cetak Label Lokasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationQRCode;
