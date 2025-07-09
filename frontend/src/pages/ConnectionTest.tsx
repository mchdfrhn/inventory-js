import { useEffect, useState } from 'react';
import { assetApi, categoryApi, locationApi } from '../services/api';

export default function ConnectionTest() {
  const [results, setResults] = useState<{
    assets: any;
    categories: any;
    locations: any;
    errors: any;
  }>({
    assets: null,
    categories: null,
    locations: null,
    errors: {}
  });

  useEffect(() => {
    const testConnections = async () => {
      console.log('Testing API connections...');
      
      // Test assets API
      try {
        const assetsResult = await assetApi.list(1, 5);
        console.log('Assets API success:', assetsResult);
        setResults(prev => ({ ...prev, assets: assetsResult }));
      } catch (error) {
        console.error('Assets API error:', error);
        setResults(prev => ({ ...prev, errors: { ...prev.errors, assets: error } }));
      }

      // Test categories API
      try {
        const categoriesResult = await categoryApi.list(1, 5);
        console.log('Categories API success:', categoriesResult);
        setResults(prev => ({ ...prev, categories: categoriesResult }));
      } catch (error) {
        console.error('Categories API error:', error);
        setResults(prev => ({ ...prev, errors: { ...prev.errors, categories: error } }));
      }

      // Test locations API
      try {
        const locationsResult = await locationApi.list(1, 5);
        console.log('Locations API success:', locationsResult);
        setResults(prev => ({ ...prev, locations: locationsResult }));
      } catch (error) {
        console.error('Locations API error:', error);
        setResults(prev => ({ ...prev, errors: { ...prev.errors, locations: error } }));
      }
    };

    testConnections();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      {/* Assets Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Assets API Test</h2>
        {results.assets ? (
          <div className="text-green-600">
            <p>✅ Success! Found {results.assets.data?.length || 0} assets</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(results.assets, null, 2)}
            </pre>
          </div>
        ) : results.errors.assets ? (
          <div className="text-red-600">
            <p>❌ Error: {results.errors.assets.message || 'Unknown error'}</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(results.errors.assets, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-yellow-600">⏳ Loading...</p>
        )}
      </div>

      {/* Categories Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Categories API Test</h2>
        {results.categories ? (
          <div className="text-green-600">
            <p>✅ Success! Found {results.categories.data?.length || 0} categories</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(results.categories, null, 2)}
            </pre>
          </div>
        ) : results.errors.categories ? (
          <div className="text-red-600">
            <p>❌ Error: {results.errors.categories.message || 'Unknown error'}</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(results.errors.categories, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-yellow-600">⏳ Loading...</p>
        )}
      </div>

      {/* Locations Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Locations API Test</h2>
        {results.locations ? (
          <div className="text-green-600">
            <p>✅ Success! Found {results.locations.data?.length || 0} locations</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(results.locations, null, 2)}
            </pre>
          </div>
        ) : results.errors.locations ? (
          <div className="text-red-600">
            <p>❌ Error: {results.errors.locations.message || 'Unknown error'}</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(results.errors.locations, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-yellow-600">⏳ Loading...</p>
        )}
      </div>
    </div>
  );
}
