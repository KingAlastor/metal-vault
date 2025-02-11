"use client";

import { z } from "zod";
import { EmailFormSchema } from "./email-updates-settings";
import { formatDateWithNamedMonth } from "@/lib/general/dateTime";
import { getReleasesForEmail } from "@/lib/data/user/emailUpdates/email-settings-data-actions";

export const createEmail = async (data: z.infer<typeof EmailFormSchema>) => {
  const filters = {
    favorite_bands: data.favorite_bands,
    favorite_genres: data.favorite_genres,
    email_frequency: data.email_frequency,
    genreTags: [],
  };
  const releases = await getReleasesForEmail(filters);
  console.log("releases: ", releases);
  if (releases.length > 0) {
    let text = "Here are the latest releases from your favorite bands:\n";
    let html =
      "<h3>Latest releases based on your filters:</h3><ul>";

    for (const band of releases) {
      console.log("band row: ", band)
      const date = formatDateWithNamedMonth(band.releaseDate!);
      text += `\n- ${date} - ${band.bandName} - ${band.albumName} `;
      html += `<li>${date} - ${band.bandName} - ${band.albumName}</li>`;
    }

    html += "</ul>";

    return {
      text,
      html,
    };
  }
};
