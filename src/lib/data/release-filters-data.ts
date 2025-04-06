"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import { fetchUserFavoriteBands } from "./follow-artists-data";

export type ReleasesFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  genreTags?: string[];
};

export type UpcomingRelease = {
  bandId: string;
  bandName: string;
  albumName: string;
  type: string;
  releaseDate: Date;
  genreTags: string[];
};

export async function getReleasesByFilters(filters: ReleasesFilters): Promise<UpcomingRelease[]> {
  const session = await getSession();

  let bandIds: string[] | undefined;

  if (filters?.favorite_bands) {
    bandIds = await fetchUserFavoriteBands();
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  try {
    const releases = await sql<UpcomingRelease[]>`
      SELECT 
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        type,
        release_date as "releaseDate",
        genre_tags as "genreTags"
      FROM upcoming_releases
      WHERE release_date >= ${today}
      ${bandIds && bandIds.length > 0 ? sql`AND band_id = ANY(${bandIds})` : sql``}
      ${filters?.genreTags && filters.genreTags.length > 0 ? sql`AND genre_tags && ${filters.genreTags}` : sql``}
      ORDER BY release_date ASC
    `;

    return releases;
  } catch (error) {
    console.error("Error fetching releases by filters:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    throw new Error("Failed to fetch releases. Please try again later.");
  }
}
