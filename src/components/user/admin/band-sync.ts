"use server";

import { BandsData, updateBandsTableData } from "@/lib/data/admin/band-data-actions";
import axios from "axios";

export async function syncBandDataFromArchives() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  alphabet.push("NBR", "~");
  const baseUrl = "https://www.metal-archives.com/browse/ajax-letter/l/";
  const iDisplayLength = 500;

  for (const letter of alphabet) {
    let iDisplayStart = 0;
    let hasMoreData = true;    while (hasMoreData) {
      const timestamp = Date.now();
      const url = `${baseUrl}${letter}/json/1?sEcho=1&iColumns=4&sColumns=&iDisplayStart=${iDisplayStart}&iDisplayLength=${iDisplayLength}&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=false&_=${timestamp}`;
      try {
        let bandsData: BandsData = [];
        const response = await axios.get(url);
        const data = response.data;
        for (const band of data.aaData) {
          const data = extractBandDetails(band);
          bandsData.push(data);
        }

        if (bandsData.length > 0) {
          console.log(`Updating bands data for letter ${letter}:`, bandsData.length);
          await updateBandsTableData(bandsData);
        }

        if (data.aaData.length === 0 || data.aaData.length < iDisplayLength) {
          hasMoreData = false;
        }

        if (iDisplayStart === 0) iDisplayStart++;
        iDisplayStart += iDisplayLength;
      } catch (error) {
        console.error(`Error fetching data for letter ${letter}:`, error);
        hasMoreData = false;
      }

      // Wait for 3 seconds to respect metal-archives robots.txt delay request
      await new Promise((resolve) => setTimeout(resolve, 3000));
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
  while (hasMoreData) {
    const timestamp = Date.now();
    const url = `${baseUrl}${iDisplayStart}&iDisplayLength=${iDisplayLength}&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&mDataProp_4=4&mDataProp_5=5&iSortCol_0=0&sSortDir_0=desc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=true&_=${timestamp}`;
    try {
      let bandsData: BandsData = [];
      const response = await axios.get(url);
      const data = response.data;

      for (const band of data.aaData) {
        const data = extractLatestBandAdditionDetails(band);
        bandsData.push(data);      }
      await updateBandsTableData(bandsData);

      if (data.aaData.length === 0 || data.aaData.length < iDisplayLength) {
        hasMoreData = false;
      }

      if (iDisplayStart === 0) iDisplayStart++;
      iDisplayStart += iDisplayLength;
    } catch (error) {
      console.error(`Error fetching data:`, error);
      hasMoreData = false;
    }

    // Wait for 3 seconds to respect metal-archives robots.txt delay request
    await new Promise((resolve) => setTimeout(resolve, 3000));
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





