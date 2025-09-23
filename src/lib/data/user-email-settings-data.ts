"use server";

import sql from "../db";
import { getFromAndToDates } from "../general/dateTime";

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
};

// ... existing code ...

export async function getFavoriteBandReleasesForEmail(
  userId: string,
  frequency: string
): Promise<UpcomingRelease[]> {
  console.log(`[getFavoriteBandReleasesForEmail] Starting for user ${userId}, frequency: ${frequency}`);
  try {
    const userResult = await sql`
      SELECT shard FROM users WHERE id = ${userId}
    `;
    const shard = userResult[0]?.shard || 0;
    console.log(`[getFavoriteBandReleasesForEmail] User shard: ${shard}`);
    
    const dateRange = getFromAndToDates(frequency);
    console.log(`[getFavoriteBandReleasesForEmail] Date range from ${dateRange.from} to ${dateRange.to}`);

    // Log the full SQL query for debugging
    const tableName = `band_followers_${shard}`;
    const fullQuery = `
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        album_name as "title",
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type
      FROM upcoming_releases
      WHERE band_id IN (
        SELECT band_id
        FROM ${tableName}
        WHERE user_id = '${userId}'
      )
      AND release_date >= '${dateRange.from}'
      AND release_date <= '${dateRange.to}'
      ORDER BY release_date ASC
    `;
    console.log(`[getFavoriteBandReleasesForEmail] Full SQL Query:`, fullQuery);

    const releases = await sql<UpcomingRelease[]>`
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        album_name as "title",
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type
      FROM upcoming_releases
      WHERE band_id IN (
        SELECT band_id
        FROM band_followers_${sql.unsafe(shard.toString())}
        WHERE user_id = ${userId}
      )
      AND release_date >= ${dateRange.from}
      AND release_date <= ${dateRange.to}
      ORDER BY release_date ASC
    `;

    console.log(`[getFavoriteBandReleasesForEmail] Found ${releases.length} releases:`, releases.map(r => ({ id: r.id, title: r.title, date: r.releaseDate })));
    return releases;
  } catch (error) {
    console.error("Error fetching favorite band releases:", error);
    return [];
  }
}

export async function getGenreReleasesForEmail(
  userId: string,
  frequency: string
): Promise<UpcomingRelease[]> {
  console.log(`[getGenreReleasesForEmail] Starting for user ${userId}, frequency: ${frequency}`);
  try {
    const userResult = await sql`
      SELECT shard, genre_tags, excluded_genre_tags 
      FROM users 
      WHERE id = ${userId}
    `;
    const user = userResult[0];
    if (!user) {
      console.log(`[getGenreReleasesForEmail] User not found: ${userId}`);
      return [];
    }

    const shard = user.shard || 0;
    const userGenreTags = user.genre_tags || [];
    const excludedGenreTags = user.excluded_genre_tags || [];
    console.log(`[getGenreReleasesForEmail] User shard: ${shard}, genres: ${userGenreTags.length}, excluded: ${excludedGenreTags.length}`);
    
    const dateRange = getFromAndToDates(frequency);
    console.log(`[getGenreReleasesForEmail] Date range from ${dateRange.from} to ${dateRange.to}`);

    if (userGenreTags.length === 0) {
      console.log(`[getGenreReleasesForEmail] No favorite genres, returning empty array`);
      return [];
    }

    // Log the full SQL query for debugging
    const tableName = `band_followers_${shard}`;
    const excludedCondition = excludedGenreTags.length > 0 ? `NOT (genre_tags && ARRAY${JSON.stringify(excludedGenreTags)})` : '1=1';
    const fullQuery = `
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        album_name as "title",
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type
      FROM upcoming_releases
      WHERE band_id NOT IN (
        SELECT band_id
        FROM ${tableName}
        WHERE user_id = '${userId}'
      )
      AND genre_tags && ARRAY${JSON.stringify(userGenreTags)}
      AND ${excludedCondition}
      AND release_date >= '${dateRange.from}'
      AND release_date <= '${dateRange.to}'
      ORDER BY release_date ASC
    `;
    console.log(`[getGenreReleasesForEmail] Full SQL Query:`, fullQuery);

    const releases = await sql<UpcomingRelease[]>`
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        album_name as "title",
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type
      FROM upcoming_releases
      WHERE band_id NOT IN (
        SELECT band_id
        FROM band_followers_${sql.unsafe(shard.toString())}
        WHERE user_id = ${userId}
      )
      AND genre_tags && ${userGenreTags}
      AND ${
        excludedGenreTags.length > 0
          ? sql`NOT (genre_tags && ${excludedGenreTags})`
          : sql`1=1`
      }
      AND release_date >= ${dateRange.from}
      AND release_date <= ${dateRange.to}
      ORDER BY release_date ASC
    `;

    console.log(`[getGenreReleasesForEmail] Found ${releases.length} releases:`, releases.map(r => ({ id: r.id, title: r.title, date: r.releaseDate })));
    return releases;
  } catch (error) {
    console.error("Error fetching favorite genre releases:", error);
    return [];
  }
}

// ... existing code ...

export async function unsubscribeUser(userId: string) {
  try {
    await sql`
      UPDATE users
      SET email_settings = jsonb_set(email_settings, '{email_updates_enabled}', 'false'::jsonb)
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error("Error updating email settings:", error);
  }
}
