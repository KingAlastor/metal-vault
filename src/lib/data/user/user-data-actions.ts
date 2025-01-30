import { PrismaUserUnFollowersModel } from "../../../../prisma/models";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const fetchUnfollowedUsers = async (): Promise<string[]> => {
  const session = await auth();
  const user = session?.user;

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
