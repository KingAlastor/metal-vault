"use server";

import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../../prisma/models";
import { auth } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";

export type Bands = {
  id: string;
  namePretty: string;
  country: string | null;
  genreTags: string[];
  followers: number | null;
  status: string | null;
};

/**
 * Fetches bands based on search term
 */

export const fetchBandsByFilters = async (search: string): Promise<Bands[]> => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  let whereCondition: Prisma.BandsWhereInput;

  if (search === "#") {
    whereCondition = {
      OR: [
        { namePretty: { startsWith: "0", mode: "insensitive" } },
        { namePretty: { startsWith: "1", mode: "insensitive" } },
        { namePretty: { startsWith: "2", mode: "insensitive" } },
        { namePretty: { startsWith: "3", mode: "insensitive" } },
        { namePretty: { startsWith: "4", mode: "insensitive" } },
        { namePretty: { startsWith: "5", mode: "insensitive" } },
        { namePretty: { startsWith: "6", mode: "insensitive" } },
        { namePretty: { startsWith: "7", mode: "insensitive" } },
        { namePretty: { startsWith: "8", mode: "insensitive" } },
        { namePretty: { startsWith: "9", mode: "insensitive" } },
      ],
    };
  } else if (search === "~") {
    whereCondition = {
      OR: [
        { namePretty: { startsWith: "!", mode: "insensitive" } },
        { namePretty: { startsWith: "@", mode: "insensitive" } },
        { namePretty: { startsWith: "#", mode: "insensitive" } },
        { namePretty: { startsWith: "$", mode: "insensitive" } },
        { namePretty: { startsWith: "%", mode: "insensitive" } },
        { namePretty: { startsWith: "^", mode: "insensitive" } },
        { namePretty: { startsWith: "&", mode: "insensitive" } },
        { namePretty: { startsWith: "*", mode: "insensitive" } },
        { namePretty: { startsWith: "(", mode: "insensitive" } },
        { namePretty: { startsWith: ")", mode: "insensitive" } },
        { namePretty: { startsWith: "-", mode: "insensitive" } },
        { namePretty: { startsWith: "_", mode: "insensitive" } },
        { namePretty: { startsWith: "=", mode: "insensitive" } },
        { namePretty: { startsWith: "+", mode: "insensitive" } },
        { namePretty: { startsWith: "[", mode: "insensitive" } },
        { namePretty: { startsWith: "]", mode: "insensitive" } },
        { namePretty: { startsWith: "{", mode: "insensitive" } },
        { namePretty: { startsWith: "}", mode: "insensitive" } },
        { namePretty: { startsWith: "|", mode: "insensitive" } },
        { namePretty: { startsWith: "\\", mode: "insensitive" } },
        { namePretty: { startsWith: ":", mode: "insensitive" } },
        { namePretty: { startsWith: ";", mode: "insensitive" } },
        { namePretty: { startsWith: '"', mode: "insensitive" } },
        { namePretty: { startsWith: "'", mode: "insensitive" } },
        { namePretty: { startsWith: "<", mode: "insensitive" } },
        { namePretty: { startsWith: ">", mode: "insensitive" } },
        { namePretty: { startsWith: ",", mode: "insensitive" } },
        { namePretty: { startsWith: ".", mode: "insensitive" } },
        { namePretty: { startsWith: "?", mode: "insensitive" } },
        { namePretty: { startsWith: "/", mode: "insensitive" } },
      ],
    };
  } else {
    whereCondition = {
      namePretty: {
        startsWith: search,
        mode: "insensitive",
      },
    };
  }

  try {
    const response = await prisma.bands.findMany({
      select: {
        id: true,
        namePretty: true,
        country: true,
        genreTags: true,
        followers: true,
        status: true,
      },
      where: whereCondition,
      orderBy: {
        name: "asc",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching bands by filters:", error);
    throw new Error("Failed to fetch bands. Please try again later.");
  }
};

export const fetchUserFavoriteBands = async () => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

  const favorites = await model.findMany({ where: { userId: user.id } });

  return favorites.map((band: { bandId: string }) => band.bandId);
};

export const fetchUserFavBandsFullData = async () => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    return [];
  }

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

  const favorites = await model.findMany({
    where: { userId: user.id },
    select: {
      rating: true,
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

  return favorites.map((bands: any) => ({
    ...bands.band,
    rating: bands.rating,
  }));
};

export const saveUserFavorites = async (favorites: string[]) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

  if (favorites && favorites.length > 0) {
    await model.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const data = favorites.map((bandId) => ({
      bandId,
      userId: user.id,
    }));

    await model.createMany({
      data,
      skipDuplicates: true,
    });
  }
};

export const saveUserFavoriteAndUpdateFollowerCount = async (
  bandId: string
) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

  const existingRecord = await model.findUnique({
    where: {
      userId_bandId: {
        userId: user.id,
        bandId,
      },
    },
  });

  if (!existingRecord) {
    try {
      await model.create({
        data: {
          userId: user.id,
          bandId,
        },
      });
    } catch (error) {
      console.log("Failed to add favorite: ", (error as any).message);
    }

    try {
      await prisma.bands.update({
        where: { id: bandId },
        data: {
          followers: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.log(
        "Failed to increment follower count.",
        (error as any).message
      );
    }
  }
};

export const deleteFavoriteArtist = async (bandId: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

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
};

export const incrementBandFollowersValue = async (id: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  try {
    await prisma.bands.update({
      where: { id },
      data: {
        followers: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.log("Failed to increment follower count.", (error as any).message);
  }
};

export const decrementBandFollowersValue = async (id: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  try {
    await prisma.bands.update({
      where: { id },
      data: {
        followers: {
          decrement: 1,
        },
      },
    });
  } catch (error) {
    console.log("Failed to decrement follower count.", (error as any).message);
  }
};

export const getRefreshTokenFromUserTokens = async (provider: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  try {
    const userToken = await prisma.userTokens.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: provider,
        },
      },
      select: {
        refreshToken: true,
      },
    });

    if (!userToken) {
      return null;
    }

    return userToken.refreshToken;
  } catch (error) {
    console.error("Error fetching refresh token:", error);
    throw new Error("Failed to fetch refresh token. Please try again later.");
  }
};

export const checkBandExists = async (bandNamePretty: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  try {
    const bands = await prisma.bands.findMany({
      select: {
        id: true,
      },
      where: {
        namePretty: {
          equals: bandNamePretty,
          mode: "insensitive",
        },
      },
    });

    return bands;
  } catch (error) {
    console.error("Error checking if band exists:", error);
    throw new Error("Failed to check if band exists. Please try again later.");
  }
};

export const checkFavoriteExists = async (
  bandId: string | null | undefined
) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  if (!bandId) return false;

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

  try {
    const favorite = await model.findUnique({
      where: {
        userId_bandId: {
          userId: user.id,
          bandId: bandId,
        },
      },
    });

    return favorite !== null;
  } catch (error) {
    console.error("Error checking favorite:", error);
    throw error;
  }
};

export const updateBandRating = async (bandId: string, rating: number) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  if (!bandId) return false;

  const shard =
    user.shard && prisma[`bandFollowers${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `bandFollowers${shard}` as keyof typeof prisma
  ] as PrismaBandFollowersModel;

  try {
    await model.update({
      data: {
        rating,
      },
      where: {
        userId_bandId: {
          userId: user.id,
          bandId: bandId,
        },
      },
    });
  } catch (error) {
    console.error("Failed to update rating:", error);
  }
};
