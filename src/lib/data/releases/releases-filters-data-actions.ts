"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../prisma/models";
import { headers } from "next/headers";

export type ReleasesFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  genreTags?: string[];
};

export async function getReleasesByFilters(filters: ReleasesFilters) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {}; 

  let bandIds: string[] | undefined;

  if (user) {
    if (filters?.favorite_bands) {
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
      ...(filters?.genreTags && filters?.genreTags.length > 0
        ? { genreTags: { hasSome: filters.genreTags } }
        : {}),
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
  const { user } =
  (await auth.api.getSession({ headers: await headers() })) ?? {};


if (!user) {
  throw new Error(
    "User ID is undefined."
  );
}

  try {
    let filters;
    const userFilters = await prisma.user.findUnique({
      select: {
        releaseSettings: true,
      },
      where: { id },
    });

    if (userFilters?.releaseSettings) {
      if (typeof userFilters.releaseSettings === "string") {
        filters = JSON.parse(userFilters.releaseSettings);
      }
    }
    return filters;
  } catch {
    return null;
  }
};

export async function updateProfileFilters(filters: ReleasesFilters) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  

  if (!user) {
    throw new Error(
      "User ID is undefined."
    );
  }
  const filtersJson = JSON.stringify(filters);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      releaseSettings: filtersJson,
    },
  });
}
