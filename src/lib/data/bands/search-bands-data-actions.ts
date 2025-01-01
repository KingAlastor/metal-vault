"use server";

import { prisma } from "@/lib/prisma";

export type Band = {
  bandId: string;
  namePretty: string;
  bandName: string;
  country: string | null;
  genreTags: string[];
  followers: number;
};

export const getBandsBySearchTerm = async (
  searchTerm: string
): Promise<Band[]> => {
  let bands;
  if (searchTerm.length <= 3) {
    bands = await fetchBands(searchTerm, "equals");
    if (bands.length === 0) {
      bands = await fetchBands(searchTerm, "startsWith");
    }
  } else {
    bands = await fetchBands(searchTerm, "contains");
    if (bands.length > 30) {
      bands = await fetchBands(searchTerm, "equals");
      if (bands.length === 0) {
        bands = await fetchBands(searchTerm, "startsWith");
      }
    }
  }

  if (bands) {
    const bandsWithFormattedNames = bands.map((band) => ({
      bandId: band.id,
      namePretty: band.namePretty,
      country: band.country || null,
      genreTags: band.genreTags || [],
      bandName: `${band.namePretty} (${band.country}) {${band.genreTags.join(
        ", "
      )}}`,
      followers: band.followers ?? 0,
    }));

    return bandsWithFormattedNames;
  } else return [];
};

type WhereCondition = 'equals' | 'contains' | 'startsWith';

const fetchBands = async (searchTerm: string, condition: WhereCondition) => {
  return await prisma.bands.findMany({
    where: {
      namePretty: { [condition]: searchTerm, mode: "insensitive" },
    },
    select: {
      id: true,
      namePretty: true,
      country: true,
      genreTags: true,
      followers: true,
    },
  });
};

