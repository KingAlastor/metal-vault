"use server";
import sql from "@/lib/db";

export const syncGenresTableFromBands = async () => {
  const genreTags = await getDistinctGenreTags();
  if (genreTags) {
    await clearGenreTagsTable();
    await updateGenreTagsTable(genreTags);
  }
};

const getDistinctGenreTags = async () => {
  const result = await sql`
    SELECT DISTINCT UNNEST(genre_tags) AS genres 
    FROM bands 
    ORDER BY genres ASC
  `;
  return result.map((row) => row.genres);
};

const clearGenreTagsTable = async () => {
  await sql`
    TRUNCATE TABLE genre_tags
  `;
};

const updateGenreTagsTable = async (genreTags: string[]) => {
  await sql`
    INSERT INTO genre_tags (genres)
    VALUES ${sql(genreTags.map((tag) => [tag]))} 
  `;
};
