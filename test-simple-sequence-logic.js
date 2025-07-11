/**
 * Test Simple Sequence Logic
 * Always increment from highest sequence (no gap filling)
 */

// Test cases untuk logika yang disederhanakan
const testCases = [
  {
    name: "Empty sequences - should start from 1",
    existingSequences: [],
    expected: {
      single: 1,
      bulk3: { start: 1, end: 3 }
    }
  },
  {
    name: "Normal sequence [1,2,3] - should increment to 4",
    existingSequences: [1, 2, 3],
    expected: {
      single: 4,
      bulk3: { start: 4, end: 6 }
    }
  },
  {
    name: "Gap in sequence [1,2,4] - should increment to 5 (NO gap filling)",
    existingSequences: [1, 2, 4],
    expected: {
      single: 5, // Increment from max (4), bukan 3
      bulk3: { start: 5, end: 7 }
    }
  },
  {
    name: "Large gaps [1,5,10] - should increment to 11 (NO gap filling)",
    existingSequences: [1, 5, 10],
    expected: {
      single: 11, // Increment from max (10), bukan 2
      bulk3: { start: 11, end: 13 }
    }
  },
  {
    name: "Unordered sequence [3,1,5] - should increment to 6",
    existingSequences: [3, 1, 5],
    expected: {
      single: 6, // Max is 5, so next is 6
      bulk3: { start: 6, end: 8 }
    }
  },
  {
    name: "Single high number [100] - should increment to 101",
    existingSequences: [100],
    expected: {
      single: 101,
      bulk3: { start: 101, end: 103 }
    }
  }
];

// Simplified sequence logic
function getNextAvailableSequence(existingSequences) {
  // If no existing sequences, start from 1
  if (existingSequences.length === 0) {
    return 1;
  }

  // Find the highest sequence and increment by 1
  const maxSequence = Math.max(...existingSequences);
  return maxSequence + 1;
}

function getNextAvailableSequenceRange(existingSequences, count) {
  // If no existing sequences, start from 1
  if (existingSequences.length === 0) {
    return {
      start: 1,
      end: count,
    };
  }

  // Find the highest sequence and start from there + 1
  const maxSequence = Math.max(...existingSequences);
  const nextStart = maxSequence + 1;
  
  return {
    start: nextStart,
    end: nextStart + count - 1,
  };
}

// Run tests
console.log("🧪 Testing Simple Sequence Logic (No Gap Filling)\n");
console.log("=" * 60);

let allPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Existing sequences: [${testCase.existingSequences.join(', ')}]`);
  
  // Test single asset
  const singleResult = getNextAvailableSequence(testCase.existingSequences);
  const singleExpected = testCase.expected.single;
  const singlePass = singleResult === singleExpected;
  
  console.log(`   Single asset: ${singleResult} (expected: ${singleExpected}) ${singlePass ? '✅' : '❌'}`);
  
  // Test bulk assets (count = 3)
  const bulkResult = getNextAvailableSequenceRange(testCase.existingSequences, 3);
  const bulkExpected = testCase.expected.bulk3;
  const bulkPass = bulkResult.start === bulkExpected.start && bulkResult.end === bulkExpected.end;
  
  console.log(`   Bulk 3 assets: ${bulkResult.start}-${bulkResult.end} (expected: ${bulkExpected.start}-${bulkExpected.end}) ${bulkPass ? '✅' : '❌'}`);
  
  const testPassed = singlePass && bulkPass;
  if (!testPassed) {
    console.log(`   ❌ TEST FAILED`);
    allPassed = false;
  } else {
    console.log(`   ✅ TEST PASSED`);
  }
});

console.log("\n" + "=" * 60);
console.log("\n📋 Test Summary:");
if (allPassed) {
  console.log("✅ ALL TESTS PASSED!");
} else {
  console.log("❌ SOME TESTS FAILED!");
}

console.log("\n🎯 Simple Logic Rules:");
console.log("📈 Always increment from highest existing sequence");
console.log("🚫 No gap filling - ignore missing sequences");
console.log("📦 Bulk assets get consecutive range after max");

console.log("\n🔍 Examples:");
console.log("• Sequences [1,2,3] → Next: 4");
console.log("• Sequences [1,2,4] → Next: 5 (bukan 3)");
console.log("• Sequences [1,5,10] → Next: 11 (bukan 2)");
console.log("• Sequences [100] → Next: 101");

console.log("\n💡 Benefits:");
console.log("• Predictable - always increment from max");
console.log("• Simple - no complex gap detection logic");
console.log("• Fast - just find max and add 1");
console.log("• Scalable - works with any sequence pattern");
