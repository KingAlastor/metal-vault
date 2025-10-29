"use server";
import { queryRunner } from "@/lib/db";

export const syncGenresTableFromBands = async () => {
  const genreTags = await getDistinctGenreTags();
  if (genreTags) {
    await clearGenreTagsTable();
    await updateGenreTagsTable(genreTags);
  }
};

const getDistinctGenreTags = async () => {
  const result = await queryRunner`
    SELECT DISTINCT UNNEST(genre_tags) AS genres 
    FROM bands 
    ORDER BY genres ASC
  `;
  return result.map((row) => row.genres);
};

const clearGenreTagsTable = async () => {
  await queryRunner`
    TRUNCATE TABLE genre_tags
  `;
};

const updateGenreTagsTable = async (genreTags: string[]) => {
  await queryRunner`
    INSERT INTO genre_tags (genres)
    VALUES ${queryRunner(genreTags.map((tag) => [tag]))} 
  `;
};
