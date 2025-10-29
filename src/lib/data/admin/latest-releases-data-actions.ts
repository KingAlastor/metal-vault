"use server";

import { convertDateToISO } from "@/lib/general/dateTime";
import { queryRunner } from "@/lib/db";
import axios from "axios";
import * as cheerio from "cheerio";
import { updateBandsTableData, type BandsData } from "./band-data-actions";

export async function syncUpcomingReleaseDataFromArchives() {
  const timestamp = Date.now();
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const baseUrl = `https://www.metal-archives.com/release/ajax-upcoming/json/1?sEcho=1&iColumns=6&sColumns=&iDisplayStart=`;
  const commonParams = `&iDisplayLength=100&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&mDataProp_4=4&mDataProp_5=5&iSortCol_0=4&sSortDir_0=asc&iSortingCols=1&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=false&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=false&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&sSearch_3=&bRegex_3=false&bSearchable_3=true&sSearch_4=&bRegex_4=false&bSearchable_4=true&sSearch_5=&bRegex_5=false&bSearchable_5=false&includeVersions=0&fromDate=${today}&toDate=0000-00-00&_=${timestamp}`;

  const iDisplayLength = 100;

  let iDisplayStart = 0;
  let hasMoreData = true;
  while (hasMoreData) {
    const url = `${baseUrl}${iDisplayStart}${commonParams}`;
    try {
      let releasesData: ReleaseData = [];
      const response = await axios.get(url);
      const data = response.data;

      for (const band of data.aaData) {
        const data = await extractBandDetails(band);
        if (data) {
          releasesData.push(data);
        }
      }

      await updateUpcomingReleasesTableData(releasesData);

      if (data.aaData.length === 0 || data.aaData.length < iDisplayLength) {
        hasMoreData = false;
      }

      iDisplayStart += iDisplayLength;
    } catch (error) {
      hasMoreData = false;
    }

    // Wait for 3 seconds to respect metal-archives robots.txt delay request
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

const extractBandDetails = async (band: Array<any>) => {
  const [bandLink, albumLink, type, genres, date] = band;

  if (type === "Split") return;

  const archivesLinkMatch = bandLink.match(/\/(\d+)/);
  const bandArchivesLink = archivesLinkMatch ? archivesLinkMatch[1] : "";
  const bandDetails = await getBandByArchivesLink(bandArchivesLink);
  let bandName = "";
  let genreTags = [];

  let bandId = bandDetails?.id!;

  if (!bandId) {
    let bandsData: BandsData = [];
    const bandNameMatch = bandLink.match(/\/bands\/([^\/]+)\//);
    const name = bandNameMatch ? bandNameMatch[1] : null;
    const country = await getBandOriginFromArchives(bandLink);
    const bandNamePrettyMatch = bandLink.match(/>([^<]+)<\/a>/);
    bandName = bandNamePrettyMatch ? bandNamePrettyMatch[1] : "";

    const genre = genres.replace(/ Metal|\(early\)|\(later\)/g, "").trim();
    genreTags = genre.split(/\/|;|,/).map((tag: string) => tag.trim());

    const bandDataObject = {
      name: name,
      name_pretty: bandName,
      genre_tags: genreTags,
      country: country,
      status: "Active",
      archives_link: parseInt(bandArchivesLink, 10),
    };

    bandsData.push(bandDataObject);
    if (bandsData.length > 0) {
      await updateBandsTableData(bandsData);
    }
    const bandDetails = await getBandByArchivesLink(bandArchivesLink);
    bandId = bandDetails?.id!;
  } else {
    bandName = bandDetails?.name_pretty || bandDetails?.name || "";
    genreTags = bandDetails?.genre_tags || [];
  }

  const matches = albumLink.match(/\/albums\/([^\/]+)\/([^\/]+)\/(\d+)/);
  const albumArchivesLink = matches[3];

  const albumNamePrettyMatch = albumLink.match(/>([^<]+)<\/a>/);
  const albumName = albumNamePrettyMatch ? albumNamePrettyMatch[1] : "";

  const releaseDate: string = convertDateToISO(date);

  return {
    bandId,
    bandName,
    albumName,
    type,
    bandArchivesLink,
    albumArchivesLink,
    genreTags,
    releaseDate,
  };
};

type ReleaseData = {
  bandId: string;
  bandName: string;
  albumName: string;
  bandArchivesLink: number;
  albumArchivesLink: number;
  genreTags: string[];
  type: string;
  releaseDate: string;
}[];

const updateUpcomingReleasesTableData = async (releasesData: ReleaseData) => {
  try {
    if (releasesData.length > 0) {
      const mappedData = releasesData.map((release) => ({
        band_id: release.bandId,
        band_name: release.bandName || null,
        album_name: release.albumName,
        genre_tags: release.genreTags || [],
        band_archives_link: release.bandArchivesLink,
        album_archives_link: release.albumArchivesLink,
        type: release.type,
        release_date: release.releaseDate,
        updated_at: queryRunner`NOW() AT TIME ZONE 'UTC'` as unknown as string,
      }));

      await queryRunner`
        INSERT INTO upcoming_releases ${queryRunner(mappedData)}
        ON CONFLICT (album_archives_link) DO NOTHING
      `;
    }
  } catch (error) {
    console.error("Error updating upcoming releases table data:", error);
    throw error;
  }
};

const getBandByArchivesLink = async (archivesLink: number) => {
  try {
    const band = await queryRunner`
      SELECT * FROM bands 
      WHERE archives_link = ${archivesLink}
    `;
    return band[0] || null;
  } catch (error) {
    console.error("Error fetching band by archives link:", error);
    return null;
  }
};

const getBandOriginFromArchives = async (bandLink: string) => {
  const websiteLinkMatch = bandLink.match(/href="([^"]+)"/);
  const url = websiteLinkMatch ? websiteLinkMatch[1] : "";
  await new Promise((resolve) => setTimeout(resolve, 3000));
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

  return countryOfOrigin;
};
