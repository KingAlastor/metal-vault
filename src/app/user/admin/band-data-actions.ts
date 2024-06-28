"use server";

import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function syncBandDataFromArchives() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  alphabet.push("NBR", "~");
  const baseUrl = "https://www.metal-archives.com/browse/ajax-letter/l/";
  const iDisplayLength = 500;

  for (const letter of alphabet) {
    let iDisplayStart = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const url = `${baseUrl}${letter}/json/1?sEcho=1&iColumns=4&sColumns=&iDisplayStart=${iDisplayStart}&iDisplayLength=${iDisplayLength}`;
      try {
        let bandsData: BandsData = [];
        const response = await axios.get(url);
        const data = response.data;

        console.log(
          "Letter: ",
          letter,
          "iDisplayStart: ",
          iDisplayStart,
          "Data length: ",
          data.aaData.length,
          "hasMoreData: ",
          hasMoreData,
          "content length:",
          data.iTotalRecords,
          "URL: ",
          url
        );
        for (const band of data.aaData) {
          const data = extractBandDetails(band);
          bandsData.push(data);
        }

        updateBandsTableData(bandsData);

        if (data.aaData.length === 0 || data.aaData.length < iDisplayLength) {
          hasMoreData = false;
          console.log("total records: ", data.iTotalRecords);
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

  const genre = genres.replace(/ Metal|\(early\)|\(later\)/g, "").trim();
  const genreTags = genre.split(/\/|;|,/).map((tag: string) => tag.trim());

  const statusMatch = statusSpan.match(/>([^<]+)<\/span>/);
  const status = statusMatch ? statusMatch[1] : "";

  const archivesLinkMatch = band[0].match(/\/(\d+)'>/);
  const archivesLink = archivesLinkMatch ? archivesLinkMatch[1] : "";

  return {
    name,
    namePretty,
    genreTags,
    country,
    status,
    archivesLink,
  };
}

type BandsData = {
  name: string;
  namePretty: string;
  genreTags: string[];
  country: string;
  status: string;
  archivesLink: number;
}[];

async function updateBandsTableData(bandsData: BandsData) {
  try {
    await prisma.bands.createMany({
      data: bandsData,
      skipDuplicates: true,
    });
    console.log("Table updated");
  } catch (error) {
    console.error("Error updating bands table data:", error);
  }
}

