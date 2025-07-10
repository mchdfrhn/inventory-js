// Test the form directly by simulating browser behavior
const { default: fetch } = require('node-fetch');

async function testFormFlow() {
  try {
    console.log('=== TESTING LOCATION FORM FLOW ===');
    
    // 1. Test frontend accessibility  
    console.log('1. Testing frontend accessibility...');
    const frontendResponse = await fetch('http://localhost:5176/locations/new');
    console.log('Frontend status:', frontendResponse.status);
    
    // 2. Test API through proxy
    console.log('2. Testing API through proxy...');
    const proxyResponse = await fetch('http://localhost:5176/api/v1/locations?page=1&pageSize=100');
    const proxyData = await proxyResponse.json();
    console.log('Proxy response success:', proxyData.success);
    console.log('Total locations via proxy:', proxyData.pagination?.total);
    
    // 3. Test direct API  
    console.log('3. Testing direct API...');
    const directResponse = await fetch('http://localhost:3001/api/v1/locations?page=1&pageSize=100');
    const directData = await directResponse.json();
    console.log('Direct API success:', directData.success);
    console.log('Total locations direct:', directData.pagination?.total);
    
    // 4. Test form logic
    console.log('4. Testing form logic...');
    if (directData.success && directData.data) {
      const locations = directData.data;
      
      // Simulate generateNextCode
      const numericCodes = locations
        .map(location => {
          let match = location.code.match(/^(\d+)$/);
          if (match) {
            return parseInt(match[1], 10);
          }
          return null;
        })
        .filter(code => code !== null)
        .sort((a, b) => b - a);

      const highestCode = numericCodes.length > 0 ? numericCodes[0] : 0;
      const nextCode = (highestCode + 1).toString().padStart(3, '0');
      
      console.log('Highest code found:', highestCode);
      console.log('Next code generated:', nextCode);
      console.log('Expected: 053, Actual:', nextCode);
      console.log('✅ SUCCESS:', nextCode === '053' ? 'CORRECT' : 'WRONG');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testFormFlow();
