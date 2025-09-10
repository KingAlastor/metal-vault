

import {
  getAlbumExists,
  getBandLinks,
  updateAlbumsTableData,
  updateAlbumTracksDataTable,
  updateBandsLastSync,
} from "@/lib/data/admin/album-data-actions";
import * as cheerio from "cheerio";
import {
  formatTimeToSeconds,
  parseMetalArchivesDate,
} from "@/lib/general/dateTime";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import { Browser } from "puppeteer-core";

// Array of realistic User-Agent strings
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
];

// Helper to fetch page content with Puppeteer
async function fetchPageContent(browser: Browser, url: string): Promise<string> {
  const page = await browser.newPage();
  try {
    // Random delay between requests (3-8 seconds)
    const delay = Math.floor(Math.random() * 5000) + 3000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Rotate User-Agent
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setUserAgent(userAgent);

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    if (!response) {
      throw new Error("No response received from page.goto");
    }

    // Check for blocking status codes
    const status = response.status();
    if (status === 403 || status === 429) {
      const error = new Error(`Request failed with status code ${status}`);
      (error as any).statusCode = status;
      throw error;
    }
    
    if (status === 404) {
      const error = new Error(`Page not found with status code ${status}`);
      (error as any).statusCode = status;
      throw error;
    }

    return await page.content();
  } finally {
    await page.close();
  }
}

export async function syncAlbumDataFromArchives() {
  const archivesLinks = await getBandLinks();
  console.log(`Found ${archivesLinks.length} bands to sync`);

  const baseUrl = "https://www.metal-archives.com/band/discography/id/";

  if (archivesLinks.length === 0) {
    return;
  }

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

    for (const { id, name, archives_link } of archivesLinks) {
      if (!archives_link || archives_link <= 0) {
        console.log(`Skipping band ${name} (${id}) - invalid archives link: ${archives_link}`);
        updateBandsLastSync(id);
        continue;
      }

      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          const url = `${baseUrl}${archives_link}/tab/all`;
          const html = await fetchPageContent(browser, url);
          const $ = cheerio.load(html);
          const rows = $("tr").toArray();

          for (const elem of rows) {
            const href = $(elem).find("a.album, a.other").attr("href");
            if (href) {
              const parts = href.split("/");
              const albumName = parts[parts.length - 2];
              const albumLink = parseInt(parts.pop() || "0", 10);

              const album = $(elem).find("td").first().text().trim();
              const type = $(elem).find("td").eq(1).text().trim();
              if (name && albumName && albumLink > 0) {
                const albumExists = await getAlbumExists(albumLink);
                if (albumExists) {
                  continue;
                }
                const albumUrl = `https://www.metal-archives.com/albums/${name}/${albumName}/${albumLink}`;
                const releaseData = await getReleaseData(albumUrl, browser);
                if (releaseData) {
                  const albumData = {
                    band_id: id,
                    name: albumName,
                    name_pretty: album,
                    archives_link: albumLink,
                    type: type,
                    release_date: releaseData.releaseDateFormatted || undefined,
                  };
                  const insertedAlbum = await updateAlbumsTableData(albumData);
                  const albumId = insertedAlbum?.id;

                  if (albumId && releaseData.tracklist) {
                    const tracks = releaseData.tracklist.map(track => ({
                      band_id: id,
                      album_id: albumId,
                      title: track.title,
                      track_number: parseInt(track.trackNumber, 10),
                      duration: formatTimeToSeconds(track.duration),
                    }));
                    if (tracks.length > 0) {
                      await updateAlbumTracksDataTable(tracks);
                    }
                  }
                }
              }
            }
          }

          success = true;
          updateBandsLastSync(id);
          
          // Additional delay between successful band processing
          await new Promise((resolve) => setTimeout(resolve, 3200));

        } catch (error: any) {
          retryCount++;
          console.error(`Error processing band ${name} (${id}) - Attempt ${retryCount}:`, error.message);

          const status = error.statusCode;
          if (status === 403 || status === 429) {
            console.log(`Rate limited (${status}) - waiting before retry...`);
            const waitTime = Math.min(30000 * Math.pow(2, retryCount), 300000);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          } else if (status === 404) {
            console.log(`Band page not found (404) - skipping: ${name}`);
            updateBandsLastSync(id); // Mark as synced to avoid retrying a known bad link
            break;
          }

          if (retryCount >= maxRetries) {
            console.error(`Max retries reached for band ${name} (${id})`);
            updateBandsLastSync(id);
          }
        }
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

async function getReleaseData(url: string, browser: Browser) {
  try {
    const html = await fetchPageContent(browser, url);
    const $ = cheerio.load(html);

    console.log("Extracting release date from:", url);
    
    let releaseDateText: string | null = null;
    
    $("#album_info dl.float_left dt").each((i, el) => {
      if ($(el).text().trim().toLowerCase() === "release date:") {
        releaseDateText = $(el).next("dd").text();
        return false;
      }
    });
    
    if (!releaseDateText) {
      $("#album_info table tr").each((i, el) => {
        const labelCell = $(el).find("td:first-child");
        if (labelCell.text().trim().toLowerCase() === "release date:") {
          releaseDateText = $(el).find("td:nth-child(2)").text();
          return false;
        }
      });
    }
    
    if (!releaseDateText) {
      const albumInfoText = $("#album_info").text();
      const match = albumInfoText.match(/Release date:\s*([^\n\r<]+)/i);
      if (match) {
        releaseDateText = match[1].trim();
      }
    }
    
    console.log("Raw release date text found:", releaseDateText);
    const releaseDate = releaseDateText ? String(releaseDateText).trim() : null;
    const releaseDateFormatted = releaseDate ? parseMetalArchivesDate(releaseDate) : null;

    const tracklist: { title: string; duration: string; trackNumber: string; }[] = [];
    $("#album_tabs_tracklist table.table_lyrics tbody tr")
      .filter((i, el) => $(el).find("td").length === 4 && !$(el).hasClass("sideRow"))
      .each((i, el) => {
        const $row = $(el);
        const trackNumber = $row.find("td:nth-child(1)").text().trim();
        const title = ($row.find("td.wrapWords.bonus").text() || $row.find("td.wrapWords").text()).replace(/\s+/g, " ").trim();
        const duration = $row.find('td[align="right"]').text().trim();

        if (title) {
          tracklist.push({ title, trackNumber, duration });
        }
      });

    return { releaseDateFormatted, tracklist };
  } catch (error: any) {
    console.error(`Error fetching release data from ${url}:`, error.message);
    return { releaseDateFormatted: null, tracklist: [] };
  }
}
