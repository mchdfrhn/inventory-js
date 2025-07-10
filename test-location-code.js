// Test script untuk memverifikasi logika generateNextCode
const locations = [
  { code: "001", name: "UKS" },
  { code: "002", name: "LPPM" },
  { code: "003", name: "Lobby" },
  // ... many locations in between ...
  { code: "050", name: "Selasar" },
  { code: "051", name: "Selasar" },
  { code: "052", name: "Selasar" }
];

const generateNextCode = (existingLocations) => {
  if (!existingLocations || existingLocations.length === 0) {
    console.log('No existing locations, returning 001');
    return '001';
  }

  console.log('Existing locations:', existingLocations.map(loc => ({ code: loc.code, name: loc.name })));

  // Extract numeric codes from different patterns and find the highest
  const numericCodes = existingLocations
    .map(location => {
      // Try to extract numbers from different patterns:
      // 1. Pure numeric codes like "001", "002", "052" etc.
      let match = location.code.match(/^(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        console.log(`  Pure numeric code "${location.code}" -> ${num}`);
        return num;
      }

      // 2. Alphanumeric codes like "A001", "B002", "LOC001" etc.
      match = location.code.match(/^[A-Za-z]+(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        console.log(`  Alphanumeric code "${location.code}" -> ${num}`);
        return num;
      }

      // 3. Mixed codes like "001A", "002B", etc.
      match = location.code.match(/^(\d+)[A-Za-z]+$/);
      if (match) {
        const num = parseInt(match[1], 10);
        console.log(`  Mixed code "${location.code}" -> ${num}`);
        return num;
      }

      // 4. Complex codes with numbers in the middle like "LOC001B", "A001C" etc.
      match = location.code.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        console.log(`  Complex code "${location.code}" -> ${num}`);
        return num;
      }

      console.log(`  Non-numeric code "${location.code}" -> skipped`);
      return null;
    })
    .filter(code => code !== null)
    .sort((a, b) => b - a); // Sort descending to get highest first

  console.log('All numeric codes found:', numericCodes);

  const highestCode = numericCodes.length > 0 ? numericCodes[0] : 0;
  console.log('Highest code found:', highestCode);

  const nextCode = highestCode + 1;
  console.log('Next code number:', nextCode);

  const formattedCode = nextCode.toString().padStart(3, '0');
  console.log(`Final formatted code: ${formattedCode}`);

  return formattedCode;
};

// Test dengan data lokasi yang ada
console.log('=== TESTING generateNextCode FUNCTION ===');
const result = generateNextCode(locations);
console.log('=== RESULT ===');
console.log('Expected: 053');
console.log('Actual:', result);
console.log('Success:', result === '053' ? 'YES' : 'NO');
