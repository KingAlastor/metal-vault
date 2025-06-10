// Test script to verify duplicate removal in fuzzy search
// This test demonstrates how the enhanced deduplication prevents duplicate results

import { getBandsBySearchTerm, getBandsBySearchTermWithDebug } from '../src/lib/data/bands-data';

async function testDuplicateRemoval() {
  console.log('=== Testing Duplicate Removal in Fuzzy Search ===\n');
  
  const testCases = [
    'amon amarth',    // Common search that might return duplicates
    'insomnium',      // Another test case
    'emp',            // Short term that triggers multiple search strategies
  ];

  for (const searchTerm of testCases) {
    console.log(`\n--- Testing: "${searchTerm}" ---`);
    
    try {
      // Test with debug function to see search strategy
      const debugResult = await getBandsBySearchTermWithDebug(searchTerm);
      
      console.log(`Search method: ${debugResult.searchInfo.searchMethod}`);
      console.log(`Total results: ${debugResult.results.length}`);
      
      // Check for duplicates by ID
      const bandIds = debugResult.results.map(band => band.bandId);
      const uniqueIds = new Set(bandIds);
      const hasDuplicates = bandIds.length !== uniqueIds.size;
      
      console.log(`Unique IDs: ${uniqueIds.size}`);
      console.log(`Has duplicates: ${hasDuplicates ? 'YES ❌' : 'NO ✅'}`);
      
      if (hasDuplicates) {
        console.log('⚠️  DUPLICATE DETECTION:');
        const duplicateIds = bandIds.filter((id, index) => bandIds.indexOf(id) !== index);
        console.log(`Duplicate IDs found: ${[...new Set(duplicateIds)].join(', ')}`);
      }
      
      // Show first few results
      if (debugResult.results.length > 0) {
        console.log('\nFirst 3 results:');
        debugResult.results.slice(0, 3).forEach((band, i) => {
          console.log(`  ${i + 1}. ${band.namePretty} (ID: ${band.bandId})`);
        });
      }
      
    } catch (error) {
      console.error(`Error testing "${searchTerm}":`, error);
    }
  }
  
  console.log('\n=== Test Complete ===');
}

// Export for use
export { testDuplicateRemoval };
