"use server";

import { prisma } from "@/lib/prisma";

export const syncGenresTableFromBands = async () => {
  const genreTags = await getDistinctGenreTags();
  if (genreTags) {
    await clearGenreTagsTable();
    await updateGenreTagsTable(genreTags);
  }
};

const getDistinctGenreTags = async () => {
  return await prisma.$queryRaw`SELECT DISTINCT UNNEST(genre_tags) AS genres FROM bands ORDER BY genres ASC;`;
};

const clearGenreTagsTable = async () => {
  await prisma.genreTags.deleteMany({});
};


const updateGenreTagsTable = async (genreTags: any) => {
  await prisma.genreTags.createMany({
    data: genreTags,
  });
};
