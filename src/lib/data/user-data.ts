"use server";

import sql from "@/lib/db";
import { MaxTableShards } from "@/lib/enums";

import { getSession } from "../session/actions";
import { logUnauthorizedAccess, logWrongUserAccess } from "../loggers/auth-log";

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

  if (
    !user?.id ||
    user?.shard === undefined ||
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
