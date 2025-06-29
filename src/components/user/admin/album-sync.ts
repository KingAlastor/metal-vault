"use server";

import {
  getAlbumExists,
  getAlbumId,
  getBandLinks,
  updateAlbumsTableData,
  updateAlbumTracksDataTable,
  updateBandsLastSync,
} from "@/lib/data/admin/album-data-actions";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  formatTimeToSeconds,
  parseMetalArchivesDate,
} from "@/lib/general/dateTime";

export async function syncAlbumDataFromArchives() {
  const archivesLinks = await getBandLinks();

  const baseUrl = "https://www.metal-archives.com/band/discography/id/";

  if (archivesLinks.length > 0) {
    for (const { id, name, archivesLink } of archivesLinks) {
      const url = `${baseUrl}${archivesLink}/tab/all`;
      const response = await axios.get(url);
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
            const releaseData = await getReleaseData(albumUrl);
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
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      }
      updateBandsLastSync(id);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function getReleaseData(url: string) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract release date
    let releaseDateText: string | null = null;
    const releaseDateDt = $("#album_info dl dt")
      .filter((i, el) => $(el).text().trim() === "Release date:")
      .first(); // Get the first matching element

    if (releaseDateDt.length > 0) {
      releaseDateText = releaseDateDt.next("dd").text().trim();
    }

    const releaseDate = releaseDateText ? releaseDateText.trim() : null;
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
