"use server";

import { formatDateWithNamedMonth } from "@/lib/general/dateTime";
import {
  getFavoriteBandReleasesForEmail,
  getGenreReleasesForEmail,
} from "@/lib/data/user-email-settings-data";

// Define a server-side type for email data to avoid client/server boundary issues
export type EmailData = {
  preferred_email: string;
  email_frequency: string;
  favorite_bands: boolean;
  favorite_genres: boolean;
};

// Single unified function that works for both contexts
export const createEmail = async (data: EmailData, userId?: string) => {
  let favBandReleases: any[] = [];
  let favGenreReleases: any[] = [];

  // Use worker functions if userId is provided, otherwise use session-based functions
  if (userId) {
    // Worker context - use functions that don't rely on session
    const {
      getFavoriteBandReleasesForEmailWorker,
      getGenreReleasesForEmailWorker,
    } = await import("@/lib/data/user-email-settings-data");

    if (data.favorite_bands) {
      favBandReleases = await getFavoriteBandReleasesForEmailWorker(
        userId,
        data.email_frequency
      );
    }

    if (data.favorite_genres) {
      favGenreReleases = await getGenreReleasesForEmailWorker(
        userId,
        data.email_frequency
      );
    }
  } else {
    // Regular context - use session-based functions
    if (data.favorite_bands) {
      favBandReleases = await getFavoriteBandReleasesForEmail(
        data.email_frequency
      );
    }

    if (data.favorite_genres) {
      favGenreReleases = await getGenreReleasesForEmail(data.email_frequency);
    }
  }
  let text = "";
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; color: #333333; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
        <style>
          /* Mobile responsive styles */
          @media only screen and (max-width: 600px) {
            .email-container { padding: 15px !important; }
            .email-table { font-size: 14px !important; }
            .email-table th, .email-table td { padding: 8px 4px !important; }
            .email-header { font-size: 18px !important; }
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
            .email-table-mobile th:last-child,
            .email-table-mobile td:last-child {
              width: 40% !important;
              min-width: 120px !important;
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
          🎸 Latest Releases from Your Favorite Artists
        </h2>
        <table class="email-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Release Date</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Artist</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Album</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const band of favBandReleases) {
      const date = formatDateWithNamedMonth(band.releaseDate!);
      text += `\n- ${date} - ${band.bandName} - ${band.albumName}`;
      html += `
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 12px; color: #6c757d; font-size: 14px;">${date}</td>
          <td style="padding: 12px; color: #333; font-weight: 500;">${band.bandName}</td>
          <td style="padding: 12px; color: #333;">${band.albumName}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
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
          🎵 Latest Releases from Your Favorite Genres
        </h2>
        <table class="email-table email-table-mobile" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600; width: 20%;">Release Date</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600; width: 25%;">Artist</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600; width: 25%;">Album</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600; width: 30%;">Genres</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const band of favGenreReleases) {
      const date = formatDateWithNamedMonth(band.releaseDate!);
      const genres = Array.isArray(band.genreTags)
        ? band.genreTags.join(", ")
        : band.genreTags;

      // Split genres into individual tags for better mobile display
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
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 12px; color: #6c757d; font-size: 14px; vertical-align: top;">${date}</td>
          <td style="padding: 12px; color: #333; font-weight: 500; vertical-align: top;">${band.bandName}</td>
          <td style="padding: 12px; color: #333; vertical-align: top;">${band.albumName}</td>
          <td style="padding: 12px; color: #666; font-size: 13px; vertical-align: top;">
            <div class="email-genre-container" style="line-height: 1.4; word-wrap: break-word; max-width: 100%; overflow-wrap: break-word;">
              ${genreTags}
            </div>
          </td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  html += `
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
        <p>🤘 Stay heavy! 🤘</p>
        <p style="margin-top: 10px;">
          <a href="https://www.metal-vault.com/api/email/unsubscribe?id=${userId || ''}" 
             style="color: #6c757d; text-decoration: underline; font-size: 11px;">
            Unsubscribe 
          </a>
        </p>
      </div>
    </div>
  `;
  return {
    text,
    html,
  };
};
