"use server";

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

export const fetchUserUnfollowedBandsFullData = async () => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return [];
  }

  const shard = user.shard.toString();
  const modelName = `bandUnFollowers${shard}` as const;

  if (!(modelName in prisma)) {
    throw new Error(`Model ${modelName} does not exist in Prisma client.`);
  }

  const model = prisma[modelName as keyof typeof prisma] as PrismaBandUnFollowersModel;

  const unfollowedBands = await model.findMany({
    where: { userId: user.id },
    select: {
      band: {
        select: {
          id: true,
          namePretty: true,
          country: true,
          genreTags: true,
          followers: true,
          status: true,
        },
      },
    },
  });

  return unfollowedBands.map((bands: any) => bands.band);

};

export const deleteUnfollowBand = async (bandId: string) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return [];
  }
  const shard = user.shard.toString();
  const modelName = `bandUnFollowers${shard}` as const;

  if (!(modelName in prisma)) {
    throw new Error(`Model ${modelName} does not exist in Prisma client.`);
  }

  const model = prisma[modelName as keyof typeof prisma] as PrismaBandUnFollowersModel;
  
  try {
    await model.delete({
      where: {
        userId_bandId: {
          userId: user.id,
          bandId: bandId,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting favorite artist:", error);
    return { success: false, error: (error as any).message };
  }
}