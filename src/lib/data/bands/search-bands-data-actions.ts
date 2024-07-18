"use server";

import { prisma } from "@/lib/prisma";

export const getBandsBySearchTerm = async (searchTerm: string) => {
  console.log(searchTerm);

  const result = await prisma.bands.findMany({
    where: {
      namePretty: {
        contains: searchTerm,
        mode: 'insensitive', // Case-insensitive search
      },
    },
    select: {
      id: true, 
      namePretty: true,
      country: true,
      genreTags: true,
    },
  });

  // Since direct concatenation like you asked isn't supported in Prisma's query builder,
  // you would need to map over the results and concatenate manually in JavaScript,
  // or use a raw SQL query for the entire operation if you need it done at the database level.
  const bandsWithFormattedNames = result.map(band => ({
    bandId: band.id,
    bandName: `${band.namePretty} (${band.country}) {${band.genreTags.join(', ')}}`, // Example concatenation, adjust based on your actual data structure
  }));

  console.log(bandsWithFormattedNames);

  return bandsWithFormattedNames;
};