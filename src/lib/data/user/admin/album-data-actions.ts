"use server";
import { AlbumData } from "@/components/user/admin/admin-releases-types";
import { prisma } from "@/lib/prisma";

export async function updateAlbumsTableData(albumsData: AlbumData[]) {
  try {
    await prisma.bandAlbums.createMany({
      data: albumsData,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("Error updating bands table data:", error);
  }
}

export async function getBandLinks() {
  try {
    const archivesLinks = await prisma.bands.findMany({
      select: {
        id: true,
        name: true,
        archivesLink: true,
      },
    });

    return archivesLinks;
  } catch (error) {
    console.log("Failed to fetch band links");
  }
}