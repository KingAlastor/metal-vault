"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../prisma/models";
import { headers } from "next/headers";

export const followArtistByBandId = async (bandId: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  

  if (!user) {
    throw new Error(
      "User ID is undefined."
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
