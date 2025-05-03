"use server";

import axios from "axios";
import * as cheerio from "cheerio";

export async function fetchBandcampData(
  bandcampUrl: string
): Promise<{
  imgSrc: string | null;
  trackTitle: string | null;
  bandName: string | null;
  releaseDate: string | null;
}> {
  try {
    const { data } = await axios.get(bandcampUrl);
    const $ = cheerio.load(data);

    const imgSrc = $("#tralbumArt a.popupImage img").attr("src") || null;
    const trackTitle = $("#name-section h2.trackTitle").text().trim() || null;
    const bandName = $("#name-section h3 span a").text().trim() || null;
    const creditsText = $("div.tralbumData.tralbum-credits").text().trim();
    const lines = creditsText.split('\n');
    const releaseDateLine = lines.find(line => line.trim().startsWith("released "));
    const releaseDate = releaseDateLine ? releaseDateLine.trim().replace("released ", "").trim() : null;

    return { imgSrc, trackTitle, bandName, releaseDate };
  } catch (error) {
    console.error("Error fetching the Bandcamp page:", error);
    return { imgSrc: null, trackTitle: null, bandName: null , releaseDate: null};
  }
}
