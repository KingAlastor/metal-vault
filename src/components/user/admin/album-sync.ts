"use server";

import { updateAlbumsTableData } from "@/lib/data/user/admin/album-data-actions";
import axios from "axios";
import * as cheerio from "cheerio";
import { AlbumData } from "./admin-releases-types";

export async function syncAlbumDataFromArchives() {
  //  const archivesLinks = await getBandLinks();
  //  const archivesLinks = "2845,3540441516".split(",");
  const archivesLinks = [
    { id: "clxx8c9x021nh3se7w9aug98l", name: "Keep_of_Kalessin", archivesLink: "2845" },
    { id: "clxx8f4ym2f2p3se7s3dd0659", name: "Mordant_Rapture", archivesLink: "3540441516" },
  ];
  const baseUrl = "https://www.metal-archives.com/band/discography/id/";

  if (archivesLinks) {
    for (const { id, name, archivesLink } of archivesLinks) {
      const url = `${baseUrl}${archivesLink}/tab/all`;
      const response = await axios.get(url);
      const html = response.data;
      let albumsData: AlbumData[] = [];
      const $ = cheerio.load(html);

      const rows = $("tr").toArray(); // Convert cheerio object to an array

      for (const elem of rows) {
        const href = $(elem).find("a.album, a.other").attr("href");
        if (href) {
          const parts = href.split("/");
          const albumName = parts[parts.length - 2];
          const albumLink = parts.pop();

          const album = $(elem).find("td").first().text().trim();
          const type = $(elem).find("td").eq(1).text().trim();         
          if (name && albumName && albumLink) {
            const albumUrl = `https://www.metal-archives.com/albums/${name}/${albumName}/${albumLink}`;
            const releaseDate = await getReleaseDate(albumUrl);
            const albumData = {
              bandId: id,
              name: albumName,
              namePretty: album,
              archivesLink: parseInt(albumLink, 10),
              type: type,
              releaseDate: new Date(releaseDate),
            }
            albumsData.push(albumData); 
            updateAlbumsTableData(albumsData);
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function getReleaseDate(albumUrl: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const response = await axios.get(albumUrl);
  const html = response.data;

  const $ = cheerio.load(html);
  const releaseDateString = $("dt")
    .filter(function () {
      return $(this).text().trim() === "Release date:";
    })
    .next("dd")
    .text();

  const formattedDate = convertDateToISO(releaseDateString);
  return formattedDate;
}

function convertDateToISO(dateString: string) {
  const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
  const date = new Date(cleanedDateString);

  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2); 
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
}