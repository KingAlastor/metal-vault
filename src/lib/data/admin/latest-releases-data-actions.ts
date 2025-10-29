"use server";

import { convertDateToISO } from "@/lib/general/dateTime";
import sql from "@/lib/db";
import axios from "axios";
import * as cheerio from "cheerio";
import { updateBandsTableData, type BandsData } from "./band-data-actions";
import { insertMany } from "../sql-helpers/insert-many";

export async function syncUpcomingReleaseDataFromArchives() {
  console.log("🚀 Starting upcoming release data sync from Metal Archives");
  const timestamp = Date.now();
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  console.log(`📅 Sync date range: from ${today} to unlimited`);
  
  const baseUrl = `https://www.metal-archives.com/release/ajax-upcoming/json/1?sEcho=1&iColumns=6&sColumns=&iDisplayStart=`;
  const commonParams = `&iDisplayLength=100&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&mDataProp_4=4&mDataProp_5=5&iSortCol_0=4&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=false&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=false&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=false&includeVersions=0&fromDate=${today}&toDate=0000-00-00&_=${timestamp}`;

  const iDisplayLength = 100;
  let totalProcessed = 0;
  let totalPages = 0;

  let iDisplayStart = 0;
  let hasMoreData = true;
  while (hasMoreData) {
    totalPages++;
    const url = `${baseUrl}${iDisplayStart}${commonParams}`;
    console.log(`📄 Processing page ${totalPages}, offset: ${iDisplayStart}`);
    
    try {
      let releasesData: ReleaseData = [];
      console.log(`🌐 Fetching data from Metal Archives API...`);
      const response = await axios.get(url);
      const data = response.data;
      console.log(`📊 Retrieved ${data.aaData.length} releases from API`);

      for (const [index, band] of data.aaData.entries()) {
        console.log(`🎵 Processing release ${index + 1}/${data.aaData.length}`);
        const releaseData = await extractBandDetails(band);
        if (releaseData) {
          releasesData.push(releaseData);
          console.log(`✅ Extracted: ${releaseData.band_name} - ${releaseData.album_name}`);
        } else {
          console.log(`⏭️ Skipped release (Split or invalid data)`);
        }
      }

      console.log(`💾 Updating database with ${releasesData.length} releases...`);
      await updateUpcomingReleasesTableData(releasesData);
      totalProcessed += releasesData.length;
      console.log(`✅ Database updated. Total processed: ${totalProcessed}`);

      if (data.aaData.length === 0 || data.aaData.length < iDisplayLength) {
        hasMoreData = false;
        console.log(`🏁 No more data available. Sync complete.`);
      }

      iDisplayStart += iDisplayLength;
    } catch (error) {
      console.error(`❌ Error processing page ${totalPages}:`, error);
      hasMoreData = false;
    }

    // Wait for 3 seconds to respect metal-archives robots.txt delay request
    console.log(`⏱️ Waiting 3 seconds before next request...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(`🎉 Sync completed! Total pages: ${totalPages}, Total releases processed: ${totalProcessed}`);
}

const extractBandDetails = async (band: Array<any>) => {
  const [bandLink, albumLink, type, genres, date] = band;

  if (type === "Split") {
    console.log(`⏭️ Skipping Split release`);
    return;
  }

  const archivesLinkMatch = bandLink.match(/\/(\d+)/);
  const band_archives_link = archivesLinkMatch
    ? parseInt(archivesLinkMatch[1], 10)
    : undefined;

  if (!band_archives_link) {
    console.log(`❌ No archives link found for band`);
    return;
  }

  console.log(`🔍 Looking up band with archives link: ${band_archives_link}`);
  let bandDetails = band_archives_link
    ? await getBandByArchivesLink(band_archives_link)
    : null;
  let band_name = "";
  let genre_tags = [];

  let band_id = bandDetails?.id!;

  if (!bandDetails) {
    console.log(`🆕 Band not found in database, creating new entry...`);
    let bandsData: BandsData = [];
    const bandNameMatch = bandLink.match(/\/bands\/([^\/]+)\//);
    const name = bandNameMatch ? bandNameMatch[1] : "Unknown";

    console.log(`🌍 Fetching band origin for: ${name}`);
    const country = await getBandOriginFromArchives(bandLink);
    console.log(`📍 Band origin: ${country}`);

    const bandNamePrettyMatch = bandLink.match(/>([^<]+)<\/a>/);
    band_name = bandNamePrettyMatch ? bandNamePrettyMatch[1] : name;

    genre_tags = (genres as string)
      .replace(/ Metal|\(early\)|\(later\)/g, "")
      .trim()
      .split(/\/|;|,/)
      .map((tag: string) => tag.trim());

    console.log(`🎸 Creating band: ${band_name}, Genres: ${genre_tags.join(', ')}`);

    const bandDataObject = {
      name: name,
      name_pretty: band_name,
      genre_tags,
      country: country,
      status: "Active",
      archives_link: band_archives_link,
    };

    bandsData.push(bandDataObject);
    if (bandsData.length > 0) {
      console.log(`💾 Inserting new band into database...`);
      await updateBandsTableData(bandsData);
      console.log(`✅ Band inserted successfully`);
    }
    const newBandDetails = await getBandByArchivesLink(band_archives_link);
    band_id = newBandDetails?.id!;
  } else {
    console.log(`✅ Found existing band: ${bandDetails.name_pretty || bandDetails.name}`);
    band_name = bandDetails?.name_pretty || bandDetails?.name || "";
    genre_tags = bandDetails?.genre_tags || [];
  }

  const matches = albumLink.match(/\/albums\/([^\/]+)\/([^\/]+)\/(\d+)/);
  const album_archives_link = matches[3];

  const albumNamePrettyMatch = albumLink.match(/>([^<]+)<\/a>/);
  const album_name = albumNamePrettyMatch ? albumNamePrettyMatch[1] : "";

  const release_date: string = convertDateToISO(date);
  const updated_at = new Date().toISOString();

  console.log(`📀 Album details: ${album_name}, Release: ${release_date}, Type: ${type}`);

  return {
    band_id,
    band_name,
    album_name,
    type,
    band_archives_link,
    album_archives_link,
    genre_tags,
    release_date,
    updated_at,
  };
};

type ReleaseData = {
  band_id: string;
  band_name: string;
  album_name: string;
  band_archives_link?: number;
  album_archives_link?: number;
  genre_tags?: string[];
  type?: string;
  release_date?: string;
  updated_at?: string;
}[];

const updateUpcomingReleasesTableData = async (releasesData: ReleaseData) => {
  try {
    if (releasesData.length > 0) {
      console.log(`💾 Inserting ${releasesData.length} releases into upcoming_releases table...`);
      await insertMany(
        "upcoming_releases",
        releasesData,
        "album_archives_link",
        ["updated_at"]
      );
      console.log(`✅ Successfully updated upcoming_releases table`);
    } else {
      console.log(`ℹ️ No releases to insert`);
    }
  } catch (error) {
    console.error("❌ Error updating upcoming releases table data:", error);
    throw error;
  }
};

const getBandByArchivesLink = async (archivesLink: number) => {
  try {
    console.log(`🔍 Querying database for band with archives link: ${archivesLink}`);
    const band = await sql`
      SELECT * FROM bands 
      WHERE archives_link = ${archivesLink}
    `;
    const result = band[0] || null;
    console.log(`${result ? '✅ Found' : '❌ Not found'} band in database`);
    return result;
  } catch (error) {
    console.error("❌ Error fetching band by archives link:", error);
    return null;
  }
};

const getBandOriginFromArchives = async (bandLink: string) => {
  const websiteLinkMatch = bandLink.match(/href="([^"]+)"/);
  const url = websiteLinkMatch ? websiteLinkMatch[1] : "";
  console.log(`🌐 Scraping band page: ${url}`);
  
  console.log(`⏱️ Waiting 3 seconds before scraping...`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    const $ = cheerio.load(data);

    const countryOfOrigin = $("dt")
      .filter(function () {
        return $(this).text().trim() === "Country of origin:";
      })
      .next("dd")
      .text()
      .trim();

    console.log(`📍 Scraped country of origin: ${countryOfOrigin}`);
    return countryOfOrigin;
  } catch (error) {
    console.error(`❌ Error scraping band origin from ${url}:`, error);
    return "Unknown";
  }
};
