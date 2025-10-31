"use server";
import { sql } from "@/lib/db";

export async function updateAlbumsTableData(albumsData: {
  band_id: string;
  name: string;
  name_pretty?: string;
  archives_link: number;
  type?: string;
  release_date?: string;
  updated_at?: Date;
}) {
  try {
    // Truncate name and name_pretty to fit VARCHAR(255) limit
    const truncatedName =
      albumsData.name.length > 255
        ? albumsData.name.substring(0, 255)
        : albumsData.name;
    const truncatedNamePretty =
      albumsData.name_pretty && albumsData.name_pretty.length > 255
        ? albumsData.name_pretty.substring(0, 255)
        : albumsData.name_pretty;

    const result = await sql`
      INSERT INTO band_albums (
        band_id,
        name,
        name_pretty,
        archives_link,
        type,
        release_date,
        updated_at
      ) VALUES (
        ${albumsData.band_id},
        ${truncatedName},
        ${truncatedNamePretty ?? null},
        ${albumsData.archives_link},
        ${albumsData.type ?? null},
        ${albumsData.release_date ?? null},
        NOW() AT TIME ZONE 'UTC'
      )
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error("Error creating band album:", error);
    throw error;
  }
}

export async function updateAlbumTracksDataTable(
  tracks: {
    band_id: string;
    album_id: string;
    title: string;
    track_number?: number;
    duration?: number;
    updated_at?: Date;
  }[]
) {
  try {
    const mappedTracks = tracks.map((track) => ({
      ...track,
      updated_at: sql`NOW() AT TIME ZONE 'UTC'` as unknown as string,
    }));

    await sql`
      INSERT INTO album_tracks ${sql(mappedTracks)}
    `;
  } catch (error) {
    console.error("Error creating album tracks:", error);
    throw error;
  }
}

export async function getBandLinks() {
  const ninetyDaysAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);

  try {
    const archivesLinks = await sql`
      SELECT id, name, archives_link
      FROM bands
      WHERE (last_album_sync IS NULL OR last_album_sync < ${ninetyDaysAgo})
      AND archives_link IS NOT NULL
      AND archives_link > 0
      LIMIT 4000
    `;

    return archivesLinks;
  } catch (error) {
    console.error("Failed to fetch band links:", error);
    throw error;
  }
}

export async function getAlbumId(bandId: string, archivesLink: number) {
  try {
    const albumId = await sql`
      SELECT id
      FROM band_albums
      WHERE band_id = ${bandId} AND archives_link = ${archivesLink}
    `;
    return albumId[0];
  } catch (error) {
    console.error("Unable to fetch album ID:", error);
    throw error;
  }
}

export async function updateBandsLastSync(id: string) {
  try {
    await sql`
      UPDATE bands
      SET last_album_sync = NOW() AT TIME ZONE 'UTC'
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Unable to update band last sync:", error);
    throw error;
  }
}

export async function getAlbumExists(archivesLink: number) {
  try {
    const result = await sql`
      SELECT id
      FROM band_albums
      WHERE archives_link = ${archivesLink}
    `;
    return result.length > 0;
  } catch (error) {
    console.error("Error checking if album exists:", error);
    throw error;
  }
}
