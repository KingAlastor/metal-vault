"use server";

import sql from "@/lib/db";

export const getUniqueGenres = async () => {
  const genres = await sql<{ unique_genre: string }[]>`
    SELECT DISTINCT unnest(genre_tags) AS unique_genre 
    FROM bands
  `;
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

export type Genre = {
  genres: string;
};

export const getGenres = async (): Promise<Genre[]> => {
  return await sql<Genre[]>`
    SELECT genres FROM genre_tags
  `;
};
