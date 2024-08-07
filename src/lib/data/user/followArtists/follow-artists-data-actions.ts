"use server";

import { prisma } from "@/lib/prisma";

/** 
* Fetches bands based on search term
*/

export const fetchBandsByFilters = async (search: string) => {
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
          contains: search,
          mode: 'insensitive', // Case-insensitive search
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return response;
  };