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

export async function getFavoriteBandReleasesForEmail(
  userId: string,
  frequency: string
): Promise<UpcomingRelease[]> {
  try {
    const userResult = await sql`
      SELECT shard FROM users WHERE id = ${userId}
    `;
    const shard = userResult[0]?.shard || 0;

    const dateRange = getFromAndToDates(frequency);

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
      SELECT shard, genre_tags, excluded_genre_tags 
      FROM users 
      WHERE id = ${userId}
    `;
    const user = userResult[0];
    if (!user) {
      return [];
    }

    const shard = user.shard || 0;
    const userGenreTags = user.genre_tags || [];
    const excludedGenreTags = user.excluded_genre_tags || [];

    const dateRange = getFromAndToDates(frequency);

    if (userGenreTags.length === 0) {
      return [];
    }

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

    return releases;
  } catch (error) {
    console.error("Error fetching favorite genre releases:", error);
    return [];
  }
}

export async function unsubscribeUser(unsub_token: string) {
  try {
    const [user] = await sql`
      SELECT user_id 
      FROM public.user_tokens
      WHERE unsubscribe_token = ${unsub_token}
    `;

    if (user.user_id) {
      await sql`
      UPDATE users
      SET email_settings = jsonb_set(email_settings, '{email_updates_enabled}', 'false'::jsonb)
      WHERE id = ${user.user_id}
    `;
    }
  } catch (error) {
    console.error("Error updating email settings:", error);
  }
}

export async function updateEmailAddressStatus(email: string, status: string) {
  try {
    const [userId] = await sql`
      SELECT id 
      FROM users
      WHERE email = ${email}
    `;

    if (userId) {
      await sql`
      UPDATE users
      SET email_status = ${status}
      WHERE id = ${userId.id}
    `;
      return { status: true, message: `Update successful. Status: ${status}` };
    } else {
      return { status: false, message: `Unknown email: ${email}` };
    }
  } catch (error) {
    console.error("Error updating email status:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return { status: false, message: errorMsg };
  }
}

export async function updateUnsubscribeUserToken(
  userId: string,
  checked: boolean
) {
  try {
    if (userId && checked) {
      await sql`
        INSERT INTO public.user_tokens (user_id, unsubscribe_token)
        VALUES (${userId}, encode(gen_random_bytes(32), 'hex'))
        ON CONFLICT (user_id)
        DO UPDATE SET 
          unsubscribe_token = encode(gen_random_bytes(32), 'hex'),
          updated_at = NOW()
      `;
    } else {
      await sql`
        DELETE FROM public.user_tokens
        WHERE user_id = ${userId}
      `;
    }
  } catch (error) {
    console.error("Error updating unsubscribe token:", error);
    throw error;
  }
}


export async function getUnsubscribeTokenForUser(userId: string) {
  const [userTokenData] = await sql`
    SELECT unsubscribe_token 
    FROM public.user_tokens
    WHERE user_id = ${userId}
  `;

  return userTokenData.unsubscribe_token;
}
