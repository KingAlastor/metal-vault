

import { BandsData, updateBandsTableData } from "@/lib/data/admin/band-data-actions";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import { Browser } from "puppeteer-core";

async function fetchJsonData(browser: Browser, url: string): Promise<any> {
  const page = await browser.newPage();
  try {
    // Intercept network requests to capture the JSON response
    let jsonResponse: any = null;
    await page.setRequestInterception(true);
    page.on('request', request => request.continue());
    page.on('response', async response => {
      if (response.url() === url && response.headers()['content-type']?.includes('application/json')) {
        jsonResponse = await response.json();
      }
    });

    // Navigate to a blank page and then use fetch within the browser context
    await page.goto('about:blank');
    await page.evaluate(url => fetch(url), url);

    // Wait for the JSON response to be captured
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait a bit for the async fetch to complete

    if (!jsonResponse) {
      throw new Error("Failed to capture JSON response.");
    }
    return jsonResponse;
  } finally {
    await page.close();
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
  const baseUrl = `https://www.metal-archives.com/archives/ajax-band-list/selection/${date}/by/created//json/1?sEcho=1&iColumns=6&sColumns=&iDisplayStart=`;
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
      try {
        const data = await fetchJsonData(browser, url);
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





