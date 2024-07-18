"use server";

import getSession from "@/lib/auth/getSession";
import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../prisma/models";

export const followArtistByBandId = async (bandId: string) => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;
  
  try {
    await model.upsert({
      where: {
        userId_bandId: {
          userId: user.id,
          bandId: bandId,
        },
      },
      update: {
        bandId: bandId, // This is a no-op, sets bandId value to bandId
      },
      create: {
        userId: user.id,
        bandId: bandId,
      },
    });
  } catch (error) {
    console.error("Error updating bands table data:", error);
  }
};
