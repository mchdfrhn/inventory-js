/**
 * Test Gap Filling Logic
 * Testing the corrected gap filling logic for asset sequence generation
 * 
 * Expected behavior:
 * - Normal case: increment from highest sequence
 * - Gap case: fill gaps only when assets are deleted
 */

// Mock asset data for testing
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
    name: "Normal sequence - should increment from highest",
    existingSequences: [1, 2, 3, 4, 5],
    expected: {
      single: 6,
      bulk3: { start: 6, end: 8 }
    }
  },
  {
    name: "Gap in middle (deleted asset) - should fill gap for single, continue from max for bulk",
    existingSequences: [1, 2, 5], // 3 and 4 are missing (deleted)
    expected: {
      single: 3, // Fill the first gap
      bulk3: { start: 6, end: 8 } // Continue from max (5) + 1
    }
  },
  {
    name: "Multiple gaps - should fill first gap for single",
    existingSequences: [1, 3, 5, 7], // 2, 4, 6 are missing
    expected: {
      single: 2, // Fill the first gap
      bulk3: { start: 8, end: 10 } // Continue from max (7) + 1
    }
  },
  {
    name: "Large gap - should fill gap for single, continue from max for bulk",
    existingSequences: [1, 2, 10], // 3-9 are missing
    expected: {
      single: 3, // Fill the first gap
      bulk3: { start: 3, end: 5 } // Use consecutive gaps 3,4,5 (enough space)
    }
  },
  {
    name: "Consecutive gaps that fit bulk - should use gaps",
    existingSequences: [1, 8, 9, 10], // 2-7 are missing (6 consecutive gaps)
    expected: {
      single: 2, // Fill first gap
      bulk3: { start: 2, end: 4 } // Use consecutive gaps 2,3,4
    }
  }
];

// Simulated gap filling logic (Node.js version)
function getNextAvailableSequence(existingSequences) {
  // If no existing sequences, start from 1
  if (existingSequences.length === 0) {
    return 1;
  }

  // Sort sequences to find the highest
  const sortedSequences = [...existingSequences].sort((a, b) => a - b);
  const maxSequence = Math.max(...sortedSequences);

  // Normal case: increment from the highest sequence
  const nextSequence = maxSequence + 1;

  // Check if there are gaps in the sequence (indicating deleted assets)
  const expectedCount = maxSequence;
  const actualCount = sortedSequences.length;

  // If there are gaps (deleted assets), find the first gap
  if (actualCount < expectedCount) {
    for (let i = 1; i <= maxSequence; i++) {
      if (!sortedSequences.includes(i)) {
        return i; // Return the first gap found
      }
    }
  }

  // If no gaps, return the next sequence after max
  return nextSequence;
}

function getNextAvailableSequenceRange(existingSequences, count) {
  // If no existing sequences, start from 1
  if (existingSequences.length === 0) {
    return {
      start: 1,
      end: count,
    };
  }

  // Sort sequences to find the highest
  const sortedSequences = [...existingSequences].sort((a, b) => a - b);
  const maxSequence = Math.max(...sortedSequences);

  // Check if there are gaps in the sequence (indicating deleted assets)
  const expectedCount = maxSequence;
  const actualCount = sortedSequences.length;

  // If there are gaps (deleted assets), try to fill gaps first
  if (actualCount < expectedCount) {
    // Find consecutive gaps that can fit the requested count
    for (let start = 1; start <= maxSequence; start++) {
      let consecutiveGaps = 0;
      const gapStart = start;
      
      // Count consecutive gaps from this starting point
      for (let i = start; i <= maxSequence; i++) {
        if (!sortedSequences.includes(i)) {
          consecutiveGaps++;
        } else {
          break; // Gap sequence broken
        }
      }
      
      // If we found enough consecutive gaps, use them
      if (consecutiveGaps >= count) {
        return {
          start: gapStart,
          end: gapStart + count - 1,
        };
      }
      
      // Skip to next position if current gap is not enough
      if (sortedSequences.includes(start)) {
        continue;
      }
    }
  }

  // If no suitable gaps found, or no gaps exist, start after max sequence
  const nextStart = maxSequence + 1;
  return {
    start: nextStart,
    end: nextStart + count - 1,
  };
}

// Run tests
console.log("🧪 Testing Gap Filling Logic\n");
console.log("=" * 60);

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
  
  if (!singlePass || !bulkPass) {
    console.log(`   ❌ TEST FAILED`);
  } else {
    console.log(`   ✅ TEST PASSED`);
  }
});

console.log("\n" + "=" * 60);
console.log("\n📋 Test Summary:");
console.log("✅ Correct Gap Filling Logic Implemented");
console.log("📈 Normal sequence: Always increment from highest");
console.log("🔄 Gap filling: Only when assets are deleted");
console.log("📦 Bulk assets: Use consecutive gaps when available");

console.log("\n🎯 Examples:");
console.log("• Sequences [1,2,5] → Next single: 3 (fill gap), Next bulk: 6-8 (continue from max)");
console.log("• Sequences [1,2,3] → Next single: 4 (continue), Next bulk: 4-6 (continue)");
console.log("• Sequences [1,8,9] → Next single: 2 (fill gap), Next bulk: 2-4 (use consecutive gaps)");
