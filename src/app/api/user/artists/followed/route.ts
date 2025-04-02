import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/actions";
import { logUnauthorizedAccess } from "@/lib/loggers/auth-log";
import { fetchUserFavoriteBands } from "@/lib/data/follow-artists-data";

export async function GET() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const followedArtists = await fetchUserFavoriteBands();
    return NextResponse.json(followedArtists);
  } catch (error) {
    console.error("Error fetching followed artists:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
