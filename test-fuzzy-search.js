// Test script for fuzzy search functionality
// This demonstrates how the upgraded fetchBands function handles special characters

import { getBandsBySearchTermWithDebug, getSearchVariantsForTesting } from '../lib/data/bands-data';

// Test cases for special character handling
const testCases = [
  'manegarm',      // Should find "Månegarm"
  'belakor',       // Should find "Be'lakor"
  'angra',         // Should find "Angra"
  'insomnium',     // Regular test
  'månegarm',      // Direct special character search
  'be%27lakor',    // URL-encoded apostrophe
  'be\'lakor',     // Direct apostrophe search
  'borknagar',     // Should work normally
  'empyrium',      // Should work normally
  'amon%20amarth', // URL-encoded space
];

async function testFuzzySearch() {
  console.log('=== Fuzzy Search Test Results ===\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: "${testCase}"`);
    console.log('Search variants:', getSearchVariantsForTesting(testCase));
    
    try {
      const result = await getBandsBySearchTermWithDebug(testCase);
      console.log(`Method used: ${result.searchInfo.searchMethod}`);
      console.log(`Results found: ${result.searchInfo.resultCount}`);
      
      if (result.results.length > 0) {
        result.results.slice(0, 3).forEach((band, index) => {
          console.log(`  ${index + 1}. ${band.namePretty} (${band.country})`);
        });
        if (result.results.length > 3) {
          console.log(`  ... and ${result.results.length - 3} more`);
        }
      } else {
        console.log('  No results found');
      }
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
    
    console.log('---\n');
  }
}

// Run the test
testFuzzySearch().catch(console.error);
