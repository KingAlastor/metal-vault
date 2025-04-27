"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";

export const saveRefreshTokenToUserTokens = async (
  provider: string,
  token: string
) => {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to save refresh token");
  }

  try {
    await sql`
      INSERT INTO user_tokens (
        user_id,
        provider,
        refresh_token
      ) 
      VALUES (
        ${session.userId},
        ${provider},
        ${token}
      )
      ON CONFLICT (user_id, provider) 
      DO UPDATE SET 
        refresh_token = ${token}
    `;
  } catch (error) {
    console.error("Error saving refresh token:", error);
    throw error;
  }
};
