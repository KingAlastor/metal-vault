"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { fetchUserFavoriteBands } from "../followArtists/follow-artists-data-actions";
import { getFromAndToDates } from "@/lib/general/dateTime";
import { Prisma } from "@prisma/client";

export type ReleasesFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  genreTags?: string[];
  email_frequency: string;
};

export async function getFavoriteBandReleasesForEmail(
  frequency: string
): Promise<Prisma.UpcomingReleasesGetPayload<{}>[]> {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  const bandIds = await fetchUserFavoriteBands();
  const date = getFromAndToDates(frequency);

  console.log("genretags: ", user.genreTags);

  const releases = await prisma.upcomingReleases.findMany({
    where: {
      ...(bandIds ? { bandId: { in: bandIds } } : {}),
      releaseDate: {
        gte: date.from,
        lte: date.to,
      },
    },
    orderBy: {
      releaseDate: "asc",
    },
  });
  console.log("releases: ", releases);
  return releases;
}

export async function getFavoriteGenreReleasesForEmail(
  frequency: string
): Promise<Prisma.UpcomingReleasesGetPayload<{}>[]> {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  const bandIds = await fetchUserFavoriteBands();
  const date = getFromAndToDates(frequency);

  console.log("genretags: ", user.genreTags);

  const releases = await prisma.upcomingReleases.findMany({
    where: {
      ...(bandIds ? { bandId: { notIn: bandIds } } : {}),
      ...(user?.genreTags ? { genreTags: { hasSome: user.genreTags } } : {}),
      releaseDate: {
        gte: date.from,
        lte: date.to,
      },
    },
    orderBy: {
      releaseDate: "asc",
    },
  });
  console.log("releases: ", releases);
  return releases;
}
