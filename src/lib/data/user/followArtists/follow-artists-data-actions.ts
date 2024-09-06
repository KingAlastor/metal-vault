"use server";

import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../../prisma/models";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

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
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }
  
  let whereCondition: Prisma.BandsWhereInput;

  if (search === '#') {
    whereCondition = {
      OR: [
        { namePretty: { startsWith: '0', mode: 'insensitive' } },
        { namePretty: { startsWith: '1', mode: 'insensitive' } },
        { namePretty: { startsWith: '2', mode: 'insensitive' } },
        { namePretty: { startsWith: '3', mode: 'insensitive' } },
        { namePretty: { startsWith: '4', mode: 'insensitive' } },
        { namePretty: { startsWith: '5', mode: 'insensitive' } },
        { namePretty: { startsWith: '6', mode: 'insensitive' } },
        { namePretty: { startsWith: '7', mode: 'insensitive' } },
        { namePretty: { startsWith: '8', mode: 'insensitive' } },
        { namePretty: { startsWith: '9', mode: 'insensitive' } },
      ],
    };
  } else if (search === '~') {
    whereCondition = {
      OR: [
        { namePretty: { startsWith: '!', mode: 'insensitive' } },
        { namePretty: { startsWith: '@', mode: 'insensitive' } },
        { namePretty: { startsWith: '#', mode: 'insensitive' } },
        { namePretty: { startsWith: '$', mode: 'insensitive' } },
        { namePretty: { startsWith: '%', mode: 'insensitive' } },
        { namePretty: { startsWith: '^', mode: 'insensitive' } },
        { namePretty: { startsWith: '&', mode: 'insensitive' } },
        { namePretty: { startsWith: '*', mode: 'insensitive' } },
        { namePretty: { startsWith: '(', mode: 'insensitive' } },
        { namePretty: { startsWith: ')', mode: 'insensitive' } },
        { namePretty: { startsWith: '-', mode: 'insensitive' } },
        { namePretty: { startsWith: '_', mode: 'insensitive' } },
        { namePretty: { startsWith: '=', mode: 'insensitive' } },
        { namePretty: { startsWith: '+', mode: 'insensitive' } },
        { namePretty: { startsWith: '[', mode: 'insensitive' } },
        { namePretty: { startsWith: ']', mode: 'insensitive' } },
        { namePretty: { startsWith: '{', mode: 'insensitive' } },
        { namePretty: { startsWith: '}', mode: 'insensitive' } },
        { namePretty: { startsWith: '|', mode: 'insensitive' } },
        { namePretty: { startsWith: '\\', mode: 'insensitive' } },
        { namePretty: { startsWith: ':', mode: 'insensitive' } },
        { namePretty: { startsWith: ';', mode: 'insensitive' } },
        { namePretty: { startsWith: '"', mode: 'insensitive' } },
        { namePretty: { startsWith: "'", mode: 'insensitive' } },
        { namePretty: { startsWith: '<', mode: 'insensitive' } },
        { namePretty: { startsWith: '>', mode: 'insensitive' } },
        { namePretty: { startsWith: ',', mode: 'insensitive' } },
        { namePretty: { startsWith: '.', mode: 'insensitive' } },
        { namePretty: { startsWith: '?', mode: 'insensitive' } },
        { namePretty: { startsWith: '/', mode: 'insensitive' } },
      ],
    };
  } else {
    whereCondition = {
      namePretty: {
        startsWith: search,
        mode: 'insensitive',
      },
    };
  }
  console.log("where condition", whereCondition);
  console.log("input", search);
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
        name: 'asc',
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching bands by filters:", error);
    throw new Error("Failed to fetch bands. Please try again later.");
  }
};

export const fetchUserFavoriteBands = async () => {
  const session = await auth();
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

  const favorites = await model.findMany({ where: { userId: user.id } });
  const bandIds = favorites.map((row: any) => row.bandId);

  return bandIds;
};

export const saveUserFavorites = async (favorites: string[]) => {
  const session = await auth();
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
