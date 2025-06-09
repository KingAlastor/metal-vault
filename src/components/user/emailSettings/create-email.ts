"use server";

import { z } from "zod";
import { EmailFormSchema } from "./email-updates-settings";
import { formatDateWithNamedMonth } from "@/lib/general/dateTime";
import { getFavoriteBandReleasesForEmail, getFavoriteGenreReleasesForEmail } from "@/lib/data/user-email-settings-data";

// Define a server-side type for email data to avoid client/server boundary issues
export type EmailData = {
  preferred_email: string;
  email_frequency: string;
  favorite_bands: boolean;
  favorite_genres: boolean;
};

export const createEmail = async (data: EmailData) => {
  let favBandRleases: any[] = []; // Declare the variable with an appropriate type
  let favGenreReleases: any[] = []; // Declare the variable with an appropriate type

  if (data.favorite_bands) {
    favBandRleases = await getFavoriteBandReleasesForEmail(
      data.email_frequency
    );
  }

  if (data.favorite_genres) {
    favGenreReleases = await getFavoriteGenreReleasesForEmail(
      data.email_frequency
    );
  }

  console.log("releases: ", favBandRleases);

  let text = "";
  let html = "";

  if (favBandRleases.length > 0) {
    text += "Latest releases from your favorite bands:\n";
    html += "<h3>Latest releases from your favorite artists:</h3><ul>";

    for (const band of favBandRleases) {
      console.log("band row: ", band);
      const date = formatDateWithNamedMonth(band.releaseDate!);
      text += `\n- ${date} - ${band.bandName} - ${band.albumName} `;
      html += `<li>${date} - ${band.bandName} - ${band.albumName}</li>`;
    }
    html += "</ul>";
  }
  
  if (favGenreReleases.length > 0) {
    text += "Latest releases of your favorite genres:\n";
    html += "<h3>Latest releases of your favorite genres:</h3><ul>";

    for (const band of favGenreReleases) {
      console.log("band row: ", band);
      const date = formatDateWithNamedMonth(band.releaseDate!);
      text += `\n- ${date} - ${band.bandName} - ${band.albumName} `;
      html += `<li>${date} - ${band.bandName} - ${band.albumName} - ${band.genreTags}</li>`;
    }

    html += "</ul>";
  }
  return {
    text,
    html,
  };
};

// Worker-specific version for background jobs
export const createEmailForWorker = async (userId: string, data: EmailData) => {
  const { getFavoriteBandReleasesForEmailWorker, getFavoriteGenreReleasesForEmailWorker } = await import("@/lib/data/user-email-settings-data");
  
  let favBandReleases: any[] = [];
  let favGenreReleases: any[] = [];

  if (data.favorite_bands) {
    favBandReleases = await getFavoriteBandReleasesForEmailWorker(
      userId,
      data.email_frequency
    );
  }

  if (data.favorite_genres) {
    favGenreReleases = await getFavoriteGenreReleasesForEmailWorker(
      userId,
      data.email_frequency
    );
  }

  let text = "";
  let html = "";

  if (favBandReleases.length > 0) {
    text += "Latest releases from your favorite bands:\n";
    html += "<h3>Latest releases from your favorite artists:</h3><ul>";

    for (const band of favBandReleases) {
      const date = formatDateWithNamedMonth(band.releaseDate!);
      text += `\n- ${date} - ${band.bandName} - ${band.albumName} `;
      html += `<li>${date} - ${band.bandName} - ${band.albumName}</li>`;
    }
    html += "</ul>";
  }
  
  if (favGenreReleases.length > 0) {
    text += "Latest releases of your favorite genres:\n";
    html += "<h3>Latest releases of your favorite genres:</h3><ul>";

    for (const band of favGenreReleases) {
      const date = formatDateWithNamedMonth(band.releaseDate!);
      text += `\n- ${date} - ${band.bandName} - ${band.albumName} `;
      html += `<li>${date} - ${band.bandName} - ${band.albumName} - ${band.genreTags}</li>`;
    }

    html += "</ul>";
  }
  
  return {
    text,
    html,
  };
};
