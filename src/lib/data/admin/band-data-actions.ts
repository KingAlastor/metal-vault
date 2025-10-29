"use server";
import { queryRunner } from "@/lib/db";

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
  if (!bandsData || bandsData.length === 0) {
    console.log("No band data provided to update or insert.");
    return;
  }

  for (const band of bandsData) {
    try {
      await queryRunner`
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
          NOW() AT TIME ZONE 'UTC'
        )
        ON CONFLICT (archives_link) DO NOTHING
      `;
    } catch (error) {
      console.error(
        "Failed to insert band: ",
        band.name,
        "; Archives link: ",
        band.archives_link
      );
      console.error("Error updating bands table data:", error);
      throw error;
    }
  }
};
