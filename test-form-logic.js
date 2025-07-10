// Create a simple test to verify the location form is working
async function testLocationForm() {
  try {
    // Simulate the API call that the form would make
    const response = await fetch('http://localhost:3001/api/v1/locations?page=1&pageSize=100');
    const data = await response.json();
    
    console.log('API Response:', data);
    
    if (data.success && data.data) {
      const locations = data.data;
      
      // Simulate the generateNextCode function
      const numericCodes = locations
        .map(location => {
          let match = location.code.match(/^(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            console.log(`Pure numeric code "${location.code}" -> ${num}`);
            return num;
          }
          return null;
        })
        .filter(code => code !== null)
        .sort((a, b) => b - a);

      console.log('All numeric codes found:', numericCodes);
      const highestCode = numericCodes.length > 0 ? numericCodes[0] : 0;
      const nextCode = (highestCode + 1).toString().padStart(3, '0');
      
      console.log(`Expected next code: ${nextCode}`);
      
      return nextCode;
    }
  } catch (error) {
    console.error('Error testing location form:', error);
  }
}

testLocationForm().then(result => {
  console.log('Test completed. Next code should be:', result);
});
