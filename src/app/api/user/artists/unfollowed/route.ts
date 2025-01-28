import { auth } from "@/auth";
import { fetchUserUnfollowedBandsFullData } from "@/lib/data/user/followArtists/unfollow-artists-data-actions";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const unfollowedBands = await fetchUserUnfollowedBandsFullData();

    return Response.json(unfollowedBands);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}