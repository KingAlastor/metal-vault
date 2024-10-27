"use server";

import { prisma } from "@/lib/prisma";

export const getBandsBySearchTerm = async (searchTerm: string) => {
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
    },
  });

  const bandsWithFormattedNames = result.map(band => ({
    bandId: band.id,
    bandName: `${band.namePretty} (${band.country}) {${band.genreTags.join(', ')}}`, 
  }));

  console.log(bandsWithFormattedNames);

  return bandsWithFormattedNames;
};