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

export async function fetchUserUnfollowedBands(): Promise<string[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to access unfollowed bands.");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_unfollowers_${shard}`;

  try {
    const unfollowedBands = await sql`
      SELECT band_id as "bandId"
      FROM ${sql.unsafe(tableName)}
      WHERE user_id = ${session.userId}
    `;

    return unfollowedBands.map(band => band.bandId);
  } catch (error) {
    console.error("Error fetching unfollowed bands:", error);
    throw error;
  }
}

export async function fetchUserUnfollowedBandsFullData(): Promise<Band[]> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    return [];
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_unfollowers${shard}`;

  try {
    const unfollowedBands = await sql`
      SELECT 
        b.id,
        b.name_pretty as "namePretty",
        b.country,
        b.genre_tags as "genreTags",
        b.followers,
        b.status
      FROM ${sql.unsafe(tableName)} buf
      JOIN bands b ON b.id = buf.band_id
      WHERE buf.user_id = ${session.userId}
    `;

    return unfollowedBands.map(row => ({
      id: row.id,
      namePretty: row.namePretty,
      country: row.country,
      genreTags: row.genreTags,
      followers: row.followers,
      status: row.status
    }));
  } catch (error) {
    console.error("Error fetching unfollowed bands full data:", error);
    return [];
  }
}

export async function deleteUnfollowBand(bandId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    return { success: false, error: "User is not logged in" };
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_unfollowers${shard}`;

  try {
    await sql`
      DELETE FROM ${sql.unsafe(tableName)}
      WHERE user_id = ${session.userId} AND band_id = ${bandId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error deleting unfollowed band:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ... existing unfollow functions ...
