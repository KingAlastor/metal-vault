"use server";

import sql from "@/lib/db";
import { MaxTableShards } from "@/lib/enums";

import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess, logWrongUserAccess } from "../loggers/auth-log";

const MAX_SHARDS = 1000;
const USERS_PER_SHARD = 5000;

export type FullUser = {
  id: string;
  name: string;
  user_name?: string;
  email?: string;
  email_verified?: boolean;
  location?: string;
  image?: string;
  role?: string;
  shard?: number;
  email_settings?: string;
  bands_settings?: string;
  release_settings?: string;
  posts_settings?: string;
  events_settings?: string;
  last_login?: string;
  genre_tags: string[];
  excluded_genre_tags: string[];
  notifications?: string[];
  pending_actions?: string[];
  created_at?: string;
  updated_at?: string;
};

export type OAuthUserInfo = {
  email: string;
  name: string;
  image?: string;
  emailVerified?: boolean;
};

/**
 * Finds an existing user by their email or creates a new user if none exists.
 *
 * This function first attempts to retrieve the user's email from the current session.
 * If no session user is found, it uses the email provided in the `OAuthUserInfo` object.
 * If no email is available, an error is thrown.
 *
 * If a user with the given email exists in the database, it is returned.
 * Otherwise, a new user is created with the provided `OAuthUserInfo` data.
 * The shard for the new user is calculated based on the total number of users
 * and the defined shard limits.
 *
 * @param userInfo - The OAuth user information containing details such as email, name, image, and email verification status.
 * @returns The user object, either retrieved from the database or newly created.
 * @throws If no email is provided or if there is an error during database operations.
 */

export const findOrCreateUser = async (userInfo: OAuthUserInfo) => {
  const session = await getSession();
  let email = "";

  if (session.userId) {
    const user = await getFullUserData(session.userId);
    if (user?.email) {
      email = user?.email;
    }
  } else {
    email = userInfo?.email;
  }

  if (!email) {
    throw new Error("Email is required to find or create a user");
  }

  try {
    // Try to find existing user
    let user = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (user.length === 0) {
      // Calculate shard for new user
      const userCount = await sql`
        SELECT COUNT(*) as count FROM users
      `;
      const totalUsers = Number(userCount[0].count);
      const calculatedShard = Math.min(
        Math.floor(totalUsers / USERS_PER_SHARD),
        MAX_SHARDS - 1
      );
      const pendingActions = ["firstLogin", "syncFollowers"];

      // Create new user
      user = await sql`
        INSERT INTO users 
        (email, name, image, email_verified, role, shard, pending_actions) 
        VALUES (
          ${userInfo.email}, 
          ${userInfo.name}, 
          ${userInfo.image ?? null}, 
          ${userInfo.emailVerified ?? true}, 
          ${"user"}, 
          ${calculatedShard},
          ${pendingActions}
        ) 
        RETURNING *;
      `;
    }

    return user[0];
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw new Error("Failed to find or create user");
  }
};

/**
 * Retrieves the full user data for a given user ID, ensuring the request is authorized.
 *
 * This function first checks if the user associated with the current session is logged in.
 * If not logged in, it logs an unauthorized access attempt and returns `null`.
 * It then verifies if the requested `userId` matches the `userId` stored in the session.
 * If they don't match, it logs a wrong user access attempt and returns `null`.
 *
 * If both checks pass, it queries the database for the user record matching the provided `userId`.
 *
 * @param userId - The unique identifier of the user whose data is to be retrieved.
 * @returns A promise that resolves to the `FullUser` object if found and authorized,
 *          or `null` if the user is not logged in, the requested `userId` doesn't match
 *          the session user, or the user is not found in the database.
 */

export const getFullUserData = async (userId: string) => {
  const session = await getSession();
  if (!session.isLoggedIn) {
    logUnauthorizedAccess(userId);
    return null;
  }

  if (!session.userId || userId !== session.userId) {
    logWrongUserAccess(userId, session.userId || "unknown");
    return null;
  }

  const fullUser = await sql<FullUser[]>`
    SELECT * FROM users WHERE id = ${userId}
  `;

  return fullUser[0];
};

export const fetchUnfollowedUsers = async (userId: string) => {
  const session = await getSession();
  if (!session.isLoggedIn) {
    logUnauthorizedAccess(userId);
    return null;
  }

  if (!session.userId || userId !== session.userId) {
    logWrongUserAccess(userId, session.userId || "unknown");
    return null;
  }

  const user = await getFullUserData(userId);
  if (!user) return [];

  if (
    !user.id ||
    user.shard === undefined ||
    user.shard < 0 ||
    user.shard >= MaxTableShards.UserUnFollowers ||
    !Number.isInteger(user.shard)
  ) {
    return [];
  }

  try {
    const query = `
      SELECT unfollowed_user_id
      FROM user_unfollowers_${user.shard}
      WHERE user_id = $1
    `;

    const unfollowedUsers = await sql.unsafe(query, [user.id]);

    return unfollowedUsers
      .map((row) => row.unfollowed_user_id)
      .filter((id): id is string => id !== undefined);
  } catch (error) {
    console.error("Error fetching unfollowed users:", error);
    throw error;
  }
};

export const getPostsFilters = async (userId: string) => {
  try {
    const userResult = await sql<
      { shard: number | null; genre_tags: string[] | null }[]
    >`
      SELECT
        genre_tags,
        shard
      FROM users
      WHERE id = ${userId}
    `;

    const user = userResult[0];
    const shard = user?.shard ?? 0; // Use nullish coalescing for default

    // Validate shard value (optional but recommended)
    if (
      shard < 0 ||
      shard >= MaxTableShards.BandFollowers ||
      !Number.isInteger(shard)
    ) {
      console.error(`Invalid shard value ${shard} for user ${userId}`);
      // Decide how to handle: return default, throw error, etc.
      return {
        genre_tags: user?.genre_tags || [],
        favorite_bands: [],
        saved_posts: [],
      };
    }

    const savedPostsResult = await sql<{ post_id: string }[]>`
      SELECT post_id
      FROM user_posts_saved
      WHERE user_id = ${userId}
    `;

    // Construct the query string for favorite bands
    const favoriteBandsQuery = `
      SELECT band_id
      FROM band_followers_${shard}
      WHERE user_id = $1
    `;

    // Execute using sql.unsafe
    const favoriteBandsResult = await sql.unsafe<{ band_id: string }[]>(
      favoriteBandsQuery,
      [userId]
    );

    return {
      genre_tags: user?.genre_tags || [],
      favorite_bands: favoriteBandsResult.map((row) => row.band_id),
      saved_posts: savedPostsResult.map((row) => row.post_id),
    };
  } catch (error) {
    console.error("Error fetching post filters:", error);
    // Return default structure on error
    return {
      genre_tags: [],
      favorite_bands: [],
      saved_posts: [],
    };
  }
};

export async function fetchUserSavedPosts() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    return [];
  }

  try {
    const savedPosts = await sql`
      SELECT post_id
      FROM user_posts_saved
      WHERE user_id = ${session.userId}
    `;

    return savedPosts.map((row) => row.post_id);
  } catch (error) {
    console.error("Failed to fetch saved posts:", error);
    return [];
  }
}

export async function getRefreshTokenFromUserTokens(provider: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    return null;
  }

  try {
    const token = await sql`
      SELECT refresh_token
      FROM user_tokens
      WHERE user_id = ${session.userId} AND provider = ${provider}
    `;

    return token[0]?.refresh_token || null;
  } catch (error) {
    console.error("Failed to fetch refresh token:", error);
    return null;
  }
}

// Update the type definition
export type UpdateUserData = {
  email_settings?: string;
  user_name?: string;
  location?: string;
  genre_tags?: string[];
  excluded_genre_tags?: string[];
  notifications?: string[];
  posts_settings?: string;
  events_settings?: string;
  pending_actions?: string[];
  release_settings?: string;
};

export async function updateUserData(data: UpdateUserData) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    return null;
  }

  // Create dynamic SQL query parts
  const updateParts = [];
  const values = [];
  let paramIndex = 1;

  if (data.user_name !== undefined) {
    updateParts.push(`user_name = $${paramIndex}`);
    values.push(data.user_name);
    paramIndex++;
  }

  if (data.location !== undefined) {
    updateParts.push(`location = $${paramIndex}`);
    values.push(data.location);
    paramIndex++;
  }

  if (data.genre_tags !== undefined) {
    updateParts.push(`genre_tags = $${paramIndex}`);
    values.push(data.genre_tags);
    paramIndex++;
  }

   if (data.excluded_genre_tags !== undefined) {
    updateParts.push(`excluded_genre_tags = $${paramIndex}`);
    values.push(data.excluded_genre_tags);
    paramIndex++;
  }

  if (data.email_settings !== undefined) {
    updateParts.push(`email_settings = $${paramIndex}`);
    values.push(data.email_settings);
    paramIndex++;
  }

  if (data.posts_settings !== undefined) {
    updateParts.push(`posts_settings = $${paramIndex}`);
    values.push(data.posts_settings);
    paramIndex++;
  }

  if (data.events_settings !== undefined) {
    updateParts.push(`events_settings = $${paramIndex}`);
    values.push(data.events_settings);
    paramIndex++;
  }

  if (updateParts.length === 0) {
    return null; // No updates to perform
  }

  // Add updated_at timestamp
  updateParts.push(`updated_at = NOW() AT TIME ZONE 'UTC'`);

  // Construct the SQL query
  const query = `
    UPDATE users 
    SET ${updateParts.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  values.push(session.userId);

  try {
    const updatedUser = await sql.unsafe(query, values);
    return updatedUser[0] || null;
  } catch (error) {
    console.error("Failed to update user data:", error);
    throw error; // Let the API route handle the error
  }
}

export async function deleteUser() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User is not logged in");
  }

  try {
    await sql`
      DELETE FROM users 
      WHERE id = ${session.userId}
    `;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function deleteUserPendingAction(action: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User is not logged in");
  }

  await sql`
    UPDATE users
    SET pending_actions = array_remove(pending_actions, ${action}),
        updated_at = NOW() AT TIME ZONE 'UTC'
    WHERE id = ${session.userId}
  `;
}
