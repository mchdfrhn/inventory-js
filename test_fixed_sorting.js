// Test the improved sorting function
function createSortableKey(kode) {
  // Split the code by periods to handle each segment properly
  const parts = kode.split('.');
  
  // If it has suffix (bulk asset like "009.20.4.25.002-003")
  if (kode.includes('-')) {
    const [mainCode, suffix] = kode.split('-');
    const mainParts = mainCode.split('.');
    // Pad each segment to ensure proper sorting
    const paddedMain = mainParts.map(part => part.padStart(3, '0')).join('.');
    return `${paddedMain}-${suffix.padStart(3, '0')}`;
  }
  
  // For regular assets, pad each segment
  return parts.map(part => part.padStart(3, '0')).join('.');
}

// Test data from user
const testCodes = [
  '009.20.4.25.002',
  '009.20.4.25.003', 
  '009.20.4.25.004',
  '009.20.4.25.005',
  '009.20.4.25.006',
  '009.20.4.25.007',
  '005.20.4.25.001'
];

console.log('Original order:', testCodes);

// Transform to sortable keys
const withKeys = testCodes.map(code => ({
  original: code,
  sortable: createSortableKey(code)
}));

console.log('\nSortable keys:');
withKeys.forEach(item => {
  console.log(`${item.original} → ${item.sortable}`);
});

// Sort by sortable keys
const sorted = withKeys.sort((a, b) => a.sortable.localeCompare(b.sortable));

console.log('\nSorted result:');
sorted.forEach(item => {
  console.log(item.original);
});

// Verify the expected order
const expectedOrder = [
  '005.20.4.25.001',
  '009.20.4.25.002',
  '009.20.4.25.003',
  '009.20.4.25.004', 
  '009.20.4.25.005',
  '009.20.4.25.006',
  '009.20.4.25.007'
];

const actualOrder = sorted.map(item => item.original);
const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);

console.log('\nExpected order:', expectedOrder);
console.log('Actual order:  ', actualOrder);
console.log('Test result:', isCorrect ? 'PASS ✅' : 'FAIL ❌');
