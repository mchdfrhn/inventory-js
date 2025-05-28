import React, { useEffect, useState } from 'react';
import { assetApi, categoryApi, locationApi } from '../services/api';

const DebugPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testAPIs = async () => {
      addLog('Starting API tests...');
      
      try {
        addLog('Testing assets API...');
        const assets = await assetApi.list(1, 10);
        addLog(`✅ Assets: Success - ${assets.data.length} items`);
      } catch (error: any) {
        addLog(`❌ Assets error: ${error.message || error}`);
      }

      try {
        addLog('Testing categories API...');
        const categories = await categoryApi.list(1, 10);
        addLog(`✅ Categories: Success - ${categories.data.length} items`);
      } catch (error: any) {
        addLog(`❌ Categories error: ${error.message || error}`);
      }

      try {
        addLog('Testing locations API...');
        const locations = await locationApi.list(1, 10);
        addLog(`✅ Locations: Success - ${locations.data.length} items`);
      } catch (error: any) {
        addLog(`❌ Locations error: ${error.message || error}`);
      }

      addLog('API tests completed');
    };

    testAPIs();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Debug Page</h1>
      <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPage;
