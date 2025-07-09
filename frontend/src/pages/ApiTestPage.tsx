import React, { useState } from 'react';
import { assetApi } from '../services/api';

const ApiTestPage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('Testing API...');
    
    try {
      console.log('🔄 Starting API test...');
      
      // Test basic assets endpoint
      console.log('🔄 Testing assetApi.listWithBulk...');
      const response = await assetApi.listWithBulk(1, 5);
      console.log('✅ API Response:', response);
      
      setResult(`✅ Success!\nData: ${JSON.stringify(response, null, 2)}`);
      
    } catch (error) {
      console.error('❌ API Test failed:', error);
      setResult(`❌ Failed!\nError: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Test Page</h1>
      <button 
        onClick={testApi}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      <pre style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '4px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {result || 'Click "Test API" to start testing...'}
      </pre>
    </div>
  );
};

export default ApiTestPage;
