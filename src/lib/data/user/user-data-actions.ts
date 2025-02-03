import { PrismaUserUnFollowersModel } from "../../../../prisma/models";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const fetchUnfollowedUsers = async (): Promise<string[]> => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};


  if (!user?.id || user?.shard === undefined) {
    return [];
  }

  const shard = user.shard.toString();
  const modelName = `userUnFollowers${shard}` as const;

  if (!(modelName in prisma)) {
    console.error(`Model ${modelName} does not exist`);
    return [];
  }

  const model = prisma[
    modelName as keyof typeof prisma
  ] as PrismaUserUnFollowersModel;

  try {
    const unfollowedUsers = await model.findMany({
      where: { userId: user.id },
      select: { unfollowedUserId: true },
    });

    return unfollowedUsers
      .map((row: any) => row.unfollowedUserId)
      .filter((id: any): id is string => id !== undefined);
  } catch (error) {
    console.error("Error fetching unfollowed bands:", error);
    throw error;
  }
};
