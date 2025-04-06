"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import { getFromAndToDates } from "../general/dateTime";
import { fetchUserFavoriteBands } from "./follow-artists-data";

export type ReleasesFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  genreTags?: string[];
  email_frequency: string;
};

export type UpcomingRelease = {
  id: string;
  bandId: string;
  title: string;
  releaseDate: Date;
  genreTags: string[];
  type: string;
  status: string;
};

export async function getFavoriteBandReleasesForEmail(
  frequency: string
): Promise<UpcomingRelease[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to access email settings.");
  }

  const bandIds = await fetchUserFavoriteBands();
  const date = getFromAndToDates(frequency);

  try {
    const releases = await sql`
      SELECT 
        id,
        band_id as "bandId",
        title,
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type,
        status
      FROM upcoming_releases
      WHERE ${bandIds.length > 0 ? sql`band_id = ANY(${bandIds})` : sql`1=1`}
      AND release_date >= ${date.from}
      AND release_date <= ${date.to}
      ORDER BY release_date ASC
    `;

    return releases.map(row => ({
      id: row.id,
      bandId: row.bandId,
      title: row.title,
      releaseDate: row.releaseDate,
      genreTags: row.genreTags,
      type: row.type,
      status: row.status
    }));
  } catch (error) {
    console.error("Error fetching favorite band releases:", error);
    return [];
  }
}

export async function getFavoriteGenreReleasesForEmail(
  frequency: string
): Promise<UpcomingRelease[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to access email settings.");
  }

  const bandIds = await fetchUserFavoriteBands();
  const date = getFromAndToDates(frequency);

  // Get user's genre preferences
  const user = await sql`
    SELECT genre_tags as "genreTags"
    FROM users
    WHERE id = ${session.userId}
  `;

  const userGenreTags = user[0]?.genreTags || [];

  try {
    const releases = await sql`
      SELECT 
        id,
        band_id as "bandId",
        title,
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type,
        status
      FROM upcoming_releases
      WHERE ${bandIds.length > 0 ? sql`band_id != ALL(${bandIds})` : sql`1=1`}
      AND ${userGenreTags.length > 0 ? sql`genre_tags && ${userGenreTags}` : sql`1=1`}
      AND release_date >= ${date.from}
      AND release_date <= ${date.to}
      ORDER BY release_date ASC
    `;

    return releases.map(row => ({
      id: row.id,
      bandId: row.bandId,
      title: row.title,
      releaseDate: row.releaseDate,
      genreTags: row.genreTags,
      type: row.type,
      status: row.status
    }));
  } catch (error) {
    console.error("Error fetching favorite genre releases:", error);
    return [];
  }
}
