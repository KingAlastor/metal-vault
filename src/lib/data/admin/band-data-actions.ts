"use server";
import sql from "@/lib/db";

export type BandsData = {
  name: string;
  name_pretty: string;
  genre_tags: string[];
  country: string;
  status: string;
  archives_link: number;
  updated_at?: string; 
}[];

export const updateBandsTableData = async (bandsData: BandsData) => {
  try {
    if (!bandsData || bandsData.length === 0) {
      console.log("No band data provided to update or insert.");
      return; 
    }
    const currentTime = new Date().toISOString(); // Current ISO timestamp in UTC

    // Add updated_at to each band object
    const bandsDataWithTimestamp = bandsData.map(band => ({
      ...band,
      genre_tags: band.genre_tags,
      updated_at: currentTime,
    }));

    console.log('First band object:', bandsDataWithTimestamp[0]); // Debug log
    console.log('Number of bands:', bandsDataWithTimestamp.length); // Debug log

    for (const band of bandsData) {
      await sql`
        INSERT INTO bands (
          name,
          name_pretty,
          genre_tags,
          country,
          status,
          archives_link,
          updated_at 
        ) VALUES (
          ${band.name},
          ${band.name_pretty},
          ${band.genre_tags},
          ${band.country},
          ${band.status},
          ${band.archives_link},
          ${currentTime}
        )
        ON CONFLICT (archives_link) DO NOTHING
      `;
    }
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

