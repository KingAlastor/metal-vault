"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { fetchUserFavoriteBands } from "./follow-artists-data";
import { getFullUserData } from "./user-data";

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

export async function getReleasesByFilters(): Promise<UpcomingRelease[]> {
  const session = await getSession();

  let bandIds: string[] | undefined;
  let userData;
  let filters: ReleasesFilters = {};

  if (session.userId) {
    userData = await getFullUserData(session.userId);
    filters = userData?.release_settings ? JSON.parse(userData.release_settings) : {};
  }

  console.log("filters; ", filters);
  if (session.userId && filters?.favorite_bands) {
    bandIds = await fetchUserFavoriteBands();
    console.log("User favorite bands: ", bandIds);
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  try {
    // Build the query string for debugging
    let queryString = `
      SELECT 
      band_id as "bandId",
      band_name as "bandName",
      album_name as "albumName",
      type,
      release_date as "releaseDate",
      genre_tags as "genreTags"
      FROM upcoming_releases
      WHERE release_date >= '${today.toISOString()}'`;

    if (bandIds && bandIds.length > 0) {
      queryString += ` AND band_id = ANY(ARRAY[${bandIds
        .map((id) => `'${id}'`)
        .join(", ")}])`;
    }

    if (userData?.genre_tags && userData.genre_tags.length > 0) {
      queryString += ` AND genre_tags && ARRAY[${userData.genre_tags
        .map((tag) => `'${tag}'`)
        .join(", ")}]`;
    }

    queryString += ` ORDER BY release_date ASC`;

    console.log("Generated SQL query:", queryString);

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
      ${
        bandIds && bandIds.length > 0
          ? sql`AND band_id = ANY(${bandIds})`
          : sql``
      }
      ${
        filters.favorite_genres &&
        userData?.genre_tags &&
        userData.genre_tags.length > 0
          ? sql`AND genre_tags && ${userData.genre_tags}`
          : sql``
      }
      ORDER BY release_date ASC
    `;
    console.log("Fetched releases: ", releases);
    return releases;
  } catch (error) {
    console.error("Error fetching releases by filters:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    throw new Error("Failed to fetch releases. Please try again later.");
  }
}
