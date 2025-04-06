"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { revalidatePath } from "next/cache";
import { logUnauthorizedAccess } from "../loggers/auth-log";

export type UpdateUser = {
  userName?: string;
  location?: string;
  genreTags?: string[];
  notifications?: string[];
  postsSettings?: string;
  pending_actions?: string[];
  release_settings?: string;
};

export async function updateUserData(data: UpdateUser) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User is not logged in");
  }

  // Build the update query dynamically based on provided fields
  const updates: string[] = [];
  const values: (string | string[] | undefined)[] = [];
  
  if (data.userName !== undefined) {
    updates.push("user_name = ${userName}");
    values.push(data.userName);
  }
  
  if (data.location !== undefined) {
    updates.push("location = ${location}");
    values.push(data.location);
  }
  
  if (data.genreTags !== undefined) {
    updates.push("genre_tags = ${genreTags}");
    values.push(data.genreTags);
  }
  
  if (data.notifications !== undefined) {
    updates.push("notifications = ${notifications}");
    values.push(data.notifications);
  }

  if (data.postsSettings !== undefined) {
    updates.push("posts_settings = ${postsSettings}");
    values.push(data.postsSettings);
  }

  if (updates.length === 0) {
    return; // No updates to perform
  }

  // Add userId to values array
  values.push(session.userId);

  // Construct and execute the update query
  await sql`
    UPDATE users 
    SET ${sql.unsafe(updates.join(", "))}, updated_at = NOW()
    WHERE id = ${session.userId}
  `;

  revalidatePath("/");
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
        updated_at = NOW()
    WHERE id = ${session.userId}
  `;
}
