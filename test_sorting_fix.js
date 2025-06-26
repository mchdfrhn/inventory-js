// Test untuk memverifikasi perbaikan sorting asset codes
console.log('🧪 TESTING FIXED ASSET CODE SORTING');
console.log('====================================');

// Helper function sesuai dengan yang baru di ExportButton
function createSortableKey(kode) {
  // For bulk assets with suffix (e.g., "009.20.4.25.002-003")
  if (kode.includes('-')) {
    const [mainCode, suffix] = kode.split('-');
    return `${mainCode}-${suffix.padStart(3, '0')}`;
  }
  
  // For regular assets, return the code as is
  return kode;
}

// Test data sesuai dengan yang disebutkan user
const testAssets = [
  { kode: "009.20.4.25.002", nama: "Asset A" },
  { kode: "009.20.4.25.003", nama: "Asset B" },
  { kode: "009.20.4.25.004", nama: "Asset C" },
  { kode: "009.20.4.25.005", nama: "Asset D" },
  { kode: "009.20.4.25.006", nama: "Asset E" },
  { kode: "009.20.4.25.007", nama: "Asset F" },
  { kode: "005.20.4.25.001", nama: "Asset G" }
];

console.log('\n📊 Input order (current wrong order):');
testAssets.forEach((asset, index) => {
  console.log(`  ${index + 1}. ${asset.kode} - ${asset.nama}`);
});

// Test sorting dengan metode baru
console.log('\n🔧 Testing new sorting method...');
const sortedAssets = [...testAssets].sort((a, b) => {
  const keyA = createSortableKey(a.kode);
  const keyB = createSortableKey(b.kode);
  return keyA.localeCompare(keyB, undefined, { numeric: true });
});

console.log('\n✅ Expected correct order:');
const expectedOrder = [
  "005.20.4.25.001",
  "009.20.4.25.002", 
  "009.20.4.25.003",
  "009.20.4.25.004",
  "009.20.4.25.005",
  "009.20.4.25.006",
  "009.20.4.25.007"
];

expectedOrder.forEach((kode, index) => {
  console.log(`  ${index + 1}. ${kode}`);
});

console.log('\n📊 Actual sorted order:');
sortedAssets.forEach((asset, index) => {
  console.log(`  ${index + 1}. ${asset.kode} - ${asset.nama}`);
});

// Verify correctness
const actualOrder = sortedAssets.map(a => a.kode);
const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);

console.log(`\n🎯 Sorting verification: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

if (isCorrect) {
  console.log('\n🎉 SUCCESS: Asset sorting is now working correctly!');
  console.log('   - 005.20.4.25.001 comes before 009.x.x.x assets');
  console.log('   - Sequential order within same prefix is maintained');
} else {
  console.log('\n❌ FAILED: Sorting still needs adjustment');
  console.log('Expected:', expectedOrder);
  console.log('Actual:  ', actualOrder);
}

// Test dengan bulk suffix juga
console.log('\n📊 Testing with bulk suffixes:');
const bulkAssets = [
  { kode: "009.20.4.25.002-003", nama: "Bulk Asset 1" },
  { kode: "009.20.4.25.002-001", nama: "Bulk Asset 2" },
  { kode: "005.20.4.25.001-002", nama: "Bulk Asset 3" },
  { kode: "005.20.4.25.001-001", nama: "Bulk Asset 4" }
];

const sortedBulkAssets = [...bulkAssets].sort((a, b) => {
  const keyA = createSortableKey(a.kode);
  const keyB = createSortableKey(b.kode);
  return keyA.localeCompare(keyB, undefined, { numeric: true });
});

console.log('Sorted bulk assets:');
sortedBulkAssets.forEach((asset, index) => {
  console.log(`  ${index + 1}. ${asset.kode} - ${asset.nama}`);
});

console.log('\n✅ Test completed!');
