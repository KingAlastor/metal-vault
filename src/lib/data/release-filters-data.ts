"use server";

import { sql } from "../db";
import { getSession } from "../session/server-actions";
import { fetchUserFavoriteBands } from "./follow-artists-data";
import { getFullUserData } from "./user-data";

export type ReleasesFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  disliked_genres?: boolean;
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

  let userData;
  let filters: ReleasesFilters = {};
  let followedBandIds: string[] | undefined = [];
  let unfollowedBandIds: string[] | undefined = [];
  let userFavoriteGenreTags: string[] | undefined = [];
  let userDislikedGenreTags: string[] | undefined = [];

  if (session.userId) {
    userData = await getFullUserData(session.userId);
    filters = userData?.release_settings || {};
    if (filters.favorite_bands) {
      followedBandIds = await fetchUserFavoriteBands();
    }
    if (filters.favorite_genres) {
      userFavoriteGenreTags = userData?.genre_tags;
    }
    if (filters.genreTags && filters.genreTags.length > 0) {
      userFavoriteGenreTags = [
        ...filters.genreTags,
        ...(userFavoriteGenreTags || []),
      ];
    }
    if (filters.disliked_genres) {
      userDislikedGenreTags = userData?.excluded_genre_tags;
    }
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  try {
    // --- Build the SQL query with priority-based filtering logic ---

    // Priority-Based Filtering Logic:
    // 1. Followed Bands (Highest Priority): Always include, overrides all genre rules
    // 2. Unfollowed Bands (High Priority Exclusion): Always exclude, overrides all genre rules
    // 3. Favorite Genres (Conditional Inclusion): Include if no band rule applies
    // 4. Disliked Genres (Conditional Exclusion): Exclude if no band rule applies

    // Simple checks: arrays are already safe (initialized as []) and filters already checked
    const hasFollowedBands = followedBandIds.length > 0;
    const hasUnfollowedBands = unfollowedBandIds.length > 0;
    const hasFavoriteGenres = (userFavoriteGenreTags?.length ?? 0) > 0;
    const hasDislikedGenres = (userDislikedGenreTags?.length ?? 0) > 0;

    // --- Construct and execute the final SQL query ---
    const finalSql = sql`
      SELECT
        band_id as "bandId",
        band_name as "bandName",
        album_name as "albumName",
        type,
        release_date as "releaseDate",
        genre_tags as "genreTags"
      FROM upcoming_releases
      WHERE release_date >= ${today}
      AND (
        -- Step 1: Always exclude unfollowed bands (highest priority exclusion)
        ${
          hasUnfollowedBands
            ? sql`band_id != ALL(${unfollowedBandIds})`
            : sql`1=1`
        }
      )
      AND (
        -- Step 2: Include if ANY of these conditions are met:
        ${
          hasFollowedBands && hasFavoriteGenres
            ? sql`(band_id = ANY(${followedBandIds}) OR genre_tags && ${
                userFavoriteGenreTags || []
              })`
            : hasFollowedBands
            ? sql`band_id = ANY(${followedBandIds})`
            : hasFavoriteGenres
            ? sql`genre_tags && ${userFavoriteGenreTags || []}`
            : sql`1=1`
        }
      )
      AND (
        -- Step 3: Apply disliked genre exclusion, BUT followed bands are protected
        ${
          hasDislikedGenres
            ? hasFollowedBands
              ? sql`(band_id = ANY(${followedBandIds}) OR NOT (genre_tags && ${
                  userDislikedGenreTags || []
                }))`
              : sql`NOT (genre_tags && ${userDislikedGenreTags || []})`
            : sql`1=1`
        }
      )
      ORDER BY release_date ASC
    `;

    // Execute the query
    const releases = await finalSql;

    // Map the results to match the UpcomingRelease type
    return releases.map((row) => ({
      bandId: row.bandId,
      bandName: row.bandName,
      albumName: row.albumName,
      type: row.type,
      releaseDate: row.releaseDate,
      genreTags: row.genreTags,
    }));
  } catch (error) {
    console.error("Error fetching releases by filters:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    throw new Error("Failed to fetch releases. Please try again later.");
  }
}
