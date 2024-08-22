"use server";

import { prisma } from "@/lib/prisma";
import { PrismaBandFollowersModel } from "../../../../../prisma/models";
import { auth } from "@/auth";

type Bands = {
  id: string,
  namePretty: string,
  country: string | null,
  genreTags: string[];
  followers: number | null,
  status: string | null,
}

/**
 * Fetches bands based on search term
 */

export const fetchBandsByFilters = async (search: string): Promise<Bands[]> => {
  console.log("search: ", search);
  const response = await prisma.bands.findMany({
    select: {
      id: true,
      namePretty: true,
      country: true,
      genreTags: true,
      followers: true,
      status: true,
    },
    where: {
      namePretty: {
        startsWith: search,
        mode: "insensitive", 
      },
    },
    orderBy: {
      name: "asc",
    },
  });
  
  return response;
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

  const favorites = await model.findMany({ where: user.id });
  return favorites;
};
