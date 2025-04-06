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
  userName?: string;
  email?: string;
  emailVerified: boolean;
  location?: string;
  image?: string;
  role?: string;
  shard?: number;
  emailSettings?: string;
  bandsSettings?: string;
  releaseSettings?: string;
  postsSettings?: string;
  lastLogin?: string;
  genreTags: string[];
  notifications?: string[];
  pendingActions: string[];
  createdAt: string;
  updatedAt: string;
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
