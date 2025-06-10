// Usage example for the enhanced fuzzy search functionality

import { getBandsBySearchTerm, getBandsBySearchTermWithDebug } from './src/lib/data/bands-data';

/**
 * Examples of how the fuzzy search handles different scenarios:
 * 
 * 1. Nordic characters:
 *    - Search: "manegarm" → Finds: "Månegarm"
 *    - Search: "angantyr" → Finds: "Ängantyr"
 * 
 * 2. Apostrophes and punctuation:
 *    - Search: "belakor" → Finds: "Be'lakor"
 *    - Search: "neobliviscaris" → Finds: "Ne Obliviscaris"
 * 
 * 3. URL-encoded characters:
 *    - Search: "be%27lakor" → Finds: "Be'lakor"
 *    - Search: "amon%20amarth" → Finds: "Amon Amarth"
 * 
 * 4. Multiple search strategies:
 *    - Short terms (≤3 chars): exact → starts with → fuzzy
 *    - Long terms: contains → (if too many) exact/starts with → (if few/none) fuzzy
 */

async function demonstrateFuzzySearch() {
  const testCases = [
    'manegarm',      // Nordic characters
    'belakor',       // Apostrophe
    'be%27lakor',    // URL-encoded apostrophe
    'insomnium',     // Regular search
    'emp',           // Short term
  ];

  for (const searchTerm of testCases) {
    console.log(`\n=== Searching for: "${searchTerm}" ===`);
    
    try {
      // Use the debug version to see how the search works
      const result = await getBandsBySearchTermWithDebug(searchTerm);
      
      console.log(`Search method: ${result.searchInfo.searchMethod}`);
      console.log(`Variants tried: ${result.searchInfo.variants.slice(0, 3).join(', ')}...`);
      console.log(`Results found: ${result.searchInfo.resultCount}`);
      
      if (result.results.length > 0) {
        result.results.slice(0, 3).forEach((band, i) => {
          console.log(`  ${i + 1}. ${band.namePretty} (${band.country})`);
        });
      }
    } catch (error) {
      console.error(`Error searching for "${searchTerm}":`, error);
    }
  }
}

// Export the function for use in other modules
export { demonstrateFuzzySearch };
