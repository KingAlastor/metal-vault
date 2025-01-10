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

export const backupBands = async () => {
  try {
    await prisma.bandsBackup.deleteMany({});
    await prisma.bandsBackup.createMany({
      data: await prisma.bands.findMany(),
    });
    await prisma.bands.deleteMany({});
    console.log("Backup completed and bands table cleared");
    return { success: true };
  } catch (error) {
    console.error("Error backing up bands data:", error);
    return { success: false, error: (error as any).message };
  }
};
