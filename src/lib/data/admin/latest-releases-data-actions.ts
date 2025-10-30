"use server";

import sql from "@/lib/db";
import { insertMany } from "../sql-helpers/insert-many";

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
    console.log(
      "updateUpcomingReleasesTableData: No releases to insert into upcoming_releases"
    );
    return;
  }

  try {
    console.log(
      `updateUpcomingReleasesTableData: Upserting ${releasesData.length} releases`
    );
    await insertMany(
      "upcoming_releases",
      releasesData,
      "album_archives_link",
      ["updated_at"]
    );
    console.log("updateUpcomingReleasesTableData: Completed upsert successfully");
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
    if (result) {
      console.log(
        `getBandByArchivesLink: Found band ${result.name_pretty ?? result.name}`
      );
    } else {
      console.log(
        `getBandByArchivesLink: No band found for archives link ${archivesLink}`
      );
    }
    return result;
  } catch (error) {
    console.error(
      `getBandByArchivesLink: Error fetching band ${archivesLink}:`,
      error
    );
    return null;
  }
}
