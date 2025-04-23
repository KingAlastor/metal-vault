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

export const findOrCreateUser = async (userInfo: OAuthUserInfo) => {
  try {
    // Try to find existing user
    let user = await sql`
      SELECT * FROM users WHERE email = ${userInfo.email}
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

      // Create new user
      user = await sql`
        INSERT INTO users 
        (email, name, image, email_verified, role, shard) 
        VALUES (
          ${userInfo.email}, 
          ${userInfo.name}, 
          ${userInfo.image ?? null}, 
          ${userInfo.emailVerified ?? true}, 
          ${'user'}, 
          ${calculatedShard}
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

export const getFullUserData = async (userId: string) => {
  const session = await getSession();
  if (!session.isLoggedIn) {
    logUnauthorizedAccess(userId);
    return null;
  }

  if (!session.userId || userId !== session.userId) {
    logWrongUserAccess(userId, session.userId || 'unknown');
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
    logWrongUserAccess(userId, session.userId || 'unknown');
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
    const user = await sql`
      SELECT 
        genre_tags,
        shard
      FROM users
      WHERE id = ${userId}
    `;
    
    const savedPosts = await sql`
      SELECT post_id
      FROM user_posts_saved
      WHERE user_id = ${userId}
    `;

    const shard = user[0]?.shard || 0;
    const favoriteBands = await sql`
      SELECT band_id
      FROM band_followers_${shard}
      WHERE user_id = ${userId}
    `;

    return {
      genre_tags: user[0]?.genre_tags || [],
      favorite_bands: favoriteBands.map(row => row.band_id),
      saved_posts: savedPosts.map(row => row.post_id)
    };
  } catch (error) {
    console.error("Error fetching post filters:", error);
    return {
      genre_tags: [],
      favorite_bands: [],
      saved_posts: []
    };
  }
};

export async function fetchUserSavedPosts() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    return [];
  }

  try {
    const savedPosts = await sql`
      SELECT post_id
      FROM user_posts_saved
      WHERE user_id = ${session.userId}
    `;

    return savedPosts.map(row => row.post_id);
  } catch (error) {
    console.error("Failed to fetch saved posts:", error);
    return [];
  }
}

export async function getRefreshTokenFromUserTokens(provider: string) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
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
  notifications?: string[];
  posts_settings?: string;
  events_settings?: string;
  pending_actions?: string[];
  release_settings?: string;
};

export async function updateUserData(data: UpdateUserData) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
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
    SET ${updateParts.join(', ')}
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
    logUnauthorizedAccess(session.userId || 'unknown');
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
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  await sql`
    UPDATE users
    SET pending_actions = array_remove(pending_actions, ${action}),
        updated_at = NOW() AT TIME ZONE 'UTC'
    WHERE id = ${session.userId}
  `;
}
