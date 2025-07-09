// Test API connection directly
const testAPI = async () => {
  try {
    console.log('🔄 Testing API connection...');
    
    const response = await fetch('http://localhost:5174/api/v1/assets?page=1&page_size=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers);
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// Test axios directly
const testAxios = async () => {
  try {
    console.log('🔄 Testing with axios...');
    
    const axios = (await import('./src/services/api.js')).default;
    
    const response = await axios.get('/api/v1/assets?page=1&page_size=5');
    console.log('✅ Axios Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Axios Error:', error);
    throw error;
  }
};

// Run tests
console.log('=== API Tests ===');
testAPI().then(() => console.log('✅ Fetch test passed'));
testAxios().then(() => console.log('✅ Axios test passed'));
