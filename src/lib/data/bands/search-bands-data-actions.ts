"use server";

import { prisma } from "@/lib/prisma";

export type Band = {
  bandId: string;
  namePretty: string;
  bandName: string;
  country: string | null;
  genreTags: string[];
  followers: number;
}

export const getBandsBySearchTerm = async (searchTerm: string): Promise<Band[]> => {
  console.log(searchTerm);

  const result = await prisma.bands.findMany({
    where: {
      namePretty: {
        contains: searchTerm,
        mode: 'insensitive', 
      },
    },
    select: {
      id: true, 
      namePretty: true,
      country: true,
      genreTags: true,
      followers: true,
    },
  });

  const bandsWithFormattedNames = result.map(band => ({
    bandId: band.id,
    namePretty: band.namePretty,
    country: band.country || null,
    genreTags: band.genreTags || [],
    bandName: `${band.namePretty} (${band.country}) {${band.genreTags.join(', ')}}`, 
    followers: band.followers ?? 0,
  }));

  console.log(bandsWithFormattedNames);

  return bandsWithFormattedNames;
};