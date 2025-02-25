import { auth } from "@/lib/auth/auth";
import sql from "@/lib/db";
import { MaxTableShards } from "@/lib/enums";
import { headers } from "next/headers";

export const fetchUnfollowedUsers = async (): Promise<string[]> => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

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
