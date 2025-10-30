"use server";

import sql from "@/lib/db";

export interface UpcomingReleaseRecord {
  band_id: number;
  band_name: string;
  album_name: string;
  band_archives_link?: number;
  album_archives_link?: number;
  genre_tags?: string[];
  type?: string;
  release_date?: string;
  updated_at?: string;
}

export interface BandRow {
  id: number;
  name: string;
  name_pretty?: string | null;
  genre_tags?: string[] | null;
  archives_link: number;
}

export async function updateUpcomingReleasesTableData(
  releasesData: UpcomingReleaseRecord[]
): Promise<void> {
  if (!releasesData || releasesData.length === 0) {
    return;
  }

  try {
    const now = new Date().toISOString();
    const rows = releasesData.map((release) => [
      release.band_id,
      release.band_name ?? null,
      release.album_name ?? null,
      release.band_archives_link ?? null,
      release.album_archives_link!,
      release.genre_tags ?? null,
      release.type ?? null,
      release.release_date ?? null,
      now,
    ]) as unknown[];

    await sql`
      INSERT INTO upcoming_releases (
        band_id,
        band_name,
        album_name,
        band_archives_link,
        album_archives_link,
        genre_tags,
        type,
        release_date,
        updated_at
      ) VALUES ${sql(rows as any)}
      ON CONFLICT (album_archives_link) DO UPDATE
      SET updated_at = EXCLUDED.updated_at
    `;
  } catch (error) {
    console.error(
      "updateUpcomingReleasesTableData: Failed to upsert upcoming releases:",
      error
    );
    throw error;
  }
}

export async function getBandByArchivesLink(
  archivesLink: number
): Promise<BandRow | null> {
  try {
    const band = await sql<BandRow[]>`
      SELECT id, name, name_pretty, genre_tags, archives_link
      FROM bands
      WHERE archives_link = ${archivesLink}
      LIMIT 1
    `;

    const result = band[0] ?? null;
    return result;
  } catch (error) {
    console.error(
      `getBandByArchivesLink: Error fetching band ${archivesLink}:`,
      error
    );
    return null;
  }
}
