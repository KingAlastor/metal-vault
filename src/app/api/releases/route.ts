import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/actions";
import { logUnauthorizedAccess } from "@/lib/loggers/auth-log";
import { getReleasesByFilters } from "@/lib/data/release-filters-data";

export async function GET() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const releases = await getReleasesByFilters({});
    return NextResponse.json(releases);
  } catch (error) {
    console.error("Error fetching releases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
