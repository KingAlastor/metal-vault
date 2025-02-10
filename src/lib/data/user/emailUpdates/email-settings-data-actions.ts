"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { fetchUserFavoriteBands } from "../followArtists/follow-artists-data-actions";
import { getFromAndToDates } from "@/lib/general/dateTime";

export type ReleasesFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  genreTags?: string[];
  email_frequency: string;
};

export async function getReleasesForEmail(filters: ReleasesFilters) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  let bandIds: string[] | undefined;

  if (filters.favorite_bands) {
    bandIds = await fetchUserFavoriteBands();
  }

  if (filters.favorite_genres) {
  }
  const date = getFromAndToDates(filters.email_frequency);
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
      ...(filters.favorite_genres && user?.genreTags
        ? { genreTags: { hasSome: user.genreTags } }
        : {}),
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
