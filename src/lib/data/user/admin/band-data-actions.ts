"use server";

import { prisma } from "@/lib/prisma";

export type BandsData = {
  name: string;
  namePretty: string;
  genreTags: string[];
  country: string;
  status: string;
  archivesLink: number;
}[];

export const updateBandsTableData = async (bandsData: BandsData) => {
  try {
    await prisma.bands.createMany({
      data: bandsData,
      skipDuplicates: true,
    });
    console.log("Table updated");
  } catch (error) {
    console.error("Error updating bands table data:", error);
  }
};

