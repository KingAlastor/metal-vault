"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../prisma/models";
import { headers } from "next/headers";
import { fetchUserFavoriteBands } from "../user/followArtists/follow-artists-data-actions";

export type ReleasesFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  genreTags?: string[];
};

export async function getReleasesByFilters(filters: ReleasesFilters) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  let bandIds: string[] | undefined;

  if (user && filters?.favorite_bands) {
    bandIds = await fetchUserFavoriteBands();
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