"use server";

import { prisma } from "@/lib/prisma";

export const getUniqueGenres = async () => {
  const genres: { unique_genre: string }[] = await prisma.$queryRaw`SELECT DISTINCT unnest(genre_tags) AS unique_genre FROM bands;`

  const uniqueGenres: string[] = [];

  for (const genre of genres) {
    const genreValues = genre.unique_genre.split(',');

    for (const value of genreValues) {
      if (!uniqueGenres.includes(value.trim())) {
        uniqueGenres.push(value.trim());
      }
    }
  }

  return uniqueGenres;
};


export const getGenres = async () => {
  return await prisma.genreTags.findMany();
};
