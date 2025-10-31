import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/server-actions";
import { logUnauthorizedAccess } from "@/lib/loggers/auth-log";
import { fetchUserFavBandsFullData } from "@/lib/data/follow-artists-data";

export async function GET() {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(
      session.userId || "unknown",
      "user-artists-followed-api"
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const followedArtists = await fetchUserFavBandsFullData();
    return NextResponse.json(followedArtists);
  } catch (error) {
    console.error("Error fetching followed artists:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
