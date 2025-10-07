"use server";

import { formatDateWithNamedMonth } from "@/lib/general/dateTime";
import {
  getFavoriteBandReleasesForEmail,
  getGenreReleasesForEmail,
  getUnsubscribeTokenForUser,
} from "@/lib/data/user-email-settings-data";
import { getSession } from "@/lib/session/server-actions";
import { logUnauthorizedAccess } from "@/lib/loggers/auth-log";

export type EmailData = {
  preferred_email: string;
  email_frequency: string;
  favorite_bands: boolean;
  favorite_genres: boolean;
};

export const createEmail = async (data: EmailData, userId?: string) => {
  let favBandReleases: any[] = [];
  let favGenreReleases: any[] = [];

  if (!userId) {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      logUnauthorizedAccess(session.userId || "unknown");
      throw new Error("User must be logged in to create email.");
    }
    userId = session.userId;
  }
  const unsubToken = await getUnsubscribeTokenForUser(userId);

  if (data.favorite_bands) {
    favBandReleases = await getFavoriteBandReleasesForEmail(
      userId,
      data.email_frequency
    );
  }

  if (data.favorite_genres) {
    favGenreReleases = await getGenreReleasesForEmail(
      userId,
      data.email_frequency
    );
  }

  if (favBandReleases.length === 0 && favGenreReleases.length === 0) {
    return { text: "", html: "" };
  }

  let text = "";
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; color: #333333; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
        <style>
          /* Mobile responsive styles */
          @media only screen and (max-width: 600px) {
            .email-container { padding: 15px !important; }
            .email-genre-container { 
              display: block !important; 
              word-wrap: break-word !important; 
              white-space: normal !important;
              max-width: 100% !important; 
              overflow-wrap: break-word !important;
            }
            .email-genre-tag { 
              display: inline-block !important; 
              margin: 2px !important; 
              white-space: nowrap !important;
              font-size: 10px !important;
              padding: 1px 6px !important;
            }
          }
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .email-container { background-color: #1a1a1a !important; color: #ffffff !important; border-color: #333333 !important; }
            .email-header { color: #ffffff !important; }
            .email-table th { background-color: #2d2d2d !important; color: #ffffff !important; border-color: #404040 !important; }
            .email-table td { color: #ffffff !important; border-color: #404040 !important; }
            .email-genre-tag { background-color: #404040 !important; color: #ffffff !important; }
            .email-separator { background: linear-gradient(to right, #e74c3c, #f39c12) !important; }
          }
        </style>
        <div class="email-container">
  `;
  // Favorite Bands Section
  if (favBandReleases.length > 0) {
    text += "Latest releases from your favorite bands:\n";
    html += `
      <div style="margin-bottom: 40px;">
        <h2 class="email-header" style="color: #333; border-bottom: 3px solid #e74c3c; padding-bottom: 10px; margin-bottom: 20px;">
          Latest Releases from Your Favorite Artists
        </h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
    `;

    favBandReleases.forEach((band, index) => {
      const date = formatDateWithNamedMonth(band.releaseDate!);
      const rowColor = index % 2 === 0 ? "#ffffff" : "#f1f3f4";
      text += `\n- ${date} - ${band.bandName} - ${band.albumName}`;
      html += `
        <div style="background-color: ${rowColor}; padding: 15px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #e9ecef;">
          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${band.bandName} - ${band.albumName}</div>
          <div style="color: #6c757d; font-size: 14px;">${band.type} • ${date}</div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  // Favorite Genres Section
  if (favGenreReleases.length > 0) {
    text += "\nLatest releases of your favorite genres:\n";
    html += `
      <div style="margin-bottom: 20px;">
        ${
          favBandReleases.length > 0
            ? '<hr class="email-separator" style="border: none; height: 2px; background: linear-gradient(to right, #e74c3c, #f39c12); margin: 30px 0;">'
            : ""
        }
        <h2 class="email-header" style="color: #333; border-bottom: 3px solid #f39c12; padding-bottom: 10px; margin-bottom: 20px;">
          Latest Releases from Your Favorite Genres
        </h2>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
    `;

    favGenreReleases.forEach((band, index) => {
      const date = formatDateWithNamedMonth(band.releaseDate!);
      const genres = Array.isArray(band.genreTags)
        ? band.genreTags.join(", ")
        : band.genreTags;
      const rowColor = index % 2 === 0 ? "#ffffff" : "#f1f3f4";
      const genreArray = Array.isArray(band.genreTags)
        ? band.genreTags
        : [band.genreTags];
      const genreTags = genreArray
        .map(
          (genre: string) =>
            `<span class="email-genre-tag" style="background-color: #e9ecef; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 1px; display: inline-block; white-space: nowrap;">${genre}</span>`
        )
        .join(" ");

      text += `\n- ${date} - ${band.bandName} - ${band.albumName} - ${genres}`;
      html += `
        <div style="background-color: ${rowColor}; padding: 15px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #e9ecef;">
          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${band.bandName} - ${band.albumName}</div>
          <div style="color: #6c757d; font-size: 14px; margin-bottom: 5px;">${band.type} • ${date}</div>
          <div class="email-genre-container" style="line-height: 1.4; word-wrap: break-word; max-width: 100%; overflow-wrap: break-word;">
            ${genreTags}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }
  html += `
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
        <p style="margin-top: 10px;">
          <strong>
            <a href="https://www.metal-vault.com/api/email/unsubscribe?token=${unsubToken}" 
              style="color: #007bff; text-decoration: underline; font-size: 11px;" 
              target="_blank" rel="noopener noreferrer">
              Unsubscribe
            </a>
          </strong>
        </p>
      </div>
    </div>
  `;

  console.log(
    `[createEmail] Email content generated successfully for user ${userId}. Text length: ${text.length}, HTML length: ${html.length}`
  );
  return {
    text,
    html,
  };
};
