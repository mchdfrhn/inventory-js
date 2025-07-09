import { assetApi } from './services/api';

// Test assetApi function
const testAssetApi = async () => {
  console.log('=== Testing assetApi.list() ===');
  
  try {
    console.log('🔄 Calling assetApi.list(1, 5)...');
    const response = await assetApi.list(1, 5);
    console.log('✅ assetApi.list() Response:', response);
    
    if (response.data && response.data.length > 0) {
      console.log('✅ Data received:', response.data.length, 'items');
      console.log('✅ First item:', response.data[0]);
    }
    
    if (response.pagination) {
      console.log('✅ Pagination info:', response.pagination);
    }
    
    return response;
  } catch (error) {
    console.error('❌ assetApi.list() failed:', error);
    throw error;
  }
};

// Test the function
testAssetApi()
  .then(() => console.log('✅ Test completed successfully'))
  .catch(err => console.error('❌ Test failed:', err));
