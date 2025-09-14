

import { BandsData, updateBandsTableData } from "@/lib/data/admin/band-data-actions";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import { Browser } from "puppeteer-core";

async function fetchJsonData(browser: Browser, url: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const page = await browser.newPage();
    try {
      console.log(`Fetching JSON data from: ${url} (attempt ${attempt})`);

      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Set additional headers to mimic a real browser
      await page.setExtraHTTPHeaders({
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.metal-archives.com/'
      });

      // Navigate to the URL directly and wait for network idle
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      if (!response) {
        throw new Error('No response received from server');
      }

      console.log(`🔍 RESPONSE STATUS: ${response.status()}, URL: ${response.url()}`);
      console.log(`🔍 RESPONSE HEADERS:`, response.headers());

      if (!response.ok()) {
        const responseText = await response.text();
        console.log(`🔍 RESPONSE BODY:`, responseText.substring(0, 500));
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      const contentType = response.headers()['content-type'] || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      const jsonData = await response.json();
      await page.close();
      return jsonData;

    } catch (error: any) {
      console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
      await page.close();

      if (attempt < retries) {
        const waitTime = Math.min(10000 * attempt, 60000); // Exponential backoff
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw new Error(`Failed to fetch data from ${url} after ${retries} attempts: ${error.message}`);
      }
    }
  }
}

export async function syncBandDataFromArchives() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  alphabet.push("NBR", "~");
  const baseUrl = "https://www.metal-archives.com/browse/ajax-letter/l/";
  const iDisplayLength = 500;

  let browser: Browser | null = null;
  try {
    // Launch the browser with production-safe configuration
    const launchOptions: any = {
      args: [
        ...chrome.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      headless: true,
    };

    // Try to get executable path, fallback to system Chrome
    try {
      const execPath = await chrome.executablePath;
      if (execPath) {
        launchOptions.executablePath = execPath;
      } else {
        throw new Error('No executable path from chrome-aws-lambda');
      }
    } catch (error) {
      console.log('Chrome executable not found via chrome-aws-lambda, trying system Chrome...');
      // Fallback to system Chrome/Chromium for production
      const systemPaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
      ];

      for (const path of systemPaths) {
        try {
          const fs = require('fs');
          if (fs.existsSync(path)) {
            launchOptions.executablePath = path;
            console.log(`Using system Chrome at: ${path}`);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }

      if (!launchOptions.executablePath) {
        throw new Error('No Chrome executable found. Please install Chrome/Chromium or ensure chrome-aws-lambda is properly configured.');
      }
    }

    browser = await puppeteer.launch(launchOptions);

    for (const letter of alphabet) {
      let iDisplayStart = 0;
      let hasMoreData = true;
      while (hasMoreData) {
        const timestamp = Date.now();
        const url = `${baseUrl}${letter}/json/1?sEcho=1&iColumns=4&sColumns=&iDisplayStart=${iDisplayStart}&iDisplayLength=${iDisplayLength}&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=false&_=${timestamp}`;
        try {
          const data = await fetchJsonData(browser, url);
          const bandsData: BandsData = (data.aaData || []).map(extractBandDetails);

          if (bandsData.length > 0) {
            console.log(`Updating bands data for letter ${letter}:`, bandsData.length);
            await updateBandsTableData(bandsData);
          }

          if (!data.aaData || data.aaData.length < iDisplayLength) {
            hasMoreData = false;
          }

          iDisplayStart += iDisplayLength;
        } catch (error) {
          console.error(`Error fetching data for letter ${letter}:`, error);
          hasMoreData = false;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  } catch (e) {
    console.error("A critical error occurred in the browser instance:", e);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function extractBandDetails(band: Array<any>) {
  const [link, country, genres, statusSpan] = band;

  const nameMatch = link.match(/bands\/([^/]+)\//);
  const name = nameMatch ? nameMatch[1] : "";

  const namePrettyMatch = link.match(/>([^<]+)<\/a>/);
  const namePretty = namePrettyMatch ? namePrettyMatch[1] : "";

  const genreTags = parseGenres(genres);

  const statusMatch = statusSpan.match(/>([^<]+)<\/span>/);
  const status = statusMatch ? statusMatch[1] : "";

  const archivesLinkMatch = band[0].match(/\/(\d+)'>/);
  const archivesLink = archivesLinkMatch ? archivesLinkMatch[1] : "";

  return {
    name: name ?? '',
    name_pretty: namePretty ?? '',
    genre_tags: genreTags,
    country: country ?? '',
    status: status ?? '',
    archives_link: archivesLink ? parseInt(archivesLink, 10) : 0,
  };
}

export async function syncLatestBandAdditionsFromArchives() {
  const currentDate = new Date();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const date = `${currentDate.getFullYear()}-${month}`;
  console.log(`🔍 SYNCING BANDS FOR DATE: ${date}`);

  const baseUrl = `https://www.metal-archives.com/archives/ajax-band-list/selection/${date}/by/created/json/1?sEcho=1&iColumns=6&sColumns=&iDisplayStart=`;
  console.log(`🔍 BASE URL: ${baseUrl}`);

  const iDisplayLength = 200;
  let iDisplayStart = 0;
  let hasMoreData = true;

  let browser: Browser | null = null;
  try {
    // Launch the browser with production-safe configuration
    const launchOptions: any = {
      args: [
        ...chrome.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      headless: true,
    };

    // Try to get executable path, fallback to system Chrome
    try {
      const execPath = await chrome.executablePath;
      if (execPath) {
        launchOptions.executablePath = execPath;
      } else {
        throw new Error('No executable path from chrome-aws-lambda');
      }
    } catch (error) {
      console.log('Chrome executable not found via chrome-aws-lambda, trying system Chrome...');
      // Fallback to system Chrome/Chromium for production
      const systemPaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
      ];

      for (const path of systemPaths) {
        try {
          const fs = require('fs');
          if (fs.existsSync(path)) {
            launchOptions.executablePath = path;
            console.log(`Using system Chrome at: ${path}`);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }

      if (!launchOptions.executablePath) {
        throw new Error('No Chrome executable found. Please install Chrome/Chromium or ensure chrome-aws-lambda is properly configured.');
      }
    }

    browser = await puppeteer.launch(launchOptions);

    while (hasMoreData) {
      const timestamp = Date.now();
      const url = `${baseUrl}${iDisplayStart}&iDisplayLength=${iDisplayLength}&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&mDataProp_4=4&mDataProp_5=5&iSortCol_0=0&sSortDir_0=desc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=true&_=${timestamp}`;
      console.log(`🔍 FETCHING PAGE ${iDisplayStart / iDisplayLength + 1}, URL: ${url}`);

      try {
        const data = await fetchJsonData(browser, url);
        console.log(`🔍 RECEIVED DATA:`, {
          totalRecords: data.iTotalRecords,
          totalDisplayRecords: data.iTotalDisplayRecords,
          dataLength: data.aaData?.length || 0,
          hasData: !!(data.aaData && data.aaData.length > 0)
        });

        const bandsData: BandsData = (data.aaData || []).map(extractLatestBandAdditionDetails);
        
        if (bandsData.length > 0) {
          await updateBandsTableData(bandsData);
        }

        if (!data.aaData || data.aaData.length < iDisplayLength) {
          hasMoreData = false;
        }
        iDisplayStart += iDisplayLength;
      } catch (error) {
        console.error(`Error fetching data:`, error);
        hasMoreData = false;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } catch (e) {
    console.error("A critical error occurred in the browser instance:", e);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const extractLatestBandAdditionDetails = (band: Array<any> ) => {
  const [date, bandLink, countryLink, genres] = band;

  const bandNameMatch = bandLink.match(/\/bands\/([^\/]+)\//);
  const name = bandNameMatch ? bandNameMatch[1] : null;

  const displayNameMatch = bandLink.match(/>([^<]+)</);
  const namePretty = displayNameMatch ? displayNameMatch[1] : null;

  const numericValueMatch = bandLink.match(/\/bands\/[^\/]+\/(\d+)/);
  const archivesLink = numericValueMatch ? numericValueMatch[1] : null;

  const genreTags = parseGenres(genres);

  const countryMatch = countryLink.match(/>([^<]+)</);
  const country = countryMatch ? countryMatch[1] : null;

  const status = 'Active';

  return {
    name: name ?? '',
    name_pretty: namePretty ?? '',
    genre_tags: genreTags,
    country: country ?? '',
    status,
    archives_link: archivesLink ? parseInt(archivesLink, 10) : 0, 
  };
};

const parseGenres = (genres: string) => {
const genre = genres
  .replace(/\(.*?\)/gi, "") // Remove text and symbols within parentheses
  .replace(/-/g, " ") // Replace dashes with spaces
  .replace(/\bmetal\b/gi, "") // Remove the word "Metal" (case insensitive) only if it's a standalone word
  .replace(/\band\b/gi, "/") // Replace "and" with "/"
  .replace(/\bwith\b/gi, "/") // Replace "with" with "/"
  .replace(/\binfluences\b/gi, "") // Remove the word "influences" (case insensitive)
  .replace(/\belements\b/gi, "") // Remove the word "elements" (case insensitive)
  .replace(/\bgarde\b/gi, "Garde") // Capitalize "garde" to "Garde"
  .replace(/\s+/g, " ") // Replace multiple spaces with a single space
  .trim();

const genreTags = genre
  .split(/\/|;|,/)
  .map((tag: string) => tag.trim())
  .filter((tag: string) => tag.length > 0); // Remove empty strings 

  return genreTags;
}





