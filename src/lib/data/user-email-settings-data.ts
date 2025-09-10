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
  userId: string,
  frequency: string
): Promise<UpcomingRelease[]> {
  try {
    const userResult = await sql`
      SELECT shard FROM users WHERE id = ${userId}
    `;
    const shard = userResult[0]?.shard || 0;

    const bandIds = await sql`
      SELECT band_id
      FROM band_followers_${sql.unsafe(shard.toString())}
      WHERE user_id = ${userId}
    `;
    const bandIdArray = bandIds.map((row) => row.band_id);
    const date = getFromAndToDates(frequency);

    if (bandIdArray.length === 0) {
      return [];
    }

    const releases = await sql<UpcomingRelease[]>`
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        album_name as "title",  // Alias to match type
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type,
        'active' as "status"  // Include status in SQL to match type
      FROM upcoming_releases
      WHERE band_id = ANY(${bandIdArray})
      AND release_date >= ${date.from}
      AND release_date <= ${date.to}
      ORDER BY release_date ASC
    `;

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
  try {
    const userResult = await sql`
      SELECT shard, genre_tags as "genreTags", excluded_genre_tags as "excludedGenreTags"
      FROM users 
      WHERE id = ${userId}
    `;
    const user = userResult[0];
    if (!user) {
      return [];
    }

    const shard = user.shard || 0;
    const userGenreTags = user.genreTags || [];
    const excludedGenreTags = user.excludedGenreTags || [];

    const bandIds = await sql`
      SELECT band_id
      FROM band_followers_${sql.unsafe(shard.toString())}
      WHERE user_id = ${userId}
    `;
    const bandIdArray = bandIds.map((row) => row.band_id);
    const date = getFromAndToDates(frequency);

    if (userGenreTags.length === 0) {
      return [];
    }

    const releases = await sql<UpcomingRelease[]>`
      SELECT 
        id,
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        album_name as "title",  // Alias to match type
        release_date as "releaseDate",
        genre_tags as "genreTags",
        type,
        'active' as "status"  // Include status in SQL to match type
      FROM upcoming_releases
      WHERE ${
        bandIdArray.length > 0 ? sql`band_id != ALL(${bandIdArray})` : sql`1=1`
      }
      AND genre_tags && ${userGenreTags}
      AND ${
        excludedGenreTags.length > 0
          ? sql`NOT (genre_tags && ${excludedGenreTags})`
          : sql`1=1`
      }
      AND release_date >= ${date.from}
      AND release_date <= ${date.to}
      ORDER BY release_date ASC
    `;

    return releases;
  } catch (error) {
    console.error("Error fetching favorite genre releases:", error);
    return [];
  }
}

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
