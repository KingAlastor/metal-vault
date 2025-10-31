import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/server-actions";
import { logUnauthorizedAccess } from "@/lib/loggers/auth-log";
import { fetchUserUnfollowedBandsFullData } from "@/lib/data/unfollow-artists-data";

export async function GET() {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(
      session.userId || "unknown",
      "user-artists-unfollowed-api"
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const unfollowedArtists = await fetchUserUnfollowedBandsFullData();
    return NextResponse.json(unfollowedArtists);
  } catch (error) {
    console.error("Error fetching unfollowed artists:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
