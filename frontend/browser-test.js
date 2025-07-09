// Test script to run in browser console
// Copy and paste this into the browser console at localhost:5173

console.log('🔄 Starting API test...');

// Test fetch directly
const testFetch = async () => {
  try {
    console.log('🔄 Testing fetch...');
    const response = await fetch('/api/v1/assets/with-bulk?page=1&page_size=5');
    console.log('📊 Fetch response:', response);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Fetch data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

// Test axios
const testAxios = async () => {
  try {
    console.log('🔄 Testing axios...');
    
    // Import axios from the global scope (if available)
    if (typeof axios === 'undefined') {
      console.error('❌ Axios not available in global scope');
      return;
    }
    
    const response = await axios.get('/api/v1/assets/with-bulk?page=1&page_size=5');
    console.log('✅ Axios response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Axios error:', error);
    throw error;
  }
};

// Run tests
const runTests = async () => {
  console.log('=== API Debug Test ===');
  
  // Test 1: Fetch
  try {
    await testFetch();
    console.log('✅ Test 1 (Fetch): PASSED');
  } catch (error) {
    console.error('❌ Test 1 (Fetch): FAILED', error);
  }
  
  // Test 2: Axios (if available)
  try {
    await testAxios();
    console.log('✅ Test 2 (Axios): PASSED');
  } catch (error) {
    console.error('❌ Test 2 (Axios): FAILED', error);
  }
  
  console.log('=== Tests Complete ===');
};

// Run the tests
runTests();
