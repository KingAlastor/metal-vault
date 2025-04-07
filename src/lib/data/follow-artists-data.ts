"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";

export type Band = {
  id: string;
  namePretty: string;
  country: string | null;
  genreTags: string[];
  followers: number | null;
  status: string | null;
};

export async function fetchBandsByFilters(search: string): Promise<Band[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  let whereCondition: string;
  let params: (string | string[])[] = [];

  if (search === "#") {
    whereCondition = `
      name_pretty ILIKE '0%' OR
      name_pretty ILIKE '1%' OR
      name_pretty ILIKE '2%' OR
      name_pretty ILIKE '3%' OR
      name_pretty ILIKE '4%' OR
      name_pretty ILIKE '5%' OR
      name_pretty ILIKE '6%' OR
      name_pretty ILIKE '7%' OR
      name_pretty ILIKE '8%' OR
      name_pretty ILIKE '9%'
    `;
  } else if (search === "~") {
    whereCondition = `
      name_pretty ILIKE '!%' OR
      name_pretty ILIKE '@%' OR
      name_pretty ILIKE '#%' OR
      name_pretty ILIKE '$%' OR
      name_pretty ILIKE '%%%' OR
      name_pretty ILIKE '^%' OR
      name_pretty ILIKE '&%' OR
      name_pretty ILIKE '*%' OR
      name_pretty ILIKE '(%' OR
      name_pretty ILIKE ')%' OR
      name_pretty ILIKE '-%' OR
      name_pretty ILIKE '_%' OR
      name_pretty ILIKE '=%' OR
      name_pretty ILIKE '+%' OR
      name_pretty ILIKE '[%' OR
      name_pretty ILIKE ']%' OR
      name_pretty ILIKE '{%' OR
      name_pretty ILIKE '}%' OR
      name_pretty ILIKE '|%' OR
      name_pretty ILIKE '\\%' OR
      name_pretty ILIKE ':%' OR
      name_pretty ILIKE ';%' OR
      name_pretty ILIKE '"%' OR
      name_pretty ILIKE '''%' OR
      name_pretty ILIKE '<%' OR
      name_pretty ILIKE '>%' OR
      name_pretty ILIKE ',%' OR
      name_pretty ILIKE '.%' OR
      name_pretty ILIKE '?%' OR
      name_pretty ILIKE '/%'
    `;
  } else {
    whereCondition = `name_pretty ILIKE ${search + '%'}`;
  }

  try {
    const response = await sql<Band[]>`
      SELECT 
        id,
        name_pretty as "namePretty",
        country,
        genre_tags as "genreTags",
        followers,
        status
      FROM bands 
      WHERE ${sql.unsafe(whereCondition)}
      ORDER BY name ASC
    `;

    return response;
  } catch (error) {
    console.error("Error fetching bands by filters:", error);
    throw new Error("Failed to fetch bands. Please try again later.");
  }
}

export async function fetchUserFavoriteBands(): Promise<string[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  const favorites = await sql`
    SELECT band_id as "bandId"
    FROM ${sql.unsafe(tableName)}
    WHERE user_id = ${session.userId}
  `;

  return favorites.map(band => band.bandId);
}

export async function fetchUserFavBandsFullData(): Promise<(Band & { rating: number })[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    return [];
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  const favorites = await sql`
    SELECT 
      b.id,
      b.name_pretty as "namePretty",
      b.country,
      b.genre_tags as "genreTags",
      b.followers,
      b.status,
      bf.rating
    FROM ${sql.unsafe(tableName)} bf
    JOIN bands b ON b.id = bf.band_id
    WHERE bf.user_id = ${session.userId}
  `;

  return favorites.map(row => ({
    id: row.id,
    namePretty: row.namePretty,
    country: row.country,
    genreTags: row.genreTags,
    followers: row.followers,
    status: row.status,
    rating: row.rating
  }));
}

export async function saveUserFavorites(favorites: string[]): Promise<void> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  if (favorites && favorites.length > 0) {
    // Delete existing favorites
    await sql`
      DELETE FROM ${sql.unsafe(tableName)}
      WHERE user_id = ${session.userId}
    `;

    // Insert new favorites
    const values = favorites.map(bandId => 
      `(${session.userId}, ${bandId})`
    ).join(',');

    await sql`
      INSERT INTO ${sql.unsafe(tableName)} (user_id, band_id)
      VALUES ${sql.unsafe(values)}
      ON CONFLICT (user_id, band_id) DO NOTHING
    `;
  }
}

export async function saveUserFavoriteAndUpdateFollowerCount(bandId: string): Promise<void> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  // Check if favorite exists
  const existingRecord = await sql`
    SELECT 1 FROM ${sql.unsafe(tableName)}
    WHERE user_id = ${session.userId} AND band_id = ${bandId}
  `;

  if (!existingRecord.length) {
    try {
      // Add favorite
      await sql`
        INSERT INTO ${sql.unsafe(tableName)} (user_id, band_id)
        VALUES (${session.userId}, ${bandId})
        ON CONFLICT (user_id, band_id) DO NOTHING
      `;

      // Increment follower count
      await sql`
        UPDATE bands
        SET followers = followers + 1
        WHERE id = ${bandId}
      `;
    } catch (error) {
      console.error("Failed to add favorite:", error);
    }
  }
}

export async function deleteFavoriteArtist(bandId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  try {
    await sql`
      DELETE FROM ${sql.unsafe(tableName)}
      WHERE user_id = ${session.userId} AND band_id = ${bandId}
    `;

    // Decrement follower count
    await sql`
      UPDATE bands
      SET followers = followers - 1
      WHERE id = ${bandId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error deleting favorite artist:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateBandRating(bandId: string, rating: number): Promise<void> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  try {
    await sql`
      UPDATE ${sql.unsafe(tableName)}
      SET rating = ${rating}
      WHERE user_id = ${session.userId} AND band_id = ${bandId}
    `;
  } catch (error) {
    console.error("Failed to update rating:", error);
  }
}

export async function checkBandExists(bandNamePretty: string): Promise<{ id: string }[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  try {
    return await sql`
      SELECT id
      FROM bands
      WHERE name_pretty ILIKE ${bandNamePretty}
    `;
  } catch (error) {
    console.error("Error checking if band exists:", error);
    throw new Error("Failed to check if band exists. Please try again later.");
  }
}

export async function checkFavoriteExists(bandId: string | null | undefined): Promise<boolean> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  if (!bandId) return false;

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  try {
    const favorite = await sql`
      SELECT 1 FROM ${sql.unsafe(tableName)}
      WHERE user_id = ${session.userId} AND band_id = ${bandId}
    `;

    return favorite.length > 0;
  } catch (error) {
    console.error("Error checking favorite:", error);
    throw error;
  }
}

export async function followArtistByBandId(bandId: string) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to follow artists");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_followers_${shard}`;

  try {
    // @ts-ignore - postgres-js has incomplete types for template literals with dynamic table names
    // This is safe as tableName is constructed from validated user shard
    await sql`
      INSERT INTO ${sql.unsafe(tableName)} (user_id, band_id)
      VALUES (${session.userId}, ${bandId})
      ON CONFLICT (user_id, band_id) DO NOTHING
    `;

    // Increment follower count
    await sql`
      UPDATE bands
      SET followers = followers + 1
      WHERE id = ${bandId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error following artist:", error);
    throw error;
  }
}
