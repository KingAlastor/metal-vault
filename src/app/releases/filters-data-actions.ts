"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface FormData {
  favorites_only: boolean;
  favorite_genres_only: boolean;
}

export async function getReleases(data: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  let bandIds: string[] | undefined;

  if (data.favorites_only) {
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

export async function updateProfile(data: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      releaseSettings: data.favorites_only,
    },
  });
}
