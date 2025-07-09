const testConnection = async () => {
  try {
    // Test if page is loading
    const response = await fetch('http://localhost:5173/');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const html = await response.text();
    console.log('HTML length:', html.length);
    console.log('HTML preview:', html.substring(0, 500));
    
    // Test if main.tsx is loading
    const mainResponse = await fetch('http://localhost:5173/src/main.tsx');
    console.log('Main.tsx status:', mainResponse.status);
    
    // Try to get the actual content
    const mainContent = await mainResponse.text();
    console.log('Main.tsx content preview:', mainContent.substring(0, 200));
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testConnection();
