import { BandAlbum } from "@/components/releases/releases-table-columns";
import { auth } from "@/lib/auth/auth";
import { getUserPostsFilters } from "@/lib/data/posts/posts-filters-data-actions";
import {
  getReleasesByFilters,
  ReleasesFilters,
} from "@/lib/data/releases/releases-filters-data-actions";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } =
      (await auth.api.getSession({ headers: await headers() })) ?? {};

    let filters: ReleasesFilters = {};
    if (user?.id) {
      filters = await getUserPostsFilters(user.id);
    }

    const releases: BandAlbum[] = await getReleasesByFilters(filters);

    return Response.json(releases);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
