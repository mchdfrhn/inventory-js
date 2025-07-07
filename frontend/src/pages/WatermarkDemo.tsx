import React from 'react';
import Watermark from '../components/Watermark';
import EnhancedWatermark from '../components/EnhancedWatermark';
import MFAProfile from '../components/MFAProfile';

const WatermarkDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Watermark Demo</h1>
          <p className="text-gray-600">Demo berbagai varian watermark dengan foto profil Anda</p>
        </div>

        {/* Original Watermark */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Original Watermark dengan Foto Profil</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Footer Variant:</span>
              <Watermark variant="footer" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Sidebar Variant:</span>
              <Watermark variant="sidebar" />
            </div>
          </div>
        </div>

        {/* Enhanced Watermark */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Enhanced Watermark</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Small Size:</span>
              <EnhancedWatermark size="sm" variant="minimal" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Medium Size:</span>
              <EnhancedWatermark size="md" variant="minimal" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Large Size with Title:</span>
              <EnhancedWatermark size="lg" variant="minimal" showTitle={true} />
            </div>
          </div>
        </div>

        {/* MFA Profile */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">MFA Profile Component</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Minimal:</span>
              <MFAProfile size="sm" variant="minimal" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Detailed:</span>
              <MFAProfile size="md" variant="detailed" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span>Large Detailed:</span>
              <MFAProfile size="lg" variant="detailed" />
            </div>
          </div>
        </div>

        {/* Live Examples */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Live Examples</h2>
          <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
            <p className="p-4 text-gray-600">Ini adalah contoh area dengan floating watermark:</p>
            
            {/* Floating watermark example */}
            <EnhancedWatermark variant="floating" size="sm" />
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Cara Menggunakan</h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p>• Foto profil Anda sudah tersimpan di <code className="bg-blue-100 px-1 rounded">/public/profile.jpeg</code></p>
            <p>• Watermark otomatis menggunakan foto profil dengan fallback ke inisial "MFA"</p>
            <p>• Jika foto gagal dimuat, akan menampilkan lingkaran biru dengan inisial "MFA"</p>
            <p>• Hover pada watermark untuk melihat efek animasi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkDemo;
