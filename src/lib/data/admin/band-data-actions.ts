"use server";
import sql from "@/lib/db";

export type BandsData = {
  name: string;
  name_pretty: string;
  genre_tags: string[];
  country: string;
  status: string;
  archives_link: number;
}[];

export const updateBandsTableData = async (bandsData: BandsData) => {
  try {
    const currentTime = new Date().toISOString(); // Current ISO timestamp in UTC

    // Add updated_at to each band object
    const bandsDataWithTimestamp = bandsData.map(band => ({
      ...band,
      updated_at: currentTime,
    }));

    await sql`
      INSERT INTO bands (
        name,
        name_pretty,
        genre_tags,
        country,
        status,
        archives_link,
        updated_at -- Added updated_at column
      ) VALUES ${sql(bandsDataWithTimestamp)}
      ON CONFLICT (archives_link) DO NOTHING
    `;
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

