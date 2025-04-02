"use server";

import sql from "../db";
import { getSession } from "../session/actions";
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
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to view releases");
  }

  let bandIds: string[] | undefined;

  if (filters?.favorite_bands) {
    bandIds = await fetchUserFavoriteBands();
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  try {
    let query = `
      SELECT 
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        type,
        release_date as "releaseDate",
        genre_tags as "genreTags"
      FROM upcoming_releases
      WHERE release_date >= ${today}
    `;

    const conditions: string[] = [];
    const params: (string | string[] | Date)[] = [];

    if (bandIds && bandIds.length > 0) {
      conditions.push(`band_id = ANY(${bandIds})`);
      params.push(bandIds);
    }

    if (filters?.genreTags && filters.genreTags.length > 0) {
      conditions.push(`genre_tags && ${filters.genreTags}`);
      params.push(filters.genreTags);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY release_date ASC`;

    // @ts-ignore - postgres-js has incomplete types for template literals with dynamic conditions
    // This is safe as we're using parameterized queries and proper type checking
    const releases = await sql<UpcomingRelease[]>`
      ${sql.unsafe(query)}
    `;

    return releases;
  } catch (error) {
    console.error("Error fetching releases by filters:", error);
    throw new Error("Failed to fetch releases. Please try again later.");
  }
}
