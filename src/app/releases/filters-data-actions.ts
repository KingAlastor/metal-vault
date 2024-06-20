"use server";

import { auth } from "@/auth";
import { getUserById } from "@/lib/auth/getUser";
import { prisma } from "@/lib/prisma";

export type ReleasesFilters = {
  favorites_only: boolean;
  favorite_genres_only: boolean;
}

type PrismaBandFollowersModel = {
  findMany: (args: any) => Promise<any>;
};

export async function getReleasesByFilters(filters: ReleasesFilters) {
  const session = await auth();
  const userId = session?.user.id;
  let bandIds: string[] | undefined;
  
  

  if (filters.favorites_only) {
    
    const user = await getUserById(userId!);
    if (!user) {
      throw new Error("User ID is undefined. User must be logged in to access favorites.");
    }
    const shard = user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma] ? user.shard : '0';
    const model = prisma[`bandFollowers${shard}` as keyof typeof prisma] as PrismaBandFollowersModel;
    
    const followedBands = await prisma.bandFollowers0.findMany({
      select: {
        bandId: true,
      },
      where: {
        userId: userId,
      },
    });

    bandIds = followedBands.map(band => band.bandId);
  }

  const releases = await prisma.bandAlbums.findMany({
    select: {
      id: true,
      bandId: true,
      albumName: true,
      releaseDate: true,
      band: {
        select: {
          namePretty: true,
        },
      },
    },
    where: {
      ...(bandIds ? { bandId: { in: bandIds } } : {}),

    },
  });
  return releases;
}

export async function updateProfile(filters: ReleasesFilters) {
  const session = await auth();
  const userId = session?.user?.id;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      releaseSettings: filters.favorites_only,
    },
  });
}
