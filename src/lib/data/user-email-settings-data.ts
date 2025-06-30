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

export async function getGenreReleasesForEmail(
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
    SELECT genre_tags, disliked_genre_tags"
    FROM users
    WHERE id = ${session.userId}
  `;

  const userGenreTags = user[0]?.genre_tags || [];
  const dislikedGenreTags = user[0]?.disliked_genre_tags || [];

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
      AND ${dislikedGenreTags.length > 0 ? sql`NOT (genre_tags && ${dislikedGenreTags})` : sql`1=1`}
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

// Worker-specific versions that don't use session (for background jobs)
export async function getFavoriteBandReleasesForEmailWorker(
  userId: string,
  frequency: string
): Promise<UpcomingRelease[]> {
  try {
    // Get user's shard for band followers table
    const userResult = await sql`
      SELECT shard FROM users WHERE id = ${userId}
    `;
    
    const shard = userResult[0]?.shard || 0;
    
    // Get user's favorite bands
    const bandIds = await sql`
      SELECT band_id
      FROM band_followers_${sql.unsafe(shard.toString())}
      WHERE user_id = ${userId}
    `;
    
    const bandIdArray = bandIds.map(row => row.band_id);
    const date = getFromAndToDates(frequency);

    if (bandIdArray.length === 0) {
      return [];
    }    const releases = await sql`
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type
      FROM upcoming_releases
      WHERE band_id = ANY(${bandIdArray})
      AND release_date >= ${date.from}
      AND release_date <= ${date.to}
      ORDER BY release_date ASC
    `;

    return releases.map(row => ({
      id: row.id,
      bandId: row.bandId,
      bandName: row.bandName,
      albumName: row.albumName,
      title: row.albumName, // Use albumName as title
      releaseDate: row.releaseDate,
      genreTags: row.genreTags,
      type: row.type,
      status: 'active' // Default status since table doesn't have this column
    }));
  } catch (error) {
    console.error("Error fetching favorite band releases for worker:", error);
    return [];
  }
}

export async function getGenreReleasesForEmailWorker(
  userId: string,
  frequency: string
): Promise<UpcomingRelease[]> {
  try {
    // Get user's shard and genre preferences
    const userResult = await sql`
      SELECT shard, genre_tags as "genreTags"
      FROM users 
      WHERE id = ${userId}
    `;
    
    const user = userResult[0];
    if (!user) {
      return [];
    }
    
    const shard = user.shard || 0;
    const userGenreTags = user.genreTags || [];
    
    // Get user's favorite bands to exclude them
    const bandIds = await sql`
      SELECT band_id
      FROM band_followers_${sql.unsafe(shard.toString())}
      WHERE user_id = ${userId}
    `;
    
    const bandIdArray = bandIds.map(row => row.band_id);
    const date = getFromAndToDates(frequency);

    if (userGenreTags.length === 0) {
      return [];
    }    const releases = await sql`
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type
      FROM upcoming_releases
      WHERE ${bandIdArray.length > 0 ? sql`band_id != ALL(${bandIdArray})` : sql`1=1`}
      AND genre_tags && ${userGenreTags}
      AND release_date >= ${date.from}
      AND release_date <= ${date.to}
      ORDER BY release_date ASC
    `;

    return releases.map(row => ({
      id: row.id,
      bandId: row.bandId,
      bandName: row.bandName,
      albumName: row.albumName,
      title: row.albumName, // Use albumName as title
      releaseDate: row.releaseDate,
      genreTags: row.genreTags,
      type: row.type,
      status: 'active' // Default status since table doesn't have this column
    }));
  } catch (error) {
    console.error("Error fetching favorite genre releases for worker:", error);
    return [];
  }
}
