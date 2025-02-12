"use client";

import { z } from "zod";
import { EmailFormSchema } from "./email-updates-settings";
import { formatDateWithNamedMonth } from "@/lib/general/dateTime";
import {
  getFavoriteBandReleasesForEmail,
  getFavoriteGenreReleasesForEmail,
} from "@/lib/data/user/emailUpdates/email-settings-data-actions";
import { Prisma } from "@prisma/client";

export const createEmail = async (data: z.infer<typeof EmailFormSchema>) => {
  let favBandRleases: Prisma.UpcomingReleasesGetPayload<{}>[] = [];
  let favGenreReleases: Prisma.UpcomingReleasesGetPayload<{}>[] = [];

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
