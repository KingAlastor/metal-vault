"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import sql from "@/lib/db";

export const saveRefreshTokenToUserTokens = async (
  provider: string,
  token: string
) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id) {
    throw new Error("User ID is undefined.");
  }

  try {
    await sql`
      INSERT INTO user_tokens (
        user_id,
        provider,
        refresh_token
      ) 
      VALUES (
        ${user.id},
        ${provider},
        ${token}
      )
      ON CONFLICT (user_id, provider) 
      DO UPDATE SET 
        refresh_token = ${token},
        updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error("Error saving refresh token:", error);
    throw error;
  }
};
