import { auth } from "@/lib/auth/auth";
import sql from "@/lib/db";
import { headers } from "next/headers";

export const fetchUnfollowedUsers = async (): Promise<string[]> => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id || user?.shard === undefined) {
    return [];
  }

  try {
    const tableName = `user_unfollowers_${user.shard}`;

    const unfollowedUsers = await sql`
      SELECT unfollowed_user_id
      FROM "${tableName}"
      WHERE user_id = ${user.id}
    `;

    return unfollowedUsers
      .map(row => row.unfollowed_user_id)
      .filter((id): id is string => id !== undefined);
  } catch (error) {
    console.error("Error fetching unfollowed users:", error);
    throw error;
  }
};
