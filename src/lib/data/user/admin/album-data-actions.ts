"use server";
import { prisma } from "@/lib/prisma";
import { AlbumTracks, Prisma } from "@prisma/client";

export async function updateAlbumsTableData(albumsData: Prisma.BandAlbumsCreateInput) {
  try {
    await prisma.bandAlbums.create({
      data: albumsData,
    });
  } catch (error) {
  //  console.error("Error creating band album:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Prisma error code:", error.code);
      }
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function updateAlbumTracksDataTable(tracks: Prisma.AlbumTracksCreateManyInput[]) {
  try {
    await prisma.albumTracks.createMany({
      data: tracks,
    });
  } catch (error) {
      if (error instanceof Error) {
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error:", error);
      }
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

export async function getAlbumId(bandId: string, archivesLink: number) {
  try {
    const albumId = await prisma.bandAlbums.findUnique({
      select: {
        id: true,
      },
      where: {
        bandId,
        archivesLink,
      },
    });
    return albumId;
  } catch (error) {
    console.log("Unable to fetch album ID.");
  }
}
