"use server";

import { auth } from "@/auth";
import { getUserById } from "@/lib/auth/getUser";
import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../prisma/models";

export type ReleasesFilters = {
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
};

export async function getReleasesByFilters(filters: ReleasesFilters) {
  const session = await auth();
  console.log("getReleasesByFilters", session?.user);
  const user = session?.user;
  let bandIds: string[] | undefined;

  if (user) {
    if (filters.favorites_only) {
      bandIds = await getBandIdsByUserId(user);
    }
    /*     if (filters.favorite_genres_only) {
      genres
    } */
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const releases = await prisma.upcomingReleases.findMany({
    select: {
      bandId: true,
      bandName: true,
      albumName: true,
      type: true,
      releaseDate: true,
      genreTags: true,
    },
    where: {
      ...(bandIds ? { bandId: { in: bandIds } } : {}),
      releaseDate: {
        gte: today,
      },
    },
    orderBy: {
      releaseDate: "asc",
    },
  });
  return releases;
}

const getBandIdsByUserId = async (user: any) => {
  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

  const followedBands = await model.findMany({
    select: {
      bandId: true,
    },
    where: {
      userId: user.id,
    },
  });

  return followedBands.map((band: { bandId: string }) => band.bandId);
};

export const getUserReleaseFilters = async (id: string) => {
  try {
    let filters; 
    const userFilters = await prisma.user.findUnique({
      select: {
        releaseSettings: true,
      },
      where: { id },
    });
    
    if (userFilters?.releaseSettings) {
      console.log("releasePage", userFilters.releaseSettings);
      if (typeof userFilters.releaseSettings === 'string') {
        filters = JSON.parse(userFilters.releaseSettings);
      } 
    };
    return filters;   
  } catch {
    return null;
  }
};

export async function updateProfileFilters(filters: ReleasesFilters) {
  const session = await auth();
  const userId = session?.user?.id;
  const filtersJson = JSON.stringify(filters);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      releaseSettings: filtersJson,
    },
  });
}
