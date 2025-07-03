"use server";

import {
  getAlbumExists,
  getAlbumId,
  getBandLinks,
  updateAlbumsTableData,
  updateAlbumTracksDataTable,
  updateBandsLastSync,
} from "@/lib/data/admin/album-data-actions";
import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import {
  formatTimeToSeconds,
  parseMetalArchivesDate,
} from "@/lib/general/dateTime";

// Array of realistic User-Agent strings
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
];

// Create a persistent axios instance with session-like behavior
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    timeout: 45000, // Increased timeout
    maxRedirects: 3,
    withCredentials: false,
  });

  // Add request interceptor to randomize headers and add delays
  instance.interceptors.request.use(async (config) => {
    // Random delay between requests (3-8 seconds)
    const delay = Math.floor(Math.random() * 5000) + 3000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Rotate User-Agent
    const userAgent =
      USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    Object.assign(config.headers, {
      "User-Agent": userAgent,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      DNT: "1",
      Pragma: "no-cache",
      Referer: "https://www.metal-archives.com/",
      "Sec-Ch-Ua":
        '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    });

    return config;
  });

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 403 || error.response?.status === 429) {
        console.log(
          `Rate limited (${error.response.status}) - waiting before retry...`
        );
        // Wait longer for rate limiting
        const waitTime = error.response.status === 403 ? 180000 : 60000; // 3 min for 403, 1 min for 429
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      throw error;
    }
  );

  return instance;
}

export async function syncAlbumDataFromArchives() {
  const archivesLinks = await getBandLinks();
  const axiosInstance = createAxiosInstance();

  console.log(`Found ${archivesLinks.length} bands to sync`);
  console.log(
    "Sample bands:",
    archivesLinks.slice(0, 3).map((band) => ({
      id: band.id,
      name: band.name,
      archivesLink: band.archives_link,
      archivesLinkType: typeof band.archives_link,
    }))
  );

  const baseUrl = "https://www.metal-archives.com/band/discography/id/";

  if (archivesLinks.length > 0) {
    for (const { id, name, archives_link } of archivesLinks) {
      // Skip bands with invalid archive links (extra safety check)
      if (!archives_link || archives_link <= 0) {
        console.log(
          `Skipping band ${name} (${id}) - invalid archives link: ${archives_link}`
        );
        updateBandsLastSync(id); // Still update sync timestamp to avoid retrying
        continue;
      }

      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          const url = `${baseUrl}${archives_link}/tab/all`;
          console.log(
            `Fetching discography for band: ${name} (${id}) - Attempt ${
              retryCount + 1
            }`
          );
          console.log(`URL: ${url}`);

          const response = await axiosInstance.get(url);

          const html = response.data;
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
                const releaseData = await getReleaseData(
                  albumUrl,
                  axiosInstance
                );
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

                  let tracks = [];
                  if (albumId && releaseData.tracklist) {
                    for (const track of releaseData.tracklist) {
                      const trackData = {
                        band_id: id,
                        album_id: albumId,
                        title: track.title,
                        track_number: parseInt(track.trackNumber, 10),
                        duration: formatTimeToSeconds(track.duration),
                      };
                      tracks.push(trackData);
                    }
                    await updateAlbumTracksDataTable(tracks);
                  }
                }
                // Delay between album requests handled by axios interceptor
              }
            }
          }

          // If we get here, the request was successful
          success = true;
          updateBandsLastSync(id);
          console.log(`Successfully processed band: ${name} (${id})`);

          // Additional delay between successful band processing
          await new Promise((resolve) => setTimeout(resolve, 3200));
        } catch (error) {
          retryCount++;
          console.error(
            `Error processing band ${name} (${id}) - Attempt ${retryCount}:`,
            error
          );

          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 403 || status === 429) {
              console.log(`Rate limited (${status}) - waiting before retry...`);
              // Progressive backoff: wait longer with each retry
              const waitTime = Math.min(
                30000 * Math.pow(2, retryCount),
                300000
              ); // Max 5 minutes
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            } else if (status === 404) {
              console.log(`Band page not found (404) - skipping: ${name}`);
              break; // Don't retry on 404
            }
          }

          if (retryCount >= maxRetries) {
            console.error(`Max retries reached for band ${name} (${id})`);
            // Still update the sync timestamp even if all retries failed
            updateBandsLastSync(id);
          }
        }
      }
    }
  }
}

async function getReleaseData(url: string, axiosInstance: AxiosInstance) {
  try {
    const response = await axiosInstance.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Debug: log album info structure when debugging is needed
    console.log("Extracting release date from:", url);
    
    // Extract release date - try multiple selectors as Metal Archives structure varies
    let releaseDateText: string | null = null;
    
    // Method 1: Try dl.float_left structure (some pages)
    $("#album_info dl.float_left dt").each((i, el) => {
      if ($(el).text().trim().toLowerCase() === "release date:") {
        releaseDateText = $(el).next("dd").text();
        return false; // break loop
      }
    });
    
    // Method 2: Try table structure (other pages)
    if (!releaseDateText) {
      $("#album_info table tr").each((i, el) => {
        const labelCell = $(el).find("td:first-child");
        if (labelCell.text().trim().toLowerCase() === "release date:") {
          releaseDateText = $(el).find("td:nth-child(2)").text();
          return false; // break loop
        }
      });
    }
    
    // Method 3: Generic search for "Release date:" text anywhere in album_info
    if (!releaseDateText) {
      $("#album_info").find("*").each((i, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (text.includes("release date:")) {
          // Look for the date after "release date:"
          const fullText = $(el).text();
          const match = fullText.match(/release date:\s*(.+?)(?:\n|$|<)/i);
          if (match) {
            releaseDateText = match[1].trim();
            return false; // break loop
          }
        }
      });
    }
      console.log("Raw release date text found:", releaseDateText);

    const releaseDate = releaseDateText ? String(releaseDateText).trim() : null;
    console.log("release date; ", releaseDate);

    let releaseDateFormatted: Date | null = null;

    if (releaseDate) {
      releaseDateFormatted = parseMetalArchivesDate(releaseDate);
    }

    // Extract tracklist
    const tracklist: {
      title: string;
      duration: string;
      trackNumber: string;
    }[] = [];
    $("#album_tabs_tracklist table.table_lyrics tbody tr") // Refined selector
      .filter(
        (i, el) => $(el).find("td").length === 4 && !$(el).hasClass("sideRow")
      ) // Filter out side rows and rows with incorrect number of columns
      .each((i, el) => {
        const $row = $(el);
        const trackNumber = $row.find("td:nth-child(1)").text().trim();

        // Extract and sanitize title text
        let title = $row.find("td.wrapWords").text().trim();

        // Check if it's a bonus track
        const bonusTrack = $row.find("td.wrapWords.bonus").text().trim();

        // Use bonus track text if available, otherwise use regular title
        title = bonusTrack || title;

        // Sanitize the title: remove excessive whitespace, tabs, and newlines
        title = title
          .replace(/\s+/g, " ") // Replace multiple whitespace characters with single space
          .replace(/[\r\n\t]/g, " ") // Replace newlines and tabs with spaces
          .trim(); // Final trim

        const duration = $row.find('td[align="right"]').text().trim();

        if (title) {
          // Filter out empty rows
          tracklist.push({
            title,
            trackNumber,
            duration: duration,
          });
        }
      });

    console.log(
      `Extracted release data: ${JSON.stringify({
        releaseDateFormatted,
        tracklist,
      })}`
    );
    return {
      releaseDateFormatted,
      tracklist,
    };
  } catch (error) {
    console.error("Error fetching release data:", error);
    return {
      releaseDate: null,
      tracklist: [],
    };
  }
}
