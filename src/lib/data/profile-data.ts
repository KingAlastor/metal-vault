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
  const updateParts = [];
  const values = [];
  let paramIndex = 1;
  
  if (data.userName !== undefined) {
    updateParts.push(`user_name = $${paramIndex}`);
    values.push(data.userName);
    paramIndex++;
  }
  
  if (data.location !== undefined) {
    updateParts.push(`location = $${paramIndex}`);
    values.push(data.location);
    paramIndex++;
  }
  
  if (data.genreTags !== undefined) {
    updateParts.push(`genre_tags = $${paramIndex}`);
    values.push(data.genreTags);
    paramIndex++;
  }
  
  if (data.notifications !== undefined) {
    updateParts.push(`notifications = $${paramIndex}`);
    values.push(data.notifications);
    paramIndex++;
  }

  if (data.postsSettings !== undefined) {
    updateParts.push(`posts_settings = $${paramIndex}`);
    values.push(data.postsSettings);
    paramIndex++;
  }

  if (updateParts.length === 0) {
    return; // No updates to perform
  }

  updateParts.push(`updated_at = NOW() AT TIME ZONE 'UTC'`);

  const query = `
    UPDATE users 
    SET ${updateParts.join(', ')}
    WHERE id = $${paramIndex}
  `;
  
  values.push(session.userId);
  console.log("query: ", query)
  await sql.unsafe(query, values);
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
