"use server";

import { convertDateToISO } from "@/lib/general/date";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import * as cheerio from "cheerio";
import { updateBandsTableData, type BandsData } from "./band-data-actions";

export async function syncUpcomingReleaseDataFromArchives() {
  const baseUrl =
    "https://www.metal-archives.com/release/ajax-upcoming/json/1?sEcho=2&iColumns=6&sColumns=&iDisplayStart=";
  const iDisplayLength = 100;

  let iDisplayStart = 0;
  let hasMoreData = true;
  console.log("function is executed");

  while (hasMoreData) {
    const url = `${baseUrl}${iDisplayStart}&iDisplayLength=${iDisplayLength}`;
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

      updateUpcomingReleasesTableData(releasesData);

      if (data.aaData.length === 0 || data.aaData.length < iDisplayLength) {
        hasMoreData = false;
        console.log("total records: ", data.iTotalRecords);
      }

      iDisplayStart += iDisplayLength;
    } catch (error) {
      console.error(`Error fetching data: `, error);
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
      namePretty: bandName,
      genreTags: genreTags,
      country: country,
      status: "Active",
      archivesLink: parseInt(bandArchivesLink, 10),
    };

    bandsData.push(bandDataObject);
    await updateBandsTableData(bandsData);
    const bandDetails = await getBandByArchivesLink(bandArchivesLink);
    bandId = bandDetails?.id!;
    console.log(bandsData);
  } else {
    bandName = bandDetails!.namePretty;
    genreTags = bandDetails!.genreTags;
  }

  const matches = albumLink.match(/\/albums\/([^\/]+)\/([^\/]+)\/(\d+)/);
  const albumArchivesLink = matches[3];

  const albumNamePrettyMatch = albumLink.match(/>([^<]+)<\/a>/);
  const albumName = albumNamePrettyMatch ? albumNamePrettyMatch[1] : "";

  const releaseDate: Date = new Date(convertDateToISO(date));

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
  releaseDate: Date;
}[];

const updateUpcomingReleasesTableData = async (releasesData: ReleaseData) => {
  try {
    await prisma.upcomingReleases.createMany({
      data: releasesData,
      skipDuplicates: true,
    });
    console.log("Table updated");
  } catch (error) {
    console.error("Error updating bands table data:", error);
  }
};

const getBandByArchivesLink = async (archivesLink: number) => {
  try {
    const band = await prisma.bands.findUnique({ where: { archivesLink } });
    return band;
  } catch {
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
