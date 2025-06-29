"use server";
import sql from "@/lib/db";

export async function updateAlbumsTableData(albumsData: {
  band_id: string;
  name: string;
  name_pretty?: string;
  archives_link: number;
  type?: string;
  release_date?: Date;
  spotify_id?: string;
  updated_at?: Date;
}) {
  try {
    const result = await sql`
      INSERT INTO band_albums (
        band_id,
        name,
        name_pretty,
        archives_link,
        type,
        release_date,
        spotify_id,
        updated_at
      ) VALUES (
        ${albumsData.band_id},
        ${albumsData.name},
        ${albumsData.name_pretty ?? null},
        ${albumsData.archives_link},
        ${albumsData.type ?? null},
        ${albumsData.release_date ?? null},
        ${albumsData.spotify_id ?? null},
        ${albumsData.updated_at ?? null}
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
    spotify_id?: string;
    updated_at?: Date;
  }[]
) {
  try {
    await sql`
      INSERT INTO album_tracks ${sql(tracks)}
    `;
  } catch (error) {
    console.error("Error creating album tracks:", error);
    throw error;
  }
}

export async function getBandLinks() {
  const sixtyDaysAgo = new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000);

  try {
    const archivesLinks = await sql`
      SELECT id, name, archives_link
      FROM bands
      WHERE last_album_sync IS NULL OR last_album_sync < ${sixtyDaysAgo}
      LIMIT 10000
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
