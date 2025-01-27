import { auth } from "@/auth";
import { PrismaBandUnFollowersModel } from "../../../../../prisma/models";
import { prisma } from "@/lib/prisma";

export const fetchUserUnfollowedBands = async () => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user?.shard === undefined) {
    throw new Error("User must be logged in to access unfollowed bands.");
  }

  const shard = user.shard.toString();
  const modelName = `bandUnFollowers${shard}` as const;

  if (!(modelName in prisma)) {
    throw new Error(`Model ${modelName} does not exist in Prisma client.`);
  }

  const model = prisma[modelName as keyof typeof prisma] as PrismaBandUnFollowersModel;

  try {
    const favorites = await model.findMany({ where: { userId: user.id } });
    const bandIds = favorites.map((row: any) => row.bandId);
    return bandIds;
  } catch (error) {
    console.error("Error fetching unfollowed bands:", error);
    throw error;
  }
};