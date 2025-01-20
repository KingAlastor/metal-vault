import { auth } from "@/auth";
import { BandAlbum } from "@/components/releases/releases-table-columns";
import { getUserPostsFilters } from "@/lib/data/posts/posts-filters-data-actions";
import { getReleasesByFilters, ReleasesFilters } from "@/lib/data/releases/releases-filters-data-actions";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    
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