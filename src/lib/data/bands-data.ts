"use server";

import sql from "@/lib/db";
import { AlbumTrack, Band, BandAlbum } from "@/lib/database-schema-types";

export type SearchTermBand = {
  bandId: string;
  namePretty: string;
  bandName: string;
  country: string | null;
  genreTags: string[];
  followers: number;
};

export const getBandsBySearchTerm = async (
  searchTerm: string
): Promise<SearchTermBand[]> => {
  let bands;
  
  // First try exact matches and starts with for short terms
  if (searchTerm.length <= 3) {
    bands = await fetchBands(searchTerm, "equals");
    if (bands.length === 0) {
      bands = await fetchBands(searchTerm, "startsWith");
    }
    // If still no results, try fuzzy search for special characters
    if (bands.length === 0) {
      bands = await fetchBands(searchTerm, "fuzzy");
    }
  } else {
    // For longer terms, try contains first
    bands = await fetchBands(searchTerm, "contains");
    
    // If too many results, try more specific searches
    if (bands.length > 30) {
      bands = await fetchBands(searchTerm, "equals");
      if (bands.length === 0) {
        bands = await fetchBands(searchTerm, "startsWith");
      }
    }    // If no results or very few results, try fuzzy search first, then typo-tolerant search
    if (bands.length === 0 || (bands.length < 5 && searchTerm.length > 5)) {
      const fuzzyResults = await fetchBands(searchTerm, "fuzzy");
      
      // Deduplicate results by band id
      const existingIds = new Set(bands.map(band => band.id));
      const uniqueFuzzyResults = fuzzyResults.filter(band => !existingIds.has(band.id));
      
      // Combine results, prioritizing exact matches
      bands = [...bands, ...uniqueFuzzyResults];
      
      // If still no results, try typo-tolerant search
      if (bands.length === 0 && searchTerm.length > 3) {
        const typoResults = await fetchBands(searchTerm, "typoTolerant");
        const uniqueTypoResults = typoResults.filter(band => !existingIds.has(band.id));
        bands = [...bands, ...uniqueTypoResults];
      }
    }
  }
  if (bands && bands.length > 0) {
    // Final deduplication by band id to ensure no duplicates
    const uniqueBands = bands.filter((band, index, self) => 
      index === self.findIndex(b => b.id === band.id)
    );
    
    const bandsWithFormattedNames = uniqueBands.map((band) => ({
      bandId: band.id,
      namePretty: band.name_pretty,
      country: band.country || null,
      genreTags: band.genre_tags || [],
      bandName: `${band.name_pretty} (${band.country}) {${band.genre_tags.join(
        ", "
      )}}`,
      followers: band.followers ?? 0,
    }));

    return bandsWithFormattedNames;
  } else return [];
};

type WhereCondition = "equals" | "contains" | "startsWith" | "fuzzy" | "typoTolerant";

// Character normalization helper functions
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')
    .trim();
};

// Levenshtein distance for typo detection
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // If one string is empty, distance is the length of the other
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
};

// Soundex algorithm for phonetic matching
const soundex = (str: string): string => {
  const normalized = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (normalized.length === 0) return '0000';

  const firstLetter = normalized[0];
  let code = firstLetter;

  // Soundex mapping
  const mapping: { [key: string]: string } = {
    'B': '1', 'F': '1', 'P': '1', 'V': '1',
    'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
    'D': '3', 'T': '3',
    'L': '4',
    'M': '5', 'N': '5',
    'R': '6'
  };

  for (let i = 1; i < normalized.length; i++) {
    const char = normalized[i];
    const mapped = mapping[char] || '';
    
    // Don't add duplicates or empty mappings
    if (mapped && mapped !== code[code.length - 1]) {
      code += mapped;
    }
  }

  // Pad or truncate to 4 characters
  return (code + '0000').substring(0, 4);
};

// Generate typo variants using common typo patterns
const generateTypoVariants = (searchTerm: string): string[] => {
  const variants = new Set<string>();
  const normalized = normalizeString(searchTerm);
  
  // Original and normalized
  variants.add(searchTerm);
  variants.add(normalized);

  // Common typo patterns
  const patterns = [
    // Character swaps (transposition)
    (str: string) => {
      const swaps = [];
      for (let i = 0; i < str.length - 1; i++) {
        const chars = str.split('');
        [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
        swaps.push(chars.join(''));
      }
      return swaps;
    },
    
    // Missing characters (deletion)
    (str: string) => {
      const deletions = [];
      for (let i = 0; i < str.length; i++) {
        deletions.push(str.slice(0, i) + str.slice(i + 1));
      }
      return deletions;
    },
    
    // Extra characters (insertion) - common duplicates
    (str: string) => {
      const insertions = [];
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        insertions.push(str.slice(0, i) + char + str.slice(i));
      }
      return insertions;
    },
      // Common character substitutions
    (str: string) => {
      const substitutions = [];
      const commonSubs: { [key: string]: string[] } = {
        'a': ['e', 'o'],
        'e': ['a', 'i'],
        'i': ['e', 'y'],
        'o': ['a', 'u', 'ø', 'ö'],
        'u': ['o', 'oo'],
        'm': ['n'],
        'n': ['m'],
        'r': ['l'],
        'l': ['r'],
        's': ['z'],
        'z': ['s'],
        'c': ['k'],
        'k': ['c'],
        'f': ['ph'],
        'ph': ['f'],
        'y': ['i'],
        // Specific patterns for common metal band typos
        'amom': ['amon'], // "amom amarth" → "amon amarth"
        'sayr': ['saor'], // "sayr" → "saor"
        'belakor': ['be\'lakor', 'be lakor'],
        'metalica': ['metallica'],
        'nightwsh': ['nightwish'],
        'opeht': ['opeth'],
        'darkthron': ['darkthrone'],
        'emperium': ['empyrium']
      };
      
      // Check for direct word replacements first
      const lowerStr = str.toLowerCase();
      for (const [typo, corrections] of Object.entries(commonSubs)) {
        if (lowerStr === typo || lowerStr.includes(typo)) {
          corrections.forEach(correction => {
            substitutions.push(str.replace(new RegExp(typo, 'gi'), correction));
          });
        }
      }
      
      // Character-by-character substitutions
      for (let i = 0; i < str.length; i++) {
        const char = str[i].toLowerCase();
        const subs = commonSubs[char] || [];
        for (const sub of subs) {
          substitutions.push(str.slice(0, i) + sub + str.slice(i + 1));
        }
      }
      return substitutions;
    }
  ];

  // Apply patterns to generate variants
  const termsToProcess = [searchTerm, normalized];
  for (const term of termsToProcess) {
    for (const pattern of patterns) {
      pattern(term).forEach(variant => variants.add(variant));
    }
  }

  return Array.from(variants).filter(v => v.length > 0);
};

// Check if two strings are similar using multiple algorithms
const areSimilar = (str1: string, str2: string, threshold: number = 0.7): boolean => {
  if (!str1 || !str2) return false;
  
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  
  // Exact match
  if (norm1 === norm2) return true;
  
  // Levenshtein distance based similarity
  const maxLen = Math.max(norm1.length, norm2.length);
  if (maxLen === 0) return true;
  
  const distance = levenshteinDistance(norm1, norm2);
  const similarity = 1 - (distance / maxLen);
  
  if (similarity >= threshold) return true;
  
  // Soundex phonetic similarity for words > 3 chars
  if (norm1.length > 3 && norm2.length > 3) {
    return soundex(norm1) === soundex(norm2);
  }
  
  return false;
};

const urlDecodeString = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
};

const createSearchVariants = (searchTerm: string): string[] => {
  const variants = new Set<string>();
  
  // Original term
  variants.add(searchTerm);
  
  // URL decoded version
  const decoded = urlDecodeString(searchTerm);
  variants.add(decoded);
  
  // Normalized versions
  variants.add(normalizeString(searchTerm));
  variants.add(normalizeString(decoded));
  
  // Add typo variants for terms longer than 3 characters
  if (searchTerm.length > 3) {
    const typoVariants = generateTypoVariants(searchTerm);
    typoVariants.forEach(variant => variants.add(variant));
    
    // Also generate typo variants for decoded version
    const decodedTypoVariants = generateTypoVariants(decoded);
    decodedTypoVariants.forEach(variant => variants.add(variant));
  }
  
  // Common character replacements for Nordic/Germanic languages
  const createVariantsWithReplacements = (base: string): string[] => {
    const results = [base];
    
    // Nordic characters
    results.push(base.replace(/ae/g, 'æ'));
    results.push(base.replace(/oe/g, 'œ'));
    results.push(base.replace(/aa/g, 'å'));
    results.push(base.replace(/o/g, 'ø'));
    
    // Germanic characters
    results.push(base.replace(/ss/g, 'ß'));
    results.push(base.replace(/a/g, 'ä'));
    results.push(base.replace(/o/g, 'ö'));
    results.push(base.replace(/u/g, 'ü'));
    
    // Remove common punctuation that might cause issues
    results.push(base.replace(/'/g, ''));
    results.push(base.replace(/-/g, ''));
    results.push(base.replace(/_/g, ''));
    
    return results;
  };
  
  // Apply replacements to all current variants
  Array.from(variants).forEach(variant => {
    createVariantsWithReplacements(variant).forEach(v => variants.add(v));
    createVariantsWithReplacements(variant.toLowerCase()).forEach(v => variants.add(v));
  });
  
  // Limit variants to prevent excessive database queries (keep most promising ones)
  const variantArray = Array.from(variants).filter(v => v.length > 0);
  
  // Prioritize: original, decoded, normalized, then typo variants
  const prioritized = [
    searchTerm,
    decoded,
    normalizeString(searchTerm),
    normalizeString(decoded),
    ...variantArray.filter(v => ![searchTerm, decoded, normalizeString(searchTerm), normalizeString(decoded)].includes(v))
  ].filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates while preserving order
  
  // Limit to reasonable number to prevent performance issues
  return prioritized.slice(0, 20);
};

const fetchBands = async (searchTerm: string, condition: WhereCondition) => {
  if (condition === 'fuzzy') {
    return await fetchBandsFuzzy(searchTerm);
  }
  
  if (condition === 'typoTolerant') {
    return await fetchBandsWithTypoTolerance(searchTerm);
  }
  
  const query = {
    equals: sql`name_pretty ILIKE ${searchTerm}`,
    contains: sql`name_pretty ILIKE ${'%' + searchTerm + '%'}`,
    startsWith: sql`name_pretty ILIKE ${searchTerm + '%'}`
  };

  return await sql`
    SELECT 
      id,
      name_pretty,
      country,
      genre_tags,
      followers
    FROM bands 
    WHERE ${query[condition]}
    ORDER BY name_pretty
  `;
};

const fetchBandsFuzzy = async (searchTerm: string) => {
  try {
    // Try the advanced regex-based search first
    const searchVariants = createSearchVariants(searchTerm);
    const primaryVariants = searchVariants.slice(0, 4);
    
    let results = await searchWithVariants(primaryVariants);
    
    if (results.length === 0 && searchVariants.length > 4) {
      results = await searchWithVariants(searchVariants);
    }
    
    return results;
  } catch (error) {
    // Fallback to simple search if regex fails
    console.warn('Regex-based fuzzy search failed, falling back to simple search:', error);
    return await fetchBandsFuzzySimple(searchTerm);
  }
};

// Simple fallback fuzzy search without regex (for compatibility)
const fetchBandsFuzzySimple = async (searchTerm: string) => {
  const searchVariants = createSearchVariants(searchTerm);
  
  // Use basic LIKE searches with character replacements
  const conditions = searchVariants.flatMap(variant => [
    sql`LOWER(name_pretty) = ${variant.toLowerCase()}`,
    sql`LOWER(name_pretty) LIKE ${variant.toLowerCase() + '%'}`,
    sql`LOWER(name_pretty) LIKE ${'%' + variant.toLowerCase() + '%'}`,
    // Manual character replacements for common Nordic characters
    sql`LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name_pretty, 'æ', 'ae'), 'ø', 'o'), 'å', 'a'), '''', '')) LIKE ${'%' + normalizeString(variant) + '%'}`
  ]);
  
  if (conditions.length === 0) return [];
  
  const whereClause = conditions.reduce((acc, condition, index) => {
    if (index === 0) return condition;
    return sql`${acc} OR ${condition}`;
  });
  return await sql`
    SELECT DISTINCT
      id,
      name_pretty,
      country,
      genre_tags,
      followers,
      CASE 
        WHEN LOWER(name_pretty) = ${searchTerm.toLowerCase()} THEN 1
        WHEN LOWER(name_pretty) LIKE ${searchTerm.toLowerCase() + '%'} THEN 2
        WHEN LOWER(name_pretty) LIKE ${'%' + searchTerm.toLowerCase() + '%'} THEN 3
        ELSE 4
      END as sort_priority
    FROM bands 
    WHERE ${whereClause}
    ORDER BY sort_priority, name_pretty
    LIMIT 50
  `;
};

const searchWithVariants = async (variants: string[]) => {
  if (variants.length === 0) return [];
  
  // Build dynamic WHERE clause
  const conditions = variants.flatMap(variant => {
    const normalizedVariant = normalizeString(variant);
    return [
      sql`LOWER(name_pretty) = ${variant.toLowerCase()}`,
      sql`LOWER(name_pretty) LIKE ${variant.toLowerCase() + '%'}`,
      sql`LOWER(name_pretty) LIKE ${'%' + variant.toLowerCase() + '%'}`,
      // Normalized search for special characters
      sql`LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(name_pretty, '[æåä]', 'a', 'g'), '[øöô]', 'o', 'g'), '[''"-]', '', 'g')) LIKE ${'%' + normalizedVariant + '%'}`
    ];
  });
  
  if (conditions.length === 0) return [];
  
  const whereClause = conditions.reduce((acc, condition, index) => {
    if (index === 0) return condition;
    return sql`${acc} OR ${condition}`;
  });
  return await sql`
    SELECT DISTINCT
      id,
      name_pretty,
      country,
      genre_tags,
      followers,
      CASE 
        WHEN LOWER(name_pretty) = ${variants[0]?.toLowerCase() || ''} THEN 1
        WHEN LOWER(name_pretty) LIKE ${(variants[0]?.toLowerCase() || '') + '%'} THEN 2
        WHEN LOWER(name_pretty) LIKE ${'%' + (variants[0]?.toLowerCase() || '') + '%'} THEN 3
        ELSE 4
      END as sort_priority
    FROM bands 
    WHERE ${whereClause}
    ORDER BY sort_priority, name_pretty
    LIMIT 50
  `;
};

export const getFullBandDataById = async (bandId: string): Promise<Band>  => {
  // Query 1: Get band data
  const bandArray = await sql<Band[]>`
    SELECT * FROM bands WHERE id = ${bandId} LIMIT 1
  `;
  const band = bandArray[0];

  // Query 2: Get albums
  const albums = await sql<BandAlbum[]>`
    SELECT 
      id, name, name_pretty, release_date
    FROM band_albums 
    WHERE band_id = ${bandId}
    ORDER BY release_date
  `;

  // Query 3: Get tracks for all albums
  const tracks = await sql<AlbumTrack[]>`
    SELECT 
      at.id, at.album_id, at.title, 
      at.track_number, at.duration
    FROM album_tracks at
    JOIN band_albums a ON a.id = at.album_id
    WHERE a.band_id = ${bandId}
    ORDER BY a.release_date, at.track_number
  `;

  // Combine the results in memory
  const albumsWithTracks = albums.map(album => ({
    ...album,
    album_tracks: tracks.filter(track => track.album_id === album.id)
  }));
  return {
    ...band,
    albums: albumsWithTracks
  };
};

/**
 * Enhanced band search with fuzzy matching capabilities
 * 
 * Features:
 * 1. Character normalization (removes accents/diacritics)
 * 2. URL decoding for encoded characters
 * 3. Special character variants (å/aa, æ/ae, ø/o, etc.)
 * 4. Punctuation removal (' - _ etc.)
 * 5. Multi-stage search (exact → starts with → contains → fuzzy)
 * 
 * Examples:
 * - "manegarm" finds "Månegarm"
 * - "belakor" finds "Be'lakor" 
 * - "be%27lakor" (URL encoded) finds "Be'lakor"
 * - "amon%20amarth" finds "Amon Amarth"
 */

// Enhanced search function that provides debugging information
export const getBandsBySearchTermWithDebug = async (
  searchTerm: string
): Promise<{
  results: SearchTermBand[];
  searchInfo: {
    originalTerm: string;
    variants: string[];
    searchMethod: string;
    resultCount: number;
  };
}> => {
  const variants = createSearchVariants(searchTerm);
  let bands;
  let searchMethod = '';
  
  // Apply the same search logic but track which method was used
  if (searchTerm.length <= 3) {
    bands = await fetchBands(searchTerm, "equals");
    searchMethod = 'equals';
    if (bands.length === 0) {
      bands = await fetchBands(searchTerm, "startsWith");
      searchMethod = 'startsWith';
    }
    if (bands.length === 0) {
      bands = await fetchBands(searchTerm, "fuzzy");
      searchMethod = 'fuzzy';
    }
  } else {
    bands = await fetchBands(searchTerm, "contains");
    searchMethod = 'contains';
    
    if (bands.length > 30) {
      bands = await fetchBands(searchTerm, "equals");
      searchMethod = 'equals (too many results)';
      if (bands.length === 0) {
        bands = await fetchBands(searchTerm, "startsWith");
        searchMethod = 'startsWith (no exact matches)';
      }
    }      if (bands.length === 0 || (bands.length < 5 && searchTerm.length > 5)) {
      const fuzzyResults = await fetchBands(searchTerm, "fuzzy");
      
      // Deduplicate results by band id
      const existingIds = new Set(bands.map(band => band.id));
      const uniqueFuzzyResults = fuzzyResults.filter(band => !existingIds.has(band.id));
      
      bands = [...bands, ...uniqueFuzzyResults];
      const wasOnlyFuzzy = bands.length === uniqueFuzzyResults.length;
      searchMethod = wasOnlyFuzzy ? 'fuzzy only' : 'combined with fuzzy';
      
      // If still no results, try typo-tolerant search
      if (bands.length === 0 && searchTerm.length > 3) {
        const typoResults = await fetchBands(searchTerm, "typoTolerant");
        const uniqueTypoResults = typoResults.filter(band => !existingIds.has(band.id));
        bands = [...bands, ...uniqueTypoResults];
        if (bands.length > 0) {
          searchMethod = 'typo-tolerant';
        }
      }
    }}

  // Final deduplication and result formatting
  const results = bands && bands.length > 0 ? 
    bands.filter((band, index, self) => 
      index === self.findIndex(b => b.id === band.id)
    ).map((band) => ({
      bandId: band.id,
      namePretty: band.name_pretty,
      country: band.country || null,
      genreTags: band.genre_tags || [],
      bandName: `${band.name_pretty} (${band.country}) {${band.genre_tags.join(
        ", "
      )}}`,
      followers: band.followers ?? 0,
    })) : [];

  return {
    results,
    searchInfo: {
      originalTerm: searchTerm,
      variants,
      searchMethod,
      resultCount: results.length
    }
  };
};

// Utility function for testing fuzzy search variants (for debugging)
export const getSearchVariantsForTesting = async (searchTerm: string): Promise<string[]> => {
  return createSearchVariants(searchTerm);
};

// Advanced fuzzy search with phonetic matching and edit distance
const fetchBandsWithTypoTolerance = async (searchTerm: string) => {
  try {
    // First get a broader set of results using fuzzy search
    const fuzzyResults = await fetchBandsFuzzy(searchTerm);
    
    // If we have some results, also try phonetic matching
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    const phoneticResults = await searchWithPhoneticMatching(searchWords);
    
    // Combine and rank results
    const allResults = [...fuzzyResults, ...phoneticResults];
    const rankedResults = rankResultsByTypoTolerance(searchTerm, allResults);
    
    return rankedResults;
  } catch (error) {
    console.warn('Advanced typo-tolerant search failed, falling back to regular fuzzy search:', error);
    return await fetchBandsFuzzy(searchTerm);
  }
};

// Search using phonetic matching (client-side Soundex to avoid PostgreSQL dependency)
const searchWithPhoneticMatching = async (searchWords: string[]) => {
  if (searchWords.length === 0) return [];
  
  // Generate phonetic codes for search terms
  const phoneticCodes = searchWords.map(word => soundex(word)).filter(code => code !== '0000');
  
  if (phoneticCodes.length === 0) return [];
  
  // Get a broader set of bands and filter client-side for phonetic matching
  // Use a more permissive search to get candidates
  const candidateConditions = searchWords.map(word => 
    sql`LOWER(name_pretty) LIKE ${'%' + word.toLowerCase() + '%'}`
  );
  
  const whereClause = candidateConditions.reduce((acc, condition, index) => {
    if (index === 0) return condition;
    return sql`${acc} OR ${condition}`;
  });

  const candidates = await sql`
    SELECT DISTINCT
      id,
      name_pretty,
      country,
      genre_tags,
      followers
    FROM bands 
    WHERE ${whereClause}
    ORDER BY name_pretty
    LIMIT 100
  `;
  // Filter results using client-side phonetic matching
  const phoneticMatches = candidates.filter((band: any) => {
    const bandWords = band.name_pretty.toLowerCase().split(/\s+/);
    return phoneticCodes.some((searchCode: string) => 
      bandWords.some((bandWord: string) => soundex(bandWord) === searchCode)
    );
  });

  return phoneticMatches.slice(0, 25);
};

// Rank results by typo tolerance and similarity
const rankResultsByTypoTolerance = (searchTerm: string, results: any[]) => {
  const normalizedSearch = normalizeString(searchTerm);
  const searchWords = normalizedSearch.split(/\s+/);
  
  // Remove duplicates first
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );
  
  // Score each result
  const scoredResults = uniqueResults.map(result => {
    const bandName = normalizeString(result.name_pretty);
    const bandWords = bandName.split(/\s+/);
    
    let score = 0;
    
    // Exact match bonus
    if (bandName === normalizedSearch) {
      score += 1000;
    }
    
    // Word-by-word matching
    for (const searchWord of searchWords) {
      for (const bandWord of bandWords) {
        // Exact word match
        if (searchWord === bandWord) {
          score += 100;
        }
        // Starts with
        else if (bandWord.startsWith(searchWord)) {
          score += 50;
        }
        // Contains
        else if (bandWord.includes(searchWord)) {
          score += 25;
        }
        // Levenshtein similarity
        else if (areSimilar(searchWord, bandWord, 0.7)) {
          const similarity = 1 - (levenshteinDistance(searchWord, bandWord) / Math.max(searchWord.length, bandWord.length));
          score += Math.round(similarity * 30);
        }
        // Phonetic similarity
        else if (searchWord.length > 3 && bandWord.length > 3 && soundex(searchWord) === soundex(bandWord)) {
          score += 20;
        }
      }
    }
    
    // Length penalty for very long band names (to prioritize closer matches)
    if (bandName.length > normalizedSearch.length * 2) {
      score -= 5;
    }
    
    return { ...result, typo_score: score };
  });
  
  // Sort by score (highest first) and return without score
  return scoredResults
    .sort((a, b) => b.typo_score - a.typo_score)
    .slice(0, 50) // Limit results
    .map(({ typo_score, ...result }) => result);
};
