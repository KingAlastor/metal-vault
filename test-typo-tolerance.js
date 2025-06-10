// Test script for typo-tolerant search functionality
// This demonstrates how the enhanced search handles typos and misspellings

import { getBandsBySearchTermWithDebug, getSearchVariantsForTesting } from './src/lib/data/bands-data.js';

// Test cases for typo tolerance
const typoTestCases = [
  // Common typos from the requirements
  { input: 'amom amarth', expected: 'Amon Amarth', description: 'Missing letter (n)' },
  { input: 'sayr', expected: 'Saor', description: 'Letter transposition' },
  
  // Additional typo patterns
  { input: 'metallica', expected: 'Metallica', description: 'Exact match (control)' },
  { input: 'metalica', expected: 'Metallica', description: 'Missing double letter' },
  { input: 'mettalica', expected: 'Metallica', description: 'Wrong double letter position' },
  { input: 'metallia', expected: 'Metallica', description: 'Character substitution' },
  
  // Nordic character typos
  { input: 'manegarm', expected: 'Månegarm', description: 'Missing Nordic character' },
  { input: 'angantyr', expected: 'Ängantyr', description: 'Missing umlaut' },
  
  // Punctuation typos
  { input: 'belakor', expected: "Be'lakor", description: 'Missing apostrophe' },
  { input: 'be lakor', expected: "Be'lakor", description: 'Space instead of apostrophe' },
  
  // Common metal band typos
  { input: 'nightwsh', expected: 'Nightwish', description: 'Missing vowel' },
  { input: 'dimmu borgr', expected: 'Dimmu Borgir', description: 'Missing letter at end' },
  { input: 'opeht', expected: 'Opeth', description: 'Letter transposition' },
  { input: 'darkthron', expected: 'Darkthrone', description: 'Missing letter at end' },
  
  // Phonetic similarity
  { input: 'enslayved', expected: 'Enslaved', description: 'Phonetic spelling error' },
  { input: 'empyrium', expected: 'Empyrium', description: 'Exact match (control)' },
  { input: 'emperium', expected: 'Empyrium', description: 'Phonetic substitution' },
];

// Extended test cases for special characters and encoding
const specialCharTestCases = [
  { input: 'be%27lakor', expected: "Be'lakor", description: 'URL-encoded apostrophe' },
  { input: 'amon%20amarth', expected: 'Amon Amarth', description: 'URL-encoded space' },
  { input: 'månegarm', expected: 'Månegarm', description: 'Direct Nordic character input' },
  { input: 'ängantyr', expected: 'Ängantyr', description: 'Direct umlaut input' },
];

async function testTypoTolerance() {
  console.log('=== Typo-Tolerant Search Test Results ===\n');
  
  let totalTests = 0;
  let successfulTests = 0;
  
  // Test typo tolerance
  console.log('--- TYPO TOLERANCE TESTS ---\n');
  for (const testCase of typoTestCases) {
    totalTests++;
    console.log(`Testing: "${testCase.input}" (${testCase.description})`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      const result = await getBandsBySearchTermWithDebug(testCase.input);
      console.log(`Search method: ${result.searchInfo.searchMethod}`);
      console.log(`Results found: ${result.searchInfo.resultCount}`);
      
      if (result.results.length > 0) {
        const topResult = result.results[0];
        console.log(`Top result: ${topResult.namePretty}`);
        
        // Check if expected band is in top 3 results
        const foundExpected = result.results.slice(0, 3).some(band => 
          band.namePretty.toLowerCase().includes(testCase.expected.toLowerCase()) ||
          testCase.expected.toLowerCase().includes(band.namePretty.toLowerCase())
        );
        
        if (foundExpected) {
          console.log('✅ SUCCESS: Expected band found in top 3 results');
          successfulTests++;
        } else {
          console.log('❌ FAILED: Expected band not found in top 3 results');
          console.log('Top 3 results:');
          result.results.slice(0, 3).forEach((band, index) => {
            console.log(`  ${index + 1}. ${band.namePretty} (${band.country})`);
          });
        }
      } else {
        console.log('❌ FAILED: No results found');
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('---\n');
  }
  
  // Test special characters and encoding
  console.log('--- SPECIAL CHARACTER TESTS ---\n');
  for (const testCase of specialCharTestCases) {
    totalTests++;
    console.log(`Testing: "${testCase.input}" (${testCase.description})`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      const result = await getBandsBySearchTermWithDebug(testCase.input);
      console.log(`Search method: ${result.searchInfo.searchMethod}`);
      console.log(`Results found: ${result.searchInfo.resultCount}`);
      
      if (result.results.length > 0) {
        const foundExpected = result.results.slice(0, 3).some(band => 
          band.namePretty === testCase.expected
        );
        
        if (foundExpected) {
          console.log('✅ SUCCESS: Expected band found');
          successfulTests++;
        } else {
          console.log('❌ FAILED: Expected band not found');
          console.log('Top results:');
          result.results.slice(0, 3).forEach((band, index) => {
            console.log(`  ${index + 1}. ${band.namePretty}`);
          });
        }
      } else {
        console.log('❌ FAILED: No results found');
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('---\n');
  }
  
  console.log(`=== SUMMARY ===`);
  console.log(`Total tests: ${totalTests}`);
  console.log(`Successful: ${successfulTests}`);
  console.log(`Failed: ${totalTests - successfulTests}`);
  console.log(`Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
}

// Function to test search variants generation
async function testSearchVariants() {
  console.log('\n=== SEARCH VARIANTS GENERATION TEST ===\n');
  
  const testTerms = ['amom amarth', 'sayr', 'belakor', 'manegarm'];
  
  for (const term of testTerms) {
    console.log(`Variants for "${term}":`);
    try {
      const variants = await getSearchVariantsForTesting(term);
      variants.forEach((variant, index) => {
        console.log(`  ${index + 1}. "${variant}"`);
      });
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
    console.log('---\n');
  }
}

// Function to test individual algorithms
async function testAlgorithms() {
  console.log('\n=== ALGORITHM TESTING ===\n');
  
  // Test cases for algorithm validation
  const algorithmTests = [
    { input1: 'amom', input2: 'amon', algorithm: 'Levenshtein Distance' },
    { input1: 'sayr', input2: 'saor', algorithm: 'Levenshtein Distance' },
    { input1: 'amarth', input2: 'amarth', algorithm: 'Exact Match' },
    { input1: 'metal', input2: 'metal', algorithm: 'Soundex Phonetic' },
    { input1: 'night', input2: 'knight', algorithm: 'Soundex Phonetic' },
  ];
  
  console.log('Note: Algorithm testing requires direct access to helper functions.');
  console.log('These are tested indirectly through the search function results above.\n');
}

// Run all tests
async function runAllTests() {
  try {
    await testTypoTolerance();
    await testSearchVariants();
    await testAlgorithms();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

// Export for use in other modules
export { runAllTests, testTypoTolerance, testSearchVariants };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}
