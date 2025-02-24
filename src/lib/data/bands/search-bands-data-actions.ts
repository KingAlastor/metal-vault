"use server";

import { prisma } from "@/lib/prisma";
import sql from "@/lib/db";
import { AlbumTrack, Band, BandAlbum } from "@/lib/database-schema-types";

export type SearchTermBand = {
  bandId: string;
  namePretty: string;
  bandName: string;
  country: string | null;
  genreTags: string[];
  followers: number;
};

export const getBandsBySearchTerm = async (
  searchTerm: string
): Promise<SearchTermBand[]> => {
  let bands;
  if (searchTerm.length <= 3) {
    bands = await fetchBands(searchTerm, "equals");
    if (bands.length === 0) {
      bands = await fetchBands(searchTerm, "startsWith");
    }
  } else {
    bands = await fetchBands(searchTerm, "contains");
    if (bands.length > 30) {
      bands = await fetchBands(searchTerm, "equals");
      if (bands.length === 0) {
        bands = await fetchBands(searchTerm, "startsWith");
      }
    }
  }

  if (bands) {
    const bandsWithFormattedNames = bands.map((band) => ({
      bandId: band.id,
      namePretty: band.namePretty,
      country: band.country || null,
      genreTags: band.genreTags || [],
      bandName: `${band.namePretty} (${band.country}) {${band.genreTags.join(
        ", "
      )}}`,
      followers: band.followers ?? 0,
    }));

    return bandsWithFormattedNames;
  } else return [];
};

type WhereCondition = "equals" | "contains" | "startsWith";

const fetchBands = async (searchTerm: string, condition: WhereCondition) => {
  return await prisma.bands.findMany({
    where: {
      namePretty: { [condition]: searchTerm, mode: "insensitive" },
    },
    select: {
      id: true,
      namePretty: true,
      country: true,
      genreTags: true,
      followers: true,
    },
  });
};

export const getFullBandDataById = async (bandId: string): Promise<Band>  => {
  // Query 1: Get band data
  const bandArray = await sql<Band[]>`
    SELECT * FROM bands WHERE id = ${bandId} LIMIT 1
  `;
  const band = bandArray[0];

  // Query 2: Get albums
  const albums = await sql<BandAlbum[]>`
    SELECT 
      id, name, name_pretty, release_date
    FROM band_albums 
    WHERE band_id = ${bandId}
    ORDER BY release_date
  `;

  // Query 3: Get tracks for all albums
  const tracks = await sql<AlbumTrack[]>`
    SELECT 
      at.id, at.album_id, at.title, 
      at.track_number, at.duration
    FROM album_tracks at
    JOIN band_albums a ON a.id = at.album_id
    WHERE a.band_id = ${bandId}
    ORDER BY a.release_date, at.track_number
  `;

  // Combine the results in memory
  const albumsWithTracks = albums.map(album => ({
    ...album,
    album_tracks: tracks.filter(track => track.album_id === album.id)
  }));

  return {
    ...band,
    albums: albumsWithTracks
  };
};
